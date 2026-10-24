---
title: Right Formula, Wrong Clipboard, Four Failures in a Row | Time to Intercept | STARPWN 2026
tags:
  - STARPWN
  - CTF
  - Orbital Mechanics
  - Hohmann Transfer
  - Space
categories:
  - CTF Writeup
aside: true
toc: true
abbrlink: "114d2ca"
date: 2026-09-21 15:18:31
top_img:
cover:
---

> 🌐 中文版：[繁體中文](/posts/114d2ca.html)
>
> Unlike the earlier drone-swarm posts, this is a pure orbital-mechanics calculation. You connect to an interactive shell with `nc`, the server prints numbers at you in real time, and you have to send two answers back within a limited number of attempts. The content itself is a solid physics problem, but what really stuck with me was reconnecting to a fresh instance later and being dumb enough to paste in the previous round's answer, failing four times in a row.

<!-- more -->

## What the challenge is about

> An unknown aggressor satellite has been detected in a higher orbit and is threatening critical space infrastructure. Your mission: calculate a Hohmann transfer to intercept it.

In plain terms: an enemy satellite has been detected in a higher orbit than ours and is threatening critical space infrastructure. The mission is to compute a **Hohmann transfer** to intercept it. After connecting to the given shell, the screen tells you three things: your own circular orbit's radius and velocity, the target satellite's circular orbit radius and velocity, and your current phase angle (the angular difference between the two satellites around Earth). You must return two numbers:

```
delta_v_burn  wait_time
```

`delta_v_burn` is how much velocity change (Δv, in m/s) to spend on the burn into the transfer orbit; `wait_time` is how many seconds to wait before burning so you and the target arrive at the rendezvous point at the same moment. Tolerances are Δv ±10 m/s and wait time ±60 seconds, with only 5 submission attempts per connection. Get it wrong or drop the connection and you reconnect to a completely fresh random problem.

## Background: what is a Hohmann transfer

A **Hohmann transfer** is the most basic and most fuel-efficient orbital transfer in aerospace engineering. If you're in a low orbit and want to move to a concentric higher orbit, you don't accelerate the whole way up; you just make two burns at the right moments.

The first burn puts you on an elliptical "transfer orbit" whose one end touches your original low orbit and whose other end touches the target's high orbit. The second burn, made when you reach that high end, straightens you out into the new circular orbit.

> If you're interested, this video explains it well: https://youtu.be/KdHI5Fn9Fu8

This challenge only scores the first burn (entering the transfer orbit), so the problem simplifies to: compute how much Δv the first burn costs, and pick the moment to burn so that you and the target meet on time at the far end of the transfer orbit.

It's a fairly standard orbital-mechanics problem with two key parts: **how much velocity change the burn costs**, and **how long to wait before burning**.

## Computing Δv: the standard vis-viva equation

The transfer ellipse's semi-major axis is just the average of your orbital radius and the target's:

```
a_t  = (r1 + r2) / 2
```

Use the **vis-viva equation** (which relates velocity to radius at any point on an elliptical orbit) to get the transfer orbit's velocity at the starting point, your current radius `r1`:

```
v_p  = sqrt(mu * (2/r1 - 1/a_t))
Δv1  = v_p - v1
```

