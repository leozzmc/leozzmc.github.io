---
title: "🗂️論文賞析:O-RAN 以及虛擬化 5G 網路"
description: O-RAN 論文導讀
toc: true
tags: ['O-RAN','5G']
categories: ['論文導讀']
date: 2021-08-11T09:17:57+08:00
aside: true
---

{% note primary no-icon%}
這是篇survey paper
Title: "Open, Programmable, and Virtualized 5G Networks: State-of-the-Art and the Road Ahead"
College: Institute for the Wireless Internet of Things, Northeastern University
Authors: Leonardo Bonati,Michele Polese,Salvatore D’Oro,Stefano Basagni,Tommaso Melodia
Citation: 24
{% endnote %}


# Abstract
5G很多好處
Software-defined cellular networks 也帶來很多變化
目前也許多5G開源專案，本篇會介紹非常多當前的開源5G專案以及其內部細節
並介紹其框架跟相應的硬體環境與Testbeds

# Introduction

5G應用多元 - VR、遠程手術、高解析串流影像、私有(private)蜂窩網路，而傳統行動網路架構則相對不靈活、不彈性，無法滿足實現5G應用所具備的條件，現行行動網路的黑箱做法帶來許多限制，像是軟硬體隨插即用(plug and play)，但卻缺乏了重新設定的能力，並且無法控制大量可用資源，使其難以使網路操作達到即時流量控制這件事，並難以進行資源管理，效能也沒有最佳化，難以實現**Connectivity-as-a-Service (CAAS)** 技術，例如專用蜂窩網路(private cellular network)。

業界與學界皆認為5G應該改變這種Plug and play的作法，應該要採用可程式化、開放、資源共享、邊緣化的網路解決方案，例如 SDN、網路虛擬化、MEC(Multi-access Edge Computing)，這些方案使得動態網路控制與敏捷管理成為可能。同樣的，**網路切片(Netwrok Slicing)** 與  **C-RAN(Cloud RAN)** 也證實了 共享基礎架構(infrastrucutre sharing) 不僅能夠使資源利用最大化也能帶來新市場機會。傳統封閉的的電信網路一般人難以接觸到，現今由GNU Radio Libraries 定義的軟體範例被納入**OpenAirInterface(OAI)** 和**srsLTE** 之中，並可在商用SDR設備上快速部屬。軟體框架上像是O-RAN，運行在white-box 伺服器上，可供重新設定與優化網路和收發器功能。

# Architectural enablers of 5G cellular networks
## Architecture

