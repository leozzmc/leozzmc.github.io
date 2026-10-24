---
title: 【Study Notes】OTA Update -1
toc: true
tags:
  - AWS
  - IoT
  - OTA
  - Firmware
aside: true
categories: Study Notes
abbrlink: "613d9ed0"
date: 2023-12-13 12:32:05
cover: /img/OTA/OIG.jpeg
---

> 🌐 中文版：[繁體中文](/posts/613d9ed0.html)

## What is an OTA Update (Over-The-Air Update)?

Updating a device's software/firmware over wireless communication.

## The OTA flow

- Notify
    - The device is notified of a pending OTA update
    - The device can choose to ignore the update or accept it to trigger the download
- Download
    - The device downloads the update via various supported protocols
    - The update package downloads to a pre-configured storage area
        - E.g. an S3 bucket
    - The update may be a brand-new firmware image or a patch to existing firmware
- Verify
    - Verify the validity of the update package
- Install
    - The device starts updating via the update package (usually through a bootloader) to the latest firmware
    - After installation, checks can run to verify functionality
    - The device reports the successful firmware update to the OTA update provider

These are the four main steps.

## Modular OTA update

- A modular OTA consists of several small libraries and an orchestrator.
- Each library handles a specific sub-task, such as notifying of a pending OTA update or downloading a file via MQTT
- The orchestrator synchronizes all the small libraries with the bootloader and memory pool to perform the OTA update.

The modular OTA approach lets you swap or change different parts of the OTA as requirements change. For example:

1. If you want to trigger OTA from AWS IoT, you can use the IoT Job library to check for new OTA updates or send notifications about OTA job status. Alternatively, you can replace it with any other library.
2. You can use the **OTA Job Parser** in the IoT Job library to parse the received OTA Job Document. Alternatively, you can use your own custom Job Document Parser based on the OTA Job Document.

## Modular OTA update flow

Below is the modular OTA update flow from the FreeRTOS official site.

![image](https://hackmd.io/_uploads/Sk_CRjSB6.png)

## Orchestrator

- The orchestrator is the core component that specifies how to coordinate an OTA update
- The orchestrator is provided by the user and contains as many custom components as needed to accomplish the desired OTA update method
- A typical update includes the "Notify," "Download," "Verify," and "Install" phases.
- The orchestrator provides these phases by stitching together component libraries and other external libraries
- A description of each component library can be found below

## IoT Job Libraries

- The IoT Job Handler is the first component used in the entire OTA flow
- This library provides the ability to start pending IoT jobs and update job status
- When the job handler learns of a new OTA update (via an IoT Job), the handler starts the job and passes the job and its metadata into the parser chain
- If a parser is configured to handle the job, it forwards the information that the job started successfully back to the Job Handler
- This successful-start notification is forwarded back to the OTA update provider (i.e. IoT Jobs) to mark the update as started. If no parser can understand the job, the failure to start the OTA update is forwarded to the provider

## OTA Job Parser

The parser validates whether the IoT job is an OTA update and parses the fields into a usable format before calling the downloader.

## MQTT file streaming library

- The file downloader provides the ability to download OTA files. The file downloader handles downloading the update via a CBOR- or JSON-format MQTT stream
- The download itself is performed in chunks, more easily thought of as blocks of the whole OTA update file. This is done to improve download reliability and to allow larger firmware updates than might be possible in a single download "block."

## Bootloader and Signature Verifier

- The bootloader exists to verify new firmware and install it onto the device
- Modular OTA deliberately avoids implementing a bootloader, since multiple industry-wide bootloaders already exist for a large number of supported microcontrollers
- Modular OTA leaves the choice of bootloader and signature-verification mechanism to the user.

## Difference between AWS IoT Jobs and AWS IoT OTA Update

- AWS IoT Jobs
    - Defines a set of remote operations that can be sent to and run on one or more devices
    - Most commonly, jobs are used to perform software or firmware updates, but can also be used for any arbitrary operation, such as reboot, credential rotation, etc.
- AWS IoT OTA Update
    - A feature built on AWS IoT Jobs, specifically implementing software/firmware update operations, and only that operation
    - An OTA update is a job, **but with a predefined Job Document**. It bundles common software-update functionality (like code signing) to build a software-update solution faster

Comparison table

||AWS IoT Jobs|AWS IoT OTA Updates|
|--|---------|---------------|
|Purpose|Any custom behavior| FreeRTOS OTA update|
|Job Document|Customizable|Predefined|
|Create API|CreateJob|CreateOTAUpdate|
|Code signing|User must implement|Integrated|
|HTTP/MQTT|User chooses|Integrated|
|AWS IoT Device SDK support|C, C++, Python, Java, Javascript |C only |
|Platform Abstraction Layer (PAL)|None|Yes [3]|
|Max file limit| HTTP: **5GB (Amazon S3 limit)**, MQTT: **24MB (MQTT file stream limit)**| 16MB (OTA update limit)[4]|

## AWS IoT Over-The-Air (OTA) Library
> https://github.com/aws/ota-for-aws-iot-embedded-sdk

This AWS library includes both FreeRTOS and the AWS IoT Device SDK for Embedded-C.

This library also includes the **OTA Platform Abstraction Layer (PAL)** [3] to simplify the difficulty of porting the library to specific hardware [5].

There's also an OTA Operating System (OS) Functional Interface to simplify porting to RTOSes other than FreeRTOS, or even bare metal.

> Since AWS IoT OTA is for resource-constrained devices, the native Device SDK doesn't integrate FreeRTOS. For the same reason, the OTA file size is limited to 16MB.

## References
[1] https://www.freertos.org/freertos-core/over-the-air-updates/index.html
[2] https://repost.aws/articles/ARDHNhV0bnRGau0kmdhTSZZA/comparing-aws-iot-jobs-and-aws-iot-over-the-air-ota-updates
[3] https://www.freertos.org/Documentation/api-ref/ota-for-aws-iot-embedded-sdk/docs/doxygen/output/html/ota_pal_interface.html
[4] https://docs.aws.amazon.com/general/latest/gr/amazon-freertos.html#limits-ota-manager
[5] Porting Guide - https://www.freertos.org/Documentation/api-ref/ota-for-aws-iot-embedded-sdk/docs/doxygen/output/html/ota_porting.html
