---
title: 有效的括號 | Easy |LeetCode#20. Valid Parentheses
tags:
  - Stack
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/20/cover.jpg
abbrlink: 92b56b8e
date: 2024-06-28 16:16:56
---


# 題目敘述

![](/img/LeetCode/20/question.png)

- 題目難度: `Easy`
- 題目敘述: 給定一個字串 `s`，其中僅會包含 `(`、`)`、`[`、`]`、`{`、`}` 這些括號，需要在函式內判斷字串內的括號組合是否是合法得的，那怎樣算合法?
    1.  左括號一定要由相同類型的右括號閉合
    2.  括號閉合順序要正確
    3.  每個右括號也需要有相同類型的左括號閉合

舉例來說:

Valid:
```
s= "()[]{}"
s= "([])"
s= "[]"
```

Invalid:
```
s = "([)]"
s = "(]"
```


# 解法


## 一開始的想法

>　我的想法就是在迭代字串中字元的時候，將所有左括號 push 進一個stack，如果下一個字元是相應的右括號，就將括號從 stack 中pop出來，只要最後檢查stack是否還有左括號在，就能判斷是否valid。當然還是有一些edge case需要處理


## 我的解法

```cpp
class Solution {
public:
    bool isValid(string s) {
        stack<char> sk;
        //check empty string
        if(s == "") {return false;};
        // iterate over the string
        for(char c: s){
            if(c == '(' || c == '[' || c == '{'){
                sk.push(c);
            }
            else if (c == ')'){
                if(!sk.empty()){
                    if ( sk.top()=='('){
                        sk.pop();
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return false;
                }
            }
            else if (c == ']'){
                if(!sk.empty()){
                    if ( sk.top()=='['){
                        sk.pop();
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return false;
                }
            }
            else if (c == '}'){
                if(!sk.empty()){
                    if ( sk.top()=='{'){
                        sk.pop();
                    }
                    else{
                        return false;
                    }
                }
                else{
                    return false;
                }
            }
        }
        if(sk.empty()){
            return true;
        }
        else{
            return false;
        }
    }
};
```

### 說明
- 初始化一個 char type 的stack
- 首先判斷是否是空字串，如果字串是空的，直接回傳false
- 接著透過一個 for 迴圈來迭代字元，如果遇到任意左括號像是 `[`、`(`、 `{` 則將其 push到 stack中
- 接著個別處理各種右括號的狀況，如果遇見 `)`，則先判斷是否 stack為空，如果為空直接回傳 false
- 如果 stack 中的頂端元素為相對應的 `(`，則將stack元素，pop出來，如果不是 `(` 則回傳false
- 其餘兩類的括號也是同樣處理
- 迴圈結束後，檢查stack是否為空，如果是空的那就代表字串是valid，反之則invalid

### 執行結果

![](/img/LeetCode/20/results1.png)


### 完整本地測試程式碼

```cpp
#include <iostream>
#include <stack>
using namespace std;

bool isValid(string s){
    stack<char> sk;
    if(s == "") {return false;};
    // iterate over the string
    for(char c: s){
        if(c == '(' || c == '[' || c == '{'){
            sk.push(c);
        }
        else if (c == ')'){
            if(!sk.empty()){
                if ( sk.top()=='('){
                    sk.pop();
                }
                else{
                    return false;
                }
            }
            else{
                return false;
            }
        }
        else if (c == ']'){
            if(!sk.empty()){
                if ( sk.top()=='['){
                    sk.pop();
                }
                else{
                    return false;
                }
            }
            else{
                return false;
            }
        }
        else if (c == '}'){
            if(!sk.empty()){
                if ( sk.top()=='{'){
                    sk.pop();
                }
                else{
                    return false;
                }
            }
            else{
                return false;
            }
        }
    }
    if(sk.empty()){
        return true;
    }
    else{
        return false;
    }
}

int main(){
    string str="";
    cout << "Is it valid?: " << isValid(str) << endl;
    return 0;
}
```


# 複雜度分析

## 時間複雜度

- 遍歷字串：程式碼遍歷整個輸入字串 s，這是一個線性操作，時間複雜度為 $O(N)$，其中 $N$ 是字串的長度
- 堆疊操作：在遍歷過程中，對堆疊進行的操作（push 和 pop）均是常數時間操作，時間複雜度為 $O(1)$
綜合來看，整體時間複雜度為：$O(N)$

## 空間複雜度

程式碼中使用了一個堆疊來儲存左括號，堆疊的空間複雜度取決於未匹配的左括號數量，最壞狀況就是所有的括號都會被壓入棧中

這樣的話，空間複雜度將是 $O(N)$，$N$為括號數量，其餘變數都是常數別操作，因此整體空間複雜度會是 $O(N)$
