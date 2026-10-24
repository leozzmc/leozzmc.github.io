---
title: ⚙️Configuring Error Retries on Lambda
toc: true
tags:
  - Amazon
  - Lambda
aside: true
categories: Hands-On Practices
cover: /img/lambda.jpg
abbrlink: "d400aff3"
date: 2023-07-24 20:36:15
description:
---

> 🌐 中文版：[繁體中文](/posts/d400aff3.html)

## Preface

This is another problem I ran into while solving a case, but I'd never actually configured retries on Lambda, so in the spirit of experimentation I tried it out in my own environment.

Error retries in Lambda are usually for re-sending an invocation request after an **asynchronous invocation** fails. For asynchronous invocations, Lambda places the event in a queue and returns a success response containing no other information. A separate process reads events from the queue and delivers them to your function.

![Imgur](https://i.imgur.com/wn1vCQu.png)

> The diagram was made with ZenUML
> https://app.zenuml.com/
> https://mermaid.js.org/syntax/zenuml.html

## Creating the Lambda

Creating the Lambda is simple: create a function named **TestInvocations** using the `NodeJS.14.x` runtime.

## Modifying the Lambda handler code

Edit the code under the **Code** section of the Lambda console main page, changing `index.js`:

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

Once edited, click **deploy** to upload the modified code.

![Imgur](https://i.imgur.com/3XJYyyo.jpg)

## Configuring retries

In the Lambda console main page, go to the **Configuration** tab, select **Asynchronous Invocation**, then Edit.

![Imgur](https://i.imgur.com/uVM6U6E.jpg)

**Retry attempts** can be set to at most `2`. When your Lambda function errors after receiving an asynchronous invocation, it retries twice and then the event is discarded. You can additionally configure a **Dead Letter Queue (DLQ)** to store the discarded events for later processing.

> For details, see the official docs: https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/invocation-async.html#invocation-dlq

## Triggering the Lambda

We can invoke the Lambda function via the **AWS CLI**.

> If you haven't set up the AWS CLI, see this doc to configure it >> https://aws.amazon.com/cli/

```shell
aws lambda invoke --function-name TestInvocations --invocation-type Event test.txt
```

Here `--invocation-type` is set to Event, meaning you're invoking the Lambda asynchronously.

It then returns status code `202`, meaning your request has been accepted by Lambda but won't be processed immediately (since it's asynchronous).
> Reference:
https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/API_Invoke.html

{% note info %}
For Lambda synchronous and asynchronous invocation, see the corresponding official docs:
https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/invocation-async.html
https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/invocation-sync.html
As for their architectural differences, I can write a separate post to organize that later!
{% endnote %}

## Observing the results

Go to the **Monitor** tab in the Lambda console and click View **CloudWatch logs**, which opens the CloudWatch Logs main page.

![Imgur](https://i.imgur.com/aOskbVm.jpg)
![Imgur](https://i.imgur.com/EKlsnSl.jpg)

Each time you create a Lambda, its execution role is given a policy named `AWSBasicExecutionRole` by default, which includes permission to create CloudWatch log groups and CloudWatch logs, and creates a **log group** named `/aws/lambda/<your Lambda name>`. Under this log group are many **log streams**, and a new log stream is created each time you change your Lambda function and re-trigger it.

![Imgur](https://i.imgur.com/JSuUpCk.jpg)

Select the newest log stream and you'll find three invocations: the first is the one we triggered, and the second and third are the retries we configured.

Trigger request 1
![Imgur](https://i.imgur.com/OMHbzV7.jpg)
Retry 1
![Imgur](https://i.imgur.com/gmvSuMn.jpg)
Retry 2
![Imgur](https://i.imgur.com/mbniv78.jpg)

Here you can observe that the logs after invocation show the error message, with the first retry one minute after the first failed request, and the second retry two minutes after the first retry fails, after which it doesn't retry again. You can also see that the request ID on retry is the same as the original, which you could probably use to judge whether an invocation is a retry and whether the event has already been processed.

## Conclusion

When developing Lambda code and doing related configuration, always pay attention to the invocation type and its corresponding settings, so you don't mix them up unknowingly.

## References

https://azole.medium.com/aws-lambda-reuse-and-retry-behavior-ffaac616d869
https://docs.aws.amazon.com/zh_tw/lambda/latest/dg/invocation-retries.html
