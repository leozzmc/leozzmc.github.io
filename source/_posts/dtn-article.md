---
title: 為什麼太空網路需要 DTN？從 TCP/IP 的限制到深空網路
tags:
  - Space Networking
  - DTN
  - Bundle Protocol
  - NASA
  - Distributed Systems
categories:
  - Space Infrastructure
description: >-
  本文介紹 Delay/Disruption-Tolerant Networking 的核心概念，說明為什麼太空網路不能直接套用地面 Internet 的
  TCP/IP 假設，並從 NASA LunaNet、Bundle Protocol 與 Contact Graph Routing
  的角度理解未來太空網路架構。
toc: true
aside: true
cover: /img/DTN/cover.png
abbrlink: 7d41a775
date: 2026-05-05 18:56:21
---

# 前言：在太空中，我們還能順暢地上網嗎？

> 前陣子看了 [NASA Artemis II 繞月行動的直播](https://youtu.be/_eeZQw9PBc0)，看著火箭升空，算是見證了人類的另一個里程碑。 
> 近年不論是 NASA 、商業月球酬載服務（CLPS）、SpaceX Starship 的進展，以及各國對月球與深空任務的投入，都讓**太空基礎設施** 不再只是科幻概念，而是逐漸走向工程實作的問題。但身為一個工程師，我腦中浮現出一個很實際的問題：「如果我們要在太空發展科技，甚至建立基地，那我們地球上現有的網路架構，搬到太空中還能直接用嗎？」為了解答這個疑惑，我就爬了一些相關論文與技術文件中進行研究。這篇文章，就算是我的學習筆記跟總結～

直覺上，我們可能會認為：「只要把天線做大、訊號功率推高、多發射幾顆中繼衛星，不就能把地球上的 Internet 延伸到太空了嗎？」但實際上，太空網路面臨的挑戰，絕對不是單純的 **頻寬不夠** 或 **訊號太弱** 。

**最根本的問題在於：整個網路環境的基本假設，在太空中完全變了。**

因為地球上的網際網路，通常假設端到端（end-to-end）的路徑絕大多數時間都是暢通的，封包可以在極短時間內抵達目的地。斷線通常視為「異常狀況」。但在太空網路中，超長延遲、間歇性連線與通訊中斷才是家常便飯。NASA 對 **DTN (Delay/Disruption-Tolerant Networking)** 的介紹也指出，DTN 的目標是在太空通訊這類長延遲、易中斷的環境中，提供更可靠且標準化的資料傳輸方式 ([NASA][1])。

{% note info %}
DTN 的核心不是想辦法讓光速變快，而是坦然承認「延遲與中斷是不可避免的」，並將網路傳輸重新設計成一個可以儲存、等待、轉交與恢復的系統。
{% endnote %}

---

# 地球上的 Internet，為何不適合太空環境？

我們每天滑手機、打 API、登入遠端伺服器，背後都默默依賴著一套我們習以為常的 TCP/IP 假設：

* 來源與目的地之間，當下一定能找到一條連通的路徑
* 往返延遲（RTT）極低，通常在毫秒到數百毫秒之間
* 如果封包遺失，通常代表網路壅塞、設備故障或暫時性的干擾
* 連線中斷是一種 Exception，而不是常態
* 路由拓樸雖然會改變，但絕對不會以天體運行的尺度與速度在劇烈變化

在地球上，這些假設非常合理。即使跨洲連線，延遲也通常還在 TCP 可以忍受的範圍內；即使中間某顆 Router 壞了，底層的路由協定也能迅速找到替代路線～

**但太空環境完全是另一回事。**

在太空中，地球、月球、火星、衛星、探測器與地面接收站，全都在相對運動。通訊節點之間的 **通訊窗口（Contact Window）** 可能只在特定的時間點才會出現。另外，不同天線的角度、個別設備的能源限制、不同的軌道位置、甚至是星體的遮蔽，都會直接決定某一條 Link 當下到底通不通。

而 NASA 在 **ION-DTN** 的教學材料中也提到：極遠的距離、極高的資料遺失率、軌道運動造成的拓樸變化，以及航天器為了省電而不連續的操作，都會造成太空通訊比地面網路複雜好幾個維度 ([ion-dtn.readthedocs.io][2])

我們可以用一張表來快速對比兩者的差異：

| 情境維度 | 地面網路假設 | 太空網路現實 |
| :--- | :--- | :--- |
| **路徑連通性** | 端到端路徑通常存在 | 端到端路徑可能暫時不存在 |
| **網路延遲 (RTT)** | 通常極短（毫秒級） | 可能是秒、分鐘，甚至更久 |
| **斷線認知** | 是一種異常或錯誤 | 是一種正常狀態 |
| **拓樸穩定度** | 相對穩定 | 隨軌道與通訊窗口不斷變化 |
| **重傳成本** | 相對低廉 | 非常昂貴，甚至會因此錯過通訊窗口 |
| **節點狀態** | 設備多半 24 小時在線 | 航天器常處於低功耗、離線或被遮蔽狀態 |

{% note warning %}
在地面網路中，斷線通常代表有東西壞了，但在太空網路中，斷線很可能只是網路拓樸的日常而已
{% endnote %}


# TCP/IP 在太空環境中的三個致命傷

## 1. 延遲的尺度：從毫秒變成「分鐘」

如果大學學過基本計算機概論應該也知道， TCP 的設計高度依賴 ACK 、Timeout、重傳機制與壅塞控制，而這些機制在地球上運作得超棒，因為 RTT 很短。但在太空中，距離會把延遲無情地放大：

* 低軌道衛星與地面站之間，可能還勉強維持在毫秒到數十毫秒
* 地球到月球的單程光速約 1.3 秒，RTT 就來到了 2.6 秒
* 如果是地球到火星，延遲會隨兩者軌道位置變化，可能高達數分鐘到二十幾分鐘

這意味著，如果我們硬要在地球和火星之間建立傳統的 TCP Session，光是握手和等待一個 ACK，連線可能早就 Timeout 了，更慘的是，TCP 會把這種 **物理上的長延遲或遮蔽斷線** 誤判為 **網路壅塞**，進而觸發降速與重傳，徹底拖垮傳輸效率

## 2. 間歇性連線：對方不是隨時都在

太空節點之間並不是永遠互相可見的。想像一下這些情境：

* 月球探勘車開進了隕石坑，不一定能直視地球
* 月球背面的探測器，必須等像是中繼衛星飛過來才能對地球傳送資料
* 衛星為了節省能源預算，可能暫時關閉通訊模組
* 太陽、行星、衛星本身的自轉與公轉，隨時會造成訊號遮蔽

> 太空版本的網路的問題可能不是「現在有沒有一條完整的路可以走？」
> 而是：**既然現在沒有路，那下一個可用的通訊機會是什麼時候？在那之前，這包資料應該先存在誰那裡？**

## 3. 把中斷視為常態：Disruption as Topology

如前所述，地球上的斷線代表故障或異常，但太空中的中斷，卻往往只是因為 **衛星剛好飛出可視範圍** 或 **天線正在轉向** 。因此，太空網路需要的不是單純且激進的 Retry 機制，而是一種能把「中斷」本身納入正常運作模型的網路架構。 而這就是 DTN 誕生的契機～

---

# DTN：Store-Carry-Forward

DTN 的全名是 **Delay/Disruption-Tolerant Networking**。

它是專門為了應對長延遲、間歇性連線、不穩定鏈路與高錯誤率而設計的網路架構。 `IETF RFC 9171` 中也明確指出，DTN 是一種適用於 **highly stressed environments** 的架構 ([IETF Datatracker][3])

傳統網路的運作邏輯很直接：
```text
送出 (Send) -> 尋找路由 (Route) -> 立即抵達 (Deliver)
```

而 DTN 的邏輯則是：
```text
儲存 (Store) -> 斷線時隨身攜帶 (Carry) -> 遇到連線機會時轉交 (Forward)
```

航太業界通常將這個模式稱為 **Store-Carry-Forward**。當一個 DTN 節點收到資料時，它不需要立刻轉送出去。如果下一跳（Next Hop）目前不在可視範圍內，它可以先把資料安全地「存」在本地的硬碟或記憶體中，等到下一個 Contact Window 出現時，再把資料「轉交」出去。

{% note success %}
DTN 的思維模式不再是尋找一條當下貫通的路徑，而是規劃資料該如何穿越一系列「未來會出現」的通訊機會，最終接力抵達終點。
{% endnote %}


# DTN 現實世界舉例

這邊舉個例字，如果 TCP/IP 像是一通即時的電話來電，那 DTN 應該就更像一套跨國物流系統。因為你在寄包裹時，寄件人和收件人不需要同時在線上，貨車、飛機、物流中心也不需要在同一秒鐘連成一條線。你的包裹會先抵達集貨站 `Store`，跟著飛機飛越太平洋`Carry`，等到達目的地國家的理貨中心後，再交給當地的司機送達 `Forward`

這也是 DTN 運作的原理：

| 屬性 | 傳統 Internet | 太空 DTN |
| :--- | :--- | :--- |
| **舉例** | 即時電話 | 郵政 / 物流系統 |
| **資料單位** | Packet（封包立刻轉送） | Bundle（包裹可以暫存） |
| **路徑依賴** | 需要連續的端到端路徑 | 依賴一系列未來的通訊機會 (Contacts) |
| **時間容忍度** | 對 Timeout 極度敏感 | 可以容忍長時間的等待 |
| **通訊模式** | Session-oriented | Message/Object-oriented |
| **斷線認知** | 是一種 Failure | 是一種正常狀態 |
| **路由考量** | 基於當下的拓樸狀態 | 基於加上「時間軸」的動態拓樸 |

> 也就是說：**在太空中，等待本身就是網路協定必須處理的一部分**


# Bundle Protocol

在 DTN 的世界裡，最核心的協定叫做 **Bundle Protocol (BP)**。

如果說傳統 IP 網路的基本資料單位是 **Packet**，那麼 DTN 的基本資料單位就是 **Bundle**。  
你可以把 Bundle 想像成 DTN 世界裡的 **標準貨櫃**：它不只是單純承載資料，也包含來源、目的地、建立時間、存活期限，以及後續路由、安全與狀態追蹤所需的 metadata。

這也是 Bundle 和一般 packet 最大的差異。Packet 通常假設自己會被網路立即轉送；Bundle 則被設計成可以被節點暫存、延後發送、跨節點轉交，並在通訊中斷後繼續等待下一次傳輸機會。

目前最現代化的 Bundle Protocol 版本是 IETF RFC 9171 定義的 **BPv7**。CCSDS（太空資料系統諮詢委員會）也在 2025 年發布了基於 BPv7 的太空通訊實驗規範。這代表 BPv7 已經不只是學術概念，而是逐漸被納入未來太空資料系統與任務互通性的標準化基礎 ([ccsds.org][4])。

{% note info %}
Bundle Protocol 的重點不是把資料切得更小，而是讓資料變成可以被「保存、等待、轉交與追蹤」的任務級訊息單位。
{% endnote %}

## Bundle 裡面到底裝了什麼？

為了幫助理解，可以把一個 Bundle 簡化成下面這種結構：

```text
Bundle
├── Primary Block (主區塊)
│   ├── Source Endpoint (來源地)
│   ├── Destination Endpoint (目的地)
│   ├── Creation Timestamp (建立時間)
│   └── Lifetime (存活期限)
├── Extension Blocks (擴展區塊)
│   ├── Routing Metadata
│   ├── Security Metadata，例如 BPSec
│   └── 其他任務或協定相關資訊
└── Payload Block (酬載區塊)
    └── 實際的任務資料，例如 science data 或 telemetry
```

其中最重要的是 `Primary Block` 和 `Payload Block`。

Primary Block 提供這個 bundle 在 DTN 網路中被辨識與處理所需的基本資訊，例如來源、目的地與存活期限。Payload Block 則承載真正要送出的任務資料。Extension Blocks 則提供額外能力，例如安全性、路由輔助資訊或其他 metadata。

換句話說，Bundle 不只是資料本身，而是一個帶有上下文的資料容器。它知道自己從哪裡來、要去哪裡、可以活多久，也能攜帶額外資訊，讓中繼節點在沒有端到端連線的情況下仍然可以做出轉發決策

### Bundle Node 的內部結構

理解 Bundle 之後，下一個問題是： **誰負責處理這些 Bundle？**

在 BPv7 的架構中，負責送出、接收與處理 bundles 的概念性節點稱為 Bundle Node，它是一個由多個功能元件組成的 DTN 節點。`CCSDS BPv7 Experimental Specification` 中將 Bundle Node 描述為任何可以 send and/or receive bundles 的 entity。從架構上看，它主要由三個概念性元件組成：

- Application Agent (AA)
- Bundle Protocol Agent (BPA)
- Convergence Layer Adapter (CLA)

![Graphical Representation of a Bundle Node](/img/DTN/bundle-node-ccsds.png)
> Ref: Graphical Representation of a Bundle Node. Source: CCSDS 734.20-O-1, “Bundle Protocol Specification, Experimental Specification,” Figure 1-1 [4]



這張圖可以這樣理解：

| 元件 | 功能 |
| :--- | :--- |
| **Application Agent (AA)** | 負責與上層應用互動，包含處理 application data 與 administrative records |
| **Administrative Element (AE)** | 產生與處理 administrative records，例如 bundle status report |
| **Application-Specific Element (ASE)** | 處理真正的應用資料，例如 science data、telemetry 或 mission payload |
| **Bundle Protocol Agent (BPA)** | 執行 Bundle Protocol 本身的程序，負責 bundle 的接收、處理、儲存與轉發 |
| **Convergence Layer Adapter (CLA)** | 將 bundles 送到不同底層網路，例如 TCP、UDP、LTP 或 CCSDS link protocols |


> 簡單來說，AA 負責應用層資料，BPA 負責 Bundle Protocol 的核心邏輯，CLA 負責把 bundle 實際送過某一段底層網路

這樣的分層設計很適合太空網路，因為同一個 Bundle Node 可能同時面對多種不同鏈路。例如，它一邊透過 TCP/UDP 與地面系統互動，另一邊透過 LTP 或 CCSDS space link 與航天器通訊。對上層應用來說，它只需要把資料交給 BP；至於這一段實際是走地面 IP 網路、月面區域網路，還是深空鏈路，則交給不同的 CLA 處理。


## Convergence Layer

因此，BP 並不是要取代 TCP、UDP、RF、光通訊或 CCSDS link layer。更準確來說，BP 是一種 **Overlay Layer（覆蓋層）**，它負責 DTN 層級的資料交付語意，而不是每一段底層鏈路的實際傳輸細節。

BP 透過所謂的 **Convergence Layer (CLA)** 來決定這個貨櫃在 *當下這段路* 要怎麼運送。在地球上可能走 TCP/UDP，到了太空中就改走 **LTP (Licklider Transmission Protocol**) 或 **CCSDS 的鏈路層**

真正把 bundle 送過某一段 link 的，是 CLA，可以把它想成物流系統中的不同運輸方式：

| DTN 架構 | 物流比喻        |
| :----- | :---------- |
| Bundle | 標準貨櫃        |
| BPA    | 物流調度中心      |
| CLA    | 貨車、船、飛機或鐵路  |
| 底層網路   | 實際道路、航線或鐵路網 |



在ground segment，bundle 可能透過 TCP/UDP Convergence Layer 傳輸，而到了長距離或容易中斷的太空鏈路，則可能改用 LTP或 CCSDS 相關鏈路協定

{% note info %}
簡單來說：BP 負責統籌從出發到抵達的長期策略，而 Convergence Layer 只負責搞定從這一站到下一站的短程運輸
{% endnote %}

理解了 Bundle、Bundle Node 與 Convergence Layer 之後，就可以看出 DTN 的基本運作邏輯：資料會先被封裝成 bundle，由 Bundle Node 儲存與處理，再透過不同的 CLA 在各種底層網路之間一站一站轉交~


但這裡會出現下一個問題：

> 如果太空中的節點不是隨時互相連線，那 Bundle Node 要怎麼知道什麼時候可以轉交資料？又該選擇哪一個下一個 hop？

這就需要進入 DTN routing 中非常關鍵的概念：**Contact Plan**

# Contact Plan

理解 Bundle Protocol 之後，下一個問題就是： **太空網路要怎麼做 Routing？**

在地面網路中，路由器通常根據目前的網路拓樸決定封包 next hop。但在太空網路中，某條 link 現在不通，不代表它永遠不通，它可能只是要等到下一個軌道位置、下一次地面接收站Contact Window，或下一次衛星進入通訊範圍。因此，在 DTN 中，我們需要先認識一個很重要的概念： **Contact**，也就是 **通訊機會**

在 DTN 中，Contact 指的是： **「兩個節點在某段具體時間內，可以互相傳送資料的機會」** 。這不只是一條連線，它還帶有`時間` 與 `容量` 的屬性，例如：

```yaml
contact:
  from: LunarRelay-1
  to: EarthGroundStation-Madrid
  start: 2026-05-05T10:00:00Z
  end: 2026-05-05T10:12:00Z
  data_rate: 50Mbps
  latency: 1.3s
```

> 把所有已知未來的 Contacts 集合起來，就成了一份 **Contact Plan**

如果說地面網路的 Routing Table 是當下網路的一張平面地圖，那太空網路的 Contact Plan 就是一張帶有第四維度（時間）的一種立體時刻表，有點科幻，下面可以幫助理解：

![](/img/DTN/contact-plan.png)


> 所以可以把 Contact Plan 理解成自帶時間軸的太空拓樸地圖


# Contact Graph Routing (CGR)

有了時刻表，我們就需要一種演算法來幫我們規劃路線。傳統網路AS的 OSPF 或 BGP 只在乎現在哪裡有路，但在太空中，決策邏輯必須變成：

* 這條路什麼時候才通？
* Contact Window 有多長？夠不夠把資料傳完？
* 下一個中繼節點硬碟滿了沒？
* 會不會有更晚出發，但更早抵達的路線？

為了解決這個問題，**Contact Graph Routing (CGR)** 應運而生。

CGR 不是在一般的網路節點上找路，而是在一個由 **未來的通訊機會 (Contacts)** 所構成的 Graph 上， **利用修改過的 Dijkstra 演算法尋找最佳解**([NASA 技術報告][6])


![](/img/DTN/cgr.png)


> 所以相對於傳統的Graph Problem，在 CGR 的世界裡，**空間的距離不是唯一考量，時間的契機才是決定資料能否抵達的關鍵**


# NASA LunaNet

DTN 絕對不是只活在 Paper 或 Simulator 裡的概念，它已經是 NASA 佈局未來月球網路架構的核心。

為了支援未來的登月計畫，NASA 提出了 **LunaNet**。它不是單一一顆衛星，而是一套標準化的網路框架。目標是讓各國家的探測器、不同廠商的中繼衛星，甚至是月面基地，都能互相連通，形成一個 **Lunar Network of Networks** ([NASA][5])

在這個架構中，DTN 就是 LunaNet 實現可靠資料傳輸的基石。


![](/img/DTN/datastream.png)



就算探測器跟地球永遠無法直接對話，只要有完善的 Contact Plan 與 DTN 協定，科學數據照樣能像接力賽一樣，一棒一棒穩穩送回地球。


# 極端的分散式系統 !?

如果你跟我一樣，背景是偏向Cloud Infra相關的工程師，其實可以把 DTN 當成一種 **運作在極端環境下的分散式系統**

因為太空網路不只是底層通訊協定而已，它其實涵蓋了大量且複雜的System Engineering Topics：

| 分散式系統概念 | 太空 DTN 的對應實作 |
| :--- | :--- |
| **Queueing (佇列)** | Bundle Queue / 優先級排程 |
| **Scheduling (排程)** | Contact-aware Forwarding |
| **Replication (副本)** | Custody Transfer (監護權移交與備份) |
| **Fault Tolerance (容錯)** | Disruption-Tolerant Delivery (斷線容忍傳輸) |
| **Resource Allocation** | 節點儲存空間 (Buffer) 與能源的分配 |
| **Observability (可觀測性)** | Bundle 狀態回報 / 軌跡追蹤 (Tracing) |
| **Security (資安)** | BPSec / 節點身分驗證 |

在地面系統中，我們大多追求快，追求那種毫秒級的即時一致性，但在太空網路裡，我們只能仰賴 **最終交付 (Eventual Delivery)** ， 因為在太空中，可靠的定義不是立刻送到，而是無論經歷多少次斷線與等待，資料最終絕對不會弄丟，況且。這些資料可能會是探勘設備或者造價昂貴的航天器的指標資料，亦或者是科學觀測資料，無論如何都有等待的價值。


# 進階議題與未來挑戰

雖然 DTN 標準已經漸趨成熟，但實務上還有非常多Hardcore 的坑等著各位去填：

## 1. Capacity-aware Routing
CGR 找路很強，但如果某個中繼節點的 Buffer 快塞爆了怎麼辦？如果多個高優先級的科學任務都在搶同一段通訊窗口呢？如何把節點的儲存容量與鏈路頻寬完美融合進路由決策中，是目前一大熱門領域

## 2. ML-assisted vs Deterministic Routing
有些人提議把機器學習引進 DTN 來預測最佳路由。但在造價昂貴的太空任務中，Explainability 與 Determinism 往往比黑盒子般的 AI 更受青睞。也就是說要如何讓路由演算法既能適應動態變化，又能讓地面控制中心精準追蹤與覆寫決策，這也是我認為未來太空網路其中一個深入研究的方向之一

## 3. Security-aware Routing
當太空網路變成多國、多機構共用的網路時，安全性就成了重中之重。如何防止惡意節點發動攻擊，在那邊 Jamming 或是竄改 Contact Plan，甚至透過發送垃圾 Bundle 癱瘓其他節點的 Buffer？這都需要更嚴密的信任機制來把關，資安到哪個領域都是議題。


# 簡易 Space DTN Lab

這聽起來像是 NASA 才有資格玩的技術，但其實我們完全可以用一般的電腦跟 Docker，架設一個最小規模的概念驗證 (PoC) 環境，因為本質上就是極端還性的分散式系統。

我們只需要切出三個節點：

```text
Node A (月球車) -> Node B (軌道中繼衛星) -> Node C (地球地面站)
```

你可以刻意設定 A 到 B 之間只有短短 60 秒的連線時間，觀察 Node B 是如何把資料暫存下來，並等待與 Node C 的連線窗口到來，最後再把資料轉發出去。


![](/img/DTN/experiment.png)



你可以使用 `tc netem` 模擬幾十秒的超長延遲，或是透過開源的 **ION-DTN** 或 **HDTN** 來測試 BPv7 的實作，進階一點可以再接上 Prometheus 跟 Grafana 來觀察 DTN 在斷線、延遲與通訊窗口限制下的核心行為。不需要真的發射火箭，你自己就能在筆電上體驗深空通訊架構的設計邏輯。


# 結語

目前地球的網際網路之所以如此偉大，大概是因為它建立在一個穩定、低延遲、大家幾乎永遠在線的環境當中。固定不動的伺服器，機房，網通設備，以及海底電纜，共同交織出這一切。但在太空，距離本身帶來了無可避免的延遲，軌道運動帶來了無情的連線中斷。這一切顯然都不是靠著加大頻寬就能暴力解決的問題

而 DTN 的迷人之處在於，它徹底打破了我們對即時連線的渴望，資料會在宇宙中搭著順風車，一步步大隊接力接力式的航向終點

---

# 參考資料 (References)

1. NASA, **Delay/Disruption Tolerant Networking**. ([Link][1])
2. ION-DTN Documentation, **Introduction to Delay/Disruption Tolerant Networking**. ([Link][2])
3. IETF, **RFC 9171: Bundle Protocol Version 7**. ([Link][3])
4. CCSDS, **Bundle Protocol Version 7 (BPv7) Experimental Specification**, 2025. ([Link][4])
5. NASA, **LunaNet Interoperability Specification Document Version 5**, 2025. ([Link][5])
6. NASA NTRS, **Multigraph-based Routing in Delay Tolerant Networks**, 2023. ([Link][6])
7. T. Alhajj and V. Corlay, **Improved Contact Graph Routing in Delay Tolerant Networks with Capacity and Buffer Constraints**, arXiv, 2024/2025. ([Link][7])
8. NASA NTRS, **Delay Tolerant Network Routing as a Machine Learning Classification Problem**, 2018. ([Link][8])
9. NASA, **DTN Resources for Mission Developers**. ([Link][9])
10. NASA, **Delay/Disruption Tolerant Networking Overview**. ([Link][10])
11. NASA NTRS, **Contact Multigraph Routing: Overview and Implementation**, 2023. ([Link][11])
12. NASA NTRS, **Dynamic Routing for Delay-Tolerant Networking in Space Flight Operations**, 2008. ([Link][12])

[1]: https://www.nasa.gov/communicating-with-missions/delay-disruption-tolerant-networking/
[2]: https://ion-dtn.readthedocs.io/en/ion-open-source-4.1.4-b.1/ion-tutorials/Day%201%20morning%20-%20DTN%20overview.pdf
[3]: https://datatracker.ietf.org/doc/rfc9171/
[4]: https://ccsds.org/wp-content/uploads/gravity_forms/5-448e85c647331d9cbaf66c096458bdd5/2025/06/734x20o1.pdf
[5]: https://www.nasa.gov/wp-content/uploads/2025/02/lunanet-interoperability-specification-v5-baseline.pdf
[6]: https://ntrs.nasa.gov/api/citations/20230007392/downloads/Multigraph_CGR_for_ICCCN.pdf
[7]: https://arxiv.org/html/2410.15546v2
[8]: https://ntrs.nasa.gov/api/citations/20190000830/downloads/20190000830.pdf
[9]: https://www.nasa.gov/technology/space-comms/delay-disruption-tolerant-networking-mission-resources/
[10]: https://www.nasa.gov/reference/delay-disruption-tolerant-networking-overview/
[11]: https://ntrs.nasa.gov/api/citations/20230002637/downloads/AeroConf_2023___Contact_Multigraph_Routing-20230221.pdf
[12]: https://ntrs.nasa.gov/citations/20150014822
