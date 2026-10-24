---
title: 深夜被劫持的下行 | Two Voices | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - LoRa
  - SDR
  - Radio
  - DSP
categories:
  - CTF Writeup
aside: true
toc: true
cover: /img/LoRa.png
abbrlink: ec3d267b
date: 2026-10-24 20:50:00
top_img:
---

> 系列第五篇，故事線換到「深夜值班」GaianSpace 任務控制中心的 GAIAN-723 衛星被人劫持。前四篇（農場篇）把 LoRa 解調器練熟了，這三篇（[本篇](/posts/ec3d267b.html)、[No Name on the Door](/posts/7a436e8c.html)、[Hopscotch](/posts/9633ca0c.html)）會讓同一支解調器遇到越來越刁鑽的狀況。

> 這一篇的主題：同一段錄波裡，有兩個參數完全不同的 LoRa 發射源在對話。

> 系列其他篇：[Channel Hop](/posts/bbd322cb.html)、[True Color Is a Lie](/posts/f90bdeae.html)、[Isodata Seven](/posts/907c1e5f.html)、[Subsidy Claim](/posts/1279e916.html)

<!-- more -->

## 題目在講什麼

![題目畫面](challenge.jpg)

夜班當中 GAIAN-723 在 01:12 從遙測終端消失，排程卻說它現在正過頂。值班的 David Aroz 一個人在 SOC，地面站數據機說什麼都沒有，但站台的原始錄波器一直在錄，他把最近 40 秒的頻段拉出來。

瀑布圖不是空的，裡面有**兩個聲音**：一個是 GAIAN-723，另一個不在任何 GaianSpace 頻率計畫上，而且正在跟衛星說話。桌上那張舊頻率表還寫著 433.000 MHz

目標：找出陌生人**第一次呼叫**時，GAIAN-723 回答了什麼。

給的檔案是約 180 MB 的 `.sigmf-data`（2 MS/s、433.55 MHz）和桌上筆記

Flag 格式 `GAIANSPACE{...}`

## 兩個「口音」不一樣的聲音

舊頻率表上的 433.000 MHz 根本不在有信號的位置（筆記本身就說「可能是錯的」）。看瀑布圖和各頻段能量，有兩個發射源，每約 12 秒重複一輪：

![45 秒的瀑布圖，左側是 A（衛星）的封包群，右側橫線是 B 的強脈衝](waterfall.png)

| | A（衛星） | B（陌生人） |
|---|---|---|
| 頻率 | ~433.170 MHz | ~433.920 MHz |
| 調變 | LoRa **SF9、BW125k** | LoRa **SF7、BW250k** |
| 同步字 | 0x12（公開） | 0x34（LoRaWAN） |
| 前導碼 | 12 符號 | 8 符號 |

這就是題目說的不同的口音，因為同步字、SF、頻寬全都不一樣。所以**不能用同一組參數解兩邊**，解調器要能分別對兩種參數跑。放大一輪看，順序是：A 長封包 → B 強脈衝 → A 短封包：

![一輪的時間-頻率圖：A 長封包、B 脈衝、A 短封包](one-cycle.png)

## 解出對話

兩種參數各自跑解調器，所有封包都以奇偶檢查 0 乾淨解出

對話內容（TC = 遙控指令，TM = 遙測回應）：

| 時間 | 誰 | 內容 |
|---|---|---|
| 4.017 s | B | `TC HELLO`（序號 0） |
| **4.224 s** | **A** | **`TM,ACK,0,HELLO,GAIANSPACE{...}`** |
| 15.89 s | B | `TC GET HK`；A 回 housekeeping |
| 28.25 s | B | `TC GET CFG`；A 回 `NAK` |
| 39.08 s | B | `TC SET DLCFG B`；A 回 `OK,DLCFG=B` |

B 是陌生人：先打招呼、查狀態與設定，最後把衛星的下行設定切到 B，這就解釋了為什麼地面站數據機停在舊設定上收不到了。

題目問「陌生人第一次呼叫」時衛星的回答，就是 4.224 s 那一筆 ACK，裡面直接吐出 Flag

## Flag

```
GAIANSPACE{tw0_v01c3s_0B0EFE1A}
```

## 心得

1. **「兩個聲音」就是要比較調變參數。** 這題兩邊的 SF、BW、同步字、前導碼長度全不同，先把所有發射源和時間表建好，再分別解，比逐一試參數有效率。
2. **舊頻率表是錯的——相信錄到的資料，不要相信文件。** 這在 SDR 題裡很常見。
3. **用序號把指令和回應配對。** TC/TM 看起來像協定，`TM,ACK,<序號>,...` 的序號讓「第一次呼叫」的答案能精準定位。
4. 這篇的衛星端用了 SF9、陌生人用 SF7，都還算標準。下一篇〈[No Name on the Door](/posts/7a436e8c.html)〉衛星會切成**沒有標頭、而且每個封包都長得不一樣**，解調器要再進化一次。

---
