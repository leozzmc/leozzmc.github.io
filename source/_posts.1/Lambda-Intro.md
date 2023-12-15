---
title: Lambda 基本認識 feat.容器重用小實驗
toc: true
tags:
  - AWS
  - Lambda
aside: true
categories: 實作紀錄
cover: /img/PEPE1.jpg
abbrlink: c79cef2b
date: 2023-10-16 21:59:49
---

## 前言


首先，為什麼談到無伺服器總是會有人提到 Lambda ?

以下就開始來介紹這個服務


## FaaS (Function as a Service)

一旦談到無伺服器運算，就會提到他的核心概念，**功能即服務(Function as a Service)** ，這裡引用維基百科對於 FaaS 的解釋

> FaaS 是雲端運算的一種模型。以平台即服務（PaaS）為基礎，無伺服器運算提供一個微型的架構，終端客戶不需要部署、配置或管理伺服器服務，程式碼運行所需要的伺服器服務皆由雲端平台來提供。

沒錯，這個概念的核心就是讓使用者專注在設計產品或業務邏輯，而不需費心在部署配置或是設定伺服器。

而最早實踐這個概念並推出服務的，就是 AWS 在 2014 年推出的 Lambda 服務。（當然後續也有 Microsoft 的 Azure Function）


## Lambda 函數

> Lambda 在高可用性的運算基礎設施上執行您的程式碼，並執行所有運算資源的管理，包括伺服器與作業系統維護、容量佈建與自動擴展以及記錄。使用 Lambda，您唯一需要做的就是在 Lambda 支援的其中一種語言執行期中提供您的程式碼 [1]。[name=AWS Documents] 

以行為上來看基本上就是，我底下的這張圖。會有某個上游的觸發器（Trigger），通常是某種服務來去調用 Lambda 函數，或者是手動透過AWS CLI 的方式調用。 Lambda 執行函數完畢後將執行結果回傳給原服務，並且可以將觸發下游的目的地（ Destination）這通常也是某個服務。

