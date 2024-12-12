---
title: 買賣股票的最佳時機II | Medium | LeetCode#122. Best Time to Buy and Sell Stock II
tags:
  - Dynamic Programming
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: fcfb0850
date: 2024-12-11 14:01:39
cover: /img/LeetCode/122/cover.png
---

# 前言 

這題是股票買賣系列的題目:

[121. Best Time to Buy and Sell Stock](https://leozzmc.github.io/posts/a0e35335.html)
[123. Best Time to Buy and Sell Stock III](https://leozzmc.github.io/posts/cfc810b0.html)
[309. Best Time to Buy and Sell Stock with Cooldown](https://leozzmc.github.io/posts/c95a58c1.html)


# 題目敘述

![](/img/LeetCode/122/question.jpeg)

- 題目難度: `Medium`
- 題目描述： 給定一個整數陣列 `prices`，`prices[i]` 代表第 `i` 天的股票價格，每一天可以選擇買或賣股票，允許當日買在當日立刻賣出，然而任意時間段最多僅能持有一份股票

# 解法

## 一開始的想法

這題跟 [LeetCode-121 Best Time to Buy and Sell Stock](https://leozzmc.github.io/posts/a0e35335.html) 不太一樣的是，這題允許多次交易，所以要求的是， **多筆買賣的總收益要最大化。**

假設今天 `prices = {7, 1, 5, 3, 6, 4}` 則在股價為 `1` 時買入，隔天為 `5` 時賣出，此時收益為 `4` 然後在隔天股價為 `3` 的時候再度買入，隔天股價為 `6` 的時候賣出，此時總收益為 `4+3 =7`

{% note info %}
這題會有個特性，就是跨天數的收益，可以拆解！
假設 `prices = [1, 3, 2, 5, 4, 6]` 則跨多天的最大收益是從 1 買入到 6 賣出，即  `6-1 = 5` 這其實可以從每一天的股票漲跌幅得到:

`1 -> 3`: +2
`3 -> 2`: -1
`2 -> 5`: +3
`5 -> 4`: -1
`4 -> 6`: +2

從第一天到最後一天的總漲跌幅為： `0 + (+2)+(-1)+(+3)+(-1)+(+2) = 5`，另外上面可以看出最大化總收益，就是都買在下面這幾天

`1 -> 3`: +2
`2 -> 5`: +3
`4 -> 6`: +2

總收益: `0+2+3+2 = 7`

{% endnote %}

## 我的解法

```c++
class Solution {
public:
    int maxProfit(vector<int>& prices){
        int n = prices.size();
        if (prices.size() < 2) return 0;
        
        int maxProfit =0;
        for(int i=1; i< n; i++){
            if(prices[i] > prices[i-1]){
                maxProfit += prices[i]-prices[i-1];
            }
        }
        return maxProfit;
    }
};
```

這裡透過變數 `maxProfit` 紀錄變數，接著開始迭代 `prices`， 只要今天股價比昨天大，則將差額加入到總收益中，迭代結束後回傳 `maxProfit`

### 執行結果

![](/img/LeetCode/122/result.jpeg)

# 複雜度

時間複雜度: $O(n)$

空間複雜度: $O(1)$

---