---
title: A Tumbling Satellite and an Answer Blocked by Floating-Point Error | Tumbling Through Space | STARPWN 2026
tags:
  - STARPWN
  - CTF
  - Orbital Mechanics
  - ADCS
  - Space
categories:
  - CTF Writeup
aside: true
toc: true
abbrlink: "7f658d39"
date: 2026-09-21 21:11:56
top_img:
cover:
---

> 🌐 中文版：[繁體中文](/posts/7f658d39.html)
>
> Like [Time to Intercept](/en/posts/114d2ca.html), this is an interactive orbital-mechanics challenge where you talk to a server over `nc`. The difference is that here the server practically writes the formula out for you in the hints. What actually blocked me was something boring that every engineer has run into: floating-point precision.

<!-- more -->

## What the challenge is about

> Our friends are having difficulties with one of their satellites. It appears it has been struck by space debris and is now tumbling out of control. This is where you come in. The Attitude Determination and Control System (ADCS) is still online, but the automated detumbling sequence has failed. You will have to compute the correct control torques manually.

In plain terms: a satellite has been hit by space debris and is tumbling out of control. Its **ADCS** (Attitude Determination and Control System, the subsystem that senses and controls which way the satellite points) is still alive, but the automated detumbling routine (stopping a tumbling object's rotation) is broken, so you need to compute the correct control torques by hand to stabilize it.

After connecting, the server tells you the satellite's **moments of inertia** (Ixx, Iyy, Izz, roughly "how much the object resists rotation," determined by how mass is distributed across the three axes) and its current **angular velocity** (ωx, ωy, ωz, how fast it's spinning about each axis). You send back four numbers:

```
Tx  Ty  Tz  duration
```

`Tx/Ty/Tz` are the three-axis control torques (N·m), and `duration` is the burn time (between 0 and 100 seconds). The torque vector's **magnitude** (not the individual axis values) is capped at 1.0 N·m. Success means driving the angular velocity magnitude `|ω|` below 0.01 rad/s, with 5 attempts per connection.

## The server practically writes the answer in the hints

What you see on connecting:

```
Moment of Inertia (kg*m^2):
  Ixx = 15.598269
  Iyy = 13.194180
  Izz = 15.434869

Angular Velocity (rad/s):
  omega_x = +0.357402
  omega_y = -0.285910
  omega_z = -0.261535
  |omega|  = 0.527145

Angular Momentum (kg*m^2/s):
  Lx = +5.574857
  Ly = -3.772351
  Lz = -4.036764

HINTS:
1. To stop rotation, you need to cancel angular momentum: L = I * omega
2. Torque changes angular momentum: dL/dt = T
3. For detumbling: T = -L / t (where t is application time)
```

The server has already computed and printed the **angular momentum** (`L = I * ω`, essentially "momentum for rotation," inertia times angular velocity), and hint 3 spells the control law out directly as `T = -L / t`. There's no need to derive any dynamics here. The only real work is choosing the burn time `t` under the constraint that torque magnitude cannot exceed 1.0 N·m.

## The physics: cancel all the angular momentum in one burn

For a body whose inertia tensor is diagonal (Ixx, Iyy, Izz independent, with no cross-coupling), the angular momentum is:

```
L = (Ixx·ωx, Iyy·ωy, Izz·ωz)
```

Applying a constant torque `T` for a time `t` subtracts an impulse `T·t` from the angular momentum.

So to zero out the angular momentum in a single burn:

```
T · t = -L   =>   T = -L / t
```

The only constraint is the **torque vector's magnitude** (not each axis's absolute value), so `|T| ≤ 1.0 N·m`. To solve it in one burn with as short a burn as possible (a shorter burn means a smaller window for error between the real dynamics and this simplified linear model), the ideal move is to burn at the full torque limit and back out how long that takes to cancel `L`:

```
|T| = |L| / t = 1.0   =>   t = |L|
T = -L / |L|          (that is, -L normalized to a unit vector, times 1.0 N*m)
```

## Computing the numbers

```python
import math

Lx, Ly, Lz = 5.574857, -3.772351, -4.036764
L_mag = math.sqrt(Lx**2 + Ly**2 + Lz**2)   # 7.848893

Tx = -Lx / L_mag
Ty = -Ly / L_mag
Tz = -Lz / L_mag
duration = L_mag

print(Tx, Ty, Tz, duration)
# -0.710273  0.480622  0.514310  7.848893
```

## First attempt: blocked by floating-point error

```
> -0.710273 0.480622 0.514310 7.848893
ERROR: Torque magnitude exceeds thruster capability (max 1.0 N*m)
```

In theory this torque vector's magnitude is *exactly* 1.0, but what actually gets sent are values rounded to six decimal places. Recomputing `sqrt(Tx²+Ty²+Tz²)` from those rounded numbers lands just barely above 1.0 (something like `1.000000008`), and the server's check is `≤ 1.0`, so it gets rejected.

**The server checks the literal numbers you actually sent**, so when designing a numerical solution, don't sit exactly on a limit boundary. Leave yourself some margin.

## Second attempt: leave a safety margin

Scale the whole solution down by a small factor (0.999) so the torque magnitude is clearly under the cap, and scale the burn time up by the same factor to keep the impulse (and therefore the cancellation) unchanged:

```python
Tx_safe = Tx * 0.999
Ty_safe = Ty * 0.999
Tz_safe = Tz * 0.999
duration_safe = L_mag / 0.999
# -0.709563  0.480141  0.513796  7.856750
```

```
> -0.709563 0.480141 0.513796 7.856750

Applying control torques...

UPDATED TELEMETRY:
Angular Velocity (rad/s):
  omega_x = +0.002581
  omega_y = -0.002065
  omega_z = -0.001889
  |omega|  = 0.003808

SUCCESS! SATELLITE STABILIZED!
Here is your flag: STARPWN{d3tumbl3_m4st3r_sp4c3_0p5}
```

`|ω|` dropped from the original `0.527145` to `0.003808`, far below the `0.01` threshold, which also proves this linear model (ignoring gyroscopic coupling terms) is plenty accurate over a burn of this length.

## Flag

```
STARPWN{d3tumbl3_m4st3r_sp4c3_0p5}
```

## Takeaways

1. **Hints aren't decoration; they can be formulas to copy directly.** The server prints the control law `T = -L/t` outright, so this challenge needs no control theory derivation, only correct arithmetic and unit handling.
2. **A "magnitude cap of 1.0" means the vector magnitude, not individual axes.** Normalizing `-L` to a unit vector, multiplying by the maximum allowed torque, and cancelling in one burn with `duration = |L|` is the most natural solution.
3. **When floating point is involved, never sit exactly on a hard limit.** A vector whose magnitude is theoretically exactly 1.0 can easily come back as `1.000000008` once formatted to six decimals and parsed again. Multiplying by a small safety factor (say `0.999`) before submitting avoids wasting an attempt, which matters when a connection only gives you 5.
4. **Five attempts is generous for a converging linear model.** Even without perfect precision, the first burn usually brings `|ω|` close to the threshold, and a second corrective burn (here, literally the same solution retried with a safety margin) is enough to cross the `0.01 rad/s` line.

---
