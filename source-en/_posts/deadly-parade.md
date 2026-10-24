---
title: Three Drones Lose GPS at Once — Using Middle-School Geometry to Find the Jammer — STARPWN 2026 "Deadly Parade" Writeup
tags:
  - STARPWN
  - CTF
  - MAVLink
  - GPS Spoofing
  - Geolocation
  - Forensics
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/9f8dacd3/circumcenter_triangulation.png
abbrlink: "9f8dacd3"
date: 2026-09-21 15:14:29
top_img:
---

> 🌐 中文版：[繁體中文](/posts/9f8dacd3.html)
>
> This challenge is a sequel to the previous one, [One to Rule Them All](/en/posts/77798b75.html), in the same Prismantir drone-swarm world.
>
> But the gameplay is completely different — the last one was protocol security, this one is a pure signal-localization problem. And honestly, I submitted two wrong answers and had to take the long way around before remembering how to compute a circumcenter from middle-school geometry.

<!-- more -->

## What the challenge is about

> Prismantir was assigned to protect a VIP during DynaCon's parade, and their team already had their hands full. They stopped the attacker before he even got out of bed, but his devices were already in place and active. The sky above the Glittercity was tuned to a dead channel. No one realized what was happening until Prismantir's drones began falling from the sky like ducks. Your mission is to find where these deadly toys could have been hiding.

In plain terms: the Prismantir team was protecting a VIP at DynaCon's parade and was already stretched thin on manpower. They caught the attacker before he even got out of bed, but his jamming devices were already running, and the radio channel above Glittercity had been tuned to dead silence — nobody realized something was wrong until Prismantir's drones started falling from the sky one after another like ducks.

The goal: find where these jamming devices were hiding.

The challenge gives just one thing: `PRISM_S05_DNCN_20260831.pcap`, a roughly 198 MB packet capture with over two million packets.

## First, confirm what kind of packets these are

```bash
file PRISM_S05_DNCN_20260831.pcap
capinfos PRISM_S05_DNCN_20260831.pcap
```

The result shows a **Linux cooked-mode capture v2** (linktype 276) capture, totaling 2.079 million packets over 3159 seconds.

Looking with `tshark`:

```
frame -> sll -> ip -> udp -> data      (100% of packets)
```

Every packet is `127.0.0.1:14550 <-> 127.0.0.1:45177`, the standard MAVLink UDP port on loopback. Same as the previous challenge, One to Rule Them All, it's the MAVLink v2 protocol (the `0xFD` magic at the start) — just wrapped in a full pcap (Linux SLL2 cooked capture + IPv4 + UDP) this time, rather than a bare byte stream.

## Another performance problem — hand-rolling a parser again

`tshark`/`pymavlink` are far too slow for two million packets. Same as my experience in Connect the Dots, I just hand-rolled a parser, manually peeling apart the pcap record format, SLL2 header, IP header, UDP header, and MAVLink v2 header:

```python
import struct

f = open("PRISM_S05_DNCN_20260831.pcap", 'rb')
gh = f.read(24)
magic, vmaj, vmin, tz, sigfigs, snaplen, network = struct.unpack('<IHHiIII', gh)
assert network == 276   # LINKTYPE_LINUX_SLL2

while True:
    rec_hdr = f.read(16)
    if len(rec_hdr) < 16:
        break
    ts_sec, ts_usec, incl_len, orig_len = struct.unpack('<IIII', rec_hdr)
    data = f.read(incl_len)
    ts = ts_sec + ts_usec/1e6

    proto_type = struct.unpack('>H', data[0:2])[0]   # SLL2 EtherType
    if proto_type != 0x0800:
        continue
    ip_start = 20                                     # SLL2 header is a fixed 20 bytes
    ihl = (data[ip_start] & 0x0F) * 4
    if data[ip_start+9] != 17:                        # 17 = UDP
        continue
    udp_start = ip_start + ihl
    udp_len = struct.unpack('>H', data[udp_start+4:udp_start+6])[0]
    payload = data[udp_start+8 : udp_start+udp_len]

    if len(payload) < 10 or payload[0] != 0xFD:
        continue
    plen  = payload[1]
    sysid = payload[5]
    msgid = payload[7] | (payload[8] << 8) | (payload[9] << 16)
    mpayload = payload[10:10+plen]
    # ... handle by msgid ...
```

