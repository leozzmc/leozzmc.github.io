---
title: 最小成本爬樓梯問題 | Easy | LeetCode#746. Min Cost Climbing Stairs
tags:
  - Recursive
  - Dynamic Programming
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 7f2c305b
date: 2024-10-24 19:53:51
cover: /img/LeetCode/746/cover.jpg
---

# 題目敘述

![](/img/LeetCode/746/question.jpeg)

- 題目難度: `Easy`
- 題目敘述: 題目給定一個整數陣列 `cost`，其中 `cost[i]` 代表通過第 `i` 階所需要的成本，一旦付完成本後，就可以再度選擇走一階還是兩階直到到達階梯頂端。題目也有說明，起點也可以選第一階 (index=0) 或者第二階 (index=1) 開始。**這題的最終目標要求的是到達頂端所需要的最小成本是多少。**

# 解法

## 一開始的想法

這題是基於 [LeetCode 76.  Climbing Stairs](https://leozzmc.github.io/posts/355cc876.html) 的延伸問題。那這題根據題目給的例子，假設 `cost=[10,15,20]` 由於初始可以選第一階或第二階，而所有走法如下:

```
10, 15, 20 = 45   (每次走一階)
10,20 = 30        (先走一步再一次跨兩階)
15, 20 = 35       (起點在第二階，然後再走一階)
15                (起點在第二，然後一次走跨兩階)
```
因此要目前需要找出的遞迴關係是，**對於任意階梯的最小成本是多少**

> 其實在這個問題中就可以發現這是會有重疊的子問題，並且之後有機會對重複計算進行最佳化，因此可以用某些 DP 的步驟進行處理。

核心問題可以歸結為：**在任意一階的最小成本，應該由之前走法中成本最低的路徑決定。** 從前一階到當前階，可能是一次走一步，也可能是跨兩步，不論哪種走法，只要成本最小即可。因此，**任意一階的最小成本應該是當前階的成本加上前一階或前兩階中已經達到最小成本的那一個。** 由此，我們可以歸納出遞迴關係式：$F(n) = cost(n) + \min(F(n-1), F(n-2))$

## 我的解法

```cpp
class Solution {
public:
    vector<int> dp;
    int helper(vector<int>& cost, int n){
        if(dp[n]!= -1) return dp[n];
        if(n <0){
            return 0;
        }
        if(n == 0 || n ==1){
            dp[n] = cost[n];
            return dp[n];
        }       
        dp[n] =  cost[n] + min(helper(cost, n-1), helper(cost, n-2));
        return dp[n];
    }

    int minCostClimbingStairs(vector<int>& cost){
        int n = cost.size();
        dp.resize(n, -1);
        return min(helper(cost, n-1), helper(cost, n-2));
    }
};
```

由於會有很多重複的步驟，因此在這裡會需要宣告一個額外的陣列 `dp` 來去記錄重算的路徑成本，我們將 `dp` 初始化為 -1，每次遞迴都會去檢查當前路徑成本是否已經記錄在 `dp[n]` 裡面，如果有就直接返回該值，如果已經到第一階或者第二階，那他們的最小成本就會是 `cost[0]` 或 `cost[1]`。在遞迴的每一層都會去將當前的成本跟先前的最小成本加總，最後回傳給 `minCostClimbingStairs`。

 
### 執行結果

![](/img/LeetCode/746/result.jpeg)

## 對空間複雜度進行最佳化

```cpp
class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost){
        int n = cost.size();
        for(int i=2; i<n; i++){
            cost[i] += min(cost[i-1], cost[i-2]);
        }
        return min(cost[n-1], cost[n-2]);
    }
};
```
這個解法用到DP那篇的步驟三 Tabulation，直接在題目給的 `cost` 陣列進行操作，選出前一階或前兩階小的成本與當前成本相加，加到後面結束

### 執行結果

![](/img/LeetCode/746/result2.jpeg)

# 複雜度

## 時間複雜度

不論哪種作法都是，$O(n)$，因為必定還是會走完階梯，因此複雜度為 $O(n)$ (`n` 為陣列 `cost`大小)

## 空間複雜度

$O(N)$

最佳化後會是 $O(1)$ 因為除了題目給的 `cost` 陣列之外沒有其他的空間需求。