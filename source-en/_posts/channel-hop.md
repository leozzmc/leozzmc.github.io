---
title: The One Line That Got Rewritten | Channel Hop | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - LoRa
  - Remote Sensing
  - Steganography
  - DSP
categories:
  - CTF Writeup
aside: true
toc: true
cover: /img/LoRa.png
abbrlink: "bbd322cb"
date: 2026-10-24 20:10:00
top_img:
---

> 🌐 中文版：[繁體中文](/posts/bbd322cb.html)
>
> This is the opening post of my favourite storyline in GaianSpace CTF 2026. The whole series is built around one idea: **you hand-build a LoRa demodulator yourself**, and then keep growing it: from a single fixed parameter set, to implicit headers, to Doppler drift, and finally to frequency hopping.
>
> This first post doesn't touch IQ yet; it's a warm-up at the **packet layer**. The real IQ work starts in the next post, [True Color Is a Lie](/en/posts/f90bdeae.html).
>
> Rest of the series: [Isodata Seven](/en/posts/907c1e5f.html)、[Subsidy Claim](/en/posts/1279e916.html)、[Two Voices](/en/posts/ec3d267b.html)、[No Name on the Door](/en/posts/7a436e8c.html)、[Hopscotch](/en/posts/9633ca0c.html)

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

Every morning, Babb's corn farm receives a GaianSpace AgriLink satellite tile through a LoRa mast. This particular morning the tractor shows `map integrity: unverified` and refuses to use the tile. Support won't open a ticket without the tile's **delivery stamp**, but the farmer can't find it anywhere on the tablet. Luckily, the mast kept a log of what it received.

Goal: find the delivery stamp.

The files given are `mast_rx_0540.log` (the receive log, 641 lines of hex packets) and `agrilink_welcome.txt` (the sign-up welcome letter, "some of it may be out of date").

Flag format: `GAIANSPACE{...}`

## Read the log, rebuild the tile

The first packet in the log decodes to a chunk of text metadata:

```
tile=0704 site=BABB-N date=2025-07-04 src=S2 L2A gsd=10m px=128x128 ch=B02,B03,B04,B08,B11 scale=refl*400
```

That one line tells us everything:

- The data comes from Sentinel-2, 128×128 pixels, 10 m resolution.
- And there are **5 channels**:
  - B02 (blue)
  - B03 (green)
  - B04 (red)
  - B08 (near-infrared)
  - B11 (short-wave infrared)
- But the welcome letter only mentions 4 channels (blue/green/red + NIR). It quietly left one out.

The remaining packets follow the format `AL 02 04 07 'D' <channel 0–4> <row 0–127> <128 pixel bytes>`.

5 channels × 128 rows = 640 data packets, plus one trailing packet. Drop them back into five 128×128 grayscale images and the whole tile comes back.

Compose blue/green/red (B04/B03/B02) into a true-colour image and you get exactly what the farmer sees on the tablet: circular pivot-irrigation fields, roads, solar panels. Everything looks normal, and there's no stamp in sight:

![True-colour composite (B04/B03/B02): what the tablet shows, with no visible stamp](true-color.png)

## The stamp is hiding in a channel the tablet never shows

The tablet only builds true colour from blue/green/red, so if the stamp lives in **another channel**, the farmer will never see it. I ran a high-pass filter on each channel (subtract a Gaussian blur, then boost the contrast) to amplify the tiny brightness variations:

```python
hp = a - gaussian_filter(a, 1.5)
v  = clip(128 + hp * 6, 0, 255)
```

Line the five high-pass images up side by side and the answer jumps right out.

Only **B08 (near-infrared)** has three lines of text written across the fields:

![High-pass of all five channels (B02, B03, B04, B08, B11 in order): only the fourth, B08, has text](five-channels-highpass.png)

The brightness difference in the raw image is tiny and completely invisible to the eye, and the true-colour composite doesn't use B08 at all. That's the whole trick: the stamp was written into a channel the tablet simply never renders.

## Flag

```
GAIANSPACE{AL-STAMP-Q9VRR9}
```

## Takeaways

1. **When something is "invisible," first list what data isn't being displayed.** The way in here: the metadata lists 5 channels, the welcome letter claims 4, and the tablet only uses 3. The stamp is hiding in the channel everyone ignores.
2. **For image stego, a per-channel high-pass or contrast stretch makes hidden watermarks pop.** Especially with multispectral satellite imagery, where different bands carry wildly different amounts of information, so don't just stare at the visible light.
3. **Don't rush to chase the noise in the log (dropped packets, RSSI, SNR).** I spent a while hunting missing packets and looking for patterns in RSSI, and they were all red herrings. Reconstruct the actual data and look at it first; that beats drilling into details.
4. The challenge name `channel-hop` means "search across different channels (bands)," **not** LoRa frequency hopping. Real hopping doesn't show up until the final post in the series, [Hopscotch](/en/posts/9633ca0c.html).

---
