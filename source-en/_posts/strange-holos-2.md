---
title: Klingon on the Wall, Tripped Up by Romanization | Strange Holos 2 | STARPWN 2026
tags:
  - STARPWN
  - CTF
  - Steganography
  - Image Forensics
  - Cipher
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/a7cc743e/space2-glitter.png
abbrlink: "a7cc743e"
date: 2026-09-21 21:17:27
top_img:
---

> 🌐 中文版：[繁體中文](/posts/a7cc743e.html)
>
> This is the follow-up to [Strange Holos 1](/en/posts/e9d90ba.html), with the same setting and structure. Recognizing the script as Klingon wasn't actually hard. What tripped me up was the last step: Klingon's **romanization** and the letter it stands for as an English substitution cipher are two different things.

<!-- more -->

## What the challenge is about

Again just one image, `space2-glitter.png` (1536×1024, 2.4 MB), with no other leads:

![The original: another cyberpunk alley](space2-glitter.png)

> Same setup as the first one: a cyberpunk alley, a wall covered in strange neon graffiti, and background signs reading "GLITTERCITY", "FORTUNE", and one in Japanese saying「ホテル」(hotel).
> But **the writing system is completely different this time**: flowing, blade-like curves with hooks and sharp points.

## File-level checks

```
pngcheck space2-glitter.png
  chunk IHDR at offset 0x0000c, length 13
  chunk caBX at offset 0x00025, length 29087    <- C2PA provenance info
  chunk IDAT at offset 0x071d0, length 2490933
  chunk IEND at offset 0x267411, length 0
No errors detected (4 chunks, 46.6% compression).
```

`binwalk` found no embedded data, `pcrt` reported all CRCs correct, and `zsteg` only turned up the bit-plane noise any ordinary photographic image has. The only non-standard chunk is again **C2PA** provenance info (`gpt-image` / OpenAI generation certificate plus SSL.com's signature chain), the same conclusion already established in part 1: not a payload.

**Same conclusion: the flag is in the picture, so look at the graffiti.**

The characters this time are flowing curves, **8 of them**:

![The 8 extracted characters](s2_glyphs.png)

## Identifying the writing system

These flowing, hooked, blade-like strokes, plus one character that's a very clean "工" shape, point to **Klingon (pIqaD)**.

It fits thematically too. Part 1 was *Star Wars* Aurebesh, and the title "**Strange** Holos" is itself a nod to *Star Trek: Strange New Worlds*.

As in part 1, I pulled the official chart to compare:

```bash
curl -sL -A "Mozilla/5.0" -o klingon.gif https://www.omniglot.com/images/writing/klingon.gif
```

![Klingon pIqaD character chart](klingon_grid.png)

Klingon's `gh` is an 工 shape, `y` is a bowl with an enclosed inner loop, and `o` is a bar plus an S-curve. All three shapes are clearly present on the wall, which confirms the writing system.

Comparing by eye gives the phrase `boldly go`.

This fits the Star Trek theme, from the most famous line in the series' opening monologue: "to boldly go where no one has gone before."

- `B O L D L Y`: letters 3 and 5 are both **L**
- `G O`: the second letter is **O**, matching the second letter of `BOLDLY`
- Character 7 = **G** (Klingon `gh`, the 工 shape)
- Characters 2 and 8 = **O** (Klingon `o`)

With the answer settled, the full mapping is clear:

![Side-by-side comparison](s2_match.png)

| # | Klingon letter | English letter |
|---|---|---|
| 1 | `b`  | B |
| 2 | `o`  | O |
| 3 | `l`  | L |
| 4 | `D`  | D |
| 5 | `l`  | L |
| 6 | `y`  | Y |
| 7 | `gh` | G |
| 8 | `o`  | O |

## The transliteration trap

My first submission was **`STARPWN{boldlh gho}`**, and it was rejected.

The mistake was that I read the characters correctly but wrote down **Klingon's romanization** rather than the English letters they represent. In Klingon romanization, `gh`, `ch`, `ng`, and `tlh` are single letters spelled with two or more characters. So that 工-shaped symbol is written `gh` under Klingon spelling rules, but when used as an English substitution cipher it stands for the single English letter **G**, making the word GO.

## Flag

```
STARPWN{boldly go}
```

Lowercase with a single space, consistent with the previous challenge's `STARPWN{nerf herder}` format.

## Appendix: dead ends I walked down

| Idea | Result |
|---|---|
| Extra data / extra chunks | `binwalk` clean, `pngcheck` clean, only `caBX` (C2PA) |
| zsteg bit planes | Noise fragments only, no structure |
| Reading it as an actual Klingon phrase (`Qapla'`, `nuqneH`, `toDSaH`, etc.) | None fit a 6+2 split with letters 3=5 identical and characters 2=8 identical |
| Using Klingon romanization directly as the flag content (`boldlh gho`) | Rejected, since multi-character romanizations must collapse to single English letters |
