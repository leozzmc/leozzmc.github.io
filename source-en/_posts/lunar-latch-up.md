---
title: The One Bit Stuck High | Lunar Latch-Up | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - Crypto
  - AES
  - CRC
  - Radiation
  - Single Event Latchup
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/b940e003/gaictf.png
abbrlink: "b940e003"
date: 2026-10-23 20:20:00
top_img:
---

{% note info %}
Second post of the GaianSpace CTF 2026 "05-rad-hard-rampage" series.

🌐 中文版：[繁體中文](/posts/b940e003.html)
{% endnote %}

The previous post, [Cosmic Bit Blunder](/en/posts/3dc34d2b.html), was about a Single Event **Upset** (SEU): one bit knocked over, either 0↔1. This one is similar, but the failure mechanism is a bit different: a Single Event **Latch-up** (SEL), where a bit gets forced high and stuck there. The distinction is subtle, yet it's enough to cut the search space in half again.

> Other posts in the series: [A Logic Gate Shorted by Radiation / Ionized Transistangle](/en/posts/3ba58d97.html)、[Sensor Drift / Degradift](/en/posts/603a4422.html)

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

> A single heavy ion hit the Foundation One power-management block and triggered a latch-up — a parasitic path that slams one bit high and holds it there, drawing current until someone cuts the rail. One bit in there is stuck high that should not be.

In plain terms: a heavy ion hit Foundation One's power-management block and triggered a **latch-up**, a parasitic current path that **forces a bit high and holds it there**, drawing current until someone cuts the rail.

In the dumped registers, one bit is stuck high that shouldn't be, and everything downstream uses these registers as a key, so until that stuck bit is reset, the sealed mission payload can't be opened.

The only files given are `reg_dump.bin` (84 bytes) and a `recovery_spec.md` describing its format:

| Offset | Size | Field |
|---|---|---|
| 0x00 | 32 | R0..R7, eight 32-bit registers (little-endian) |
| 0x20 | 4 | Integrity word: CRC-32 of these 32 bytes' healthy state (zlib/ISO, little-endian) |
| 0x24 | rest | Sealed payload: AES-128-ECB ciphertext of the flag (PKCS#7) |

Key scheme: `key = SHA-256(R0..R7 bytes)[:16]`.

> The challenge spells out how to find the answer very plainly: use the **only honest method**: the single bit that makes the integrity word match again.

> Flag format: `GAIANSPACE{...}`

## Latch-up only "pushes a bit high," never "pulls it low"

This is the key to the whole challenge, matching the hint "One bit too high."

A quick intro to the physics of **Single Event Latch-up (SEL)**: a particle triggers a parasitic PNPN (thyristor/SCR-like) conduction path in the CMOS structure, pulling a node **high and self-sustaining** it. The difference from the previous post's SEU is that SEU can go 0→1 or 1→0, but latch-up slams one bit **high**. It can only stick a bit that was 0 at 1, and **can never turn a bit that was 1 into 0**.

So that directionality cuts the search space in half again: the faulty bit must have been **0** before the damage and **1** after. I only need to check the bits **currently equal to 1** (clearing them to 0 one at a time), and never touch the bits that are 0.

## Use the integrity word as a "search tool," not just a verifier

For each bit currently set to 1 in the registers, try clearing it to 0, recompute the CRC-32 of those 32 bytes, and check whether it matches the integrity word stored in the file, `0xa70b003b`:

```python
import struct, zlib
data = open('reg_dump.bin','rb').read()
regs = bytearray(data[:32])
crc_stored = struct.unpack('<I', data[32:36])[0]

for i in range(256):
    bi, bit = i // 8, i % 8
    if not (regs[bi] >> bit) & 1:
        continue                       # latch-up only pushes high → a 0-valued bit can't be the culprit
    r = bytearray(regs); r[bi] ^= (1 << bit)
    if zlib.crc32(bytes(r)) == crc_stored:
        print("found bit", i, bytes(r).hex())
```

This feels like the "only honest method" the challenge mentions: not guessing which bit is suspect, but letting the integrity check itself tell you the answer.

Of all the bits currently set to 1, **only one** makes the CRC match after clearing, bit **37** (byte 4, i.e. the lowest byte of R1, `0x20 → 0x00`):

![Bit-by-bit scan: only the bits currently 1 are checked (blue); clearing one of them makes the CRC match again (red). The grey bits are 0 and can't be caused by latch-up](crc-bitscan.png)

`recovery_spec.md` actually plants a distractor: "R7's reserved high nibble is where the clear routine often operates, but this event didn't hit there", which is the challenge kindly reminding you not to fixate on R7 out of preconception. The real fault is in R1.

## The registers are the key

Matching the second hint, "The registers are the key."

Compute `SHA-256` of the repaired 32 bytes and take the first 16 as the AES-128 key:

```python
import hashlib, subprocess
repaired = bytes.fromhex("4d3c2b1a00000000efbeadde0df00000bebafeca785634120df0ad0beeffc000")
key = hashlib.sha256(repaired).digest()[:16]
# openssl enc -d -aes-128-ecb -K <key> -in <ciphertext>
```

AES-128-ECB decrypt the ciphertext (48 bytes = 3 blocks), strip the PKCS#7 padding, and out comes a clean, correctly-formatted flag, confirming once more that bit 37 was the right one.

## Flag

```
GAIANSPACE{s1ngle_event_l4tchup}
```

## Takeaways

1. **The fault's directionality cuts the search space in half again.** SEU requires checking 256 bits (either 0↔1); SEL only "pushes high," so only bits currently set to 1 are candidates. Understanding the fault's physics isn't just flavour; it genuinely reduces the work.
2. **CRC isn't only for "verifying" an answer; it can also "find" one.** This challenge stores a CRC of the healthy state, so "try each candidate + filter by CRC" becomes a deterministic search algorithm, far more reliable than guessing which field is broken, exactly the challenge's "only honest method."
3. **A spec line like "this field is a common target, but not this time" is usually there to rule out a decoy.** This challenge deliberately calls R7's reserved nibble "the clear routine's favourite spot" precisely so you don't dive in.
4. **Binding the key to the repaired data itself gives built-in verification.** The key is `SHA-256(registers)`, so a correct repair decrypts correctly with valid padding, and a wrong one gives garbage. You know whether the answer is right without submitting it.

---
