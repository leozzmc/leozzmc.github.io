---
title: 括號的最大嵌套深度 | Easy |LeetCode#1614. Maximum Nesting Depth of the Parentheses
tags:
  - Stack
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/1614/cover.jpg
abbrlink: 31bdd3b4
date: 2024-07-03 15:05:37
---

# 題目敘述

![](/img/LeetCode/1614/question.jpeg)

**Constraints:**

- 1 <= s.length <= 100
- s consists of digits 0-9 and characters '+', '-', '*', '/', '(', and ')'.
- It is guaranteed that parentheses expression s is a VPS.

- 題目難度: `Easy`
- 題目敘述: 給定一個有效的括號字串 `s`，回傳括號nesting的深度

> 這裡有效的意思就代表不會有類似這種字串出現 `)()()(())(`，一定會是閉合成對的括號


# 解法

## 一開始的想法

> 這題很簡單，從想解法(畫在平板上)到最後Submission Accept花了11分鐘。

首先要想的問題會是: **如何判斷nesting parentheses?** 我認為只要有連續的左邊未閉合括號出現，就能夠判斷出nesting深度。因此要做的事情就是當出現左括號 `(` 就 push 進 stack，當出現右括號就 pop出stack，這些操作進行的同時記錄下stack的數量變化，最大值即為深度。

![](/img/LeetCode/1614/algo.png)

## 我的解法

```cpp
class Solution {
public:
    int maxDepth(string s) {
        stack<char> sk;
        int counter = 0;
        int maxDepth = 0;
        for (char c: s){
            if(c == '('){
                sk.push(c);
                counter++;
                if(counter >= maxDepth) maxDepth = counter; 
            }
            else if(c == ')'){ // valid nested parentheses, so don't need to check if stack empty before pop()
                sk.pop();
                counter--;
            }
        }
        return maxDepth;
    }
};
```


### 說明

- 主要都跟上面想法一樣，透過一個整數變數`maxDepth` 來紀錄 `counter` 的變化
- 當 `counter` 值比當前 `maxDepth` 還要大時，更新 maxDepth

### 執行結果
![](/img/LeetCode/1614/results1.jpeg)

### 完整本地測試程式碼

```cpp
# include <iostream>
# include <stack>
using namespace std;


int maxDepth(string s) {
    stack<char> sk;
    int counter = 0;
    int maxDepth = 0;
    for (char c: s){
        if(c == '('){
            sk.push(c);
            counter++;
            if(counter >= maxDepth) maxDepth = counter; 
        }
        else if(c == ')'){ // valid nested parentheses, so don't need to check if stack empty before pop()
            sk.pop();
            counter--;
        }
    }
    return maxDepth;
}

int main(){
    string s = "8*((1*(5+6))*(8/6))";
    cout << "Max Depth: " << maxDepth(s) << endl;

    return 0;
}
```

# 複雜度分析

## 時間複雜度

本題時間複雜度主要取決於對輸入字符串 `s` 的遍歷。使用了 for 迴圈來遍歷字串中的每一個字元，並對每個字元進行了常數時間的操作（push、pop、counter加減等）。因此操作會是 $O(n)$，其中 $n$ 是字符串的長度。

## 空間複雜度

空間複雜度主要取決於使用的Stack。最壞情況下，Stack中可能會包含所有的左括號 `(`，這樣的情況會發生在所有的開括號 `(` 都在字串的前半部分，而所有的右括號 `)` 都在字串的後半部分。此時，Stack的大小最多為 $n/2$，因此空間複雜度為 $O(n)$。

此外，使用了額外的變數 `counter` 和 `maxDepth`，它們的空間複雜度是 O(1)。

綜合來看空間複雜度為 $O(n)$