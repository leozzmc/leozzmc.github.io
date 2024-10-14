---
title: 字詞模式 | Easy | LeetCode#290. Word Pattern
toc: true
tags:
  - String
  - Hash Table
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 14d09d4a
date: 2024-10-14 14:46:49
cover: /img/LeetCode/290/cover.jpg
---

# 題目敘述

![](/img/LeetCode/290/question1.jpeg)

![](/img/LeetCode/290/question2.jpeg)

- 題目難度: `Easy`
- 題目描述: 給定字串 `pattern` 以及 字串 `s`，檢查 `s` 是否遵循相同模式

題目有說明這裡 **相同模式** 的意思: **`pattern` 中的任一字元與 `s` 中的非空字串完全匹配的 1對1映射關係**，具體來說規則如下:

{% note info %}
- 在 `pattern` 中的每個字母，都有明確的對應到 `s` 中的 unique 字串
- 在 `s` 中的 unique 字串，明確對應到 `pattern` 中的一個字母
- 沒有兩個字母映射到同一個單詞，也沒有兩個單詞映射到同一個字母
{% endnote %}


# 解法

## 一開始的想法

這裡想法很單純就是透過 Hash Table 來去建立並儲存映射關係。而在建立過程中可以去檢查當前的字母和對應字串是否已經存在映射關係於 hash table 中，如果有救回傳 `false`，如果整個 hash table都建立好後都沒有重複的映射關係那就回傳 `true`。

## 我的解法

```cpp
class Solution {
public:
    bool wordPattern(string pattern, string s){
    
        unordered_map<char, string> umap;
        unordered_map<string, char> umap2;
        vector<string> s_list;
        istringstream iss(s);
        string word="";
        while(iss >> word){
            s_list.push_back(word);
        }
        
        if(pattern.size()!= s_list.size()) return false;
        for(int i=0; i< pattern.size(); i++){
            char str = pattern[i];
            string s_word = s_list[i];
            if(umap.find(str)!=umap.end()){
                // find key - str  Ex. "a"
                if(umap[str]!= s_word){
                    return false;
                }
            }
            else umap[str] = s_word;
            
            
            if(umap2.find(s_word)!=umap2.end()){
                if(umap2[s_word]!= str) return false;
            }
            else umap2[s_word] = str;
            
        }
        return true;
    }
};
```
我們宣告了兩個 `unordered_map` 分別用於存放 **pattern -> s** 以及 **s -> pattern** 的映射關係:

```cpp
unordered_map<char, string> umap;
unordered_map<string, char> umap2;
```

接著，需要將字串 `s` 儲存成陣列，這裡透過 `std::istringstream` 來去依序分割 `s` 並存放到陣列 `s_list` 中，

{% note info %}
若要使用 `std::istringstream`，需要引入標頭 `#include <sstream>`，宣告方式如下:
```
istringstream iss(s);
```
之後透過 while 迴圈以及運算子 `>>` 就可以將字串導向到宣告來存放子字串的變數中進行處理
{% endnote %}

接著就是在 `pattern` 中，依序建構 hash table:
```cpp
char str = pattern[i];
string s_word = s_list[i];
if(umap.find(str)!=umap.end()){
    // find key - str  Ex. "a"
    if(umap[str]!= s_word){
        return false;
    }
}
else umap[str] = s_word;
```

一旦沒有在 `umap` 中找到當前 `pattern` 中的字母 (Ex. `a`) 則建立對應關係

```
{'a': "dog"}
```

而如果有找到，則需要檢查以　`a` 為 Key 的對應 Value 是否為當前的 `s_word`，如果不等於，那就回傳 `false`，例如

```
{'a': "dog"}

FIND: A, but S_WORD: cat -> False
```

一旦檢查完成後，也就代表 `pattern` 映射到 `s` 的關係沒問題。接著就需要檢查 `s` 到 `pattern` 的映射關係

```cpp
if(umap2.find(s_word)!=umap2.end()){
    if(umap2[s_word]!= str) return false;
}
else umap2[s_word] = str;
```

同上，一旦沒有在 `uamp2` 中找到當前 `s_word` 中的字串 (Ex. `dog`) 則建立對應關係

```
{"dog": a}
```
而如果有找到，則需要檢查以　`dog` 為 Key 的對應 Value 是否為當前的 `str` (`pattern[i]`)，如果不等於，那就回傳 `false`，例如

```
{'dog': "a"}

FIND: `dog`, but STR: `b` -> False
```

### 執行結果

![](/img/LeetCode/290/result.jpeg)

# 複雜度

## 時間複雜度
- 分割字串: $O(N)$， $N$ 為字串總長度
- 遍歷 `pattern`: $O(M)$， $m$ 為 `pattern` 長度，而在迴圈中插入 `unordered_map` 的操作為 $O(1)$

因此整體時間複雜度為 $O(N+M)$

## 空間複雜度
- `s_list`: 用於儲存分割的字串，其大小與 `s` 長度成正比，因此為 $O(N)$， $N$ 為字串總長度
- `umap` && `umap2`: 用於儲存對應關係，兩者儲存數量一樣，最多都會有 $M$ 組 key-value pairs，因此為 $O(M)$
因此整體空間複雜度為 $O(N+M)$

# 結語
做了這題才開始熟悉在 C++ 當中進行字串分割 (也就是 `istringstream` 的使用)