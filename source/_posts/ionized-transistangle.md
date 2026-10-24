---
title: 被輻射燒短路的邏輯閘 | Ionized Transistangle | GaianSpace CTF 2026
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
abbrlink: 3ba58d97
date: 2026-10-23 20:30:00
top_img:
---

> 🌐 English version: [English](/en/posts/3ba58d97.html)


{% note info %}
 GaianSpace CTF 2026「05-rad-hard-rampage」系列第三篇。
{% endnote %}


> 前兩篇（[SEU](/posts/3dc34d2b.html)、[SEL](/posts/b940e003.html)）都是**單粒子事件**，都是一顆粒子、一個位元、一瞬間發生的事情，而這一篇換成**累積效應**，不是某一下，而是幾個月的輻射劑量慢慢把電晶體搞壞。這題的故障模型也從資料被更改變成邏輯本身壞掉，所以解法跟著完全不同


> 系列其他篇：〈[感測器漂移 / Degradift](/posts/603a4422.html)〉

<!-- more -->

## 題目在講什麼

![題目畫面](challenge.jpg)

> Total ionizing dose does not flip a bit and move on — it leaves transistors shorted, stuck, permanently. The encoder now spits nonsense. We still have the original design, gate for gate, with the damaged nodes marked.

翻成白話：累積好幾個月的輻射劑量終於讓 Foundation One 的狀態編碼器出事了，**總游離劑量（TID）不是翻一個位元就沒事，它會把電晶體永久燒短路、卡死。** 編碼器現在吐出來的是垃圾。我們還留著原始設計，一個閘一個閘都在，損壞的節點也標出來了。

編碼器會把一串探針字組轉成一行狀態字，而在板子上量到的是垃圾，因為有幾個閘被短路了，不管輸入是什麼，輸出都卡死。

也就是說，會需要要重建編碼器**本來該做的事**，把探針字組跑過「設計時」的邏輯，狀態行就會回來

給的檔案是一份閘級網表 `status_encoder.netlist`，短路的閘有標記，探針字組列在最後

> Flag 格式 `GAIANSPACE{...}`。

## 讀懂網表

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

8 個輸入、8 個輸出，全部是 `XOR` 鏈加上 `NOT`。其中 `n6`、`n15` 兩個節點被標成 `[SHORTED=0]`、`[SHORTED=1]`

> 這就是題目說的「電晶體被燒短路、輸出永久卡死在某個值，不管輸入是什麼」

## 短路值是謊言，要用設計值

這是整題的轉折，對應提示 A short is a lie

**Total Ionizing Dose（TID，總游離劑量）** 是另一種完全不同的輻射效應，它不是某一顆粒子的瞬間事件，而是長期累積的電荷陷在氧化層裡，慢慢讓電晶體的臨界電壓漂移、漏電，到最後一些閘就「黏」在某個固定輸出、再也不隨輸入改變了

所以板子上現在量到的，是**損壞後**那兩個被卡死的值——那是故障的結果，不是設計本意。`[SHORTED=0]`／`[SHORTED=1]` 只是在記錄 **它現在壞成什麼樣子**，所以重建時要**完全忽略**這個標記，`n6`、`n15` 一樣照原本的邏輯算（`n6 = i0 XOR i1`、`n15 = i1 XOR i3`），跟其他正常的 Gate 沒有兩樣

## 把探針字組餵進「設計版」邏輯

網表的註解寫明：每個Probe Byte 的 Bit對應 `i7..i0`（位元 0 → `i0`，位元 7 → `i7`）

把 32 個 Probe，依序餵進設計版的邏輯（忽略短路標記），算出每組 `o0..o7`，再組回一個位元組。

為了同時看清楚短路造成的差異，我把「照故障跑」跟「照設計跑」兩種都模擬了一次：

```python
def run(byte, damaged):
    v = {inputs[k]: (byte >> k) & 1 for k in range(8)}
    for lhs, op, a, b, shorted in gates:
        if damaged and shorted is not None:
            v[lhs] = shorted            # 卡死，忽略它的輸入
        elif op == 'NOT':
            v[lhs] = 1 ^ v[a]
        else:
            v[lhs] = v[a] ^ v[b]        # 設計值，不採用 SHORTED 標記
    return sum(v[outputs[k]] << k for k in range(8))

damaged  = bytes(run(int(p,16), True)  for p in probes)
designed = bytes(run(int(p,16), False) for p in probes)
```

兩種輸出放在一起看，結論一目了然：

![照故障邏輯跑出來是垃圾（上，灰字）；忽略 SHORTED 標記、照設計邏輯跑，狀態行就回來了（下，綠字）](designed-vs-damaged.png)

有趣的是，損壞的開頭幾個字元因為巧合還看得出 `GE`、`ENSPE` 的影子（應該是有些輸出位元剛好沒受那兩個卡死的閘影響），但整體完全不成文字，只有 完全照設計版（兩個閘都當正常 XOR）跑過，32 個 Probe 才對應出完整乾淨的Flag

## Flag

```
GAIANSPACE{t0tal_1onizing_d0se}
```

## 心得

1. **「卡死」和「翻轉」是兩種完全不同的故障模型。** 翻轉（SEU）只改一個值，窮舉找回來就好（見[第一篇](/posts/3dc34d2b.html)）；卡死（TID）會讓受影響的閘對所有輸入都回同一個值，而且會往下游擴散。解法不是去猜「正確值是多少」，而是**直接重建設計時的邏輯**。
2. **題目明說那個標記是「壞掉的樣子」，就別被它牽著走。** `[SHORTED=...]` 的值是用來描述故障的，不是拿來用的；把它當成該忽略的雜訊即可。這題真正的工作量其實在「把網表正確轉成模擬程式」，邏輯本身很單純。
3. **把「照故障跑」和「照設計跑」都做出來對照，不只驗證理解，也很有畫面。** 一眼就能看到短路對下游訊號的破壞範圍，也順便確認自己的模擬器沒寫錯。

---