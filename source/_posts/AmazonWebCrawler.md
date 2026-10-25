---
title: 🐞透過 Amazon Lambda 實踐 Web Crawler
toc: true
tags:
  - Amazon
  - Lambda
  - 網頁爬蟲
  - Python
aside: true
abbrlink: 6dbe323f
date: 2023-07-20 21:54:19
description:
categories: 實作紀錄
cover: /img/lambda.jpg
---

> 🌐 English version: [English](/en/posts/6dbe323f.html)


## 前言
這篇文章是在重現客戶問題時候的的實踐，原先為了解決客戶的問題，我試著想要安裝 **Selenium Chromedriver** 以及 **BeautifulSoup** ，打包成 Lambda Layer 並建立基於該Layer的Lambda，但一直出現 Chromedriver 找不到檔案的錯誤，左踩坑又踩坑的troubleshooting 突然這篇救星 https://stackoverflow.com/questions/69047401/selenium-docker-container-runs-on-ec2-but-not-on-aws-lambda ，根據這篇文章以及相對應的 github https://github.com/rchauhan9/image-scraper-lambda-container/tree/master，上面主要是以 Container Image 的方式來建立 Lambda ，但要這麼做之前會先將需要的套件跟環境打包成 Image。

但由於公司的 Mac 不能安裝 Docker，因此我先開個 EC2 來進行大部分操作

{% note alert  %}
本篇文章的範例以及建構所需知識皆參考自AWS官方文件
{% endnote%}

所有流程大概如下

{% note info %}
這邊透過 mermaid 繪製流程圖是參考這篇部落格以及官方文檔的教學
https://shannonhung.github.io/posts/first-blog.html#%E5%89%8D%E8%A8%80
https://mermaid.js.org/syntax/flowchart.html
{% endnote%}

{% mermaid %}
graph LR
   A(建立及設定EC2) --> B(設定VPC) 
   B(設定VPC) --> C(連接EC2)
   C(連接EC2) --> D(安裝Docker)
   D(安裝Docker) --> E(建構鏡像)
   E(建構鏡像) -->  F(測試容器)
   F(測試容器) --> G(推上儲存庫)
   G(推上儲存庫) --> H(建構Lambda)
{% endmermaid %}


## 安裝 EC2
```
Name: TestWebScrapping
AMI: Amazon Linux 2
Region: us-east-1
Access Key: "CWAccess.pem"
```

## 設定網路
```
IPv4 CIDR: 10.1.0.0/16

Subnet: TestSubnet1
CIDR: 10.1.0.0/24
RouteTable: 
10.1.0.0/16   |  local
0.0.0.0/0     |  Internet Gateway

Security Group
TCP 443 Source: 0.0.0.0/0
TCP 80 Source: 0.0.0.0/0
TCP 22 Source: 0.0.0.0/0
```

