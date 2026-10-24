---
title: Integrating a Lambda Function into Amazon Connect from Scratch
toc: true
tags:
  - AWS
  - Connect
  - Lambda
aside: true
categories: Hands-On Practices
abbrlink: "5db1b7e9"
date: 2023-08-01 22:21:33
description:
cover: /img/Connect.png
---

> 🌐 中文版：[繁體中文](/posts/5db1b7e9.html)

## Preface

In today's business environment, providing high-quality, efficient customer service is one of the keys to success. **Amazon Connect** is a powerful cloud contact center that helps businesses easily build highly reliable contact centers and interact seamlessly with customers. This post will walk you step by step through integrating a Lambda function into Amazon Connect to achieve more custom functionality.

We'll follow these steps to do the integration:

## Step 1: Create a Connect instance

First, we'll create a Connect instance in the Amazon Connect console.

In the Amazon Connect console, choose **Add Instance**. This step requires setting your **instance-alias**, which creates a unique access URL for your Connect instance.

![Imgur](https://i.imgur.com/JgeqYRX.jpg)

This step adds an admin; you'll need to set a username and password.

![Imgur](https://i.imgur.com/HqRmPC9.jpg)

For the remaining steps just click **Next**, and finally create the instance.

{% note info %} 
Creation takes a while, so you can create the Lambda function in the meantime.
{% endnote %}

## Step 2: Create a Lambda function

Go to the Lambda console and choose to create a Lambda function. Our Lambda's region is the same as the Connect instance's region, both `us-east-1`.

![Imgur](https://i.imgur.com/IF7ndGN.jpg)

Choose **Author from Scratch**, name the function `TestConnect`, and choose `Python 3.11` for the runtime. Keep everything else default, then create the function.

After creation, modify the Lambda code, adding a line in your handler.

```python
print("Invoke Success!")
```

Then click **deploy.**

## Step 3: Add Flows to Amazon Connect

> **In this step, we'll add Flows to the Connect instance. We'll use the Lambda function just created, letting Amazon Connect invoke it in certain situations.**

Go to the Connect instance you just created and click **Flows** in the left navigation.

![Imgur](https://i.imgur.com/evYMznQ.jpg)

Scroll down to **AWS Lambda**, choose the Lambda name you just created, then click **Add Lambda Function**.

![Imgur](https://i.imgur.com/n7jvJGT.png?1)

## Step 4: Configure contact flows

> **In this step, we'll configure contact flows so Amazon Connect triggers the Lambda function and performs custom actions in certain situations. We'll set a voice prompt and the action taken when the Lambda function is triggered.**

Open the access URL of the Connect instance you just created.

![Imgur](https://i.imgur.com/EgmgghI.jpg)

A screen like this appears.

![Imgur](https://i.imgur.com/OIOj9PJ.jpg)

In the left panel, find **Routing** and choose **Flows**.

![Imgur](https://i.imgur.com/CkJosG1.jpg)

Open it and choose **Create Flow**.

The first step is to enter a name for your flow; here I called it `TestConnect-LambdaFlow`. At first only an Entry appears on the canvas. Search for Lambda Invoke in the left search bar, and an **Invoke AWS Lambda function** block appears; drag it onto the center canvas. Click the dots in the top-right of Invoke AWS Lambda function and choose **edit setting**; an edit window appears on the right, where you enter the ARN of the Lambda function you created, then click **Save**.

![Imgur](https://i.imgur.com/9LBtvaI.jpg)

Then search for **Play Prompt** in the left search bar and drag it onto the center canvas, again clicking the top-right dots and choosing **edit setting**.

![Imgur](https://i.imgur.com/iskcGZZ.jpg)

Choose the Text-to-speech or chat text option, and below enter the message shown when the customer first joins the chat. Here I entered:

`Hi there,  this flow section will try to invoke Lambda function.`

Click Save when done.

Then search for **Disconnect** under **Terminate** in the left search bar and drag it onto the center canvas.

Finally connect all the block arrows; the overall flow looks like the figure below.

![Imgur](https://i.imgur.com/RPBKkRu.jpg)

The Lambda function is invoked whether it succeeds or not, but the prompt is only triggered on success; on failure it disconnects directly, and a failed Lambda invocation also disconnects directly.

Finally click **Save, then Publish**.

> Be sure to click Publish; if you don't, your configured flow won't appear on the dashboard.

## Step 5: Test the chat

> **Once everything is configured, we'll test. Through a simulated chat interface, we'll check whether the Lambda function is triggered successfully and verify the integration works as expected.**

Click the icon that looks a bit like the Windows logo at the top of the left panel, choose **Dashboard**, and return to the main screen.

![Imgur](https://i.imgur.com/IL3lPpV.jpg)

Click **Test Chat**, and the Test Chat page appears; click **Test Settings** in the top left.

![Imgur](https://i.imgur.com/0EFhRCk.jpg)

A settings menu appears; under Contact Flow choose the flow you just created, then click **Apply**.

![Imgur](https://i.imgur.com/sN5qfW5.jpg)

After clicking Apply, a simulated chat interface appears showing the customer joining the chat. Since our setting always disconnects regardless, we can go back to the Lambda page to check whether the function was triggered.

![Imgur](https://i.imgur.com/1LoXmPY.jpg)

## Step 6: Check the logs
> **Finally, we'll check the Lambda function's logs to confirm it was invoked correctly and ensure the integration's reliability.**

Back in the Lambda console, click **View CloudWatch logs**.

![Imgur](https://i.imgur.com/C5ziVSW.jpg)

Open the newest log stream and you'll find the string `Invoke Success!`, confirming our Lambda was invoked successfully.

![Imgur](https://i.imgur.com/xzwSbUl.jpg)

## Conclusion

Through this post, you've learned how to integrate the customer-service flow using Amazon Connect and a Lambda function, and achieve custom customer interactions. Let's take this integration journey together!
