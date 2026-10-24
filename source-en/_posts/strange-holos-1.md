---
title: The Graffiti on the Wall Is an Alien Script | Strange Holos 1 | STARPWN 2026
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
cover: /posts/e9d90ba/space1-glitter.png
abbrlink: "e9d90ba"
date: 2026-09-21 21:15:55
top_img:
---

> 🌐 中文版：[繁體中文](/posts/e9d90ba.html)
>
> This challenge gives you a single image and no hints at all. The whole solve needs no complicated code, just looking at the picture carefully.

<!-- more -->

## What the challenge is about

You get exactly one file: `space1-glitter.png` (1536×1024, 2.3 MB).

Opening it looks like this:

![The original: a cyberpunk night alley](space1-glitter.png)

> The image shows a cyberpunk-style alley at night, with a wall covered in neon graffiti written in some unreadable script, plus a few projected billboards in the background. The style fits this CTF's GLITTERCITY theme nicely, and if you look closely there's a "GL177" neon sign further back next to a spire. There's no text explanation anywhere, so the flag is obviously hidden somewhere in this picture.

## Step 1: check the file

With one image and no other leads, the instinctive first move is to inspect the file itself. All of these checks came back clean:

```bash
file space1-glitter.png          # PNG image data, 1536 x 1024, 8-bit/color RGB, non-interlaced
binwalk space1-glitter.png       # only the PNG itself, no embedded archives
strings -n 8 space1-glitter.png  # only C2PA / SSL.com certificate noise
```

Walking the PNG chunk structure manually to confirm there's no custom data block:

```python
import struct
data = open("space1-glitter.png", "rb").read()
pos = 8
while pos < len(data):
    length = struct.unpack('>I', data[pos:pos+4])[0]
    ctype  = data[pos+4:pos+8].decode()
    print(ctype, length)
    pos += 8 + length + 4
```

Output:

```
IHDR 13
caBX 29087     <- C2PA content provenance info
IDAT 2273074
IEND 0
```

The only non-standard chunk is `caBX`, a **C2PA** (Content Provenance and Authenticity) manifest. Decoding it with `exiftool` shows it means exactly what it says: this is certification info for an AI-generated image, not a puzzle:

```
Actions Software Agent Name     : gpt-image
Actions Digital Source Type     : .../digitalsourcetype/trainedAlgorithmicMedia
Claim Generator Info Name       : OpenAI Media Service API
```

So the image was produced by an image-generation model, and `caBX` is just that generation process's signature chain (SSL.com certificate, OCSP response, timestamp). **Nothing is hidden inside it.** Knowing this saves the time you'd otherwise waste base64-decoding a pile of certificate data on a hunch.

Next, testing for **LSB (least significant bit) steganography**, also nothing. The LSB plane looks like pure sensor noise, and the proportion of 1s is nowhere near a suspicious 0.5:

```python
import numpy as np
from PIL import Image
arr = np.array(Image.open("space1-glitter.png").convert("RGB"))
for ch, name in zip(range(3), "RGB"):
    print(name, (arr[:, :, ch] & 1).mean())
# R 0.4532  G 0.4466  B 0.4834
```

Because the image has a heavy chromatic-aberration glitch look, I also split the R/G/B channels apart, guessing one of them might hide clean text. That came up empty too. **All three channels show identical glyph shapes**, just offset from each other by a few pixels. The colour fringing is purely a cyberpunk art effect, not a three-layer cipher.

> So the conclusion so far: the flag is in the picture itself, to be read with your eyes. That patch of strange graffiti in the middle is the puzzle.

![Zoomed graffiti](graffiti_zoom.png)

Looking closely, you can see:

- Characters 2, 6, and 9 are identical in shape (a `V` with a vertical bar and a serif flourish on top).
- Characters 3, 7, and 10 are identical in shape (a thickened `7`).

So the overall structure is `? A B C | D A B ? A B`: a 4-letter word and a 6-letter word sharing repeated letters at fixed positions.

## Step 2: the wrong turn, Standard Galactic Alphabet

