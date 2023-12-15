---
title: 機群佈建(Fleet Provisioning) - 預先佈建裝置到 AWS IoT
tags:
  - AWS
  - IoT Core
  - Device Provisioning
  - Certificate
  - Policy
aside: true
categories: 實作紀錄
abbrlink: 889a40ef
date: 2023-11-09 15:14:35
cover: /img/OIG.jpeg
---

## 簡介


## 什麼是機群佈建(Fleet Provisioning)?

機群佈建當中也有分成 **要求佈建 （Provisioning by Claim）** 還有 **透過信任的使用者佈建 （Provisioning by Trusted User）**

### 要求佈建

裝置可以使用內嵌的佈建宣告憑證（Claim Certificate）(這是特殊用途的憑證) 和私有金鑰  來製造。如果這些憑證已向 AWS IoT 註冊，該服務可以將它們交換為裝置可用於一般操作的唯一裝置憑證。


### 透過信任的使用者佈建

在許多情況下，如終端使用者或安裝技術人員等信任的使用者初次使用行動應用程式在其部署的位置設定裝置時，裝置會連線至 AWS IoT


> 在本篇文章中，主要會介紹透過 **要求佈建** 的方式來去進行機群佈建


## 要求佈建的流程

![Imgur](https://i.imgur.com/5UPLkKJ.png)

## 設置 - AWS IoT Core

### 建立憑證以及公私鑰對

產生用於佈建的憑證。

- 可以在 AWS IoT Console 上的 **Secure** >> **Certificates** >> **Add Certificates** >> **Create Certificates**

![Imgur](https://i.imgur.com/ay2zm5V.png)
![Imgur](https://i.imgur.com/Qnr2Olh.png)

- 接著會跳出對應的畫面，會需要去下載憑證跟私鑰到本地端，另外為了方便也請將 Root CA 憑證下載到本地

![Imgur](https://i.imgur.com/kRUAGF9.png)

### 建立 Provisioning Template 並且附加 Policy

- 建立 Provisioning Template

![Imgur](https://i.imgur.com/cG83JRG.png)

- 選擇 **Provisioning deivces with claim certificates**，之後點選 **Nexts**
  
![Imgur](https://i.imgur.com/7baFaol.png)

- 建立給 IoT Service 的 Role，點選 **Create Role**
- 輸入完畢 Role Name 後點選 **View**

![Imgur](https://i.imgur.com/6bZNMWr.png)

- Attach policy
- 請搜尋並附加 AWS 管理的 Policy `AWSIoTThingsRegistration`

![Imgur](https://i.imgur.com/MwkIdA0.png)
![Imgur](https://i.imgur.com/YW2Nfdh.png)

- Claim certificate policy，點選 **Create IoT  Policy**

![Imgur](https://i.imgur.com/21XORly.png)

-  填入 Policy Name 之後貼上範例 JSON

![Imgur](https://i.imgur.com/mNKS8IC.png)

範例 IoT Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["iot:Connect"],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": ["iot:Publish","iot:Receive"],
            "Resource": [
                "arn:aws:iot:aws-region:aws-account-id:topic/$aws/certificates/create/*",
                "arn:aws:iot:aws-region:aws-account-id:topic/$aws/provisioning-templates/templateName/provision/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": "iot:Subscribe",
            "Resource": [
                "arn:aws:iot:aws-region:aws-account-id:topicfilter/$aws/certificates/create/*",
                "arn:aws:iot:aws-region:aws-account-id:topicfilter/$aws/provisioning-templates/templateName/provision/*"
            ]
        }
    ]
}
```

![Imgur](https://i.imgur.com/Hzebj7r.png)

- 勾選憑證

![Imgur](https://i.imgur.com/5y8PAPu.png)

完成後就可以來設定預佈建

### 設定預先佈建

機群佈建的範本範例
> https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/provision-template.html#fleet-provisioning-example

```json
{
    "Parameters" : {
        "ThingName" : {
            "Type" : "String"
        },
        "SerialNumber": {
            "Type": "String"
        },
        "DeviceLocation": {
            "Type": "String"
        }
    },
    "Mappings": {
        "LocationTable": {
            "Seattle": {
                "LocationUrl": "https://example.aws"
            }
        }
    },
    "Resources" : {
        "thing" : {
            "Type" : "AWS::IoT::Thing",
            "Properties" : {
                "AttributePayload" : { 
                    "version" : "v1",
                    "serialNumber" : "serialNumber"
                },
                "ThingName" : {"Ref" : "ThingName"},
                "ThingTypeName" : {"Fn::Join":["",["ThingPrefix_",{"Ref":"SerialNumber"}]]},
                "ThingGroups" : ["v1-lightbulbs", "WA"],
                "BillingGroup": "LightBulbBillingGroup"
            },
            "OverrideSettings" : {
                "AttributePayload" : "MERGE",
                "ThingTypeName" : "REPLACE",
                "ThingGroups" : "DO_NOTHING"
            }
        },
        "certificate" : {
            "Type" : "AWS::IoT::Certificate",
            "Properties" : {
                "CertificateId": {"Ref": "AWS::IoT::Certificate::Id"},
                "Status" : "Active"
            }
        },
        "policy" : {
            "Type" : "AWS::IoT::Policy",
            "Properties" : {
                "PolicyDocument" : {
                    "Version": "2012-10-17",
                    "Statement": [{
                        "Effect": "Allow",
                        "Action":["iot:Publish"],
                        "Resource": ["arn:aws:iot:us-east-1:123456789012:topic/foo/bar"]
                    }]
                }
            }
        }
    },
    "DeviceConfiguration": {
        "FallbackUrl": "https://www.example.com/test-site",
        "LocationUrl": {
            "Fn::FindInMap": ["LocationTable",{"Ref": "DeviceLocation"}, "LocationUrl"]}
        }
}
```

預先佈建掛接是 Lambda 函數，會先驗證從裝置傳遞的參數，然後才能佈建裝置。此 Lambda 函數必須存在於您的帳戶中，才能佈建裝置。

這個部分是要設定在配置設備之前執行操作。例如，根據已知設備數據庫檢查設備，以防止未經授權的設備連接到您的帳戶。

![Imgur](https://i.imgur.com/pL1yTCM.png)

- 選擇 **Create a Lambda function**

### Sample provisioning hook where you validate the request before activating a certificate

> Github: https://github.com/aws-samples/aws-iot-fleet-provisioning#sample-provisioning-hook-where-you-validate-the-request-before-activating-a-certificate

```python
import json
from datetime import date

provision_response = {
    'allowProvisioning': False,
    "parameterOverrides": {"CertDate": date.today().strftime("%m/%d/%y")}
}


def handler(event, context):

    ########################
    ## Stringent validation against internal API's/DB etc to validate the request before proceeding
    ##
    ## if event['parameters']['SerialNumber'] = "approved by company CSO":
    ##     provision_response["allowProvisioning"] = True
    #####################
    
  
    return provision_response
```

### Hook Input
> https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/pre-provisioning-hook.html#pre-provisioning-hook-input

```json
{
    "claimCertificateId" : "string",
    "certificateId" : "string",
    "certificatePem" : "string",
    "templateArn" : "arn:aws:iot:us-east-1:XXXXXXXXXXXX:provisioningtemplate/MyTemplate",
    "clientId" : "221a6d10-9c7f-42f1-9153-e52e6fc869c1",
    "parameters" : {
        "string" : "string",
        ...
    }
}
```

向 AWS IoT 註冊裝置時，AWS IoT 會將此物件傳送至 Lambda 函數。

傳遞給 Lambda 函數的 `parameters` 物件包含在 **RegisterThing** 請求 Payload中傳遞之 parameters 引數中的屬性


## 設置 - 設備端

所下載的 Claim 憑證和私鑰會需要移動到設備端

可以通過像是 `scp` 之類的命令來去透過 SSH 將本地複製檔案到您的設備中。

另外，會需要在設備端去安裝想要使用的 **IoT Device SDK**

> AWS IoT 裝置 SDK、行動 SDK 和 AWS IoT 裝置用戶端 - https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/iot-sdks.html

目前有支援以 C++, javascript, Java, Python, Embedded-C 語言撰寫的 Device SDK，可以根據實際需求和情境進行使用。

### 使用 AWS IoT Device SDK

> https://github.com/aws/aws-iot-device-sdk-python-v2

本篇文章主要使用 **Python IoT Device SDKv2**

若要安裝 SDK 到設備，請先確認設備上是否有 `git` , `Python3`還有 `Python3-pip`套件

```
git clone https://github.com/aws/aws-iot-device-sdk-python-v2.git
```

初始化套件

```
#  (Optional) Setup the version number of your local build. The default version 
#    for awsiotsdk is set to "1.0.0-dev", you can set the version number of the
#    local build in "aws-iot-device-sdk-python-v2/awsiot/__init__.py"
sed -i "s/__version__ = '1.0.0-dev'/__version__ = '<SDK_VERSION>'/" \
  aws-iot-device-sdk-python-v2/awsiot/__init__.py

#  Install using Pip (use 'python' instead of 'python3' on Windows)
python3 -m pip install ./aws-iot-device-sdk-python-v2

```

在 `aws-iot-device-sdk-python-v2/samples/fleetprovisioning.py` 你也可以通過教本來去設置 Provisioning Template。


而後續您需要在您的設備上指定：
- AWS IoT Endpoint
- Claim Certificate
- Private Key
來去連接到 AWS IoT Core 

腳本的操作步驟可以在下面找到
> https://github.com/aws/aws-iot-device-sdk-python-v2/blob/main/samples/fleetprovisioning.md

```
python3 fleetprovisioning.py --endpoint <endpoint> --cert <file> --key <file> --template_name <name> --template_parameters '{\"SerialNumber\":\"1\",\"DeviceLocation\":\"Seattle\"}' --csr <path to csr file>
```

## 參考文件
[+] https://github.com/aws-samples/aws-iot-fleet-provisioning
[+] https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/iot-provision.html
[+] https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/provision-wo-cert.html#claim-based
[+] https://aws.amazon.com/tw/blogs/iot/how-to-automate-onboarding-of-iot-devices-to-aws-iot-core-at-scale-with-fleet-provisioning/

