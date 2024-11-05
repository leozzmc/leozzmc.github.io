---
title: 入室搶劫問題 | Medium | LeetCode#198. House Robber
tags:
  - Dynamic Programming
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 981b9e2f
date: 2024-11-05 14:21:54
cover: /img/LeetCode/198/cover.png
---

# 題目敘述

![](/img/LeetCode/198/question.jpeg)

- 題目難度: `Medium`
- 題目描述: 題目假設你是一個專業的竊賊，街上的屋子都有一筆現金，在街上挨家挨戶的入室竊盜，但如果你偷了相鄰兩間屋子就會觸發自動警報報警，你就會被抓。給定一個整數陣列 `nums` 代表街上每間屋子藏有的錢有多少，請回傳竊賊在不觸發警報的狀況下，可以偷到最大數目的金額。

# 解法

## 一開始的想法

我的想法就是，其實就是要找一個陣列 **除了相鄰元素外彼此的相加的所有可能組合當中的最大和**。舉例來說，給定 `nums={2,7,9,3,1}`，那非相鄰的所有可能組合如下：

```
2,9,1 => 12
2,3 => 5
7,3 => 10
9, 1 => 10
```

這當中數值最大的和為 12，而因此有了下面的遞迴做法

## 錯誤解法

```cpp
class Solution {
public:
    int robHelper(vector<int>& nums, int start) {
        if (start >= nums.size()) return 0;
        int robCurrent = nums[start] + robHelper(nums, start + 2);
        int skipCurrent = robHelper(nums, start + 1); 
        return max(robCurrent, skipCurrent);
    }

    int rob(vector<int>& nums) {
        return robHelper(nums, 0);
    }
};
```
上面的解法的想法在於，對於當前房屋，**選擇搶或不搶，如果要搶，就將當前的房子與下下個房子的金額做加總；今天如果不搶，那就移動到下一個房子**。 每次都要將當前要搶，跟當前不搶的結果做比對，找出結果金額最大的。 但這樣的做法會有大量重複計算的子問題。因此在 Submit 後出現 *Time Limit Exceeded* 錯誤

因此接下來，需要進行 [我先前DP文章中](https://leozzmc.github.io/posts/dynamic_programming.html#%E6%AD%A5%E9%A9%9F%E4%BA%8C-Recursion-Memoization) 所提到的步驟二 **Recursion + Memoization**

## 我的解答


```cpp
class Solution {
public:
    vector<int> dp;
    int robHelper(vector<int>& nums, int start) {
        if (start >= nums.size()) return 0;
        if(dp[start]!=-1) return dp[start];
        int robCurrent = nums[start] + robHelper(nums, start + 2);
        int skipCurrent = robHelper(nums, start + 1);
        
        dp[start] =  max(robCurrent, skipCurrent);
        return dp[start];
    }

    int rob(vector<int>& nums) {
        dp.resize(nums.size(), -1);
        return robHelper(nums, 0);
    }
};
```

這裡宣告了一個陣列 `dp`，用來存放每次 `robCurrent` 以及 `skipCurrent` 的比較結果，並且將其初始化為 -1

而在 `robHelper`函數中，可以看到我做的調整，在每一次比較中，如果發現 `dp[start]` 不等於 -1，就代表對應比較結果前面已經有計算過了，這時候就不需要去重複計算，因此直接返回 `dp[start]` 即可。


{% hideToggle 遞迴呼叫圖解,bg,color %}

字跡醜陋請包涵

![](/img/LeetCode/198/algo1.png)

![](/img/LeetCode/198/algo2.png)

![](/img/LeetCode/198/algo3.png)

![](/img/LeetCode/198/algo4.png)

{% endhideToggle %}

### 執行結果

![](/img/LeetCode/198/result1.jpeg)


## 最佳化解答

```cpp
class Solution {
public:
    int rob(vector<int>& nums){
        if(nums.empty()) return 0;
        else if(nums.size()==1) return nums[0];
        else if(nums.size()==2) return max(nums[0], nums[1]);
        vector<int> dp(nums.size(), 0);
        dp[0] = nums[0];
        dp[1] = max(nums[0], nums[1]);
        
        for(int i=2; i<nums.size(); i++){
            dp[i] = max(dp[i-1], dp[i-2] + nums[i]);
        }
        return dp[nums.size()-1];
    }
};
```

這裡的更佳解答會是 [先前整理的DP文章](https://leozzmc.github.io/posts/dynamic_programming.html) 中提到的 **第三步驟: Iteration + Tabulation**，也就是不透過遞迴，而是透過迴圈做到一樣的效果。在程式碼中，首先將 edge case 返回，像是 `nums` 為空，或者是 `nums` 只有一個或兩個元素時的狀況。

接著初始化一個長度跟 `nums` 一樣的陣列 `dp` 為0，並且該期第一個元素為 `nums` 包含的第一個元素，而第二個元素則會是


*dp陣列初始化*

![](/img/LeetCode/198/dp_init.png)


*迭代 dp 陣列*

![](/img/LeetCode/198/dp_iter.png)


### 執行結果

![](/img/LeetCode/198/result2.jpeg)

# 複雜度

## 時間複雜度

Recurstion: $O(n)$

在 `robHelper` 函數中，透過 `start` 位置從左至右進行遞迴計算，每個位置最多只會計算一次。由於我們使用 `dp` 來儲存已經計算過的結果，當再次遇到相同的 `start` 值時，可以直接從 `dp` 中讀取結果，而不需要重複計算，因此 `robHelper` 函數在每個 `start` 位置上僅進行一次計算，從而使整個計算量是線性的，即 $O(n)$

Iteration: $O(n)$


for 遍歷了 `nums` 陣列，從 `i = 2` 到 `i = nums.size() - 1`，因此需要執行  `n−2` 次迴圈操作。每次迴圈內都是進行簡單計算和比較操作，為 $O(1)$，因此整體時間複雜度為 $O(n)$

## 空間複雜度

Recursion: $O(n)$

`dp`，大小為 `nums.size()` 用於儲存每個 start 位置的計算結果，因此需要 $O(n)$ 大小的空間，並且每個遞迴呼叫 stack 的深度也為 n

Iteration: $O(n)$

`dp`，大小為 `nums.size()`，用於儲存每個位置 `i` 能搶劫的最大金額，因此需要 $O(n)$ 大小的空間