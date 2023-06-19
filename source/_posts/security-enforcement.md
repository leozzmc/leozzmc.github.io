---
title: >-
  Security policies definition and enforcement utilizing policy control function
  framework in 5G
description: 論文導讀_如何透過5G的PCF網路功能框架來實現安全策略定義和執行
toc: true
tags:
  - 5G
  - Security Policy
  - 3GPP
categories:
  - 論文導讀
top_img: 'https://i.imgur.com/FXfawHh.jpg'
aside: true
abbrlink: de3933f9
date: 2021-09-01 05:02:34
featuredVideo:
---

<style>
    :root{
    --maincolor: #50fa7b;
    }
   .info{
    padding: 15px;
    margin-bottom: 20px;
    color: #ffffff;
    border: 1px solid transparent;
    border-radius: 10px;
    background-color: #343232;
    border-color: #b8bdb4;
   }
   .special{
        border-bottom: 3px solid var(--maincolor);
        color: inherit;
        text-decoration:none;
   }
   .newbold{
        color: #ffffff;
        font-weight: bold;
        text-decoration:none;
   }
   a{
    color: #337ab7;
    text-decoration: none;
   }
</style>


## 1. Introduction
本篇討論的是3GPP定義的5G System(5GS)範圍之中的網路安全議題

### 5G標準制定
許多組織或會議對於開發5G架構有卓越貢獻，尤其是在安全層面:

```
- ITU
- ETSI
- IETF
- NGMN
- 5G-PPP
- NIST
- GSMA等等
```

有些負責在特定infra上像是關鍵基礎設施，其餘則是為特定用例開發安全標準
> S3A Working Group → 定義5G網路 end to end 安全層面

### 5GS
5G System = Access Network + Core Network + UE
System Arcitecture → Service-Based Architecture → Is composed of multiple NFs
SBA架構中，不同的NFs之間的互動可以兩個NF的點對點的參考點來表示
**SBI(Service-based Interface)** 用來表示一個給定的NF要如何提供或開放一組服務


**Policy Control Function(PCF)** 是一個網路功能用以提供統一且一致的框架來定義任何類型的策略，在前幾代行動網路中，PCF僅用於QoS或計費方面的策略制定

5G架構中增加了對於網路資料分析的服務，藉由一個新的NF，NWDAF(Network Data Analytics Services)
用於
```
1. 負載級別(Load Level)資訊
2. 服務體驗
3. 網路效能
4. 異常行為
```

<span class="special">PCF可以訂閱與此類資訊相關的網路分析通知，並用於計算或更新策略，但這目前尚未標準化</span>
新的統一策略控制框架與5G系統以及增強的資料分析實體之間並無建立明顯的連結，而本篇論文的結果可以幫助這三項區域變得更加緊密

主要目標是要找到一個有效的security enforcement schema用以彈性地建立新的安全策略，並動態地回應持續變化地安全環境，橫跨5G end to end 架構。

對於橫跨5G系統地Security Enforcement應在**TSG-SA** 層級被討論

5GS架構中對於User Plane Security Enforcement，會是基於UE與基站之間的air interface其中地機密性與完整性演算法是否啟用


對於UP的完整性保護演算法是可以選擇性啟用的(例如各切片可以是否啟用)

### 網路切片
<span class="special">個別網路切片提供不同種服務可能會有著不同的安全需求，並採用不同安全協定與方法；因此對於不同的網路切片提供不同層級的安全防護會是關鍵</span>

對於安全加密演算法的使用也是選擇性的(e.g. 128bits vs 256 bits key length)
像是對於關鍵基礎設施的安全需求以及enhanced Mobile Broadband 大量使用場景的安全需求也有所不同


將 QoS 原則應用於安全，目標應是利用統一的策略控制框架，並利用新的資料分析功能作為對於網路以及UE知識基礎，在 5G end to end 架構中實現有效的安全策略定義和執行


現行對於電信網路的保護策略不外乎防火牆、IDS、DDOS保護系統等等，並被廠商的特定管理工具所管理
而這些安全功能是為了保護整個網路或根據他們在網路中的定位，而未考慮個別UE

1. 偵測到單一UE發生安全問題的能力
2. 應用解決措施到單一UE的方式到目前都是個問題

