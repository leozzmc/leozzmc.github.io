---
title: Single Event Upset and 128 Candidate Keys | Cosmic Bit Blunder | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - Crypto
  - AES
  - Radiation
  - Single Event Upset
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/3dc34d2b/gaictf.png
abbrlink: "3dc34d2b"
date: 2026-10-23 20:10:00
top_img:
---

{% note info %}
🌐 中文版：[繁體中文](/posts/3dc34d2b.html)

This is the first post of the GaianSpace CTF 2026 chapter "05-rad-hard-rampage."

The whole series is beautifully designed: four challenges, each mapping exactly to one of the four real failure mechanisms that space radiation causes in electronics — Single Event Upset (SEU), Single Event Latch-up (SEL), Total Ionizing Dose (TID), and Displacement Damage (DDD). I'm writing one post per challenge.

{% endnote %}

> The other three posts: [Single Event Latch-up / Lunar Latch-up](/en/posts/b940e003.html)、[A Logic Gate Shorted by Radiation / Ionized Transistangle](/en/posts/3ba58d97.html)、[Sensor Drift / Degradift](/en/posts/603a4422.html)
>
> The backdrop here: a high-energy proton passed through the flight computer and flipped exactly **one bit** in the key. This is very common in space — high-energy particles/radiation easily cause bit flips or errors in electronics and signals.

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

> High in the Foundation One orbit, a single cosmic-ray proton punched through the flight computer and flipped exactly one bit in the key that protects the mission log. The log still decrypts to garbage. The reliability team wants the log back, and they are sure the rest of the key survived intact.

In plain terms: high in orbit, a cosmic-ray proton punched through Foundation One's flight computer and **flipped exactly one bit in the key that protects the mission log**. The log now decrypts to garbage. The reliability team wants it back, and they're sure the rest of the key is intact.

The on-call engineer's instinct is: "the whole key is toast, just rewrite a fresh one" — but the challenge warns that doing so would lose the log along with it (change the key and the already-encrypted ciphertext can never be decrypted again).

Only two files are given:

- `cipher.bin`: 32 bytes, the encrypted mission log (AES, single-block scheme).
- `corrupted.key`: 16 bytes, the damaged 128-bit key.

> Flag format: `GAIANSPACE{...}`

## First, figure out what a "Single Event Upset" actually changed

**Single Event Upset (SEU)** is the most classic radiation effect in space electronics: a high-energy particle passes through a memory cell and, in that instant, knocks over the stored charge, flipping **one bit from 0 to 1 or 1 to 0**. The data is changed, but the circuit itself isn't damaged — rewrite it and it recovers.

For this challenge, the key inference is: **since only one bit is wrong, there are only 128 possible correct keys.**

A 128-bit key has only 128 bit positions. The correct key must be `corrupted.key` with **one of its bits flipped back**, and that search space is small enough to brute-force directly — which matches the challenge's blunt hint, "try them all."

## Flip each bit back and see which one decodes to readable text

The challenge says "AES, single-block scheme," i.e. ECB mode with no IV needed. The approach is direct: for each of the 128 candidate keys, flip one bit back, AES-128-ECB decrypt `cipher.bin`, then count how many of the resulting bytes are printable ASCII.

```python
import subprocess
key = open('corrupted.key','rb').read()

results = []
for i in range(128):
    k = bytearray(key)
    k[i // 8] ^= (1 << (i % 8))          # flip bit i back
    out = subprocess.run(
        ["openssl","enc","-d","-aes-128-ecb","-K",bytes(k).hex(),
         "-nopad","-in","cipher.bin"],
        capture_output=True).stdout
    printable = sum(32 <= c < 127 for c in out)
    results.append((printable, i, bytes(k), out))

results.sort(reverse=True)
```

Of the 128 candidates, 127 decode to random noise (printable count drifting between 5 and 19), and only **flipping bit 50** (byte 6, bit 2, `d2 → d6`) decodes a full 30 consecutive printable characters — standing out from the noise on its own:

![Printable-character count for each of the 128 single-bit-flip candidates after decryption. Only bit 50 (red) decodes clean text; the rest drown in noise](bitflip-scan.png)

Why is this signal so clean and easy to spot? Because AES has an **avalanche effect**: if the key is right, the whole block reverts to correct plaintext, and if even one key bit is wrong, the whole block is unrecognizable.

So you don't even need to know what the flag looks like — the printable-character count alone is enough to pick out the right answer.

## The decoded content

Decrypting with the repaired key gives:

```
GAIANSPACE{s1ngle_event_upset}\x02\x02
```

That trailing `\x02\x02` is PKCS#7 padding (padding length 2). Strip it and you get exactly a 30-character flag; add the 2 padding bytes and it's exactly 32 bytes, matching the ciphertext length perfectly. That's effectively a second layer of validation — only the correct key yields valid PKCS#7 padding — confirming once more that bit 50 was the one that got flipped.

## Flag

```
GAIANSPACE{s1ngle_event_upset}
```

## Takeaways

1. **The challenge's physical constraint directly determines the solution.** "Only one bit is wrong" compresses "guess the whole key" ($2^{128}$, impossible) down to "128 possibilities" (runs in a second). When reading a challenge, first convert the conditions into a search-space size, then decide whether to write a brute-forcer — many crypto challenges that look brutal are really just a tiny enumeration.
2. **AES's avalanche effect makes filtering extremely reliable.** Right key → whole block correct, wrong key → whole block garbage, with no grey zone in between. So a crude metric like "printable-character count" is enough to uniquely pick the answer, without knowing anything about the plaintext first.
3. **PKCS#7 padding is free secondary validation.** The end of the decryption is exactly a valid padding pattern, giving near-certainty you picked the right key. With block-cipher challenges, glance at the padding after decrypting.

---
