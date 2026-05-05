---
title: >-
  無重複字元的最長字串 | Medium | LeetCode#3. Longest Substring Without Repeating
  Characters
tags:
  - String
  - Sliding Window
  - Hash Table
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 5701a21
date: 2024-12-04 13:23:23
cover: /img/LeetCode/3/cover.png
---

# 題目敘述

![](/img/LeetCode/3/question.jpeg)

- 題目難度: `Medium`
- 題目描述：給定一個字串 `s`，求最長子字串的長度，並且該子字串中不能有重複的字元

# 解法

## 一開始的想法

這題的暴力解就會是透過雙重迴圈來去找各種子字串，然後查找多種不同非重複子字串的長度，然後回傳最長的那個，但在迴圈查找過程中，由於要查找的是輸入資料中的變動長度的字串，因此可以用 sliding window 來解題。其中在確認字元是否重複的過程，則可以用Hash Table 來去儲存和查找。

## 我的做法

```cpp
class Solution {
public:
    int  lengthOfLongestSubstring(string s){
        if(s.size()==0) return 0;
        int left=0, right=0;
        int maxLength = 0;
        unordered_map<char, int> umap;

        // Find substrings
        // Checking if the characters are repeated
        for(int right=0; right< s.size(); right++){
            if(umap.find(s[right])!=umap.end() && umap[s[right]]>=left){
                left = umap[s[right]]+1;
            }
            umap[s[right]]= right;
            maxLength= max(maxLength, right - left+1);
        }
        return maxLength;
    }
};
```

首先排除邊界條件，`s` 如果為空則回傳 0，接著定義用於夾出window 的兩個變數 `left` 以及 `right`，以及紀錄最長長度用的變數 `maxLength` 和用於紀錄重複字元的 `umap`。接著就需要去透過移動 `right` 的大小來擴展窗口，這當中會去將字元以及其對應的 index 紀錄到 `umap`中

```cpp
umap[s[right]] = right;
```
而如果沒有重複字元，則當前子字串長度會去跟 `maxLength` 比較找出最長長度值，然後更新到 `maxLength`。 而一旦在操作窗口中發現字元重複並且該字元對應的 index 值不小於 `left`，這時就需要去更新 `left` 的值，也就是要縮小窗口 `left = umap[s[right]]+1`， **這個步驟會是要讓窗口從先前紀錄的重複字元的下一個元素，作為新的窗口邊界來檢查是否有更新的子字串。**

![](/img/LeetCode/3/algo.png)

### 執行結果

![](/img/LeetCode/3/result.jpeg)

# 複雜度

| **操作**                          | **時間複雜度** | **空間複雜度** | **分析**                                                                                                                                                                                                                   |
|------------------------------------|----------------|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 初始化變數（`left`, `right`, `umap`）| $O(1)$     | $O(1)$     | 初始化常數時間與空間。                                                                                                                                                                                                     |
| `for` 迴圈遍歷字串                  | $O(n)$     | $O(n)$     | 迴圈執行 $ n $ 次，每個字元只會被訪問一次，因此時間複雜度為 $ O(n) $。空間複雜度來自 `unordered_map` 存儲最多 $ n $ 個字元的位置（當所有字元都唯一時）。                                                   |
| 更新 `unordered_map`                | $O(1)$     | $O(n)$     | 插入或更新 `unordered_map` 中的字元索引操作為 $ O(1) $。                                                                                                                                                                 |
| 計算子字串長度                      | $O(1)$     | $O(1)$     | 計算當前子字串長度是常數時間操作。                                                                                                                                                                                         |
| **總計**                           | $O(n)$     | $O(n)$     | 主迴圈和 `unordered_map` 操作總共耗時 $ O(n) $。空間複雜度受限於字串長度和字符集大小。                                                                                                                                  |


---