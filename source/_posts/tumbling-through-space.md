---
title: 一顆失控翻滾的衛星，跟一個被浮點數誤差擋下來的答案——STARPWN 2026「Tumbling Through Space」解題筆記
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
abbrlink: 7f658d39
date: 2026-09-21 21:11:56
top_img:
cover:
---

> 🌐 English version: [English](/en/posts/7f658d39.html)


> 這題跟〈[Time to Intercept](/posts/114d2ca.html)〉一樣是互動式的軌道力學計算題，用 `nc` 連上去跟伺服器對話。不一樣的地方是，這題伺服器幾乎把公式直接寫在提示裡給你了，真正卡關的反而是一個很無聊、但每個工程師都遇過的東西：浮點數精度

<!-- more -->

## 題目在講什麼

> Our friends are having difficulties with one of their satellites. It appears it has been struck by space debris and is now tumbling out of control. This is where you come in. The Attitude Determination and Control System (ADCS) is still online, but the automated detumbling sequence has failed. You will have to compute the correct control torques manually.

翻成白話：一顆衛星被太空垃圾撞到，開始不受控制地翻滾。它的 **ADCS**（Attitude Determination and Control System，姿態決定與控制系統，負責感知並控制衛星朝向的子系統）還活著，但自動「去自旋」（detumbling，讓翻滾中的物體停止轉動）的程式壞了，需要手動算出正確的控制力矩才能讓它穩定下來。

連上伺服器後，會告訴你衛星的**轉動慣量**（moments of inertia，Ixx、Iyy、Izz，簡單理解成物體對旋轉的「慣性大小」，跟質量在三個軸向上的分佈有關）跟目前的**角速度**（ωx、ωy、ωz，衛星正在繞三個軸轉動的快慢）。要送回四個數字：

```
Tx  Ty  Tz  duration
```

`Tx/Ty/Tz` 是三軸的控制力矩（單位 N·m），`duration` 是點火秒數（0 到 100 秒之間）。力矩向量的**大小**（magnitude，不是個別軸的數值）上限是 1.0 N·m。當角速度大小 `|ω|` 掉到 0.01 rad/s 以下就算成功，每條連線有 5 次機會。

## 伺服器幾乎把答案寫在提示裡

連上去看到的畫面：

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

伺服器已經幫你把**角動量**（angular momentum，`L = I * ω`，可以理解成「轉動版的動量」，慣量乘上角速度）算好印出來了，提示三更是直接把控制律寫出來：`T = -L / t`。這題完全不需要自己推導動力學方程式，唯一要做的功課是：怎麼在「力矩大小不能超過 1.0 N·m」這個限制下，選出正確的點火時間 `t`

## 背後的物理：一次點火抵銷全部角動量

對一個轉動慣量是對角矩陣（也就是 Ixx、Iyy、Izz 三個軸互相獨立、沒有耦合）的物體，角動量就是：

```
L = (Ixx·ωx, Iyy·ωy, Izz·ωz)
```

施加固定力矩 `T` 維持時間 `t`，會從角動量裡扣掉一個衝量 `T·t`。

所以需要要一次點火就把角動量完全歸零：

```
T · t = -L   =>   T = -L / t
```

唯一的限制是**力矩向量的大小**（不是個別軸的絕對值），也就是 `|T| ≤ 1.0 N·m`。想要用一次點火、盡量短的燃燒時間解決（燃燒時間越短，衛星實際動力學跟這個簡化的線性模型之間可能產生的誤差視窗也越小），最理想的做法是直接用滿力矩上限去燒，反推需要燒多久才能剛好抵銷 `L`：

```
|T| = |L| / t = 1.0   =>   t = |L|
T = -L / |L|          （也就是 -L 正規化成單位向量，再乘上 1.0 N*m）
```

## 算出數字

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

## 第一次嘗試：被浮點數誤差擋下來

```
> -0.710273 0.480622 0.514310 7.848893
ERROR: Torque magnitude exceeds thruster capability (max 1.0 N*m)
```

理論上這個力矩向量的大小*剛好*等於 1.0，但實際送出去的是四捨五入到小數點後六位的近似值——拿這幾個四捨五入後的數字重新算一次 `sqrt(Tx²+Ty²+Tz²)`，會落在剛好超過 1.0 一點點的地方（大概是 `1.000000008` 這種程度）,而伺服器的檢查條件是 `≤ 1.0`,於是被reject

**伺服器檢查的是你實際送出去的那幾個字面數字** ，所以設計數值解的時候，不用一定要精準地卡在一個上限邊界上，該留一點餘裕

## 第二次嘗試：留一點安全餘裕

把整組解稍微往下縮一個小係數(0.999),讓力矩大小明顯低於上限,同時把燃燒時間放大同樣的倍數,維持衝量(也就是抵銷效果)不變:

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

`|ω|` 從一開始的 `0.527145` 掉到 `0.003808`，遠低於 `0.01` 的判定門檻，這也證明了這個「忽略陀螺耦合項的線性模型」在這個燒的時間長度內，精準度已經完全夠用

## Flag

```
STARPWN{d3tumbl3_m4st3r_sp4c3_0p5}
```

## 心得

1. **提示不是裝飾，是可以直接照抄的公式。** 伺服器直接把控制律 `T = -L/t` 印出來，這題完全不需要自己推導控制理論，只需要正確的算術跟單位處理。
2. **「大小上限 1.0」指的是向量大小，不是個別軸。** 把 `-L` 正規化成單位向量、乘上最大允許力矩，再用 `duration = |L|` 一次抵銷，是最自然的解法。
3. **牽涉到浮點數運算時，永遠不要精準地卡在一個硬性上限上。** 一個理論上大小剛好是 1.0 的向量，格式化成小數點後六位再重新解析回來，完全可能算出 `1.000000008` 這種超標一點點的結果。送出去之前先乘上一個小的安全係數（例如 `0.999`），就能避免白白浪費一次嘗試機會——尤其這題一條連線只有 5 次機會，這點餘裕成本很低。
4. **5 次機會對一個會收斂的線性模型來說很寬裕。** 就算沒有算到完美精度，第一次點火通常就能讓 `|ω|` 掉到接近門檻附近；第二次修正燒（這題的情況甚至只是同一個解加上安全餘裕重試）就足以跨過 `0.01 rad/s` 的門檻。

---