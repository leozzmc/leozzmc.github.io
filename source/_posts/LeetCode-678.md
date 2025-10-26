---
title: 合法括號字串 | Medium | LeetCode#678. Valid Parenthesis String
tags:
  - Greedy
  - String
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 85addf17
date: 2025-10-26 15:05:24
cover: /img/LeetCode/678/cover.png
---

# 題目敘述


![](/img/LeetCode/678/question.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給定一個字串 `s` 包含三種可能的字元: `(`, `)` 以及 `*`，若 `s` 為Valid 請回傳 `true` 否則為 `false`

下面是判斷 `s` 是否合法的規則:
- 任何 `(` 都需要有對應的 `)` 才能閉合
- 任何 `)` 都需要有對應的 `(` 才能閉合
- `(` 需要出現在 `)` 之前才可閉合
- `*` 可以代表 `(`. `)` 或者是空字串 `""` 

# 解法

這題跟單純的括號閉合題型不太一樣的是，多了一個變因 `*` ，它可能是左括號也可能是右括號，因此我們會需要追蹤這種可能性

## 我的解法


```c++
class Solution {
public:
    bool checkValidString(string s) {
        int leftMin = 0;
        int leftMax = 0;

        if(s.size()==1 && s[0]!='*') return false;

        for(char c: s){
        
            if(c == '('){
                leftMin++;
                leftMax++;
            }
            else if(c == ')'){
                leftMin--;
                leftMax--;
            }
            else{
                leftMax++;
                leftMin--;
            }
            
            if(leftMax <0) return false;
            if(leftMin < 0) leftMin = 0;
        }
        if(leftMin ==0) return true;
        return false;
    }
};
```

這裡需要兩個變數 `leftMin` 以及　`leftMax` 來 **追蹤還有剩餘多少左括號需要被匹配**，因為有 `*` 這個變因，因此才需要兩個變數分別追蹤最多可能有多少左括號要被匹配跟最少可能有多少左括號要被匹配。

可以迭代 `s` 然後每次檢查是否是左括號 `(` 如果是的話那 `leftMin` 跟 `leftMax` 同時增加，如果是 `)` 則 `leftMin` 跟 `leftMax` 同時減少，這代表可以確定有一組括號閉合了，因此剩餘需要匹配的左括號數量會減少。當字元等於 `*` 則代表他可能會是左括號或右括號，如果為左括號，那剩餘需要匹配的括號數量就會增加，因此 `leftMax` 增加一，而如果為右括號，則代表剩餘需要匹配的括號數量減少，因此最少需要匹配左括號的數量會變少，而最多需要匹配左括號的數量增加，因此 `leftMin--` 而 `leftMax++`。

然而只要迭代過程中發現最多需要匹配左括號的數量小於0，則代表沒有剩餘的左括號或者 `*` 了，因此會是 invalid 直接回傳 `false` 而字串 `s` 迭代完畢後如果最少需要匹配的左括號為 `0` 的話就代表字串是合法的，因為所有左括號都閉合了。否則就是非法的

### 執行結果

![](/img/LeetCode/678/result.png)

## 複雜度
時間複雜度: $O(n)$
空間複雜度: $O(1)$