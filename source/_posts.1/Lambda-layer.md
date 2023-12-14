---
title: Lambda_layer 概念和實作
toc: true
tags:
  - AWS
  - Lambda
aside: true
categories: 實作紀錄
abbrlink: f40d2e89
date: 2023-10-20 21:10:11
cover: /img/pepe3.jpg
---

## 前言

針對 Lambda 設定，絕大多數人一定碰過 `ImportModuleError`  所以各位可以跟著以下的情境，開一個一樣的 Lambda 環境逐步操作。

## 情境
- Region: `IAD(us-east-1)`
- Runtime: `Python3.11`
- Lambda Name: "ITHomeLambdaFunction"
- Lambda code
```python
import json requests

def lambda_handler(event, context):
    # TODO implement
    x = requests.get('https://www.ntust.edu.tw/')
    print(x.text)
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

```


## \[Error\]: Runtime.ImportModuleError

如果你按照上述情境部署，並且進行測試，可能會報出類似下面的錯誤

```
{
  "errorMessage": "Unable to import module 'lambda_function': No module named 'requests'",
  "errorType": "Runtime.ImportModuleError",
  "requestId": ".......",
  "stackTrace": []
}
```

這個錯誤的原因在於，在 AWS Lambda python 3.8 Runtime 之後的版本就沒有原生支援 requests 模組，會需要自己添加**層（layer）**


## 什麼是 Lambda 層（Layer）

在 Lambda 中， Layer 是用來存放dependency 或者是模組用的zip 壓縮檔。不同的 Lambda 函數也可以通過 layer 來去共享資料。

一旦你為你的 Lambda 函數新增一個 Layer，**Lambda 就會去將你 layer當中的資料放到 Lambda 執行環境中的 `/opt` 目錄底下**。

![](https://hackmd.io/_uploads/H1a_iXvk6.png)


> 注意： 每個函數最多只能包含5個 Layer 

## 打包模組到 Layer

每個 Layer 當中的模組，隨著你使用 Runtime 的不同，打包 zip檔時會需要遵循不同的檔案結構 [1]。

以 Python 來說 檔案結構可以是:

- `/opt/python`
- ``/opt/python/lib/python3.x/site-packages ``

而所有 Runtime 都支援以下兩種額外的目錄：
- `/bin (PATH)`
- `/lib (LD_LIBRARY_PATH)`

現在我們就來為 requests 打包成壓縮檔吧

1. 本機封裝層內容，請執行下面的指令，若您的套件安裝工具是 pip3 則將指令開頭替換成 pip3

```
pip install requests --target=./python 
```
這會在你本地當中建立 python/ 目錄，並將所需的模組下載到目錄中，請注意這裡的目錄名稱需要與 Runtime 所使用的語言匹配。

2. 打包目录
```
zip -r layer.zip python/
```
去將 python 目錄底下的所有檔案打包至一個 zip檔

3. 在Lambda 主控台中，左側導覽區域中有個 **layer**，點選後會跳轉至layer頁面，可以在頁面中選擇新增新的layer

![](https://hackmd.io/_uploads/SyjslEwya.png)

為Layer 取名並且在頁面中上傳剛才建立的 `layer.zip`，接著選擇 Runtime 以及架構後就可以建立Layer了。

![](https://hackmd.io/_uploads/HkELWNPJa.png)

完成後就回到 Lambda 主頁去新增 Layer

![](https://hackmd.io/_uploads/HkbdbNvyp.png)

新增 Layer 的頁面中選擇 Custom Layer，就可以看到剛剛建立的 Layer了。

![](https://hackmd.io/_uploads/S1esbVwJp.png)

## 測試

這時再度從主控台按下測試，就不會報錯了

![](https://hackmd.io/_uploads/rkNaf4v16.png)

或者通過 AWS CLI 去調用

```
aws lambda invoke \
    --cli-binary-format raw-in-base64-out \
    --function-name ITHomeLambdaFunction \
    --payload '{ "Test": "ITHome" }' \
    response.json
```

![](https://hackmd.io/_uploads/HkRKONw1a.png)

去看 CloudWatch 也能收到資料
> 雖然把吐回來的東西拆成一個一個log entry 很怪XD

![](https://hackmd.io/_uploads/ryK-tEvkp.png)


## 參考資料
[1] [每個 Lambda 執行時間的層路徑](https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/packaging-layers.html#packaging-layers-paths)


