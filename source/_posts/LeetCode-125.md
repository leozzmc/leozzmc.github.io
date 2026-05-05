---
title: 有效回文 | Easy | LeetCode#125. Valid Palindrome
tags:
  - Two Pointers
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 7abe6380
date: 2024-07-11 18:15:24
cover: /img/LeetCode/125/cover.jpg
---

# 題目敘述

![](/img/LeetCode/125/question.jpeg)

![](/img/LeetCode/125/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 題目給定字串 `s`，當你把字串中的大寫字母轉換成小寫字母，並且把所有非字母或數字類的符號去除，如果從頭讀到尾跟從尾讀到頭都是一樣的字串，那就是一個有效的 **回文(Palindrome)** ，若回文有效就返回 true，反之則 false，`s` 僅包含ASCII當中可印出的符號。


# 解法

## 一開始的想法

- 先將題目字串 `s` 中的大寫字母轉為小寫，並且將其餘符號去除
- 這部分可以宣告一個新的空字串，並且分別處理數字、大寫字母以及小寫字母
- 接著就是判斷回文，可透過迴圈同時檢查字串的頭跟尾是否一樣，若有發現不一致則回傳false，反之則True
- 頭尾pointer僅需scan到字串的中間即可

## 我的解法

```cpp
class Solution {
public:
    bool isPalindrome(string s) {
        bool isPalindrome = false;
        string tempStr="";
        if(s.size()==1) return true;
        for(char c:s){
            if(c >= 48 && c<=57){
                tempStr+=c;
            }
            else if(c>= 65 && c<=90){
                tempStr+=c+32;
            }
            else if(c>=97 && c<=122){
                tempStr+=c;
                
            }
        }
        if(tempStr == "" ) return true;
        int length=0;
        if (tempStr.size() %2 != 0){
            length = ((int)tempStr.size()/2)+1;
        }
        else{
            length = ((int)tempStr.size()/2);
        }
        for(int i=0; i<length;i++){
            if (tempStr[i]!=tempStr[tempStr.size()-i-1]){
                return false;
            }
            else{
                isPalindrome = true;
            }
        }
        return isPalindrome;
    }
};
```

可以參考 Ascii Table

![](/img/LeetCode/125/ascii.png)


### 執行結果
![](/img/LeetCode/125/result.jpeg)


# 複雜度

## 時間複雜度

- 首先在遍歷跟轉換字串的迴圈，複雜度為 $O(n)$，$n$ 為字串數量
- 接下來 two pointer 檢查回文的地方，複雜度為 $O(m/2)$，worst case 會是 $m=n$
- 整體時間複雜度會是 $O(n)+O(m/2) = O(n)$

## 空間複雜度

- 程式碼中建立了一個新的字串 `tempStr`，其最壞情況下的長度為 n。因此，這段程式碼的空間複雜度是 $O(n)$
- `isPalindrome ` 和 `length` 這些變數只佔用常數空間，因此其空間複雜度是 $O(1)$
