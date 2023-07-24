---
title: ⚙️在 Lambda 上設定錯誤重試 (Retry)
toc: true
tags:
  - Amazon
  - Lambda
aside: true
categories: 實作紀錄
cover: /img/lambda.jpg
abbrlink: d400aff3
date: 2023-07-24 20:36:15
description:
---
## 前言

一樣是解 case 碰到的問題，但我也沒真的在 Lambda 設定過重試 (Retry)，這次就秉持著實驗精神來在自己的環境實驗看看。


## 建立 Lambda

這邊建立 Lambda部分很簡單，就建立一個名叫 **TestInvocations** 的 function，使用的 Runtime 是 `NodeJS.14.x`

![Imgur](https://i.imgur.com/SeXKrS9.jpg)

## 修改 Lambda Handler 程式

在 Lambda Console主頁底下的 **Code** 區域來修改程式，更改 `index.js`

```javascript
let outside = 0;
exports.handler = (event, context, callback) => {
    console.log(JSON.stringify({
        'RequestId': context.awsRequestId,
        'outside': outside++
    })); 
    return callback('Error', 'retry test')
};
```

一但修改完畢後，可以點選 **deploy** ，來上傳修改好的程式

![Imgur](https://i.imgur.com/3XJYyyo.jpg)

## 設定重試

我們可以去 Lambda Console 的主頁去 **Configuration** 頁面選擇 **Asynchronous Invocation** ，接著去 Edit

![Imgur](https://i.imgur.com/uVM6U6E.jpg)

**Retry attempts** 最多能夠設到 `2`，在你的 Lambda Function 接收非同步叫用後發生錯誤，並重試兩次後，該 Event 就會被拋棄，但也可以額外設定 **Dead Letter Queue (DLQ)** 來去存放來被捨棄的事件，以供後續處理。


> 細節可以參考這份官方文件: https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/invocation-async.html#invocation-dlq



## 觸發Lambda


接著可以透過 **AWS CLI (Command Line Tool)** 來去調用 Lambda 函式


> 沒有設定過 AWS CLI 的可以參考這份文件來進行設置 >> https://aws.amazon.com/cli/


```shell
aws lambda invoke --function-name TestInvocations --invocation-type Event test.txt
```


這邊設定 `--invocation-type` 為 Event，這麼代表你是以非同步的方式來調用 Lambda。

接著會回傳狀態碼 `202`   這是代表，你的請求已被 Lambda 接受，但還不會馬上處理 （畢竟是非同步）
> 參考資料:
https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/API_Invoke.html

{% note info %}
對於 Lambda 同步以及非同步調用，可以個別參考對應的官方文件說明
https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/invocation-async.html
https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/invocation-sync.html
至於在架構上的異同，以後可以再寫一篇文章來整理！
{% endnote %}


## 觀測結果

之後我們可以到 Lambda Console 上面的 **Monitor** 頁面，點選 View **CloudWatch logs** 選項，這時候就會跳出 Cloudwatch Logs 的主頁

![Imgur](https://i.imgur.com/aOskbVm.jpg)
![Imgur](https://i.imgur.com/EKlsnSl.jpg)

當你每次建立 Lambda 時，預設會給予Lambda 的執行角色一個名叫 `AWSBasicExecutionRole` 的政策，其中包含了建立Cloudwatch Log Group 還有 Cloudwatch Log 的權限，並且會建立 `/aws/lambda/<你的Lambd名稱>` 的這麼一個**日誌組（Log Group）**，在這個日誌組底下會有許多**日誌流（Log Stream）**，每當你
對你的Lambda函式進行變更並重新觸發Function，就會產生新的日誌流

![Imgur](https://i.imgur.com/JSuUpCk.jpg)

此時我們選擇最新的日誌流，可以發現有三筆 invocation，第一筆為我們觸發的，第二以及第三則是我們設定的重試觸發

觸發請求-1
![Imgur](https://i.imgur.com/OMHbzV7.jpg)
Retry-1
![Imgur](https://i.imgur.com/gmvSuMn.jpg)
Retry-2
![Imgur](https://i.imgur.com/mbniv78.jpg)

這裡就可以觀察到，invocation後的日誌可以看到錯誤訊息，並且在第一次請求錯誤後過一分鐘會重試一次，在第一次重試失敗後過兩分鐘會去重試第二次，接著就不會再去重試了。這邊也觀察到錯誤重試時的 request id 跟原本的一樣，應該可以試著用這個當判斷是否為錯誤重試、事件是否已經處理過。


## 結論

在 開發 Lambda 程式以及進行相關設定時，務必要注意 調用的類型以及對應的設定有哪些，才不會傻傻的混用而不自知。


## 參考資料

https://azole.medium.com/aws-lambda-reuse-and-retry-behavior-ffaac616d869
https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/invocation-retries.html
