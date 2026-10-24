---
title: Rebuilding the Agriculture Office's Satellite Check | Subsidy Claim | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - LoRa
  - SDR
  - GIS
  - Remote Sensing
categories:
  - CTF Writeup
aside: true
toc: true
cover: /img/LoRa.png
abbrlink: "1279e916"
date: 2026-10-24 20:40:00
top_img:
---

> 🌐 中文版：[繁體中文](/posts/1279e916.html)
>
> Fourth post in the series, and the finale of the "farm arc" (Babb's AgriLink world). The first three posts got the LoRa demodulator in shape; this one adds a layer of GIS and classifier reconstruction on top of the demodulation.
>
> In a way, it's everything from the earlier posts applied together.
>
> Rest of the series: [Channel Hop](/en/posts/bbd322cb.html)、[True Color Is a Lie](/en/posts/f90bdeae.html)、[Isodata Seven](/en/posts/907c1e5f.html)、[Two Voices](/en/posts/ec3d267b.html)、[No Name on the Door](/en/posts/7a436e8c.html)、[Hopscotch](/en/posts/9633ca0c.html)

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

{% note info %}

At the county agriculture office, the area-payment claim for Babb's north parcel was rejected: "parcel already declared as pasture, satellite check passed." Someone filed a claim using Babb's corn field, and the office's satellite check actually sided with them.

A clerk lets something slip: this year the office's classification stats **left out one class**, because "nobody around here declares that crop, and field surveys are expensive." Separately, at 12:05 the shared SDR recorded a stranger transmitting this batch of claims on "yet another channel."

{% endnote %}

Goal: find **all the false claims** in the stranger's batch, and join their claim codes with hyphens in the order they were sent.

The files given are the SDR recording, the office's check imagery (5-channel GeoTIFF), the class statistics, the training-field and parcel registry, and the rejection letter.

## First, demodulate the claim batch from the SDR

The radio this time is 434.65 MHz, SF9, BW125k, preamble 8, **explicit header**, CR4/5.

Reusing the demodulator, 64 bursts decode to: one batch header + 30 claims + one short packet, and then the whole batch is **sent again** (so every record has two copies to cross-check).

![The SDR spectrum, the spectrogram of a single burst, and the structure of the 64 bursts (header + 30 records + re-send)](sdr-bursts.png)

Each claim has the format `<seq>;<parcel>;<declared crop>;<area>;<claim code>`, e.g. `01;MZH-8140;legelo;44.67;CUVE` (legelo = pasture).

## The key: the class that got deleted

The office's `.sta` file uses Gaussian maximum-likelihood classification with equal priors, but it has **only four classes**: pasture, stubble, cropland, settlement. You can see that **corn (kukorica) was removed**, and only its training field is still there.

A supervised classifier **can only output classes it was trained on**, so with no corn statistics, a corn field gets forced into the most similar class (pasture), and the check "passes." That's the core vulnerability of the whole challenge.

I first rasterized the training-field polygons onto the image grid and recomputed each class's mean and covariance. They matched the `.sta` file byte for byte, confirming my coordinate and sampling conventions were correct.

Then I used training field T-01 to restore corn's statistics, ran a 5-class classification, and compared record by record:

![Left: true colour. Middle: the office's 4-class classification (corn fields lumped into pasture). Right: after restoring corn (yellow), with false claims marked in red](classification.png)

Under the office's 4-class classification, all 30 records "pass."

After restoring corn, only **3 records** don't match, and all three are **"declared pasture, actually corn"**:

| # | Parcel | Declared | After restoring corn | Code |
|---|---|---|---|---|
| 1 | MZH-8140 (Babb's parcel) | pasture | corn 93% | **CUVE** |
| 10 | MZH-9183 | pasture | corn 84% | **UKEJ** |
| 28 | MZH-1402 | pasture | corn 80% | **TRP6** |

## Flag

```
GAIANSPACE{CUVE-UKEJ-TRP6}
```

## Takeaways

1. **"One class is missing" is the whole key.** A supervised classifier can only output classes it was trained on; with no corn statistics it crams corn into the most similar class, pasture, so "check passed" doesn't mean the claim is honest. It's a very realistic remote-sensing fraud scenario.
2. **Validate your own pipeline against known data first.** Only after the training-field pixel counts and the `.sta` means and covariances matched byte for byte did I go restore the missing class, which is what makes the conclusion hold up.
3. **Make use of the re-send when decoding SDR batches.** The two transmissions are identical, so you can cross-confirm every character instead of guessing.
4. By this point the farm arc's LoRa demodulator is quite mature. Next the series jumps to a different storyline, [a night shift, a hijacked satellite](/en/posts/ec3d267b.html), where the same demodulator meets trickier situations.

---
