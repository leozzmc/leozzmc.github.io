---
title: 牆上的塗鴉是一種外星文字——STARPWN 2026「Strange Holos 1」解題筆記
tags:
  - STARPWN
  - CTF
  - Steganography
  - Image Forensics
  - Cipher
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/e9d90ba/space1-glitter.png
abbrlink: e9d90ba
date: 2026-09-21 21:15:55
top_img:
---

> 這題只給一張圖，什麼提示都沒有，整個解題過程完全不需要寫什麼複雜的程式，就是分析圖片

<!-- more -->

## 題目在講什麼

拿到的東西只有一個檔案：`space1-glitter.png`（1536×1024，2.3 MB）

打開來看會是這樣：

![原圖：賽博龐克風格的夜景巷弄](space1-glitter.png)

> 圖片上看起來是一條賽博龐克風格的夜間巷弄，牆上有一整片霓虹塗鴉，寫著一種看不懂的文字，背景有一些投影廣告看板，風格跟這次CTF 主題 GLITTERCITY 蠻像的，眼尖的話還可以發現後面還有一個「GL177」的霓虹招牌，旁邊是一座尖塔，沒有任何文字說明，flag 顯然就藏在這張圖裡的某個地方

## 第一步: 檢查檔案

拿到一張圖、沒有其他線索時，直覺反應是先檢查檔案本身，結論是這些檢查全部都是乾淨的：

```bash
file space1-glitter.png          # PNG image data, 1536 x 1024, 8-bit/color RGB, non-interlaced
binwalk space1-glitter.png       # 只有 PNG 本身，沒有夾帶其他壓縮檔
strings -n 8 space1-glitter.png  # 只有 C2PA / SSL.com 憑證的雜訊
```

手動走一遍 PNG 的 chunk 結構，確認沒有夾帶自訂資料的區塊：

```python
import struct
data = open("space1-glitter.png", "rb").read()
pos = 8
while pos < len(data):
    length = struct.unpack('>I', data[pos:pos+4])[0]
    ctype  = data[pos+4:pos+8].decode()
    print(ctype, length)
    pos += 8 + length + 4
```
Output:

```
IHDR 13
caBX 29087     <- C2PA 內容溯源資訊
IDAT 2273074
IEND 0
```

唯一一個非標準的 chunk 是 `caBX`，這是 **C2PA**（Content Provenance and Authenticity，內容溯源與真實性標準）的溯源資訊清單，用 `exiftool` 解出來看，內容其實就是字面上的意思，這是一份 AI 生成圖片的認證資訊，不是謎題：

```
Actions Software Agent Name     : gpt-image
Actions Digital Source Type     : .../digitalsourcetype/trainedAlgorithmicMedia
Claim Generator Info Name       : OpenAI Media Service API
```

就代表這張圖是用圖片生成模型做出來的，`caBX` 只是這個生成過程的簽章鏈（SSL.com 憑證、OCSP 回應、時間戳記），**然後這裡面沒有藏任何東西**，知道這個資訊後就可以省下把一堆憑證資料拿去 base64 解碼瞎猜的時間

再來測 **LSB（最低有效位）隱寫**，同樣一無所獲，LSB 平面看起來就是純粹的感光元件雜訊，1 的比例完全不接近可疑的 0.5：

```python
import numpy as np
from PIL import Image
arr = np.array(Image.open("space1-glitter.png").convert("RGB"))
for ch, name in zip(range(3), "RGB"):
    print(name, (arr[:, :, ch] & 1).mean())
# R 0.4532  G 0.4466  B 0.4834
```

因為圖片本身有很重的色差故障感，也試著把 R/G/B 三個色版分開看，猜測會不會其中一個色版藏著乾淨的文字暗號，但結果也是空的， **三個色版顯示的字形完全一樣**，只是彼此之間有幾個像素的偏移，那個色差感只是一種Cyberpunk美術風格效果，並不是不是什麼三層式密碼

> **所以目前結論是，flag 就在畫面本身，用眼睛讀出來的，** 中間那片塗鴉詭異文字就是解謎的內容


![塗鴉放大圖](graffiti_zoom.png)

肉眼觀察可以發現：

- 第 2、6、9 個字元形狀一模一樣（一個 `V` 加一條直槓、頂端有個襯線裝飾）
- 第 3、7、10 個字元形狀一模一樣（一個加粗的 `7`）

也就是說整體結構是 `? A B C | D A B ? A B`
一個 4 字母單字跟一個 6 字母單字，在固定位置共用重複字母。

## 第二步：走錯的方向——銀河標準字母

看到CTF 裡出現外星風格的角形符號，直覺反應通常會先想到 **Standard Galactic Alphabet**（SGA，銀河標準字母，就是《Commander Keen》跟 Minecraft 附魔台上那套符號系統）——這是 CTF 裡最常被拿來當替代字母的字型，沒有之一

