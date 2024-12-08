---
title: 最大正方形 | Medium | LeetCode#221. Maximal Square
tags:
  - Dynamic Programming
  - Multidimensional DP
  - Matrix
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
cover: /img/LeetCode/221/cover.png
abbrlink: a4339899
date: 2024-12-08 21:54:32
---


# 題目敘述

![](/img/LeetCode/221/question.jpeg)
![](/img/LeetCode/221/question2.jpeg)

- 題目難度: `Medium`
- 題目敘述: 給定一個 `m x n` 大小的二元陣列 `matrix` (由 `0`, `1` 填充而成)，請找出僅包含 `1` 的最大正方形面積。

# 解法

## 一開始的想法

這個問題要找出 **僅包含 `1` 的最大正方形面積** ，可以拆分成兩個問題，第一個就是 **如何找出正方形面積?** 第二個就是 **如何比較出最大的面積?** 我最初的想法還是偏向暴力解，如果將矩陣的右下角定為起點，那正方形就會是任意點 `(i, j)` 往上以及往左圍出的區域


![](/img/LeetCode/221/algo1.png)


## 我的解法 - 暴力解

```c++
class Solution {
public:
    int maximalSquare(vector<vector<char>>& matrix){
        if(matrix.empty() || matrix[0].empty()) return 0;
        int m = matrix.size();
        int n = matrix[0].size();

        int area =0;
    
        for(int i=m-1; i>=0; i--){
            for(int j=n-1; j>=0; j--){
                if(matrix[i][j] == '0') continue;
                int k=1;
                while( i-k >=0 && j-k >=0){
                    bool validSquare = true;
                    for (int x = 0; x <= k; x++) {
                        if (matrix[i - k][j - x] == '0' || matrix[i - x][j - k] == '0') {
                            validSquare = false;
                            break;
                        }
                    }
                    if(!validSquare) break;
                    k++;
                    
                }
                area = max(area, k*k);
            }
        }
        return area;
    }

};
```

程式邏輯就是從右下角，先一路往左檢查該列作為起始點的正方形大小，接著往上一層一樣由右往左的一路重新計算。在最內層迴圈中，一旦檢查到起點周圍有包含 `0`，則跳出。若無則繼續檢查，最後會計算包圍出的面積大小 `area = max(area, k*k);`

> 但這種做法在陣列巨大時，會非常沒有效率，因此執行結果為 Time Limit Excceded !

## 最佳化最法 


```c++
class Solution {
public:
    int maximalSquare(vector<vector<char>>& matrix){
        if(matrix.empty() || matrix[0].empty()) return 0;
        int m = matrix.size();
        int n = matrix[0].size();
        
        vector<vector<int>> dp(m , vector<int>(n, 0));
        int maxSide =0;

        for(int i=0; i<m; i++){
            for(int j=0; j<n; j++){
                if(matrix[i][j] == '1'){
                    if(i == 0 || j==0) dp[i][j] = 1;
                    else{
                        dp[i][j] = min({dp[i-1][j], dp[i][j-1], dp[i-1][j-1]}) + 1;   
                    }
                    maxSide = max(maxSide, dp[i][j]);
                }
            }
        }
        return maxSide * maxSide;
    }
};
```

這裡首先定義一個二維陣列 `dp[i][j]`，它代表 **以 `(i , j)` 為右下角的正方形的最大邊長** ， **如果 `matrix[i][j]` 是 `1`，則其作為右下角的最大邊長由其上方，左方以及左上方正方形的最小邊長決定**。而首先對於矩陣的第一行或第一列，他們作為正方形右下角，僅能包含出最大邊長為 1  的正方形，因此算是 base case。

今天如果想要知道以 `(2,2)` 為右下角正方形的最大邊長，就要查找 `dp[2][1]`, `dp[1][2]`, `dp[1][1]` 為右下角正方形的最大邊長，需要找最小的正方形，這裡最小的值為 0，其實就代表以 `(2,2)` 為右下角，僅能包圍出邊長大小為 `1` 的正方形，也就是 `(2,2)` 自己的那格。

![](/img/LeetCode/221/algo2.png)


但如果我們看 `(2,3)`，則可發現 `dp[2][2]`, `dp[1][3]`, `dp[1][2]` 皆為 `1`，這代表能包圍出的正方形邊長為 `2`，對應看到 `matrix` 也可以發現確實存在 `2 x 2` 大小的正方形。 

![](/img/LeetCode/221/algo3.png)

函數的最後回傳最大邊長的平方，即為最大正方形的面積


### 執行結果

![](/img/LeetCode/221/result.jpeg)

# 複雜度



| 作法              | **時間複雜度**              | **空間複雜度**    | **分析過程**                                                                                                                |
|-------------------|----------------------------|-------------------|----------------------------------------------------------------------------------------------------------------------------|
| **暴力解法**     | $O(m \cdot n \cdot \min(m, n)^2)$ | $O(1)$            | 每個位置 $(i, j)$ 嘗試擴展正方形，內層迴圈驗證正方形是否合法，最大邊長取決於矩陣的最小維度（高度或寬度）                                     |
| **動態規劃解法** | $O(m \cdot n)$              | $O(m \cdot n)$ 或 $O(n)$ | 每個位置只需要比較上方、左方和左上方的 DP 值，透過動態規劃表記錄結果，避免重複計算，計算時間與矩陣大小線性相關                              |

---


