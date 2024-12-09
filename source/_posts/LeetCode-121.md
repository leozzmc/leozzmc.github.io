---
title: 買賣股票的最佳時機 | Easy | LeetCode#121. Best Time to Buy and Sell Stock
tags:
  - Dynamic Programming
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: a0e35335
date: 2024-12-09 19:16:02
cover: /img/LeetCode/121/cover.png
---

# 前言 

這題是股票買賣系列的題目，與他類似的題目會是 [309. Best Time to Buy and Sell Stock with Cooldown](https://leozzmc.github.io/posts/c95a58c1.html)

# 題目敘述

![](/img/LeetCode/121/question.jpeg)

- 題目難度： `Easy`
- 題目描述： 給定一個陣列 `prices`，`prices[i]` 代表在第 `i` 天的股票價格。請選一天進買入股票，但在不同天賣出股票 (買賣股票不能在同一天，且須先買股票才能賣股票)，求股票的最大化收益。

# 解法

## 一開始的想法

一開始的想法複雜度其實比較高，就是透過一個迴圈來決定買入，透過另一個內部迴圈決定賣出，然後透過一個變數 `maxValue` 保存第 `i` 天買入然後第 `j` 天賣出的的最大股票收益值。但這樣的做法會導致 time limit excceded!

```c++
class Solution {
public:
    int maxProfit(vector<int>& prices){
        if(prices.size() < 2) return 0;
        int n = prices.size();
        int maxValue=0;

        for(int i=0; i<n; i++){
            for(int j=i+1; j<n; j++){
                maxValue = max(maxValue, prices[j] - prices[i] );
            }
        }
        return maxValue;
    }
};
```

## 我的解法

```c++
class Solution {
public:
    int maxProfit(vector<int>& prices){
        if(prices.size() < 2) return 0;
        int n = prices.size();
        int minValue = INT_MAX;
        int maxValue = 0;

        for(int i=0; i<n; i++){
            minValue = min(minValue, prices[i]);
            maxValue = max(maxValue, prices[i] - minValue);
        }
        return maxValue;
    }
};
```

這裏在相同迴圈中，在迭代過程中就獲取到了股票最小值，並且透過當前價格扣掉歷史最小股票值，將淨值與 `maxValue` 進行比較，取大者，則可獲得最大收益值

### 執行結果

![](/img/LeetCode/121/result.jpeg)

# 複雜度

- 時間複雜度: $O(n)$
- 空間複雜度: $O(1)$