Written this way, two million messages parse in about three seconds — more than an order of magnitude faster. The parsed result shows a full patrol fleet of 10 drones (sysid 1–10) plus one ground station (sysid 255) — the same fleet setup as in Connect the Dots.

## Find the incident: filter warning-level system messages

MAVLink has a `STATUSTEXT` (msgid 253) message type dedicated to text status messages, with a severity field.

Filtering for severity ≤ 4 (warning and above), the attack scene immediately appears:

```
1026.66s sysid=2 sev=2  EKF variance
1026.66s sysid=2 sev=2  EKF Failsafe: changed to LAND Mode
1038.44s sysid=2 sev=4  EKF3 IMU1 stopped aiding
1051.32s sysid=2 sev=4  SmartRTL deactivated: bad position
1438.29s sysid=5 sev=2  EKF variance / EKF Failsafe: changed to LAND Mode
1458.55s sysid=5 sev=4  SmartRTL deactivated: bad position
1775.77s sysid=3 sev=2  EKF variance / EKF Failsafe: changed to LAND Mode
1802.33s sysid=3 sev=4  SmartRTL deactivated: bad position
2805.08s sysid=9 sev=4  SmartRTL deactivated: buffer full   <- unrelated
```

Three drones (sysid 2, 5, 3) show an identical GPS-jamming signature: the EKF (Extended Kalman Filter — the algorithm a drone uses to fuse sensor data and figure out "where am I now") variance spiking, the EKF downgrading into LAND protection mode, both IMUs (inertial measurement units) stopping GPS aiding, and SmartRTL (smart return-to-launch) aborting due to an unreliable position.

sysid 9's failure is a separate unrelated issue (telemetry buffer full), so rule it out.

## Pinpoint the exact moment GPS was lost

STATUSTEXT timestamps actually lag; a more accurate approach is to look directly at `GPS_RAW_INT` (msgid 24)'s `fix_type` field, the first-hand signal of GPS fix status.

An easily-overlooked detail here: **MAVLink fields are stored sorted by type size from largest to smallest, not in declaration order.** If you build the struct format in the documented field order, mixed field sizes will misalign everything after. The safe approach is to check the message type's real wire order with `pymavlink`:

```python
from pymavlink.dialects.v20 import ardupilotmega as mav
cls = mav.mavlink_map[24]
print(cls.fieldnames, cls.orders)
# real order: time_usec, lat, lon, alt, eph, epv, vel, cog, fix_type, sats_visible, ...
```

```python
time_usec, lat, lon, alt, eph, epv, vel, cog, fix_type, sats_vis = \
    struct.unpack_from('<QiiiHHHHBB', mpayload, 0)
```

In fact `fix_type` only ever takes two values:

**1 (no fix) and 6 (RTK precision fix)**, with no gradual signal degradation in between — a clean binary switch. That's a clue in itself: it means a sharply-bounded jamming area, not the gradient of a naturally weakening signal.

Here I grab the moment each affected drone **first** shows `fix_type=1` — the coordinate where it truly crossed the death-zone boundary (10 to 14 seconds before the EKF actually declared failsafe):

| sysid | lat | lon |
|---|---|---|
| 2 | 36.0924468 | -115.2422644 |
| 5 | 36.0997050 | -115.2479014 |
| 3 | 36.0778960 | -115.2440574 |

