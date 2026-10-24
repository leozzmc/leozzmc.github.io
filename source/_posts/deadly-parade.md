---
title: 三台無人機同時失去 GPS，我怎麼用國中幾何找到訊號干擾源——STARPWN 2026「Deadly Parade」解題筆記
tags:
  - STARPWN
  - CTF
  - MAVLink
  - GPS Spoofing
  - Geolocation
  - Forensics
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/9f8dacd3/circumcenter_triangulation.png
abbrlink: 9f8dacd3
date: 2026-09-21 15:14:29
top_img:
---

> 🌐 English version: [English](/en/posts/9f8dacd3.html)


> 這題跟前一篇〈[One to Rule Them All](/posts/77798b75.html)〉是同一個 Prismantir 無人機蜂群世界觀的續作
> 
> 但玩法完全不同——上一題是協定安全，這題是純粹的訊號定位問題，而且老實說，我在這題submit了兩次錯誤答案，繞了一圈才想起國中學過的外心怎麼算

<!-- more -->

## 題目在講什麼

> Prismantir was assigned to protect a VIP during DynaCon's parade, and their team already had their hands full. They stopped the attacker before he even got out of bed, but his devices were already in place and active. The sky above the Glittercity was tuned to a dead channel. No one realized what was happening until Prismantir's drones began falling from the sky like ducks. Your mission is to find where these deadly toys could have been hiding.

翻成白話：Prismantir 團隊負責在 DynaCon 的遊行活動中保護一位 VIP，人力已經忙到極限，他們在攻擊者本人下床之前就把人抓到了，但他架設好的干擾設備早就已經在運作，而 Glittercity 上空的無線電頻道被調成一片死寂，直到 Prismantir 的無人機一台接一台像鴨子一樣從天上掉下來，才有人發現事情不對勁。

這題的目標是：找出這些干擾裝置到底藏在哪裡

題目給的東西只有一個：`PRISM_S05_DNCN_20260831.pcap`，一個大約 198 MB、包含兩百多萬個封包的網路封包截圖檔

## 先確認這是什麼類型的封包

```bash
file PRISM_S05_DNCN_20260831.pcap
capinfos PRISM_S05_DNCN_20260831.pcap
```

結果顯示這是一份 **Linux cooked-mode capture v2**（linktype 276）格式的封包截圖，總共 207 萬9千個封包，涵蓋 3159 秒的紀錄。

用 `tshark` 看一下：

```
frame -> sll -> ip -> udp -> data      (100% 的封包)
```

每一個封包都是 `127.0.0.1:14550 <-> 127.0.0.1:45177`，這正是 loopback 上的 MAVLink 標準 UDP port，跟前一題「One to Rule Them All」一樣，都是 MAVLink v2 協定（開頭 `0xFD` 那個 magic bit），只是這次是包在一份完整的 pcap（Linux SLL2 cooked capture + IPv4 + UDP）裡，而不是裸的位元組串流

## 又是效能問題，再手刻一個 parser

`tshark`／`pymavlink` 對兩百萬個封包來說實在太慢，跟前一題「Connect the Dots」的經驗一樣，直接手刻一個 parser，把 pcap 的紀錄格式、SLL2 header、IP header、UDP header、MAVLink v2 header 一路手動拆開來讀：

```python
import struct

f = open("PRISM_S05_DNCN_20260831.pcap", 'rb')
gh = f.read(24)
magic, vmaj, vmin, tz, sigfigs, snaplen, network = struct.unpack('<IHHiIII', gh)
assert network == 276   # LINKTYPE_LINUX_SLL2

while True:
    rec_hdr = f.read(16)
    if len(rec_hdr) < 16:
        break
    ts_sec, ts_usec, incl_len, orig_len = struct.unpack('<IIII', rec_hdr)
    data = f.read(incl_len)
    ts = ts_sec + ts_usec/1e6

    proto_type = struct.unpack('>H', data[0:2])[0]   # SLL2 EtherType
    if proto_type != 0x0800:
        continue
    ip_start = 20                                     # SLL2 header 固定 20 bytes
    ihl = (data[ip_start] & 0x0F) * 4
    if data[ip_start+9] != 17:                        # 17 = UDP
        continue
    udp_start = ip_start + ihl
    udp_len = struct.unpack('>H', data[udp_start+4:udp_start+6])[0]
    payload = data[udp_start+8 : udp_start+udp_len]

    if len(payload) < 10 or payload[0] != 0xFD:
        continue
    plen  = payload[1]
    sysid = payload[5]
    msgid = payload[7] | (payload[8] << 8) | (payload[9] << 16)
    mpayload = payload[10:10+plen]
    # ... 依 msgid 分別處理 ...
```

