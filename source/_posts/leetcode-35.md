---
title: 尋找插入位置 | Easy | LeetCode#35 Search Insert Position
toc: true
tags:
  - Binary Search
  - LeetCode
  - Easy
  - C
categories: LeetCode筆記
aside: true
abbrlink: search_insert_position
date: 2024-06-17 14:34:06
cover: /img/LeetCode/35/cover.jpg
---

# 題目敘述

![](/img/LeetCode/35/question.png)

- 題目難度: `Easy`
- 題目敘述: 給定已排序的整數陣列，以及一個目標值，若再陣列中找到目標值就返回 index，如果沒有就返回適合插入的位址。另外題目也要求實作演算法的複雜度要是 $O(log n)$。


# 解法


## 一開始的想法

- 針對已排序的陣列，尋找目標值的方法使用 **Binary Search** 可以滿足需求

## 我的解法

```c
int searchInsert(int* nums, int numsSize, int target) {
    int right, left, mid;
    right = numsSize-1;  
    left = 0;
    while(left < right){
        mid = left + (right - left)/2;
        if (target < nums[mid]){     
            right = mid; 
        }
        else if (target > nums[mid]){
            left = mid+1;
        } 
        else {
            return mid;
        }
    }
    if (left == right){  
        if (target < nums[left]){              
            mid= left;
        } 
        else if (target > nums[left]){  
            mid = left+1;    
        } 
        else {
            mid = left;
            return mid;
        }
    }
    return mid;
}
```

### 說明

- 這裡就是經典的 Binary Search 寫法，設定左右界，計算中間值，當 `left < right` 的時候就改變搜尋範圍
- 如果目標值 < 中間值，就尋找中間值左側的區塊，因此將 `right=mid`
- 如果目標值 > 中間值，就尋找中間值右側的區塊，因此將 `left=mid+1`
- 如果過程中如果目標值 = 中間值，就返回中間值
- 這裡與平常使用 Binary Search 不同的是，這裡將 `left = right` 單獨出來處理，因為題目要求如果沒有找到 target 值，需要返回適合插入的 index。
- 當沒找到 target 值時，若 target值 < 目前的 `left` 或 `right`，則適合插入值會是 `left` 或 `right`
- 當沒找到 target 值時，若 target值 > 目前的 `left` 或 `right`，則適合插入值會是 `left+1` 或 `right+1`
- 當沒找到 target 值時，若 target值 = 目前的 `left` 或 `right`，則適合插入值會是 `left` 或 `right`
- 接著就回傳index 值

### 完整測試程式碼

```c
#include <stdio.h>
#include <stdlib.h>


int searchInsert(int* nums, int numsSize, int target);


int main(){
    int nums[2]= {1,3};
    int target = 3;
    printf("Middle:%d\n", searchInsert(nums, 2, target));
    return 0;
}

int searchInsert(int* nums, int numsSize, int target){
    int right, left, mid;
    right = numsSize-1;
    left = 0;
    while(left < right){   
        mid = left + (right - left)/2;
        if (target < nums[mid]){     
            right = mid; 
        }
        else if (target > nums[mid]){ 
            left = mid+1; 
        } 
        else {
            return mid;
        }
    }
    if (left == right){ 
        if (target < nums[left]){                
            mid= left;
        } 
        else if (target > nums[left]){  
            mid= left+1;    
        } 
        else {
            mid = left;
            return mid;
        }
    }
    return mid;
}
```

### 執行結果

![](/img/LeetCode/35/results.png)

## 修正程式碼

```c
int searchInsert(int* nums, int numsSize, int target) {
    int right, left, mid;
    right = numsSize-1;  
    left = 0;
    while(left <= right){
        mid = left + (right - left)/2;
        if (target < nums[mid]){     
            right = mid-1; 
        }
        else if (target > nums[mid]){
            left = mid+1;
        } 
        else {
            return mid;
        }
    }
    return left;
```

> `left = right` 其實也不用單獨出來處理，只要當 `target < nums[mid]` 時再取 right 的時候取小一些，並且在 `left > right` 也就是找不到值的時候，回傳 `left` 則會是最適合插入的位置

### 執行結果

![](/img/LeetCode/35/results2.png)

> 好像執行時間沒比較快，哈

## 複雜度分析

### 時間複雜度

這段程式碼的主要結構是一個 while 迴圈，迴圈內部實現了二元搜索。它的特點是每次迴圈都將搜索範圍縮小一半，因此其時間複雜度是 $O(log n)$，其中 `n` 是陣列的大小 `numsSize`。

初始化操作是 $O(1)$。
while 迴圈中的每一次迭代，**搜索範圍減少一半。這意味著迴圈最多運行 $log(n)$ 次**
在每次迭代中，所有操作（如計算 mid、比較、賦值等）都是 $O(1)$
因此，整體時間複雜度為 $O(log n)$

### 空間複雜度

這段程式碼使用了一些額外的變量來儲存索引和中間結果，但這些變量的數量與輸入陣列的大小無關，都是常數數量的額外空間。

變數 `right`、`left`、`mid` 和 `target` 都是固定數量的整數變量。
程式碼中沒有使用任何額外的數組或動態分配的空間。
因此，整體空間複雜度為 $O(1)$