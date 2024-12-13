---
title: 買賣股票的最佳時機IV | Hard | LeetCode#188. Best Time to Buy and Sell Stock IV
tags:
  - Dynamic Programming
  - LeetCode
  - Hard
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 96bf11ff
date: 2024-12-13 11:00:53
cover:  /img/LeetCode/188/cover.png
---

# 前言 

這題是股票買賣系列的題目:

[121. Best Time to Buy and Sell Stock](https://leozzmc.github.io/posts/a0e35335.html)
[122. Best Time to Buy and Sell Stock II](https://leozzmc.github.io/posts/fcfb0850.html)
[123. Best Time to Buy and Sell Stock III](https://leozzmc.github.io/posts/cfc810b0.html)
[309. Best Time to Buy and Sell Stock with Cooldown](https://leozzmc.github.io/posts/c95a58c1.html)

# 題目敘述

![](/img/LeetCode/188/question.jpeg)
- 題目難度：`Hard`
- 題目描述： 給定一個整數陣列 `prices`，`prices[i]` 代表第 `i` 天的股票價格，每一天可以選擇買或賣股票，給定整數 `k` 代表可以進行的交易次數上限，請找出最大收益。

# 解法

## 一開始的想法

> 這題基本上是完全延續 [LeetCode#123. Best Time to Buy and Sell Stock III](https://leozzmc.github.io/posts/cfc810b0.html) 的題目描述，因此我直接按照這題的經驗來去實踐

## 我的解法

```c++
class Solution {
public:
    int maxProfit(int k, vector<int>& prices) {
        int n = prices.size();
        if(n<2) return 0;
        
        vector<int> dpBuy(k+1, INT_MIN);
        vector<int> dpSell(k+1,0);

        for(int i = 0; i < n; i++) {
            for(int j = 1; j <= k; j++) {
        
                dpBuy[j] = max(dpBuy[j], dpSell[j-1] - prices[i]);
                dpSell[j] = max(dpSell[j], dpBuy[j]+ prices[i]);
            }
        }
        return dpSell[k];
    }
};
```

這裏定義了兩個動態規劃陣列 `dpBuy` 以及 `dpSell`， `dpBuy` 代表每一天買入的淨利潤 (基於前一天的利潤減去當前價格)，由於 `dpSell` 初始化為 0，因此初次買入時淨利潤會是負數 (沒賣出都是虧的)。 `dpSell` 則代表賣出的最大利潤。

接著隨著每天價格迭代，交易次數則由 `j` 去迭代會有多少次買入跟賣出。最後在 `dpSell` 的最後一個元素將會是在 `k` 限制下，買入賣出的最大收益值。

### 執行結果

![](/img/LeetCode/188/result.jpeg)

# 複雜度

時間複雜度: $O(n \cdot k)$

空間複雜度 $O(k)$

---