When alien-looking angular symbols show up in a CTF, the instinctive first guess is the **Standard Galactic Alphabet** (SGA, the symbol system from *Commander Keen* and Minecraft's enchanting table). It is far and away the most commonly used substitution alphabet in CTFs.

So I pulled down the official chart to compare:

```bash
curl -sL -A "Mozilla/5.0" -o sga.gif https://www.omniglot.com/images/writing/sga.gif
```

![SGA Standard Galactic Alphabet chart](sga_chart.png)

**SGA turned out to be completely wrong, and not even close.** Real SGA glyphs are built from dots, short hooks, and right angles (`a` is a hook, `f` is a bar with three dots above, `i` is a line split into two segments, `w` is three dots). Not one of its 26 letters looks like a three-bar `Ξ`, a `7`, or a `V` with a bar. Wrong direction.

## Step 3: the real answer, Aurebesh

The same Omniglot index of fictional scripts also lists **Aurebesh**, the galactic standard script from *Star Wars*. Aurebesh glyphs are hard-edged and blocky, built from bars and diagonals, matching the wall text's visual style exactly.

```bash
curl -sL -A "Mozilla/5.0" -o aurebesh.gif https://www.omniglot.com/images/writing/aurekbesh.gif
```

![Aurebesh character chart](aurebesh.png)

Every one of the 10 characters on the wall maps to an Aurebesh letter. Here's a side-by-side comparison, with the wall characters on top and the matching glyphs cropped from the Omniglot chart below:

![Side-by-side comparison](aurebesh_match.png)

| # | Wall character | Aurebesh name | Letter |
|---|------|---------------|--------|
| 1  | hook + peak      | **nern** | N |
| 2  | `V` + bar            | **esk**  | E |
| 3  | thickened `7`             | **resh** | R |
| 4  | cross + curve     | **forn** | F |
| 5  | three bars `Ξ`        | **herf** | H |
| 6  | `V` + bar            | **esk**  | E |
| 7  | thickened `7`             | **resh** | R |
| 8  | notched `Ǝ`      | **dorn** | D |
| 9  | `V` + bar            | **esk**  | E |
| 10 | thickened `7`             | **resh** | R |

```
N E R F   H E R D E R
```

The repeated-character structure I noticed earlier independently confirms this: characters 2/6/9 are `esk` (E) and characters 3/7/10 are `resh` (R), which matches the letter repetition in `NERF` / `HERDER` exactly. That's the answer.

## "nerf herder" is more than just a plausible answer

Three independent clues corroborate each other:

- **"Strange Holos"**: holos means holograms, and the image contains a holographic billboard. Holograms are an iconic communication medium in *Star Wars* (Princess Leia's distress message). The challenge name itself is a categorical hint pointing at Star Wars script.
- **Aurebesh is the official *Star Wars* script**, so the writing system matches the theme perfectly.
- **"nerf herder" is one of the most famous lines in the saga.** Princess Leia insults Han Solo in *The Empire Strikes Back*: "...you stuck-up, half-witted, scruffy-looking nerf herder!" (a nerf is a livestock animal in the Star Wars universe). That's exactly the kind of iconic line a challenge author picks as the payoff for decoding an alien script.

## Flag

Transcribe the decoded text directly, keeping the space separator rather than an underscore:

```
STARPWN{nerf herder}
```

I first submitted `STARPWN{nerf_herder}` and it was rejected. This CTF's flag format isn't actually consistent, so when the decoded content is a natural-language phrase, try the original space separator first instead of assuming it must become snake_case.

## Appendix: dead ends I walked down

| Idea | Result |
|---|---|
| Extra data appended after the file | `binwalk` clean, the PNG ends at `IEND` |
| Custom PNG chunk | Only `caBX` = C2PA provenance info (AI generation certificate) |
| LSB stego (per-channel and combined) | Noise only, proportion of 1s sits at 0.45 to 0.48 |
| Splitting R/G/B to find "clean text" | All three channels have identical glyphs, just offset |
| Mirroring or rotating the graffiti 180 degrees | No rotation makes the shapes into Latin letters |
| Using the `GL177` neon sign as a "7 = T" Rosetta Stone for `GLITTERCITY` | Dead end, since that sign uses an ordinary Latin font unrelated to the graffiti's writing system |
| Standard Galactic Alphabet | Ruled out after comparing against the real chart |

---
