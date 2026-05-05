---
title: 'Hands-On Practice: Amazon SNS Fan out to Amazon SQS'
toc: true
tags:
  - AWS
  - SNS
  - SQS
  - Publish-Subscribe-Model
aside: true
categories: 實作紀錄
abbrlink: efc78ef4
date: 2023-10-24 10:18:53
cover: /img/pepe5.jpeg
---

## Introduction

Amazon SNS offen works well with Amazon SQS, by subscribing SQS to SNS, the SNS service can push messages to SQS. **This may eliminating the need to periodically check or "poll" for updates.**

### What is Amazon SQS?

By official definition
> Amazon SQS is a message queue service used by distributed applications to exchange messages through a polling model, and can be used to decouple sending and receiving components—without requiring each component to be concurrently available. 

## Scenario

> The **Fanout** scenario is when a message published to an SNS topic is replicated and pushed to multiple endpoints, such as Kinesis Data Firehose delivery streams, Amazon SQS queues, HTTP(S) endpoints, and Lambda functions. This allows for parallel asynchronous processing.
> For example, you can develop an application that publishes a message to an SNS topic whenever an order is placed for a product. Then, SQS queues that are subscribed to the SNS topic receive identical notifications for the new order. An Amazon Elastic Compute Cloud (Amazon EC2) server instance attached to one of the SQS queues can handle the processing or fulfillment of the order. And you can attach another Amazon EC2 server instance to a data warehouse for analysis of all orders received.[1]

## Steps
Here we will go through each step of fan out to Amazon SQS.

The initial step is to remember both SNS arn and SQS arn.

### Create SQS Queue

First, you'll need to create a standard queue in SQS console

![Imgur](https://i.imgur.com/RRffWm5.png)

After creating the standard queue, it will shows the arn.

Make sure noted this arn, you'll need to provide this arn when creating the subscriptions

### Create SNS Topic

Second, you need to create a SNS topic in the SNS console..

![Imgur](https://i.imgur.com/ygA6g1P.png)

And again, you'll need to note the topic arn.

### Provide Permission to SNS to send messages to SQS

By default, SNS will not have permission to send messages to SQS, so you need to provide permission to SNS for sending messages.

- Go to SQS Console
- Press "Edit" in the top corner
- Scroll down to the "Access Policy"

![Imgur](https://i.imgur.com/keRSRlR.png)

-  Append new statement in the Access Policy

```json
{
    "Effect": "Allow",
    "Principal": {
      "Service": "sns.amazonaws.com"
    },
    "Action": [
      "sqs:DeleteMessage",
      "sqs:ReceiveMessage",
      "sqs:SendMessage"
    ],
    "Resource": "arn:aws:sqs:us-east-1:xxxxxxxxxxxx:QueueforSNS",
    "Condition": {
    "ArnEquals": {
        "aws:SourceArn": "arn:aws:sns:us-east-1:xxxxxxxxxxxx:StandardTopicforSQS"
      }
    }
}
```

![Imgur](https://i.imgur.com/UWjKND7.png)

### Subscribe SQS queue to SNS topic

Now you'll need to subscribe the SQS queue to the SNS topic.

- Go to SNS console
- Scroll down and choose "Create Subscription"

![Imgur](https://i.imgur.com/qTEPbQb.png)

- Choose your topic arn
- Set the protocal to SQS
- Choose the SQS arn

![Imgur](https://i.imgur.com/voJqHuB.png)


Once complete, you will notice that the subscripe confirmation also completes. If you create a SQS type subscription by using console, you don't need confirm the subscription manually.

![Imgur](https://i.imgur.com/Jr4Brob.png)

> **But if you create a cross-account subscription, you will receive the confirmation url in the SQS queue, and you will need to click the confirmation URL. [3]**

### Provide Permission to User for topic/queue operations

You can add permissions to an IAM User to publish SNS messages to a topic.

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:us-east-2:XXXXXXXXXXXX:MyTopic"
    }
  ]
}
```

And you also need to provide permissions to SQS queue to recieve and delete messages

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage"
      ],
      "Resource": [
        "arn:aws:sqs:us-east-2:XXXXXXXXXXXX:MyQueue1",
        "arn:aws:sqs:us-east-2:XXXXXXXXXXXX:MyQueue2"
      ]
    }
  ]
}
```

However,if you want to perform cross-account operations, you will need to provide permissions to the other account.

For example, if you want to let acount: 111122223333 to publish messages to SNS topic in your account, here is an example policy.

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "111122223333"
      },
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:us-east-2:XXXXXXXXXXXXX:MyTopic"
    }
  ]
}
```
if you want to let acount: 111122223333 to perform receive abd delete messages to queue in your account, here is an example policy.

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "111122223333"
      },
      "Action": [
        "sqs:DeleteMessage",
        "sqs:ReceiveMessage"
      ],
      "Resource": [
        "arn:aws:sqs:us-east-2:XXXXXXXXXXXX:MyQueue"
      ]
    }
  ]
}
```

### Test subscription

Now we can test the message delivery to the queue.

- Go to the SNS console
- Press "Push Message" in the top right corner 
- Enter the message subject and meesage body

![Imgur](https://i.imgur.com/iu7VJVX.png)
![Imgur](https://i.imgur.com/ppgfOf0.png)

- Go to the SQS console
- Press "Send and Receive Message" in the top right corner
- Scroll down , and press the "Poll for all messages"
- And you'll find the messages are in polling progress.

![Imgur](https://i.imgur.com/aYWXVIE.png)

- Then the test meesages showed in the console

![Imgur](https://i.imgur.com/Vj3cCc9.png)

## Conclusions

We successfully fan out the message from the Amazon SNS to the Amazon SQS. 

## Reference
[1] https://docs.aws.amazon.com/sns/latest/dg/sns-common-scenarios.html#SNSFanoutScenario
[2] https://docs.aws.amazon.com/zh_tw/sns/latest/dg/sns-sqs-as-subscriber.html
[3]https://docs.aws.amazon.com/zh_tw/sns/latest/dg/sns-send-message-to-sqs-cross-account.html
