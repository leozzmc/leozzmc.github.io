---
title: 日誌裡被改掉的那一行 | Channel Hop | GaianSpace CTF 2026
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
abbrlink: bbd322cb
date: 2026-10-24 20:10:00
top_img:
---

> 🌐 English version: [English](/en/posts/bbd322cb.html)


> 這是 GaianSpace CTF 2026 裡我最喜歡的一條主線的第一篇，因為整個系列的核心技能就是要你去 **自己手刻一個 LoRa 解調器**，然後一路把它養大，從單一參數、到隱式標頭、到都卜勒漂移、最後到跳頻


> 不過這第一篇還沒碰到 IQ 訊號，這篇會先是從**封包層**熱身，下一篇〈[True Color Is a Lie](/posts/f90bdeae.html)〉才會真正開始解 IQ

> 系列其他篇：[Isodata Seven](/posts/907c1e5f.html)、[Subsidy Claim](/posts/1279e916.html)、[Two Voices](/posts/ec3d267b.html)、[No Name on the Door](/posts/7a436e8c.html)、[Hopscotch](/posts/9633ca0c.html)

<!-- more -->

## 題目在講什麼

![題目畫面](challenge.jpg)

Babb 的玉米農場每天早上會透過 LoRa 桅杆收到 GaianSpace AgriLink 的衛星圖塊（tile），而這天拖拉機卻顯示 `map integrity: unverified`，拒絕使用這張圖，求助於Support 但對方說要有圖塊的 delivery stamp（交付印記）才肯開單處理，但農民在平板上怎麼找都找不到，而桅杆保留了一份當次接收的日誌

目標：找出 delivery stamp

給的檔案是 `mast_rx_0540.log`（接收日誌，641 行十六進位封包）和 `agrilink_welcome.txt`（註冊歡迎信，「有些內容已過時」）

Flag 格式 `GAIANSPACE{...}`

## 先讀日誌，拼出圖塊

日誌的第一個封包解出來是一段文字 metadata：

```
tile=0704 site=BABB-N date=2025-07-04 src=S2 L2A gsd=10m px=128x128 ch=B02,B03,B04,B08,B11 scale=refl*400
```

這告訴我們一切：

- 資料來自 Sentinel-2，128×128 像素、10 公尺解析度
- 而且有 **5 個頻道**
  - B02（藍
  - B03（綠）
  - B04（紅）
  - B08（近紅外線）
  - B11（短波紅外線）
- 但歡迎信裡只說有 4 個頻道（藍綠紅 + 近紅外線），少講了一個

後面的封包格式是 `AL 02 04 07 'D' <頻道 0–4> <列號 0–127> <128 位元組像素>`

5 個頻道 × 128 列 = 640 個資料封包，加上一個結尾封包，把這些填回 5 張 128×128 的灰階圖，就還原出整個圖塊

用藍綠紅（B04/B03/B02）合成真彩色，就是農民在平板上看到的畫面，圖當中有圓形灌溉區、道路、太陽能板，看起來一切正常，沒有任何印記：

![真彩色合成（B04/B03/B02），也就是平板看到的畫面，看不到印記](true-color.png)

## 印記藏在平板不顯示的頻道裡

平板只用藍綠紅合成真彩色，所以如果印記藏在**別的頻道**，農民當然看不到。我對每個頻道各做一次高通濾波（減去高斯模糊、放大對比），把亮度上的微小變化放大出來：

```python
hp = a - gaussian_filter(a, 1.5)
v  = clip(128 + hp * 6, 0, 255)
```

五個頻道的高通圖並排，答案立刻浮現

只有 **B08（近紅外線）** 那一格，農田上寫著三行字：

![五個頻道的高通圖（依序 B02、B03、B04、B08、B11），只有第四格 B08 有文字](five-channels-highpass.png)

原圖的亮度差異很小、肉眼完全看不出來，而且真彩色合成根本沒用到 B08，因此這就是平板上看不到的真正原因，因為印記被寫進了一個平板不顯示的頻道


## Flag

```
GAIANSPACE{AL-STAMP-Q9VRR9}
```

## 心得

1. **遇到「看不見」的東西，先列出有哪些資料沒被顯示。** 這題的突破口是 metadata 寫了 5 個頻道、歡迎信只說 4 個、而平板只用 3 個——印記就藏在那個被忽略的頻道裡。
2. **影像隱寫對每個通道各做一次高通或對比拉伸，藏進去的浮水印很容易現形。** 尤其是衛星多光譜影像，各波段的資訊量差很多，別只盯著可見光。
3. **日誌裡的雜訊（丟包、RSSI、SNR）先不要急著追。** 這題我一度去查缺失的封包、RSSI 有沒有規律，結果都是干擾；先把資料本身還原出來、看清楚，比鑽細節有效率。
4. 這題題名 `channel-hop` 指的是「在不同頻道（波段）之間找」，**不是** LoRa 跳頻——真正的跳頻要到系列最後一篇〈[Hopscotch](/posts/9633ca0c.html)〉才會出現。

---