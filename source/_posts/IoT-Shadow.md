---
title: "Hands-On Practice: AWS IoT Device Shadow"
toc: true
tags:
  - AWS
  - IoT Core
  - IoT Shadow
  - MQTT
aside: true
categories: 實作紀錄
abbrlink: aws-iot-device-shadow
date: 2023-11-08 16:30:18
cover: /img/pepe_shadow.jpg
---

# Intro - What is AWS IoT Device Shadow?

In real world, sometime it is difficult to get the actual device state in real time in such IoT scenarios.

A device shadow can overcome this challenge, Device Shadow can consider a virtual  virtual representation of a device which managed by the **IoT Things** resource created in AWS IoT Core.

> The Shadow document is a JSON or a JavaScript notation doc that is used to store and retrieve the current state information for a device. You can use the shadow to get and set the state of a device over MQTT topics or HTTP REST APIs, regardless of whether the device is connected to the internet.

# Shadow Document

```json
{
  "state": {
    "desired": {
      "color": "green"
      },
    "reported": {
      "color": "blue"
      },
    "delta": {
      "color": "green"
      }
   }
}
```

Refer to the json above, you can check there 3 **state** properties in shadow document.

- desired
  - Apps specify the desired states of device properties by updating the desired object
- reported
  - Devices report their current state in the reported object.
- delta
  - AWS IoT reports differences between the desired and the reported state in the delta object.

> You can consider the flow of Shadow a finite state machine, for AWS IoT Core, it will also check if there are delta event, that means there difference between **Desired** and **Reported** states

So how can we update the state of a shadow?  The answer is clear,
> **By subscribing/publishing messages to the certain MQTT topics**

# Shadow Topic 

|ShadowTopicPrefix value|Shadow type|
|-----------------------|----------|
|$aws/things/`thingName`/shadow|Unnamed (classic) shadow|
|$aws/things/`thingName`/shadow/name/shadowName|Named shadow|

|Topic|Client operations allowed|
|-----|--------------------------|
|`ShadowTopicPrefix`/delete|Publish/Subscribe|
|`ShadowTopicPrefix`/delete/accepted|Subscribe|
|`ShadowTopicPrefix`/delete/rejected|Subscribe|
|`ShadowTopicPrefix`/get|Publish/Subscribe|
|`ShadowTopicPrefix`/get/accepted|Publish/Subscribe|
|`ShadowTopicPrefix`/get/rejected|Subscribe|
|`ShadowTopicPrefix`/update|Publish/Subscribe|
|`ShadowTopicPrefix`/update/accepted|Subscribe|
|`ShadowTopicPrefix`/update/rejected|Subscribe|
|`ShadowTopicPrefix`/update/delta|Subscribe|
|`ShadowTopicPrefix`/update/documents|Subscribe|

> For detail explanation about these shadow topics, see the documentation - https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/device-shadow-mqtt.html


# The state changes of Device Shadow

