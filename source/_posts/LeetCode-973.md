---
title: K個距離原點最近的點 | Medium | LeetCode#973. K Closest Points to Origin
tags:
  - Array
  - Heap
  - Priority Queue
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/973/cover.png
abbrlink: 33dda161
date: 2025-09-08 22:39:25
---

# 題目敘述

![](/img/LeetCode/973/question1.png)
![](/img/LeetCode/973/question2.png)

- 題目難度：`Medium`
- 題目描述： 題目給定一個陣列 `points` 其中 `points[i] = [xi, yi]` 代表在X-Y座標軸中任意點的位置，給定整數 `k` 求 `k` 個最靠近原點(`0,0`)的點

> 兩點之間求距離公式： `√(x1 - x2)2 + (y1 - y2)2`

# 解法


我一開始的想法會是因為求 `k` 個距離近的點，而距離近代表離原點數字小，因此要用 max Heap 來解，但是我希望在 maxHeap 中放入的會是座標本身，然後排序方式就用距離大小來排，因此會需要自定義 comparator

> 這邊關於使用 lambda 語法定義 comparator 可以參考這篇：https://notes.boshkuo.com/docs/C++/STL/priority_queue

## 我的解法

```c++
class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
        auto comparator = [](const vector<int>& leftVec, const vector<int>& rightVec) {
            long long d1 = 1LL * leftVec[0] * leftVec[0] + 1LL * leftVec[1] * leftVec[1];
            long long d2 = 1LL * rightVec[0] * rightVec[0] + 1LL * rightVec[1] * rightVec[1];
            return d1 > d2;
        };
        priority_queue<vector<int>,vector<vector<int>>, decltype(comparator)> distanceHeap(comparator);

        for(const auto&p: points){
            distanceHeap.push(p);
        }

        vector<vector<int>> result;
        result.reserve(k);
        for(int i=0; i<k; i++){
            if(!distanceHeap.empty()){
                result.push_back(distanceHeap.top());
                distanceHeap.pop();
            }
        }
        return result;
    }
};
```

這邊會去定義一個 priority queue `distanceHeap` 但請注意宣告內容，因為要放的會是座標，因此內部的值要是 `vector<int>` 然後整個 PQ會用 `vector<vector<int>>` 來儲存，而判斷大小用的 comparator 定義在上方。

```c++
auto comparator = [](const vector<int>& leftVec, const vector<int>& rightVec) {
    long long d1 = 1LL * leftVec[0] * leftVec[0] + 1LL * leftVec[1] * leftVec[1];
    long long d2 = 1LL * rightVec[0] * rightVec[0] + 1LL * rightVec[1] * rightVec[1];
    return d1 > d2;
};
```

這邊定義兩個參數 `leftVec` 以及 `rightVec` 用來比較兩個座標誰距離原點比較近，但其實不用真的去做平方根，只要做到平方相加就好，但也因此會需要使用 `long long` 行別的變數來存放。 並且距離小的先放(放在heap頂端)。

```c++
for(const auto&p: points){
    distanceHeap.push(p);
}
```

一旦 PQ 宣告結束後，就可以把整個 `points` 當中的座標放入 `distanceHeap`中。 最後透過一個迴圈，來將heap底部的元素(距離較近的元素)彈出，並且加入到回傳陣列 `result` 當中。

### 執行結果

![](/img/LeetCode/973/result.png)

# 複雜度

時間複雜度：$O(NLogN)$

空間複雜度：$O(N)$

---
