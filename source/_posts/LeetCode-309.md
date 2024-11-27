---
title: >-
  最佳股票買賣時機含冷凍期 | Medium | LeetCode#309. Best Time to Buy and Sell Stock with
  Cooldown
tags:
  - Dynamic Programming
  - Multidimensional DP
  - String
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: c95a58c1
date: 2024-11-27 14:54:25
cover:  /img/LeetCode/309/cover.png
---

# 題目敘述

![](/img/LeetCode/309/question.jpeg)
- 題目難度：`Medium`
- 題目描述： 給定一個整數陣列 `prices`，其中 `prices[i]` 代表給定股票在第 `i` 天的價格，請找到你能獲得的最高股票收益，可以買賣股票多次，但是有以下限制：
    -  **當你賣出股票後，隔一天為冷卻期，無法進行買賣**
    -  在你買股票前，需要把先前持有的股票賣出 (i.e. 你不能夠 第一天買然後第二天也買，要先把第一天的賣掉)

# 解法

## 一開始的想法

這題我後來參考了 [NeetCode 的影片](https://www.youtube.com/watch?v=I7j0F7AHpb8&t=669s)，裡面的樹狀圖幫助很大，


{% hideToggle Decision Tree ,bg,color %}
![](/img/LeetCode/309/tree.png)
{% endhideToggle %}



## Recursive + Memoization

```cpp
class Solution {
public:
    vector<vector<int>> dp;
    int helper(vector<int>& prices, int start, int canBuy){
        if(start >= prices.size()) return 0;
        
        
        if(dp[start][canBuy]!= -1) return dp[start][canBuy];

        //Not buy
        int cooldown = helper(prices,start+1, canBuy);

        //Buy
        if(canBuy == 1){
            int sum = -prices[start] + helper(prices,start+1,0);
            dp[start][canBuy] = max(cooldown, sum);
        } 
        // Sell
        else if(canBuy == 0){
            int sum = prices[start]+helper(prices,start+2,1);
            dp[start][canBuy] = max(cooldown, sum);
        }
        
        return dp[start][canBuy];
    }

    int maxProfit(vector<int>& prices){
        if(prices.size()<=1) return 0;
        dp = vector<vector<int>>(prices.size(), vector<int>(2, -1));
        return helper(prices,0, true);
    }
};
```


**首先一樣狀況分成三種，cooldown, buy, sell。如果還沒有買，那當天可以選擇買或冷卻，如果當天買了，那當天可以選擇賣或冷卻。** 在 `helper` 函數中，透過 `canBuy` 來判斷當天是否可以買，如果可以買那就會是 `1` 否則就賣出，也就是為 `0`。由於每天都可以選擇 cooldown 因此在一開始就先 cooldown 然後直接呼叫隔天。回傳結果存放到變數 `cooldown`當中，而如果當天可以買，則當前總額 `sum` 會需要扣掉當日價格，也可以看成加上負的當日價格，再加上做這個決定後，後續的遞迴迴呼叫結果 `helper(prices, start+1, 0)` (參數 `0` 是因為今天買了，那明天就不能買)。 **接著就需要比較，第一天冷卻還是第一天買入的結果值比較大， `max(cooldown, sum)`**，這個值會存放到用於儲存重複計算的 `dp[start][canBuy]` 中。

另一方面，如果當日要賣出，則需要將當日價格加上，這個決定後續的遞迴結果 `helper(prices, start+2, 1)`，接著一樣與今日冷卻的決策結果 `cooldown` 去做比較 `max(cooldown, sum)` 並一樣儲存在 `dp[start][canBuy]` 當中。 最後回傳 `dp[start][canBuy]`。

遞迴終止條件，如果超出目前 `prices` 長度範圍，則回傳 `0`，另外若有發現重複計算，則回傳計算過的值 `dp[start][canBuy]`。

### 執行結果

![](/img/LeetCode/309/result.jpeg)


# 複雜度

| 複雜度     | 結果      | 說明                                                                                                                                                         |
|------------|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 時間複雜度 | $O(n)$    |  `dp` 包含 $n \cdot 2$ 種狀態，其中 $n$ 是價格陣列的大小，每個狀態最多計算一次（使用遞迴函數時會檢查 `dp[start][canBuy]` 是否已計算），操作僅需常數時間 |
| 空間複雜度 | $O(n)$    |  `dp` 占用 $O(n)$ 空間，儲存每種狀態的結果。遞迴過程中，每次調用函數會使用額外的遞迴棧空間，最深遞迴深度為 $n$，總空間複雜度為 $O(n)$              |