I also cross-validated with `SIMSTATE` (msgid 164 — the true coordinates reported by ArduPilot's SITL simulator, bypassing EKF/GPS entirely) to confirm each drone really did end up near these coordinates.

## But I guessed wrong twice

**First: just averaging the three points.**

Reverse-geocoding (Nominatim) landed in a Spring Valley area community called Spanish Trail. I submitted `starpwn{Spanish_Trail}` and `starpwn{Spanish_Trail_Country_Club}`, **both wrong.**

**Second: all three points' addresses pointed to the same larger-area community name, Spring Valley.**

I submitted `starpwn{Spring_Valley}`, **still wrong.**

Where was the problem? The three points roughly form a near-collinear line, and taking a simple average of such a distribution corresponds to no meaningful geometric property — it's not triangulation, just forcing an answer.

## The correct approach: circumcenter triangulation

If the jammer's effective range is roughly circular, then each drone's "first crossing into the death zone" coordinate is, in theory, a point on this circle's boundary, and should be roughly equidistant from the center.

And **the point equidistant from three known points** is the **circumcenter** of the triangle they form — the very thing taught in middle-school geometry.

```python
import math

P1 = (36.0924468, -115.2422644)  # sysid 2
P2 = (36.0997050, -115.2479014)  # sysid 5
P3 = (36.0778960, -115.2440574)  # sysid 3

lat0 = (P1[0] + P2[0] + P3[0]) / 3
R = 6371000
def to_xy(lat, lon):
    x = math.radians(lon) * R * math.cos(math.radians(lat0))
    y = math.radians(lat) * R
    return x, y

def from_xy(x, y):
    lon = math.degrees(x / (R * math.cos(math.radians(lat0))))
    lat = math.degrees(y / R)
    return lat, lon

ax, ay = to_xy(*P1); bx, by = to_xy(*P2); cx, cy = to_xy(*P3)

d  = 2 * (ax*(by-cy) + bx*(cy-ay) + cx*(ay-by))
ux = ((ax**2+ay**2)*(by-cy) + (bx**2+by**2)*(cy-ay) + (cx**2+cy**2)*(ay-by)) / d
uy = ((ax**2+ay**2)*(cx-bx) + (bx**2+by**2)*(ax-cx) + (cx**2+cy**2)*(bx-ax)) / d

lat_c, lon_c = from_xy(ux, uy)
r = math.hypot(ux-ax, uy-ay)
print(lat_c, lon_c, 'radius_m=', r)
# -> 36.086798, -115.263377   radius ≈ 1998 m
```

Here I first project lat/lon into meter-unit planar coordinates with a simple local planar projection (`to_xy` / `from_xy`), because the circumcenter formula is planar geometry and applying it directly to lat/lon would distort due to Earth's curvature; after computing the circumcenter I convert back to lat/lon. The result is a clean circle with a radius of nearly 2 km:

![The three GPS-loss entry points, the triangle, and the computed circumcenter — landing right on Echo Trail Park](circumcenter_triangulation.png)

Dropping this coordinate on a map:

```
https://www.openstreetmap.org/?mlat=36.086798&mlon=-115.263377#map=15/36.086798/-115.263377
```

The marker lands precisely on a clearly-named park, **Echo Trail Park**, right next to the Spanish Trail golf course and the Flamingo Wash detention basin — open but with tree cover, a very plausible place to actually hide a jammer.

## Flag

```
starpwn{Echo_Trail_Park}
```

## Takeaways

1. **MAVLink fields are laid out by type size, not the declaration order in the docs.** Before hand-rolling a parser for a new message type, check the real wire order with `pymavlink`'s `mavlink_map[id].orders` or the official XML definition — don't build the struct format from the docs' field list order.
2. **A clean binary signal is more notable than a gradual noisy one.** `fix_type` switching only between 1 and 6 with no intermediate values hints that this is a deliberately designed, discoverable event worth investigating specifically — rather than assuming real-world GPS naturally fades like that.
3. **Averaging is not triangulation.** Taking the centroid of three roughly-collinear "boundary entry points" corresponds to no real geometric meaning; when those points represent "the boundary of entering a circular effective range," the correct estimate is their circumcenter — and here the circumcenter solution was clearly more accurate, landing directly on a named park rather than the vague result of a centroid landing on some random residential street.
4. **Cross-validate when you have ground truth.** ArduPilot SITL's `SIMSTATE` message reports the simulator's true coordinates, bypassing the whole EKF/GPS judgment chain. Using it to confirm the jamming-entry coordinates ruled out "the drone actually drifted elsewhere," letting debugging focus on the localization method itself rather than suspecting the data.
5. **When stuck on wrong answers, look at the map itself, not just the geocoder's text.** Reverse-geocoding APIs usually return the nearest street name, not necessarily the most prominent named landmark nearby (a park or golf course may be marked on OSM but not surfaced by a reverse-address query). Actually opening the map to see what's around that coordinate is what made the named POI Echo Trail Park emerge.

---
