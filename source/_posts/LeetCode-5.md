---
title: 最長迴文子字串 | Medium | LeetCode#5. Longest Palindromic Substring
tags:
  - Dynamic Programming
  - Multidimensional DP
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: bf0dee7b
date: 2024-11-25 19:07:47
cover: /img/LeetCode/5/cover.png
---

# 題目敘述

![](/img/LeetCode/5/question.jpeg)

- 題目難度: `Medium`
- 題目描述：給定一個字串 `s`，求出其最長的迴文子字串

{% note info %}
`babadsscca` 最長回文子字串會是 `bab` 或 `aba`
{% endnote %}

# 解法

## 一開始的想法

一開始想法一樣比較暴力，一樣會是想先找出遞迴關係式，首先應該會分成兩個函數處理，一個負責遞迴的邏輯，另一個用於確認是否為回文，遞迴邏輯會先透過迴圈來去切出不同範圍的子字串，子字串丟到函數檢查是否為回文，如果是那就檢查是否是最長的子字串，如果是，那就丟給原本的函數遞迴檢查下去

## Recursive

```cpp
class Solution {
public:
    bool checkPalindrome(string subStr){
        string tempStr = subStr;
        reverse(tempStr.begin(), tempStr.end());
        if(tempStr == subStr) return true;
        else return false;
    }

    string helper(string s, string subStr, int start, string maxStr){
        if(start == s.length()){
            return maxStr;
        }

        for(int i=start; i< s.length(); i++){
            subStr += s[i];
            if(checkPalindrome(subStr)){
                if(subStr.length() > maxStr.length() ){
                    maxStr = subStr;
                }
            }
        }
        return helper(s, "",start+1, maxStr);
    }

    string longestPalindrome(string s){
        return helper(s, "", 0,"");
    }
};
```

> 但這樣會進行大量重複的比較是否為回文的計算，因此會 Time Limited Excceded!

## Iteration + Memoization

這裡我直接改成用 Iteration的方式來進行最佳化

```cpp
class Solution {
public:
    vector<vector<int>> dp;
    bool checkPalindrome(const string &s, int left, int right){
        if(dp[left][right]!= -1) return dp[left][right]; 
        while(left < right){
            if(s[left] != s[right]){
                dp[left][right] = false;
                return dp[left][right];
            } 
            left++;
            right--;
        }
        dp[left][right] = true;
        return dp[left][right];
    }


    string longestPalindrome(string s){
        int n=s.length();
        if(n==0) return "";
        dp = vector<vector<int>>(n, vector<int>(n,-1));
        string maxStr="";
        for(int start=0; start< n; start++){
            for(int end= start; end < n; end++){
                if(checkPalindrome(s, start, end)){
                    if(end-start+1 > maxStr.length()){
                        maxStr = s.substr(start, end-start+1);
                    }
                }
            }
            
        }
        return maxStr;
    }
};
```

首先宣告一個二維陣列 `dp` 用於儲存是否為回文的判斷結果，另外在 `checkPalindrome` 函數中也變更了透過 `reverse` 的檢查方式，這裡進行手動檢查，如果 `dp[left][right]` 存在就回傳計算結果，只要 `left < right` 那在迴圈內只要兩端對應位置的字元不相等 (`s[left] != s[right]`) 則  `dp[left][right]=false` ，如果迴圈順利執行完成則代表為回文子字串，回傳 `dp[left][right]=true`


在主函數 `longestPalindrome` 初始化 `dp` 為大小為 `n*n` 的二維陣列，值為 `-1`，接著在二維陣列中，將外層迴圈作為子字串起點，內層迴圈從該起點 `start` 來去迭代字字串範圍，並且依序檢查是否為回文子字串，如果是，則檢查子字串長度是否大於 `maxStr` 的長度，如果大於則更新 `maxStr` 為該子字串。 迴圈結束後回傳 `maxStr`

### 執行結果

![](/img/LeetCode/5/result.jpeg)

# 複雜度

### 時間複雜度比較

| 方法                 | 時間複雜度        | 分析過程說明                                                                                                                                              |
|----------------------|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Recursion**        | $O(n^3)$       | 外層遞迴執行 $O(n)$，內層迴圈執行 $O(n^2)$ 次子字串遍歷，每次遍歷中執行 checkPalindrome，最壞情況為  $O(n)$，因此整體府雜度會是 $O(n^3)$                      |
| **Iteration + Memoization** |$O(n^2)$       | 對於每個可能的子字串（總共有約 $n^2/2$ 個），我們檢查是否為回文並記錄結果，保證每個子字串只檢查一次，因此時間複雜度為二次方成長                         |

### 空間複雜度比較

| 方法                 | 空間複雜度        | 分析過程說明                                                                                                                                              |
|----------------------|-------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Recursion**        | $O(n)$         | 每層遞迴函數調用會佔用額外的棧空間，最多同時有 $n$ 層調用，因此空間複雜度為 $O(n)$                                                                      |
| **Iteration + Memoization** | $O(n^2)$       | 建立一個二維 `dp` 表（大小為 $n \times n$)，用來存儲每個子字串的回文性質，額外的空間開銷來自這個表                                                |

# 類似題目

對於回文類型的題目有很多類似的，像是 [647. Palindromic Substrings](https://leetcode.com/problems/longest-palindromic-substring/description/?envType=study-plan-v2&envId=top-interview-150) 這題感覺像是本題的前身，另外就是 Backtracking 的題目 [131. Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/description/) 都其實可以用到 DP這種最佳化的方式去解。

---