![Imgur](https://i.imgur.com/l071JEc.png)

Take this picture for example, the update flow is:


1. The MQTT client publishes a `$aws/things/myLightBulb/shadow/update` message to the server. The message carries the desired state `{"state": {"desired":{"color":"green"}}}`
2. IoT Server responds with `$aws/things/myLightBulb/shadow/accepted`, indicating that the update message has been received. At the same time, it publishes `$aws/things/myLightBulb/shadow/delta` to notify the device to update, and then publishes `$aws/things/myLightBulb/shadow/update/document` as update record
3. After receiving the message, the Device performs the corresponding update operation and publishes a message `$aws/things/myLightBulb/shadow/update` `{"state"{"report":{"color":"green"}}}` to the IoT Server after completion. Notification updated
4. After receiving the post-update message, IoT Server responds with `$aws/things/myLightBulb/shadow/accepted` to indicate that the update message has been received. Publish another `$aws/things/myLightBulb/shadow/update/document` as an update record





# Expermient for IoT Shadow

## Device Setup

Since I don't have any IoT Device currently available, I simulate the device by launching a EC2 instance.

- AMI: `Ubuntu 22 LTS`
- Type: `t2.Micro`
- Subnet: `10.1.0.0/24`


Then connect to the EC2 instance by using SSH, and run the following command

```
sudo apt update
sudo apt install -y python3-pip
mkdir certs/
```

## Setup in AWS IoT Core

There are 3 things to setup in AWS IoT Core

- Create certificate
- Create IoT Policy and associated with the certificate
- Create Things object and associate with the certificate
### Things

This is a thing named `ESP32` for testing purposes, it have associated with the certificate

![Imgur](https://i.imgur.com/96y4cVz.png)

### Certificate

And this certificate has issued by the Amazon Root CA.

![Imgur](https://i.imgur.com/Hg9Jzsv.png)

And there are IoT Policy - `TestPolicy` asccociate with this certificate.

*TestPolicy*

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": [
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topic/$aws/things/THING_NAME/shadow/get",
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topic/$aws/things/THING_NAME/shadow/update"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "iot:Receive",
      "Resource": [
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topic/$aws/things/THING_NAME/shadow/get/accepted",
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topic/$aws/things/THING_NAME/shadow/get/rejected",
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topic/$aws/things/THING_NAME/shadow/update/accepted",
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topic/$aws/things/THING_NAME/shadow/update/rejected",
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topic/$aws/things/THING_NAME/shadow/update/delta"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "iot:Subscribe",
      "Resource": [
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topicfilter/$aws/things/THING_NAME/shadow/get/accepted",
        "arn:aws:iot:rus-east-1:AWS_ACCOUNT:topicfilter/$aws/things/THING_NAME/shadow/get/rejected",
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topicfilter/$aws/things/THING_NAME/shadow/update/accepted",
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topicfilter/$aws/things/THING_NAME/shadow/update/rejected",
        "arn:aws:iot:us-east-1:AWS_ACCOUNT:topicfilter/$aws/things/THING_NAME/shadow/update/delta"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "*"
    }
  ]
}
```
Remember, this policy must have adequate permissions for `CONNECT`, `SUBSCRIBE`, `Publish` and `Publish`
to the Shadow topic.

Once you have setup these stuff, now I need to convey the certificate to the EC2 instance.

![Imgur](https://i.imgur.com/LKSyMJw.png)

```
scp -i <SSH KEY> TestDeviceShadow/*    ubuntu@ec2-<EC2 Public Address>.compute-1.amazonaws.com:/home/ubuntu/certs
```

Apart from the device certificate, it is necessary to provide the CA certificate in the device.

- Download the CA Cert in the device

```
cd certs/
curl -o ~/certs/Amazon-root-CA-1.pem \
    https://www.amazontrust.com/repository/AmazonRootCA1.pem 
```

Now there all credential we need to test the IoT Device Shadows


## Install the IoT Core Python Device SDK

```
git clone https://github.com/aws/aws-iot-device-sdk-python-v2.git
```

```
sed -i "s/__version__ = '1.0.0-dev'/__version__ = '<SDK_VERSION>'/" \
  aws-iot-device-sdk-python-v2/awsiot/__init__.py
```

```
python3 -m pip install ./aws-iot-device-sdk-python-v2
```

```
cd ~/aws-iot-device-sdk-python-v2/samples
```

## Execute the shadow.py

```
python3 shadow.py --ca_file ~/certs/Amazon-root-CA-1.pem --cert ~/certs/device.pem.crt --key ~/certs/private.pem.key --endpoint your-iot-endpoint --thing_name your-iot-thing-name
```

> You can derive the iot endpoint by checking the AWS IoT Console
> Find the **Connect** > **Connect One Device** in the left pane
> Scroll down and you will see the IoT endpoint

![Imgur](https://i.imgur.com/mDBpV7l.png)

Back to the script, after you execute the `shadow.py`, you will see the prompt in your terminal

![Imgur](https://i.imgur.com/necUKaZ.png)

You will need to enter the desired value. So I enter "yellow".

![Imgur](https://i.imgur.com/CQOkk83.png)

Then you can observe that the state changed to "yellow". This results may also observe from the AWS IoT Console

> Go to Things, and select your thing object, on the bottem of the target thing page, you can navigate to the **Device Shadow** tab, then select the **Classic Shadow**, then you can see the Device Shadow State below
 
![Imgur](https://i.imgur.com/KTfooA1.png)

![Imgur](https://i.imgur.com/Xcu4BKk.png)

For testing, I enter "green" as the input of `shadow.py`.

And the state change show in both terminal and IoT Console

![Imgur](https://i.imgur.com/AEEMMCa.png)

![Imgur](https://i.imgur.com/BWi4UZh.png)

## Test the Shadow Document

Now you can try to edit the Shadow Document directly.

For example, I change the desired state from red to green.

Then you will notice that the change will reflect to the **Delta report**.

![Imgur](https://i.imgur.com/9l40PXT.png)


## Test with AWS IoT Test MQTT Client

First, it is necessary to subscribe to the shadow topic in the MQTT client, for receiving the state change events.

![Imgur](https://i.imgur.com/Zq4x4i8.png)

The client can subscribe to the topic

```
$aws/things/ESP32/shadow/update/#
```
The wildcard symbol **"#"** indicates that it wants to subscribe all topic under the `update/` prefix.

And you can re-run the program with new color value. You can find the MQTT client will receive the state change events.

At first, the color was "red".
> The message published to $aws/things/ESP32/shadow/update/document topic

Then it changed to "green".
>  The message published to $aws/things/ESP32/shadow/update/accepted topic
> Noted that any unsuccessful messages were received on the topic $aws/things/ESP32/shadow/update/rejected 

![Imgur](https://i.imgur.com/brQ3knq.png)

## Edit the shadow document again

I change the desired stat value "blue" to "black".

![Imgur](https://i.imgur.com/DVKi6Xb.png)

The first received event will be on the delta topic, it means that there are differences between desired state and reported state.

At the same time, the message will published to the topic $aws/things/ESP32/shadow/update/accepted for notifying the device to update the state

![Imgur](https://i.imgur.com/7fewMie.png)

And also published to the shadow document topic for recording.

![Imgur](https://i.imgur.com/FYULN43.png)

```
{
  "previous": {
    "state": {
      "desired": {
        "color": "blue"
      },
      "reported": {
        "color": "blue"
      }
    },
    "metadata": {
      "desired": {
        "color": {
          "timestamp": 1699430576
        }
      },
      "reported": {
        "color": {
          "timestamp": 1699430576
        }
      }
    },
    "version": 20
  },
  "current": {
    "state": {
      "desired": {
        "color": "black"
      },
      "reported": {
        "color": "blue"
      }
    },
    "metadata": {
      "desired": {
        "color": {
          "timestamp": 1699431256
        }
      },
      "reported": {
        "color": {
          "timestamp": 1699431256
        }
      }
    },
    "version": 21
  },
  "timestamp": 1699431256
}
```

But the reported state is not "Black".

you can see the event published to the accepted topic.

![Imgur](https://i.imgur.com/pzVidVy.png)


Meanwhile, the message published to the document topic

![Imgur](https://i.imgur.com/ZKmF0vG.png)


## Conclusions

You will found the state change from **(Desired: "Blue", Reported: "Blue")** to **(Desired: "Black", Reported: "Blue")** and the final state is **(Desired: "Black", Reported: "Black")**.



## References
[+] Create a virtual device with Amazon EC2 - https://docs.aws.amazon.com/iot/latest/developerguide/creating-a-virtual-thing.html
[+] Tutorial: Provisioning your device in AWS IoT - https://docs.aws.amazon.com/iot/latest/developerguide/shadow-provision-cloud.html
[+] Tutorial: Installing the Device SDK and running the sample application for Device Shadows - https://docs.aws.amazon.com/iot/latest/developerguide/lightbulb-shadow-application.html
[+] Tutorial: Interacting with Device Shadow using the sample app and the MQTT test client - https://docs.aws.amazon.com/iot/latest/developerguide/interact-lights-device-shadows.html
[+] Reserved topics - Shadow topics - https://docs.aws.amazon.com/iot/latest/developerguide/reserved-topics.html#reserved-topics-shadow

