---
title: 帶你從零開始整合 Lambda Function 到 Amazon Connect
toc: true
tags:
  - AWS
  - Connect
  - Lambda
aside: true
categories: 實作紀錄
abbrlink: 5db1b7e9
date: 2023-08-01 22:21:33
description:
cover: /img/Connect.png
---

## 前言

在現代的商業環境中，提供優質且高效的客戶服務是成功的關鍵之一。**Amazon Connect** 是一個強大的雲端客戶服務中心，它可以幫助企業輕鬆建立高度可靠的聯絡中心，並與客戶進行無縫的互動。本篇技術部落格文章將帶領您逐步了解如何整合 Lambda Function 到 Amazon Connect，以實現更多自定義的功能。



在這篇文章中，我們將遵循以下步驟來實現整合：

## 步驟一、建立 Connect Instance

首先，我們將在 Amazon Connect Console 上建立一個 Connect Instance。

請至 Amazon Connect Console 上選擇 **Add Instance**。這個步驟會需要設定你的 **instance-alias**，這樣可以為你的connect instance 建立一個 unique的 Access URL

![Imgur](https://i.imgur.com/JgeqYRX.jpg)

這個步驟是添加Admin，你會需要設定使用者名稱以及密碼。

![Imgur](https://i.imgur.com/HqRmPC9.jpg)


之後的步驟我們就都按 **Next**，最後建立 Instance。


{% note info %} 
建立會需要等一段時間，可以趁這個時候建立 Lambda Funciton
{% endnote %}

## 步驟二、建立 Lambda  Function

前往 Lambda Console，選擇建立 Lambda Function，我們Lambda 的Region與 Connect Instance 的 Region是一樣的，都是 `us-east-1`

![Imgur](https://i.imgur.com/IF7ndGN.jpg)


我們選擇 **Author from Scratch**，並且給定函式名稱為 `TestConnect`，Runtime 選擇 `Python 3.11`
接著其他都保持預設設定。最後建立 Lambda Function。

建立完成後，可以修改 Lambda code，加上一行在你的 handler上。

```python
print("Invoke Success!")
```

接著按下 **deploy。**

## 步驟三、增加Flows 到 Amazon Connect

> **這一步驟中，我們將在 Connect Instance 中增加 Flows。我們將使用剛才建立的 Lambda Function，讓 Amazon Connect 在特定情況下調用此 Lambda 函式。**

前往剛才建立的 Connect Instance，點選左側導覽欄當中的 **Flows**

![Imgur](https://i.imgur.com/evYMznQ.jpg)

往下找到 **AWS Lambda，選擇你剛才建立的Lambda名稱，接著按下 Add Lambda Function**

![Imgur](https://i.imgur.com/n7jvJGT.png?1)

## 步驟四、設定 Contact Flows

> **在這個步驟中，我們將設定 Contact Flows，讓 Amazon Connect 在特定情況下觸發 Lambda 函式並執行自定義的操作。我們將設定語音提示，以及在 Lambda 函式觸發時執行的動作。**

點開你剛才建立 Connect Instance 的 Access URL

![Imgur](https://i.imgur.com/EgmgghI.jpg)

會跳出類似這樣的畫面

![Imgur](https://i.imgur.com/OIOj9PJ.jpg)

一樣去左側的 Panel中找到 **Routing**，並選擇 **Flows**

![Imgur](https://i.imgur.com/CkJosG1.jpg)

點開後選擇 **Create Flow**

點開後第一步先幫你的 Flow 輸入名稱，這裡我叫做 `TestConnect-LambdaFlow`
剛開始只會出現一個 Entry 在 畫面上，你可在做側的搜尋欄當中搜尋 Lambda Invoke，接著會出現 **Invoke AWS Lambda function** 的功能方塊，就把他拉到中間的畫布上。你可以先點選 Invoke AWS Lambda function 右上角的點點，並選擇 **edit setting**，接著右側會跳出編輯視窗，請輸入你剛才建立Lambda 函式的 ARN，接著按下 **Save**。

![Imgur](https://i.imgur.com/9LBtvaI.jpg)

接著在左側搜尋欄搜尋 **Play Prompt** 並拉到中間畫布上，一樣點擊右上角點點，按下 **edit setting**。

![Imgur](https://i.imgur.com/iskcGZZ.jpg)

選擇 Text-to=speech or chat text 的選項，並在底下輸入客戶剛接入聊天室會出現的訊息。我在這邊輸入

`Hi there,  this flow section will try to invoke Lambda function.`

完成後點選 Save。

接著可以一樣在左側的搜尋欄位當中的 **Terminate** 找到 **Disconnect** 功能方塊，並把他拉到中間畫布上。

最後將所有功能方塊的箭頭連接上，整體流程會像是下面的圖一樣。


![Imgur](https://i.imgur.com/RPBKkRu.jpg)

不管成功與否都會調用 Lambda 函式，但觸發成功才會去觸發 Prompt，而失敗就是直接結束連線，而Lambda函式調用失敗也會直接結束連線。 

最後按下 **Save 完成後按下 Publish**


> 一定要確保按下 Publish，若你沒有 Publish 你所設定的 Flow 不會出現在儀表板上

## 步驟五、測試 Chat

> **一旦所有設定完成，我們將進行測試。透過模擬的聊天界面，我們將檢查 Lambda 函式是否被成功觸發，以及驗證整合的運作是否符合預期。**

接著一樣點選左側的 Panel 最上面有點像 Windows Logo的圖示，點選 **Dashboard，回到原先的主畫面。**


![Imgur](https://i.imgur.com/IL3lPpV.jpg)

點選 **Test Chat**，之後會跳出 Test Chat 頁面，點選左上角的 **Test Settings**

![Imgur](https://i.imgur.com/0EFhRCk.jpg)

點選後會出現一個設定選單，在 Contact Flow 中請選擇你剛才建立的 Flow，接著按下 **Apply**

![Imgur](https://i.imgur.com/sN5qfW5.jpg)

當你按下 Apply 後就會出現一個 模擬的聊天界面，並且顯示客戶加入Chat的狀況，而我們的設定是不論如何都會限結束連線。所以我們可以回到Lambda 頁面去檢查 Lambda 函式有沒有被觸發。

![Imgur](https://i.imgur.com/1LoXmPY.jpg)

## 步驟六、檢查日誌
> **最後，我們將檢查 Lambda 函式的日誌，以確認 Lambda 是否被正確調用，並確保整合的可靠性。**

回到 Lambda Console 點選 **View CloudWatch logs**


![Imgur](https://i.imgur.com/C5ziVSW.jpg)

點開最新產生的 Log Streams，可以發現 `Invoke Success!` 的字串，由此得知我們的 Lambda 被成功調用了

![Imgur](https://i.imgur.com/xzwSbUl.jpg)

## 結論

透過這篇文章，您將學會如何使用 Amazon Connect 和 Lambda Function 整合客戶服務的流程，並實現自定義的客戶互動。讓我們一起踏出這個整合之旅吧！

