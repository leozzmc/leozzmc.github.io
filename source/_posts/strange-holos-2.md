---
title: 牆上寫克林貢文，但卡在羅馬拼音——STARPWN 2026「Strange Holos 2」解題筆記
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
cover: /posts/a7cc743e/space2-glitter.png
abbrlink: a7cc743e
date: 2026-09-21 21:17:27
top_img:
---

> 這題是〈[Strange Holos 1](/posts/e9d90ba.html)〉的接續題目，場景、架構完全一樣。這次認出是克林貢文其實不難，真正絆住我的是最後一步——克林貢的**羅馬拼音**，跟它當英文替代密碼時代表的字母，是兩回事。

<!-- more -->

## 題目在講什麼

一樣只給一張圖，`space2-glitter.png`（1536×1024，2.4 MB），沒有其他任何線索：

![原圖：另一條賽博龐克巷弄](space2-glitter.png)

> 場景設定跟第一集一樣：Cyberpunk 巷弄，牆上一整片奇形怪狀的霓虹塗鴉、背景有「GLITTERCITY」「FORTUNE」跟一塊寫著「ホテル」（日文「飯店」）的招牌
> 但**這次的文字系統完全不一樣**，這次是流動、像刀鋒一樣的曲線，帶著鉤子跟尖角

## 檔案層級檢查

```
pngcheck space2-glitter.png
  chunk IHDR at offset 0x0000c, length 13
  chunk caBX at offset 0x00025, length 29087    <- C2PA 溯源資訊
  chunk IDAT at offset 0x071d0, length 2490933
  chunk IEND at offset 0x267411, length 0
No errors detected (4 chunks, 46.6% compression).
```

`binwalk` 沒找到夾帶的資料，`pcrt` 的 CRC 全部正確，`zsteg` 跑出來的只是一般照片型圖片都會有的位元平面雜訊。唯一的非標準 chunk 一樣是 **C2PA** 溯源資訊（`gpt-image` / OpenAI 生成認證加上 SSL.com 的簽章鏈），跟第一集已經確認過的結論相同——不是酬載。

**結論一樣：flag 在畫面裡，直接看塗鴉。**

這次的字元是流動曲線，一共是 **8 個字元**：

![切出的 8 個字元](s2_glyphs.png)

## 找出這是什麼文字系統

這種流動、帶鉤子跟刀鋒感的筆畫，加上其中一個字元是很乾淨的「工」字形，這些特徵指向 **克林貢文（Klingon pIqaD）**。

從主題上來看也很合理，第一集是《星際大戰》的 Aurebesh，而 "**Strange** Holos" 這個標題本身也在向《星際爭霸戰：奇異新世界》（Star Trek: Strange New Worlds）致意

跟第一集一樣，直接把官方對照表抓下來核對

```bash
curl -sL -A "Mozilla/5.0" -o klingon.gif https://www.omniglot.com/images/writing/klingon.gif
```

![克林貢 pIqaD 字符對照表](klingon_grid.png)

克林貢字母的 `gh` 是個工字形、`y` 是一個帶封閉內圈的碗狀、`o` 是一橫加一個 S 形曲線，這三種形狀在牆上都能明確找到，這樣文字系統就算是確認了

直接肉眼比較，會是 `bodly go` 這個詞：

這其實是配合星際爭霸戰的主題，他們系列開場獨白裡最有名的一句：「to boldly go where no one has gone before」。

- `B O L D L Y` — 第 3、5 個字母都是 **L** 
- `G O` — 第 2 個字母是 **O**，跟 `BOLDLY` 的第 2 個字母吻合 
- 第 7 個字元 = **G**（克林貢文 `gh`，那個工字形
- 第 2、8 個字元 = **O**（克林貢文 `o`）


答案確定之後，完整對應關係就很清楚了：

![並排比對圖](s2_match.png)

| # | 克林貢字母 | 對應英文字母 |
|---|---|---|
| 1 | `b`  | B |
| 2 | `o`  | O |
| 3 | `l`  | L |
| 4 | `D`  | D |
| 5 | `l`  | L |
| 6 | `y`  | Y |
| 7 | `gh` | G |
| 8 | `o`  | O |

## 音譯的陷阱

第一次送出的答案是 **`STARPWN{boldlh gho}`**，但被被拒絕了

這個答案錯誤是因為字元本身讀對了，但寫下來的是**克林貢語的羅馬化拼音**，而不是它代表的英文字母。克林貢語的羅馬拼音裡，`gh`、`ch`、`ng`、`tlh` 這些都是一個字母用兩個以上的字元拼出來的，所以那個工字形符號，用克林貢語的拼音規則寫是 `gh`，但如果被拿來當英文替代密碼使用時，代表的是單一個英文字母 **G** ，所以應該寫成 GO


## Flag

```
STARPWN{boldly go}
```

這邊是小寫、一個空格，跟上一題的 `STARPWN{nerf herder}` 格式一致

## 附錄：踩過的死路

| 想法 | 結果 |
|---|---|
| 額外資料 / 額外 chunk | `binwalk` 乾淨、`pngcheck` 乾淨，只有 `caBX`（C2PA） |
| zsteg 位元平面 | 只有雜訊片段，沒有結構 |
| 當成真的克林貢語短句去讀（`Qapla'`、`nuqneH`、`toDSaH` 等） | 沒有一個符合 6+2 切分、且第 3=5 個字母相同、第 2=8 個字元相同的結構 |
| 直接用克林貢語羅馬拼音當 flag 內容（`boldlh gho`） | 被拒絕，多字元拼音要收斂成單一英文字母 |
