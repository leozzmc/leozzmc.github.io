---
title: 拆分字句 | Medium | LeetCode#139. Word Break
tags:
  - Dynamic Programming
  - String
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 9081d01d
date: 2024-11-18 15:14:29
cover:
---

# 題目敘述

![](/img/LeetCode/139/question.jpeg)

- 題目難度：`Medium`
- 題目描述：給定一個字串 `s`，以及一個字串形成的陣列 `wordDict`，若 `s` 可以被分割成一個或多個 `wordDict` 當中的單字序列，則回傳 `True`

{% note info %}
Note that the same word in the dictionary may be reused multiple times in the segmentation.
{% endnote %}

# 解法

## 一開始的想法

`s` 中的每個字元可以 **選或不選**，每次形成一個子字串，就去跟 `wordDict` 進行比較看當前子字串是否存在於 `wordDict` 當中，一旦嘗試過每個子字串，則回傳結果。

## 我的解答

```cpp
class Solution {
public:
    vector<int> dp; 
    bool helper(string s, int start, vector<string>& wordDict){
        if(start == s.length()){
            return true;
        }

        if(dp[start]!= -1) return dp[start];

        for(int i=start; i<s.length(); i++){
            string word = s.substr(start, i-start+1);
            if(find(wordDict.begin(), wordDict.end(),word)!=wordDict.end()){
                if(helper(s,i+1, wordDict)){
                    return dp[start]=1;
                }
            }
        }
        return dp[start]=0;
    }

    bool wordBreak(string s, vector<string>& wordDict){
        dp.resize(s.length()+1, -1);
        return helper(s,0 ,wordDict);
    }
};
```

> 實際上使用了 Recursive + Memoization 的DP技巧

這裡直接講 `helper` 函數，首先會是撇除 `dp`，會是最純粹的遞迴關係式，透過 for迴圈，來迭代 `s`，透過 `start` 以及當前的 `i` 來形成不同範圍的子字串， **接著透過 `std::find()` 函數來查到當前子字串陣列 `wordDict` 範圍中是否有匹配的單字** ， 如果有找到匹配單字，則遞迴呼叫 `helper()`，其中也給定更新的 `start` 位置作為新的子字串起點。

接著就是 Memoization的部分，在 `start` 抵達字串終點時就回傳 true。而遞迴呼叫的結果如果存在，則對應的 `dp[start]` 位置設定為 1，並且在每一層遞回中，如果發現 `dp[start]` 並非 -1，就代表先前已經有計算過了，就直接回傳結果就好。

然而對於某個起始點 `start` 所切出的所有子字串，如果都沒有匹配的單字，則 `dp[start] = false`

### 執行結果

![](/img/LeetCode/139/result.jpeg)


# 複雜度

## 時間複雜度

`helper` 函數中，在選擇不同起始點的for迴圈中，會嘗試不同的子字串，若字串長度是 $n$，則內部迴圈耗費時間也會是 $O(n)$，則遞迴深度最深為 $O(n)$，另外在字典比對中，時間複雜度會是 $O(m)$，$m$ 會是 `wordDict` 的大小。

因此整體時間複雜度會是 $O(n^2 \cdot m)$


## 空間複雜度

recursive call 深度最深為 $O(n)$，每次遞迴只會增加 `start`，直到遞迴深度達到字串長度 $n$，`dp` 大小為 $O(n)$，用來儲存已經運算過的結果。因此整體空間複雜度一樣還是 $O(n)$。

---