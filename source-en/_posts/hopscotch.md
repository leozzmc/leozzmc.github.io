---
title: Follow the Hops and Reassemble the Symbols | Hopscotch | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - LoRa
  - SDR
  - Radio
  - FHSS
  - DSP
categories:
  - CTF Writeup
aside: true
toc: true
cover: /img/LoRa.png
abbrlink: "9633ca0c"
date: 2026-10-24 21:10:00
top_img:
---

> 🌐 中文版：[繁體中文](/posts/9633ca0c.html)
>
> Seventh and final post in the series. Over the previous six posts the LoRa demodulator grew from single-frequency, fixed-parameter all the way to implicit header, different-SF-per-packet, and drift correction. Here the satellite does one last thing: **it hops across multiple frequencies (FHSS)**, and the demodulator has to reassemble the symbols, scattered across different frequencies, back into time order before it can decode.
>
> Rest of the series: [Channel Hop](/en/posts/bbd322cb.html)、[True Color Is a Lie](/en/posts/f90bdeae.html)、[Isodata Seven](/en/posts/907c1e5f.html)、[Subsidy Claim](/en/posts/1279e916.html)、[Two Voices](/en/posts/ec3d267b.html)、[No Name on the Door](/en/posts/7a436e8c.html)

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

The stranger has switched GAIAN-723's downlink into a **frequency-hopping** mode, changing frequency every few symbols to shake off a recorder stuck on a single frequency. David opens the SDR's bandwidth to the max and records the whole thing.

Goal: decode the contents of this hopping downlink and pull out the flag. The files given are a wideband `.sigmf-data` and the ground-station notes.

Flag format: `GAIANSPACE{...}`

## First, spot that it's hopping

Make a wideband waterfall of the whole segment and you can see at a glance that the signal doesn't stay on one frequency. It **hops regularly between a few frequency slots**. That's FHSS (frequency-hopping spread spectrum):

![Wideband waterfall: the signal hops across several frequency slots](waterfall.png)

Measure it: the carrier switches among a fixed set of channels, each **dwell** is roughly a fixed number of symbols, then it jumps to the next channel.

The LoRa modulation parameters (SF, BW) are the same in every dwell; only the centre frequency changes.

## Reassemble the hop sequence

The solution has two layers:

1. **Estimate the hopping plan.** Run an FFT over each time window to find the dominant frequency, giving you a time → frequency sequence. The channel set is a fixed handful of values, the dwell time is fixed, and the hop order is periodic (pseudo-random but repeating). Organize it into a hop table:

   ![Estimated hop sequence: the channel for each time, hopping periodically](hop-sequence.png)

2. **Follow the hops and stitch the symbols together.** For each dwell, bring the signal back to baseband (multiply by `exp(-j2πf·t)` to move that channel to 0), decode that segment's symbols with the same demodulator from [the earlier posts](/en/posts/f90bdeae.html), then join all the dwells' symbols **end to end** in time order to recover the full symbol stream.

The trap here is the **dwell boundary**: there's a short transition at the instant of a hop, so drop half a symbol at each end of a dwell and align each dwell's symbol phase, so they don't misalign when joined. After alignment, the whole symbol stream decodes through the standard pipeline (Gray → de-interleave → de-whiten XOR), and the packet ends with a CRC that checks out.

## Flag

The decoded downlink carries the flag directly:

```
GAIANSPACE{h0p_sc0tch_AF44A6}
```

## Takeaways

1. **The first step of FHSS is always "estimate the hopping plan."** A wideband waterfall plus a per-window FFT for the dominant frequency lets you plot "time → channel"; hopping is usually a periodic pseudo-random sequence, and once you spot the period the whole table is fixed.
2. **Hopping just scatters the symbols across frequencies; the decoding core is unchanged.** After bringing each dwell back to baseband, it's still the same LoRa demodulator, which is exactly why the earlier posts spent the effort getting the skeleton solid.
3. **Watch the dwell boundaries.** There's a transition at the moment of a hop, so leave a little margin at each end and align the phase before joining, or the symbols misalign at the seams.
4. By this point, the LoRa demodulator hand-built since [True Color Is a Lie](/en/posts/f90bdeae.html) can handle everything thrown at it: two transmitters, implicit headers, a different SF per packet, Doppler drift, and frequency hopping. One demodulator, seven challenges. That's the most satisfying part of this whole series.

---
