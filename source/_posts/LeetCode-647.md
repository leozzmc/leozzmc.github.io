---
title: 回文子字串 | Medium | 647. Palindromic Substrings
tags:
  - Dynamic Programming
  - Two Pointers
  - String
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 141899d4
date: 2024-11-14 15:28:19
cover: /img/LeetCode/647/cover.png
---

# 題目敘述

![](/img/LeetCode/647/question.jpeg)

- 題目難度： `Medium`
- 題目敘述： 給定字串 `s`，回傳 `s` 中有多少回文子字串，回文代表字串從前往後讀等於從後往前讀都是一樣的字串。

# 解法

## 一開始的想法

我的想法就是可以遞迴處理，每次可以讀取一段字串，之後用一個函數檢查是否是回文，如果是，就將字串加入結果列表，

```Ex
s = "abc"

a -> Check if palindromic
ab -> Check if palindromic
abc -> Check if palindromic
ac -> Check if palindromic
b -> Check if palindromic
bc -> Check if palindromic
c -> Check if palindromic

list = [a,b,c]
return list.size()

```

但後續發現會有大量重複計算的問題，很容易會超時，因此改變成其他做法

## 我的解答

### 錯誤做法


```cpp
vector<vector<int>> dp;
bool checkPalindrome(string s, int left, int right){
    if(dp[left][right] != -1) return dp[left][right];

    while(left < right){
        if(s[left] != s[right]){
            dp[left][right] =0;
            return false;
        }
        left++;
        right--;
    }
    dp[left][right] = 1;
    return true;
}   

int subStringHelper(string s, int start){
    
    int count=0;

    for(int i=start; i<s.length(); i++){
        if(checkPalindrome(s, start, i)){
            count++;
            count += subStringHelper(s, i+1);
        }
    }
    return count;
}

int countSubstrings(string s){
    dp = vector<vector<int>>(s.length(), vector<int>(s.length(),-1));
    return subStringHelper(s, 0);
}
```

首先這裡分成三個函數，一個是題目給的 `countSubstrings`，另外一個是主要的遞迴邏輯 `subStringHelper` ，接著會是檢查回文的函數 `checkPalindrome`。那為了儲存重複計算的值，這裡宣告了一個二維陣列 `dp`，`dp[i][j]` 代表字串從 `s[i]` 到 `s[j]` 之間是否為回文，如果是回文那就會存放 `1` 如果不是回文就會是 `0`，如果還沒有檢查過那就是 `-1`

首先在 `countSubstrings` 中初始化 `dp` 為 `-1`，接著由 `subStringHelper` 負責遞迴邏輯，在每次遞回中，會去用迴圈迭代字串 `s` 並給定不同的起始點，然後呼叫 `checkPalindrome` 來確認是否為回文，如果是回文，就將 `count` 值加一，並且指定下一個字串起始點，遞迴呼叫 `subStringHelper`，遞迴呼叫的結果會就代表後續一共有多少回文子字串，會跟當前的子字串數量加總 `count += subStringHelper(s, i+1)` 最後回傳 `count`。

判斷是否為回文的函數 `checkPalindrome` 首先如果 `dp[left][right] != -1` 就代表已經檢查過該範圍的子字串了，因此直接回傳結果。而如果還沒有檢查過，那就會進行檢查，檢查方式會是透過 Two Pointer  的方式從字串前後反向依序檢查每個字元是否一樣，如果出現不一樣的就馬上回傳 `false`，檢查完畢後都沒問題那就代表是回文，則 `dp[left][right]` 為 `1`。

> 但這種做法會有問題，問題出在於遞迴方式的重複計算。每次遞迴計算 `subStringHelper(s, i+1)` 時，會將先前已計算的迴文子字串數量重複累加，導致最終的計數超過期望值。 所以如果要避免遞迴累加必須確保每個子字串的是否迴文只被計算一次

### 正確做法

```cpp
class Solution {
public:
    vector<vector<int>> dp;
    bool checkPalindrome(string s, int left, int right){
        if(dp[left][right] != -1) return dp[left][right];

        while(left < right){
            if(s[left] != s[right]){
                dp[left][right] =0;
                return false;
            }
            left++;
            right--;００
        }
        dp[left][right] = 1;
        return true;
    }   
    int subStringHelper(string &s){
        int n = s.length();
        int count=0;
        dp = vector<vector<int>>(n, vector<int>(n, -1));

        for(int i=0; i<n; i++){
            for(int j=i; j<n;j++){
                if(checkPalindrome(s,i,j)){
                    count++;
                }
            }
        }
        return count;
    }
     int countSubstrings(string s){
        return subStringHelper(s);
    }
};
```

這裡變更了 `subStringHelper` 中對於子字串的切分，這裡透過雙重迴圈的方式來給定子字串範圍


### 執行結果

![](/img/LeetCode/647/result.jpeg)

> 但透過雙重迴圈就是會犧牲時間複雜度，這樣的複雜度應該是很難被面試官接受的。

## 最佳化解答

```cpp

class Solution {
public:
    int checkPalindrome(const string& s, int left, int right){
        int count=0;
        while( left>=0 && right < s.length() && s[left]==s[right]){
            left--;
            right++;
            count++;
        }
        return count;
    }
    int countSubstrings(string s){
        int result=0;
        for(int i=0; i< s.length(); i++){
            int even = checkPalindrome(s, i, i+1);
            int odd = checkPalindrome(s, i,i);
            result += even + odd;
        }
        return result;
    }

};
```

這是在解答區中看到的很棒的做法，他判斷回文的方式是從中間開始，分別由左和右往外比對字元是否一樣 `s[left]` 是否能等於 `s[right]`，而這樣就要分成兩種狀況，分別是奇數長度的 `s` 或是偶數字串的 `s`。由於偶數字串沒有最中間的字元，需要透過迴圈來查找到第一個左右相鄰字元一樣的位置，即為偶數字串的中間。而奇數節點就好解決了，找到，它的中間值可以是任意字元，畢竟自己等於自己也算是回文，因此就一樣在迴圈中迭代每字元來去判斷，由該字元向左或向右擴展的子字串是否為回文。

而一旦有滿足條件的回文就會讓 `count` 加一，之後回傳結果，並會將結果加入到 `result` 中。

![](/img/LeetCode/647/string.png)

### 執行結果

![](/img/LeetCode/647/result2.jpeg)

# 複雜度

## 時間複雜度

原先的做法：$O(N^3)$: 主函數是雙重迴圈，因此時間複雜度會是 $O(N^2)$，而在檢查回文函數的地方，需要比較不同範圍的子字串 `s[i]` 到 `s[j]`，因此可能會比較到 $\frac{j-i+1}{2}$，平均來看也會是 $O(N)$，因此整體時間複雜度會是 $O(N^3)$

解答區做法： $O(N^2)$： 主函數就從 0 掃到 `s.length()`，因此是 $O(N)$,而檢查回文函數，最壞狀況可能會檢查到整個字串，因此也是 $O(N)$，所以整體會是 $O(N^2)$

## 空間複雜度

原先的做法： 使用了額外的儲存空間 `dp` 為 $N \times N$ 大小的矩陣，因此為 $O(N^2)$


解答區做法：僅使用常數空間變數，因此為 $O(1)$