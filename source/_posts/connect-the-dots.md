---
title: 一台脫隊的無人機，在城市上空用飛行軌跡寫字——STARPWN 2026「Connect the dots」解題筆記
tags:
  - STARPWN
  - CTF
  - MAVLink
  - Drone Forensics
  - GPS Art
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/66ec2728/all_tracks_overview.png
abbrlink: 66ec2728
date: 2026-09-21 15:11:24
top_img:
---

> 這是同一個 Prismantir 無人機蜂群世界觀裡，故事最短、但畫面最有記憶點的一題

> 一份 1.5 億 bytes 的原始遙測資料，解到最後打開一張圖，會看到一台無人機用自己的飛行軌跡在城市上空寫字

<!-- more -->

## 題目在講什麼

> While known for their big eye in the sky, Prismantir huge drone fleet is also a behemoth to keep in control. Every night, each drone patrols its assigned block, following its route with clockwork precision. But tonight, one unit broke the formation. Can you trace where did it go?

翻成白話：Prismantir 那支龐大的無人機機隊，每晚各自巡邏自己被分配到的街區，路線精準得跟時鐘一樣。但今晚有一台脫隊了，這題的任務是找出它到底跑去哪裡。拿到的東西只有一個檔案：`PRISM_S03_B10-30_20260830.raw`，大約 149.7 MB

## 先確認檔案格式

用 `xxd` 看一下header：

```
00000000: fd1d 0000 7a01 01fd 0000 0641 7264 7543  ....z......ArduC
00000010: 6f70 7465 7220 5634 2e36 2e31 2028 3537  opter V4.6.1 (57
00000020: 3539 3163 6238 299c 1cfd 2100 007b 0101  591cb8)...!..{..
```

兩個東西馬上跳出來：明文字串 `ArduCopter V4.6.1`，這是 ArduPilot 無人機韌體的版本字串

還有每一筆紀錄都以 `0xFD` 開頭，這正是 **MAVLink v2** 的 frame start marker

手動照著 MAVLink v2 header 格式拆第一筆封包，完全吻合：payload 長度、sysid=1、compid=1、msgid=253（STATUSTEXT）、內容是 `"ArduCopter V4.6.1 (57591cb8)"`

所以這份檔案是一份**沒有額外包裝的、原始的 MAVLink v2 串流** 跟一般常見的 `.tlog` 不同，這裡完全沒有逐封包的 timestamp 外層，就是把 MAVLink 封包一個接一個緊貼著寫進去而已

## pymavlink 太慢，一樣手刻 parser

先用 `pymavlink` 試了一次：

```python
from pymavlink import mavutil
m = mavutil.mavlink_connection('PRISM_S03_B10-30_20260830.raw', dialect='ardupilotmega')
while True:
    msg = m.recv_match(blocking=False)
    ...
```

技術上能跑，但 150 MB 的檔案用這種純 Python、還要走完整 `ardupilotmega` dialect 對照表的解析方式，跑起來慢到令人懷疑人生

既然 MAVLink v2 的封裝格式本身很單純（因為每個欄位的位置都是固定的，payload 長度就寫在第二個 byte），乾脆自己寫一個最小可用的 parser：

```python
import struct

data = open("PRISM_S03_B10-30_20260830.raw", "rb").read()
n = len(data)
pos = 0
while pos < n:
    if data[pos] != 0xFD:
        nxt = data.find(b'\xfd', pos + 1)
        if nxt == -1:
            break
        pos = nxt
        continue
    plen     = data[pos+1]
    incompat = data[pos+2]
    sysid    = data[pos+5]
    compid   = data[pos+6]
    msgid    = data[pos+7] | (data[pos+8] << 8) | (data[pos+9] << 16)
    header_len = 10
    sig_len = 13 if (incompat & 0x1) else 0
    total_len = header_len + plen + 2 + sig_len   # header + payload + CRC (+ 簽章)
    payload = data[pos+header_len : pos+header_len+plen]
    # ... 依 msgid 分別處理 payload ...
    pos += total_len
```

因為這份截圖是連續無中斷的乾淨串流，這樣線性走一遍完全不需要任何重新對齊（resync），總共 **4,158,449 則訊息大概 3 秒解析完畢**

