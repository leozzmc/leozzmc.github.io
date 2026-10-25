---
title: 🐞Building a Web Crawler with Amazon Lambda
toc: true
tags:
  - Amazon
  - Lambda
  - Web Crawler
  - Python
aside: true
abbrlink: "6dbe323f"
date: 2023-07-20 21:54:19
description:
categories: Hands-On Practices
cover: /img/lambda.jpg
---

> 🌐 中文版：[繁體中文](/posts/6dbe323f.html)

## Preface
This post is from reproducing a customer issue. To solve the customer's problem, I tried to install **Selenium Chromedriver** and **BeautifulSoup**, package them into a Lambda Layer, and build a Lambda based on that layer, but kept getting a "Chromedriver file not found" error. After pit after pit of troubleshooting, this savior suddenly appeared: https://stackoverflow.com/questions/69047401/selenium-docker-container-runs-on-ec2-but-not-on-aws-lambda. Based on this article and the corresponding GitHub https://github.com/rchauhan9/image-scraper-lambda-container/tree/master, it mainly builds the Lambda via a container image, but before doing so you first package the needed packages and environment into an image.

But since the company Mac can't install Docker, I first spun up an EC2 for most of the work.

{% note alert  %}
The examples and the knowledge needed to build this post all reference the AWS official docs.
{% endnote%}

The whole flow is roughly as follows.

{% note info %}
I drew the flowchart with mermaid, referencing this blog and the official doc tutorial:
https://shannonhung.github.io/posts/first-blog.html#%E5%89%8D%E8%A8%80
https://mermaid.js.org/syntax/flowchart.html
{% endnote%}

{% mermaid %}
graph LR
   A(Create and configure EC2) --> B(Configure VPC) 
   B(Configure VPC) --> C(Connect to EC2)
   C(Connect to EC2) --> D(Install Docker)
   D(Install Docker) --> E(Build image)
   E(Build image) -->  F(Test container)
   F(Test container) --> G(Push to repository)
   G(Push to repository) --> H(Build Lambda)
{% endmermaid %}

## Installing EC2
```
Name: TestWebScrapping
AMI: Amazon Linux 2
Region: us-east-1
Access Key: "CWAccess.pem"
```

## Configuring the network
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

## After creation, connect to EC2
![Imgur](https://i.imgur.com/ZQwGuqY.jpg)

```
ssh -i "CWAccess.pem" ec2-user@ec2-3-83-139-226.compute-1.amazonaws.com
```

## Installing Docker

For the install docs here, refer to the AWS official guide:
https://docs.aws.amazon.com/zh_cn/AmazonECS/latest/developerguide/create-container-image.html

```SHELL
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# log back into the terminal at this point
docker info
```

## Building the Docker image

First create a few files in the home directory:

* requirements.txt
* entry.sh
* app/app.py

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
Give it execute permission
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

Build the image
```
docker build -t awsLambdacrawler .
```

Once built, check whether it succeeded with:

```
docker images
```

## Testing the container
```
docker run -p 9000:8080 <IMAGE_ID>
```

The output will look like this
![Imgur](https://i.imgur.com/QlxN5Cu.jpg)

Now open another terminal to invoke and test the request

```
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```

![Imgur](https://i.imgur.com/ciclBUc.jpg)

Then create an **ECR Repository** (on the local MacBook)
```
aws ecr create-repository --repository-name cx-lambda --image-scanning-configuration scanOnPush=true
```
```
docker tag awsLambdacrawler:latest <ENTER YOUR CONTAINER REPOSITORY URI>:latest
```

Then on the local MacBook, get the ECR password

```
aws ecr get-login-password 
```

Copy the password

```
docker login <YOUR AWS ACCOUNT ID>.dkr.ecr.<YOUR REGION>.amazonaws.com (http://amazonaws.com/)>
```
* username: AWS
* password: the password just copied

Push the image to the repository
```
docker push  <YOUR AWS ACCOUNT ID>.dkr.ecr.<YOUR REGION>.amazonaws.com (http://amazonaws.com/)
```

Check it in the ECR console
![Imgur](https://i.imgur.com/mBqWiCX.jpg)

## Creating the Lambda

Go to Lambda Console > Create Function > Container Image

```
Function Name: ScrappingfromImage
Container image URI: 125657041963.dkr.ecr.us-east-1.amazonaws.com/cx-lambda:latest
```

### Configuring Lambda network access

If you want the Lambda function to connect to the external network, unlike EC2, you need to attach the Lambda to your own VPC, put the Lambda in a private subnet, and that private subnet's route table must have its default route set to a **NAT Gateway**.
Because when Lambda connects to a VPC it creates an ENI, and that ENI by default only takes a private IP, so a NAT Gateway is needed to translate between public and private IPs, and it connects to the NAT Gateway via a feature called V2N.

> If interested, refer to these two official docs, which detail Lambda's networking mechanism:
> https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/foundation-networking.html
> https://aws.amazon.com/tw/blogs/compute/announcing-improved-vpc-networking-for-aws-lambda-functions/

As a flowchart it looks like this:

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

### Configuring Lambda permissions

Remember to add the `VPCAccessExecutionRole` permission to the Lambda.

Then test the code.

But first go to Configuration > General Configuration > Timeout and raise the timeout.

> Timeout: 20 sec

## Testing the Lambda

![Imgur](https://i.imgur.com/fVsALwS.jpg)

Success

