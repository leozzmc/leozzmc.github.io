---
title: 計算逆波蘭表示法 | Medium | LeetCode#150. Evaluate Reverse Polish Notation
tags:
  - Stack
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 49a7f4a8
date: 2024-07-08 22:25:55
cover: /img/LeetCode/150/cover.jpg
---

# 題目敘述

![](/img/LeetCode/150/question1.jpeg)
![](/img/LeetCode/150/question2.jpeg)

- 題目難度: `Easy`
- 題目描述: 本題要求給定一個字串陣列 `tokens`，當中是以**[逆波蘭表示法](https://zh.wikipedia.org/wiki/%E9%80%86%E6%B3%A2%E5%85%B0%E8%A1%A8%E7%A4%BA%E6%B3%95)**的算式運算式，需要回傳算術運算的結果，結果為整數型態。

注意:
- 有效的運算子只會有: `+`, `-`, `*`,`/`。
- Operand 都會是整數
- 除法採無條件捨去法
- 不可除以0
- 中間運算的數字會是 32-bit 整數


# 解法

## 一開始的想法

如果看上面的範例 `["4","13","5","/","+"]`，可以看出，如果碰到operator，碰到operator前的兩個數字就會透過該operator進行運算。

因此我的想法是:
1. 建立一個stack
2. 迭代 `tokens` 若遇到數字就push進stack
3. 若遇到運算子，則將兩個元素pop出來進行四則運算
4. 運算結果丟回 stack
5. 迭代完畢後回傳 stacK 頂端元素

## 我的解法

```cpp
class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        stack<int> sk;
        for (int i = 0; i < tokens.size(); ++i) {
            string token = tokens[i];
            if (token == "+" || token == "-" || token == "*" || token == "/") {
                int arg2 = sk.top(); sk.pop();
                int arg1 = sk.top(); sk.pop();
                if (token == "+") sk.push(arg1 + arg2);
                else if (token == "-") sk.push(arg1 - arg2);
                else if (token == "*") sk.push(arg1 * arg2);
                else if (token == "/") sk.push(floor(arg1 / arg2));
            } else {
                sk.push(stoi(token));  // Use stoi to convert string to int
            }
        }
        return sk.top();
    }
};
```


### 說明

- 這裡宣告的 stack 是 `int` type 的，所以在push的時候要注意 type的轉換，這裡用<string> 當中的 `stoi` 函數將字串轉換成整數。
- 另外還要注意，pop出來的第一個元素會是在operator後面，也就是如過現在是除法，那要pop出來的元素就會是分子，所以順序要注意

### 執行結果

![](/img/LeetCode/150/result.jpeg)

# 複雜度

## 時間複雜度

時間複雜度：$O(n)$，其中 n 是輸入tokens的數量。

## 空間複雜度

空間複雜度：$O(n)$，其中 n 是輸入tokens的數量。

# 結語

這次紙上先寫出演算法大概花7分鐘，實際寫大概20min AC，還是有待加強。

> Note: 字串轉數字:`stoi()`，數字轉字串: `to_string()`