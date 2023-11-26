---
title: Fleet Provisioning - Provisioning Devices to AWS IoT in Advance
tags:
  - AWS
  - IoT Core
  - Device Provisioning
  - Certificate
  - Policy
aside: true
categories: Hands-On Practices
abbrlink: 889a40ef
date: 2023-11-09 15:14:35
cover: /img/OIG.jpeg
---

# Introduction


## What is Fleet Provisioning?

Fleet Provisioning can be divided into **Provisioning by Claim** and **Provisioning by Trusted User**.

### Provisioning by Claim

Devices can use embedded provisioning claim certificates (special-purpose certificates) and private keys for manufacturing. If these certificates are registered with AWS IoT, the service can exchange them for a unique device certificate that the device can use for general operations.


### Provisioning by Trusted User

In many cases, when trusted users such as end-users or installation technicians set up devices at their deployment locations using a mobile application for the first time, the devices connect to AWS IoT.

> **This article mainly focuses on the Provisioning by Claim method for fleet provisioning**.


## Provisioning by Claim Process

![Imgur](https://i.imgur.com/5UPLkKJ.png)

## Configuration - AWS IoT Core

### Create Certificates and Public/Private Key Pairs

Generate certificates for provisioning

- You can do this on the AWS IoT Console under **Secure** >> **Certificates** >> **Add Certificates** >> **Create Certificates**

![Imgur](https://i.imgur.com/ay2zm5V.png)
![Imgur](https://i.imgur.com/Qnr2Olh.png)

- Next, a corresponding screen will appear, and you need to download the certificate and private key to your local machine. Additionally, for convenience, please download the Root CA certificate to your local machine.

![Imgur](https://i.imgur.com/kRUAGF9.png)

### Create Provisioning Template and Attach Policy

- Create Provisioning Template

![Imgur](https://i.imgur.com/cG83JRG.png)

- Choose **Provisioning devices with claim certificates**, and then click **Next**
  
![Imgur](https://i.imgur.com/7baFaol.png)

- Create an IoT service role by clicking **Create Role**
- After entering the Role Name, click **View**

![Imgur](https://i.imgur.com/6bZNMWr.png)

- Attach policy
- Search and attach the AWS managed policy `AWSIoTThingsRegistration`

![Imgur](https://i.imgur.com/MwkIdA0.png)
![Imgur](https://i.imgur.com/YW2Nfdh.png)

- Claim certificate policy, click **Create IoT Policy**

![Imgur](https://i.imgur.com/21XORly.png)

-  Enter the Policy Name and paste the sample JSON

![Imgur](https://i.imgur.com/mNKS8IC.png)

Sample IoT Policy

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

- Check the certificate
![Imgur](https://i.imgur.com/5y8PAPu.png)

Once completed, you can proceed to set up provisioning in advance.

### Configure Pre-provisioning

The template example for fleet provisioning can be found at:
> https://docs.aws.amazon.com/iot/latest/developerguide/provision-template.html#fleet-provisioning-example

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

The pre-provisioning hook is a Lambda function that validates the parameters passed from the device before provisioning. This Lambda function must exist in your account to provision devices.

This part is set up to perform actions before configuring devices. For example, check devices against a known device database to prevent unauthorized devices from connecting to your account.

![Imgur](https://i.imgur.com/pL1yTCM.png)

- Choose **Create a Lambda function**

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

When registering a device with AWS IoT, this object is sent to the Lambda function by AWS IoT.

The `parameters` object passed to the Lambda function contains attributes from the parameters argument passed in the **RegisterThing** request payload.


## Configuration - Device Side

The downloaded Claim certificate and private key need to be moved to the device.

You can use commands like `scp` to copy files from your local machine to your device via SSH.

Additionally, you will need to install the desired **IoT Device SDK** on the device.

> AWS IoT Device SDKs, Mobile SDKs, and AWS IoT Device Client -  - https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/iot-sdks.html

Currently, Device SDK supports writing code in C++, javascript, Java, Python, Embedded-C languages, depending on your requirements and scenarios.

### Using AWS IoT Device SDK

> https://github.com/aws/aws-iot-device-sdk-python-v2


This article mainly uses the **Python IoT Device SDKv2**.

To install the SDK on the device, first ensure that the device has `git`, `Python3`, and `Python3-pip` packages.

```
git clone https://github.com/aws/aws-iot-device-sdk-python-v2.git
```

Initialize the package

```
#  (Optional) Setup the version number of your local build. The default version 
#    for awsiotsdk is set to "1.0.0-dev", you can set the version number of the
#    local build in "aws-iot-device-sdk-python-v2/awsiot/__init__.py"
sed -i "s/__version__ = '1.0.0-dev'/__version__ = '<SDK_VERSION>'/" \
  aws-iot-device-sdk-python-v2/awsiot/__init__.py

#  Install using Pip (use 'python' instead of 'python3' on Windows)
python3 -m pip install ./aws-iot-device-sdk-python-v2

```

In `aws-iot-device-sdk-python-v2/samples/fleetprovisioning.py` , you can set up the Provisioning Template.

Afterwards, you need to specify on your device:

AWS IoT Endpoint
Claim Certificate
Private Key
to connect to AWS IoT Core.
You can find the script's operating steps here:
> https://github.com/aws/aws-iot-device-sdk-python-v2/blob/main/samples/fleetprovisioning.md

```
python3 fleetprovisioning.py --endpoint <endpoint> --cert <file> --key <file> --template_name <name> --template_parameters '{\"SerialNumber\":\"1\",\"DeviceLocation\":\"Seattle\"}' --csr <path to csr file>
```

## Reference Documents
[+] https://github.com/aws-samples/aws-iot-fleet-provisioning
[+] https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/iot-provision.html
[+] https://docs.aws.amazon.com/zh_tw/iot/latest/developerguide/provision-wo-cert.html#claim-based
[+] https://aws.amazon.com/tw/blogs/iot/how-to-automate-onboarding-of-iot-devices-to-aws-iot-core-at-scale-with-fleet-provisioning/