There's a small trick here: don't plug in the textbook Earth value for `mu` (the gravitational parameter, Earth's mass times the gravitational constant) of `398600.4418 km³/s²`. Instead, derive it directly from the circular orbit velocity the challenge itself prints:

```python
mu = v1**2 * r1   # self-consistent gravitational parameter, derived from our own circular orbit velocity, assuming no textbook constant
```

On a circular orbit, gravity supplies exactly the centripetal force, so `v² / r = mu / r²`, and cancelling gives `mu = v² * r`. The Δv computed this way matches the server's correct answer almost exactly (error on the order of 0.001 m/s), with no need to worry about whether the challenge's Earth radius or GM constant matches the textbook definition.

## Computing the wait time: where I actually got stuck

The time to fly half the transfer ellipse (from the start to the rendezvous point) is:

```
t_transfer = π * sqrt(a_t³ / mu)
```

Classical Hohmann rendezvous phasing theory goes like this: suppose you're on the inner, faster orbit (angular rate `n1 = v1/r1`) and the target is on the outer, slower orbit (angular rate `n2 = v2/r2`). For the two to meet at the far end of the transfer ellipse (180 degrees away), the target must lead you by a specific angle at the moment of the burn:

```
φ_required = π − n2 · t_transfer
```

(Intuitively: during the transfer you sweep a full 180 degrees, while the target only advances `n2 · t_transfer`, so the target has to lead by that much for you both to arrive together.)

Now the problem: given the current phase angle `φ0` the challenge prints, how do you derive the wait time from the difference between `φ0` and `φ_required`? The textbook-intuition formula would be:

```
t_wait = [(φ0 − φ_required) mod 2π] / (n1 − n2)
```

**But this formula is wrong.** My first submission of `Δv=160.73, wait_time=16997.80` had the Δv accepted while the wait time was rejected (`Wait time error too large`).

That partial rejection is actually a very precise diagnostic: it means the transfer orbit's own physics (`a_t`, `v_p`, `t_transfer`) is completely fine, and the only problem is the phase angle's direction convention.

Since only the wait time was rejected, the issue has to be in how the challenge's phase angle maps onto `φ0` in the formula, not in the transfer orbital mechanics. Reversing the subtraction order, asking instead **"how much further must φ0 rotate in the other direction to reach φ_required"**, gives the formula that actually matches the server:

```python
t_wait = ((phi_required - phase0) % (2*math.pi)) / (n1 - n2)
```

Full verification:

```python
import math
r1, r2 = 6938.585e3, 7403.771e3
v1, v2 = 7579.269, 7337.300
phase0 = math.radians(212.256)

n1, n2 = v1/r1, v2/r2
mu = v1**2 * r1
a_t = (r1 + r2) / 2
vp = math.sqrt(mu * (2/r1 - 1/a_t))
dv1 = vp - v1
t_transfer = math.pi * math.sqrt(a_t**3 / mu)
phi_required = math.pi - n2 * t_transfer

t_wait = ((phi_required - phase0) % (2*math.pi)) / (n1 - n2)
print(dv1, t_wait)
# 121.934  26901.33   <- the server's own answer: 121.934 m/s / 26901.426 s
```

Submitting `121.935 26900.962`:

```
Submitted delta-v: 121.935 m/s   Required: 121.934 m/s   Error: 0.001 m/s
Submitted wait time: 26900.962 s  Required: 26901.426 s   Error: 0.464 s

INTERCEPT SUCCESS!
STARPWN{h0hm4nn_tr4nsf3r_1nt3rc3pt}
```

> That's the complete solution for the original Time to Intercept.
> The challenge later reopened as a V2: same service, same scoring, just a different port. In theory the formula carries over directly, and it did. What's interesting is what happened next.

## V2: same formula, four failures from a slip of the hand

V2's description, format, and tolerances are identical to V1; the only difference is a fresh set of random parameters. Connecting to the new instance printed:

```
YOUR SATELLITE: DEFENDER-1
  Orbital Radius: 6900.768 km
  Orbital Velocity: 7600.008 m/s

TARGET SATELLITE: AGGRESSOR-X
  Orbital Radius: 7167.955 km
  Orbital Velocity: 7457.017 m/s

CURRENT GEOMETRY:
  Phase Angle: 81.624 degrees
```

The trouble was that just before connecting to this fresh instance, I'd finished another connection (whose parameters were r1=6850.870 km, r2=7534.987 km, phase=199.425°, giving Δv 179.259). On the new connection, my first four submissions only adjusted the wait time while **the Δv stayed at the 179.26 computed on the previous connection**:

```
attempt 1: 179.26  22068.88   -> both wrong
attempt 2: 179.26  17492.12   -> both wrong
attempt 3: 179.26  20347.45   -> both wrong
attempt 4: 179.26  20353.73   -> both wrong
```

Every response was `Delta-v error too large`, which was the server spelling out that the Δv itself needed recomputing, not that the wait time was insufficiently precise. **Each connection's parameters are fixed (all 5 attempts on one connection share the same r1/r2/v1/v2/phase), but parameters are never shared between connections.** Pasting the correctly-computed Δv from the previous connection into a new one gives a familiar-looking number that is already stale.

Recomputing with the new connection's printed parameters:

```python
r1, r2 = 6900.768e3, 7167.955e3
v1, v2 = 7600.008, 7457.017
phase0 = math.radians(81.624)
# same formula applied
# dv1    = 71.829
# t_wait = 81080.728
```

The fifth and final attempt:

```
> 71.829 81080.728

Here is your flag: STARPWN{dont_print_th3_answer_}
```

So this one cost me four attempts purely from lazily reusing the previous round's answer.

## Flag

```
STARPWN{h0hm4nn_tr4nsf3r_1nt3rc3pt}      <- V1
STARPWN{dont_print_th3_answer_}          <- V2
```

## Takeaways

1. **Don't trust textbook constants for the gravitational parameter; derive it from the numbers the challenge gives you.** The relation `mu = v² · r` always holds on a circular orbit, and the `mu` derived from it automatically matches the challenge's internal Earth model, so you never have to guess which Earth radius or GM constant the author used.
2. **A "partially correct" server response is very precise debugging information.** Having only the wait time rejected while the Δv quietly passed confirmed the transfer orbit's physics (semi-major axis, vis-viva, transfer time) was already correct, narrowing the problem precisely to the phase angle's direction convention without re-suspecting the whole algorithm.
3. **Phase-angle sign conventions are the classic trap in rendezvous problems.** Textbook formulas assume a particular measurement direction and reference, so when a challenge hands you a "bare" phase angle without defining it, be ready to try the opposite direction. The two differ by exactly one synodic period, and when one is wrong the natural next step is simply to flip the direction.
4. **A "V2" of the same challenge does not mean the same numbers.** Even with identical code and identical formulas, any service that randomizes per connection makes the previous connection's correct answer stale data in the new one. The server will usually tell you honestly which field is wrong, which is far more reliable than blind guessing, and the right move is to recompute the whole set from the numbers currently on screen rather than tweaking only the number you happen to be staring at.

---
