---
title: 最短路徑總和 | Medium | LeetCode#64. Minimum Path Sum
tags:
  - Dynamic Programming
  - Multidimensional DP
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 99b89edb
date: 2024-11-20 18:39:22
cover:  /img/LeetCode/64/cover.png
---

# 前言

> 這是第一次寫 Multidimensional DP 的時間小於 20 min 就 AC !! 值得紀念一下 ~

# 題目敘述

![](/img/LeetCode/64/question.jpeg)

- 題目難度：`Medium`
- 題目描述： 題目給了一個 `m x n` 大小的二維整數陣列 `grid`，陣列中的值為非零整數，請找到從網格左上角走到右下角的最小路徑和， **在每一格每次只能選擇往下或是往右邊走**

# 解法

## 一開始的想法

一開始的想法一樣還是要找子問題，從左上角起點每次可以選擇往右或往下，而終點會是陣列中 `[m-1][n-1]` 的位置，最短路徑和可以從終點加上他的上面或左邊那格一路回朔回起點， **因此這會是一個大量重疊的子問題，因此可以用 DP 中的 Recursion + Memoization 來解決。**


## 我的解法 - Recursion + Memoization

```cpp
class Solution {
public:
    vector<vector<int>> dp;
    int helper(vector<vector<int>>& grid, int i, int j){
        if (i >= grid.size() || j >= grid[0].size()) return INT_MAX;
        if(i==grid.size()-1 && j==grid[0].size()-1) return grid[i][j];

        if(dp[i][j]!=INT_MAX) return dp[i][j];

        int r1 = helper(grid,i+1,j);
        int r2 = helper(grid,i,j+1);
        dp[i][j] = grid[i][j] + min(r1, r2);
        return dp[i][j];
    }

    int minPathSum(vector<vector<int>>& grid){
        dp = vector<vector<int>>(grid.size(), vector<int>(grid[0].size(), INT_MAX));
        return helper(grid,0,0);
    }
};
```

主要程式邏輯會是在 `helper` 裏面，參數 `i` 和 `j` 是用於紀錄當前是表格中哪一行哪一列。在函數中首先定義了 base case，如果到達最右下角的那格，就直接回傳終點值。

```cpp
int r1 = helper(grid,i+1,j);
int r2 = helper(grid,i,j+1);
dp[i][j] = grid[i][j] + min(r1, r2);
return dp[i][j];
```

接著上面這段代表，每一格中都可以選擇往右(`j+1`)或往下(`i+1`)走，但不管哪一種走法，回傳回來的結果選最小的就對了，並且需要加上當前這格的值，然後記錄到用於紀錄重複計算的 `dp` 中，最後回傳 `dp[i][j]`。在函數 `minPathSum` 先初始化了 `dp` 為 `m x n` 大小的二維陣列，其初始值為 `INT_MAX`。在 `helper` 中如果 `dp[i][j]` 不為 `INT_MAX` 就代表已經計算過了，就直接回傳對應值即可。

另外在 `helper` 中還需要額外做邊界檢查，因為 `i`, `j` 會有可能存取超出邊界．只要發現超出邊界就回傳 `INT_MAX`。
 
### 執行結果

![](/img/LeetCode/64/result.jpeg)

## 其他做法

```cpp
int minPathSum(vector<vector<int>>& grid){
    int m = grid.size();
    int n = grid[0].size();
    vector<vector<int>> dp(m, vector<int>(n , grid[0][0]));
    for(int i=1; i<m; i++){
        dp[i][0] = dp[i-1][0] + grid[i][0];
    }
    for(int j=1; j<n;j++){
        dp[0][j] = dp[0][j-1] + grid[0][j];
    }
    for(int i=1; i<m; i++){
        for(int j=1; j<n;j++){
            dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + grid[i][j];
        }
    }
    return dp[m-1][n-1];
}
```

其實就上面講的一樣，每一格的最短路徑是由其上方或左邊那格的最短路徑加上當前 `grid` 值所得到的。而對於做左側那行中的每一格只會來自他的上面，而對於在最下面那列的所有格中，只會來自於他的左側，因此透過兩個迴圈來處理這兩種狀況，最後就是透過雙重迴圈來去迭代每一個進行短路徑的加總。

### 執行結果

![](/img/LeetCode/64/result2.jpeg)

# 複雜度

| 方法         | 時間複雜度      | 分析過程                                                                 |
|--------------|-----------------|--------------------------------------------------------------------------|
| Recursion + Memoization | $O(m \times n)$        | 遞迴計算每個格子的最小路徑和，且利用 `dp` 紀錄已計算的結果，避免重複計算 |
| Iteration  | $O(m \times n)$        | 透過雙重迴圈逐格計算，直接更新 `dp` 表格，效率與遞迴類似，但避免了函式調用的開銷 |


| 方法         | 空間複雜度      | 分析過程                                                                                  |
|--------------|-----------------|-------------------------------------------------------------------------------------------|
| Recursion + Memoization | $O(m \times n)$         | `dp` 表格需要儲存所有格子的最小路徑和，同時遞迴呼叫需要額外的函式呼叫堆疊，最多深度為 $O(m + n)$ |
| Iteration  | $O(m \times n)$      | 使用 `dp` 表格來儲存最小路徑和，但沒有遞迴，因此沒有額外的呼叫堆疊空間                         |


---

