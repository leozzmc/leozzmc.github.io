---
title: FreeRTOS_Note
toc: true
tags:
  - FreeRTOS
  - AWS
aside: true
categories: Study Notes
abbrlink: 8d39dbf8
date: 2023-12-02 15:50:49
description:
cover:
---

# AWS FreeRTOS
> FreeRTOS includes libraries for connectivity, security, and over-the-air (OTA) updates. FreeRTOS also includes demo applications that show FreeRTOS features on qualified boards.

> FreeRTOS is an open-source project. You can download the source code, contribute changes or enhancements, or report issues on the GitHub site at https://github.com/FreeRTOS/FreeRTOS.


# FreeRTOS - Architecture
FreeRTOS contains two types of repositories
- **single library repositories**
    - Each single library repository contains the source code for one library without any build projects or examples. 
- **package repositories**
    - Package repositories contain multiple libraries, and can contain **preconfigured projects** that demonstrate the library’s use. 


![image](https://hackmd.io/_uploads/BkBxj9lEp.png)


![image](https://hackmd.io/_uploads/HyRa3clN6.png)

# FreeRTOS Kernel concepts

The FreeRTOS kernel is a real-time operating system that supports numerous architectures.

Basic components including:

- A multitasking scheduler.
- Multiple memory allocation options (including the ability to create completely statically-allocated systems). 
- Intertask coordination primitives, including task notifications, message queues, multiple types of semaphore, and stream and message buffers.
- upport for symmetric multiprocessing (SMP) on multi-core microcontrollers.


## No `malloc()` but `pvPortMalloc`

When RTOS objects are created dynamically, using the standard C library `malloc()` and `free()` functions is not always appropriate for a number of reasons:

- They might not be available on embedded systems.
- They take up valuable code space.
- They are not typically thread-safe.
- They are not deterministic.
- For these reasons, FreeRTOS keeps the memory allocation API in its portable layer.

## Reference
[1] What is FreeRTOS? - https://docs.aws.amazon.com/freertos/latest/userguide/what-is-freertos.html
[2] What is FreeRTOS? - FreeRTOS architecture - https://docs.aws.amazon.com/freertos/latest/userguide/what-is-freertos.html#freertos-architecture
[3] FreeRTOS kernel fundamentals - https://docs.aws.amazon.com/freertos/latest/userguide/dev-guide-freertos-kernel.html
[4] Architecute Image Ref - https://blog.naver.com/kim1417/221540814246


