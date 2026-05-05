---
title: 'Executing Remote Operations with AWS IoT Jobs: A Hands-On Tutorial'
toc: true
tags:
  - AWS
  - IoT
  - SDK
aside: true
categories: Hands-On Practices
abbrlink: aws_iot_jobs
date: 2024-01-20 15:04:16
cover: /img/aws_iot_job.png
---

# What is a Job?

> A Job is a **remote operation** that is sent to and executed on one or more devices connected to AWS IoT. For example, you can define a Job that instructs a set of devices to download and install application or firmware updates, reboot, rotate certificates, or perform remote troubleshooting operations.


# How to create a Job?

You must create a job document first.
> The Job Document is a description of the remote operations to be performed a Job

## Target

> When you create a Job, you specify a list of targets that are the devices that **should perform the operations**. The targets can be things or thing groups or both. The Jobs feature sends a message to each target to inform it that a Job is available.


## Job Execution

> A Job execution is an instance of a Job on a target device. The target starts an execution of a Job by downloading the Job document. It then performs the operations specified in the document, and reports its progress to AWS IoT. 

# Prepare to run a remote operation using Jobs

1. Setup download location (Device Client)

```
mkdir -p /home/ubuntu/workshop_dc/downloadLocation
```
Check if the process successful
```
sudo tail -F /var/log/aws-iot-device-client/aws-iot-device-client.log

```

# AWS IoT Job using embedded-c SDK

## Launch an EC2.

* AMI: ubuntu
* t2.micro

Networking:

* VPC CIDR: 10.1.0.0/16
* Public Subnet: 10.1.0.0/24 

Connect to the instance and install the necessary packages



## Installation

```
sudo apt-get install vim git curl
git clone https://github.com/aws/aws-iot-device-sdk-embedded-c.git --recurse-submodules
cd aws-iot-device-sdk-embedded-c
mkdir -r build/bin/
sudo apt-get install libssl-dev
```

## Create Things
- Create Thing
- Enter Thing Name, press "Next"
- Select **Auto-generate a new certificate**
![image](https://hackmd.io/_uploads/r1wpLeNu6.png)

Policy

> Make sure that the certificate you create have bind to policy with enough permisssion
**iot: Connect**
**iot: Receive**
**iot: Publish**
**iot: Subscribe**



![image](https://hackmd.io/_uploads/BJkGPx4_p.png)


## Download Certificate
![image](https://hackmd.io/_uploads/SkZjLlV_T.png)

Upload certificate to EC2
```
scp -i <local ssh private key> <cert_name>pem.crt  admin@ec2-XX-XXX-XXX-XXX.compute-1.amazonaws.com:/home/admin/aws-iot-device-sdk-embedded-c/build/bin/certificates/
```

Upload private key
```
scp -i TestKeyAccess.pem debace3e049b44eb15d67fad8ab17763cc575604f4d4a1451cc62cd4ef1498ed-private.pem.key ubuntu@ec2-54-167-159-68.compute-1.amazonaws.com:/home/ubuntu/aw
s-iot-device-sdk-embedded-c/build/bin/certificates
```

Upload certificates
```
scp -i TestKeyAccess.pem debace3e049b44eb15d67fad8ab17763cc575604f4d4a1451cc62cd4ef1498ed-certificate.pem.crt ubuntu@ec2-54-167-159-68.compute-1.amazonaws.com:/home/ubuntu/aws-iot-device-sdk-embedded-c/build/bin/certificates
```

Upload AmazonRootCA1.pem

```
scp -i TestKeyAccess.pem AmazonRootCA1.pem ubuntu@ec2-54-167-159-68.compute-1.amazonaws.com:/home/ubuntu/aws-iot-device-sdk-embedded-c/build/bin/certificates
```
![image](https://hackmd.io/_uploads/ByhTugNdT.png)


## AWS IoT Jobs Demo
> Ref: https://aws.github.io/aws-iot-device-sdk-embedded-C/202012.00/docs/doxygen/output/html/jobs_demo.html


```
sudo apt install curl libmosquitto-dev mosquitto
```

## Create Job

```
aws iot create-job --job-id t12 --targets <YOUR_THING_ARN> \
  --document '{"url":"https://cdn.kernel.org/pub/linux/kernel/v5.x/linux-5.8.5.tar.xz"}'
```

![image](https://hackmd.io/_uploads/B10N5g4da.png)

## Execute Job on the target device run the demo program with device credentials

```
jobs_demo_mosquitto -n device1 -h abcdefg123.iot.us-east-1.amazonaws.com \
  --certfile bbaf123456-certificate.pem.crt --keyfile bbaf123456-private.pem.key
```

## Build the demo program

```
cd /aws-iot-device-sdk-embedded-c/demos/jobs/jobs_demo_mosquitto
make
```
![image](https://hackmd.io/_uploads/HkuCie4uT.png)

```
./jobs_demo_mosquitto
```
![image](https://hackmd.io/_uploads/SyW-nl4_T.png)

```
./jobs_demo_mosquitto -n <Thing Name> -h <YOUR_IOT_ENDPOINT> \
  --certfile bbaf123456-certificate.pem.crt --keyfile bbaf123456-private.pem.key
```

Endpoint: a2t2vimlyuhccy-ats.iot.us-east-1.amazonaws.com

```
./jobs_demo_mosquitto -n 
ThingforExecuteJobs -h a2t2vimlyuhccy-ats.iot.us-east-1.amazonaws.com --certfile ~/aws-iot-device-sdk-embedded-c/build/bin/certificates/debace3e049b44eb15d67fad8ab17763cc575604f4d4a1451cc62cd4ef1498ed-certificate.pem.crt --keyfile ~/aws-iot-device-sdk-embedded-c/build/bin/certificates/debace3e049b44eb15d67fad8ab17763cc575604f4d4a1451cc62cd4ef1498ed-private.pem.key

```

![image](https://hackmd.io/_uploads/BkeheZNda.png)

Check AWSIoTLogv2

![image](https://hackmd.io/_uploads/HJR34ZEdp.png)


![image](https://hackmd.io/_uploads/SkKsEb4dp.png)

![image](https://hackmd.io/_uploads/ryV9N-4ua.png)

# The Download files by Job can be found in the `tmp`

![image](https://hackmd.io/_uploads/S17mOZEd6.png)


## Reference

[+] AWS Workshop- https://catalog.workshops.aws/getstartedwithawsiot/en-US/chapter5-jobs/10-dc-setup