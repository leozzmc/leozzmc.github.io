---
title: 電話號碼的字母組合 | Medium | LeetCode#17. Letter Combinations of a Phone Number
tags:
  - backtracking
  - combinations
  - hash table
  - recursive
  - LeetCode
  - Medium
  - C++
abbrlink: aeee38d
date: 2024-09-28 22:24:08
cover: /img/LeetCode/17/cover.jpg
---


# 題目敘述

![](/img/LeetCode/17/question.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給定一個包含由數字 `2-9` 組成的連續字串 `digits`， 回傳所有可能的字母組合，回傳的組合不限順序。

{% note info %}
這裡的字母可能對應到的就是題目給的電話號碼圖片，數字 `1` 跟 `0` 沒有對應的字母
{% endnote %}

# 解法

## 一開始的想法

提到 **所有可能的組合數** 這種問題就會想到 backtracking，由於題目中的電話號碼數字跟字母有對應關係，因此我的想法是，可以透過雜湊表來去保存這個mapping關係，接著再去進行組合。首先思考遞迴終止條件，**遞迴終止條件就是已經窮盡給定的 `digits` 中的數字。**

接著在每一層中，應該要去嘗試數字對應的每一種字母，要取出來放入字串變數中，而這裡還需要注意針對雜湊表的存取。取出後接著就是遞迴呼叫下一層，實現backtracking來窮盡各種組合。

![](/img/LeetCode/17/algo.png)

## 我的解法

```cpp
class Solution {
public:
    unordered_map<string, vector<string>> umap{
        {"2", {"a","b","c"}},
        {"3", {"d","e","f"}},
        {"4", {"g","h","i"}},
        {"5", {"j","k","l"}},
        {"6", {"m","n","o"}},
        {"7", {"p","q","r", "s"}},
        {"8", {"t","u", "v"}},
        {"9", {"w","x","y","z"}},
    };
    vector<string> result;
    void letterhelper(int depth, string current, string digits){
        if(depth == digits.length()){
            result.push_back(current);
            return;
        }
        string digit = string(1, digits[depth]);
    
        for(int i=0; i< umap[digit].size(); i++){
            letterhelper(depth+1, current+umap[digit][i], digits);
        }

    }
    vector<string> letterCombinations(string digits){
        if(digits.empty()) return result;
        letterhelper(0, "", digits);
        return result;
    }

};
```

我這裡首先透過 `unordered_map` STL 建立了hash table，名稱為 `umap`，記錄著電話號碼以及字母之間的關係。接著也宣告了一個用於回傳結果用的 `result`。 

參數說明:
- `int depth`: 用於紀錄當前深度
- `string current`: 用於保存當前組合
- `digits`: 用於傳遞題目給的數字字串

至於backtracking的邏輯，跟往常一樣透過一個 `void letterhelper` 函數來去進行，其中終止條件就是一旦當前深度到達題目給的 `digits` 長度，就將當前的組合 `current` 加入到回傳向量中。

接著 **要去迭代 hashtable 中不同數字對應到的字母組合**，但在這之前要注意 **由於`unordered_map` 僅接受以string宣告，不能用 `char`** ，但我們需要取出題目中的個別 **數字字元** (Ex. `2`) 所以下面透過 `string(1, digits[depth])`   來取獲取當前深度下的數字，並且將其轉換為長度為1的字串存成另一個變數 `digit`，這樣才有辦法對 `umap` 進行操作。

接著迭代不同字母組合，去遞迴呼叫 `letterhelper` 呼叫時給定的參數要讓 `depth` +1，傳遞給下一層，並且要讓 `current` 字串加入當前嘗試的字母。 一旦全部結果嘗試完畢後就回傳結果 `results`。

> `unordered_map` 的用法可以參考 [這篇](https://notes.boshkuo.com/docs/C++/STL/unordered_map)

### 執行結果

![](/img/LeetCode/17/result.jpeg)

# 複雜度

## 時間複雜度

對於遞迴函數 `letterhelper` 會根據數字對應的字母集合進行遞迴呼叫，每個數字大約對應 3-4 個字母，因此所有可能的組合數會是 $O(4^{n})$ 其中 $n$ 為 `digits` 的長度，而每個組合的生成也會進行字母拼接 `current+umap[digit][i]` 但這會是雜湊表的常數操作 $O(1)$。

所以每個遞迴深度的時間消耗是 $O(1)$ 但會重複 $O(4^{n})$ 次，因此整體的時間複雜度會是 $O(4^{n})$。

## 空間複雜度

`results` 用於儲存最終組合結果，空間大小取決於組合數量，最多會有 $O(4^{n})$ 組合，每個組合長度為 `n` 因此佔用空間為 $O(n \cdot 4^{n})$，而遞迴占用stack大小為 $O(n)$，因此整體空間複雜度會是 $O(n \cdot 4^{n})$。