---
title: A Sentence Hidden in Sensor Drift | Degradift | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - Forensics
  - Data
  - Radiation
  - Displacement Damage
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/603a4422/gaictf.png
abbrlink: "603a4422"
date: 2026-10-23 20:40:00
top_img:
---

{% note info %}
The final post of the GaianSpace CTF 2026 "05-rad-hard-rampage" series.

🌐 中文版：[繁體中文](/posts/603a4422.html)
{% endnote %}

> This chapter has four radiation faults; the first three posts covered Single Event Upset ([SEU](/en/posts/3dc34d2b.html)), Single Event Latch-up ([SEL](/en/posts/b940e003.html)), and Total Ionizing Dose ([TID](/en/posts/3ba58d97.html)).
>
> This one wraps up with the fourth: **Displacement Damage (DDD)**: not a single high-energy particle strike, nor burning out the circuit, but the lattice being knocked askew hit after hit, so the readings slowly creep and slowly drift.
>
> And this challenge has a little twist: the recovered numbers look like perfectly reasonable CO₂ readings, but they aren't actually CO₂ at all.

<!-- more -->

## What the challenge is about

![Challenge page](challenge.jpg)

> Displacement damage builds up: the lattice takes hit after hit, the readings creep, and by the end of the run the numbers have wandered far from the truth. We logged the whole decline. The characterization team worked out exactly how fast it drifts.

In plain terms: Foundation One's CO₂ sensor didn't break in a day. **Displacement damage is cumulative: the lattice takes hit after hit and the readings slowly climb**, until by the end of the run the numbers are far from the truth. We logged the whole decline, and the characterization team worked out the exact drift rate.

Subtract the drift from each reading and what's left is what the sensor really saw at the time. The on-call operator will tell you the recovered values are just cleaner CO₂ readings, but **look again, they're not CO₂**.

Files given:

- `sensor_log.csv`: sample index and the degraded readings (30 records).
- `ddd_characterization.md`: the measured drift model.

The model is written right in the file:

```
drift(n) = round( 1.7 * n + 0.013 * n^2 )     [ppm], n = sample index
```

`logged reading = actual in-flight value + this drift`

The recorder also has a fixed CO₂ baseline, and the gas team will only say "somewhere around three hundred thirty ppm," refusing to be more precise.

## First, subtract the drift

Matching the hint "Creep, not jump."

**Displacement Damage Dose (DDD)** is yet another distinct radiation effect: high-energy particles knock atoms in the semiconductor lattice **out of position**, creating permanent lattice defects. These defects slowly change the sensor's response, showing up as readings that creep upward over time, a cumulative drift rather than a one-off jump, which is why the challenge stresses "creep, not jump."

And this drift is quadratic (`0.013 * n^2`), so it drifts faster the later it gets.

The subtraction is simple:

```python
def drift(n): return round(1.7 * n + 0.013 * n * n)
as_flown = [reading - drift(n) for n, reading in rows]
```

The resulting in-flight values fall between 385 and 458, which still looks like reasonable CO₂ ppm numbers.

> But that's exactly the trap the challenge means by "the operator will tell you these are just cleaner readings."

## Look again: they're not CO₂

Matching the second hint, "Not parts per million."

The challenge says the baseline is "around three hundred thirty" and **deliberately won't give an exact number**. So what if these numbers are actually **character codes** (in-flight value = baseline + ASCII code)?

Then the baseline is the unknown to solve for. For each candidate baseline between 300 and 360, decode "in-flight value − baseline" as ASCII and see which baseline makes all 30 bytes land in the printable range and spell out `GAIANSPACE{...}`:

```python
for base in range(300, 360):
    vals = [x - base for x in as_flown]
    if all(32 <= v < 127 for v in vals):
        print(base, bytes(vals).decode())
```

The left panel shows the curves before and after subtracting the drift (the blue line clearly climbs, the orange line is flattened but the numbers still look mundane); the right panel is the baseline scan, where **333 ppm is the only baseline that spells out the flag**:

![Left: subtracting the quadratic drift turns a climbing curve flat. Right: scanning baselines "around three hundred thirty," only 333 ppm spells out GAIANSPACE{...}](drift-and-baseline.png)

One detail here: nearby baselines (332, 334…) also decode to "all printable" characters, so **"is it printable" alone can't be your filter**. 332 decodes to `HBJBOTQBDF|ejtqm5...`, jumbled symbols that aren't text at all. You have to tighten the criterion to "does it actually spell a meaningful flag" to uniquely pin down 333.

The final result:

## Flag

```
GAIANSPACE{displ4cement_drift}
```

## Takeaways

1. **When a key constant is described vaguely, enumerate it.** For a deliberately imprecise "around three hundred thirty," rather than overanalyzing the wording, just enumerate nearby integers and filter by "does it decode to a valid result". A baseline is exactly the kind of thing you sweep.
2. **Numbers that look normal don't mean they're the data's actual intent.** The post-drift values look like mundane CO₂ ppm, which is precisely the trap. "Look again" usually means **reinterpret from a different angle** (here, "as character codes minus a baseline").
3. **Your filter criterion has to be precise enough.** "Is it printable" isn't strong enough here (several baselines are all-printable); you must tighten to "does it spell meaningful text" to anchor uniquely.
4. **(Series wrap-up) One "radiation" theme can produce four challenges with completely different solutions.** SEU is brute-forcing a key, SEL is using CRC to find the stuck bit, TID is reconstructing logic, DDD is subtracting drift then shifting perspective. Those are four real space-radiation failure mechanisms (upset, latch-up, ionizing dose, displacement damage), each mapping to its own solving mindset. This chapter was genuinely thoughtfully designed.

----