![](https://hackmd.io/_uploads/SyPe6nOC2.png)



現在假設你是一個新手，剛接觸 Lambda 你可能會急著想要打開你的 Console ，用範例程式，或者有些人範例程式寫什麼都不看就刪掉，直接複製貼上本地程式，然後透過預設的 Event 來去測試你的 Lambda 函數，然後發現跑不動....

請別急，在動手前最好先有 Lambda Runtime 以及 Lambda 程式的概念。

## 基本規格

- RAM
- Storage

### 設置 - RAM
    
RAM 與 CPU 處理效能成正比，可以透過提升 RAM 來連帶提升CPU處理速度
    128MB to 3008MB
> 參考來源:
> https://koding.work/aws-lambda-performance-is-related-to-memory-size/



## Lambda Runtimes

Lambda 通過使用 Runtime 來支援多種程式語言開發。每個主要的程式設計語言版本都有獨立的 Runtimes。 而這些 Runtime 提供了基本的程式語言的函式庫以及執行環境。

主流語言都有官方支援的 Runtime 像是 NodeJS, Python, Java, Go, Ruby 等等，並且也支援你去自定義 Runtime。[像是 C++ Runtime](https://github.com/awslabs/aws-lambda-cpp)，官方也有提供 Github 和 Post 去寫怎麼使用這種自定義的 Runtimes [3]

> 小弟就有自定義過 Perl Runtime，但會需要自寫 images..:(

另外， Lambda Runtime 其實都是基於 Amazon Linux 進行開發的。所以基本上如果有自定義 Runtime 的需求，建議都是開個 t2.micro 的 EC2 (選擇 Amazon Linux 相關的 AMI )再來去建構 Runtime。 


## Lambda 程式設計模型

Lambda 提供的程式設計模型對於所有 Runtime 通用。程式設計模型會定義一個 Handler 來去處理進來的事件。這個做法其實就是將函數的進入點告知 Lambda。執行時間會將包含呼叫事件和內容的物件傳入至 Handler，例如函數名稱和 Request ID。

如果你建立不同 Runtime 的 Function，應該會在主控台的程式碼區塊上看到不同語言 Handler。

Handler (Python)[4]
```=python
def handler_name(event, context): 
    ...
    return some_value
```
Handler (Java17)
```=java
package example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;

// Handler value: example.HandlerInteger
public class HandlerIntegerJava17 implements RequestHandler<IntegerRecord, Integer>{

  @Override
  /*
   * Takes in an InputRecord, which contains two integers and a String.
   * Logs the String, then returns the sum of the two Integers.
   */
  public Integer handleRequest(IntegerRecord event, Context context)
  {
    LambdaLogger logger = context.getLogger();
    logger.log("String found: " + event.message());
    return event.x() + event.y();
  }
}

record IntegerRecord(int x, int y, String message) {
}
```
    
Handler (Go)    
```=golang
    package main

import (
        "fmt"
        "context"
        "github.com/aws/aws-lambda-go/lambda"
)

type MyEvent struct {
        Name string `json:"name"`
}

func HandleRequest(ctx context.Context, name MyEvent) (string, error) {
        return fmt.Sprintf("Hello %s!", name.Name ), nil
}

func main() {
        lambda.Start(HandleRequest)
}
```
    
諸如此類。
    
另外，由於剛創建 Lambda 的時候僅會有 Lambder-Handler一個檔案，但其實可以存取在 Lambda 執行環境當中的 `/tmp` 目錄 ，每個執行環境都會在 `/tmp` 目錄中提供 512 MB 到 10,240 MB 的磁碟空間，增量為 1 MB [5]。具體而言可以等之後談到 Lambda 執行環境的生命週期再說。
    
## 權限
    
Lambda 當中主要是透過執行角色（Execution Role）來去代替來源服務去執行操作。

那什麼是 Lambda 執行角色？
> Lambda 函數的執行角色是 AWS IAM 角色，它可授予函數存取 AWS 服務和資源的許可。例如，您可以建立一個執行角色，該角色有權向 Amazon CloudWatch 傳送日誌並向 AWS X-Ray 上傳追蹤資料。本頁提供有關如何建立、檢視和管理 Lambda 函數執行角色的資訊 [6]。

執行角色跟一般角色最大的不同就是，當調用函數時，**Lambda 會透過擔任此角色自動為您的函數提供臨時憑證**。開發者不必在函數程式碼中呼叫 `sts:AssumeRole`
    
而需要做到這點的必要設置，就是要設定角色的信任政策(Trust Policy)，這當中就必須將 Lambda 服務指定為受信任的主體
    
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

一旦有了執行角色，就可以去為這個角色附加政策，可以使用 AWS 管理的政策或者是自己定義政策

![](https://hackmd.io/_uploads/ryyPLT9Rn.png)
 
當然，若你在建立 Lambda 的時候選擇 "Create a new role with basic Lambda permissions"，就會去建立一個帶有 `LambdaBasicExecutionRole` 的政策。

![](https://hackmd.io/_uploads/HkTcIpcCh.png)

```
{
  "Version" : "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource" : "*"
    }
  ]
}
```
這個政策基本上就是給予 Lambda 函數能夠建立Log Group 並且能夠在Log Group 中建立 Log Stream 然後寫入日誌的功能。
    
當調用 Lambda的時候，會在 CloudWatch 建立包含 Lambda 名稱的Log Group，假設今天我的 Lambda 名稱叫做 **TestInvocations** 那日誌組的名稱就會是 `/aws/lambda/TestInvocations`
    
![](https://hackmd.io/_uploads/HyaWdT50h.png)
    
而底下就會有對應的 Log Stream
    
![](https://hackmd.io/_uploads/ryBDOaqRh.png)

這裡有個有意思的地方，就是每次如果對函數進行更動或是做一些設定上的調整(Ex. 改變 Timeout 時間) 下一次調用就會產生新的 Log Stream。

因為每當你做一次新的設置，就會需要將你的設定套用到新的Sanbox 環境，也就會重新初始化新的一個 Lambda 執行環境。
    
如果點開 Log Stream，會發現每一次 Invocation  都會伴隨著不同的 Message，分別是：
    
- START
- (Print Output, if there are any)
- END
- REPORT
    
Start 到 End 這段期間代表 Lambda 正在執行，這段時間的 TimeStamp 差值也受限於你在 Lambda 上面的 Timeout 設定，可以先針對這點來做個小實驗。


    
![](https://hackmd.io/_uploads/S1KPKa502.png)
    
### 實驗一: Lambda Timeout

建立 Lambda 函數名為 `TestInvocation`, Runtimes 這裡選擇 `Python3.11`, 權限就維持預設。之後到 Lambda 主控台底下的 **Code** 區域編輯程式。
    
![](https://hackmd.io/_uploads/SyEhzRqAh.png)
    
建立好 Lambda 後會給個空的 Lambda Handler，我們在這裡多 import time 並且在 handler 裏面延遲 3秒。接著按下 Test，這當中會有測試用的 JSON event，可以直接用來測試。

測試完畢後可以去 Monitor 頁面點選 “View CloudWatch logs”

![](https://hackmd.io/_uploads/S1KUXRcRh.png)

就會跳去CloudWatch 當中對應的 Log Group，點選TimeStamp最新的 Log Stream，觀察實驗結果。
    
![](https://hackmd.io/_uploads/SyeGfA90h.png)

可以發現在 Start 以及 End 中間間隔 3 秒，並且有印出 "sleep for 3 seconds"。

眼尖的人可以看到其中一個 log entry後面有顯示 "Task timed out after 3 seconds"。這是因為剛建立的 Lambda 函數，默認執行時間的timeout值會是3秒。這個可以去 Lambda 主控台上的 "Configuration" 上面修改。
![](https://hackmd.io/_uploads/ry5BERqC3.png)

Timeout值的最上限會是 15分鐘。所以我們開個 15 分鐘看看，並且將 handler 當中的 delay 也調成大概 14 分鐘左右測試看看。
> 這是個硬限制，也就是說你沒辦法開 Support Case 去提高額度 [8]
    
等待 14分鐘過去後，可以從日誌上看到確實執行了 14分鐘
![](https://hackmd.io/_uploads/H1BAq05Rn.png)


    
另外在先前的日誌截圖中，沒提到的是 INIT_START，這是每次初始化一個執行環境後就會有的初始化階段，初始化階段包含了 Extension Init、Runtime Init、Function Init [7]
     
![](https://hackmd.io/_uploads/SkQK36qC3.png)
*引用AWS 官方的圖片*
 
前兩個 Init 階段偏向建立執行環境，以及啟動 Runtimes 還有下載deployment package 到執行環境等等，但到了 Function init 階段。這時候還會做一件事情，那就是會**去執行 Lambda Handler 以外的程式**。

![](https://hackmd.io/_uploads/ryzXbC9Rn.png)

這裡在 handler 之外

![](https://hackmd.io/_uploads/BJm-Z0qCn.png)

    
這麼說有點模糊。假設你宣告了一個全域變數在 Handler 之外，或者是你在 Lambda Handler外去與DB初始化一個連線。這些都很適合放在 Handler 之外做，並且會在 **Init-Start** 到 **Start** 這段期間執行，並且只要是持續使用相同的執行環境，那 Function Init 當中做的事也僅會做一次，這裡就會待到 Lambda 的一個特性，叫做 Container Reuse。  
    
    
### 實驗二: Lambda 特性 - 容器重用（Container Reuse）

其實所有的容器重用的特性必須先提到， Lambda 執行環境會是容器，但一般像是 docker 的容器環境就是執行完畢就會把容器砍掉，但在 Lambda 的使用場景來看就不適合每次執行完畢就將執行環境關閉，而是繼續等待下一個調用請求。
    
從日誌上也可以觀察到這個特性。如果你在 Lambda 頁面上連續 invoke 三次，之後你可以在日誌中觀察到後續的調用請求，都會出現在同一個 Log Stream 當中，會接續在前一次調用日誌的後面。
    
![](https://hackmd.io/_uploads/rkJu6Aq02.png)

也就是說，對於同一個 Lambda 執行環境，Lambda 完成一次執行後就接續處理下一個請求，也就是同一個 Lambda 的沙箱環境可以重新使用。
    
如果對於 Lambda Container Reuse 有興趣的人可以看一下這篇官方的Blog
> Understanding Container Reuse in AWS Lambda
> https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/
    
這裡又有一件有意思的事，如果你是用 Lambda 主控台的測試按鈕去調用，他會等待執行完畢後，才能夠讓你再次按下測試按鈕。
    
如果我們用 AWS CLI 去調用 Lambda 函數，用 Terminal 一次開三個Tab同時調用我們的 Lambda 函數會發生什麼事？
    

## 其他關鍵概念

- Lambda 執行環境
- Cold Start
- Lambda 部署套件
- Lambda 同步調用/非同步調用
- Lambda 的聯網功能

## 參考文獻
[1] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/welcome.html
[2] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-runtimes.html
[3] https://aws.amazon.com/blogs/compute/introducing-the-c-lambda-runtime/
[4] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/python-handler.html
[5] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-runtime-environment.html
[6] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-intro-execution-role.html
[7] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-runtime-environment.html#runtimes-lifecycle
[8] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/gettingstarted-limits.html#function-configuration-deployment-and-execution