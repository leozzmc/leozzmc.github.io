---
title: High SF, Dragged Down by Drift | No Name on the Door | GaianSpace CTF 2026
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
abbrlink: "7a436e8c"
date: 2026-10-24 21:00:00
top_img:
---

> 🌐 中文版：[繁體中文](/posts/7a436e8c.html)
>
> Sixth post in the series. In the previous post, [Two Voices](/en/posts/ec3d267b.html), the satellite was still using a standard SF9. Here the stranger has changed its downlink config into **implicit header + a different SF per packet**, and because high-SF symbols are long, Doppler/clock drift makes the decode start going wrong partway through. This is the post where the demodulator is finally forced to add drift correction.
>
> Rest of the series: [Channel Hop](/en/posts/bbd322cb.html)、[True Color Is a Lie](/en/posts/f90bdeae.html)、[Isodata Seven](/en/posts/907c1e5f.html)、[Subsidy Claim](/en/posts/1279e916.html)、[Hopscotch](/en/posts/9633ca0c.html)

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

01:40. The stranger is still talking to GAIAN-723, and the satellite responds every few minutes, but every response uses a voice the ground-station modem "refuses to listen to." GAIAN-723 has changed how it speaks: packets no longer mark their length, and **every packet sounds slightly different from the last**. The ground-station log has a line at 01:31: `DL CFG CHANGED BY TC — NOT FROM MOC`.

Goal: find the CO₂ reading GAIAN-723 reported when it acknowledged the stranger's command at **01:37**, and how long it says it's been awake.

Flag format: `GAIANSPACE{[CO2 in ppm]_[uptime in seconds]}`.

## Every packet has a different SF

The log shows the downlink config was changed by a telecommand at 01:31, after which "the header is gone and the length is unknown", i.e. an **implicit header**.

This recording is a fresh segment after the 01:36 roll-over, starting at 01:36:45, so 01:37 is after the 15-second mark in the recording.

Measuring per-band energy, I find 8 satellite packets, then search the preamble peaks over SF 7–12, and it turns out **every packet has a different SF** (SF7, 8, 9, 10 in rotation), which should be what the challenge means by "each one sounds slightly different":

| Start (s) | Length | SF |
|---|---|---|
| 7.50 | 0.84 s | **10** |
| 13.07 | 0.57 s | 8 |
| **34.88** | 0.84 s | **10** |
| … | … | … |

The stranger's commands are short, strong pulses (SF7, BW250k). Recording start 01:36:45 + 34.65 s ≈ **01:37:19**, so the satellite packet closest after that command (34.88 s, SF10) is the ACK the challenge wants.

## Drift correction for high SF

The hardest packet here is **SF10**. The bigger the SF (Spreading Factor), the longer each symbol. An SF10 symbol takes 4096 samples (SF7 is only 512), so the longer a symbol drags on, the more deadly the following problem becomes.

**What is drift?** The satellite flies overhead at several kilometres per second, so the frequencies on each end keep shifting due to the **Doppler effect** (like an ambulance's pitch changing as it passes). Add the **clock error** of each side's quartz oscillator, and the signal's frequency isn't off by a fixed amount. It **slides slowly the whole time**. The longer a symbol, the more it slides within a single packet.

**How does that hurt decoding?** Recall the [demodulation skeleton](/en/posts/f90bdeae.html): after dechirping each symbol you get an FFT peak, and whichever integer bin the peak lands in is the symbol's value.

But drift makes the peak **not land exactly on an integer bin**. It carries a fraction (e.g. bin 100.2, 100.35, 100.5…), and that fractional part **grows steadily over time**.

> I measured it drifting from −0.2 slowly to −0.5, then flipping to +0.5.

At first, off by 0.2, rounding still lands in the right bin; but as it approaches 0.5, rounding **jumps to the wrong bin**, so the first half of the packet decodes correctly and the second half turns to garbage right around `CO2=`. That's why "a single fixed offset collapses partway through."

So first confirm the problem is purely drift: this ACK packet's spectrogram is a clean chirp, with no frequency hop or interference midway:

![Spectrogram of the SF10 ACK, a clean chirp](ack-spectrogram.png)

The **fix** is three steps:

1. Extract each symbol peak's **fractional part** and line them up over time into a curve;
2. Because the fraction "wraps around" when it crosses ±0.5, use `np.unwrap` to stitch those jumps into a continuous curve;
3. Fit it with a **quadratic polynomial** (drift is smooth, so quadratic is enough), then subtract that fitted curve from each symbol's bin, and the peaks settle back onto integer bins.

The left panel shows the symbol peaks' drift (blue dots) and the quadratic fit (red line); the right panel shows the timeline of packets and commands:

![Left: SF10 symbol peaks' drift (blue dots) and quadratic fit (red line). Right: timeline of packets and commands](drift-and-timeline.png)

With the drift subtracted, the whole packet decodes cleanly. This packet also ends with a CRC-16 (`*18FC`), which I recomputed with CCITT parameters and matched exactly, a stamp of approval on "decoded correctly."

## Result

```
TM,ACK,1,GET HK,HK,V=4.51,I=0.1,T=21.82,P=996.24,CO2=432,UP=132*18FC
```

The challenge wants CO₂ and UP (uptime in seconds): `CO2=432`, `UP=132`. There's a trap here: the ACK at 01:36:52 is almost identical (`CO2=424,UP=105`), and the only way to tell them apart is by time, so you have to convert the recording's start into real time to land on the 01:37 one. The two UP values differ by 27 seconds, matching the gap between the two responses, which cross-checks nicely.

## Flag

```
GAIANSPACE{432_132}
```

## Takeaways

1. **"Every packet is different" usually means SF or BW is hopping.** Do an independent parameter search per packet; don't assume the previous packet's parameters carry over.
2. **An implicit header has no length and no CR: infer the length from the symbol count on the air, and pick the CR by "which one decodes clean text or passes CRC."** First few bytes matching but the rest garbled is often a CR or drift issue, not a wrong overall direction.
3. **High-SF symbols are long and very sensitive to drift.** Plot the trend of the symbol peaks' fractional part and the drift is obvious; correct it with unwrap + polynomial fit.
4. **Two identical-looking ACKs can only be told apart by time.** Convert the recording's start to real UTC first, then match the moment the challenge states, so you don't grab the wrong one. In the next post, [Hopscotch](/en/posts/9633ca0c.html), the satellite goes one step further: it **hops across multiple frequencies** (FHSS), and the demodulator has to reassemble the hop sequence before it can decode.

---
