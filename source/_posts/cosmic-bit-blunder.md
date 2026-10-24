---
title: 單粒子翻轉與 128 把候選金鑰 | Cosmic Bit Blunder | GaianSpace CTF 2026
tags:
  - GaianSpace
  - CTF
  - Crypto
  - AES
  - Radiation
  - Single Event Upset
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/3dc34d2b/gaictf.png
abbrlink: 3dc34d2b
date: 2026-10-23 20:10:00
top_img:
---

> 🌐 English version: [English](/en/posts/3dc34d2b.html)


{% note info %}
這是 GaianSpace CTF 2026「05-rad-hard-rampage」這一章的第一篇

整系列題目的設計非常漂亮，有四道題，每題剛好對應太空輻射對電子元件的四種真實失效機制：單粒子翻轉（SEU）、單粒子閂鎖（SEL）、總游離劑量（TID）、位移損傷（DDD）。我打算一題一篇寫完

{% endnote %}

> 系列其他三篇：〈[單粒子閂鎖 / Lunar Latch-up](/posts/b940e003.html)〉、〈[邏輯閘被燒短路 / Ionized Transistangle](/posts/3ba58d97.html)〉、〈[感測器漂移 / Degradift](/posts/603a4422.html)〉


> 這一篇的背景是，一顆高能質子穿過飛行電腦，剛好把金鑰裡的**一個位元**翻掉了，這在太空領域很常見，高能粒子/輻射容易造成電子元件或者電子訊號中的bit 翻轉或是錯誤


<!-- more -->

## 題目在講什麼

![題目畫面](challenge.jpg)

> High in the Foundation One orbit, a single cosmic-ray proton punched through the flight computer and flipped exactly one bit in the key that protects the mission log. The log still decrypts to garbage. The reliability team wants the log back, and they are sure the rest of the key survived intact.

翻成白話：Foundation One 在軌道高處，一顆宇宙射線質子打穿了飛行電腦，**剛好翻轉了保護任務日誌的金鑰裡的一個位元**。日誌現在解密出來是亂碼。可靠度小組想把日誌救回來，而且他們確信金鑰其餘部分都完好。

值班工程師的反應則是：「整把金鑰都壞了啦，重寫一把新的吧」但題目也提醒，那樣會把日誌一起弄丟（金鑰一換，已經加密好的密文就再也解不開了）


而給的檔案只有兩個：

- `cipher.bin`：32 位元組，加密的任務日誌（AES，單一區塊方案）
- `corrupted.key`：16 位元組，被打壞後的 128 位元金鑰

> Flag 格式 `GAIANSPACE{...}`

## 先搞清楚「單粒子翻轉」到底改了什麼

**Single Event Upset（SEU，單粒子翻轉）** 是太空電子最經典的輻射效應：一顆高能粒子穿過記憶體單元，在那個瞬間把儲存的電荷打翻，讓**一個位元從 0 變 1 或從 1 變 0**，這種錯誤雖然資料被改了，但電路本身沒壞，只要重寫就會恢復

然後這題來說，目前關鍵的推論是，**既然只錯了一個位元，正確金鑰只有 128 種可能。**

因為一把 128 位元的金鑰，就只有 128 個位元位置。正確的那把金鑰，一定是把 `corrupted.key` 的**某一個位元翻回來**，那這個搜尋空間小到可以直接暴力窮舉解看看，也正好對應題目那個很直白的提示 Try them all

## 逐一翻回來，看哪個解出人話

題目說是AES，單一區塊方案」，也就是不需要 IV 的 ECB 模式，做法很直接：對 128 個候選金鑰，每一個都把某一位元翻回去，拿去 AES-128-ECB 解密 `cipher.bin`，然後數數看解出來的位元組有幾個是可的 ASCII 字元

```python
import subprocess
key = open('corrupted.key','rb').read()

results = []
for i in range(128):
    k = bytearray(key)
    k[i // 8] ^= (1 << (i % 8))          # 把第 i 個位元翻回來
    out = subprocess.run(
        ["openssl","enc","-d","-aes-128-ecb","-K",bytes(k).hex(),
         "-nopad","-in","cipher.bin"],
        capture_output=True).stdout
    printable = sum(32 <= c < 127 for c in out)
    results.append((printable, i, bytes(k), out))

results.sort(reverse=True)
```

128 個候選裡，127 個解出來都是隨機雜訊（可印字元數在 5～19 之間飄），只有**翻轉第 50 個位元**（第 6 個位元組、第 2 個位元，`d2 → d6`）解出整整 30 個連續可印字元，一枝獨秀地跳出雜訊：

![128 種單位元翻轉的候選，各自解密後的可印字元數。只有第 50 位元（紅色）解出乾淨文字，其餘都淹在雜訊裡](bitflip-scan.png)

為什麼這個訊號會這麼乾淨好認？因為 AES 有**雪崩效應**：只要金鑰對，整個區塊都會變回正確明文，而只要金鑰錯一個位元，整個區塊就會面目全非

所以根本不需要知道旗標長什麼樣子，光用可印字元數量當指標就能把正確答案挑出來

## 解出的內容

用修好的金鑰解密，得到：

```
GAIANSPACE{s1ngle_event_upset}\x02\x02
```

結尾那個 `\x02\x02` 是 PKCS#7 填充（填充長度 2）。去掉之後正好是 30 個字元的旗標，加上 2 位元組填充剛好 32 位元組，跟密文長度完全吻合，這其實算是是第二層驗證，有正確的金鑰才會解出合法的 PKCS#7 Padding，等同於再一次確認第 50 位元就是被翻掉的那一個

## Flag

```
GAIANSPACE{s1ngle_event_upset}
```

## 心得

1. **題目的物理限制直接決定了解法。** 「只錯一個位元」把「整把金鑰重猜」（$2^{128}$，不可能）壓縮成「128 種」（一秒跑完）。讀題時先把條件換算成搜尋空間大小，再決定要不要寫爆破程式——很多看起來很硬的密碼題，其實只是個很小的窮舉。
2. **AES 的雪崩效應讓篩選變得超可靠。** 金鑰對就整塊正確、金鑰錯就整塊亂碼，中間沒有灰色地帶。所以「可印字元數」這種粗糙的指標就足以唯一地挑出答案，不需要先知道明文的任何內容。
3. **PKCS#7 填充是免費的二次驗證。** 解密後末尾剛好是合法的填充樣式，幾乎可以百分之百確定選對了金鑰。遇到 block cipher 的題目，解完記得看一眼填充對不對。

---
