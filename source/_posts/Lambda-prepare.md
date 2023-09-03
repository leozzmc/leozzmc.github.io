---
title: 【Day0】30天AWS無伺服器挑戰 
toc: true
tags:
  - Lambda
  - AWS
categories: 
  - 實作紀錄
  - 30 Day Challenge
aside: true
abbrlink: '30Days_AWS_Serverless_challenge'
date: 2023-09-03 14:21:38
description:
cover:
---

## 前言

這次 30天挑戰選擇在 AWS 的平台上摸熟服務，算是一種自我挑戰吧
選擇 serverless 這個方向主要是由於工作的關係，會需要熟悉以下服務：

```
- Amazon Lambda
- Amazon API Gateway
- Amazon Simple Notification Service
- Amazon Pinpoint
- Amazon Connect (Contact Center)
- Amazon IoT Core
... etc
```

想要藉由這次的機會，好好搞懂各項服務的運作機制，並且每次都做一個 Lab 來進行實驗。 想要以動手做來完成這30天的挑戰。


## 章節安排

我的重心會放在 **Lambda**, **API Gateway** 以及 **SNS** 身上，如果時間以及比賽狀況良好，那就會再帶到其他服務。

- Amazon Lambda `10 Days`
- Amazon API Gateway `8 Days`
- Amazon Simple Notification Service `5 Days`
- Amazon Pinpoint `2 Days`
- Amazon Connect (Contact Center) `2 Days`
- Amazon IoT Core  `2 Days`
- 結語 `1 Days`

所以以上的時間只是暫時性的配置，隨時可彈性調整。

但一樣會建置 Lambda 與不同服務的搭配場景，像是透過 API gateway 去觸發 Lambda 或者是 EventBridge 結合 Lambda 的使用，以及該怎麼樣設定 Event Source Mapping 等等操作。

在個別文章結構安排，目前規劃會是切成兩塊，前半段先介紹原理/性質後半段開始帶實作。但這邊也是可能可以彈性按需調整。

另外，AWS 非常重視官方文件的價值，所以我會在每一篇都列出所引用的官方文件章節，一切實踐都是可以朔源到官方文件以及官方規格上。


以下也列出 AWS Serveless 相關服務連結:
> https://aws.amazon.com/tw/serverless/

那就先預祝自己這次挑戰順利!







