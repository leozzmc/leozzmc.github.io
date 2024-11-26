---
title: 交錯字串 | Medium | LeetCode#97. Interleaving String
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
abbrlink: 84d0f7e8
date: 2024-11-26 12:50:24
cover:
---


# 題目敘述

![](/img/LeetCode/97/question.jpeg)
- 題目難度：`Medium`
- 題目敘述：給定字串 `s1`, `s2`, `s3`，檢查 `s3` 是否是由 `s1` 以及 `s2`  **交錯組合而成 (Interleaving)。**

{% note info %}
`s = s1 + s2 + s3 +... + sn`
`t = t1 + t2 + t3 + ... + tn`
`|n-m| <= 1`
Interleaving: `s1+t1+s2+t2+s3+t3+...` or `t1+s1+t2+s2+t3+s3+...`
{% endnote %}

# 解法

## 一開始的想法

```cpp
bool helper(string s3,string s1, string s2, string temp, int start){
    if(start > s3.length()) return false;
    if(start == s3.length()){
        return true;
    }

    for(int i=start; i<=s3.length();i++){
        if(s1[i] == s3[i]){
            temp += s1[i];
            if(helper(s3, s1, s2, temp, start+1)) continue;
            temp.pop_back();
        }
        if(s2[i] == s3[i]){
            temp += s2[i];
            if(helper(s3, s1, s2, temp, start+1)) continue;
            temp.pop_back();
        }
    }
    return false;
}

bool isInterleave(string s1, string s2, string s3){
    return helper(s1,s2,s3,"",0);
}
```

這樣的解法，對於相同的 `start`，會重複計算大量子問題。因此會超時！

## Recursive + Memoization

```cpp
class Solution {
public:
    vector<vector<int>> dp;
    bool helper(string s3,string s1, string s2, int i, int j){
        if(i+j == s3.length()){
            return true;
        }
        if(dp[i][j]!= -1) return dp[i][j];

        bool result =false;
        if(i<s3.length() && s1[i] == s3[i+j]){
            result = helper(s3, s1, s2, i+1, j);
        } 
        if(!result && j<s3.length() && s2[j] == s3[i+j]){
            result = helper(s3, s1, s2, i, j+1);
        }
        dp[i][j]=result;
        return result;
    }
    bool isInterleave(string s1, string s2, string s3){
        if(s3.length()!=s1.length()+s2.length()) return false;
        int n= s1.length();
        int m = s2.length();
        dp = vector<vector<int>>(n+1, vector<int>(m+1, -1));
        return helper(s3,s1,s2,0,0);
    }
};
```

這裡宣告了用於儲存重複計算結果的 2D陣列，`vector<vector<int>> dp`，在 `isInterleave` 函數中初始化為 `(n+1) x (m+1)`，`helper` 函數中改成不以 `for` 去做迭代，而是用用遞迴的方式在每一層檢查交錯，另外在先前得解法中沒有考慮到的是， **`s3` 的長度會是 `s1` 跟 `s2` 的長度加總，因此不能用 `s1[i]==s3[i]` 的方式去迭代** ，這樣會超出 `s1` 的長度限制。因此我們透過 `s1[i] == s3[i+j]` 來檢查交錯，**如果相等，那就按照當前的 `s1`的位置繼續遞迴檢查下去 `helper(s3,s1,s2, i+1,j)` 並且將結果保存到 `result`** ，如果在當前這層，`result` 結果為 `false` 則改成檢查 `s2`，如果 `s2[j] == s3[i+j]` 則可以接續當前 `s2`的位置繼續遞迴檢查 `helper(s3,s1,s2,i,j+1)`，結果一樣保存到 `result`。

為了應對大量重複計算，在每一層遞迴季算中，都會將結果的 `result` 保存到對應的 `dp[i][j]` 代表以該位置`i,j`切割 `s1`, `s2` 是否能夠交錯組合成 `s3`。若有重複的計算結果也直接回傳 `dp[i][j]`，以減省時間。

### 執行結果

![](/img/LeetCode/97/result.jpeg)

# 複雜度

| **複雜度類型** | **時間/空間複雜度** | **分析過程**                                                                 |
|----------------|----------------------|------------------------------------------------------------------------------|
| **時間複雜度** |  $O(n * m)$            | 遞迴檢查每個狀態，且使用 `dp` 陣列避免重複計算，共有 `n * m` 狀態需要計算            |
| **空間複雜度** | $O(n * m)$            | 需要一個大小為 `n * m` 的二維 `dp` 陣列來儲存每個狀態結果，遞迴堆疊使用額外空間 $O(d)$ |




---