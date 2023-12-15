---
title: "\U0001F50B AWS Certified Cloud Practitioner 證照準備筆記"
description: 考取AWS Certified Cloud Practitioner 證照前所做的筆記
toc: true
tags:
  - AWS
  - Certificate
categories:
  - 學習筆記
aside: true
abbrlink: e8acb5ee
date: 2022-10-03 01:59:08
---

![](https://i.imgur.com/x1Sq6so.png)

# CCP 準備

- **考試指南**: https://d1.awsstatic.com/zh_TW/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf
- **考試題型占比**
![](https://i.imgur.com/xv5xcGu.png)

- **相關資源**
    - https://terahake.in/post/aws-ccp-certified-exp/
    - https://awslc.medium.com/aws-cloud-practitioner%E8%AD%89%E7%85%A7%E6%BA%96%E5%82%99-6b8bacc6a490
    - https://jayendrapatil.com/aws-certified-cloud-practitioner-exam-learning-path/?fbclid=IwAR3eiyroyZ_jTn2pA5ut_ophP8JNCzgspERnug_luC_HGltA-OkLwRwrhAU
    - https://d1.awsstatic.com/whitepapers/AWS_Cloud_Best_Practices.pdf?fbclid=IwAR1xXOBkWwESyy_9Srngna7rAbP_g1ddYMl2KO3moKJbzz1YDgrNOrv_z08
    - https://d0.awsstatic.com/whitepapers/aws_pricing_overview.pdf?fbclid=IwAR2mDUgA-IDHrqrQFGn3XL1kA0O1XojD6d6rdxwLWmvuL4D4mi4DKeDNonQ
    - http://yhhuang1966.blogspot.com/2020/03/aws-aws-certified-cloud-practitioner.html
- **模擬考體**
    - https://www.examtopics.com/exams/amazon/aws-certified-cloud-practitioner/




## Well-Architect五大支柱
- 卓越營運
    - 能夠執行和監控系統以實現商業價值，並持續提升支援流程和程序的能力。 
- 安全性
    - 是保護資訊、系統和資產，同時透過風險評估和緩解策略來實現商業價值的能力
- 可靠性
    - 從基礎設施或服務中斷中恢復
    - 動態取得運算資源以滿足需求
    - 減少配置不當或暫時性網路問題等中斷情況
- 效能達成效率
    - 用運算資源以符合系統需求，並在需求變化和技術升級時維持效率的能力
- 成本最佳化
    - 是能以最低價格點執行系統來提供商業價值的能力。

## 分析
### Amazon Athena
- 透過標準SQL互動式Query來在S3當中分析資料
- 無伺服器
- 可定義Schema並藉由SQL來在S3當中分析資料
### Amazon Kinesis
- 可以輕鬆地蒐集、處例並分析即時串流資料
- 像是影音串流、應用程式日誌、網頁點擊分析、IoT遙測資料等等
    - Amazon Kinesis Data Firhose
    - Amazon Kinesis Data Analytics
    - Amazon Kinesis Data Streams
    - Amazon Kinesis Video Streams
### Amazon QuickSight
- 強大的BI(Business intelligent)服務
- 可建立互動式dashboard
## 應用程式整合
### Amazon Simple Notification Service (Amazon SNS) 
- 一種發布/訂閱服務。如使用 Amazon SNS 主題，發布者可將訊息發布給訂閱者。這種方式如同在咖啡店裡，收銀員向製作飲料的咖啡師提供咖啡訂單一樣。
- 在 Amazon SNS 中，訂閱者可能是 Web 伺服器、電子郵件地址、AWS Lambda 函數或其他幾種選項
### Amazon Simple Queue Service (Amazon SQS)
- Amazon Simple Queue Service (Amazon SQS) 是一種訊息佇列服務
- 在 Amazon SQS 中，應用程式會將訊息傳送到佇列中。使用者或服務會從佇列擷取訊息，加以處理後，從佇列中刪除訊息
- 
## 運算和無伺服器
### AWS Batch
### Amazon EC2
- 執行個體類型
    - 一般用途
        - 應用程式中的運算、記憶體和網路功能資源需求大致相同
    - 運算最佳化
        - 需要運算密集型的應用
        - 需要處理單一群組中有多筆交易的批次處理工作負載時，您也可以使用運算最佳化執行個體
    - 記憶體最佳化
        - 在於為記憶體內處理大型資料集的工作負載提供快速效能。在運算中，記憶體是暫時儲存區。它會保留中央處理單元（CPU）完成動作所需的所有資料和指令。
        - 工作負載需要在執行應用程式之前預先載入大量資料。此種情況可能是高效能資料庫，或者需要執行大量非結構化資料即時處理的工作負載
    - 加速運算最佳化
        - 使用硬體加速器或協同處理器來提高執行某些功能的效率，其效果更勝在 CPU 上執行軟體的可行效率
        - 使用硬體加速器或協同處理器來提高執行某些功能的效率，其效果更勝在 CPU 上執行軟體的可行效率
    - 儲存最佳化
        - 專為需要對本機儲存體上的超大型資料集進行高序列讀取及寫入存取工作負載所設計。適合儲存最佳化執行個體的工作負載包括分散式檔案系統、資料倉儲應用程式，以及高頻線上交易處理 (OLTP) 系統
        - 為應用程式提供每秒數萬次低延遲的隨機 I/O 操作 (IOPS) 而設計
        - 應用程式具有高 IOPS 需求
- EC2 定價
    - 隨需(On-Demand)
        - 適用不可中斷短期的工作負載
        - 無須合約
    - Saving Plan
        - 承諾一年或三年內維持一定的運算量
        - 比隨需便宜
    - 預留執行個體
        - 可購買一年或三年期的執行個體
        - 用量可以根據帳戶中的隨需執行個體而定
    - Spot執行個體
        - 適合可以承受中斷的應用
        - 像是批次任務
    - 專用主機
        - 實體EC2伺服器
### AWS Elastic Beanstalk
- 在您提供程式碼和組態設定後，Elastic Beanstalk 會負責部署執行下列任務所需的資源
    - 調整容量
    - 負載平衡
    - 自動擴展
    - 應用程式運作狀態監控

### AWS Lambda
![](https://i.imgur.com/iOCFQm5.png)

### Amazon Lightsail
- Amazon Lightsail 以經濟高效的每月價格，提供易於使用的虛擬私有伺服器 (VPS) 執行個體、容器、儲存、資料庫等。
### Amazon WorkSpaces
- Amazon WorkSpaces 是一種用於 Windows 和 Linux 的全受管桌面虛擬化服務，可讓您從任何支援的裝置存取資源。
## 容器
### Amazon Elastic Container Service (Amazon ECS)
- 是可高度擴展的高效能容器管理系統，可讓您在 AWS 上輕鬆執行及擴展容器化應用程式
- 支援Docker
### Amazon Elastic Kubernetes Service (Amazon EKS)
- 透過它即可在 AWS 上執行 Kubernetes
- 
### AWS Fargate
- 容器專用的無伺服器運算引擎，Amazon ECS 和 Amazon EKS 都適用。 
## 資料庫
### Amazon Aurora
- 企業級關聯式資料庫，比標準MySQL快5倍，比標準PostgreSQL快3倍
- 支援兩種資料庫選項: MySQL, PostgreSQL
- 成本極低
- 資料會被複寫到各項設施(隨時會有六份副本，最高可達15個讀取副本)
- 持續備份到Amazon S3
- Point-in Time復原
### Amazon DynamoDB
- 無伺服器資料庫，無須管理基礎執行個體或基礎設施
- 建立**表格**，以存放或查看資料
- 資料會被劃分成項目(Item)，項目具有屬性(Attribute)
- 屬性代表資料中的不同功能
- 會在多個可用區域當中儲存硬碟鏡像，提高可用性
- 高效能且可大規模擴展，回應時間為毫秒級
- 屬於NoSQL 資料庫
- 無法透過SQL進行查詢，可根據KEY屬性來進行查詢，靈活性高
- 使用案例: Amazon Prime Day應付大量使用者訂單請球

### Amazon ElastiCache
- 為資料庫提供快取層，增加資料庫讀寫速度
    - Memcached
    - Redis
### Amazon DAX(DynamoDB Accelerator)
- 為DynamoDB提供原生快速層，改善NoSQL資料讀取時間
### Amazon Relational Database Service(RDS)
- 為`關聯式資料庫管理服務` (資料會已與其他資料建立關聯的方式來儲存)
- 支援大多資料庫引擎
    - Amazon Aurora
    - MySQL
    - PostgreSQL
    - MaraDB
    - Oracle
    - Micorsoft SQL Server
    - 
- 優點
    -  自動修補漏洞
    -  備份
    -  冗餘
    -  容錯移轉
    -  災難復原
- 可進一步將它們部署至Amazon Aurora  
### Amazon Redshift
- 專為高速、即時擷取和查詢的資料庫，用於資料分析工作
- 大多關聯式資料庫容量有一定限制，因此不適合用於歷史資料分析
- 且資料種類繁雜，一班關聯式資料庫難易應付，因此這時需要**資料倉儲(Data Warehouse)**
- 資料倉儲負責處理大數據，適用於歷史分析而不是營運分析
- 例如，一小時前我們的販售量如何，這種數字已經不會再變動了
- 而一般營運分析則是，我們現在的咖啡庫存如何，這種隨時在變動的資料
- Redshift 可以實現傳統資料庫的10倍效能

### AWS Database Migration Service(Amazon DMS)
- 將客戶資料庫轉移至AWS
- 在遷移期間資料庫仍然能夠保持完全運作
- 仰賴該資料庫的應用程式停機時間能夠降至最低
- 來源與目標資料庫不用式相通類型的資料庫
    - Oracle ->RDS for Oracle
    - MySQL -> RDS for MySQL
- 異質遷移
    - 來淵資料庫以及目標資料庫的 **結構描述(Schema)結構**、**資料類型**、**資料庫程式碼** 不同時，就需要異質遷移
    - 需要兩步驟
        - 1. AWS Schema Conversion Tool進行轉換
        - 2. DMS 用來遷移資料庫
- 開發和測試資料庫遷移
    -  將資料庫副本遷移到生產或測試環境，可使用DMS服務
- 資料庫合併
- 持續資料庫複寫
    - 可用於災難復原
### AWS DocumentDB
- 用於完整文件儲存
- 適合內容管理、目錄、使用者設定檔
### Amazon Neptune
- 圖形式資料庫用於社群網路和推薦引擎設計
- 也適合詐騙偵測需求
- 或者供應鏈追蹤管理
### Amazon QLDB(Quantum Ledger Database)
- 不可變的紀錄系統
- 其中所有條目都無法存稽核中刪除
### AWS Auto Scaling
![](https://i.imgur.com/6uOa7tx.png)
- 動態擴展
- 預測性擴展
![](https://i.imgur.com/oPepLm4.png)

### AWS CloudFormation
- 您可以將基礎設施當作程式碼(IaC)來處理。也就是說，您可以透過撰寫程式碼行來建立環境，無需使用 AWS 管理主控台個別佈建資源。
- 讓您不必執行手動動作或撰寫自訂指令碼，就能頻繁建立基礎設施和應用程式。它會在管理堆疊時判斷需要執行的正確作業，並在偵測到錯誤時自動復原變更。
### AWS CloudTrail
- 全方位的API稽核工具
- 所有對AWS提出的API請求，都會記錄在CloudTrail中
- 並且記錄誰提出請求，何時發出請求，IP為只為和，回應又是甚麼等等
- 可以在s3 bucket當中無期限儲存這些日誌
- CloudTrail 中的事件通常會在 API 呼叫後的 15 分鐘內更新
### Amazon CloudWatch
- CloudWatch可以讓客戶監控aws基礎設施以及運行在上面的應用程式
- 他透過追蹤以及監控**指標(與資源相關的變數)** 來運作
    - CPU使用率
    - RAM使用狀態
- CloudWatch 警示(Alerm)
    - 當指標達到閥值，可以觸發警示
    - 整合SNS，可以傳送警示簡訊
- CloudWatach Dashboard 
    - 以近即時方式列出指標
- CloudWatch的優點:
    - 從一個集中位置存取所有指標，獲得全系統的可見性
    - 檢視應用、基礎設施及服務
    - 減少**MTTR(解決問題的平均時間)**，**並改善總整體成本(TCO)**
    - 深入分析應用，並幫助最佳化客戶應用
### AWS Trusted Advisor
- 為一自動化顧問
- 他會根據**五大支柱**來評估資源
    - 成本最佳化
    - 效能
    - 安全
    - 容錯能力
    - Service Limits
-  會對每個支柱進行一系列檢查，並編譯分類項目供檢視
-  有些檢查免費
-  檢查項目例如: 是否啟用MFA
## 網路連結與內容交付
### AWS Elastic Load Balancing
- 一種可在多個資源 (例如 Amazon EC2 執行個體) 之間自動分配傳入應用程式流量的 AWS 服務

![](https://i.imgur.com/sJyERPV.png)
- ELB會作為傳入 Auto Scaling 群組之所有 Web 流量的單一聯絡窗口。也就是說，當您為了回應傳入流量而新增或移除 Amazon EC2 執行個體時，這些請求會先路由到負載平衡器，然後分散到即將處理這些請求的多個資源中。

## 安全性、識別與合規性
共同責任模型(Shared Responsibility Model)
![](https://i.imgur.com/wMSpH1U.png)
![](https://i.imgur.com/HOmBArE.png)
- 客戶記得自己patch OS
- aws與客戶的關係如同房屋屋主以及建商
### AWS Artifact
- 可以存取合規性報告，報告本身由第三方所檢驗
- AWS Artifact 協議
    - 公司需要與 AWS 簽署關於您在整個 AWS 服務中使用特定類型資訊的協定
    - 可以檢閱、接受和管理個別帳戶以及 AWS Organizations 中所有帳戶的協議。其中會提供不同類型的協議
- AWS Artifact 報告
    - 可以檢閱、接受和管理個別帳戶以及 AWS Organizations 中所有帳戶的協議。其中會提供不同類型的協議，可在 AWS Artifact 報告中存取此資訊
    - 在 AWS Artifact 報告中存取此資訊
### Amazon GuardDuty
- AWS威脅偵測服務
- 會分析帳戶產生的中繼資料連續串流，像是來自CloudTrail、VPC Flow Logs、DNS log
- 與aws現有服務分開執行，不會影響現有基礎設設施效能
### AWS Identity and Access Management (IAM)
- 透過IAM可以精細的控制權限
- 在IAM中可以建立IAM User
- IAM在剛建立時，預設不具備任何許可(不可建立EC2, S3...etc)
- 最低權限原則
- IAM政策
    - 是JSON文件，描述使用者可以執行或不可執行那些API操作
    - 可以將政策連接到使用者或是群組
    - Effect: `Allow` `Deny`
    - Action: 可對資源最哪些行為
    - Resource: API呼叫適用於哪種AWS資源
- IAM 群組 
- ![](https://i.imgur.com/u29juKI.png)
- 角色(Role)
    - 不同工作時，角色會進行切換
    - 在AWS中也能夠建立角色
    - 角色具有相關聯的許可，可以允許或拒絕特定動作
    - 使用者可以暫時擔任某個角色，但沒有使用者名稱或密碼
    - 僅能獲得暫時的許可權
- ![](https://i.imgur.com/Ds4cHxv.png)

### Amazon Inspector
- 針對基礎設施執行自動化安全評估，以提高安全性和aws部署應用程式的合規性
- 可用於察看與Best Practice之間的偏差
- 漏洞檢查
- 服務分成三種:
    - 網路組態可達性部分
    - Amazon 代理程式
    - 安全性評定服務
### AWS Shield
- 是一項可保護應用程式免於遭受 DDoS 攻擊的服務
- AWS Shideld Syandard
    - 可免費自動保護所有 AWS 客戶
    - 使用分析技術即時偵測並自動延緩惡意流量
- AWS Shield Advanced
    - 可提供詳細的攻擊診斷，和偵測與減輕複雜的 DDoS 攻擊。 
### AWS WAF
- 使用Web應用程式防火牆(WAF)來篩選傳入流量
- 機器學系幫助識別新威脅
- 主動防禦
- 可以設定Web ACL
### AWS Organizations
- 管理多個aws帳戶中的中央位置
- 管理帳單、控制存取、合規與安全
- 讓所有aws帳號共享資源
- 功能:
    - 集中式管理aws帳戶
    - 所有帳戶可合併帳單(具有折扣)
    - 實作帳戶的階層分組(ex. BU(業務單位)、OU(組織單位))
    - 控制每個帳戶可以存取的AWS服務以及可執行的API動作
        - 服務控制政策(SCP)，可用於指定成員帳戶的最大許可
- ![](https://i.imgur.com/qwvjWXE.png)

### Amazon Elastic Block Store (Amazon EBS)
- 不希望每次使用完EC2執行個體後，資料庫就被刪掉，則可使用EBS服務
- 可建立虛擬硬碟，EBS磁碟區，並連接到EC2執行個體上
- EBS並不直接與EC2綁定，因此可以獨立於EC2的生命週期，來持久化存放資料
- 需定義：大小、類型、組態
- 用例: 持久化儲存讓EC2寫入資料，因此備份資料很重要
- EBS允許增量備份資料(又稱作**快照**)
- 定期為EBS進行快照，以備份重要資料
- **執行個體存放區**: 為EC2中所提供的臨時區塊是存放區，當EC2終止時，存放區中的資料也會消失
- ![](https://i.imgur.com/8AVNGzr.png)
- ![](https://i.imgur.com/1kkfeOT.png)
- ![](https://i.imgur.com/QNVkgdB.png)
- EBS 快照: 第一次備份會複製磁碟區中所有資料，後續就只會儲最近一次快照以來變更的資料區塊，屬於**增量備份**
### Amazon S3
- 資料存放以**物件**形式存放，但並非存放於檔案目錄，而是存放在**儲存眝體(bucket)**
- 上傳物件大小上限為： **5TB**
- 可以建立**物件版本(Object Versioning)**，防止意外刪除
- 可以建立多個buckt，來放在不同資料類別或是資料層中
- 可建立許可(Permission)來限制誰可以存取物件
- `Amazon S3 Standard`: 具有 99.99999999% 耐久性，代表該檔案在一年後保持完整的機率
    - `資料存放的方式`: 資料至少會存放在三個設施中，在不同地點都有副本
    - `靜態網站託管`: 託管html檔或其他靜態檔案資產到s3
- `Amazon S3 Standard-Infrequent(IA)`: 用於存取頻率低，但需要時需要快速存取
    -  適合存放備份、災害復原、長期存放資料
    -  `Amazon S3 Glacier`: 可用於稽核資料長期存放
    -  可建立文件庫，並使用**文件庫鎖定政策**，來滿足當地法規對於稽核資料存放年限的要求
    -  可在文件庫鎖定政策中使用控制措施 - **單寫多讀(WORM)** 模型，來防止未來的寫入行為
- 生命週期政策: 可在不同層之間自動移動資料
    - 例如: 需要將一個物件在S3 Standard中保留90天，接下來移動到s3-IA中保留30天，120天候移動到s3 glacier，這種時候就能夠建立生命週期政策來自動化這些行為
- `Amazon S3 單區域-IA` 
    - 資料存放在單一區域中
    - 價格比S3 Standard-IA還要低
    - 若想要節省儲存成本則選擇此儲存類別
- `Amazon S3 Intelligent-Tiering`
    - 適合存取模式未知或持續變更的資料
    - 每個物件需要支付小額每月監控和自動化費用
- 物件:
- ![](https://i.imgur.com/fNAXd5H.png)
### Amazon S3 Glacier
- 專會資料封存所設計
- 能在幾分鐘或幾小時內擷取資料
- 可用於儲存已封存的客戶資料或是舊相片影片檔案  
### Amazon S3 Glacier Deep Archive
- 適合封存的最低成本物件儲存類別
- 能在12小時內擷取物件
### Amazon Elastic File System (Amazon EFS)
- 允許多個執行個體同時存去EFS當中的資料
- 可是需求擴展或縮減

## EBS 與 S3的比較
||EBS|S3|
|---|---|---|
|儲存容量|16TB|無限制，個別物件最高為5TB|
|特色|在EC2終止時繼續存活|單寫多讀(WORM)|
|儲存型態|固態||
|耐久度||99.99999999%|
|使用案例|80GB影片檔案正在編輯，可啟用物件版本紀錄，而不用每次都重新上傳全新的物件，採用區塊式儲存|靜態網站託管、區域分散式儲存、資料備份、無伺服器|
|總結案例|複雜寫入讀取更動等功能|完整物件、偶而更動等資料|

## EBS 與 EFS的差別
- EBS磁碟區會連接到EC2，而EBS是 **可用區域層級資源**，若要將EC2連接到EBS上，兩者必須位於相同可用區域當中
- EBS是硬碟，可存放檔案資料、資料庫或應用程式，硬碟區塞滿後，並不會資動擴展
- EFS並不是一個空白的硬碟，而是真正的Linux檔案系統
- EFS是一種**區域性資源**，區域內的任何EC2都能夠寫入EFS檔案系統
- EFS寫入更多資料時，它會自動擴展

## RDS 和 DynamoDB的差別
|RDS|DynamoDB|
|---|--------|
|自動高可用性、可提供復原|鍵值對，不須結構性描述|
|客戶擁有資料所有權|巨大傳輸容量|
|客戶擁有描述所有權(Schema)|PB級大小擴展潛力|
|客戶對網路有控制權|精密API存取權限|

使用案例:
- 銷售供應鏈管理系統，若要進行商業分析，則需要複雜的關聯式連結，這時就適合使用RDS
- 上述案例外的其他案例，DynamoDB幾乎都可用，大多案例不需要複雜的關聯式連結，像是員工聯絡人表格，用單一表格就能夠解決了，RDS的複雜功能以及管理費用，DynamoDB則能夠消除所有管理費用，並且可建立快速高效能的資料庫

## 定價
- 免費方案:
    - 永遠免費
        - AWS Lamda每個月允許一百萬次免費呼叫
    - 12個月免費
        - S3 可免費使用12個月高達5GB的儲存
    - 某些服務可以短期試用
        - Lightsaul 提供一個月的試用期，使用期間最高可達750小時
- Pricing Model
    - Pay-as-you-go 按照使用量付費，無須長期合約
    - 預留容量
    - 以量計算的折扣: 某些服務提供分級定價，每單位成本隨著用量增加而降低
        - Ex. S3儲存空間越多，每GB支付費用就越少
- 定價計算機
- 帳單儀表板
    - 存取 Cost Explorer 並建立預算
    - 將您本月份至今的餘額與上個月進行比較，並根據目前的用量獲得下個月的預測
    - 檢視各項服務免費方案用量
    - 發布 AWS 成本和用量報告
- 合併帳單
    - 為AWS Organization的功能之一
    - 可以將個別aws帳戶的帳單合併，ˇ但還是可以分項查看帳單
    - 可以將AWS資源的使用量彙總到組織層級
    - 個別帳戶帳單即使金額低，若合併組織中的帳單有機會獲得批量折扣價
    - 簡化計費流程
    - 免費功能
    - 一個組織允許的預設帳戶數目上限為 4 個
- 預算服務
    - 可以建立預算金額閥值，並發出警示提醒到電子郵件中 
    - 預算中的資訊每天更新三次
- Cost Explorer
    - 以控制台為基礎的服務，可透過視覺化來查看跟分析在aws上的花費
    - 會顯示在哪個服務上化最多錢
    - 並提供12個月的歷史資料，可追蹤成本隨時間的變化
    - 提供強大的報表，也可自定義報表內容

## Support 服務
- 基本支援(免費)
    - 24小時客服服務
    - 文件、白皮書、論壇
    - AWS Trusted Advisor
    - AWS Personal Health Dashboard
- 開發人員方案
    - 基本支援
    - 電子郵件取得客戶支援(12小時回覆)
- 商業支援
    - 基本與開發人員支援
    - AWS Trusted Advisor提供完整最佳實踐檢查
    - 直接與雲端支援工程師電話聯絡(4小時的回應SLA)
    - 若生產系統受損，針對損壞的生產系統提供1小時的SLA
    - 基礎設施事件管理(EX.大型活動、全球發布會...etc)
- 企業支援(適合執行關鍵任務工作負載的公司)
    -  基本、開發人員和商業支援(外加針對商業關鍵工作負載的15分鐘SLA)
    -  適用於TAM(Technical Account Manager)的技術帳戶管理員
        -  TAM會與客戶一同根據Well-Architected 架構來檢視企業架構

![](https://i.imgur.com/r20KK1m.png)


## AWS Marketplace
- 是包含獨立軟體開發廠商數千種軟體產品的數位型錄，可簡化、部署和管理在AWS架構中執行第三方軟體的步驟
- 您可以使用 AWS Marketplace 尋找、測試和購買能在 AWS 上執行的軟體
- 當客戶在使用Marketplace中的第三方應用時，無需建構安裝維護這些程式所需的基礎設施
- 一鍵式部署
- 一樣按使用量付費
- 許多廠商提供免費試用
- 以企業為主的功能
    - 可自訂條款和定價，可管理自訂授權合約
    - 私人市集，可建立符合當地法規或安全要求的預先核准軟體決方案目錄
    - 整合採購系統
    - aws成本管理工具

## AWS Cloud Adoption Framework(AWS CAF)
- 向客戶公司提供建議，藉由指引協助客戶管理遷移至雲端的過程
- AWS CAF觀點(不同領域的人帶來不同觀點，並且會有不同的遷移策略)
    -  商業: 側重商業能力
    -  人員: 側重商業能力
    -  治理: 側重商業能力
    -  平台: 技術能力
    -  安全: 技術能力
    -  營運: 技術能力
## 遷移策略
- 6個R策略
    - 重新託管(Rehosting)
        - 選取應用程式幾乎照搬到AWS
        - 僅透過重新託管能夠節省高達30%的總成本
    - 平台重建/微調搬遷
        - 會進行一些雲端最佳化，但不需要調整核心程式碼
    - 汰換(Retired)
        - 某些企業的it產品組合中包含不再使用的應用程式
    - 保留(Retain)
        - 某些應用程式需要被取代，但時機未到，可能還會再跑好幾個月
        - 這些應用就可遷移到aws
    - 重新購買(Repurchase)
        - 放棄舊有授權軟體，轉用雲端原生產品等
        - 前期成本高，但潛在益處大
    - 重構(Refactor)
        -  重寫程式碼
        -  某些功能可能是以前無法再內部部署的

## AWS Snow Family
皆防竄改，皆由客戶的256bit金鑰來對資料進行加密
![](https://i.imgur.com/2lh2GeS.png)
### AWS Snowcone
- 最多可容納8TB的資料並包含**邊緣運算(包含EC2和AWS IOT Greengrass)**
- 可以透過aws主控台下單裝置
- 客戶可以安裝裝置並複製資料再運回aws
- aws再將資料複製到aws帳戶中的s3 bucket
- 8TB,4G RAM, 2CPU
### AWS Snowball Edge
- 兩種選項
    - Compute Optimized:
        - 適合大規模資料遷移以及週期性傳輸工程
        - 80TB
    - Storage Optimized: 
        - 適合機器學習、全動態影片分析以及本機運算堆疊
        - 80TB
- 可以放入現有伺服器機架
- 並可使用ec2或iot Greengras做運算
- 使用案例
    - Iot裝置串流
    - 影片轉碼
    - 工業訊號處理
### AWS Snowmobile
- 裝置在45英尺高的巨大容器中
- 由卡車運送
- 容納100PB(100000TB)的資料
- 裝置防竄改、防水、滅火，具有溫度控制功能
- 安全團隊視訊監控護宋團隊

## 可用區域(Avaiable Zone)
![](https://i.imgur.com/l3j0kFf.png)
AZ是區域內的一個資料中心或一組資料中心。可用區域各自坐落於彼此的數十英里外。這個距離夠近，足以在可用區域之間維持低延遲 (內容從請求到接收之間的時間)。不過，如果區域中的一部分發生災難，它們的距離也夠遠，足以降低多個可用區域受到影響的機會。

## 節點
是透過 CloudFront 來將您內容的快取副本存放在更靠近客戶位置的站點，以便加快交付 
![](https://i.imgur.com/LEbdL9B.png)