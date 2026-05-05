---
title: 簡化路徑 | Medium | LeetCode#71. Simplify Path
toc: true
tags:
  - Stack
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 59f3a7b5
date: 2024-07-07 14:22:35
cover: /img/LeetCode/71/cover.jpg
---

# 題目敘述

![](/img/LeetCode/71/question1.jpeg)
![](/img/LeetCode/71/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 題目會給定一個 Unix 系統的檔案路徑字串，這題需要簡化路徑，並輸出簡化後的路徑字串。簡化路徑有下面幾項規則:
  - 字串始終由 `/` 開始
  - 路徑中的目錄僅可由一個 `/` 分隔開
  - 除了 Root Dir 之外，不可由 `/` 作為字串結尾
  - 輸出需要排除 `.` 或者 `..`

在 Unix 系統中 `.` 代表當前目錄，可忽略，`..` 代表跳到上一層目錄，舉例來說 `/home/kevin/../LeetCode` = `/home/LeetCode`  

# 解法

## 一開始的想法
- 獲取 `/` 與 `/` 中間的字串(即目錄)，如果滿足規則就 push 進 stack 中
- 如果 `/`與 `/` 中間會是 `.` 則跳過，如果是 `..` 則將stack中元素 pop 出來
- 其餘的通通 push 到 stack 當中
- 之後就是依序將 stack 元素 pop 出來並串接在回傳字串當中
  
## 我的解法

```cpp
class Solution {
public:
    string simplifyPath(string path) {
        string output="";
        stack<string> sk;
        
        for(int i=0; i<path.size();i++){
            if(path[i]=='/'){
                continue;
            }
            string temp="";
            while(i<path.size() && path[i] != '/'){
            temp += path[i];
            ++i;
            }
            if(temp=="."){
                continue;
            }
            else if(temp==".."){
                if(!sk.empty()){
                    sk.pop();    
                }
            }
            else{
                sk.push(temp);
            }
        }
        
        while(!sk.empty()){
            output = '/'+sk.top() + output;
            sk.pop();
        }
        
        if(output.size() == 0){
            return "/";
        }
        return output;
    }
};

```

### 說明

- 初始化變數
- 遇到 `/` 直接跳過
- 使用 `temp` 來記錄目錄名稱直到遇到下一個 `/`
- 如果 `temp` 會是 `.` ，代表當前目錄，直接跳過
- 如果 `temp` 會是 `..` ，代表上一層目錄，若 stack 非空，則直接將 stack 頂端元素 pop出來
- 其他狀況都將 `temp` push 到 stack 中
- 之後依序將 stack 元素加到 `output` 中
- 單獨處理簡化後只剩下 Root Dir的狀況

### 執行結果

![](/img/LeetCode/71/results.jpeg)

# 複雜度分析

## 時間複雜度
- Traverse輸入字串: $o(n)$, n為字串長度
- push, pop: $O(1)$
- 建構輸出: $o(m)$, m為stack中元素數量
整體而言會是 $O(n)$
## 空間複雜度

- 在最壞情況下，如果所有的 `temp` 都是有效的路徑段落，stack中會存儲 n 個段落。因此，stack的空間複雜度是 $O(n)$
- 最終輸出的字串 `output` 也會最多包含 n 個字元，因此它的空間複雜度是 $O(n)$
- 整段程式碼的空間複雜度是 $O(n)$