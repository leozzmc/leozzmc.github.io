---
title: 卡在高電位的那一個位元 | Lunar Latch-Up | GaianSpace CTF 2026
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
abbrlink: b940e003
date: 2026-10-23 20:20:00
top_img:
---

{% note info %}
GaianSpace CTF 2026「05-rad-hard-rampage」系列第二篇。
{% endnote %}

上一篇〈[Cosmic Bit Blunder](/posts/3dc34d2b.html)〉講的是單粒子**翻轉**（SEU）一個位元被打翻，0↔1 都有可能，這一篇很像，但故障機制不太一樣，這次是單粒子**閂鎖**（SEL），他的狀況會是一個位元被硬推到高電位、卡住不動，這兩者差別雖然細微，卻足以把搜尋空間再砍一半



> 系列其他篇：〈[邏輯閘被燒短路 / Ionized Transistangle](/posts/3ba58d97.html)〉、〈[感測器漂移 / Degradift](/posts/603a4422.html)〉

<!-- more -->

## 題目在講什麼

![題目畫面](challenge.jpg)

> A single heavy ion hit the Foundation One power-management block and triggered a latch-up — a parasitic path that slams one bit high and holds it there, drawing current until someone cuts the rail. One bit in there is stuck high that should not be.

翻成白話：一顆重離子打中了 Foundation One 的電源管理區塊，觸發了**閂鎖（latch-up）** 也就是一條寄生電流路徑，把某個位元**硬推到高電位並卡在那裡**，一直耗電直到有人切斷電源。

而dump下來的暫存器裡，有一個位元卡在不該有的高電位，但下游所有東西都靠這些暫存器當鑰匙，所以在那個卡住的位元被重置之前，密封的Mission Payload一直打不開

題目給的檔案只有一個 `reg_dump.bin`（84 位元組），以及一份 `recovery_spec.md` 說明它的格式：

| 位移 | 大小 | 欄位 |
|---|---|---|
| 0x00 | 32 | R0..R7，8 個 32 位元暫存器（小端） |
| 0x20 | 4 | 完整性字：這 32 位元組健康狀態的 CRC-32（zlib/ISO，小端） |
| 0x24 | 其餘 | 密封酬載：旗標的 AES-128-ECB 密文（PKCS#7） |

金鑰方案：`key = SHA-256(R0..R7 bytes)[:16]`。

> 題目把怎麼找答案講得很白，用**唯一誠實的方法**找——能讓完整性字重新吻合的那一個位元。


> Flag 格式 `GAIANSPACE{...}`

## 閂鎖只會把位元「推高」，不會「拉低」

這是整題的關鍵，也對應提示 One bit too high

這邊簡單介紹一下 **Single Event Latch-up（SEL，單粒子閂鎖）** 的物理機制，是粒子在 CMOS 結構裡觸發了一條寄生的 PNPN（類似閘流體 SCR）導通路徑，把節點**拉到高電位並自我維持** 它跟上一篇的 SEU 不同的地方在於，SEU 可以 0→1 也可以 1→0，但閂鎖是 slams one bit **high**，它只會把一個本來是 0 的位元卡成 1，**不可能把本來是 1 的位元變成 0**

所以這個方向性直接把搜尋空間再砍一半，出錯的那個位元，受損前一定是 **0**、受損後是 **1**。所以我只需要檢查**目前值為 1** 的那些位元（把它們一個一個清回 0），完全不用碰值為 0 的位元

## 用完整性字當「尋找工具」，而不只是驗證工具

對暫存器裡每一個目前是 1 的位元，試著把它清成 0，重算這 32 位元組的 CRC-32，看是否與檔案裡存的完整性字 `0xa70b003b` 吻合：

```python
import struct, zlib
data = open('reg_dump.bin','rb').read()
regs = bytearray(data[:32])
crc_stored = struct.unpack('<I', data[32:36])[0]

for i in range(256):
    bi, bit = i // 8, i % 8
    if not (regs[bi] >> bit) & 1:
        continue                       # 閂鎖只會把位元推高 → 值為 0 的不可能是元凶
    r = bytearray(regs); r[bi] ^= (1 << bit)
    if zlib.crc32(bytes(r)) == crc_stored:
        print("found bit", i, bytes(r).hex())
```

感覺這就是題目說的唯一誠實的找法，就不是瞎猜哪個位元是可疑的，是直接讓完整性檢查本身告訴你答案

所有目前是 1 的位元裡，**只有一個**清除後 CRC 吻合，也就是第 **37** 個位元（第 4 個位元組，也就是 R1 的最低位元組，`0x20 → 0x00`）：

![逐位元掃描：只檢查目前為 1 的位元（藍），清除其中某一個會讓 CRC 重新吻合（紅）。灰色的位元是 0，不可能是閂鎖造成的](crc-bitscan.png)

`recovery_spec.md` 裡其實還埋了一個干擾訊息：「R7 保留的高半位元組是清除程式常動的地方，但這次事件不是打在那裡，這邊就是題目好心提醒你不要先入為主地盯著 R7 看，真正出錯的是 R1

## 暫存器就是鑰匙

對應第二個提示「The registers are the key」

用修好的 32 位元組算 `SHA-256`、取前 16 位元組當 AES-128 金鑰：

```python
import hashlib, subprocess
repaired = bytes.fromhex("4d3c2b1a00000000efbeadde0df00000bebafeca785634120df0ad0beeffc000")
key = hashlib.sha256(repaired).digest()[:16]
# openssl enc -d -aes-128-ecb -K <key> -in <ciphertext>
```

對密文（48 位元組 = 3 個區塊）做 AES-128-ECB 解密、去掉 PKCS#7 填充，解出乾淨又符合格式的flag，這也就再次驗證第 37 位元就是對的

## Flag

```
GAIANSPACE{s1ngle_event_l4tchup}
```

## 心得

1. **故障的方向性能再砍一半搜尋空間。** SEU 要查 256 個位元（0↔1 都可能）；SEL 只會「推高」，所以只有目前是 1 的位元才是候選。讀懂故障的物理機制，不只是風味，是真的能減少工作量。
2. **CRC 不只是用來「驗證」答案，也可以用來「尋找」答案。** 這題存了一份健康狀態的 CRC，於是「逐一嘗試候選 + 用 CRC 篩選」就成了一個確定性的搜尋演算法，比憑直覺猜哪個欄位壞了可靠太多——這正是題目說的「唯一誠實的找法」。
3. **規格裡「某欄位是常見目標，但這次不是」這種句子，通常是拿來排除誘餌的。** 這題故意把 R7 的保留半位元組講成「清除程式最愛動的地方」，就是要你別一頭栽進去。
4. **把鑰匙綁在被修復的資料本身，等於自帶驗證。** 金鑰是 `SHA-256(暫存器)`，所以修對了就能正確解密、解出合法填充；修錯了就是亂碼。答案對不對，不用送出就知道。

---