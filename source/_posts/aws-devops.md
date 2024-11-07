---
title: AWS for DevOps 筆記 |【DevOps技能樹】
description: (尚未完成)
tags:
  - AWS
  - Python
categories: 學習筆記
aside: true
toc: true
abbrlink: 100cc6b6
date: 2024-11-07 08:54:09
cover: /img/devops/AWS/cover.png
---


# Regions & AZs

**Region**: 一群橫跨多個不同地理位置的資料中心 Ex. `us-east-1`

**Avaiable Zone(AZ)**: 每個 Region 下都有多個相互隔離的位置叫做AZ，一個AZ中可能會有一個或多個資料中心，具有獨立的網路系統以及供電。 `us-east-1a`, `us-east-1b`....etc

**Local Zone**: 沒有實體的資料中心，通常會連接到某個AZ, Ex.台灣Local Zone 就是接到 `ap-northeast-1`，旨在提供服務給 edge location 以降低延遲。

**AWS Outposts**: 部署在客戶 On Premises 的實體伺服器，提供本地存取AWS服務

# IAM

在 AWS 環境中用於進行存取控制的服務。可以管理哪些使用者可以有權限存取哪些資源。

{% note warning %}
*Security Best Practices: 不要用 Root User 來進行日常業務，請建立對應的 User 給與適當權限再進行業務*
{% endnote %}

在 IAM 中下面是常見得術語和關係圖：**IAM User**, **IAM Group**, **IAM Role**, **Permission policy**, **Identity-provider object** 他們的關係圖如下。

![](/img/devops/AWS/iam-terms-2.png)


不管是哪個 IAM 實體 (IAM User, IAM Role) 都需要有對應的 **Policy** 給他們權限，以下可以看 Policy 的結構

## IAM Policy

