---
title: STARPWN 2026 參賽紀錄 - 航太 CTF 初體驗
tags:
  - STARPWN
  - CTF
  - Space Security
  - Drone Security
categories:
  - CTF Writeup
aside: true
toc: true
abbrlink: 5439deff
date: 2026-09-21 15:25:00
top_img:
cover:
---

> 這篇想先記錄一下這次 STARPWN 2026 的整體參賽過程，個別題目的 writeup 我會另外拆開寫～
> 這篇比較像是總覽：這場比賽到底在玩什麼、我遇到了哪些很有意思的題目，以及打完之後留下了什麼

<!-- more -->

## STARPWN 2026 是什麼？

STARPWN 是 DEF CON Aerospace Village 舉辦的航太資安 CTF，它和一般把 Web、Pwn、Crypto、Reverse 分成不同 category 的 CTF 不太一樣，包含了更多航太domain 的場景，像是：

- MAVLink
- ArduPilot
- EEPROM / firmware data
- GPS 與座標資料
- PCAP / telemetry
- 軌道力學
- 影像處理

所以打到後面像是在順便上太空系統與無人機資安的速成課一樣

> 比賽官網： `https://starpwn.ctfd.io/`


## 為什麼我會來打這場比賽？

其實一開始參加 STARPWN 的目的很單純

最近一直想往 Space Systems / Space Security 這個方向探索，但「太空資安」這四個字感覺就非常空泛,台灣感覺也沒什麼人在題, 而且像是 衛星、地面站、通訊協定、飛控、導航、嵌入式系統、軌道力學，每一塊都可以各自變成一整個領域

所以我想知道 **如果真的有人把 Space Security 做成 CTF，到底會出什麼題目？**，而當我打完之後，答案比我原本想像的有趣很多，因為它也並不是把一般資安題目換一張衛星的皮而已。就至少這次有不少題目是真的要求你去理解一些 domain knowledge, 你可能會 reverse binary，但不知道 MAVLink signing, 你可能會寫 Python，但不知道 Hohmann transfer, 你可能看得懂 GPS 座標，但從來沒有想過可以用幾何方法從幾台受干擾的無人機位置去反推干擾源，所以從學校的角度，我覺得這場比賽非常有價值

## 一場邊打邊補課的 CTF

這次碰到不少我原本完全不熟的東西。像是 MAVLink 的 message signing 到底怎麼運作、ArduPilot 會怎麼保存某些資料、GPS interference 可以怎麼定位，以及軌道攔截題裡那些以前只在課本或文章裡看過的公式。在解題過程學到不少新東西，所以想說可以整理成 writeup 記錄一下


## 關於 AI

這屆比賽還有一件滿有 2026 年特色的事情，主辦方允許使用 AI / LLM，但要求背後仍然要有一個真正理解題目的 human。比賽後段也真的有幾支隊伍因為 AI 使用方式不符合規範而被除名 (在官方discord 有看到, 怕)

看到公告之後，我也重新回頭想了一次自己這場是怎麼用 AI 的，有些比較簡單、或本來就在自己熟悉範圍內的題目，我其實自己找得比 AI 快很多, 前幾題 MISC 用AI感覺只是浪費token 所以自己解較快，但是遇到 binary、協定或陌生 domain 時，則會讓 Claude 幫忙分析、寫一些 parser 或 solver，再根據結果去判斷下一步~

啊但是也有一些完全超出我知識範圍的題目，例如影像處理或某些軌道力學計算，當下確實大量依賴 AI 去試不同的方法，但總之目的如果是學習的話，也是學習到很多，這也是我賽後想重新整理 writeup 的另一個原因

## 最終戰績

這次我是 **solo team** 參賽，隊名是 `Normal_Team`

最終排名目前是： **18th place**

計分板上有 339 支取得排名的隊伍，因此大約落在前 5% 左右。

本來比賽中途一度也在 18 名附近，後來因為卡題加上睡覺一度掉到二十幾名；比賽結束後，主辦方清理部分違反 AI policy 的隊伍，最後排名又回到了 18。

![](final_score.png)

對第一次完整打這類 Aerospace CTF 的自己來說，我覺得已經是個滿有趣的結果。

不過比排名更重要的是：現在至少已經知道「Space Security CTF 到底長什麼樣子」了。


## 解題筆記索引

下面幾題是這次我覺得比較有意思，也比較值得留下來的。

先說明一下分類方式：這幾題**不是同一條連續劇情**，每題底下都會標出實際的題目類別，方便對照。大致分成四組：前三題圍繞同一支虛構的 **Prismantir 無人機蜂群**，用類似的故事包裝當作出題背景（彼此獨立計分，也沒有解題順序上的依賴），類別都屬於 **Forensics / 無人機遙測**；接下來兩題是**互動式 TCP 的軌道力學計算題**，玩法相同但跟蜂群沒有故事關聯；再來兩題是同一組**視覺密碼（Forensics）**題目，場景設定一樣但破解的文字系統不同；最後一題是完全獨立的 **Web / Supply Chain** 題，跟太空/無人機主題只有出題背景上的連結。