本篇研究補足了這些機制，並從end to end網絡的角度豐富了安全性，並提共適當的粒度(granularity) 來考慮個別UE的安全策略
→對於 uRLLC 以及 mMTC 部屬場景有幫助


![](https://i.imgur.com/BOTV0hU.png)

## 2. Challenges to apply end to end security enforcement in 5G 
為了實踐end to end security enforcement，有四大挑戰要解決
```
- 為Security Enforcement應用QoS原則
- 會話管理和用戶平面
- 策略控制
- 網路分析
```

### 2.1 Challenges to apply QoS principles to security enforcement
當根據業務需求（例如在垂直市場中產生）將 QoS 實施基本原則應用於安全實施時，主要困難之一是能夠以與 QoS 在網絡中量化的類似方式來衡量安全特性

QoS 配置文件被很好地定義為應用於 QoS 流的一組 QoS 參數（QoS 流是分組數據單元 (PDU) 會話中 QoS 區分的最細粒度）。這種參數化是定量的，即可以用數字來衡量。例如，5G QoS 標識符是一個由標量表示的參數，用作 5G QoS 特性（如調度、權重、准入閾值等）的參考。甚至還有預先配置的標準化值。但是，如何在 5G 架構中構建安全配置文件，如何建立完整性保護、機密性保護、訪問控製或惡意軟件檢測等方面的量化安全參數化？我們解決這個問題的提議在第 3.1 節中提出。

### 2.2  Challenges at session management level to enforce security controls
SMF負責接收由UE所發送來的建立PDU Session的請求
然而現今的PDU 請求並沒有包含任何安全參數

所以UE請求**特定的** 5G UP安全服務，即"安全的PDU"，是不可能的
然後像是政府關鍵基礎設施可能就有需求是，應提供特殊安全措施在UE與Data Networl之間的PDU Session
例如某些**資料無線電承載(Data Radio Bearer)** 支援某些服務中的強加密演算法或更長的加密金鑰

SMF在建立PDU會話時，根據來自
```
- UDM的Subscriber資訊
- 每個DNN/SMF中切片的本地配置UP安全策略
- 每個UE所支援的最高Data Rate
```
用以在PDU Session建立UP Security Enforcement 來在每個DRB中提供完整性保護
SMF的本地配置被認為是全局適用(global applicable)的靜態策略

問題是這種靜態方法對於之後的的用例是否仍然有效，其中訂閱計劃可能與安全增值服務和相應的租戶（例如關鍵基礎設施的所有者）需要不同級別的安全（例如每個切片）和對安全事件作出反應的能力

這些use case需要彈性、可擴展和動態的策略管理以及設定
此外，security enforcement只是指示是否要在NG-RAN網路區域應用UP完整性與機密性保護，並僅適用於3GPP類型的存取


UP Security Enforcement 從NG-RAN擴展到傳輸以及核網會是個挑戰
(即PDU會話提供的整體連接的end to end security enforcement方法 會是個挑戰)

![](https://i.imgur.com/7xtxVnm.png)
圖2顯示了當前UP security enforcement以及注意事項

![](https://i.imgur.com/JwXF00a.png)


一旦PDU Session建立，
當前Session的特徵(即PDU會話資訊)僅限於一些主要與QoS相關的資訊元素(例如:QoS Flow ID,Reflective QoS Indicator)
當發生了PDU層級的安全事件，並沒有觸發緩解措施的安全屬性
例如，當應用程式處理被歸類為機密的資料時在UE與Data Network之間的PDU Session內會需要特別的安全措施，像是DRB所支援服務中所使用的強加密演算法或更長的加密金鑰

> 在 3.25章節開發了一個框架，為PDU層級的安全事件提供安全屬性

### 2.3 Challenges to fine security policies under policy control framework

雖然為每個訂閱定義安全策略很費力，但這與為QoS進行此操作似乎沒甚麼不同
可以預期，安全策略與QoS測並非真正獨立，而是相同策略可被應用在大量訂閱 e.g.per slice

**Policy and Charging Control rule (PCC rule)** 包含啟用用戶面偵測、策略控制、對於服務資料流的適當計費所需的資訊

兩種PCC rules存在:動態與預定義規則
動態規則由PCF提供給SMF，而預定義PCC規則則是被設定至SMF

當動態規則與預先定義的PCC規則有相同優先級，則動態規則優先
這些policies的目標是:
- PDU sessions
- Service Data Flows (SDF). Set of PDUs (within PDU session) identidied by traffic filters

PCF Control是否應用於PDU Session是由SMF策略基於DNN或每個切片去定義的
若沒有PCF Cnotrol，則本地基於策略的rule會在SMF被設定


PCC rule 定義包含:
- Sevice data flow detection mechanism  (ex. filters, application template)
- Charging releated Information Elements(IEs) 
- Policy control related IEs  (ex. Gating, QoS, bit rates...etc)

service data flow filter 包含用於匹配IP PDU流量以及Ethernet PDU流量的用戶平面資料
SMF應用啟用的PCC規則內的Service data flow template information來指示UPF去識別屬於特定
service flow的封包

<span class="special">作為一個PCC規則一部分的安全資訊元素的適當定義會是一個關鍵挑戰</span>

目前 **3GPP TS 23.503: Technical Specification Policy and Charging Control Frameworkfor the 5G System** 所定義的PCC Rules不明確包含此類參數，也不作為能夠識別安全事件的服務資料流偵測的一部分，或者做為策略控制操作的一部分。 此外，SMF發送有關PDU Session狀態(e.g. 存取類型、漫遊、IP位址等等)的PCF資訊，因此PCF可以基於特定觸發器做出動態反應從而相應變更策略，所以安全觸發器的定義非常重要，因為它不僅會影響網絡的安全狀態，還會影響網絡的整體 QoS 和 SLA（例如 DDoS 攻擊），然而去創造這些安全觸發器(例如，最近發現的安全漏洞、詐欺、攻擊、違規存取等等)會是挑戰，在UPF或其他特定安全探測器(security probe)中設定一部分偵測過濾器(detection filter)，其策略目標是將安全保證(security assurance)層面包含進網路整體的服務保證中。

<span class="special">⚠️目前問題則是，如何使安全性成為 PCF 的 PCC 決策過程的一部分？</span>
本篇論文在3.3章節提供解答

### 2.4 Challenges to introduce security use cases under network analytics


**Network Data Analytics function (NWADF)** 作為SBA架構出現在Release 15


可以有多個專門用於不同類型分析的 NWDAF，由分析 ID 訊息元素 (IE) 標識。此 IE 用於識別 NWDAF 可以生成的受支持分析的類型。 NWDAF 出於不同目的與不同實體進行交互，例如基於訂閱不同網絡功能提供的事件的數據收集、從數據存儲庫和 NF 檢索訊息，以及向不同類型的消費者按需提供分析，目前NWADF的資料蒐集功能僅允許從控制平面來源為切片或UE獲取資料，但目前如何從UPF蒐集有關用戶平面安全資料尚未標準化，這實際上目前僅限於流量和數據速率。

**OAM(Operation,Administration and Management)** 系統僅測量與追蹤資料，這些資料可通過Management Service 共享給NWADF


出於安全分析目的，從用戶平面流量分析中收集的有關惡意軟體、殭屍網絡、協定異常等的資訊，例如通過 [18] 提出的安全探測器（例如嵌入 UPF 中的 IDS）或惡意軟件沙箱，將非常有用通過新的安全用例增強網絡分析。

這些分析資訊環繞網路切片的負載水平、服務體驗、網路效能、移動性、QoS、UE行為等等
提供了有價值的知識基礎

本文範圍中有三個基本問題被提出:
```
- 如何從所分析知識的基礎上取得安全性相關的資訊?
- 在NWADF中可監控和進一步分析哪些特定的新安全參數?
- 在end to end 5G架構中PCF，要如何利用這些資訊來設定並執行安全策略?
```

## 3. Proposed approach to security enforcement in 5G
從實施角度來看，到目前為止，行動網絡中安全策略和 QoS 參數的實現在網絡中存在很大差異


5G PCF是一個單一框架用來定義任何類型的策略並將其遞交給其他控制平面上的NF

從不久的將來角度來看，當租戶要求的訂閱計畫(Subscription Plan)將需要包含安全條款時，即安全性作為SLA的重要組成部分，就像當今的QoS一樣，我們提出了新的security enforcement方式利用了統一策略控制模型

### 3.1 Application of QoS policies to security use cases

```=
- session-AMBR
- UE-AMBR
```

我們的提案是，這些 QoS 策略可以在接收安全事件或事件時從 PCF 受限制地和動態地應用到網絡中，這些安全事件可以在 NWDAF 或用戶平面的其他安全分析平台（例如，放置在管理平面中的 SIEM 工具，嵌入在 UPF 中的 IDS 系統等）中建立

基於預定義的安全指標，可以從 PCF 執行不同的策略，實際上作為網絡中的有效緩解機制：
- 設定新的session AMBR
- 設定新的UE AMBR，這將會是一種對於UE的隔離 (例如，UE是作為DDoS攻擊的active bot)
- 在QoS Profile內使用更嚴格的安全控制以設定新的PDU Session


QoS profiles 可在5G AN中由SMF動態建立；可以透過來自SMF的N1介面上的會話管理信令或直接在N4介面上的UPF上對UE實施特定的QoS規則

N1介面: UE $\leftrightarrow$ AMF
N4介面: SMF $\leftrightarrow$ UPF 用以在用戶平面中管理資料會話
N4基於PFCP協定(Packet Forwarding Control Protocol)

SMF 確實通過規則管理 QoS 流，將流量過濾器與來自 PCF 的 QoS 策略相關聯。
流量過濾器集在 UPF 中配置，可用於輕鬆管理安全服務。例如：
- 由具有特殊安全要求（例如加密演算法、密鑰長度等）的特定一組UE或切片的特定安全參數index標識出的安全關聯
- 像是交通控制之類的偵測與動態QoS 規則可以被動態應用

下面流程圖描繪了應用安全規則作為在網路中QoS策略的一部分概念:
![](https://i.imgur.com/3514RyB.png)

下圖為透過以上概念實現的安全呼叫步驟
![](https://i.imgur.com/1t07hXz.png)


*1.a* <span class="special">**NWDAF → PCF**</span>
PCF訂閱了NWDAF通知
由於網路安全事件(ex. DDoS)，我們發現了使用者資料擁塞的情況，該情況透過N23介面傳送給了PCF

*1.b* <span class="special">**Security Management → PCF**</span>
安全管理系統通過REST API與PCF整合而成
安全事件被報告給PCF

*1.c* <span class="special">**PCF → UDR(optional)**</span>
PCF藉由N36介面向UDR請求一組資料
在此用例中，請求資料可以是訂閱策略集的安全策略部分的ID，以在發生安全事件時應用。

*2.* <span class="special">**PCF → SMF**</span>
當PCF做出策略決定後，PCF則確定SMF需要更新策略資訊以緩解安全問題，並藉由N7介面發送一個
**Npcf_SMPolicyControl_UpdateNotify** 請求其中包含關於PDU Session的更新策略資訊，在這種情況下建立新的 Session AMBR

*3.* <span class="special">**SMF → PCF**</span>
SMF回應PCF一個ACK

*4.a* <span class="special">**SMF → UPF**</span>
基於SMF所發送的QoS Emforcement Rule的QoS enforcement是一個由UPF提供的功能
包含通過N4介面對Session AMBR (Step2 從SMF接收來自PCF)

*4.b* <span class="special">**SMF → UE**</span>
藉由AMF與UE交換N1 SM信令，來提供UE QoS規則
e.g. 設定新的UE-AMBR 來限制在UE所有PDU Session中所有Non-GBR QoS Flow所被預期可提供的最高Bit rate

*4.c*  <span class="special">**SMF → 5G AN**</span>
藉由AMF與5G-RAN交換N2 SM信令，以設定5G RAN的QoS參數
e.g. 為特定類型的流量預留資源

### 3.2. User plane security enforcement and assurance

在UP 流量上實現安全策略的方式是一樣是基於策略控制

直接作用於AMF、SMF等控制NF，而PCF應到達UE、RAN和UPF以直接在UP上應用這些策略


#### 3.2.1. Security policies enforcement via AMF

![](https://i.imgur.com/MfoI2Au.png)

有兩種類別的策略是為了**存取**與**移動性管理**
它們被AMF執行、由PCF規定並儲存在UDR中
它們可以支持安全用例，而無需對策略定義進行重大更改：

- Policies transfered from PCF to AMF:
    -  Service area restrications
    **Tracking Area** 是一種區域上的邏輯概念，使用者可在其中移動而無須更新管理節點，網路會分配一個或多個TAs到使用者上
    而Service area restrication包含**允許區域**與**非允許區域**
    本篇論文提出，使用特定閥值為不同服務區域建立安全等級，來決定使用者是否有權移動到高安全服務區域
    舉例: 地理上的敏感地區，像是關鍵基礎設施可能會限制對使用 **"Null Schema"** 來產生SUCI的使用者的存取，以防止像是惡意基地台的影響，換句話說可能會允許支援UP完整性保護的使用者存取
    ![](https://i.imgur.com/EXWGDgX.png)
    -  Priorities of area types the user may use
    適當的優先權定義可避免**降級攻擊**，迫使UE連接到更多脆弱性的網路(像是2G)，比起4G、5G網路來說更容易遭受攻擊，攻擊者可以通過使 UE 和網絡實體分別相信對方不支持安全功能來嘗試降級攻擊，即使雙方實際上都支持該安全功能
    ![](https://i.imgur.com/8nbzQWr.png)
    **Anti-Bidding down Architecture** 在Release 15中已經定義，但目前並為真正生效，因為它的目的是在於防止從未來的增強安全功能降低到當前的安全功能
    ![](https://i.imgur.com/PC8zo8N.png)
    
- Policies transferred from PCF to the UE via AMF
    - User Equipment Route Selection Policy to determine how to route egress traffic(PDU selection policies)
    當安全事件發生時可能會觸發新的PDU Session(e.g. 在UE中的惡意程式偵測)i.e. 
    一種在data path上具有特殊策略的**隔離** PDU，甚至是在具有特殊安全服務的安全DN中終止的PDU
    
<span class="special">LADN(Local Area Data Network)的概念在5G中用於支援MEC，並支援上述措施的實踐。LADN對僅授權在某一組位置(被稱為**LADN Services Areas**)中的PDU Session中實施限制。</span>

<span class="special">LADN services Areas 在AMF中基於每個DNN去進行設定，而AMF會提供UE LADN Service Areas的資訊</span>

#### 3.2.2. Security policies enforcement via SMF
> SMF 功能介紹 : SMF負責控制一個PDU Session所需的信令(通過N4信令)，並設定這個PDU Session中的用戶平面處理(支援PDU Session的用戶平面功能(UPF)的選擇)

因此SMF控制了UPF所支援的功能，包含安全相關的功能像是，防火牆、節省流量、DDoS保護、GPRS Tunneling Protocol(GTP)、(新的Inter PLMN UP Security in Release16)等等功能

此外它還控制策略執行(policies enforcement)，即與PCF互動來獲得策略，並將其直接應用到UPF(via N4)或藉由AMF應用到NG-RAN網路中的其他部分.

> Proposal: 提議是被嵌入到UPF的安全控制可通過PCF中的安全策略進行管理

此外，這個新概念將使air interface中的用戶平面安全實施策略（機密性和完整性保護）在 PCF 中管理（而不是像今天一樣在 SMF 中本地配置），而它們是來自UDR(作為具有預定義安全策略的策略設定文件的儲存)

因此，這些策略應要是專用於用戶平面安全的Dynamic PCC rules的一部分，並可能擴展到其他的domain或UP介面，像是:
N6: UPF $\leftrightarrow$ Data Network， 基於IP或Ethernet傳輸
N3: UPF $\leftrightarrow$ 5G-RAN，基於GTPv1-U(GPRS Tunneling Protocol User Plane)
N9: UPF $\leftrightarrow$ UPF，用以傳輸用戶平面資料，基於GTPv1-U

#### 3.2.3. UP security enforcement use cases
用於 5G 概念的 N6-LAN 應允許 PCF 設定 UPF 以實現安全服務功能鏈到數據網絡
![](https://i.imgur.com/ZkrVdFk.png)

>  N3 介面保護機制:  TS33.501 表明在N3(UPF $\leftrightarrow$ RAN)進行資料傳輸應具備機密性、完整性、重放攻擊保護。所需機制是IPSec ESP和 IKEv2 基於憑證的授權機制，然而使用哪種密碼學機制來保護N3是取決於營運商的決定

在不久的將來，可以根據提供給一組用戶、切片和/或租戶的安全級別選擇性地部署這些類型的解決方案，具體取決於服務或基礎設施的要求和重要性

舉例來說:
例如，服務於關鍵基礎設施（例如公用事業）的專用網絡，或車載自組織網絡（VANET），當然需要對無線基地台和核網之間的通訊進行全面保護



> Proposal :  本篇論文的提議是；將用於N3的加密解決方案包含進PCC規則中，並強制執行於gNB(via AMF)和UPF系統中的安全閘道器之中(via SMF)強制執行應建立新的IPSec Tunnel或將 PDU 分配給現有的 IPSec Tunnel


同樣的概念也可應用於N9上一些用例所使用的安全方式，像是不同營運商之間互相連接。這種情況下 GTP檢查以及IPSec已被標準化，但不是作為一個"安全的SLA"的一部分通過PCF執行的，此外，通過新的分析功能（如 NWDAF）或資料庫（如UDSF,Unstructed Data Storage Function）來儲存session資料或從 UPF 或其他特定安全分析平台（可以關聯來自多個來源的事件）接收的安全事件，PCF 可以對查詢 UDR 的既定安全服務級別協議(Security SLA,SSLA)中的更改做出反應，應用新的安全策略，強制建立新的更安全的 PDU，即緩解觸發操作的安全問題

![](https://i.imgur.com/8ZkUC6D.png)

```
Ex:
在某個區域網絡中檢測到假基站
或者簡單地從安全的角度來看某個關鍵區域（例如機場、關鍵基礎設施站點等），
PCF 將對該網絡地理區域中的基站所附的相關 UE/UE 組實施完整性保護。其他約束也可以構建有效的用例（例如，連接到關鍵切片的 UE）。 UE 的策略應從“不需要”更新為“首選”或“需要”
```


下圖為PDU Session 建立的流程，以粗體顯示本論文要執行call
以提供所描述的來自 PCF 的安全策略的動態實施

![](https://i.imgur.com/pFT8Zpv.png)
###  3.2.4. Security assurance
一旦使用安全屬性（例如特定服務流的加密、完整性保護、訪問控制策略等）建立 PDU 會話，允許在網絡中進行擴展意義上的安全實施，仍有兩個關鍵方面值得關注可以考慮，即安全資料收集和cloased-loop automation，為了介紹它們，使用了Chargin Function(CHF)做為類比

![](https://i.imgur.com/SAtlROD.png)


使用資料收集可用於計費、收集統計數據和監控整體網絡使用情況和 UE 行為。
當使用者超出某些閥值後(ex.花費額度限制)CHF會告知PCF，而PCF會將此考慮進動態應用相關策略至user session e.g. 給定PDU Session的QoS限制、重新導向到營運商網頁等等

> Proposal: 使用來自UPF中的嵌入式安全功能的安全相關資料來增強/豐富資料收集

SMF負責從UPF收集增強/豐富資料並傳送到**中央安全管理系統** (儲存資料，並將其與網路中各種安全專用平台所蒐集的安全資訊做相互關聯) e.g. 防火牆log、Security telemetry、IDS Log等等


安全管理系統要負責創造安全事件，並在 PCF 和/或 SMF 上觸發操作
e.g. 通知 PCF 某些安全 SLA 已被越過，將用戶流量重新導向到例如清理中心或專用安全 DN 等。

在 5G 中 UPF 在 4G Evolved Packet Core 中承擔流量檢測功能的角色，即封包檢測（例如基於業務數據流的應用檢測），因此它可以執行 PCF 策略。事實上，實現 UPF 的技術集成了越來越多的安全功能，如防火牆或運營商級網絡地址轉換。

5G 核心允許 PCF 在發送到 UE 的連接相關策略和發送到網絡的策略之間進行協調，這些策略可以部署在用戶平面的 UPF 中，例如嵌入在 UPF 中的 L7 防火牆中的安全策略，用於針對特定用戶的特定服務。以下兩個用例說明了這個概念：

### use case1
根據3GPP TS 23.503，PCF支援的用於PDU Session的SMF 選擇管理(Selection Management)的功能之一是，向AMF提供策略以通知PCF去針對特定DNN執行DNN replacement，此類replacement操作的觸發器，可能是由於安全事件而受損的DNN，由於特定DN或切片過載(ex. DDoS)，而通過NWADF報告給PCF

### use case2
當 SMF 收到 PCC 規則時，SMF 可以採取措施重新設定 PDU 的 UP。這些行動之一可以是使用新的指導規則來更新UPF，例如將某些可疑流量轉發到本地資料中心(Ex. MEC)，目的是在網路中的小型受控區域內遏制潛在的安全漏洞

MEC 的概念是促進 UPF 在網絡邊緣的部署，更靠近 UE，有時用於關鍵應用程序
e.g. Ultra Low Level latency use case、快取、體育場館等

作為對事件的響應(response)，應用功能(Application Function,AF)可以向5G核網(i.e PCF or via Network Exposure Function(NEF))發出請求，已將一組UE甚至整個切片的流量引導至位於邊緣的UPF，可以部署 DDoS 保護、清洗中心、IDS/IPS 等安全功能作為遏制機制。

> AF功能: AFs與3GPP 核網互動，以提供服務:像是應用程式對流量路由的影響、存取NEF、與策略框架互動(藉由N5)等等 i.e. 它請求動態策略
如今，AF 作為 MEC 調度應用程式或 IP Multimedia System (IMS)。

> Proposal: 將 AF 的範圍擴展到安全應用：

- 對於流量路由(traffic routing)的影響作為安全緩解機制
舉例:測到攻擊（例如 DDoS）時的 BGP Injection 和路由變更
- 藉由NEF存取5G核網
舉例:提供威脅情報源的第三方安全公司
- 與策略框架的互動
舉例: 由於不可預測的安全事件或由於新的威脅簽名而提供新的 SDF 過濾規則的策略變更

### 3.3. Establishing security policies as part of PCC rules

PCC規則將 **SDF模板**(服務資料filter的列表或應用程式filter的應用程式ID)
以及對流量的可能操作(策略實施)連接起來

以 3GPP 提出的當前行動為基礎，專注於純粹的QoS actions，我們建議出於安全目的擴展和應用這些actions，並歸納成表 1

![](https://i.imgur.com/gXZeTff.png)

3GPP TS 23.503的6.3.1表格列出了PCC規則中包含的資訊，像是資訊名稱(information name)
、描述(description)、以及PCC是否可在SMF內被啟用的Dynamic PCC規則之中修改此資訊

表2 顯示 TS 23.503的6.3.1表格的摘錄
![](https://i.imgur.com/a7jUM1v.png)
表格中的灰色區域顯示了在原標準上增添的元素

在"Security"類別中，有兩項Information Elements，這兩項元素涉及目前在用戶平面中存在的安全策略，但目前僅在SMF中進行本地管理且僅限於Access Network(AN)
我們的貢獻是使它們成為 PCC 規則結構的一部分：

- 以PDU的層級來看，PCF 還可以控制 PDU Session的不同參數，其中包括 SMF 從 PDU Session中獲取新策略的條件（策略控制請求的觸發器），而這些條件對於定義安全用例十分重要 i.e. 
若這些條件是安全觸發器(e.g.意外事件、過載、超出閥值等)，則PCC 安全規則將從 PCF 傳達到 SMF，並在 UPF 和/或 5G-RAN中執行。

- PDU Session相關策略資訊的目的是提供分別適用於單個監控金鑰匙或整個PDU Session的PCC(Policy and charging control)，PCF 可以將 PDU 會話相關的策略訊息與 PCC 規則一起或單獨提供給 SMF

TS 23.503的6.4-1表格包含了PDU Session相關的策略資訊
表3 顯示 TS 23.503的6.4-1表格的摘錄，重點關注使用監控控制相關訊息，其中提出了兩個新的監控密鑰用於 (D)DoS 攻擊檢測。
![](https://i.imgur.com/B6DC660.png)

<span class="special">最後，PCF 還應指示 SMF 檢測哪些應用程序。在收到來自 SMF 的報告後，PCF 可以做出策略決定並向 SMF 發送更新的或新的 PCC 規則。如果網絡中的特定安全分析能夠定義攻擊，則應將相同的過程應用於安全 (e.g. 在bot 與 C&C中心之間的通訊)或特徵化安全事件概況 (e.g. 意圖在通訊中使用指定協議的無效port來破壞存取控制防火牆規則 )</span>
因此，可以像任何其他應用程序簽名一樣創建安全簽名，並應用相應的 PCC 規則。

### 3.4. Security analytics implemented in NWDAF

![](https://i.imgur.com/pp10sLI.png)

NWDAF 提供的訊息可以對 PCF 執行的 PCC 決策過程做出重大貢獻

然而，分析訊息目前僅限於切片特定的網絡狀態，例如負載級別訊息。即，不需要知道使用切片的訂戶，但它在網絡切片級別工作

> Proposal: 擴展負載級別訊息，添加安全上下文訊息（例如事件、攻擊、漏洞等）

它需要將單獨實施的安全功能或作為標準化網絡功能的一部分（例如具有嵌入式防火牆功能的 UPF）提供給 NWDAF 或中間專用安全分析平台。

標準 TS 23.288 [11] 為不同類型的 NWDAF 提供了可能性，專門用於不同類型的分析，由Analytics ID Information Element 所標識。

PCF 可以通過 N23 接口使用此訊息。其中一些訊息已經可以為安全分析和進一步實施提供非常有用的訊息，如前幾節所述。

[11] 的表 7.1-2 顯示了 NWDAF 服務提供的分析訊息。我們在此表中添加了一列，其中包含可能被提取到其他安全分析功能以進行進一步分析或直接提取到 PCF 框架以應用特定安全 PCC 規則的安全資訊（參見表 4）。

![](https://i.imgur.com/URrNthl.png)

安全分析特別有趣的是 NWDAF 捕獲的與異常行為相關的網絡數據分析。

PCF 可以使用 **Nnwdaf_AnalyticsSubscription_Subscribe** 服務操作去訂閱與 "異常行為" 相關的網絡分析通知，目的是預測和檢測安全問題、觸發新的安全策略或更新特定 UE 或 UE 組的現有安全策略。 該封包括Analytics ID（"Abnormal behaviour"）、分析報告目標**SUPI**、**Internal Group ID** 和分析過濾器(filter)，包括異常 ID 列表和每個異常 ID 的可能閾值

前的異常 ID 列表在 [11] 中指定，例如“意外的 UE 位置”、“懷疑 DDoS 攻擊”、“錯誤的目標地址”等。標準的表 6.7.5.3-3 提供了減輕風險的策略和行動示例，例如“擴展服務區限制”、“釋放 PDU 會話”、“更新封包過濾器/QoS”等。

如本文檔第 2.4 節所述，挑戰在於，在用戶平面級別，每個應用程序的通信描述僅限於該通信的流量和數據速率，與體積類型的攻擊（例如氾濫、過載、DoS 等）。

統計或預測中的變化或異常，例如 UE 通信的周期、通信持續時間或某些流量特徵（例如異常端口、可疑 DNN、其他有用訊息等）、上傳/下載量（平均值和方差） ) 可能表示安全事件或事故。

在用戶平面層面，新提案包括，除了數量、變化和異常之外，NWDAF 可以直接從 UPF 收集真實的安全事件（事實），這要歸功於附加或嵌入其中的用戶平面安全檢查功能。此安全訊息可能會被 PCF 等活動 NF 使用，以動態更新 UE 組中特定 UE 的 PCC 規則、更改 PDU 或什至在需要時在切片級別採取行動

## 4. Future work

基於本論文提出的Security Enforcement的原則，有三個領域可以進一步去研究
- specific security analytics supported by machine learning algorithms
- roaming scenarios, including local break out
- applicability to IoT use cases

## 5. Conclusion
![](https://i.imgur.com/VkTuInH.png)

## 參考資源
https://www.sciencedirect.com/science/article/pii/S0140366421001262

meeting簡報: https://drive.google.com/file/d/1RK6R5yjRuvS-BhdTjZPhOXAg9ghlW2O6/view?usp=sharing