這邊直接把官方對照表抓下來核對：

```bash
curl -sL -A "Mozilla/5.0" -o sga.gif https://www.omniglot.com/images/writing/sga.gif
```

![SGA 銀河標準字母對照表](sga_chart.png)

**阿結果SGA 完全不對，而且差得很遠。** 真正的 SGA 字符是由點、短鉤跟直角構成的（`a` 是一個鉤子、`f` 是一橫上面三個點、`i` 是被分成兩段的直線、`w` 是三個點）這邊26 個字母裡沒有一個長得像三橫的 `Ξ`、一個 `7`，或是 `V` 加一條槓的，所以這的方向不是對的


## 第三步：真正的答案：Aurebesh

同一個 Omniglot 的虛構文字索引，也收錄了 **Aurebesh** 它是《星際大戰》的銀河標準文字，Aurebesh 的字符是硬邊、方塊狀，由橫槓跟斜線構成，跟牆上文字的視覺風格完全一致

```bash
curl -sL -A "Mozilla/5.0" -o aurebesh.gif https://www.omniglot.com/images/writing/aurekbesh.gif
```

![Aurebesh 字符對照表](aurebesh.png)

牆上的 10 個字元，每一個都能在 Aurebesh 裡找到對應的字母。直接做一張並排比對圖，上排是牆上截出來的字，下排是從 Omniglot 對照表裁出來的對應字符：

![並排比對圖](aurebesh_match.png)

| # | 牆上字元 | Aurebesh 名稱 | 對應字母 |
|---|------|---------------|--------|
| 1  | 鉤子 + 尖峰      | **nern** | N |
| 2  | `V` + 直槓            | **esk**  | E |
| 3  | 加粗 `7`             | **resh** | R |
| 4  | 十字 + 曲線     | **forn** | F |
| 5  | 三橫 `Ξ`        | **herf** | H |
| 6  | `V` + 直槓            | **esk**  | E |
| 7  | 加粗 `7`             | **resh** | R |
| 8  | 帶缺口的 `Ǝ`      | **dorn** | D |
| 9  | `V` + 直槓            | **esk**  | E |
| 10 | 加粗 `7`             | **resh** | R |

```
N E R F   H E R D E R
```

前面注意到的重複字元結構也獨立驗證了這個答案：第 2/6/9 個字元是 `esk`(E)，第 3/7/10 個字元是 `resh`(R)，這正好完全吻合 `NERF` / `HERDER` 這兩個單字的字母重複位置，算是找到正解了!

## nerf herder不只是一個看起來合理的答案

三個獨立的線索互相印證：

- **「Strange Holos」**: holos 就是全息投影（hologram），圖裡的招牌正好就是一個全息廣告看板，全息投影是《星際大戰》裡標誌性的通訊媒介（莉亞公主的求救訊息）。題目本身的名字就是指向星戰文字的分類提示。
- **Aurebesh 正是《星際大戰》的官方文字**，文字系統跟主題完全吻合。
- **「nerf herder」是全系列最知名的台詞之一**——莉亞公主在《帝國大反擊》裡罵韓・索羅：「……你這個自大、遲鈍、邋遢的 nerf herder!」（nerf 是星戰世界裡的一種家畜）這正是那種會被出題者選來當解碼外星文字謎底的經典台詞

## Flag

解碼出來的文字直接照抄，這邊需要用用空格分隔，而不是底線：

```
STARPWN{nerf herder}
```

一開始送 `STARPWN{nerf_herder}` 被拒絕了，但其實這場 CTF 的 flag 格式其實不統一，當解碼出來的內容是一句自然語言的短語時，先試試看原本的空格分隔方式，不要預設一定要轉成 snake_case


## 附錄：踩過的死路

| 想法 | 結果 |
|---|---|
| 檔案後面夾帶額外資料 | `binwalk` 乾淨，PNG 在 `IEND` 就結束了 |
| 自訂 PNG chunk | 只有 `caBX` = C2PA 溯源資訊（AI 生成認證） |
| LSB 隱寫（單色版跟合併） | 只有雜訊，1 的比例落在 0.45–0.48 |
| R/G/B 色版分離找「乾淨文字」 | 三個色版字形完全一樣，只是有偏移 |
| 把塗鴉鏡射或旋轉 180 度 | 不管怎麼轉，形狀都不是拉丁字母 |
| 拿 `GL177` 霓虹招牌當「7 = T」的羅塞塔石碑去解 `GLITTERCITY` | 死路——那是另一個用普通拉丁字型寫的招牌，跟塗鴉的文字系統無關 |
| Standard Galactic Alphabet | 對照真正的字表後被推翻 |

---