這樣寫，兩百萬則訊息大概三秒鐘解析完畢，速度差了不只一個數量級。解析結果顯示這是 10 台無人機（sysid 1–10）加一個地面站（sysid 255）組成的完整巡邏機隊，跟「Connect the Dots」那題是同一套機隊設定

## 找出事故：篩選警告等級的系統訊息

MAVLink 有個 `STATUSTEXT`（msgid 253）訊息類型，專門用來傳文字狀態訊息，還帶一個 severity（嚴重程度）欄位。

篩出 severity ≤ 4（警告以上等級）的訊息，攻擊現場立刻浮現：

```
1026.66s sysid=2 sev=2  EKF variance
1026.66s sysid=2 sev=2  EKF Failsafe: changed to LAND Mode
1038.44s sysid=2 sev=4  EKF3 IMU1 stopped aiding
1051.32s sysid=2 sev=4  SmartRTL deactivated: bad position
1438.29s sysid=5 sev=2  EKF variance / EKF Failsafe: changed to LAND Mode
1458.55s sysid=5 sev=4  SmartRTL deactivated: bad position
1775.77s sysid=3 sev=2  EKF variance / EKF Failsafe: changed to LAND Mode
1802.33s sysid=3 sev=4  SmartRTL deactivated: bad position
2805.08s sysid=9 sev=4  SmartRTL deactivated: buffer full   <- 這個不相關
```

三台無人機（sysid 2、5、3）show 出完全一致的 GPS 干擾現象： EKF（Extended Kalman Filter，無人機用來融合各種感測器資料算出「我現在在哪」的演算法）方差飆高、EKF 降級進入 LAND 保護模式、兩個 IMU（慣性測量單元）都停止使用 GPS 輔助、SmartRTL（智慧返航）因為位置不可靠而中止

sysid 9 的失敗訊息是另一個不相關的問題（telemetry buffer 滿了），所以先排除掉

## 精確定位 GPS 失去訊號的那一刻

STATUSTEXT 的timestamp其實會有延遲，比較準的做法是直接看 `GPS_RAW_INT`（msgid 24）的 `fix_type` 欄位，這是 GPS 定位狀態的第一手訊號

這裡有個容易忽略的細節：**MAVLink 的欄位是按照型別大小由大到小排列儲存的，不是照宣告順序**。如果照著文件寫的欄位順序直接刻 struct format，欄位大小一旦混雜，後面全部會讀錯。保險做法是用 `pymavlink` 查一下這個訊息類型真正的 wire 順序：

```python
from pymavlink.dialects.v20 import ardupilotmega as mav
cls = mav.mavlink_map[24]
print(cls.fieldnames, cls.orders)
# 真正順序：time_usec, lat, lon, alt, eph, epv, vel, cog, fix_type, sats_visible, ...
```

```python
time_usec, lat, lon, alt, eph, epv, vel, cog, fix_type, sats_vis = \
    struct.unpack_from('<QiiiHHHHBB', mpayload, 0)
```

其實 `fix_type` 只出現過兩種值：

**1（完全無定位）跟 6（RTK 精準定位）**，中間完全沒有漸進式的訊號變差，是一個很乾脆的二元切換，這本身就是個線索，就代表這是一個邊界很明顯的干擾範圍，不是那種自然界訊號漸弱那種漸層

這邊抓出每台受影響無人機**第一次**出現 `fix_type=1` 的那個瞬間，就是它真正踏進死亡地帶邊界的座標（比 EKF 真正宣告 failsafe 的時間早了 10 到 14 秒）：

| sysid | lat | lon |
|---|---|---|
| 2 | 36.0924468 | -115.2422644 |
| 5 | 36.0997050 | -115.2479014 |
| 3 | 36.0778960 | -115.2440574 |

另外拿 `SIMSTATE`（msgid 164，ArduPilot SITL 模擬器回報的真實座標，完全不經過 EKF/GPS 判斷）交叉驗證，確認每台無人機最後真的是落在這幾個座標附近

## 但猜錯了兩次

**第一次：直接取三點平均** 

反查地圖（Nominatim reverse-geocode）落在 Spring Valley 一帶一個叫 Spanish Trail 的社區。交了 `starpwn{Spanish_Trail}` 跟 `starpwn{Spanish_Trail_Country_Club}`，**但是都錯**

**第二次：三個點查到的地址都指向同一個更大範圍的社區名 Spring Valley** 

交了 `starpwn{Spring_Valley}`，**還是錯**

問題出在哪？三個點大致排成一條接近共線的直線，對這種分佈取簡單平均，得到的點根本不對應任何有意義的幾何性質，這邊就不是三角定位，只是在硬湊答案而已