*exmaple policy*

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3ConsoleAccess",
            "Effect": "Allow",
            "Action": [
                "s3:GetAccountPublicAccessBlock",
                "s3:GetBucketAcl",
                "s3:GetBucketLocation",
                "s3:GetBucketPolicyStatus",
                "s3:GetBucketPublicAccessBlock",
                "s3:ListAccessPoints",
                "s3:ListAllMyBuckets"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ListObjectsInBucket",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": ["arn:aws:s3:::amzn-s3-demo-bucket"]
        },
        {
            "Sid": "AllObjectActions",
            "Effect": "Allow",
            "Action": "s3:*Object",
            "Resource": ["arn:aws:s3:::amzn-s3-demo-bucket/*"]
        }
    ]
}
```

- `Version` 
  - 2012-10-17: 默認會是這個版本的政策語言
  - 2008-10-17: 舊版本的政策語言
- `Statement`
  - 元素為多個 Policies，可以是自定義的或者是AWS Managed Policies
- `Sid`
  - 個別 policy statement 的ID，可以描述該Policy的行為
- `Effect`
  - `Allow`: 允許針對所列的 `resource` 去進行所列的 `action`
  - `Deny`: 拒絕針對所列的 `resource` 去進行所列的 `action`
- `Action`
  - 他的格式為 `[服務名稱]:[可對該服務進行的API操作]`
  - 這邊的Action 也就是 Permission
- `Resource`
  - 通常會是資源的 ARN
  - 也可以使用 wildcard `*`
  - Example `"Resource": "arn:aws:s3:::amzn-s3-demo-bucket/*"`
- `Condition`
  - 用於指定讓政策生效時候的條件
  - Example. `"Condition" : { "StringEquals" : { "aws:username" : "johndoe" }}`

> [AWS 服務的 Actions, Resource 以及 Conditions 列表](https://docs.aws.amazon.com/zh_tw/service-authorization/latest/reference/reference_policies_actions-resources-contextkeys.html)
> [AWS 受管政策](https://docs.aws.amazon.com/zh_tw/aws-managed-policy/latest/reference/policy-list.html) 某些好用的Policy 可以直接使用


## IAM 工作原理
>  https://docs.aws.amazon.com/zh_tw/IAM/latest/UserGuide/intro-structure.html

![](/img/devops/AWS/policy_flow.png)
*圖源: AWS Developer Guide*

使用者或應用程式會使用登入憑證(AWS或第三方)向AWS進行身份驗證。IAM 將登入認證跟受信任的主體做比對，若匹配則授權可以存取AWS資源，接著IAM 會請求接下來授予主體訪問資源的權限，然後 IAM 會根據 Policy 的規定來看 Allow 還是 Deny 主體對資源的權限。

# VPC 

*什麼是VPC?*

![](/img/devops/AWS/vpc.png)

一個 Regional 的資源，可以建立用於部署AWS服務的網域

Ex. 
```
CRDR: 10.0.0.0/16
```
## Subnet
在 VPC 中可以切分成子網(Subnet)，Subnet 會是 AZ 層級的資源

```
CIDR: 10.0.0.0/24
```
通常有分成 **Public Subnet** 以及 **Private Subnet**，正常如果沒有特別設定都會是 Private Subnet，除非有在 Route Table 中將 Default Route 設定成 Internet Gateway。另外如果像要讓 Private Subnet 中的資源可以存取到外部網路，就需要設置 NAT Gateway。

> Amazon VPC Quotas:
> VPCs per region: 5 (Can limit increase)
> Subnets per region: 200 (Can limit increase)
> IPv4 CIDR blocks per VPC: 5 (up to 50) (Can limit increase)


*AWS 環境的 IP Address，有哪些是 Reserved IP?*

`x.x.x.0`: 子網的第一個IP，用於標示子網
`x.x.x.1`: VPC Router
`x.x.x.2`: DNS Server
`x.x.x.3`:  保留用於 Future Use
`x.x.x.255`: Broadcast (雖然在 VPC 中不支援 Broadcast)

## Network ACL & Security Groups

*什麼是 Network ACL?*
- **一種 Stateless 的防火牆**，可以控制來源IP流量是否可以 **進出子網**
- Allow / Deny rules
- Inbound / Outbound
- ACL 可以被 attach 在 Subnet 層級
- Rule 只包含 IP Rules

*什麼是 Security Group?*
- **一種 Stateful 的防火牆**，可以控制 **進入 ENI 或是 EC2 instances**
- Allow rules
- 可以指定 IP address, port, 協定
- 可以包含其他 Security Group

## VPC Flow Logs

*什麼是VPC Flow Log?*

主要是可以用來判斷哪些來源IP的封包流進每個介面，使用者可以為 VPC, Subnet, 或者是網路介面建立Flow Log

也可以用來監控和針對連線問題進行 Troubleshooting，包含：
- Subnets to Internet
- Subnets to Subnets
- Internet to Subnets

## VPC Peering

VPC Peering 可以用來讓不同的VPC之間建立私人連線，**但前提是兩個VPC的 CIDR 不能夠重疊**。 

另外值得注意的是，VPC Peering 並不是 Transitive 的。舉例來說，VPC_A 與 VPC_B Peering，而 VPC_B 與 VPC_C Peering，不代表 VPC_A 與 VPC_C 也能夠相互存取到。

```
VPC_A <---> VPC_B
VPC_B <---> VPC_C
VPC_A <-x-> VPC_C
```

## VPC Endpoints

VPC Endpoint 主要可以讓不同服務相互存取而不用經過公共網路。 

*Gateway Engpoint 以及 Interface Endpoint 之間的差異是什麼？*

首先一樣回到 VPC Endpoint的原則，如果不用，那可能要讓請求流經公共網路。如果今天在一個 Public Subnet 的 EC2 想要存取 S3 bucket，那這樣請求本身就會透過 Internet Gateway 並流經由外部網路再到S3。

![](/img/devops/AWS/without-gateway-endpoints.png)

或者另一種方式就是透過 VPC Endpoint 來存取，**而用於存取 S3 和 DynamoDB 的 VPC Endpoint 為 Gateway Endpoint**，他的特點就是能夠讓子網中的服務透過路由的方式來存取S3 或 DynamoDB

![](/img/devops/AWS/gateway-endpoints.png)

在建立過程中會需要選取子網的路由表，就會自動在所選路由表下新增這個 entry

|Destination | Target|
|---|---|
|prefix_list_id|gateway_endpoint_id|


而不同於 Gateway Endpoint，**VPC Interface Endpoint 則可用於大部分的服務**，主要差別在於，Interface Endpoint 可以整合 Security Group，並且支援自定義的 DNS 解析 (Private DNS Name)，但較貴。


> https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html

# EC2 
# ELB 
# Auto-Scaling Group
# S3
# DNS
# Route53
# Lambda 

![](/img/devops/AWS/lambda.png)

- *解釋一下什麼是 Lambda?*

Lambda 是一種 **Event-Driven 的 Serverless 服務**，跟可以自定義業務邏輯程式碼，來根據不同狀況去 Trigger 對其他服務的 invocation，同時也 **支援同步和非同步請求**，並且也有很高的擴展性，可以透過設定 **resevered concurrency 來去預留一定數量的 Lambda 函數**，以因應大量的API請求，在設定 resevered concurrency 的基礎下，還可以透過 **provision concurrency 來去預熱 Lambda 函數**-，預先執行 Lambda 環境初始化的過程，**減少 cold start**，這樣就可以進一步地降低延遲。


Lambda支援多種不同的 Runtime，像是 Python 3.11, Nodejs20, Java 17, Java8, Ruby...etc。也可以自定義 Runtime。

以Python 為例，需要把函數被觸發後的行為定義在 handler之中。

```python

def handler_name(event, context): 
    ...
    return some_value
