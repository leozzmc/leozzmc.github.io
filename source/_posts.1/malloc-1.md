---
title: "🗃️Deep Dive: malloc 函式如何進行記憶體分配"
description: 想要研究看看 malloc() 在Linux 系統當中背後是怎麼樣進行記憶體的分配
toc: true
abbrlink: 78d9b0c6
date: 2023-02-03 22:08:04
tags: ['Linux','OS']
categories: Deep Dive
aside: true
---
# Deep Dive: malloc 函式如何進行記憶體分配?

## 前言

動態記憶體配置是一個重要的概念。它讓程式可以在執行期間根據需要動態地分配和釋放記憶體，而不必依賴於事先靜態分配的記憶體區塊。這樣的彈性使程式能夠更有效地利用記憶體資源，並處理各種大小和複雜性的問題。

C語言中的malloc函式是一個廣泛使用的動態記憶體分配函式。它允許程式設計師在執行期間動態地分配指定大小的記憶體區塊。malloc的一個重要特性是它能夠確保分配的記憶體區塊在使用期間是有效和可存取的，同時適當地釋放它們以避免記憶體洩漏。

然而，你或許好奇malloc函式在底層是如何實現記憶體分配的，要如何準確動態分配空出的記憶體給caller?。這就是我們將在本文中深入探討的主題。我們將著重於malloc函式的底層實現，特別是當我們呼叫malloc時，系統如何決定和分配一塊合適的記憶體位址給我們使用。

在探討這個問題之前，讓我們先回顧一下動態記憶體配置的基本概念。在C語言中，我們可以使用malloc函式來動態地分配記憶體。它的函式原型如下：

```c
void* malloc(size_t size);
```
malloc函式接受一個正整數參數size，代表我們希望分配的記憶體區塊大小（以位元組為單位）。它會嘗試找到一塊足夠大的連續記憶體區塊，並將其標記為已分配。如果成功找到一塊合適的記憶體區塊，malloc函式將返回指向該區塊開頭的指標；否則，它將返回NULL表示分配失敗。

雖然malloc函式看起來相對簡單，但其底層的實現是一個複雜的任務。不同的作業系統和編譯器可能使用不同的演算法和策略來執行記憶體分配。因此，我們將深入研究這些內部機制，以了解malloc函式是如何進行記憶體分配的，並探討其優缺點及效能影響。

接下來，我們將進入malloc函式的底層世界，一同揭開它背後的神秘面紗。我們將探討幾種常見的記憶體分配演算法，包括固定分割、動態分割以及頁面分割等等。這些演算法將幫助我們更好地理解malloc函式的工作方式，並瞭解如何優化記憶體使用效能。

![](https://i.imgur.com/8lB2IrU.png)

隨著這個問題我們可以深入挖掘它的原理

## 如何進行記憶體分配
作業系統中的記憶體分配功能主要是靠記憶體分配器(Memory Allocator) 來實現，在早期glibc預設的記憶體分配器是 `dlmalloc`

但`dlmalloc` 有個問題，一旦有多個Thread呼叫Malloc，只能有一個Thread可以進入Critical Section。而改進這個問題的就是從`dlmalloc`中fork出來的`ptmalloc2`，一旦多個Thread呼叫malloc，則會立即分配記憶體給個別Thread。

由於記憶體分配的任務基本上是會存在於多個Thread之間，因此`dlmalloc`很容易造成效能低落。在`ptmalloc2`中，多個Thread同時呼叫malloc時，記憶體會被立刻分配，因為每個Thread會維護單獨的堆疊區段，而維護每個堆疊區段的freelist 資料結構也同樣是個別獨立的。

這種維護個別freelist結構以及heap區段的行為叫做 **per thread areana**

```cpp
/* Per thread arena example. */
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <sys/types.h>

void* threadFunc(void* arg) {
        printf("Before malloc in thread 1\n");
        getchar();
        char* addr = (char*) malloc(1000);
        printf("After malloc and before free in thread 1\n");
        getchar();
        free(addr);
        printf("After free in thread 1\n");
        getchar();
}

int main() {
        pthread_t t1;
        void* s;
        int ret;
        char* addr;

        printf("Welcome to per thread arena example::%d\n",getpid());
        printf("Before malloc in main thread\n");
        getchar();
        addr = (char*) malloc(1000);
        printf("After malloc and before free in main thread\n");
        getchar();
        free(addr);
        printf("After free in main thread\n");
        getchar();
        ret = pthread_create(&t1, NULL, threadFunc, NULL);
        if(ret)
        {
                printf("Thread creation error\n");
                return -1;
        }
        ret = pthread_join(t1, &s);
        if(ret)
        {
                printf("Thread join error\n");
                return -1;
        }
        return 0;
}
```

編譯並執行程式

```
gcc -c mythread -lpthread -o mythread

./mythread
```
![](https://i.imgur.com/qeTHI16.png)



可以根據PID來查看行程的記憶體分配狀況
根據上面程式輸出提示其PID為74
```
cat /proc/PID/maps
```
![](https://i.imgur.com/ScQz515.png)

可以觀察到Heap區段是
```
55590b2c9000-55590b2ea000 rw-p 00000000 00:00 0                          [heap]
7fd7ddf25000-7fd7ddf28000 rw-p 00000000 00:00 0
```
當呼叫malloc後，再次查看記憶體分配的情況

![](https://i.imgur.com/yy06ND6.png)

![](https://i.imgur.com/WpwRXFs.png)

我們可以發現free完後，所分配到的記憶體並不會馬上釋放，其實會先將記憶體區域釋放給**glibc malloc library**，這邊釋放的記憶體區塊(**Chunk**)會加入到main arenas bin (在glibc malloc中，freelist被稱為bin)，接著如果使用者請求分配新的記憶體區快，malloc就不會去kernel請求新的記憶體區快，而是去bin中找空的區塊(Free chunk)，若bin中沒有可用區塊才會再去跟kernel請求。

![](https://i.imgur.com/ixhdaI2.png)

![](https://i.imgur.com/43OePVQ.png)

{% note info %}
至於後續的文章會進一步去分析: 使用哪種System Call?
- mmap
- brk
{% endnote %}

![](https://i.imgur.com/aLNmaSG.png)



## 參考資源

https://sploitfun.wordpress.com/2015/02/11/syscalls-used-by-malloc/
https://hanfeng.ink/post/understand_glibc_malloc/
https://sploitfun.wordpress.com/2015/02/10/understanding-glibc-malloc/comment-page-1/




