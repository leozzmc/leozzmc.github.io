---
title: 尋找 K 對最小總和 | Medium | LeetCode#373. Find K Pairs with Smallest Sums
tags:
  - Heap
  - Priority Queue
  - LeetCode
  - Array
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/373/cover.png
abbrlink: 551e0978
date: 2025-09-13 14:28:35
---


# 題目敘述

![](/img/LeetCode/373/question.png)

- 題目難度：`Medium`
- 題目描述： 題目給定兩個陣列 `nums1` 以及 `nums2`，兩者都以 non-decreasing order 排序，並且給定整數 `k`，題目要求你從兩個陣列中個取出一個整數，定義成 pair `(u, v)` 請找出 `k` 具有最小總和的 pair  `u1, v1), (u2, v2), ..., (uk, vk)`

# 解法

## 一開始的想法

一開始的想法比較暴力一點，一共三步：
1. 兩個陣列都各自迭代找出所有 pair 組合
2. 定義 minHeap 和 comparator 來比較pair之間誰的總和比較小
3. pop k 次


```c++
class Solution {
public:
    vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2, int k) {
        vector<vector<int>> resultPairs;
        //define heap
        auto comparator = [](const pair<int, int> &leftPair, const pair<int, int> &rightPair){
            int sumLeft = leftPair.first +  leftPair.second;
            int sumRight = rightPair.first + rightPair.second;
            return sumLeft > sumRight;
        };
        priority_queue<pair<int,int>, vector<pair<int,int>>, decltype(comparator)> minHeap(comparator);
        
        // form the pairs
        for(int i=0; i<nums1.size();i++){
            for(int j=0; j<nums2.size();j++){
                // vecPairs.push_back({nums1[i], nums2[j]});
                minHeap.push({nums1[i],nums2[j]});
            }
        }

        //pop k times
        while(!minHeap.empty() && k>0){
            resultPairs.push_back({minHeap.top().first, minHeap.top().second});
            minHeap.pop();
            k--;
        }

        return resultPairs;
    }
};
```

> 這是原先寫的方法，但這種方法絕對爆炸，因為會找出 `nums1.size() * nums2.size()` 個pairs 記憶體一定炸開，會Memory Limit Exceeded 

## 我的解法


```c++
class Solution {
public:
    vector<vector<int>> kSmallestPairs(vector<int>& nums1, vector<int>& nums2, int k) {
        vector<vector<int>> resultPairs;

        //define heap
        auto comparator = [&](const pair<int, int> &leftPair, const pair<int, int> &rightPair){
            long long sumLeft = (long long)(nums1[leftPair.first] +  nums2[leftPair.second]);
            long long sumRight = (long long)(nums1[rightPair.first] + nums2[rightPair.second]);
            return sumLeft > sumRight;
        };
        priority_queue<pair<int,int>, vector<pair<int,int>>, decltype(comparator)> minHeap(comparator);
        
        // form the pairs
        int limit = min((int)nums1.size(), k);
        for(int i=0; i<limit; i++){
            minHeap.push({i,0});
        }

        while(!minHeap.empty() && k-->0){
            auto [i, j] = minHeap.top();
            minHeap.pop();
            resultPairs.push_back({nums1[i],nums2[j]});
            if (j + 1 < (int)nums2.size()) {
                minHeap.push({i, j + 1});
            }
        }
        return resultPairs;
    }
};
```

上面這是後來改良的做法，大致流程一樣，但是這次不先算出所有 pairs，而是以隊伍的概念來進行：
- 每條隊伍只先派 **第一個學生**來參加比賽（即 `(i,0)`）
- 用minHeap決定哪個學生的總分最小，就把他選出來
- 被選出來的隊伍 (推入 `resultPairs`)，才再派下一個學生 `(i, j+1)` 出來。
- 重複這個動作 k 次。

而這樣做的前提在於題目有說這兩個陣列都是排序好的，並且 heap 的comparator 會是以sum值作為比較基準，也就是說，每條隊伍都按照* *和大小**從小到大排好（因為 `nums2` 是排序的，所以 `(i,0)` 最小，`(i,1)` 第二小 …）


> 這樣改良的做法就可以降低heap的負擔，原先需要放 m*n個pair 現在只需要 `min(k, nums1.size())` 個元素

### 舉例

```
nums1 = [1,7,11]
nums2 = [2,4,6]
k = 3
```

- 初始化： heap 裡有 `(1,2)`、`(7,2)`、`(11,2)`
- 第一次 pop → `(1,2)` → 加入答案 → 推 `(1,4)`
- 第二次 pop → `(1,4)` → 加入答案 → 推 `(1,6)`
- 第三次 pop → `(1,6)` → 加入答案 → 推 `(1, 沒有了)`

### 執行結果

![](/img/LeetCode/373/result.png)

# 複雜度

時間複雜度
$O(klog min(k,∣nums1∣))$

空間複雜度
$O(k+min(k,∣nums1∣))$ =  $O(k)$

----