<!-- 之後可以在每一題底下貼題目截圖 -->

### [One to Rule Them All——從一顆飛控晶片，進到整個無人機蜂群](/posts/77798b75.html)

**類別：** Forensics / 無人機遙測（MAVLink 協定）

從一份無人機 EEPROM dump 裡找出 MAVLink signing key

> 中間還踩到一個很經典的 C struct padding 問題，最後再拿著找到的 key 連進正在運作的無人機系統

而最後 flag 藏的位置也非常樸實，**把檔案系統好好列一次就能看到**


### [Deadly Parade——三台無人機同時失去 GPS，用幾何找到干擾源](/posts/9f8dacd3.html)

**類別：** Forensics / 無人機遙測 / Geolocation

從 PCAP 裡把無人機的 telemetry 抽出來，找到幾台同時受到 GPS interference 的無人機。

> 一開始連續用了兩次看似合理的平均位置，結果都猜錯。最後才發現真正需要的是一個很基本的幾何概念：**三角形外心（circumcenter）。**

這題也算是繞了遠路才找到答案


### [Connect the dots——一台脫隊的無人機，在城市上空用軌跡寫字](/posts/66ec2728.html)

**類別：**  Forensics / 無人機遙測

這題拿到的是一份大約 150 MB 的原始 MAVLink stream。把資料拆開之後，可以看到十台無人機各自的飛行軌跡。

其中有一台明顯脫離整個編隊，如果把它的軌跡單獨畫出來之後，才發現它不是亂飛：

**它正在天空裡寫字！！**

> 這大概也是這次我最喜歡的題目之一


### [Time to Intercept——公式算對了，卻因為複製舊答案連錯四次](/posts/114d2ca.html)

**類別：** Misc / 軌道力學（互動式 TCP 服務）

跟前三題不一樣，這題完全獨立、也沒有 Prismantir 的劇情包裝——單純是一道 Hohmann transfer 軌道攔截計算，需要算 transfer time、mean motion、phase angle，再根據目標衛星的位置決定什麼時候出發。

前面最大的 bug 是 phase angle 的方向搞反。好不容易修完之後重新連線，結果我又很順手地把上一輪產生的舊答案複製進去。這題打的時候腦袋不是很清楚，不斷拿到舊答案重連，重複了大概四次


### [Tumbling Through Space——一顆失控翻滾的衛星，被浮點數誤差擋下來的答案](/posts/7f658d39.html)

**類別：** Misc / 軌道力學（互動式 TCP 服務）

跟 Time to Intercept 同類型，但這題伺服器幾乎把控制律公式直接印在提示裡：`T = -L / t`，物理本身不難。

> 真正卡關的反而是浮點數精度——算出來的力矩向量大小理論上剛好是 1.0，四捨五入之後重新驗證卻超標一點點，第一次提交就這樣被打回票。


### [Strange Holos 1——牆上的塗鴉是一種外星文字](/posts/e9d90ba.html)

**類別：** Misc / Forensics（視覺密碼）

只給一張賽博龐克風格的圖片，什麼提示都沒有。先排除答案藏在檔案裡的可能性，再把牆上的塗鴉切成一個個字元。

一開始猜是銀河標準字母（Standard Galactic Alphabet），把真正的對照表抓下來一比對才發現完全不對。

**真正答案是《星際大戰》的 Aurebesh，解出來是全系列最知名的台詞之一。**


### [Strange Holos 2——這次牆上寫的是克林貢文，但比對分數低得可疑](/posts/a7cc743e.html)

**類別：** Misc / Forensics（視覺密碼）

同一組題目的第二關，換了一套完全不同的文字系統。

把牆上字元拿去跟真正的字型比對，分數低到不能直接信——因為圖片是 AI 生成的，只是風格上近似而已。真正解法是換個問題問：不管這是哪個字母，先看牆上哪些字元彼此長得一樣。


### [Starry Hacks——供應鏈污染一顆衛星的地面控制軟體](/posts/bdb3b555.html)

**類別：** Web / Supply Chain

這題跟其他幾題完全不同類型：拿到一份洩漏的飛控軟體 repo，找出裡面的 dependency confusion（依賴混淆）漏洞，做一個同名但版本號更高的惡意套件，混進正常的建置流程。

> 最後靠的是讓伺服器的錯誤訊息幫忙外洩資料——讓惡意程式主動丟出例外，flag 就跟著錯誤訊息一起被送回來了。


## 最後

這次 STARPWN 對我來說比較像是一張地圖

它讓我第一次比較具體地看到太空資安這籠統名詞拆開之後，到底可能包含哪些東西 ( 雖然感覺目前真的沒人再說太空資安的東西就是了，還沒熱門起來)，有些是我本來就比較熟悉的 networking、binary、protocol那類的，但有些則是以前幾乎沒碰過的，像是飛控系統、導航系統、軌道力學還有一些圖像處理等，我感覺很多題目我現在也還不敢說真的完全懂，以接下來整理這些 writeup，本身也是比賽的一部分

> 至少希望下一次再看到 MAVLink、ADCS、orbital transfer 或奇怪的 telemetry dump 時，不會又完全從零開始