---
title: 有效的 Anagram | Easy |LeetCode#242 Valid Anagram
toc: true
tags:
  - Hash Table
  - LeetCode
  - Easy
  - 'C++'
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/242/cover.jpg
abbrlink: 33d7b700
date: 2024-06-19 22:50:40
---

# 題目敘述

![](/img/LeetCode/242/question.png)

- 題目難度: `Easy`
- 題目敘述: 題目要求給定兩個字串 `s` 與 `t`，若 `t` 為 `s` 的 Anagram，則回傳 true，若不是則回傳 false

> Anagram 代表兩個單字裡面組成的字母和數量是完全一樣的，簡單來說 Anagram 就是由A單字重新排列組合成一個B單字。

# 解法

## 一開始的想法

這次的想法一樣是建立 HashTable，所以一開始的想法如下:
- 迭代 `s`，建立 HashTable
- 迭代 `t`，依序檢查字母是否有出現在 HashTable，進行比對
- 迭代完畢後，若全部匹配則回傳True
- 若無則否

## 我的解法

```cpp
class Solution {
public:
    bool isAnagram(string s, string t) {
        //character, times
        unordered_map<char, int> Dict;

        if (s.length() != t.length()) {
            // If the lengths are different, they cannot be anagrams
            return false;
        }

        // Build the dictionary
        for(int i=0; i< s.length(); i++){
            Dict[s[i]]++;
        }

        for (int i=0; i<t.length(); i++){
            // Match
            if (Dict.find(t[i]) != Dict.end()){
                Dict[t[i]]--;
                if(Dict[t[i]] == 0){
                    Dict.erase(t[i]);
                }
            }
            else{  //Not match
                return false;
            }
        }
        
        if(!Dict.empty()){
            return false;
        }
        else{
            return true;
        }

    }
};
```

### 說明

- 首先透過 `unordered_map` 建立了一個 Hash table
- 若 `s` 與 `t` 長度不一致，可以提前回傳　`false`
- 迭代 `ｓ`　建立 Hash table，並且 Key 會是 `s` 中出現的字母，value 會是出現次數
- 迭代 `t`，透過在 `Dict.find()` 中迭代 `t` 的字母，查看是否對應的 key 存在於 Hash Table 中
- 如果有，則該字母的對應將次數減少 (`Dict[t[i]]--;`)
- 如果已經減到0次，則將該key-value pair 從 Table 中移除
- 如果在 table 中沒找到 `t` 中的字母，則回傳　`false`
- 最後若 table 不是空的，就代表t沒有完全匹配`s`，則一樣回傳 `false`，反之則回傳 `true`

### 執行結果

![](/img/LeetCode/242/results1.png)

## 其他做法

```cpp
class Solution {
public:
    bool isAnagram(string s, string t) {
    
        if (s.length() != t.length()) {
            return false;
        }

        // A count vector with length 26 with init value 0
        // Count only lowercase letters 
        vector<int> count(26,0);

        //build dictionary
        for (int i=0; i< s.length(); i++){
            count[s[i] - 'a']++;
        }

        for(int i=0; i < t.length(); i++){
            count[t[i]-'a']--;
        }

        for(auto it=count.begin(); it!=count.end(); it++){
            if(*it != 0){
                return false;
            }
        }
        return true;
    }
};
```

- 這裡與剛剛不同的是，這裡只宣告了一個 vector，大小為26，用來存放每個小寫字母的出現頻率，並且初始化為0
- 在迭代 s 的過程中，這裡會 `s[i] - 'a'` 會先計算出字母索引，在vector中再++ (`count[s[i] - 'a']++;`)
- 在迭代 t 的過程中，會直接找對應的字母編號，並且將數量減1
- 最後，透過迭代器去迭代 vector，如果找到非0的數值，則代表 `t` 不是 `s` 的 Anagram，回傳 false


### 執行結果

![](/img/LeetCode/242/results2.png)

# 複雜度分析

## 時間複雜度

兩種做法都是 $O(n)$

## 空間複雜度

對於第一種我的做法，因為使用了 `unordered_map` 來存儲每個字元及其出現的次數。在最壞情況下，字串 s 中所有字元都是唯一的，因此字典的大小為 $O(k)$ 其中 $k$ 會是字元集大小，對於ASCII符號，k=128，對於英文小寫字母，k=26

> 整體空間複雜度會是 $O(k)$，因為字典的大小與字符集的大小有關，並且在字串長度 $n$ 遠大於字符集大小 $k$ 時，可以認為空間複雜度是常數 $O(1)$

第二種做法，`vector<int> count(26, 0);` vector 大小固定為 $O(1)$，因此為常數空間，複雜度為 $O(1)$
