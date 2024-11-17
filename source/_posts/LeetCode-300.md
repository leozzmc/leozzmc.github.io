---
title: 最長遞增子序列 | Medium | 300. Longest Increasing Subsequence
tags:
  - Dynamic Programming
  - String
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 14bd70a5
date: 2024-11-17 12:15:15
cover: /img/LeetCode/300/cover.jpg
---

# 題目敘述

![](/img/LeetCode/300/question.png)

- 題目難度: `Medium`
- 題目敘述: 題目給定一個整數陣列 `nums`，回傳所有可能的遞增子序列中最長的長度

{% note info %}
子序列(Subsequence) 可由原先陣列中刪除多個元素來得到，但不可更動其元素順序，其中遞增子序列代表元素由左至右數字漸增

Ex. `[5,8,3,2,4,5,9,15,7,20]`
其子序列包含: 
`[5,8,4,5,20]` 非遞增子序列
`[2,4,9,15]` 遞增子序列
`[15,7,20]`  非遞增子序列
`[5,9,15,20]`  遞增子序列
{% endnote %}

# 解法

## 一開始的想法

一開始的想法比較偏向暴力解，一開始先思考要怎麼手動找出遞增子序列，並且要找到最長的。

對於 `nums = [10,9,2,5,3,7,101,18]`

```
i=0 [10,9]
i=1 [10,2]
i=2 [10,5]
i=3 [10,3]
i=4 [10,7]
i=5 [10,101]
i=6 [10,18] -> 遞增子序列，max_length = 2
```
接著就會是每一輪迭代

```
i=0 [9,2]
i=1 [9,5]
i=2 [9,3]
i=3 [9,7]
i=4 [9,101] -> 遞增子序列，max_length = 2
-> [9, 101,] X
i=5 [9,18] -> 遞增子序列，max_length = 2
----------
i=0 [2,5] -> 遞增子序列，max_length = 2
-> [2,5,3] X
-> [2,5,7]  -> 遞增子序列，max_length = 3
-> [2,5,7,101]  -> 遞增子序列，max_length = 4
-> [2,5,7,101,18] X
.
.
.
i=1 [2,3] -> 遞增子序列，max_length = 2
-> [2,3,7] -> 遞增子序列，max_length = 3
-> [2,3,7, 101] -> 遞增子序列，max_length = 4
-> [2,3,7, 101, 18] X
.
.
.
```

## 我的解答

### 錯誤做法

```c++
int lengthOfLIS(vector<int>& nums){
    vector<int> tempList;
    int max_length =0;
    for(int i = 0; i < nums.size(); i++){
        tempList.push_back(nums[i]);
        int current = nums[i];
        for(int j = i+1; j < nums.size(); j++){
            if(current < nums[j]){
                tempList.push_back(nums[j]);
                current = nums[j];
                max_length = max(max_length, (int)tempList.size());
            }
        }
        tempList.clear();
    }
    return max_length;
}
```

這是我一開始的寫法，透過一個 `tempList` 來保存子序列，並且透過兩個迴圈來查看遞增子序列，同時更新最長序列長度。但這個程式會有問題:

- **遺漏所有可能的子序列**，內層迴圈會以 `nums[i]` 為起點，並且一旦選擇某一個數字作為當前遞增子序列的一部分後，沒有回頭檢查其他可能的分支

Example: `[0,1,0,3,2,3]`，在選擇 `[0,1,3]` 就可能忽略 `[0,1,2]` 這個子序列

- **無法回朔選擇**
- `tempList` 沒有特別用意，就只是為了計算長度
- 時間複雜度高

### 正確做法

```c++
int lengthOfLIS(vector<int>& nums){
    int n = nums.size();
    if(n == 0) return 0;
    int max_length =1;
    vector<int> dp(n, 1);
    for(int i = 1; i < n; i++){
        for(int j = 0; j <i; j++){
            if(nums[j] < nums[i]){
                dp[i] = max(dp[i], dp[j]+1);
            }
        }
        max_length = max(max_length ,dp[i]);
    }
    return max_length;
}
```

改良版本收先先針對 Edge Case做處理，但也可忽略(畢竟題目給的條件會至少會有一個元素)，接著宣告 `dp` 陣列， **`dp[i]` 代表以 `nums[i]` 為結尾的最長遞增子序列的長度**，初始化為 1，因為每個元素至少可以單獨成為長度為 1 的子序列。

