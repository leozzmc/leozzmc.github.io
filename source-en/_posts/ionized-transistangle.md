---
title: A Logic Gate Shorted by Radiation | Ionized Transistangle | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - Hardware
  - Logic
  - Netlist
  - Radiation
  - Total Ionizing Dose
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/3ba58d97/gaictf.png
abbrlink: "3ba58d97"
date: 2026-10-23 20:30:00
top_img:
---

{% note info %}
Third post of the GaianSpace CTF 2026 "05-rad-hard-rampage" series.

🌐 中文版：[繁體中文](/posts/3ba58d97.html)
{% endnote %}

> The first two posts ([SEU](/en/posts/3dc34d2b.html), [SEL](/en/posts/b940e003.html)) were both **single-event effects**: one particle, one bit, one instant. This one is a **cumulative effect**: not a single hit, but months of radiation dose slowly wrecking the transistors. The failure model shifts from "data got changed" to "the logic itself is broken," so the approach is completely different.
>
> Other post in the series: [Sensor Drift / Degradift](/en/posts/603a4422.html)

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

> Total ionizing dose does not flip a bit and move on — it leaves transistors shorted, stuck, permanently. The encoder now spits nonsense. We still have the original design, gate for gate, with the damaged nodes marked.

In plain terms: months of accumulated radiation dose have finally taken out Foundation One's status encoder. **Total Ionizing Dose (TID) doesn't flip one bit and move on. It shorts transistors permanently and jams them.** The encoder now spits out garbage. We still have the original design, gate for gate, with the damaged nodes marked.

The encoder turns a string of probe words into a line of status words, but what's measured on the board is garbage, because a few gates have shorted: no matter the input, their outputs are jammed.

In other words, we need to reconstruct what the encoder **was supposed to do**: run the probe words through the "as-designed" logic, and the status line comes back.

The file given is a gate-level netlist `status_encoder.netlist`, with the shorted gates marked and the probe words listed at the end.

> Flag format: `GAIANSPACE{...}`.

## Reading the netlist

```
INPUTS i0 i1 i2 i3 i4 i5 i6 i7
OUTPUTS o0 o1 o2 o3 o4 o5 o6 o7
o0 = XOR i0 i7
n1 = XOR i0 i2
...
n6  = XOR i0 i1   [SHORTED=0]
...
n15 = XOR i1 i3   [SHORTED=1]
...
PROBES 77 a6 ce a6 a7 e8 97 a6 61 b0 13 12 0a 12 35 f3 96 b2 8c 34 5d ab 5d 34 e4 96 9b 0a 7b 23 c2
```

8 inputs, 8 outputs, all `XOR` chains plus some `NOT`s. Two nodes, `n6` and `n15`, are marked `[SHORTED=0]` and `[SHORTED=1]`.

> This is the challenge's "transistors shorted, outputs permanently jammed at some value no matter the input."

## The short value is a lie, so use the design value

This is the twist of the whole challenge, matching the hint "A short is a lie."

**Total Ionizing Dose (TID)** is a completely different radiation effect: not the instant event of one particle, but long-term accumulated charge trapped in the oxide layer, slowly drifting the transistors' threshold voltage and leaking, until some gates "stick" at a fixed output and never respond to input again.

So what's measured on the board now is the two **post-damage** jammed values, which are the result of the fault, not the design intent. `[SHORTED=0]`/`[SHORTED=1]` are just recording **what it's broken into now**, so when reconstructing you must **completely ignore** those markers and compute `n6`, `n15` by their original logic (`n6 = i0 XOR i1`, `n15 = i1 XOR i3`), no different from any other healthy gate.

## Feed the probe words through the "as-designed" logic

The netlist comments spell out that each probe byte's bits map to `i7..i0` (bit 0 → `i0`, bit 7 → `i7`).

Feed the 32 probes in order through the as-designed logic (ignoring the short markers), compute each group's `o0..o7`, and reassemble into a byte.

To see the damage's effect clearly at the same time, I simulated both "run as damaged" and "run as designed":

```python
def run(byte, damaged):
    v = {inputs[k]: (byte >> k) & 1 for k in range(8)}
    for lhs, op, a, b, shorted in gates:
        if damaged and shorted is not None:
            v[lhs] = shorted            # jammed, ignore its inputs
        elif op == 'NOT':
            v[lhs] = 1 ^ v[a]
        else:
            v[lhs] = v[a] ^ v[b]        # design value, don't use the SHORTED marker
    return sum(v[outputs[k]] << k for k in range(8))

damaged  = bytes(run(int(p,16), True)  for p in probes)
designed = bytes(run(int(p,16), False) for p in probes)
```

Put the two outputs side by side and the conclusion is obvious:

![Running the damaged logic gives garbage (top, grey); ignore the SHORTED markers and run the as-designed logic and the status line comes back (bottom, green)](designed-vs-damaged.png)

Interestingly, the damaged output's first few characters still coincidentally show hints of `GE` and `ENSPE` (probably because some output bits happened not to be affected by those two jammed gates), but overall it's not text at all. Only running fully as-designed (both gates treated as normal XOR) makes the 32 probes map to the complete, clean flag.

## Flag

```
GAIANSPACE{t0tal_1onizing_d0se}
```

## Takeaways

1. **"Stuck" and "flipped" are two completely different failure models.** A flip (SEU) changes just one value, so you enumerate to recover it (see [the first post](/en/posts/3dc34d2b.html)); a stuck gate (TID) returns the same value for all inputs and propagates downstream. The solution isn't to guess "what the correct value is," but to **directly reconstruct the as-designed logic**.
2. **When the challenge explicitly says a marker is "the broken state," don't let it lead you around.** The `[SHORTED=...]` value describes the fault; it's not meant to be used, so treat it as noise to ignore. The real work here is "correctly turning the netlist into a simulator"; the logic itself is simple.
3. **Building both "run as damaged" and "run as designed" for comparison does more than verify understanding; it's also vivid.** You see at a glance how far the short corrupts the downstream signal, and it confirms your simulator isn't buggy.

---
