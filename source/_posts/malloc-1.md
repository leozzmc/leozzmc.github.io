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

![](https://i.imgur.com/8lB2IrU.png)

Q: 一旦malloc被呼叫後，系統是如何做到記憶體分配的？而且是如何準確動態分配空出的記憶體給caller?

隨著這個問題我們可以深入挖掘它的原理

## 如何進行記憶體分配
作業系統中的記憶體分配功能主要是靠記憶體分配器（Memory Alligator) 來實現，在早期glibc預設的記憶體分配器是 `dlmalloc`

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




