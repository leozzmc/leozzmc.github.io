---
title: 買賣股票的最佳時機III | Hard | LeetCode#123. Best Time to Buy and Sell Stock III
tags:
  - Dynamic Programming
  - LeetCode
  - Hard
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: cfc810b0
date: 2024-12-12 11:29:11
cover: /img/LeetCode/123/cover.png
---

# 前言 

這題是股票買賣系列的題目:

[121. Best Time to Buy and Sell Stock](https://leozzmc.github.io/posts/a0e35335.html)
[122. Best Time to Buy and Sell Stock II](https://leozzmc.github.io/posts/fcfb0850.html)
[188. Best Time to Buy and Sell Stock IV](https://leozzmc.github.io/posts/96bf11ff.html)
[309. Best Time to Buy and Sell Stock with Cooldown](https://leozzmc.github.io/posts/c95a58c1.html)


# 題目敘述

![](/img/LeetCode/123/question.jpeg)

- 題目難度：`Hard`
- 題目描述： 給定一個整數陣列 `prices`，`prices[i]` 代表第 `i` 天的股票價格，每一天可以選擇買或賣股票，最多只能交易兩次 (買賣兩次)，請找出最大收益。

{% note info %}
與先前幾題的原則一樣，只能先買後賣，並且不允許同時有多筆交易，手上股票要賣出才能夠繼續買
{% endnote %}

# 解法

## 一開始的想法

一開始的想法蠻簡單的，就是與前面幾題一樣，假設 `prices=[3,4,5,0,0,3,1,4]` 那漲跌幅值如下

```
+1 +1 -5 +0 +3 -2 +3
```

只要有連續漲幅，就加總起來，並加入到 `dp` 中，因此會是 `dp={2,3,3}` 只要將 `dp` 排序後取最後兩個元素相加就會是兩次交易的最大收益。

> 但這想法其實是有問題的

## 我的解法 - 錯誤

```c++
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        if(n<2) return 0;
        vector<int> dp;

        int sumIncrease=0;
        for(int i=1; i< n; i++){
            if(prices[i] >= prices[i-1]){
                sumIncrease += prices[i]-prices[i-1];
                if(i==n-1) dp.push_back(sumIncrease);
            }
            else{
                dp.push_back(sumIncrease);
                sumIncrease =0;
            }

        }
        sort(dp.begin(), dp.end());
        for(auto it=dp.begin(); it!=dp.end(); ++it){
            cout << *it << " ";
        }
        if(dp.size() >=2) return dp[dp.size()-1]+dp[dp.size()-2];
        else if(dp.size()==1) return dp[0];
        else return 0;
    }
};
```

這段程式碼使用 `sumIncrease` 來紀錄股價隨日期增加的金額， **但這並沒有考慮到應該將所有可以分割成的交易加總，而不是單純只選兩段最大增益**，以 `prices=[1,2,4,2,5,7,2,4,9,0]` 為例，上面程式最後會紀錄三段連續漲幅 `dp = {3,5,7}` 最後只會挑選出後兩個元素進行加總 `12`，但正確答案會是 `13`，會是在股價為 `1`時買入，股價為 `7` 時賣出 (此時收益為 `6`)，第二次交易為股價為 `2` 時買入，股價為 `9` 時賣出 (此時收益為 `6+7`)，因此最終最大收益會是 `13`，因此上面程式碼忽略了 **非連續遞增子序列多次買賣的狀況** 

### 執行結果

![](/img/LeetCode/123/error.jpeg)

## 正確解法

```c++
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        if (n < 2) return 0;

        vector<int> leftProfit(n, 0);
        vector<int> rightProfit(n, 0);

        int minPrice = prices[0];
        for (int i = 1; i < n; ++i) {
            minPrice = min(minPrice, prices[i]);
            leftProfit[i] = max(leftProfit[i-1], prices[i] - minPrice);
        }

        int maxPrice = prices[n-1];
        for (int i = n-2; i >= 0; --i) {
            maxPrice = max(maxPrice, prices[i]);
            rightProfit[i] = max(rightProfit[i+1], maxPrice - prices[i]);
        }

        int maxProfit = 0;
        for (int i = 0; i < n; ++i) {
            maxProfit = max(maxProfit, leftProfit[i] + rightProfit[i]);
        }

        return maxProfit;
    }
};
```

這裡透過兩種陣列 `leftProfit` 以及 `rightProfit` 來個別紀錄一次交易中能獲得的最大利潤，並且之後合併結果。 以下是舉裡說明：

```c++
prices = [3,3,5,0,0,3,1,4]
```


對於每一天 `i` 開始紀錄從第 `0`天到第 `i`天只進行一次交易的最大利潤。首先初始化 `minPrice = prices[0] = 3, leftProfit[0] = 0` 接著開始遍歷 `prices`

```
第 1 天 - minPrice = min(3,3) = 3, leftProfit[1] = max(0, 3-3) = 0
第 2 天 - minPrice = min(3,5) = 3, leftProfit[2] = max(0, 5-3) = 2
第 3 天 - minPrice = min(3,0) = 0, leftProfit[3] = max(2, 0-0) = 2
第 4 天 - minPrice = min(0,0) = 0, leftProfit[4] = max(2, 0-0) = 2
第 5 天 - minPrice = min(0,3) = 0, leftProfit[5] = max(2, 3-0) = 3
第 6 天 - minPrice = min(0,1) = 0, leftProfit[6] = max(3, 1-0) = 3
第 7 天 - minPrice = min(0,4) = 0, leftProfit[7] = max(3, 4-0) = 4

最後 leftProfit = [0, 0, 2, 2, 2, 3, 3, 4]
```

對於每一天 `i`，計算從第 `i` 天到最後一天只進行一次交易的最大利潤。初始化 `maxPrice = prices[n-1] = 4, rightProfit[n-1]=0`，接著由右至左迭代 `prices`

```
第 6 天 - maxPrice = max(4,1) = 4, rightProfit[6] = max(0, 4-1) = 3
第 5 天 - maxPrice = max(4,3) = 4, rightProfit[5] = max(3, 4-3) = 3
第 4 天 - maxPrice = max(4,0) = 4, rightProfit[4] = max(3, 4-0) = 4
第 3 天 - maxPrice = max(4,0) = 4, rightProfit[3] = max(4, 4-0) = 4
第 2 天 - maxPrice = max(4,5) = 5, rightProfit[2] = max(4, 5-5) = 4
第 1 天 - maxPrice = max(5,3) = 5, rightProfit[1] = max(4, 5-3) = 4
第 0 天 - maxPrice = max(5,3) = 5, rightProfit[0] = max(4, 5-3) = 4

最後 rightProfit = [4, 4, 4, 4, 4, 3, 3, 0]
```

最後需要合併結果，對於每一天 `i`，計算 `leftProfit[i] + rightProfit[i]`，並找出最大值。

```
第 0 天：maxProfit = max(0 + 4) = 4
第 1 天：maxProfit = max(0 + 4) = 4
第 2 天：maxProfit = max(2 + 4) = 6
第 3 天：maxProfit = max(2 + 4) = 6
第 4 天：maxProfit = max(2 + 4) = 6
第 5 天：maxProfit = max(3 + 3) = 6
第 6 天：maxProfit = max(3 + 3) = 6
第 7 天：maxProfit = max(4 + 0) = 6
```

因此最大利潤為 `6`

### 執行結果

![](/img/LeetCode/123/result.jpeg)

## 最佳化解法

```c++
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int firstBuy = INT_MIN;
        int firstSell = 0;
        int secondBuy = INT_MIN;
        int secondSell = 0;

        for(int price: prices){
            firstBuy = max(firstBuy, -price);
            firstSell = max(firstSell, firstBuy + price);
            secondBuy = max(secondBuy, firstSell - price);
            secondSell = max(secondSell, secondBuy + price);
        }
        return secondSell;
    }
};
```

這個解法最佳化了空間複雜度，從 $O(n)$ 降到 $O(1)$。這裡定義了四個變數

`firstBuy`: 第一次買入的最大利潤 (為負值，因為要扣除買入成本，上位賣出都不會是賺的)
`firstSell`:  第一次賣出的最大利潤 
`secondBuy`: 第二次買入的最大利潤 (基於第一次的利潤減去當前價格)
`secondSell`: 第二次賣出的最大利潤

迭代完畢 `prices` 後得到的 `secondSell` 則會是兩次交易後的最大利潤。

### 執行結果

![](/img/LeetCode/123/result2.jpeg)

# 複雜度

| 方法             | 時間複雜度 | 空間複雜度 | 分析說明                                                                                                                                    |
|------------------|------------|------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| 左右分解法       | $O(n)$       | $O(n)$       | 透過兩次遍歷計算左、右兩部分的最大利潤，並存入兩個輔助陣列 `leftProfit` 和 `rightProfit`。最終合併結果，找出最大利潤。空間使用受限於輔助陣列大小 |
| 動態規劃解法     | $O(n)$       | $O(1)$       | 優化空間後的動態規劃只使用常數空間記錄當前狀態，例如 `firstBuy`、`firstSell` 等四個變數，直接在遍歷中更新最大利潤。減少了輔助陣列的使用，空間效率更高 |


---