## 創建完畢後連接到 EC2
![Imgur](https://i.imgur.com/ZQwGuqY.jpg)

```
ssh -i "CWAccess.pem" ec2-user@ec2-3-83-139-226.compute-1.amazonaws.com
```



## 安裝 Docker

這邊的安裝文件可以參考aws的官方指引
https://docs.aws.amazon.com/zh_cn/AmazonECS/latest/developerguide/create-container-image.html

```SHELL
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user

此時重新登入Terminal
docker info
```


## 建構 Docker Image

在家目錄中先新增幾項檔案：

* requirements.txt
* entry.sh
* app/app.y

requirements.txt
```
requests==2.25.0
selenium==3.14.0
beautifulsoup4==4.9.3
Pillow==8.0.1
boto3
botocore
```

entry.sh
```bash
#!/bin/sh
if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
    exec /usr/bin/aws-lambda-rie /usr/local/bin/python -m awslambdaric $1
else
    exec /usr/local/bin/python -m awslambdaric $1
fi
```
給予執行權限
```
sudo chmod +x entry.sh
```

app/app.py
```
mkdir app
cd app
vim app.py
```
```python
import json

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

def handler(event, context):

    chrome_options = Options()
    
    chrome_options.add_argument('--autoplay-policy=user-gesture-required')
    chrome_options.add_argument('--disable-background-networking')
    chrome_options.add_argument('--disable-background-timer-throttling')
    chrome_options.add_argument('--disable-backgrounding-occluded-windows')
    chrome_options.add_argument('--disable-breakpad')
    chrome_options.add_argument('--disable-client-side-phishing-detection')
    chrome_options.add_argument('--disable-component-update')
    chrome_options.add_argument('--disable-default-apps')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-domain-reliability')
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-features=AudioServiceOutOfProcess')
    chrome_options.add_argument('--disable-hang-monitor')
    chrome_options.add_argument('--disable-ipc-flooding-protection')
    chrome_options.add_argument('--disable-notifications')
    chrome_options.add_argument('--disable-offer-store-unmasked-wallet-cards')
    chrome_options.add_argument('--disable-popup-blocking')
    chrome_options.add_argument('--disable-print-preview')
    chrome_options.add_argument('--disable-prompt-on-repost')
    chrome_options.add_argument('--disable-renderer-backgrounding')
    chrome_options.add_argument('--disable-setuid-sandbox')
    chrome_options.add_argument('--disable-speech-api')
    chrome_options.add_argument('--disable-sync')
    chrome_options.add_argument('--disk-cache-size=33554432')
    chrome_options.add_argument('--hide-scrollbars')
    chrome_options.add_argument('--ignore-gpu-blacklist')
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--metrics-recording-only')
    chrome_options.add_argument('--mute-audio')
    chrome_options.add_argument('--no-default-browser-check')
    chrome_options.add_argument('--no-first-run')
    chrome_options.add_argument('--no-pings')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--no-zygote')
    chrome_options.add_argument('--password-store=basic')
    chrome_options.add_argument('--use-gl=swiftshader')
    chrome_options.add_argument('--use-mock-keychain')
    chrome_options.add_argument('--single-process')
    chrome_options.add_argument('--headless')

    chrome_options.add_argument('--user-data-dir={}'.format('/tmp/user-data'))
    chrome_options.add_argument('--data-path={}'.format('/tmp/data-path'))
    chrome_options.add_argument('--homedir={}'.format('/tmp'))
    chrome_options.add_argument('--disk-cache-dir={}'.format('/tmp/cache-dir'))
        
    driver = webdriver.Chrome(
        executable_path='/usr/bin/chromedriver',
        options=chrome_options)

    if driver:
        print("Selenium Driver Initiated")
    
    response = {
        "statusCode": 200,
        "body": json.dumps(html, ensure_ascii=False)
    }

    return response
```

```
vim Dockerfile
```

Dockerfile
```dockerfile
# Define global args
ARG FUNCTION_DIR="/home/app/"
ARG RUNTIME_VERSION="3.9"
ARG DISTRO_VERSION="3.12"
# Stage 1
FROM python:${RUNTIME_VERSION}-alpine${DISTRO_VERSION} AS python-alpine

RUN apk add --no-cache \
    libstdc++
# Stage 2
FROM python-alpine AS build-image

RUN apk add --no-cache \
    build-base \
    libtool \
    autoconf \
    automake \
    libexecinfo-dev \
    make \
    cmake \
    libcurl

ARG FUNCTION_DIR
ARG RUNTIME_VERSION

RUN mkdir -p ${FUNCTION_DIR}

RUN python${RUNTIME_VERSION} -m pip install awslambdaric --target ${FUNCTION_DIR}

# Stage 3
FROM python-alpine as build-image2

ARG FUNCTION_DIR

WORKDIR ${FUNCTION_DIR}

COPY --from=build-image ${FUNCTION_DIR} ${FUNCTION_DIR}

RUN apk update \
    && apk add gcc python3-dev musl-dev \
    && apk add jpeg-dev zlib-dev libjpeg-turbo-dev

COPY requirements.txt .

RUN python${RUNTIME_VERSION} -m pip install -r requirements.txt --target ${FUNCTION_DIR}
# Stage 4
FROM python-alpine

ARG FUNCTION_DIR

WORKDIR ${FUNCTION_DIR}

COPY --from=build-image2 ${FUNCTION_DIR} ${FUNCTION_DIR}

RUN apk add jpeg-dev zlib-dev libjpeg-turbo-dev \
    && apk add chromium chromium-chromedriver

ADD https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/latest/download/aws-lambda-rie /usr/bin/aws-lambda-rie

RUN chmod 755 /usr/bin/aws-lambda-rie

COPY app/* ${FUNCTION_DIR}
COPY entry.sh /

ENTRYPOINT [ "/entry.sh" ]

CMD [ "app.handler" ]
```

建構 Image
```
docker build -t awsLambdacrawler .
```

一但建構完成後可以透過指令查看是否建構成功

```
docker images
```


## 測試容器
```
docker run -p 9000:8080 <IMAGE_ID>
```

輸出結果會像是這樣
![Imgur](https://i.imgur.com/QlxN5Cu.jpg)

此時可以再開一個 Terminal 來去 invoke 看看請求

```
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```

![Imgur](https://i.imgur.com/ciclBUc.jpg)

接著去建立 **ECR Repository**（在 Local Macbook）
```
aws ecr create-repository --repository-name cx-lambda --image-scanning-configuration scanOnPush=true
```
```
docker tag awsLambdacrawler:latest <ENTER YOUR CONTAINER REPOSITORY URI>:latest
```

接著我在 Local Macbook 查看 ECR 密碼

```
aws ecr get-login-password 
```

將密碼複製起來

```
docker login <YOUR AWS ACCOUNT ID>.dkr.ecr.<YOUR REGION>.amazonaws.com (http://amazonaws.com/)>
```
* username: AWS
* password:  剛剛複製的密碼


將 Image 推上 Repository
```
docker push  <YOUR AWS ACCOUNT ID>.dkr.ecr.<YOUR REGION>.amazonaws.com (http://amazonaws.com/)
```


可以去 ECR Console 上查看
![Imgur](https://i.imgur.com/mBqWiCX.jpg)


## 建立 Lambda

去 Lambda Console > Create Function > Container Image

```
Function Name: ScrappingfromImage
Container image URI: 125657041963.dkr.ecr.us-east-1.amazonaws.com/cx-lambda:latest
```


### 設定 Lambda  網路存取

若想要 Lambda Function 連接到外部網路，不同於EC2，你需要將 Lambda attach 到你自己的 VPC，並且需要把 Lambda 放到 private gateway，並且該 Private Gateway 必須要設定路由表中的預設路由到一個 **NAT Gateway**。
因為 Lambda 在連接到某個 VPC時會去建立一個 ENI，那個ENI預設只吃 Priavte IP，因此會需要一個 NAT Gateway 來進行公有私有IP的轉換，並且會透過一個叫 V2N 的功能來去連接到 NAT Gateway。

> 有興趣的話可以參考這兩份官方文件，裡面對 Lambda 的聯網機制有詳細介紹
> https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/foundation-networking.html
> https://aws.amazon.com/tw/blogs/compute/announcing-improved-vpc-networking-for-aws-lambda-functions/

這邊用流程圖展示的話會是這樣:

{% mermaid %}
flowchart LR
    subgraph Custom VPC
        direction LR
        c1(Lambda) ---> a2(NATGateway)
        subgraph Public Subnet
            direction LR
            a2(NATGateway)
        end
        subgraph Private Subnet
            direction LR
            c1(Lambda)
        end
    end
{% endmermaid %}

![Imgur](https://i.imgur.com/7suZcAG.jpg)

private route
![Imgur](https://i.imgur.com/DAMgy23.jpg)



### 設定 Lambda Permission

要記得幫 Lambda 添加 `VPCAccessExecutionRole` 這個 Permission

接著就是測試 code

但可以先去 Configuration > General Configuration > Timeout  把 timeout 調高

> Timeout: 20 sec


## 測試 Lambda

![Imgur](https://i.imgur.com/fVsALwS.jpg)

成功



