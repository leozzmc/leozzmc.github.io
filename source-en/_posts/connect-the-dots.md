---
title: A Stray Drone Writing in the Sky with Its Flight Path | Connect the Dots | STARPWN 2026
tags:
  - STARPWN
  - CTF
  - MAVLink
  - Drone Forensics
  - GPS Art
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/66ec2728/all_tracks_overview.png
abbrlink: "66ec2728"
date: 2026-09-21 15:11:24
top_img:
---

> 🌐 中文版：[繁體中文](/posts/66ec2728.html)
>
> In the same Prismantir drone-swarm world, this is the challenge with the shortest story but the most memorable payoff.
>
> 150 million bytes of raw telemetry, and at the very end you open an image to find a drone writing letters in the sky with its own flight path.

<!-- more -->

## What the challenge is about

> While known for their big eye in the sky, Prismantir huge drone fleet is also a behemoth to keep in control. Every night, each drone patrols its assigned block, following its route with clockwork precision. But tonight, one unit broke the formation. Can you trace where did it go?

In plain terms: Prismantir's huge drone fleet patrols its assigned city blocks every night, following routes with clockwork precision. But tonight one unit broke formation, and the task is to find where it went. You get a single file: `PRISM_S03_B10-30_20260830.raw`, about 149.7 MB.

## First, confirm the file format

Looking at the header with `xxd`:

```
00000000: fd1d 0000 7a01 01fd 0000 0641 7264 7543  ....z......ArduC
00000010: 6f70 7465 7220 5634 2e36 2e31 2028 3537  opter V4.6.1 (57
00000020: 3539 3163 6238 299c 1cfd 2100 007b 0101  591cb8)...!..{..
```

Two things jump out immediately: the plaintext string `ArduCopter V4.6.1`, which is the ArduPilot drone firmware's version string.

And every record starts with `0xFD`, the **MAVLink v2** frame start marker.

Manually peeling the first packet by the MAVLink v2 header format matches perfectly: payload length, sysid=1, compid=1, msgid=253 (STATUSTEXT), content `"ArduCopter V4.6.1 (57591cb8)"`.

So this file is a **raw MAVLink v2 stream with no extra wrapping**. Unlike a typical `.tlog`, there's no per-packet timestamp outer layer here, just MAVLink packets written one right after another.

## pymavlink is too slow, so hand-roll a parser again

First I tried `pymavlink`:

```python
from pymavlink import mavutil
m = mavutil.mavlink_connection('PRISM_S03_B10-30_20260830.raw', dialect='ardupilotmega')
while True:
    msg = m.recv_match(blocking=False)
    ...
```

It technically works, but parsing a 150 MB file this way, with pure Python walking the full `ardupilotmega` dialect lookup table, is slow enough to make you question your life choices.

Since MAVLink v2's wrapping is itself simple (each field is at a fixed position, and the payload length is in the second byte), I just wrote a minimal parser:

```python
import struct

data = open("PRISM_S03_B10-30_20260830.raw", "rb").read()
n = len(data)
pos = 0
while pos < n:
    if data[pos] != 0xFD:
        nxt = data.find(b'\xfd', pos + 1)
        if nxt == -1:
            break
        pos = nxt
        continue
    plen     = data[pos+1]
    incompat = data[pos+2]
    sysid    = data[pos+5]
    compid   = data[pos+6]
    msgid    = data[pos+7] | (data[pos+8] << 8) | (data[pos+9] << 16)
    header_len = 10
    sig_len = 13 if (incompat & 0x1) else 0
    total_len = header_len + plen + 2 + sig_len   # header + payload + CRC (+ signature)
    payload = data[pos+header_len : pos+header_len+plen]
    # ... handle payload by msgid ...
    pos += total_len
```

Because this capture is a clean, uninterrupted stream, walking it linearly needs no resync at all, and all **4,158,449 messages parse in about 3 seconds**, more than an order of magnitude faster than the general library. The rule of thumb here: if the standard library becomes the bottleneck and the protocol format is simple, it's worth hand-rolling a dedicated parser.

## Find the fleet

Tallying `sysid` (MAVLink's marker for which vehicle sent a message) reveals **10 different drones** (sysid 1–10).

Each sends roughly the same proportion of message types (`HEARTBEAT`, `GPS_RAW_INT`, `GLOBAL_POSITION_INT`, `ATTITUDE`, `STATUSTEXT`), perfectly matching the "a huge fleet patrolling simultaneously" scenario.

The `STATUSTEXT` contents are all just standard ArduPilot auto-mission logs (disarm, takeoff, fly to waypoint…), and no drone's text log hides anything unique, so the information must be in the coordinates.

## Plot each drone's coordinates

Parse `GLOBAL_POSITION_INT` (msgid 33) to get each drone's coordinates:

```python
if msgid == 33 and len(payload) >= 28:
    time_boot_ms, lat, lon, alt, rel_alt = struct.unpack_from('<Iiiii', payload, 0)
    positions[sysid].append((time_boot_ms, lat/1e7, lon/1e7, alt/1000.0))
```

(MAVLink stores lat/lon as int32 scaled by 1e7, so divide back.)

The coordinates fall around latitude `36.11–36.16`, longitude `-115.19 to -115.32`, which is Las Vegas on the map, and makes sense since this CTF is tied to DEF CON.

Overlay all 10 drones' tracks (longitude, latitude; one colour per drone) on a single plot and the answer jumps out:

![All 10 drones' tracks overlaid: the red one (sysid 4) completely ignores its block boundaries](all_tracks_overview.png)

Nine drones' tracks are tight, boxy street-grid patterns, each confined to its assigned rectangular block, matching the challenge's "patrol your block precisely every night." Only the red one (**sysid 4**) completely ignores block boundaries, sweeping across others' turf in big loops, its shape clearly different from the other 9. That's the one that broke formation.

It should be obvious by now: sysid 4 spells out `BVLOS`:

![sysid 4's track alone, clearly spelling BVLOS](sysid4_bvlos.png)

But those four letters aren't the flag themselves.

## Flag

`BVLOS` is a very common acronym in drone regulation: **B**eyond **V**isual **L**ine **O**f **S**ight, meaning flying a drone beyond the operator's unaided visual range. It fits the scenario well:

> a drone that flew off to where no one could see it. Assembling the flag per the given example format (each word capitalized, underscore-separated):

`starpwn{Beyond_Visual_Line_Of_Sight}`

## Takeaways

1. **Judge a file's format by more than its extension.** An undocumented `.raw` file can be identified and worked on just from the leading `0xFD` magic byte and the plaintext firmware version string.
2. **When a general library hits a wall on large data, hand-rolling the protocol parse is often well worth it.** MAVLink v2's header is fixed-length and self-describing (the payload length is in the second byte), so a linear walk with `struct.unpack_from` is more than an order of magnitude faster than the full dialect library.
3. **`sysid` is the most natural way to split multiple vehicles mixed into one stream**. When a capture might contain more than one vehicle, tally `sysid` first.
4. **The challenge name "Connect the dots" is literal.** Spelling text with a flight path is a real-world amateur stunt (like Strava art), and taking the name as a "how to solve" hint rather than just flavour points straight at the solution: plot the ordered coordinate points and read them with your eyes.

---
