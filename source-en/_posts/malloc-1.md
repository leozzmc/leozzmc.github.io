---
title: "🗃️Deep Dive: How the malloc Function Allocates Memory"
description: A look into how malloc() actually allocates memory under the hood on Linux
toc: true
abbrlink: "78d9b0c6"
date: 2023-02-03 22:08:04
tags: ['Linux','OS']
categories: Deep Dive
aside: true
---

> 🌐 中文版：[繁體中文](/posts/78d9b0c6.html)

# Deep Dive: How does the malloc function allocate memory?

## Preface

Dynamic memory allocation is an important concept. It lets a program allocate and free memory dynamically as needed during execution, rather than relying on statically-allocated blocks set up in advance. This flexibility lets a program use memory resources more efficiently and handle problems of various sizes and complexities.

C's malloc function is a widely-used dynamic memory allocator. It lets programmers dynamically allocate memory blocks of a specified size at runtime. An important property of malloc is that it ensures the allocated block is valid and accessible while in use, while freeing it appropriately to avoid memory leaks.

But you might be curious how malloc implements allocation at a low level, and how it accurately allocates the freed-up memory to the caller. That's the topic we'll dig into here. We'll focus on malloc's low-level implementation, especially how the system decides on and allocates a suitable memory address for us when we call malloc.

Before exploring this, let's review the basics of dynamic memory allocation. In C, we can use malloc to allocate memory dynamically. Its prototype is:

```c
void* malloc(size_t size);
```
malloc takes a positive integer `size`, representing the size (in bytes) of the block we want to allocate. It tries to find a contiguous block large enough and marks it as allocated. If it finds a suitable block, malloc returns a pointer to the start of that block; otherwise it returns NULL to indicate failure.

Although malloc looks relatively simple, its low-level implementation is a complex task. Different operating systems and compilers may use different algorithms and strategies to perform memory allocation. So we'll dig into these internal mechanisms to understand how malloc allocates memory, and discuss the trade-offs and performance implications.

Next, we'll enter the low-level world of malloc and lift the veil behind it. We'll look at several common memory allocation algorithms, including fixed partitioning, dynamic partitioning, and paging. These algorithms will help us understand how malloc works and how to optimize memory usage performance.

![](https://i.imgur.com/8lB2IrU.png)

With this question, we can dig into the principles.

## How memory is allocated
Memory allocation in an operating system is mainly implemented by a memory allocator. In the early days, glibc's default allocator was `dlmalloc`.

But `dlmalloc` has a problem: once multiple threads call malloc, only one thread can enter the critical section. The improvement to this is `ptmalloc2`, forked from `dlmalloc`: once multiple threads call malloc, memory is allocated to each thread immediately.

Since memory allocation fundamentally happens across multiple threads, `dlmalloc` easily causes poor performance. In `ptmalloc2`, when multiple threads call malloc at the same time, memory is allocated immediately, because each thread maintains its own separate heap segment, and the freelist data structure maintaining each heap segment is also independent.

This behavior of maintaining per-thread freelist structures and heap segments is called a **per-thread arena**.

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

Compile and run:

```
gcc -c mythread -lpthread -o mythread

./mythread
```
![](https://i.imgur.com/qeTHI16.png)

We can check the process's memory allocation by PID.
Per the program output above, its PID is 74:
```
cat /proc/PID/maps
```
![](https://i.imgur.com/ScQz515.png)

You can see the heap segment is:
```
55590b2c9000-55590b2ea000 rw-p 00000000 00:00 0                          [heap]
7fd7ddf25000-7fd7ddf28000 rw-p 00000000 00:00 0
```
After calling malloc, check the memory allocation again:

![](https://i.imgur.com/yy06ND6.png)

![](https://i.imgur.com/WpwRXFs.png)

We find that after freeing, the allocated memory isn't released immediately. It's first returned to the **glibc malloc library**, and the freed block (**chunk**) is added to the main arena's bin (in glibc malloc, the freelist is called a bin). Then if the user requests a new block, malloc won't ask the kernel for new memory but instead looks for a free chunk in the bin; only if the bin has no available chunk does it ask the kernel again.

![](https://i.imgur.com/ixhdaI2.png)

![](https://i.imgur.com/43OePVQ.png)

{% note info %}
A later post will analyze further: which system call is used?
- mmap
- brk
{% endnote %}

![](https://i.imgur.com/aLNmaSG.png)

## References

https://sploitfun.wordpress.com/2015/02/11/syscalls-used-by-malloc/
https://hanfeng.ink/post/understand_glibc_malloc/
https://sploitfun.wordpress.com/2015/02/10/understanding-glibc-malloc/comment-page-1/
