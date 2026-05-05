---
title: 陣列中第K大的元素 | Medium | LeetCode#215. Kth Largest Element in an Array
tags:
  - Array
  - Heap
  - Priority Queue
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/215/cover.png
abbrlink: d91391c2
date: 2025-09-08 21:39:27
---

# 題目敘述

![](/img/LeetCode/215/question.png)

- 題目難度：`Medium`
- 題目描述： 題目給定整數陣列 `nums` 以及整數 `k`，請回傳陣列中第 `k` 個大的元素。特別注意，會是需要由大到小第`k`個元素，並不是第`k`大的相異元素


# 解法


## 我的解法

```c++
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> minHeap(nums.begin(), nums.begin()+k);
        for(int i=k; i<nums.size(); i++){
            if(nums[i]>minHeap.top()){
                minHeap.pop();
                minHeap.push(nums[i]);
            }
        }
        return minHeap.top();
    }
};
```

這邊一樣透過 priority queue去解，並且一樣需要用到 min heap，這裡先把 `nums` 中的前k個元素放入 PQ `minHeap` 裡面，此時的 heap size 大小會是 `k` 但裡面的元素並不一定真的會是前k個大的元素，因此剩下的元素，需要一個一個判斷，如果接下來在 `nums` 中的元素大於當前 heap 中的最大值 (`minheap.top()`) 此時需要更新 `heap` 中的元素，需要把當前的 `heap` 中最大值pop出來，並且把 `nums[i]` 元素推入 heap 底部。

如果迭代完 `nums` 則直接回傳 heap 中最大值即可。


### 執行結果

![](/img/LeetCode/215/result.png)

# 複雜度

時間複雜度: $O(nLogk)$

空間複雜度：$O(k)$

---