比通用函式庫快了不只一個數量級，在這種場合的經驗法則其實就是，如果正規的函式庫變成bottleneck，而協定本身格式簡單，就值得自己手刻一個專用的 parser

## 找出這支機隊

統計一下 `sysid`（MAVLink 用來標示是哪台載具發的訊息），發現有 **10 台不同的無人機**（sysid 1–10）


每台都以差不多的比例送出 `HEARTBEAT`、`GPS_RAW_INT`、`GLOBAL_POSITION_INT`、`ATTITUDE`、`STATUSTEXT` 等各種訊息類型，跟 **一支龐大機隊同時巡邏** 這個題目情境完全吻合。

`STATUSTEXT` 訊息裡的內容也都只是標準的 ArduPilot 自動任務流程紀錄（解除保險、起飛、飛到航點……），每台機的文字紀錄本身沒有藏任何獨特的東西，所以資訊一定是藏在座標裡

## 把每台機的座標畫出來

解析 `GLOBAL_POSITION_INT`（msgid 33）拿到每台機的座標：

```python
if msgid == 33 and len(payload) >= 28:
    time_boot_ms, lat, lon, alt, rel_alt = struct.unpack_from('<Iiiii', payload, 0)
    positions[sysid].append((time_boot_ms, lat/1e7, lon/1e7, alt/1000.0))
```

（MAVLink 存經緯度是用 int32 乘以 1e7 放大的整數，所以要除回來）

座標大概落在北緯 `36.11–36.16` 度、西經 `115.19–115.32` 度，查看地圖大概在拉斯維加斯，而這場 CTF 本身就是配合 DEFCON 出的題目，所以地點很合理

這邊如果把 10 台無人機的軌跡（經度、緯度，各機一個顏色）疊在同一張圖上，答案立刻跳出來：

![10 台無人機的軌跡疊在一起，紅色那條（sysid 4）完全不受自己街區邊界限制](all_tracks_overview.png)

9 台無人機的軌跡都是緊密、方正的街道網格圖形，完全侷限在自己被分配到的矩形街區裡，這邊回頭來正好對應題目說的 **每晚精準巡邏自己的街區** 。只有紅色那條（**sysid 4**）完全無視街區邊界，用大幅度的迴圈掃過其他機的地盤，形狀跟其他 9 條明顯不一樣。這就是脫隊的那台

應該很明顯了，把sysid 4 拼出的是 `BVLOS` 
![sysid 4 的軌跡單獨畫出來，清楚拼出 BVLOS](sysid4_bvlos.png)

但這四個字母並不是 flag 本身


## Flag

`BVLOS` 是無人機法規領域一個很常見的縮寫：**B**eyond **V**isual **L**ine **O**f **S**ight（超視距飛行），代表無人機飛出操作員肉眼可視範圍之外的飛行方式。對應到題目情境也很貼切：

> 一台飛到沒人看得到的地方去的無人機。照題目給的範例格式（每個單字字首大寫、底線分隔）組出 flag：


`starpwn{Beyond_Visual_Line_Of_Sight}`


## 心得

1. **判斷檔案格式，別只看副檔名。** 一個沒有任何說明的 `.raw` 檔案，光靠開頭的 `0xFD` magic byte 跟明文韌體版本字串，就足以確認格式並開始動手。
2. **通用函式庫在大規模資料上撞牆時，手刻協定解析往往划算得多。** MAVLink v2 的 header 是固定長度、自描述的（payload 長度就寫在第二個 byte），線性走一遍配合 `struct.unpack_from`，效能比完整 dialect 函式庫高出一個數量級以上。
3. **`sysid` 是拆解混合在同一條串流裡多台載具最自然的方式**——遇到可能包含不只一台載具的截圖，先統計 `sysid` 再說。
4. **「Connect the dots」這個題名是玩真的。** 用飛行路徑拼出文字，是真實世界業餘玩家會玩的花招（類似 Strava art），把題名當成一個「該怎麼解」的提示,而不只是風味文字，直接就指向了正確解法：把有序的座標點畫出來，然後用眼睛讀。

---