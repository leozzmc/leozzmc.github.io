---
title: 回文分割 | Medium | LeetCode#131. Palindrome Partitioning
tags:
  - backtracking
  - recursion
  - Palindrome
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: a97a6fae
date: 2024-10-17 09:08:19
cover: /img/LeetCode/131/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/131/question.jpeg)

- 題目難度： `Medium`
- 題目敘述：給定字串 `s`，分割字串使其所有子字串都是 **回文(Palindrome)** ，並回傳所有可能的分割結果

{% note info %}
回文(Palindrome) 代表字串從左往右讀的結果跟從右往左讀的結果一樣。
{% endnote %}

# 解法

## 一開始的想法

這題的想法一樣會是 backtracking，主要會需要去分割每個字串，**意思是將不同字串組合加入到某個字串變數中，接著需要檢查該字串組合是否是回文，如果不是，那就繼續嘗試其他字串組合，如果是回文，那就將該字串組合添加到子陣列中**，並且進入下一層遞迴。  遞迴終止條件就是當前遞迴深度已經達到題目給的字串長度

> 到目前爲止的想法都蠻正確的，但這次主要會是在字串分割還有字串反轉，我其實還沒刷對應題目，因此要怎麼樣在Leetcode 中快速做到，是這題中學習的

## 我的解法

```cpp
class Solution {
public:
    vector<vector<string>> result;
    bool checkPalindrome(string str){
        string reverseStr = str;
        reverse(reverseStr.begin(), reverseStr.end());
        return str == reverseStr;   
    }
    void partitionhelper(string s, vector<string> subList, int depth){
        if(depth== s.length()){
            result.push_back(subList);
        }
        for(int i=depth; i<s.length(); i++){
            string cur = s.substr(depth, i-depth+1);
            if(checkPalindrome(cur)){
                subList.push_back(cur);
                partitionhelper(s, subList, i+1);
                subList.pop_back();
            } 
            cur = "";
        }
    }
    vector<vector<string>> partition(string s){
        if(s=="") return result;
        vector<string> sub;
        string temp_cur;
        partitionhelper(s,sub, 0);
        return result;
    }
};
```

這裡一共定義了三個 function，分別為 `partition`, `partitionhelper`, `checkPalindrome`，首先介紹 `partitionhelper`:

參數說明：
- `string s`: 用於傳遞原始字串
- `vector<string> subList`: 用於傳遞回傳陣列中的子陣列
- `int depth`: 記錄當前遞迴樹的深度

*遞迴終止條件*
首先遞迴終止條件會適當當前遞迴深度等同於字串長度，也就代表已經嘗試出其中一種組合了。


*每一層的判斷*
接著在每一層的判斷，要去分割出字串來嘗試組合。 這裡的 `for` 迴圈的初始值代表從字串分割處開始到字串結尾，進行各種可能的字串分割

```cpp
 for(int i=depth; i<s.length(); i++){
    string cur = s.substr(depth, i-depth+1);
    if(checkPalindrome(cur)){
        subList.push_back(cur);
        partitionhelper(s, subList, i+1);
        subList.pop_back();
    } 
    cur = "";
}
```

**其中 `substr` 為 `std::string` 當中的函數，可以用於切割字串，需要給定切割範圍，這裡的切割範圍指定為從 `depth` 切到 `i-depth+1`**，這個範圍能夠讓每次切割時，都從上一個切割處開始，並且從切個處的下一個位置依序嘗試組合到字串尾端，可以看下面的圖片來理解。

![](/img/LeetCode/131/string_parti.png)

當然我們在嘗試完組合後還需要透過一個函數來確認當前組合是否有回文存在，**這裡主要是透過 `std::string` 中的 `reverse` 來去對原始字串進行調換**，用法如下：

```cpp
string str = "abc";
reverse(str.begin(), str.end());
cout << str
// output: "cba"
```

因此這個函數會先將傳入字串存放到一個暫時的字串變數 `reverseStr` 中，接著對變數中的字串進行reverse，最後回傳比較結果，看反序字串是否跟正序字串一樣。

```cpp
 bool checkPalindrome(string str){
        string reverseStr = str;
        reverse(reverseStr.begin(), reverseStr.end());
        return str == reverseStr;   
}
```

如果為 `true` 那在 `partitionHelper` 函數中，就可以去將字串加入到子陣列中，並且嘗試下一層，記得在遞回傳入參數時，**要以當前分割處的下一個位置作為下一次嘗試的開頭**，所以 `depth` 參數要給與 `i+1`

如果下一次遞回退回，則需要將當子陣列的組合 pop 出來，並且嘗試其他字串組合

### 執行結果

![](/img/LeetCode/131/result.jpeg)


# 複雜度

## 時間複雜度

對於 `partiionHelper`來說，執行時間與組合數量成正比，可能的組合數量是 $2^N$，對於長度為 $N$ 的字串，每個字元都有選或不選兩種可能，因此時間複雜度為 $O(2^N)$，而對於 `checkpalindrome` 來說，會進行字串反轉，反轉得複雜度為 $O(K)$，$K$ 為傳入字串長度，最懷狀礦下 $N=K$

因此整體時間複雜度為  $N*2^N$

## 空間複雜度

遞回樹深度為 $N$，對於結果的儲存，一共可能有 $2^N$ 總組合數，另外 `subList` 的空間複雜度為 $O(N)$，因此整體空間複雜度為 $N* 2^N$ 