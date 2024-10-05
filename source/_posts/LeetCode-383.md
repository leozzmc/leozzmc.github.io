---
title:  勒索信 | Easy | LeetCode#383. Ransom Note
toc: true
tags:
  - Hash Table
  - String
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: cf28187e
date: 2024-10-05 11:35:01
cover: /img/LeetCode/383/cover.jpg
---

# 題目敘述

![](/img/LeetCode/383/question.jpeg)

- 題目難度: `Easy`
- 題目敘述: 題目給定兩個字串 `ransomNote` 以及 `magazine` ，若 `ransomNote` 可以由 `magazine` 中的字母組成，則回傳 `ture` 否則回傳 `false`

{% note info %}
注意題目給的 Example2，`magazine`中個別出現字母的數量也是有意義的，如果只有一個 `a` 也無法組成 `ransomNote` 中的兩個 `a`
{% endnote %}

# 解法

## 一開始的想法

這題的想法就是將 `magazine` 中的字母丟入 Hash Table 然後，迭代查看 `ransomNote` 中的字母有無出現在 `magazine` 有的話就必須將 HashTable　中的對應字母移除或減少數量，而在迴圈中如果發現沒有的話就直接回傳 `false`，迴圈結束就代表完美匹配，就回傳 `true`

## 我的解法

```cpp
class Solution {
public:
    bool canConstruct(string ransomNote, string magazine){
        unordered_map<char, int> umap;
        for(int i=0; i< magazine.length(); i++){
            umap[magazine[i]]++;
        }

        //Iterate through the ranSomNote for checking if it can construct by magazines
        for(char ch: ransomNote){
            if(umap[ch] == 0) return false;
            umap[ch]--;
        }
        return true;
    }
};
```

首先就是透過 `unordered_map<char, int> umap` 建構 HashTable，如果 `magazine` 為 `aabbccc` 則對應的 hash table 會如下:

```
{
    "a": 2,
    "b": 2,
    "c": 3
}
```

接著就是迭代來去看 `ransomNote` 中的字元是否匹配 `magazine`，如果 `umap[ch]==0` 這就代表沒找到對應的 key，這時就回傳 `false`。如果有找到 Key 就將對應的出現數量減少1，並繼續檢查。

> 在 `unordered_map` 中，如果對應的 Key 不存在，會自動初始化為 0，因此可以直接用 0 來去判斷Key是否存在

一旦迴圈結束後都沒找到 `false` 則回傳 `true`

### 執行結果

![](/img/LeetCode/383/result.jpeg)

# 複雜度

## 時間複雜度

在建構 Hash Table 的部分會去遍歷 `magazine` 的每個字元，並且插入 `unordered_map` 或更新字母出現數量，這些操作都是 $O(1)$，假設 `magazine` 長度為 $m$，則這段迴圈的複雜度為 $O(m)$

在比對 `ransomNote` 中字元的部分，也是透過迴圈去遍歷，每一次迴圈會去檢查對應字元是否存在於 `unordered_map` 中，如果有就更新 `unordered_map`中的字母出現頻率，這操作也會是 $O(1)$，因此這段程式碼的複雜度會是 $O(n)$，其中 $n$ 為 `ransomNote` 的長度。

因此整體時間複雜度會是 $O(m+n)$

## 空間複雜度

主要由 `unordered_map` 的大小決定，他負責儲存 `magazine` 中出現的字母以及出現頻率因此複雜度為 $O(K)$，其中 $K$ 為不同字元的數量，但題目限制只會出現小寫英文，那就可以視為 $O(1)$，因為只有26個字母。