## 正確做法：外心三角定位

如果干擾源的有效範圍大致是個圓形，那三台無人機各自「第一次踏進死亡地帶」的座標，理論上就是這個圓邊界上的三個點，到圓心的距離應該幾乎相等。

而 **到三個已知點距離相等的點**，就是這三點構成的三角形 **外心**，國中幾何教過的那個東西

```python
import math

P1 = (36.0924468, -115.2422644)  # sysid 2
P2 = (36.0997050, -115.2479014)  # sysid 5
P3 = (36.0778960, -115.2440574)  # sysid 3

lat0 = (P1[0] + P2[0] + P3[0]) / 3
R = 6371000
def to_xy(lat, lon):
    x = math.radians(lon) * R * math.cos(math.radians(lat0))
    y = math.radians(lat) * R
    return x, y

def from_xy(x, y):
    lon = math.degrees(x / (R * math.cos(math.radians(lat0))))
    lat = math.degrees(y / R)
    return lat, lon

ax, ay = to_xy(*P1); bx, by = to_xy(*P2); cx, cy = to_xy(*P3)

d  = 2 * (ax*(by-cy) + bx*(cy-ay) + cx*(ay-by))
ux = ((ax**2+ay**2)*(by-cy) + (bx**2+by**2)*(cy-ay) + (cx**2+cy**2)*(ay-by)) / d
uy = ((ax**2+ay**2)*(cx-bx) + (bx**2+by**2)*(ax-cx) + (cx**2+cy**2)*(bx-ax)) / d

lat_c, lon_c = from_xy(ux, uy)
r = math.hypot(ux-ax, uy-ay)
print(lat_c, lon_c, 'radius_m=', r)
# -> 36.086798, -115.263377   radius ≈ 1998 m
```

這裡先把經緯度用一個簡單的局部平面投影（`to_xy` / `from_xy`）轉成公尺為單位的平面座標，因為外心公式本身是平面幾何，直接套在經緯度上會因為地球是球面而失真；算完外心座標再轉回經緯度。算出來的結果，是一個乾淨的圓，半徑接近 2 公里：

![三個 GPS 失聯起點、三角形、以及算出來的外心座標，正好落在 Echo Trail Park](circumcenter_triangulation.png)

把這個座標丟到地圖上：

```
https://www.openstreetmap.org/?mlat=36.086798&mlon=-115.263377#map=15/36.086798/-115.263377
```

標記精準落在一個有明確名字的公園 **Echo Trail Park**，就在 Spanish Trail 高爾夫球場跟 Flamingo Wash 滯洪池旁邊，開闊又有樹木遮蔽，感覺是個實際上很合理的藏匿干擾器的地點

## Flag

```
starpwn{Echo_Trail_Park}
```

## 心得

1. **MAVLink 的欄位是照型別大小排列，不是照文件寫的宣告順序。** 手刻一個新訊息類型的 parser 之前，先用 `pymavlink` 的 `mavlink_map[id].orders` 或官方 XML 定義查一下真正的 wire 順序，不要照文件的欄位列表順序直接刻 struct format。
2. **一個乾脆的二元訊號，比一個漸變的雜訊更值得注意。** `fix_type` 只在 1 跟 6 之間切換、完全沒有中間值，這件事本身就在暗示這是一個被刻意設計、可被發現的事件，值得專門去檢查，而不是預設現實世界的 GPS 訊號本來就會這樣漸弱。
3. **取平均值不等於三角定位。** 對三個大致共線的「邊界進入點」取 centroid，不對應任何真實的幾何意義；當這些點代表「進入一個圓形有效範圍的邊界」時，正確的估計值是這三點的外心——而且這次外心解法明顯更準，直接落在一個有名字的公園上,而不是 centroid 那種落在隨便一條住宅路上的模糊結果。
4. **有 ground truth 就交叉驗證。** ArduPilot SITL 的 `SIMSTATE` 訊息回報模擬器的真實座標，完全繞過 EKF/GPS 判斷鏈。拿它確認干擾起點座標，排除了「無人機其實飄到別的地方」這個懷疑，讓除錯焦點能集中在定位方法本身，而不是懷疑資料本身有問題。
5. **猜錯答案卡關時，去看地圖本身，不要只看 geocoder 吐出來的文字。** 反查地址 API 通常只會回傳最近的路名，而不一定是附近最顯眼的命名地標（一座公園、一個高爾夫球場，在 OSM 上可能有標記，但不會被反查地址的查詢直接帶出來）。實際打開地圖看那個座標周圍長什麼樣子，才讓 Echo Trail Park 這個命名 POI 浮現出來。

---
