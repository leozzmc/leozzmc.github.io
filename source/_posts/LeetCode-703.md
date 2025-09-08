---
title: 字流中第K大的元素 | Easy | LeetCode#703. Kth Largest Element in a Stream
tags:
  - Array
  - Heap
  - Priority Queue
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/703/cover.png
abbrlink: e936e1ac
date: 2025-09-08 20:09:20
---


# 題目敘述

![](/img/LeetCode/703/question.png)

- 題目難度：`Easy`
- 題目描述： 你是某大學入學審核辦公室的人，你需要動態即時追縱所有申請裡面前 Kth 個高分的成績， 請設計一個 class，在具有參數整數 `k`，並在插入新成績後回傳第 `k` 高分的成績。 請實作 `KthLargest` class:
    -  `KthLargest(int k, int[] nums)` 負責初始化整數 `k` 物件以及用來存放考試成績的陣列 `nums`
    -  `int add(int val)` 負責添加新成績 `val` 到stream 並且需要再添加成績後回傳到目前為止第`k`個高分的成績  

# 解法

## 我的解法

```c++
class KthLargest {
    public:
        int k;
        priority_queue<int, vector<int>, greater<int>> minHeap;
        KthLargest(int k, vector<int>& nums) {
            this->k = k;
            for(int num: nums){
                add(num);
            }
        }
        
        int add(int val) {
            minHeap.push(val);
            if(minHeap.size()> k){
                minHeap.pop();
            }
            return minHeap.top();
        }
};

/**
 * Your KthLargest object will be instantiated and called as such:
 * KthLargest* obj = new KthLargest(k, nums);
 * int param_1 = obj->add(val);
 */
```

這題的主要目的是要練習 Heap 以及 Priority Queue 的使用， **首先可能看到如果是要及時的知道第`k` 的大的元素，那應該就會需要想到使用 min heap，因為這樣 root節點就會是最小值，leaf節點會是最大值，會較早pop出來**

這題會先定義 priority queue，並且會需要用到 min heap 所以會是 `priority_queue<int, vector<int>, greater<int>>` 。而初始化用的建構子除了初始化成員變數 `k` 之外，還需要呼叫 `add` 函數將 `nums` 陣列中的分數放入 priority queue。

`add` 函數則需要先將成績放進PQ中，並且只要當 `minHeap` 的大小大於 `k` 那就把最大的元素pop出來，直到 = `k` 為止，一旦等於則透過  `minHeap.top()` 取出當前的最大元素

### 執行結果

![](/img/LeetCode/703/result.png)

# 複雜度

時間複雜度： $O(logk)$
空間複雜度： $O(k)$

---