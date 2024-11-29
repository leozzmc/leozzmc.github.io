---
title: 爬樓梯問題 | Easy | LeetCode#70. Climbing Stairs
tags:
  - recursion
  - Dynamic Programming
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 355cc876
date: 2024-10-21 17:29:48
cover: /img/LeetCode/70/cover.jpeg
---


# 題目敘述

![](/img/LeetCode/70/question.jpeg)

- 題目難度：`Easy`

- 題目敘述：題目描述要爬階梯，需要 `n` 階可以到頂端，每次可以跨一步或是兩步，有多少種爬到頂端的方式?

# 解法

## 一開始的想法

首先要先思考這題的遞迴關係，**任意階的步驟數，會是由什麼組成？**

這裡可以觀察到如果 `n=1` 也就是往上一層有幾種走法，答案就是 `1` 因為只能走一步，那 `n=2` 這時就可以選擇走兩次一步 `[1,1]` 或者是一次走兩步 `[2]`，也就是有兩種選擇，那若 `n=3` 呢？ 往上三階其實就是往上一階和往上兩街的組合，因此他們對應的走法數量也會是 `n=1` 和 `n=2` 的加總

```
n=1 | output1=1
n=2 | output2=2

n=3 = 2+1 | output= output1+ output2
```

因此可以總結遞回式為 $F(n) = F(n-1) + F(n-2)$，把它寫成程式如下：

```cpp
int climbStairs(int n){
    if(n<=0) return 0;
    if(n==1) return 1;
    if(n=2) return 2;
    return climbStairs(n-1)+ climbStairs(n-2);
}
```

> 但這樣不會是 Optimized 的，因此需要額外storage 來儲存重複計算的部分




## 我的解法

```cpp
class Solution {
public:
    vector<int> dp;
    int helper(int n){
        if(dp[n]!=0) return dp[n];
        else if(n==1) return dp[1]=1;
        else if(n==2) return dp[2]=2;
        dp[n]=helper(n-1)+ helper(n-2);
        return dp[n];
    }

    int climbStairs(int n){
        dp = vector<int>(n+2, 0);
        return helper(n);
    }
};
```

這裡將題目給的函數 `climbStairs` 分離出一個單獨的 `helper` 函數，並且初始化一個整數向量 `dp`，在 `climbStairs` 中將 `dp` 初始化為 0，而在 `helper` 函數中，讓 `dp` 儲存遞迴呼叫的結果，而每次遞迴呼叫都會檢查 `helper(n)` 的結果，是否存在於陣列 `dp[n]`中，如果有就直接回傳其值，如果沒有並且已經遞回到第一階那就回傳 `dp[1]=1` 第二階就是 `dp[2]=2`  之後就是回傳 `dp[n]`



> 這麼做主要是做到到我們 DP 文章中的步驟二：Recursion + Memoization


### 執行結果

![](/img/LeetCode/70/result.jpeg)


# 複雜度

## 時間複雜度

每次調用 `helper(n)` 時，如果 `dp[n]` 的值不為 0，則直接返回已計算的結果，避免重複計算。如果 `dp[n]` 尚未計算，則調用 `helper(n-1)` 和 `helper(n-2)` 來計算。**每一個 `n` 值只會被計算一次，因為每次計算後，結果會被存入 `dp[n]` 中。** 之後當再次需要用到這個 `n` 時，就直接使用已經存儲的結果，避免了重複的遞迴運算。因此，對於每一個 `n`，函數只會進行一次遞迴計算，總共進行 $O(n)$ 次計算。

## 空間複雜度
- 程式使用一個大小為 `n+2` 的 `dp` 陣列來儲存計算結果。因此，這部分的空間複雜度為 $O(n)$
- 最差情況下，遞迴的深度為 $n$，因此Recursive Call 使用的 Stack 深度為 $O(n)$
因此整體空間複雜度為 $O(n)$