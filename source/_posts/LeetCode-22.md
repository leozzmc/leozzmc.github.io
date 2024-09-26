---
title: 產生括號 | Medium | LeetCode#22. Generate Parentheses
tags:
  - backtracking
  - combinations
  - parentheses
  - recursive
  - LeetCode
  - Medium
  - C++
date: 2024-09-26 22:40:28
cover:
---

# 題目敘述

![](/img/LeetCode/22/question.png)

- 題目難度: `Medium`
- 題目敘述: 給定 `n` 組括號，請產生所有可能的閉合括號的組合

{% note info %}
反正就是沒有 `(()` 或者是 `)()` 類似這樣的組合
{% endnote %}

# 解法

## 一開始的想法


這題求組合的所有可能性，所以想法上一定還是 backtracking，但今天的問題會是要怎麼樣 **控制括號能夠閉合**，以 backtracking 的解題架構來看，首先可以思考退回條件會是一旦每個組合中的長度到達了 `2 * n` 因為 **會是 `n` 組括號**，另外每一層中在選一定要先選左括號再選右括號，因此需要判斷當前右括號數量是否小於左括號，如果小於就代表一定至少有一組括號還沒閉合完畢。


## 我的解法

```cpp
class Solution {
public:
    vector<string> parentheseList;
    void generateParentheseshelper(int left, int right, vector<string> &parenthese, string current, int n){
        if(current.length() == 2* n ){
            parenthese.push_back(current);
            return;
        }
        
        if(left < n){
            generateParentheseshelper(left+1, right, parenthese, current +"(", n);
        }
        
        if(right < left){
            generateParentheseshelper(left,right+1 ,parenthese,current +")", n);
        }
    }

    vector<string> generateParenthesis(int n){
        string temp="";
        generateParentheseshelper(0,0, parentheseList, temp, n);
        return parentheseList;
    }
};
```

### 執行結果

# 複雜度

## 時間複雜度

## 空間複雜度