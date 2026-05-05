---
title: "Hands-On Practice: S3 Gateway Endpoints"
toc: true
tags:
  - AWS
  - S3
  - Endpoints
  - Gateway
aside: true
categories: 實作紀錄
abbrlink: e7e295f6
date: 2023-10-23 12:32:05
cover: /img/pepe4.jpeg
---

# What is S3 Gateway Endpoints?

![Imgur](https://i.imgur.com/MUsKNi4.png)


Let's consider a scenario

> How could your Lambda function access the content in the S3 bucket?

If you want a service to access the content in the S3 bucket, it usually go through VPC endpoint. S3 supports two types of VPC endpoint,each of which is **Gateway endpoint** and **Interface endpoint**

<!--如果要通過一個服務來存取 S3 當中的內容，通常是會通過 VPC Endpoint，而在 S3 當中又支援兩種不同的 VPC Endpoint類型，分別是 **Gateway Endpoint** 以及 **Interface Endpoint**-->

The diffeences between two types of VPC endpoints are listed below

| S3 Gateway Endpoints | S3 Interface Endpoints  |
|--|--|
| Use S3 Public IP Address | Use Private IP Address in VPC to access S3 |
|Use the same S3 DNS Name | Name must include VPC Endpoint ID [3]|
|cannot access internally| can access internally|
|cannot access from other AWS region | can access from other AWS region by using VPC peering or AWS Transit gateway|
| Free | In chrarge |

<!-- >> **所以當你的情境是你在同個 Region 底下有個 Lambda 函數想要存取 S3 的內容，那就很適合使用 Gateway Endpoint** -->

> So if your scenario is that a Lambda function want to access the content in S3 bucket in the same region, it is great to utilize the Gateway Endpoint


## Consideration of S3 Gateway Endpoint

It is worth to mestion that there are several things you need to consider before choosing S3 Gateway Endpoints, make sure you go through the section in the official documentation

> https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html#gateway-endpoint-considerations-s3

## Private DNS 

When you are trying yo create Gateway Endpoint or Interface Endpoint for your S3, you can decide creating private DNS for cost down.

> This is implement by Route53 Resolver
> For detail you can check：https://docs.aws.amazon.com/zh_tw/Route53/latest/DeveloperGuide/resolver.html

# [Steps for building Gateway Endpoint](https://docs.aws.amazon.com/zh_tw/vpc/latest/privatelink/vpc-endpoints-s3.html#create-gateway-endpoint-s3)

- Go to AWS Console to create the endpoint

> VPC / Endpoints / Create Endpoint

![Imgur](https://i.imgur.com/asOslk6.png)

- Choose `AWS services` , and `com.amaazonaws.us-east-1.s3`

![Imgur](https://i.imgur.com/ujgXmUq.png)

- Then, press create endpoints

## Associate Route Table

- Make sure the route table that assoicate to the gateway endpoint is clean.
> If you don't have on, then make one.

![Imgur](https://i.imgur.com/cI4mrOt.png)

## Configure policy

- For testing purposes, I choose `Full Access`

![Imgur](https://i.imgur.com/kiQtSej.png)

- Then, press create endpoint

## Check the routing

After establishing the endpoint, you can check if the default route of route table is well configured

![Imgur](https://i.imgur.com/3Ajfl91.png)

Next, we must configure a Lambda function for accessing S3 bucket.

## Configure Lambda Function

If you put a Lambda funciton into a VPC, it will attach to 2 subnets by defaults.

Make sure two subnet have default route to S3 Gateway Endpoints.

![Imgur](https://i.imgur.com/XmbfUKe.png)
![Imgur](https://i.imgur.com/AP6fZGy.png)


- Create Lambda function, and enable the VPC

![Imgur](https://i.imgur.com/eBfWExA.png)

- Lambda Code

```python
import json
import boto3

def lambda_handler(event, context):
    print("CREATE CLIENT")
    s3 = boto3.client("s3")
    print("START REQUEST")
    resp = s3.list_objects(Bucket="testbucket4-s3gateway-endpoint")
    print(resp)

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
```

In this Lambda code, Lambda will try to list the objects in the bucket, can print out the information of  response object in the log.

- Configure policy of Lambda execution role

I simply attach AWS Managed Policy `AmazonS3FullAccess` to the execution role for testing
> Notice, you should not give full access to your Lambda function in production mode, make sure giving adequient permssion to the role.

![Imgur](https://i.imgur.com/U3mPX0h.png)

## Check invocations

-  Press `test` button in the Lambda console, you'll noticee the lambda get invoked successfully

![Imgur](https://i.imgur.com/WB3iyyD.png)

- Then you need to check the invocation logs in CloudWatch

![Imgur](https://i.imgur.com/j5q8yCp.png)

You can see that the object information were listed and printed out in the invocation logs.


## Reference
[1] https://docs.aws.amazon.com/zh_tw/vpc/latest/privatelink/vpc-endpoints-s3.html#create-gateway-endpoint-s3
[2] https://docs.aws.amazon.com/zh_tw/AmazonS3/latest/userguide/privatelink-interface-endpoints.html#types-of-vpc-endpoints-for-s3
[3] https://docs.aws.amazon.com/zh_tw/AmazonS3/latest/userguide/privatelink-interface-endpoints.html#accessing-s3-interface-endpoints
