---
title: Top k 個頻繁元素 | Medium | LeetCode#347. Top K Frequent Elements
tags:
  - Heap
  - Priority Queue
  - LeetCode
  - Array
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/347/cover.png
abbrlink: 483906dc
date: 2025-09-11 21:44:41
---


# 題目敘述

![](/img/LeetCode/347/question.png)

- 題目難度：`Medium`
- 題目描述： 給定一個整數陣列 `nums` 以及整數 `k` 並回傳 `nums` 中 `k` 個出現最頻繁的元素，你可以以任意順序回傳答案

本題限制
> `1 <= nums.length <= 105`
> `1 <= k <= nums.length`
 
# 解法

## 一開始的想法

看到這種前 `k` 個，`k`個最頻繁，十有八九最佳解會是用 priority queue 去解

## 我的解法

```c++
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        vector<int> numCount(20001, 0);
        //store the frequency of each number
        for(int n: nums){
            numCount[n+10000]++;
        }
        auto comparator = [](pair<int, int> &leftPair, pair<int, int>&rightPair){
            return leftPair.second < rightPair.second;
        };
        priority_queue<pair<int, int>, vector<pair<int,int>>, decltype(comparator)> freqHeap(comparator);

        //push to heap
        for(int i=0; i<numCount.size(); i++){
            if(numCount[i]>0){
                // since the first element of the pair is the number itself, we need to convert it back
                freqHeap.push({i-10000, numCount[i]});
            }
        }
        vector<int> result;
        while(!freqHeap.empty() && k>0){
            result.push_back(freqHeap.top().first);
            freqHeap.pop();
            k--;
        }
        return result;
    }
};
```

### 思路解析

這題的 `nums` 範圍限制在 `-10000` 到 `10000`，所以整體數字數量並不大，最多 20001 種可能。
基於這個前提，我的解法流程如下：

1. 統計出現頻率
建立一個大小為 `20001` 的陣列 `numCount`，利用 index 代表數字本身。因為數字可能為負數，所以我把數字 n mapping成 n+10000，保證 index 為正整數

2. 丟入max heap
每個數字與它的出現次數組合成一個 `pair<int,int>`，放進 priority queue。 C++ STL 的 `priority_queue` 預設是 max heap，但它針對 pair 型別的預設排序並不是 **依照第二個元素**。 所以我自訂了一個比較器 `comparator`，讓它專門比較 `pair.second`，也就是「出現次數」。

> `decltype(comparator)` 的作用是自動推導 lambda 的型別，這樣才能把它當成參數傳給 priority_queue

3. 取出前 k 個元素
從max heap中 pop 出來的元素，會依照出現頻率由大到小排列。 我們只要取出前 k 個就能得到答案。

> 這邊的lambda寫法可以參考這篇：https://notes.boshkuo.com/docs/C++/STL/priority_queue


### 執行結果

![](/img/LeetCode/347/result.png)


# 複雜度

時間複雜度: $O(mlogm)$，m 最壞狀況會是 20001，取出前 k 個會是 $(klogm)$，建立頻率表會是 $O(n)$ 所以嚴格來說應該會是 $O(n + mlogm)$

空間複雜度: $O(m)$, m 為priority queue 最多塞m個元素

---