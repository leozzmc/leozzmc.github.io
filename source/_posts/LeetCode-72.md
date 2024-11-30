---
title: 編輯距離 | Medium | LeetCode72. Edit Distance
tags:
  - Dynamic Programming
  - Multidimensional DP
  - String
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 1dfdcfbe
date: 2024-11-30 16:53:24
cover: /img/LeetCode/72/cover.png
---


# 題目敘述

![](/img/LeetCode/72/question.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給定兩個字串 `word1` 和 `word2`，請回傳 **由 `word1` 轉換成 `word2` 所需的最少步驟數** ， 步驟有分三種，**分別是 1.插入字元 2. 刪除字元 3.取代字元**

# 解法

## 一開始的想法

這題我是參考了 [neetcode 的前半段影片](https://www.youtube.com/watch?v=XYi2-LPrwm4) 解釋題目，才比較有想法 (話說原來這題在兩年前是 HARD..)。其實想法上就是要去比較 `word1` 和 `word2` 的所有字元，逐一比較。如果一樣就換下一個，如果不一樣，則需要去比較三個操作何種會有最小的步驟數。

![](/img/LeetCode/72/algo.png)

- 如果是要插入，則步驟數加一，並且接下來需要將 `j+1` 而 `i` 不用動，因為 `i` 還是指向那個不匹配的字元，因此需要看 `word2` 後續字元是否能夠匹配
- 如果是刪除，則步驟數加一，並且 `j` 不動，但要看下一個 `word1` 字元能否跟當前的 `word2[j]` 匹配，因此 `i+1`
- 如果是取代，則步驟數加一，並且　`i` 跟 `j` 都加一，因為取代的話就是字元會相通，就可以換下一組子字元進行比較了

![](/img/LeetCode/72/q1.png)

問題可以被 model 成一個二維陣列，代表 `word1` 對應到 `word2` 的所需轉換步驟數，整體問題都可以切分成像是下圖這樣的子問題， **`abc` 對應到 `acb` 轉換所需最少步驟數會由 `bc` 對應到 `cb` 這個子問題貢獻出來** 

![](/img/LeetCode/72/q2.png)

接著，如果 `word1` 或 `word2` 為空字串， **則所需步驟數等同於對方長度**，因此陣列的最後一列和最後一行都會按照對方的長度依序減少。處理好 base case 後，實際在進行比較時，就是在比較陣列的行跟列，如果 `i,j` 相等，則 `i+1,j+1` 也就是移動到斜對角，如果不相等，則需要去比較三個操作何種會有最小的步驟數，選小的並且加一(代表選擇刪除、取代或插入，各都為一個步驟數)，選最小的接續下去。 如此跌代完畢後，最後 `[0][0]` 就會儲存我們整體所需的最小步驟數。

![](/img/LeetCode/72/q3.png)

## 我的解法

```cpp
class Solution {
public:
    int minDistance(string word1, string word2){
        int n = word1.length();
        int m = word2.length();
        
        vector<vector<int>> dp(n+1, vector<int>(m+1, 0));
        for(int j = 0; j <= m;j++) dp[n][j] = m -j;
        for(int i = 0; i <= n;i++) dp[i][m] = n -i;
        
        
        for(int i=n-1; i>=0; i--){
            for(int j=m-1; j>=0; j--){
                if(word1[i] == word2[j]){
                    dp[i][j] = dp[i+1][j+1];
                    continue;
                }
                else{
                    dp[i][j] = min(min(dp[i+1][j], dp[i][j+1]), dp[i+1][j+1]) +1;
                }
            }
        }

        return dp[0][0];
    }
};
```

這裡一樣宣告一個用於儲存步驟數`(n+1) x (m+1)` 大小的二維陣列  `dp`，首先填滿陣列的最後一行跟最後一列分別代表如果 `word1` 或 `word2` 為空，則步驟數為另一方的字串長度。接著就是透過迴圈從陣列最左下角的 base case 往回開始填數字，如果 `word1[i] == word2[j]` 則比較下一組，否則考慮三種操作中，步驟數最小的操作，並且加上1，就會是當前 `dp[i][j]` 中需要保存的步驟數，一路迭代回 `dp[0][0]` 就會是答案。

### 執行結果

![](/img/LeetCode/72/result.jpeg)


# 複雜度

| 複雜度           | 值                   | 分析                                                                                                 |
|------------------|----------------------|------------------------------------------------------------------------------------------------------|
| 時間複雜度       | $O(n \times m)$             | 雙重迴圈遍歷大小為 `(n+1) x (m+1)` 的二維陣列，其中 `n` 和 `m` 分別是 `word1` 和 `word2` 的長度。這導致最壞情況下需要 `O(n * m)` 次操作|
| 空間複雜度       | $O(n \times m)$            | 這個解法使用了一個大小為 `(n+1) x (m+1)` 的二維向量 `dp`，因此需要 `O(n * m)` 的空間。此外，除了陣列本身，沒有額外的輔助空間需求|

---