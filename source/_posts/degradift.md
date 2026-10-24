---
title: 感測器漂移藏著一句話 | Degradift | GaianSpace CTF 2026
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
abbrlink: 603a4422
date: 2026-10-23 20:40:00
top_img:
---

> 🌐 English version: [English](/en/posts/603a4422.html)


{% note info %}
GaianSpace CTF 2026「05-rad-hard-rampage」系列最後一篇
{% endnote %}

> 這一章四種輻射故障，前三篇分別是單粒子翻轉（[SEU](/posts/3dc34d2b.html)）、單粒子閂鎖（[SEL](/posts/b940e003.html)）、總游離劑量（[TID](/posts/3ba58d97.html)）

> 這篇收尾的是第四種：**位移損傷（DDD）**，不是某一下高能粒子撞到，也不是把電路燒壞，而是晶格一次次被撞歪，讀數慢慢爬、慢慢偏

> 而且這題有個小轉折：還原出來的數字，看起來明明是合理的 CO2 讀數，但它們其實根本不是 CO2。

<!-- more -->

## 題目在講什麼

![題目畫面](challenge.jpg)

> Displacement damage builds up: the lattice takes hit after hit, the readings creep, and by the end of the run the numbers have wandered far from the truth. We logged the whole decline. The characterization team worked out exactly how fast it drifts.

翻成白話：Foundation One 的 CO2 感測器不是一天內壞掉的。**位移損傷是累積的：晶格一次次被撞，讀數慢慢爬升**，到任務結束時數字已經離真實值很遠了。我們記錄了整段衰退，鑑定小組也算出了準確的漂移速度。

把漂移從每筆讀數裡扣掉，剩下的就是感測器當時真正看到的東西。值班人員會跟你說，還原出來的只是比較乾淨的 CO2 讀數，**再看一次，它們不是 CO2**

給的檔案：

- `sensor_log.csv`：樣本序號與劣化後的讀數（30 筆）
- `ddd_characterization.md`：量測出的漂移模型

模型本身直接寫在檔案裡：

```
drift(n) = round( 1.7 * n + 0.013 * n^2 )     [ppm], n = sample index
```

`檔案上的讀數 = 實際飛行值 + 這個漂移`

另外記錄器有一個固定的 CO2 基準值，氣體團隊只肯說「大概三百三十 ppm 左右」，不肯講得更精確

## 先把漂移扣掉

對應提示 Creep, not jump

**Displacement Damage Dose（DDD，位移損傷劑量）** 是又一種不同的輻射效應，高能粒子直接把半導體晶格裡的原子**撞離原位**，製造出永久的晶格缺陷，這些缺陷會慢慢改變感測器的響應，表現出來就是讀數隨時間緩慢爬升，所以會是是累積漂移，不是一次性的跳變，這也是題目強調「creep, not jump」的原因

而且這個漂移是二次式（`0.013 * n^2`），所以愈後面漂得愈快

扣除很單純：

```python
def drift(n): return round(1.7 * n + 0.013 * n * n)
as_flown = [reading - drift(n) for n, reading in rows]
```

扣完得到的實際飛行值 介於 385～458 之間——看起來仍然像合理的 CO2 ppm 數字，

> 但這就是題目說的「值班人員會告訴你這只是比較乾淨的讀數」的陷阱

## 再看一次，它們不是 CO2

對應第二個提示「Not parts per million」。

題目說基準值大概三百三十，**刻意不給精確數字**，那如果這些數字其實是**字元碼**（實際飛行值 = 基準值 + ASCII 碼）呢？

那基準值就是待解的參數。對 300～360 之間每個候選基準值，把「實際飛行值 − 基準值」當 ASCII 解碼，看哪個基準值能讓 30 個位元組全部落在可印範圍、而且剛好拼出 `GAIANSPACE{...}`：

```python
for base in range(300, 360):
    vals = [x - base for x in as_flown]
    if all(32 <= v < 127 for v in vals):
        print(base, bytes(vals).decode())
```

左圖是扣除漂移前後的曲線（藍線爬升趨勢明顯，橘線被拉平但數字依然平凡），右圖是基準值掃描——**333 ppm 是唯一一個能拼出旗標的基準值**：

![左：扣掉二次漂移，讀數從爬升變平；右：掃描「大概三百三十」的基準值，只有 333 ppm 拼得出 GAIANSPACE{...}](drift-and-baseline.png)

這裡有個小細節：附近的基準值（332、334…）其實也能解出「全部可印」的字元，所以**不能只用「是否可印」當篩選條件** 332 解出來是 `HBJBOTQBDF|ejtqm5...` 這種雜亂符號，根本不成文字。必須縮緊到是否真的拼出有意義的flag，才能唯一確定 333。


最後解出來是：


## Flag

```
GAIANSPACE{displ4cement_drift}
```

## 心得

1. **關鍵常數被講得很模糊時，就窮舉它。** 「大概三百三十」這種刻意不精確的描述，與其去深究原文，不如直接窮舉鄰近整數、用「能不能解出合法結果」當篩選——基準值這種東西本來就是拿來掃的。
2. **看起來正常的數字，不代表就是這份資料的本意。** 扣完漂移後的值看起來是平凡的 CO2 ppm，正是題目要提醒的陷阱。「再看一次」通常是指**換個角度重新解讀**（這題是「當成字元碼減去基準值」）。
3. **篩選標準要夠精確。** 「是否可印」在這題不夠力（好幾個基準值都全可印），一定要縮到「是否拼出有意義的文字」才能唯一定錨。
4. **（整個系列的收尾）同一個「輻射」主題，可以設計出四種解法截然不同的題。** SEU 是窮舉金鑰、SEL 是用 CRC 找卡住的位元、TID 是重建邏輯、DDD 是扣漂移再換視角——四種真實的太空輻射失效機制（翻轉、閂鎖、游離劑量、位移損傷）各自對應一種解題思路。這一章的設計真的很用心。

----