接著是雙層迴圈，外層迴圈用來跑 `nums[i]`，由於 `i=0` 的時候，第一個元素本身就已經是長度為1 的子序列，並且如果外層為 0，內層就不會有 `j < i` 的條件在，所以可以跳過這個狀況。

而內層為 0，對於每個 `nums[i]` 可以檢查 `nums[0]` 到 `nums[i-1]` 是否有小於 `nums[i]` 的元素，如果存在 `nums[j] < nums[i]`，則可以將 `nums[i]` 接在 `nums[j]` 結尾的子序列之後 (`dp[j] + 1`, 當前元素也占用一個子序列長度)

由於會遍歷不同的 `j` 值，並且更新到 `dp[i]`，因此一旦有 `nums[i] < nums[j]` 狀況時，就可以比較 `dp[j]+1` 與上一輪更新的 `dp[i]` 誰比較長，最後，每一次內層迴圈跑完，就代表以 `nums[i]` 為頭的子序列已經找完一輪了，因此可以更新 `max_length`。雙層迴圈跑完最後回傳 `max_length` 即可。

### 執行結果

![](/img/LeetCode/300/result.jpeg)

## 最佳化解答

這是由 [geeksforgeek 提供的最佳化解答](https://www.geeksforgeeks.org/longest-monotonically-increasing-subsequence-size-n-log-n/)，時間複雜度僅有 $O(nlogn)$，**這段主要是透過 Binary Search 來實現**

```c++
int lengthOfLIS(vector<int>& nums){
    int n = nums.size();
    vector<int> res;
    res.push_back(nums[0]);
    
    for(int i=1; i<n; i++){
        if(nums[i]> res.back()) res.push_back(nums[i]);
        else{
            // Get lower bound index
            int low = std::lower_bound(res.begin(), res.end(), nums[i]) - res.begin();
            res[low] = nums[i];
        }
    }
    return res.size();
}
```

這裡需要說明一下，首先宣告一個用來儲存最長子序列的陣列 `res` (並且是遞增子序列)，首先把第一個 `nums[0]` pusH 到 `res` 中，之後對於每個 `nums[i]` 有兩種可能的操作，若 `nums[i]` 大於 `res` 中的最末端元素(最大元素)，則直接push到 `res` 的末端。

但如果 `nums[i]` 小於 `res` 中的末段元素，**但他也有可能會是其他子序列的頭或尾端**，因此需要找到他比哪個 `res` 中的值還要大，再加入進 `res` 中的對應位置。這時候就要用到 `<bits/stdc++.h>`  中的函數 `std::lower_bound()` 它可以用來找到 `res` 中第一個不小於 `nums[i]`的值

> The lower_bound function returns an iterator pointing to the first element that is not less than the current number.

之後獲取該值的 index 並且保存到變數 `low`，接著替換 `res` 中 index 為 `low` 的值為 `nums[i]`

```
[1,2,7,8,3,4,5,9,0]
1 -> [1]
2 -> [1,2]
7 -> [1,2,7]
8 -> [1,2,7,8]
3 -> [1,2,3,8]  // we replaced 7 with 3, since for the longest sequence we need only the last number and 1,2,3 is our new shorter sequence
4 -> [1,2,3,4] // we replaced 8 with 4, since the max len is the same but 4 has more chances for longer sequence
5 -> [1,2,3,4,5]
9 -> [1,2,3,4,5,9]
0 -> [0,2,3,4,5,9] // we replaced 1 with 0, so that it can become a new sequence
```
> 對於上面的範例，最長子序列為 `[1,2,3,4,5,9]` 且長度為 6

### 執行結果

![](/img/LeetCode/300/result2.png)

# 複雜度

| 方法                 | 時間複雜度        | 空間複雜度   | 優勢                                     | 適用情境                      |
|----------------------|-------------------|--------------|------------------------------------------|-------------------------------|
| 動態規劃 (DP)        | $O(n^2)$       | $O(n)$     | 簡單易懂，適合中小規模陣列               | 當數組長度 $n \leq 10^3$ 時 |
| 二分搜尋法 (貪婪法) | $O(n \log n)$  | $O(n)$     | 更高效，適合處理大規模數陣列              | 當數組長度 $n > 10^3$ 時   |

---