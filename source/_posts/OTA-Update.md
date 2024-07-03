---
title: 【學習筆記】OTA Update -1
toc: true
tags:
  - AWS
  - IoT
  - OTA
  - Firmware
aside: true
categories: 學習筆記
abbrlink: 613d9ed0
date: 2023-12-13 12:32:05
cover: /img/OTA/OIG.jpeg
---


## 什麼是 OTA Update (Over The Air Updtae)?

透過無線通訊去對設備進行軟體/韌體更新

## OTA 的流程

- Notify
    - 設備會被通知有擱置的OTA更新
    - 設備可以選擇忽略更新或者接受更新以觸發下載
- Download
    - 設備通過各種支援的協定進行更新下載
    - 更新包會下載到預先設定好的儲存區域
        - Ex. S3 Bucket
    - 更新可能是全新的韌體映像或現有韌體的補丁
- Verify
    - 驗證更新包的有效性
- Install
    - 設備通過更新包開始更新（通常是通過 bootloader）成最新的韌體
    - 安裝後可以執行檢查以驗證功能
    - 設備將向 OTA 更新提供者報告韌體更新成功

主要分成這四個步驟

## 模組化 OTA 更新

- 模組化 OTA 由幾個小型函式庫和一個協調器(Orchestrator)組成。
- 每個 Lib 負責特定的子任務，例如通知待處理的 OTA 更新或透過 MQTT 下載檔案
- 編排器將所有小型程式庫與bootloader 和 Memory Pool 同步以執行 OTA 更新。

模組化 OTA 方法可讓您根據需求的變化更換或更改 OTA 的不同部分。例如：

1. 如果您想從 AWS IoT 觸發 OTA，則可以使用 IoT Job Lib檢查新的 OTA 更新或傳送有關 OTA Jobs 狀態的通知。或者，您可以將其替換為任何其他其他的程式庫。
2. 可以使用IoT Job Lib 中的 **OTA Job Parser** 來解析接收到的OTAJob Document。或者，您可以根據 OTA Job Document 使用自己自訂的 Job Document Parser。

## 模組化 OTA 更新流程

以下是根據 FreeRTOS 官網提供的模組化 OTA更新的流程

![image](https://hackmd.io/_uploads/Sk_CRjSB6.png)


## 協調器（Orchestrator）

- Orchestrator 是指定如何協調 OTA 更新的核心元件
- Orchestrator 由使用者提供，並包含所需數量的自訂元件，以完成所需的 OTA 更新方法
- 典型的更新將包含「通知」、「下載」、「驗證」和「安裝」階段。 
- Orchestrator 將透過將元件函式庫和其他外部函式庫拼接在一起來提供這些階段
- 每個元件函式庫的描述可以在下面找到

## IoT Job Libraries

- IoT Job Handler 會是整個 OTA Flow 當中第一個使用到的元件
- 這個函式庫提供了啟動待處理的 IoT 作業以及更新作業狀態的功能
- 當作業處理程序獲悉新的 OTA 更新（透過 IoT Job 進行）時，處理程序將啟動 Job 並將 Job 及其 metadata 傳遞到解析器鏈
- 如果設定了解析器來處理該 Job ，它將向 Job Handler 轉送 Job 已成功啟動的資訊
- 此成功啟動通知將轉發回 OTA 更新提供者（即 IoT Jobs），以將更新標記為已啟動。如果沒有解析器能夠理解該作業，則啟動 OTA 更新的失敗將轉發給提供者

## OTA Job Parser

解析器將驗證 IoT 作業是否為 OTA 更新，並在呼叫下載器之前將欄位解析為可用格式

## MQTT file streaming library

- 文件下載器提供下載 OTA 檔案的功能。檔案下載器透過 CBOR 或 JSON 格式的 MQTT Stream 處理下載更新
- 下載本身是在 Chunk 上執行的，這更容易被視為整個 OTA 更新檔案的區塊。這樣做是為了提高下載的可靠性，並允許比單一下載「區塊」中可能進行的更大的韌體更新。

## Bootloader and Signature Verifier

- bootloader 的存在是為了驗證新韌體並將其安裝到裝置上
- 模組化 OTA 刻意避免實施 bootloader，因為已經存在適用於大量受支援微控制器的多個行業範圍的 bootloader
- 模組化 OTA 將 bootloader和簽章驗證機制的選擇留給使用者。

## AWS IoT Jobs 以及 AWS IoT OTA Update差異

- AWS IoT Jobs
    - 定義一組可以發送到一個或多個設備並在其上運行的遠端操作
    - 最常見的是，作業用於執行軟體或韌體更新，但也可用於執行任何任意操作，例如重新啟動、憑證 Rotate等
- AWS IoT OTA Update
    - 基於 AWS IoT Jobs 建置的功能，專門實現軟體/韌體更新操作，並且僅實現該操作
    - OTA 更新是一項 Job，**但有預先定義的 Job文件**。它捆綁了常見的軟體更新功能（例如程式碼簽署），可以能夠更快建立軟體更新解決方案

比較表格

||AWS IoT Jobs|AWS IoT OTA Updates|
|--|---------|---------------|
|用途|任何自定義的行為| FreeRTOS OTA update|
|Job 文件|可自定義|預先定義|
|建立的 API|CreateJob|CreateOTAUpdate|
|程式碼簽署|需使用者自行實踐|已整合|
|HTTP/MQTT|需使用者自行選擇|已整合|
|支援AWS IoT Device SDK|C, C++, Python, Java, Javascript |僅有 C |
|Platform Abstraction Layer (PAL)|無|有 [3]|
|Max 檔案限制| HTTP: **5GB (Amazon S3 limit)**, MQTT: **24MB (MQTT file stream limit)**| 16MB (OTA update limit)[4]|

## AWS IoT Over-The-Air (OTA) Library
> https://github.com/aws/ota-for-aws-iot-embedded-sdk

這個AWS函式庫同時包含了，FreeRTOS 以及 AWS IoT Device SDK for Embedded-C

這個函式庫同時包含了**OTA Platform Abstration Layer (PAL)** [3] 來去簡化將函式庫遷移到特定硬體的難度 [5]。

也有  OTA Operating System (OS) Functional Interface 來去簡化移植到 FreeRTOS 以外的 RTOS 甚至是裸機的困難度。

> 由於 AWS IoT OTA 適用於資源受限的設備，因此在原生的Device SDK 並沒有整合 FreeRTOS。出於同樣的原因，OTA 檔案大小限制為 16MB。



    


## 參考資料
[1] https://www.freertos.org/freertos-core/over-the-air-updates/index.html
[2] https://repost.aws/articles/ARDHNhV0bnRGau0kmdhTSZZA/comparing-aws-iot-jobs-and-aws-iot-over-the-air-ota-updates
[3] https://www.freertos.org/Documentation/api-ref/ota-for-aws-iot-embedded-sdk/docs/doxygen/output/html/ota_pal_interface.html
[4] https://docs.aws.amazon.com/general/latest/gr/amazon-freertos.html#limits-ota-manager
[5] Porting Guide - https://www.freertos.org/Documentation/api-ref/ota-for-aws-iot-embedded-sdk/docs/doxygen/output/html/ota_porting.html