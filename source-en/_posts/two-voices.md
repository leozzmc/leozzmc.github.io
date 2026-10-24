---
title: A Downlink Hijacked in the Dead of Night | Two Voices | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - LoRa
  - SDR
  - Radio
  - DSP
categories:
  - CTF Writeup
aside: true
toc: true
cover: /img/LoRa.png
abbrlink: "ec3d267b"
date: 2026-10-24 20:50:00
top_img:
---

> 🌐 中文版：[繁體中文](/posts/ec3d267b.html)
>
> Fifth post in the series, and the storyline shifts to "the night shift": GaianSpace Mission Control's GAIAN-723 satellite has been hijacked. The first four posts (the farm arc) got the LoRa demodulator well-practiced; these three ([this one](/en/posts/ec3d267b.html), [No Name on the Door](/en/posts/7a436e8c.html), [Hopscotch](/en/posts/9633ca0c.html)) throw increasingly nasty situations at that same demodulator.
>
> This post's theme: within one recording, two LoRa transmitters with completely different parameters are talking to each other.
>
> Rest of the series: [Channel Hop](/en/posts/bbd322cb.html)、[True Color Is a Lie](/en/posts/f90bdeae.html)、[Isodata Seven](/en/posts/907c1e5f.html)、[Subsidy Claim](/en/posts/1279e916.html)

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

On the night shift, GAIAN-723 dropped off the telemetry terminal at 01:12, yet the schedule says it's overhead right now. David Aroz is alone in the SOC; the ground-station modem reports nothing, but the station's raw recorder has been running the whole time, and he pulls out the last 40 seconds of the band.

The waterfall isn't empty. There are **two voices** in it: one is GAIAN-723, and the other isn't on any GaianSpace frequency plan, and it's talking to the satellite. The old frequency sheet on the desk still says 433.000 MHz.

Goal: find what GAIAN-723 answered when the stranger made its **first call**.

The file given is a ~180 MB `.sigmf-data` (2 MS/s, 433.55 MHz) plus the desk notes.

Flag format: `GAIANSPACE{...}`

## Two voices with different "accents"

The 433.000 MHz on the old sheet isn't where any signal actually is (the note itself says "might be wrong"). Looking at the waterfall and the per-band energy, there are two transmitters, repeating a cycle about every 12 seconds:

![45 seconds of waterfall: A (the satellite) packet clusters on the left, B's strong pulses as horizontal lines on the right](waterfall.png)

| | A (satellite) | B (stranger) |
|---|---|---|
| Frequency | ~433.170 MHz | ~433.920 MHz |
| Modulation | LoRa **SF9, BW125k** | LoRa **SF7, BW250k** |
| Sync word | 0x12 (public) | 0x34 (LoRaWAN) |
| Preamble | 12 symbols | 8 symbols |

This is the "different accents" the challenge mentions: the sync word, SF, and bandwidth are all different. So you **can't decode both sides with the same parameters**; the demodulator has to run against each parameter set separately. Zoom into one cycle and the order is: A long packet → B strong pulse → A short packet:

![One cycle in time-frequency: A long packet, B pulse, A short packet](one-cycle.png)

## Decoding the conversation

Running the demodulator with each parameter set, all packets decode cleanly with parity check 0.

The conversation (TC = telecommand, TM = telemetry response):

| Time | Who | Content |
|---|---|---|
| 4.017 s | B | `TC HELLO` (seq 0) |
| **4.224 s** | **A** | **`TM,ACK,0,HELLO,GAIANSPACE{...}`** |
| 15.89 s | B | `TC GET HK`; A replies with housekeeping |
| 28.25 s | B | `TC GET CFG`; A replies `NAK` |
| 39.08 s | B | `TC SET DLCFG B`; A replies `OK,DLCFG=B` |

B is the stranger: it says hello, queries status and config, and finally switches the satellite's downlink config to B, which explains why the ground-station modem, stuck on the old config, stopped receiving anything.

The challenge asks what the satellite answered on the stranger's "first call," which is the ACK at 4.224 s, and it coughs up the flag directly.

## Flag

```
GAIANSPACE{tw0_v01c3s_0B0EFE1A}
```

## Takeaways

1. **"Two voices" means compare modulation parameters.** Here the two sides differ in SF, BW, sync word, and preamble length; building out all the transmitters and a timeline first, then decoding each, is more efficient than trying parameters one at a time.
2. **The old frequency sheet is wrong, so trust the recorded data, not the documents.** Very common in SDR challenges.
3. **Pair commands with responses using the sequence number.** TC/TM looks like a protocol, and the seq in `TM,ACK,<seq>,...` lets you pin down the "first call" answer exactly.
4. Here the satellite side used SF9 and the stranger SF7, both fairly standard. In the next post, [No Name on the Door](/en/posts/7a436e8c.html), the satellite switches to **no header, with every packet looking different**, and the demodulator has to evolve again.

---