行動網路已改變整體架構，從以往黑箱硬體配有專用軟韌體的架構變成基於運行在SDR或其他硬體的開元軟體，但這其實從4G時代就一直討論到現在。5G從spec上就極有敏捷部署的彈性在，在早期階段也在弄軟體化的服務，這種  **flexibility-by-design** 讓5G一開始就比較屌。此章節介紹從4G到5G的網路架構、RAN、核網、部屬範例、SDN、NFV、網路切片、MEC、智能(Intelligent)網路
![](https://i.imgur.com/5fc7spi.png)

這張圖來看，4G部屬與5G似乎沒有差別，但其實在Core Network內部組成與設定卻差很多，
|組成|4G|5G|
|---|---|---|
|RAN|LTE|NR|
|Core|EPC|5GC|

4G EPC中有許多組成以往執行在專有硬體上的，最近才開始部署在軟體上的，
而5GC則是一開始就根據 基於服務的方法來設計的 EPC Server 被分成許多 **虛擬網路功能(Virtual network functions)** 來提供特定功能，彼此之間也透過開放標準界面來溝通；5G RAN中也有相似的拆分原則，(CU/RU)...etc
### NR
- wider range of carrier frequencies (mmWave Spectrum)
- frame structure: OFDM-based，更具彈性、每個sub-frame中傳遞的可變數量的symbol，並可使用比LTE更大的頻寬(400Mhz per carrier)
- 訊號與程序的整合，用以管理mmWave的定向傳輸
- **5G RAN可以接到4G EPC (non-standalone config) 與5G 5GC(standalone config)**
- NR 基站 = gNodeBs 允許分散式部屬: protocol stack的不同part可以分散在不同硬體組件中
- NR的protocol stack中，在PDCP上在疊了一**SDAP(Service Data Adaptation Protocol) layer** ，它管理點對點流量之間的QoS，並將其mapping到gNodeB- UE link之間的本地資源，其他層皆有更新達到NR功能

### CU/DU split and the virtualized RAN architecture
NR中最創新的事就是將3GPP Stack 中的較高層(PDCP、SDAP、RRC)於較低層(RLC、MAC、PHY)分成兩個不同的logical units，也就是 CU(Control unit)與DU(Distributed Unit)，並可部屬在不同地方。而physical layer中的較低層可以與DU分開，獨立成一個RU(Radio Unit)；CU、DU、RU彼此可以藉由定義好的界面以不同的data rate跟latency來相互溝通。

這種架構出現在3GPP中，並使vRAN成(virtualized RAN)為可能:
`attenna 元件` $\longrightarrow$ `RU`
`baseband、signal processing 單元` $\longrightarrow$ `CU、DU`
以上皆可跑在通用或多廠商的平台或硬體元件上，若不同不同RAN components之間的介面是開放的，則部署上按照 O-RAN model走。

### The 5G Core
service-based approach 控制與用戶平面核心功能被拆分成多個網路功能，3GPP中有定義這些網路功能的API，可實現彈性網路部屬與網路切片。
- **UPF(User Plane Function)**: User到網路之間的gateway，作為移動性的錨(anchor)以及**QoS分類器**
- **CPF(Control Plane Function)**:4G時的MME，大多被分配進了**AMF(Access and Mobility Management Function)**；**SMF(Session Management Function)** 負責分配IP地址到UE，並編排(orchestrates)用戶平面服務(例如:哪個UPF是UE該使用的)

## Enabling technologies for softwarized 5G cellular networks
5R整合不同功能組件、架構將會十分龐大，要管理將會是難題。5G網路參考了雲端計算生態圈中廣泛而完整的流程與架構，將虛擬化、軟體化整合在一起，使服務與辜能從原有硬體中抽離出來。

### `Softwarization and software-defined networking`
為了整合不同廠商硬體元件之間的功能與設定參數，5G系統仰賴**軟體化(Softwarization)**
1. SDN 
2. Openflow protocol

> SDN: 將網路控制從data plane中解耦出來，將routing與controlling程序從原有的基於硬體的轉發操作中分離出來。5G中則是將RAN、邊緣硬體元件從它們的網路和服務功能中分離出來。

RAN架構中只有RU維持基本transmit receive功能，其餘控制與處理則以藉由開放介面與API來用軟體操控。

### `Network function virtualization(NFV)`
每項網路功能藉由VNF(Virtual Network Function)以軟體實踐，並執行在VM上(建立在通用硬體上)，NFV其中一項優點是每個VNF都提供原子級別的功能，**因此多個VNFs可以結合在一起** 創造出更複雜、特定的網路功能。

![](https://i.imgur.com/H0J0R7K.png)
1. The Network Orchestrator: 管理物件基礎架構上的VM，和其運行的服務
2. VNF:跑在VM上並執行網路功能
3. NFVI(Network Function Virtualization Infrastructure):由多種通用硬體組成

>　open source network virtualization project:  **Open Platform for NFV (OPNFV)**
>　提供測試工具、驗證程式來加速企業和服務商網路轉換成NFV

## RAN and Core Network slicing
Network Slicing是一種multi-tenancy虛擬化技術，其中網路功能從硬體和軟體中提取出來，並作為切片來提供給所謂的 `tenant` (租戶，房客)。物理基礎架構(基站、光纖、)會在多個租戶之間共享，一個租戶可能會收到一個或多個切片。 每個切片會分配特定的物理資源，並基於該物理資源上建立獨立的虛擬網路的[**實例化(instantiate)**](https://www.ibm.com/docs/zh-tw/spss-modeler/SaaS?topic=node-what-is-instantiation)，雖然租戶對自己的切片具有資源控制權，但卻無法與其他切片互動，這又被稱為**slice isolation/orthogonality**

每個切片涵蓋RAN與Core的部分的特定網路功能，租戶可在選定基站上透過RAN切片實例化提供 CaaS (for private cellular networking) 給行動用戶。也可分配RAN切片給特定的服務、用戶、應用上 Ex. 分配切片給資源需求高的應用(AR/VR)
![](https://i.imgur.com/EguDz3w.png)

這張圖在講切片技術怎樣使infra資源共享以及支援多切片嵌入在infra components的實例化並列出相關的開源軟體專案，他們各自對這個架構上的哪些部分做控制與設定和實體化。

### 網路切片優點:
1. 每個切片都可以保留來處理具有不同安全要求的特定流量類別，並分配不同數量的資源，從而實現基礎設施級別的**服務差異化(Service differentiation)**
2. 切片由軟體控制，可實現對網路切片的即時、根據需求的實例化、重新設定與撤銷以適應時間變化的流量需求並符合**SLAs(Service Level Aggrements)**
3. 未充分利用資源以網路切片形式可出租給 `MVNO(Mobile Virtual Network Operators)`，來實現資源的最大利用程度，並給予infra提供者新的營利商機

網路切片需要被動態編排、實例化、撤銷，並符合SLAs，並對於故障或中斷有強大的容忍性。

**OSSs(Operations Support Systems)**
OSS可透過對網路切片的閉路控制與管理來，作為保證履行服務的工具
同時，為垂直行業提供切片服務的運營商和基礎設施所有者必須通過專門用於反映垂直行業需求的服務的切片來生成多樣化的報價。
**BSSs(Business Support Systems)**
BSS 將需要控制這個多樣化的環境並為每個切片實施動態計費和定價機制

## Multi-access edge computing
5G高效能的訊號處理、傳輸機制、資料傳輸率仍無法滿足其吞吐量和對低延遲的要求，像是處理VR/AR等這種即時性高的應用，而**MEC**能解決這問題。

MEC將架構的基本組件移到更靠近使用者的位置，通過建立在邊緣計算、內容緩存、NFV 和 SDN 的基礎上，MEC為 5G 應用的延遲和吞吐量需求提供了有效的解決方案。

1. 由於內容與資料在邊緣被處理，因此資料僅需偶而傳輸至CN，進而使傳輸延遲時間降低，也使CN負擔降低。
2. 支持本地化服務供應，提供蜂窩網路專網，用於健康、環境監測、邊緣IOT運算...etc

## Intelligence in the network
`ML/AI`
資料驅動、自動化的5G網路變成可能，可用不同的use case去訓練並最佳化RAN
用例範圍從預測流量需求以擴展 CN 資源 到減少超可靠和低延遲通信 (URLLC) 中的延遲

而實現這種方案的框架即為O-RAN，透過與gNB,eNB互動的RIC來監控資料、學習與執行閉路驅動。

# The radio access network
> 這章描述用於部屬4G/5G的開源函式庫和框架，細節都可以在專案官網找到，故不贅述

### OpenAirInterface
https://openairinterface.org/
### srsLTE
https://www.srslte.com/
### Radysis open source RAN contributions
https://www.radisys.com/solutions/openran
# Core Network
此章節闡述針對4、5G的主流開源方案 i.e. EPC, 5G Core
## Evolved Packet Core (EPC)
4G EPC的實現已在 2.1節討論過，通常包含

```[]
- MME(Mobile Management Entity)
- Home Subscription Server(HSS)
- Service Gateway(SGW)
- Packet Gateway(PGW)
```

**MME(Mobile Management Gateway)**
- 與UE建立連接的控制訊息
- 尋呼與移動性程序
- NAS信令(signalling)
- 安全功能像是追蹤區域列表管理
- PGW/SGW選擇
- UE身分認證
- 可達性程序
- 承載管理(bearer management)
i.e. EPC情況下為UE與PGW之間的通道，5GC情況下為UE與UPF之間的通道
- 支援EPC與E-UTRAN之間的控制平面信令協定
- 可靠的訊息傳輸服務
- 支援用於UDP控制訊息的通道協定
- 支援用於對UE進行認證、授權、計費的協定

**HSS(Home Subscription Server)**
- User Database: 儲存subscriber資料(id 與 key)
- User Authentication
- 提供User與MME之間的介面

SGW與PGW組件通過 **[GTP](https://zh.wikipedia.org/zh-tw/GPRS%E9%9A%A7%E9%81%93%E5%8D%8F%E8%AE%AE)** 為用戶與控制平面傳送資料
i.e. GRPS Tunneling Protocol User Plane(GTP-U)、GRPS Tunneling Protocol Control Plane(GTP-C) 並使用UDP作為傳輸層協定

{% note info %}
    GTP 5G也有實作，去年被爆出洞  
　https://www.ithome.com.tw/news/138340
　https://itw01.com/8JS4VEH.html
{% endnote %}

支援Packet Routing和Forwarding，分配IP位址給UE，Paging機制，支援LTE EPC的開源專案有:
```
- OpenAirInterface(with OAI-CN)
- srsLTE(with srsEPC)
- Open5GS
- Open Mobile Evolved Core(OMEC)
```

各開源專案對於EPC各介面實作情況
![](https://i.imgur.com/671qK43.png)

## 5G Core
![](https://i.imgur.com/pZoXlQI.png)

目前實踐5G核網的開源專案是**Free5GC**，是基於NextEPC(現在的Open5GS)去實作的，
提供
- 使用者存取、移動性、會話(AMF與SMF)管理
- 由其他NF提供的服務發現(Service Discovery)功能  (NRF)
- 提供NFs來選擇分配UE的切片 (Network Slice Selection Function)
- 管理、儲存、取得使用者資料 (UDM、UDR)
- UE的認證 (AUSF)
- 核網的運營與管理 (Operations, Administration and Maintenance (OAM))
- 網路編排 ...etc

有被free5gc實作出的3GPP介面:
- **N1/N2**: 分別連接AMF到UE與RAN，用來進行會話與移動性管理
- **N3/N4/N6**: 分別連接UPF到RAN,SMF,與網路(data network)
- **N8**: 連接UDM 與 AMF，進行使用者認證程序
- **N10/N11**: 分別連接SMF到UDM與AMF，負責處理訂閱及會話管理請求
- **N12/N13**: 分別連接AUSF到AMF與UDM，它們啟用認證服務

# RAN and core frameworks

這章描述了多個運用在RAN與核網的**開放框架**
雖然第三、四章所講的軟體可以執行特定功能，但以下段落所介紹的框架更通用且範圍更廣，並與RAN、CN用於管理、控制與協調

*開放框架與架構整理*
![](https://i.imgur.com/qE16Kyt.png)

## O-RAN
由O-RAN聯盟所提倡的針對vRAN的開放標準定義，並有兩大目標。
第一個是藉由部屬在edge的智慧控制器來整合ML,AI技術
第二個是對於開放與敏捷的定義，由RAN的不同元件之間定義明確的介面來實現，
**由於O-RAN必須公開相同的API，因此很容易將組件替換為其他相同功能的替代組件** 這種作法使5G O-RAN可以整合不同廠商的元件。

![](https://i.imgur.com/LP2jmRl.png)

### O-RAN architecture
最頂部的SMO運行著一個non-RT RIC，它以高於1秒的粒度(granularity)執行**控制決定**(control decisions)，它可以提供O-RAN不同功能，例如說可以針對RAN所提供的資料來訓練不同的演算法。

然而 near-RT RIC，運行著一個**控制迴圈**，並且有著比較密集的時間區間(decision < 10 ms)，會依賴RAN不同的start,stop,override或control 的型別而有所不同 e.g. radio resource management

**這些API可被安裝在near-RT RIC上的應用程式(又稱xApps)來使用**
而這些xApps可由第三方實體所開發並從公共商店(marketplace)中取得。
舉例來說，藉由near-RT RIC和它的xApps，營運商可以控制用戶移動過程(user mobility processes，即 handovers)，根據預測的聯網車輛和無人機的路徑來分配網路資源，執行負載平衡和交通轉向並優化排程策略。near-RT RIC也可以使用在non-RT RIC中所訓練的演算法來做點事。

O-RAN的其他組件像是CU/DU/RU，像是5G gNB被拆分成CU/DU/RU和4G eNB。CU又被進一步拆分成，控制面CU跟用戶面CU。根據3GPP對於不同拆分的定義，O-RAN選擇 **split 7-2x** 作為DU/RU的拆分；因此在編碼、調變、和mapping資源都是由DU做的；然和解調變、cyclic prefix addition和digital to analog則是在RU中實現，而precoding則是在兩者中都行。

### O-RAN interfaces
兩個RIC之間的介面為A1介面，而non-RT RIC使用 O1介面與RIC和4G eNB互動

- A1介面讓near-RT RIC可提供:
    - policy-based guidance to near-RT RIC(以防它偵測到其掏做未實現RAN的效能目標)
    - 管理ML Model
    - 向near-RT RIC提供豐富資訊，例如從RAN外部來源，來更進一步精細RAN的優化

- O1介面，則是具備操作與管理功能，並努力與現有標準兼容來實現與現有框架的完美整合，例如說他仰賴NETCONF或其他3GPP所定義的API。

- non-RT RIC使用O1介面來:
    - 供應管理(provision management)
    - 故障監督(fault supervision)
    - 效能保證服務 (performance assurance services)
    - 啟動、註冊和更新實體設備
    - 管理通訊監控設備

- near-RT RIC也暴露了E2介面到其他不同元件上(CU,DU,eNB)；這個介面只專注部屬
    1. near-RT RIC對於E2介面終端節點的控制操作
    2. 管理RIC和這些節點互動行為

- E1與F1介面符合3GPP的規範。

E1介面跑在控制與用戶面CU之間，它的主要功能是特定UE的trace蒐集與承載建立(bearer setup)和管裡
F1介面則是跑在CU與DU之間，它有兩個不同的版本，一個是連接到控制面CU另一個則是用戶面CU；F1負責在CU與DU之間傳送信令(signaling)和資料，以執行**RPC程序** 和**PDCP-RLC交換**。

最後，與RU之間的介面，則是由O-RAN內部的Open Fronthaul工作組來制定，這個介面攜帶用於data plane的**compressed IQ samples**和用於beamforming和其他物理層程序的控制消息。

### O-RAN Deployment Options
O-RAN設想了不同的部屬策略，分別是在區域(regional)或邊緣雲(edge cloud)或者是在營運商擁有的蜂窩基站。每個設施都可以運行O-Cloud，即容器和虛擬機，使用開放介面執行O-RAN程式，
或是有個專用的站點使用O-RAN的開放API但可以運行閉源程式碼(closed source code)，兩種情況下圖皆有描述，其描述了6種不同的O-RAN部屬組合

![](https://i.imgur.com/dxigwNb.png)

在 Scenario A，所有元件除了RU以外，都部屬在網路邊緣，共同位於**與fronthaul光纖連接的** 相同的資料中心。

其他部屬策略是 RIC與CU共同部屬在區域雲設施中，而DU與RU位於網路邊緣或是蜂窩基站上，而首選的部屬策略是 **Scenario B**

```
RIC在區域雲上
CUs,DUs在edge
只有RU是在營運商的蜂窩基站上
```

### The O-RAN Software Community
除了標準化活動，O-RAN也有軟體社群(OSC)，與Linux Foundation合作，貢獻符合O-RAN規範的5G軟體

第一個版本的釋出是2019的Amber release
第二個版本是2020的Bronze release

這些 release包含了Docker容器和多個O-ran組件的開源軟體:
- non-RT RIC :具有A1介面控制器和管理AI模型的能力
- near-RT RIC 平台: 具有多個應用程序，像是:
    - admission control
    - UE manager
    - performance and measurement monitor 
    可藉由E2介面與DU溝通
- DU:
    - 一個初始版本的fronthaul函式庫
- 一個用於操作、管理、維護以及虛擬化架構的框架
- simulator:
    - 用於測試各個介面

而 cherry release 則是嘗試透過RIC完成不同RAN Component之間的整合。

> 目前最新發行版為[F-Release](https://wiki.o-ran-sc.org/display/REL/F+Release)

而 **SD-RAN** 專案也正在領導、開發一項開發工作，目標是實現與O-RAN RIC介面整合的開源規、符合3GPP的RAN。
## Open Networking Foundation frameworks
由多家電信營運商組成的聯盟，這些運營商提供用於部屬其網路開源程式以及框架
包含: OMEC、SD-RAN、ONOS
Components Projects 為了特定目的框架與軟體，而Exemplar包含了許多的 Components Projects。

## Other frameworks and projects
除了O-RAN與ONF方案，許多開源社群也釋出了針對連通性、切片和核心的框架與專案

### 5G-EmPOWER
是一套用於**異構(heterogenous)** RAN架構的作業系統，它由一個開源、可重新程式化的軟體平台組成，該平台將物理基礎設施抽象化，並提供高階API來操控RAN功能。

5G-EmPOWER 也將控制平面和用戶平面分開，這種分離實際上是由兩個主要組件組成: 一個中央控制器與一組代理。
**中央控制器:**
1. 作為OS，並且完全了解物理基礎設施功能
2. 透過OpenEmpower協定來發送控制指令以編排代理的行為

**代理:**
1. 運行在每個網路單元上
2. 將底層RAN特定的協定(LTE、Wifi)實作 抽象化到控制器
3. 根據控制器的指令來修改底層協定參數

5G-EmPOWER目前支援多種無線電存取技術(Radio Access Technologies, RAT)
包含LTE、Wifi、LoRa  (5G NR尚未支援)

此外還有以下專案:
- FlexRAN
- Magma
- LL-MEC
- LightEdge
- OpenRAN (不等於O-RAN Projects)
- Akraino REC
- NVIDIA Aerial

## Open virtualization and management frameworks
除了RAN與CN軟體，虛擬化與管理框架也扮演重要的角色。
>ETSI定義了一個NFV MANO框架(Management and Orchestration)應有的共同特徵，主要是為了編排(Orchestrating)網路功能(NF)

![](https://i.imgur.com/IjG4wat.png)
*上圖指出這些NFV對應在5G生態圈中的哪個部分*


**NFV Orchestrators** 負責提供網路服務，i.e. 實體及虛擬網路功能(PNF/VNF)的結合能夠經由特定的拓樸來連接在一起，來管理它們的生命週期。

根據 ETSI架構:
一個NFV Orchestrator 由下列組成:
1. 一個管理虛擬化基礎設施(e.g. VIM(Virtualization Infra. Manager)框架，例如OpenStack,Kubernetes,Docker等)的子系統以及與物理硬體的連接
2. 一個實際的MANO框架
3. 它所管理的VNFs的集合
這些框架有著Northbound、Southbound API來與其它蜂窩網路組件互動
本章將會討論虛擬化技術、VIMs，討論受歡迎的 MANO框架像是ONAP、OSM、Open Baton

## Virtualization techniques
NFV將部署在網路中的服務與其運行的硬體基礎設施分離，而應用程式都被包進與硬體分隔虛擬機中，NFV消除了對每個NF對特定硬體的需求，實現網路的可擴增性

![](https://i.imgur.com/QBfrv68.png)
*此圖為NFV的高階架構圖，並展示多種實現方式*

## Traditional Virtual Machine
硬體層級虛擬化、提供機器節級別的隔離，透過guest OS與kernel來模擬電腦系統
由於VNF有許多硬體虛擬化要求，因此傳統VM被認為是一種資源密集型的作法
## Bare-metal hypervisors
bare-metal hypervisor VM做法與傳統VM做法相近，但這種做法是Hypervisor直接run在主機的硬體上而不需要主機的作業系統，也可用於管理+運行容器或unikernel，而不是整個虛擬機
## Containers
打包特定程式以及它的dependencies，以虛擬化的方式來run應用程式和服務的虛擬環境
容器間彼此分隔，並共享host OS以及對kernel的存取，比起VM，不需要將底部硬體虛擬化，相比來說輕便許多，而容器可被透過與Host OS相接的**容器管理員(container manager)** 來維護
或透過Hypervisoer直接跑在裸機Host機器中

開源容器系統:
- **LXC**: 現代容器的主要實踐辦法，透過cgroup與namespaces隔離以創造有獨立網路和process空間的虛擬環境
- **Docker**: 允許創造容器，使用OS級別的虛擬化來將他們部屬在機器上，與lxc不同點它將服務、應用、依賴項分解成每個容器內的模組化的單元跟分層，而這些分層可多個容器共享，增加容器映像檔的效率。
### Unikernels
Unikels是微小、輕量，特製的image，唯一目的是為了run特定的應用程式，他們會將應用服務和其依賴編譯成可執行的虛擬映像檔，過程中不會去包含不必要的組件，因此unikernel能比起傳統容器和VM達到更好的效能；因為unikernel只會包含運行目標應用所必需的軟體元件因此暴露了比較少可能被惡意攻擊的功能，來提高系統的安全性。

目前已知Unikernel系統: **ClickOS**, **IncludeOS**, **OSv**,**MirageOS**, **Unik**


蜂窩網路相關的Unikernel應用如下:(論文)
- 整合Android的函式庫到OSv以降低MCC(Mobile Cloud Computer),MFC(Mobile Fog Computing)行動運算負擔
- 基於unikernel的5G網路CDN，如ClickOS,OSv,MirageOS
- 其中一篇論文對5g應用實例化為 VNF的IncludeOS unikernel和Docker做效能比較

## Hypervisors
是一套軟體用來跑虛擬機(guest machines)在實體機器上的(Host Machine)
Hypervisor的的關鍵任務是
1. 在主客體機器間提供虛擬化
2. 管理客體機器資源的分配與重新分配(CPU,Memory,Storage)
3. 主客體機器之間的資源調度

有兩種類別的Hypervisor: Type1 ,Type2
**Type 1 :**  Hypervioser直接跑在裸機(bare-metal)host機器上，並在host上作為OS
Example: Xen, Vmware ESXi
**Type 2 :**  作為軟體層跑在host OS上
Example: Linux Kernel-based VM (KVM),BSD bhyve, Oracle Virtual Box

### Virtualization infrastrucutre managers(VIM)
VIM負責控制與管理NFV基礎設施架構和其資源，像是儲存、計算、網路資源、並在Host硬體上協調客體機器的實例化。**VIM屬於MANO框架的一部分**，框架部分前面提過了

VIMs的範例有: **OpenStack**、**Kubernetes**
- **OpenStack**: 一個雲端計算平台，能夠控制大量異構(heterogeneous)資源，像是計算、儲存、網路資源等。在它的眾多功能之中，它可像是VIM一樣，管理網路基礎設施、虛擬機、容器、unikernel、VNF服務和應用
- **Kubernetes**: 提供自動化部屬、擴充、管理VM、容器、unikernel、和其應用；透過一系列的物件來抽象化和表達系統的狀態，這些持久性實體描述了在K8S管理的cluster上跑的VNF和應用程式、它們的可用資源以及有關其預期行為的策略。
    經過數年也有數個與k8s互動來處理協定層Layer2,Layer3複雜問題的專案，像是**Istio**、**NSM(Network Service Mesh)** 等
    - Istio mesh service: 實作流量管理、策略執行、和遙測收集(telemetry collection)等任務
    - NSM:NSM透過Kubernetes API以支援進階使用案例並促進採用新的cloud native方案，並且它也能夠允許網路管理員執行無縫執行任務，像是請求網路介面、添加無線電服務等等

## The Open Network Automation Platform 
主要是由Linux Foundation開發的一套NFV框架，有許多支援的營運商。
OAN被部屬在多個商業蜂窩網路之中，其廠商像是Ericsson,Nokia,Huawai,ZTE這些公司，他們提供ONAP支援並整合進他們的產品。

ONAP對於商業蜂窩網路中最讚的基於軟體的解決方式。
ONAP負責處理大量網路服務的設計、創造和生命週期管理

網路營運商可用ONAP編排部屬在他們網路中的PNF與VNF。除了NFV orchestrator共同擁有的功能(對於虛擬基礎設施或網路服務使用自動化且基於policy的管理)，ONAP還提供一個**設計框架**來模擬網路應用和服務，以一個**資料分析框架**來監控服務的修復和擴增

ONAP還提供了許多的參考設計(i.e. blueprint)，可用來為特定場景(5G Networks,VoLTE...etc)部屬部屬ONAP架構，

![](https://i.imgur.com/gaDoMDa.png)

ONAP架構的主要components:
- **Management Framework:** 又被稱為**OOM** (ONAP Operations Manager)，負責編排與監控ONAP組件的生命週期，OOM利用K8S和**Consul**來支援服務控制、發現、設定和分段。在它的功能中最值得注意的是
    - Component deployment,dependency manager and configuration
    - real-time health monitoring
    - service clusteromg and scaling
    - component upgrade,restart and deletion
- **Design Framework**: 
    - 允許使用宣告式的**模型語言** 來建立網路服務，使得可以指定每個服務的要求和功能。
    - 它允許通過一組通用規範和策略來對資源、服務、產品及其管理和控制功能進行**建模**。
    - 它還包括用於系統資產、流程和策略的定義、模擬和認證的服務設計和創建模組。
    - 模組也提供現有服務的資料庫和用於驗證網路功能的API
- **Run-time Framework**
    - 由許多軟體框架組成，用於大多數的管理與編排功能
    - 當在run-time階段，Micorservices Bus允許由ONAP管理的不同網路功能(NF)之間的訊息與資料通訊及路由
    - run-time框架使用自動化的control loop來調度終止微服務，並從平台收集資料和分析資料
    - run-time component有公開API、dashboard和cmdline工具，透過一個統一的介面來控制網路基礎施設施 

在這些框架底層可以用來與外部控制器、作業系統、雲端環境整合；nothboud API則提供給OSS/BSS，大數據及相關服務。

## Integration with 5G networks
除了一般的行動網路編排與管理框架，ONAP提供了與5G部屬相關的重要功能
通常營運商的主要要求會是需支援hybrid infra
- 須包含軟硬體設備
- 邊緣自動化，雲須分布在地理位置上不同的邊緣位置
- real-time 分析(須使用自動化的control loop)

The Frankfurt release (June 2020)與O-RAN整合

## Open Source NFV Management and Orchestration
Open Source NFV Management and Orchestration(OSM)是由一堆網路營運商開發的一個MANO框架。
與ONAP相似，也被開發及部屬在蜂窩網路之中。


![](https://i.imgur.com/rPRGyRL.png)
*OSM的架構圖*
- **The information model**:
    將為NF,切片建模為模板，稱為packages，這是由ETSI MANO框架所提供的定義明確的資訊模型來實現的。與ONAP的design components類似，它使電信營運商能夠分析網路需求，並對需要為功能、服務、切片部屬的資源進行建模。
- **The OSM Automation Framework**:
    它自動化了NF的生命週期，從初始化到擴增到刪除，而這由應用資訊模型到實際部屬的infra上
    ，來完成的(可看上圖)，透過自動化框架向不同建模組件公開northbound interface
    
與ONAP一樣，OSM southbound norhtbound APIs可公開給外部服務，像是其他編排器和OSS/BSS等
# Software-defined radio support for open source radio units 
SDR設備
USRP、BladeRF、LimeSDR、Iris
# Testbeds
介紹開源應用、框架、硬體元件用來實例化及軟體化5G網路的測試平台

![](https://i.imgur.com/QvOZnqY.png)

# Softwarized 5G: Limitations and road ahead
- Keep pace with the standards
- Latency and scalability issues.
- Limited contributions for RAN open source software


{% note info %}
論文連結: https://ece.northeastern.edu/wineslab/papers/bonati2020open.pdf
{% endnote %}