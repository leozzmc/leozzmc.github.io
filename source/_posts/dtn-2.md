---
title: NASA HDTN 架構解析：太空 DTN 如何真正運作？
tags:
  - Space Networking
  - DTN
  - Bundle Protocol
  - NASA
  - Distributed Systems
categories:
  - Space Infrastructure
description: >-
  DTN 不只是 Store-Carry-Forward 的概念。這篇文章將拆解 NASA High-rate Delay Tolerant
  Networking（HDTN）的模組化架構，說明 Ingress、Storage、Router、Scheduler、Egress 與
  Convergence Layer 如何共同處理太空環境中的斷線、等待與重新轉送。
toc: true
aside: true
abbrlink: 25763fe7
date: 2026-06-07 20:51:10
cover: /img/DTN/cover-2.png
---

# 前言：從 DTN 的概念，走向真正可以運作的太空網路

在上一篇文章 [〈為什麼太空網路需要 DTN？從 TCP/IP 的限制到深空網路〉](https://leozzmc.github.io/posts/7d41a775.html) 中，我整理了太空網路和地面 Internet 之間最根本的差異。 在地球上，我們通常預期來源與目的地之間存在一條可以立即使用的完整路徑。即即便途中偶爾發生遺失封包，TCP 也能透過 ACK、Timeout 與 Retransmission 等一大堆機制處理問題～

但如果場景在太空中，斷線不一定代表故障。舉例來說，狀況可能是：衛星可能飛出地面站的可視範圍，月球探測車可能進入隕石坑，航天器可能為了節省能源暫時關閉通訊模組。另外，不同節點之間的連線，也可能受到軌道位置、天體遮蔽、天線方向與通訊排程影響

因此，太空網路不能只看 **現在有沒有一條可以立刻抵達終點的路？** 還必須進一步考慮： **下一次可以轉送資料的機會是什麼時候？**, **在那之前，資料應該先存放在哪一個節點？**, **如果通訊窗口突然消失，又該如何恢復傳輸？**

以上就是 **Delay/Disruption-Tolerant Networking（DTN）** 試圖解決的問題

而我的上一篇文章已經介紹過 DTN 最核心的運作方式：

```text
Store → Carry → Forward
儲存  → 攜帶  → 轉送
```

但這仍然只是一個相對抽象的概念。因為如果我們真的要把 DTN 真的部署在國際太空站、衛星、月球中繼站，甚至未來的深空網路中，背後到底需要哪些軟體元件？並且還有一堆疑問：

> 資料進入節點後，系統如何判斷應該立刻送出，還是暫時寫入硬碟？
> 通訊窗口出現後，誰負責通知系統重新釋放資料？
> 當路徑突然中斷，系統又如何重新計算下一跳？

而 **NASA Glenn Research Center**  開發的 **High-rate Delay Tolerant Networking（HDTN）**，正是一套將 DTN 從古老的抽象概念落實成工程系統的實作，來繼續看下去。[1][2]

# HDTN 是什麼？

HDTN 的全名是 **High-rate Delay Tolerant Networking**， 它並不是另一套與 DTN 無關的新協定，而是一套針對高頻寬需求設計的 DTN implementation。這裡可以回憶一下，DTN 解決的是太空網路中的可靠傳輸問題：

* 節點之間不一定隨時保持連線
* 通訊延遲可能非常長
* 網路拓樸會隨時間改變
* 資料可能必須在中繼節點停留一段時間
* 通訊路徑可能在傳輸途中突然中斷

但當雷射通訊、高解析影像、科學儀器資料與大型檔案傳輸逐漸增加後，系統還會面對另一個問題：

> 即使 DTN 可以容忍斷線，它能不能在通訊窗口出現時，快速傳送大量資料？

早期的 DTN implementation 多半運作在資源有限的環境中，優先考量的是穩定性與任務需求，而不是極高的吞吐量。然而，**未來的太空任務不只需要可以傳，還需要在有限的 Contact Window 內盡可能傳送更多資料。** NASA 因此開發了 HDTN，就是希望透過現代化硬體、平行處理與模組化架構，提高 DTN 的處理效率。[1][2]


# 為什麼 NASA 需要 High-rate DTN？

NASA Glenn Research Center 在 2022 年發布的 Technical Memorandum 中，以國際太空站(ISS)作為 HDTN 的測試與整合場景。ISS 裡面雖然也有電腦，但是不是只有電腦，而是一個包含大量子系統 (onboard computer通常有非常多子系統)、科學酬載、無線電設備與地面網路的複雜環境。[1]

科學資料從 ISS 傳回研究團隊時，可能經過多個節點：

```text
  ISS 上的科學儀器
        ↓
Joint Station LAN（JSL）
        ↓
     通訊設備
        ↓
Tracking and Data Relay Satellite（TDRS）
        ↓
    地面接收站
        ↓
     地面網路
        ↓
     研究團隊
```

上面這樣只是一種可能的傳遞方式而已。另外，不同資料的需求也不一樣。有些可能是軟體更新，有些是遙測資料，有些是大型科學檔案，也可能包含影像與串流內容。每種資料的大小、優先順序與頻寬需求都不同。而且，ISS 在軌道上持續移動，通訊鏈路也不會永久保持穩定。部分鏈路可能暫時可用，也可能突然中斷。

這代表 ISS 的網路需要同時具備：

* 高吞吐量
* 本地儲存能力
* 路由管理
* 斷線恢復
* 不同 DTN implementation 之間的互通性
* 對不同底層傳輸方式的支援

HDTN 的目標，就是在這類環境中建立一套可以 **自動管理資料流動的高速 DTN 系統**。[1][2]


# 從物流系統理解 HDTN

這邊可以再回到上一篇文章中的物流比喻，這邊將 DTN 比喻成跨國物流系統 (像是 DHL那樣)

傳統 Internet 比較像即時電話：

```text
撥號 → 建立連線 → 即時通話
```

DTN 則比較像物流配送：

```text
寄件 → 集貨 → 暫存 → 運輸 → 中轉 → 最終送達
```

寄送包裹時，寄件人與收件人不需要同時在線上。貨車、飛機、港口與配送中心，也不需要在同一秒鐘形成一條完整的運輸路線，包裹可以先留在物流中心，等待下一班貨車或飛機。 HDTN 則可以理解成這套物流系統背後的 **自動化倉儲與派送平台：**

| 物流系統          | HDTN               |
| ------------- | ------------------ |
| 包裹            | Bundle             |
| 集貨中心入口        | Ingress            |
| 倉庫            | Storage            |
| 航班與貨車班次表      | Contact Plan       |
| 派車與路線規劃       | Scheduler / Router |
| 出貨碼頭          | Egress             |
| 下一個物流中心       | Next Hop           |
| 實際使用的卡車、飛機或船舶 | Convergence Layer  |

這個類比應該會蠻有感的，應該也可以發現 HDTN 不只是把資料送出去而已。它真正做的是 **根據未來可以使用的通訊機會，決定資料現在應該立即轉送、暫時保存，還是改走其他路徑**


# HDTN 的核心架構

我自己覺得如果單看文字敘述，還是不如直接看原論文中的 Fig. 1 最清楚。下圖就是 HDTN modules interaction，也就是整個 HDTN 內部各模組如何互動的總覽。[1]

![HDTN modules interaction（Fig. 1 in [1]）](/img/DTN/HDTN.png)

> Fig. 1. HDTN modules interaction. Source: [1]

從這張圖可以很直觀看到，HDTN 的核心元件大致包含 Ingress、Storage、Scheduler、Router、Egress，外部還有 BPGen、BPSink、Web Interface、Contact Plan 與 CGR Client 彼此配合。[1] 這種各司其職拆分方式和現代雲端系統中主流微服務或 event-driven architecture 還蠻雷同的，每個元件專注處理特定任務，並透過事件交換狀態。


## Bundle

在一般 IP 網路中，我們經常以 Packet 作為基本資料單位。 但在 DTN 中，主要資料單位是 **Bundle**。Bundle 可以理解成 DTN 世界中的標準貨櫃。它不只包含應用程式資料，也會攜帶來源、目的地、建立時間、生命週期與其他 metadata～

```text
Bundle
├── Source Endpoint
├── Destination Endpoint
├── Creation Timestamp
├── Lifetime
├── Payload
└── Additional Metadata
```

在傳統網路中 Packet 通常預期會被立即轉送，但 Bundle 則不同。它從一開始就被設計成可以在節點上暫存、等待、重新轉送，甚至跨越多個不連續的通訊窗口。 其中也特別指出，Bundle 的大小並不是固定的。 **除了衡量每秒可以傳送多少 bits 之外，也必須考慮系統每秒可以處理多少 Bundles。**[1] 換句話說，要實踐高速 DTN 的挑戰，不只是網卡速度，因為即使網路頻寬足夠，如果每一個 Bundle 都需要大量解析、記憶體配置與狀態管理，CPU 仍然可能成為bottleneck。

## Ingress

`Ingress` 是 Bundle 進入 HDTN 節點後的第一站。它負責接收 Bundle，解析 Header，確認資料的來源與目的地，並根據目前的鏈路狀態決定下一步。最簡化的邏輯如下：

```text
收到 Bundle
    │
    ▼
解析來源與目的地
    │
    ▼
下一跳目前是否可以使用？
    │
    ├── Yes ──▶ 直接交給 Egress
    │
    └── No  ──▶ 送入 Storage 暫存
```

如果鏈路目前可用，Ingress 可以採用類似 **cut-through forwarding** 的方式，直接把 Bundle 交給 Egress，減少不必要的Disk I/O 跟 I/O Wait。 如果鏈路目前不可用，Bundle 就會先進入 Storage。這其實就是 `Store-Carry-Forward` 中的第一個關鍵判斷：

> 現在可以立刻 Forward，還是必須先 Store？


## Storage

在一般網路中，Router 通常不會長時間保存封包，封包抵達 Router 後，理想狀況是立刻轉送。如果 Queue 塞滿了，封包可能直接被丟棄，交給上層協定重新處理。

但在 DTN 中，等待可能是正常狀態，假設某個月球探測器需要透過中繼衛星傳送資料，但下一個通訊窗口要兩個小時後才會出現，這個時候，系統不能單純把資料丟掉，也不能無限重試，`Storage` 的工作，就是讓 Bundle 可以安全停留在節點上，等待下一次可以傳輸的機會

```text
Bundle 抵達節點
      │
      ▼
目前沒有可用 Link
      │
      ▼
寫入 Storage
      │
      ▼
等待 LinkUp 事件
      │
      ▼
從 Storage 釋放 Bundle
      │
      ▼
送往 Egress
```

HDTN 的 Storage 採用 **multi-threaded implementation**，並可將資料分散在多個磁碟上。[1]這樣做的原因很直觀：當大量資料同時進入節點時，Disk I/O 與資料管理本身也可能成為效能瓶頸，所以 Storage 模組本身蠻重要的，在不像我們在地面網路中是一直可以擴充的備用元件，而是太空 DTN 架構中的核心

## Contact Plan

在一般地面網路中，Router 通常根據目前的網路狀態選擇路徑 (SDN)，但太空網路多了一個非常特殊的維度：**時間**。衛星、太空站、月球中繼站與地面站的位置變化，很多時候是可以預測的。某一條 Link 可能現在不存在，但十分鐘後會出現，並在五分鐘後再次消失。因此，DTN 需要處理一份特殊的資料：**Contact Plan**

Contact Plan 可以理解成未來通訊窗口的時刻表

```json
[
  {
    "source": 1,
    "destination": 2,
    "startTime": 100,
    "endTime": 300,
    "dataRate": 1000000
  }
]
```

這代表：

```text
Node 1 → Node 2
可以在時間 100 到 300 之間傳輸資料
可用速率為 1 Mbps
```

在真實任務中，Contact Plan 可能包含更多節點、更多窗口，以及不同鏈路速率。這和地面網路最大的差別在於：**太空路由不是只根據「空間上的拓樸」進行判斷，還必須同時考慮時間上的拓樸**

## Scheduler 與 Router

有了 Contact Plan 後，系統還需要元件根據排程管理資料流。在該份 HDTN 架構中，`Scheduler` 會讀取 Contact Plan，並根據鏈路狀態發送事件：[1]

```text
linkUp
linkDown
```

當 Ingress 收到 `linkUp` 事件時，它就知道某個目的地目前可以使用，可以把 Bundle 直接轉交給 Egress。當 Storage 收到 `linkUp` 事件時，它也可以開始釋放先前暫存的 Bundle，交給 Egress。

相反地，如果鏈路中斷，系統就會停止傳送，並重新評估後續路徑。另一方面，`Router` 的任務是計算 Next Hop。Router 會根據 Contact Plan 與目的地，決定 Bundle 接下來應該送到哪一個節點，再通知 Egress 更新 Outduct

```text
Contact Plan
      │
      ▼
計算可行路徑
      │
      ▼
選擇 Next Hop
      │
      ▼
發送 RouteUpdate
      │
      ▼
Egress 更新 Outduct
```

HDTN 的路由思維和一般最短路徑演算法不完全相同，像是一般 BFS, Dijsktra Algorithm 可能只問：

> 哪一條路目前距離最短？

但是太空 DTN 還必須問：

> 哪一條路會在適當時間出現？
> 這個窗口可以維持多久？
> 可用頻寬是否足以容納這批 Bundle？
> 如果錯過這次窗口，下一次機會要等多久？

這也是 Contact Graph Routing（CGR）的核心概念，也可以參考[前一篇文章](https://leozzmc.github.io/posts/7d41a775.html)


## 版本差異：Scheduler 與 Router 的職責差異

這裡需要補充一個版本差異。Technical Memorandum 裡面有將 `Scheduler` 與 `Router` 分開描述：[1]

* Scheduler 讀取 Contact Plan
* Scheduler 發送 `linkUp` 與 `linkDown`
* Router 與 CGR Client 溝通
* Router 將 `RouteUpdate` 傳給 Egress

但在目前 NASA 公開的 HDTN GitHub README 中，Router 的職責描述有所調整，目前 README 提到：[3]

* Router 根據 Contact Plan 管理鏈路可用狀態
* Router 使用 Dijkstra's algorithm 計算 Next Hop
* Router 在鏈路突然中斷或 Contact Plan 更新後重新計算路徑
* Router 將 `RouteUpdate` 傳給 Egress

因此，閱讀 HDTN 架構時，需要注意論文發布時間與程式碼版本，但不論模組邊界如何調整，整體設計精神並沒有改變：

> 根據 Contact Plan 管理鏈路狀態，並在網路事件發生時重新計算 Bundle 的 Next Hop


## Egress

`Egress` 會是 Bundle 離開 HDTN 節點前的最後一站。它會收到來自 Ingress 或 Storage 的 Bundle，再根據 Router 計算出的結果，將 Bundle 送往適當的 Outduct 與下一跳。

```text
Ingress ─────┐
             │
             ▼
          Egress ─────▶ Outduct ─────▶ Next Hop
             ▲
             │
Storage ─────┘
```

在 HDTN 中，可以用兩個詞理解資料進出的方向：

| 名稱      | 用途          |
| ------- | ----------- |
| Induct  | 接收外部資料的入口   |
| Outduct | 傳送資料至下一跳的出口 |

可以把 Induct 想像成物流中心的卸貨碼頭，把 Outduct 想像成出貨碼頭。同一個節點可能有多個 Outduct，分別通往不同的下一跳。Router 的工作，就是告訴 Egress 現在應該使用哪一個出口


# Event-Driven Architecture：鏈路突然中斷時怎麼辦？

太空網路並不會永遠按照理想排程運作，太多影響因素了。即使 Contact Plan 已經預測某條 Link 應該可以使用，真實環境中仍然可能出現：

* 訊號品質突然惡化
* 天線追蹤失敗
* 通訊設備暫時異常
* Link 提前中斷
* Contact Plan 更新
* 下一跳節點無法回應

因此，HDTN 不能只依賴靜態排程，它還需要一套 event-driven architecture，在狀態改變時通知其他模組。HDTN 使用 **ZeroMQ pub-sub sockets** 傳遞事件。[1]這是什麼呢？ 舉例，當 Egress 發現鏈路突然消失時，可以發送 `LinkStatus` 變化通知：

```text
Egress 偵測到 Link 中斷
        │
        ▼
發送 LinkStatus Change
        │
        ▼
Scheduler 更新鏈路狀態
        │
        ├──▶ 發送 linkDown 給 Ingress
        │
        ├──▶ 發送 linkDown 給 Storage
        │
        └──▶ 通知 Router 重新計算路徑
```

Router 重新計算 Next Hop 後，再通知 Egress 更新 Outduct。

發現了吧，這個流程很像現代分散式系統中的 Event-Driven Architecture：

```text
事件發生
   ↓
發布狀態變更
   ↓
訂閱者接收通知
   ↓
各模組更新自己的行為
```

這種設計讓 HDTN 不需要把所有邏輯塞進同一個大型程式中，也讓不同模組之間可以維持相對清楚的責任邊界


# Convergence Layer

如同前一篇文說的，Bundle Protocol 並不是用來完全取代 TCP、UDP 或其他底層協定，它更像是一層 Overlay Network：負責處理跨節點、跨時間的資料轉送邏輯。

但當 Bundle 真的要從一個節點移動到另一個節點時，仍然需要搭載在某種實際的傳輸方式上，這就是 **Convergence Layer** 的用途。

```text
Application Data
        ↓
Bundle Protocol
        ↓
Convergence Layer
        ↓
Underlying Transport / Link
```

可以再次使用物流系統來理解：

| 網路概念              | 物流類比          |
| ----------------- | ------------- |
| Bundle            | 標準貨櫃          |
| Bundle Protocol   | 跨國物流規則        |
| Convergence Layer | 實際使用的貨車、飛機或船舶 |
| Physical Link     | 公路、航線或海運路線    |

HDTN 支援多種 Convergence Layer，包括：[1][3]

* UDP Convergence Layer
* Simplified TCP（STCP）
* TCP Convergence Layer Version 3（TCPCLv3）
* TCP Convergence Layer Version 4（TCPCLv4）
* Licklider Transmission Protocol（LTP）

不同 Convergence Layer 各有適用情境：

| Convergence Layer | 特性                                  |
| ----------------- | ----------------------------------- |
| UDP               | 結構簡單，但本身不保證可靠傳輸                     |
| STCP              | 相對精簡，適合高效率資料傳送                      |
| TCPCL             | 在 TCP 之上傳送 Bundle，支援較完整的 DTN 節點連線管理 |
| LTP               | 針對高延遲與間歇性鏈路設計，適合太空通訊                |


# LTP

在 HDTN 支援的 Convergence Layer 中，LTP 特別值得注意。LTP 的全名是 **Licklider Transmission Protocol**，它是針對長延遲環境設計的傳輸協定，特別適合深空通訊等無法使用一般低延遲假設的場景。[6]

假設某條鏈路的單程延遲是兩秒，Round-Trip Time（RTT）就可能達到四秒，在這種情況下，如果系統每傳一小段資料就停下來等待回應，整體吞吐量會非常差。因此，HDTN 的 LTP implementation 需要同時維持大量 Session，才能讓鏈路持續傳輸資料。

```text
Session 1  ─────▶ 等待 ACK
Session 2      ─────▶ 等待 ACK
Session 3          ─────▶ 等待 ACK
Session 4              ─────▶ 等待 ACK
...
```

當前面的 Session 還在等待回應時，後面的 Session 仍然可以繼續傳送資料。測試結果指出，當鏈路延遲超過一秒後，提高同時存在的 LTP Sessions 數量，是達到 gigabit 級資料率的重要因素。[1]

這和一般高頻寬網路中的 Pipeline 概念很像，就是 **不要讓整條鏈路因為等待單一回應而閒置**


# HDTN 與一般 Message Queue 有什麼不同？

如果平常有使用過 Amazon SQS、RabbitMQ、Kafka 或其他 Message Queue，可能會覺得 HDTN 的架構有些熟悉。

它們確實有一些共同點：

| Message Queue   | HDTN                  |
| --------------- | --------------------- |
| Message         | Bundle                |
| Queue           | Storage               |
| Producer        | Bundle Source         |
| Consumer        | Destination Node      |
| Broker          | DTN Node              |
| Retry           | Retransmission        |
| Routing Rule    | Contact Plan / Router |
| Durable Storage | Bundle Storage        |

但 HDTN 面對的問題更加特殊。一般 Message Queue 通常假設底層網路大致可用。即使短暫斷線，服務也預期能在相對短時間內恢復。

HDTN 則必須接受：

* 網路可能長時間不存在
* 下一次連線可能要等待數分鐘或數小時
* 節點持續移動
* 通訊窗口可以預測，但十分有限
* 頻寬、延遲與錯誤率高度不對稱
* 中繼節點本身也可能暫時離線

因此，HDTN 並不是把 Message Queue 搬到太空而已，它是在極端網路環境中，重新設計資料保存、路由、排程與傳輸的方式


# HDTN 的完整資料流

將前面的元件串起來後，一個 Bundle 在 HDTN 節點中的生命週期大致如下。

## 情境一：鏈路目前可用

```text
Bundle 抵達 Induct
        │
        ▼
Ingress 解析 Header
        │
        ▼
確認下一跳 Link 可用
        │
        ▼
直接交給 Egress
        │
        ▼
Egress 選擇 Outduct
        │
        ▼
Bundle 傳送至 Next Hop
```

這種方式減少不必要的 Storage I/O，適合可立即轉送的資料

## 情境二：鏈路目前不可用

```text
Bundle 抵達 Induct
        │
        ▼
Ingress 解析 Header
        │
        ▼
確認下一跳 Link 不可用
        │
        ▼
寫入 Storage
        │
        ▼
等待 linkUp 事件
        │
        ▼
Storage 釋放 Bundle
        │
        ▼
Egress 傳送至 Next Hop
```

這就是 DTN 中最典型的 Store-Carry-Forward 流程

## 情境三：傳輸途中突然中斷

```text
Egress 偵測到 Link 中斷
        │
        ▼
發布 LinkStatus Change
        │
        ▼
更新 Link 狀態
        │
        ▼
停止釋放 Bundle
        │
        ▼
Router 重新計算路徑
        │
        ▼
Egress 更新 Outduct
        │
        ▼
等待下一次可用的傳輸機會
```

對 HDTN 而言，斷線不是系統崩潰，而是另一個需要處理的事件


# 用分散式系統的角度看待

從軟體工程角度來看，HDTN 最有趣的地方不只是太空通訊，而是它本質上也是一套 event-driven distributed system。它需要處理：

* 非同步事件
* Durable Storage
* Pipeline
* Route Update
* Backpressure
* Retry
* 狀態同步
* 故障恢復
* 多種底層傳輸方式
* 不同 DTN implementation 的互通性

這些問題在現有的雲端架構其實不少見，但太空網路將條件推向更加極端的方向。地面系統可能會把幾秒鐘的 Timeout 視為服務異常，太空系統卻可能必須將幾分鐘的等待納入正常流程。還有一個差別是，地面系統可能要求服務盡快恢復連線，但太空系統則必須接受 **目前根本不存在任何可用路徑**，最後一個觀察：地面網路中的時間通常只是效能指標，而太空 DTN 中的時間本身就是路由拓樸的一部分


# ISS 測試：HDTN 不只是理論架構

該份 Technical Memorandum 也整理了 HDTN 與其他 DTN implementation 的互通性與效能測試，其中包含：[1]

* HDTN 與 DTN Marshall Enterprise（DTNME）之間的互通性測試
* Bundle Protocol Version 6（BPv6）與 Version 7（BPv7）測試
* 不同 Convergence Layer 的傳輸測試
* 模擬延遲與封包遺失
* 讓 HDTN 作為 Gateway Node
* 以 ISS 網路拓樸進行模擬
* LTP 長延遲鏈路測試

其中一個很值得提的點，是他們後來為了找出 SDIL 測試中資料率偏低的原因，又在 GRC 本地做了一系列「4-box」測試，去模擬 ISS payload、ISS onboard gateway、ground gateway 與 ground node 之間的資料流。[1] 這些測試不只比較協定，也比較了不同部署環境：包含 **完全使用 KVM 的虛擬機**、**LXC container**、**native hardware（bare metal）**，以及 **實際接近 ISS onboard gateway 的 ZBook + KVM image** 組合。[1]

結果很有意思：雖然 `iperf3` 顯示這些環境理論上都有不錯的基礎頻寬，但真正跑 end-to-end DTN 測試時，**KVM 虛擬機環境出現了明顯的效能損失**；相對地，LXC 的表現更接近 native hardware，而 native hardware 則能做到接近 line rate 的表現。[1] 另外，當他們把 ISS 實際會用到的 ZBook + KVM gateway image 納入測試後，效能又再次明顯下降；即使後來嘗試調整 VM 的 core 與 memory 配置，改善也不明顯。[1]

換句話說，這篇實驗一個很重要的收穫，不只是 **HDTN 可以跑** ，而是 **虛擬化層本身就可能成為瓶頸**。作者最後也明確提到，這些本地測試讓他們開始懷疑，先前 SDIL 測試中的低資料率，不一定只是 VPN 或 DTNME 版本問題，**KVM 本身也可能比原先預期更顯著地影響效能**。[1]

另外一項值得注意的測試，是模擬約兩秒單程延遲、四秒 RTT 的鏈路環境。測試結果顯示，單純增加頻寬並不足以解決問題。系統還需要調整 LTP Sessions、Pipeline Limit、Buffer 與其他參數，才能在高延遲條件下維持較高吞吐量。[1]

這也說明了一件事：

> 太空網路效能不是單一網卡或單一協定的問題，而是整條資料處理 Pipeline 的系統工程問題


# HDTN 專案現況

NASA 已經將 HDTN 原始碼公開在 GitHub 上：[3]

[GitHub：nasa/HDTN](https://github.com/nasa/HDTN)

目前公開的專案以 C++ 撰寫，並使用 CMake 建置。看起來支援多個作業系統與硬體平台，包括 Linux、Windows、macOS、FreeBSD、OpenBSD、Raspbian 與 ARM64 環境。[3]

主要相依套件包括：

```text
CMake
Boost
ZeroMQ
OpenSSL
C++ Compiler
```

目前程式碼中的主要模組包括：

```text
Ingress
Storage
Router
Egress
Telemetry Command Interface
```

也有提供測試方式，可以透過 `tcpdump` 與 Wireshark 觀察 HDTN 的資料流：

```bash
sudo tcpdump -i lo -vv -s0 port 4558 -w hdtn-traffic.pcap
```

# Next Hop：HDTN 一定要跑在大型伺服器上嗎？

這邊理解 HDTN 的基本架構後，接下來會出現一個很自然的問題：

> 既然 HDTN 已經拆成 Ingress、Storage、Router 與 Egress 等模組，它一定要完整跑在高階 x86 Server 上嗎？

有這個疑惑也蠻正常，畢竟深空探索直覺來想都是與高階Server搭配，但未來的太空任務不可能只依賴大型伺服器，以後的月球基地、衛星、探測器、地面站與邊緣節點可能擁有不同的：

* CPU 架構
* 記憶體容量
* 儲存空間
* 能源限制
* 散熱條件
* 頻寬需求
* 任務角色

因此論文中的 future work 有提到一些值得研究的方向：

* HDTN 能否移植到 ARM 平台？
* 能否在 Raspberry Pi 上執行？
* 不同模組能否拆散到多台裝置？
* Edge Device 能否成為太空 DTN 節點？
* 在有限硬體資源下，系統效能會下降多少？

這之後 NASA 後續也有針對 Raspberry Pi 與 ARM 平台進行研究。[3]

而這我們就留到下一篇文章來繼續研究：

> 如何將 NASA HDTN 跑在 Raspberry Pi 上？
> 從 ARM 移植、CMake 編譯修改到分散式部署

# 結語

上一篇文章介紹了 DTN 為什麼適合太空環境。

這一篇則進一步拆解 NASA HDTN 的軟體架構，說明 Store-Carry-Forward 並不是一句抽象術語，而是由多個元件共同完成的工程流

HDTN 的核心元件包括：

| 元件                 | 功能                     |
| ------------------ | ---------------------- |
| Bundle             | 可以跨越時間與節點傳遞的資料單位       |
| Ingress            | 接收 Bundle 並判斷是否立即轉送    |
| Storage            | 在鏈路中斷時暫存 Bundle        |
| Contact Plan       | 描述未來可用的通訊窗口            |
| Scheduler / Router | 管理鏈路狀態並計算下一跳           |
| Egress             | 將 Bundle 交給正確的 Outduct |
| Convergence Layer  | 讓 Bundle 搭載在實際傳輸協定上    |
| ZeroMQ Events      | 在鏈路異常與排程改變時同步狀態        |

如果用一句話總結 HDTN 的設計精神：

> HDTN 並不假設網路永遠存在，而是讓資料在網路不存在時仍然可以安全等待，並在下一個通訊機會出現時繼續前進，

這種架構不只適用於 ISS，也可能成為未來月球、火星與深空基礎設施的重要底層能力

---

# 參考資料（References）

1. Daniel Raible, Rachel Dudukovich, Brian Tomko, Nadia Kortas, Blake LaFuente, Dennis Iannicca, et al., **Developing High Performance Space Networking Capabilities for the International Space Station and Beyond**, NASA/TM-20220011407, 2022.
   [NASA Technical Reports Server](https://ntrs.nasa.gov/api/citations/20220011407/downloads/TM-20220011407.pdf)

2. NASA Glenn Research Center, **High-Rate Delay Tolerant Networking（HDTN）**.
   [NASA Official Website](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/scan/high-rate-delay-tolerant-networking/)

3. NASA, **High-rate Delay Tolerant Network（HDTN）Software**.
   [GitHub：nasa/HDTN](https://github.com/nasa/HDTN)

4. IETF, **RFC 9171：Bundle Protocol Version 7**.
   [RFC 9171](https://datatracker.ietf.org/doc/html/rfc9171)

5. IETF, **RFC 9174：Delay-Tolerant Networking TCP Convergence-Layer Protocol Version 4**.
   [RFC 9174](https://datatracker.ietf.org/doc/html/rfc9174)

6. IETF, **RFC 5326：Licklider Transmission Protocol — Specification**.
   [RFC 5326](https://datatracker.ietf.org/doc/html/rfc5326)
