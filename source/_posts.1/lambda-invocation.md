---
title: AWS Lambda知識整理 | 佈建並行 | 預留並行
toc: true
tags:
  - AWS
  - Lambda
aside: true
categories: 實作紀錄
abbrlink: a09fae
date: 2023-10-17 21:53:09
cover: /img/PEPE2.jpg
---




## 回顧

前面有提及了 Lambda 的基本介紹、Lambda Runtime、權限配置 以及從日誌上觀察初始化時間以及函數執行時間。

最後我們有提到一個問題，那就是

> 如果我們用 AWS CLI 去調用 Lambda 函數，用 Terminal 一次開三個Tab同時調用我們的 Lambda 函數會發生什麼事？


## 實驗一 - 設置 Reserved Concurrency

我們執行以下指令：
```
aws lambda invoke \
    --function-name TestInvocations \
    --cli-binary-format raw-in-base64-out \
    --payload '{ "name": "test" }' \
    response.json
```
    

![](https://hackmd.io/_uploads/ry_jkJsRn.png)

事實上他都可以成功，並且會在 CloudWatch 上產生三筆Log Stream。 
    
    
![](https://hackmd.io/_uploads/SJ64-1iCn.png)

但如果我們去設定動一點手腳，我們將某個叫做 **Reserved Concurrency** 的設定調整成1，並按下 saved。並且重新透過 CLI 執行調用的指令，看會發生什麼事。
    
![](https://hackmd.io/_uploads/Sk6GZJsCn.png)

這時候會發現，只有一個請求成功回傳200，其他都被 Throttled。會回傳 `TooManyRequestsException` 的錯誤訓息
```
An error occurred (TooManyRequestsException) when calling the Invoke operation
```
這必須提到 Lambda 應對同時間大量請求的處理機制。

> 首先，什麼是 Reserved Concurrency? 什麼又是 Unresereved Concurrency?

## 預留並行(Reserved Concurrency)

談到 Concurrency，中文叫做並行或併發。這代表什麼？這代表同一時間的多個請求。為了應對這同時來臨的請求，Lambda 函數會去自動擴展。 Serverless 到好處就是，你不需要考量該如何為 Lambda 設置擴展，像是怎麼設定 auto-scaling 的功能。

在 Lambda 當中，對於同一個函數，使用者只需要考量「**對於這個Lambda 函數，你會需要隨時為它保留多少數量的執行個體？**

這時，你就可以考慮為你的函數設定 Reserved Concurrency。

預留並行是要分配給函數的並行執行個體數量上限。當某個函數具有預留並行時，其他函數都無法使用該並行。
    
**如果你在 Lambda 主控台上設定 Reserved Concurrency為 1，就會從 Unreserved Concurrency 當中扣除掉 1**。

    
而這個設定是區域型的限制 (Regional)，若你為某個函數設定Resevered Concurrecny 為 100 那剩下的 900 就會是由區域內其他函數共用。

> 可以為一個函數保留多少數量的 Concurrency?

答案會是， `UnreservedConcurrency - 100` 數量的並行。
也就是說一個函數不可以獨佔所有的並行僅為這個函數來執行，起碼會留下 100 個並行數量給其他函數共用。




> 你要如何決定你的函數改保留多少並行？

你可以透鍋觀察 CloudWatch 指標 `ConcurrentExecutions` 來決定 [1]。 這個指標可以觀察到對於你的函數而言，一天下來不同時間段的並行請求數量，假設這個函數一天一次最多會有 30個請求進來，並且這個函數對你很重要，那就可以考慮保留 30 個 Lambda 執行個體來處理請求。

> 另外值得一提的是，設定函數的預留並行不會收費
    
## 佈建並行 （Provision Conccurency）

可能會有人好奇，如果函數會根據請求擴展，那啟動新的執行環境，這樣對於 time-sensitive 的請求來說，延遲不會很久嗎？

![](https://hackmd.io/_uploads/ByoYHrrkp.png)

> 圖片來源： AWS 官網

這個想法沒錯，可以看到上圖的數字4，就是這樣的狀況。

這代表 3 個執行環境在處理 3 個請求，但第4個請求出來時，就必須初始化一個新的 Lambda 執行環境。 這樣就勢必有延遲，需要等待 Runtime 啟動，下載 Lambda code 和 dependency，以及去執行 Handler 以外的程式區塊（如果有的話）。


佈建並行的意義在於 **「為函數預先初始化多個環境執行個體，有助於縮短冷啟動延遲」**

**冷啟動延遲 （Cold Start）** 就是 Lambda 執行環境在啟動載入時，這段不可控的延遲時間（不包含 Function Init, 也就是執行 handler 程式外區段的初始化時間）。這部分我們會在後面提到。


回到 Provision Concurrency，所以如果設定了 Provision Concurrency，圖片比較會類似下面。

假設 Provision Concurrency 設成4。 那一開始就會有四個 Lambda 執行環境進行初始化。並且後續的請求都會重用那四個 Lambda 環境，也就是說當這裡就保證了一定會有 4個初始化過的 Lambda 環境存在，對於時間敏感度高的請求，就比較適合設定這個功能，才不用再度收到初始化的延遲影響。


![](https://hackmd.io/_uploads/rJ1GiHSJT.png)


那要怎麼設定 Provision Concurrency 呢？[2]

> 提醒：為函數設定 Provision Concurrency 是要收費的


## 實驗二 - 設置 Provision Concurrency

在設定 Provision Concurrency之前有個前置作業要做，也就是**發布你的函數版本**。

每個函數在發布版本之前的預設都是： **$LATEST**，但 Provision Concurrency 並不能設定在 $LATEST 版本的函數上面，這是一個限制。

可以先在主頁中的 **Version** 找到 **Publish new version**
![](https://hackmd.io/_uploads/H1khZIrya.png)

接著可以填入這個版本的敘述，然後按下 Publish
![](https://hackmd.io/_uploads/By2C-UH1T.png)

之後就會調轉到 Version 1 的 Lambda函數主控台 （與 $LATEST 函數主控台略微不同）。這時應該會看到 Provision Concurrency 的設定畫面，點選後就可以為 Version 1 的函數設定並行。

![](https://hackmd.io/_uploads/Bk4KM8r1T.png)

下方可以填入你想要維持 warm start 狀態的 Lambda 並行數量。
底下可以注意到 "10 available"。這個數字是哪來的呢？

其實這個數字就是你函數的 **Reserved Concurrency 的數量**

可以回到 $LATEST 版本的函數主控台畫面。

![](https://hackmd.io/_uploads/SJMrmLSyp.png)

底下可以看到我們設定數量就是 10。
![](https://hackmd.io/_uploads/B1OLmIBJp.png)

> **因此我們可以設定佈建並行的數量，是取決於你為該函數設定的保留並行數量**

我們這裡將佈建並行數量設定成 5。

![](https://hackmd.io/_uploads/SkPZV8S1T.png)

之後會需要點時間來建立並行。

接著我們來測試設定的 Provision Concurrency。

首先，以下是測試用的 code (在version1 函數當中的程式碼)

```python
import json, time

time.sleep(10)

def lambda_handler(event, context):
    print("sleep for 3 secs")
    time.sleep(3)
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

```


我們通過 AWS CLI 來去觸發 Lambda 函數

```
 aws lambda invoke \
 --function-name TestInvocations \
 --cli-binary-format raw-in-base64-out \
 --qualifier 1 \
 --payload '{ "key": "value" }' 
 response.json
```

在 `--qualifier` 參數後面接的是版本名稱或者是 Alias 名稱。

可以先暫停，在實際觸發錢先去觀察 CloudWatch 上的觸發日誌

![](https://hackmd.io/_uploads/ryTU7dBJ6.png)

會發現有多個執行環境已經先預熱完成了

> 至於數量為何大於 Provision Concurrency 數量這點尚未確定
> 可能是為了可用性？

在開多個終端送請求後，可以發現一樣，因為執行環境已經預熱好，因此不需要重新 Init，可以基於 Container-Reuse 的特性來在現有的執行環境執行請求。

![](https://hackmd.io/_uploads/rkdt4urya.png)

## Reserved Concurrency vs. Provison Concurrency

![](https://hackmd.io/_uploads/B1BXrdB1a.png)
> 圖片來源： https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-concurrency.html#reserved-and-provisioned

用官方展示一張對比圖來解釋這兩種並行的差異。

以下是我整理這兩種並行的差異

| |RC(Reserved Concurrency) | PC(Provision Concurrency)|
|--|--|--|
|費用:|不用收費|要收費|
|特性：|確保一定數量的Lambda執行環境存在|確保一定數量的Lambda執行環境存在且這當中有一定數量的執行環境已經初始化過了|
|達到limit的反應|Throtteld `TooManyRequest` |若還有RC額度，則會擴增執行環境個數，但一樣會有冷啟動，沒有額度則 Throttled|

> 也請參考官方的差異表格 [3]

## 暴增並行

所謂的暴增並行（Burst Concurrency），目的也是為了能夠應付突然暴增的請求。


但面對突然增加的大量請求，Lambda 可能也沒辦法立即擴展來處理，這是為了防止 Lambda 函數過度擴展消耗太多資源。

所以在因應函數暴增的速度，可以通過設定暴增並行來去增加建立 Lambda 執行環境的最高速度。而這個設定是 Account-Level 的設定。

但在不同 Region，暴增並行有上限的差異：
- `us-west-2`, `us-east-1` 以及 `eu-west-1`的 Region 基本上是上限都是 3000
- `ap-northeast-1`, `eu-central-1` 還有 `us-east-2` Region 上限是 1000
- 其他 Region 都是 500

以 us-east-1 為例，暴增並行每分鐘擴展 500 個單位的暴增擴展（額外的 Lambda 執行環境），直到達到需求或者是達到上限 3000個。

超出上限的請求會被 Throttled (Status Code: 429)

有興趣的可以直接看官方文件針對暴增並行的介紹 [5]。
    
## 冷啟動 （Cold Start）
    
> Lambda 在 Init 階段做了哪些事情

- 當 Lambda 服務透過 Lambda API 收到啟動 Lambda 函數的請求時服務本身會去下載函數程式碼。
- 這個程式碼會存放在 Lambda 內部的 S3 bucket當中
- 如果是用函數是用容器建立，則函數程式碼會放在 **Amazon ECR** 上
- 接著會去建立具有指定記憶體大小以及指定 Runtime 的環境 
- 接著會去執行 函數 Hander之外的初始化程式

根據 [4]，可以知道上面的步驟除了執行函數初始化程式外，都屬於 Cold Start 的範圍。而執行函數 handler 外的程式碼就算是 warm start，也就是我們可以控制的範圍了。

> 函數又是怎麼能夠一直保持是 "warm"的？

官方文件說明是通過一種 **pinging mechanism**。主要實踐方式是透過設定 **Eventbridge** 的規則安排每分鐘調用一次函數來幫助函數執行環境保持活躍，


減緩冷啟動的方式，目前推薦的還是藉由設定 Provision Concurrency。
另外還有 **Snapstart**，這個我們可以留到後面繼續介紹～



    
## 參考文件
[1] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/configuration-concurrency.html#estimating-reserved-concurrency
[2] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/provisioned-concurrency.html
[3] https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/lambda-concurrency.html#comparing-reserved-provisioned
[4] https://docs.aws.amazon.com/zh_tw/lambda/latest/operatorguide/execution-environments.html#cold-start-latency
[5]https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/burst-concurrency.html