```

{% note info%}
可以透過 [這份文件](https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-runtimes.html) 來查看哪些 Runtime 之後會 deprecate，被棄用的 Runtime 還是可 trigger，但AWS並不會進行 security patch 或 maintanance，而如果被棄用的 Runtime如果遭受攻擊進而影響到AWS基礎設施，根據 Shared Responsibility 那AWS有權利凍結用戶的函數，因此就是四個字: 後果自負~
{% endnote %}

- *有哪些方式可以建立Lambda 函數?*

可以上傳 zip 檔，或者是使用 blueprint，另外也可以用 **container image 的方式來建立。**  但要特別注意的是如果要打包 image，**最好要能夠在 Amazon Linux 的環境上打包**，有時候如果跑的應用會牽扯到底層得某些 system calls 的時候，那可能就會出現錯誤，畢竟 Lambda 本身其實也是運行 Amazon Linux 的 EC2。


- *由於 Lambda 的本身的VPC是由AWS管理的，如他讓他連接到其他自定義的VPC?*

首先要做的就是一定要確保 Lambda 的 Execution Role 具有 **[AWSLambdaVPCAccessExecutionRole](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSLambdaVPCAccessExecutionRole.html)** 這個權限，有這個權限才能在Lambda 建立的時候也建立 Hyper ENI，他可以作為 Lambda 函數和目標資源之間得網路介面。

- *同步與非同步調用 Lambda 函數主要差異在哪？*

![](/img/devops/AWS/invocation.png)


主要差異在於是否回立刻回應，同步調用的時候，如果成功會立刻收到 Response，而非同步調用由於請求會在 Event Queue 中等待 Lambda 的 Poller 去poll訊息消費，因此客戶端在非同步調用時收到的可能就 `StatusCode: 202`

這裡可以簡單透過 AWS CLI 去進行同步調用
```
aws lambda invoke --function-name my-function \
    --cli-binary-format raw-in-base64-out \
    --payload '{ "key": "value" }' response.json

```

如果成功調用，收到的請求可能會長下面這樣

```
{
    "ExecutedVersion": "$LATEST",
    "StatusCode": 200
}
```

下面這是透過 CLI 進行非同步調用

```
aws lambda invoke \
  --function-name my-function  \
  --invocation-type Event \
  --cli-binary-format raw-in-base64-out \
  --payload '{ "key": "value" }' response.json 
```

若成功輸出則會是

```
{
    "StatusCode": 202
}
```

- *Lambda 非同步調用要如何進行錯誤處理？*

Lambda 正常來說如果發生錯誤，會先 Retry 兩次，這通常也能夠在 Log 觀察到。如過錯誤原因是被 Throttled，則 Lambda 會將event 退回 event queue，並一樣還是會 retry **但時間會是 backoff-exponential 成長** 直到6小時。


或者也可以設置 **Dead-Letter-Queue**，通常是用來保留非同步調用的紀錄，也可以幫助近一步的排查。 DLQ 通常可以選擇 Amazon SQS 或者是 Amazon SNS Topic。



> https://aws.amazon.com/tw/blogs/architecture/understanding-the-different-ways-to-invoke-lambda-functions/


## Reserved Concurrency && Provision Concureency

為了讓 Lambda Function 能夠進行 Auto-scaling，正常來說會建議設定 **預留並行(Reserved concurrency)** ，來讓 Lambda Function 隨時保持一定數量的函數來去處理請求。

> Reserved Concurrency 的數量上限為： 未預留帳戶的Concurrency 數量 -100
> 簡言之就是保留最少100個 Concurrency 在這個 Account上

**佈建並行(Provision Concurrency)** 則是指定這些預留函數中有多少個函數需要先預熱，這裡的預熱指的是，初始化 Lambda 的執行環境，像是載入 runtime，初始化變數等等，也會先執行在 handler 之外變數的初始化，這就代表初始化過程需要一次，然後執行環境就會被保留來快速回應之後的請求。


![](/img/devops/AWS/reserved_c.png)

可以看上面AWS文件中的圖也有詳細說明，**如果沒有設定 Provision Concurrency 則當Lambda terminate後每次新的請求進來都會需要再經歷一次 Lambda Init 階段。**


> Ref: 
> 1. https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/provisioned-concurrency.html#optimizing-latency
> 2. https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html#reserved-and-provisioned




*要如何計算出所需要的 Concurrency?*

$Concurrency = (average requests per second) \times (average request duration in seconds)$

每秒平均請求乘上平均請求的持續時間，可以用這種方式來粗略估計要多少 Concurrency，**具體量測方法可以去看 Lambda Invocation Metrics 來查看每秒平均請求數，再透過 Duration 指標來預估平均請求持續的時間**


# API Gateway
# SNS / Pinpoint
# SQS
# MQ
# Cloudformation
# AWS CDK 
# ECS 
# EKS
# Fargate