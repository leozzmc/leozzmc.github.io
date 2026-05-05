---
title: 特殊路徑II | Medium | LeetCode#63. Unique Paths II
tags:
  - Dynamic Programming
  - Multidimensional DP
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 12e1c70b
date: 2024-11-23 13:08:21
cover: /img/LeetCode/63/cover.png
---

# 題目敘述

![](/img/LeetCode/63/question1.jpeg)

![](/img/LeetCode/63/question2.jpeg)

- 題目難度: `Medium`
- 題目描述： 給定一個 `m x n` 大小的整數2D陣列 `grid`，有個機器人為位在網格最左上角 (`grid[0][0]`)，機器人想要移動到最右下角 (`grid[m-1][n-1]`)。機器人每次可以選擇往下或是往右邊移動。網格中某些格子有障礙物，有障礙物的那格會被標注 `1`，如果沒有障礙物則是標注 `0`，機器人移動的路線中不能包含任何障礙物。 題目要求回傳機器人可以走的所有唯一的路徑數量。

# 解法

## 一開始的想法

一開始的想法一樣還是要找子問題，從左上角起點每次可以選擇往右或往下，而終點會是陣列中 `[m-1][n-1]` 的位置，最短路徑和可以從終點加上他的上面或左邊那格一路回朔回起點， **因此這會是一個大量重疊的子問題，因此可以用 DP 中的 Recursion + Memoization 來解決。**

## 我的解法 - Recursion + Memoization

```cpp
class Solution {
public:
    vector<vector<int>> dp;
    int helper(vector<vector<int>>& obstaclesGrid, int x, int y){
        int m = obstaclesGrid.size();
        int n = obstaclesGrid[0].size();
        if(x >= m || y >= n || obstaclesGrid[x][y] ==  1) {
            return 0;
        }
        if(x == m-1 && y == n-1){
            return 1;
        }
        if(dp[x][y] != INT_MIN) return dp[x][y];


        // Move to the next square
        int r1 = helper(obstaclesGrid, x+1, y);
        int r2 = helper(obstaclesGrid, x, y+1);
        
        dp[x][y] = r1+r2;
        return dp[x][y];
    }

    int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid){
        dp = vector<vector<int>>(obstacleGrid.size(), vector<int>(obstacleGrid[0].size(), INT_MIN));
        return helper(obstacleGrid, 0, 0);
    }
};
```

主要程式邏輯會是在 `helper` 裏面，參數 `x` 和 `y` 是用於紀錄當前是表格中哪一行哪一列。在函數中首先定義了 base case，如果到達最右下角的那格，就回傳 `1` 代表這一是一條有效的路徑。 另外當 `x` 或者 `y` 加超過了陣列範圍或者是遇到障礙物 `obstaclesGrid[x][y] ==  1` 則返回 `0`，代表是無效路徑。

```cpp
int r1 = helper(obstaclesGrid, x+1, y);
int r2 = helper(obstaclesGrid, x, y+1);
dp[x][y] = r1+r2;
return dp[x][y];
```

接著上面這段代表，每一格中都可以選擇往右(`y+1`)或往下(`x+1`)走， **但不管哪一種走法，其加總就會是當前為止有的有效路徑數量** ，然後記錄到用於紀錄重複計算的 `dp` 中，最後回傳 `dp[x][y]`。在函數 `uniquePathsWithObstacles` 先初始化了 `dp` 為 `m x n` 大小的二維陣列，其初始值為 `INT_MAX`。在 `helper` 中如果 `dp[i][j]` 不為 `INT_MAX` 就代表已經計算過了，就直接回傳對應值即可。

### 執行結果

![](/img/LeetCode/63/result.jpeg)

## Iteration

```cpp
class Solution {
public:
    int uniquePathsWithObstacles(vector<vector<int>>& obstacleGrid){
        int m = obstacleGrid.size();
        int n = obstacleGrid[0].size();
        vector<vector<int>> dp(m, vector<int>(n, 0));
        
        if(obstacleGrid[0][0] == 0)dp[0][0] = 1;
        else dp[0][0] =0;
        
        for(int i=1; i<m; i++){
            if(obstacleGrid[i][0] == 0 && dp[i-1][0] == 1)dp[i][0] = 1;
            else dp[i][0] =0;
        }
        for(int j=1; j<n; j++){
            if(obstacleGrid[0][j] == 0 && dp[0][j-1]==1) dp[0][j] = 1;
            else dp[0][j] = 0;
        }
        for(int i=1; i<m;i++){
            for(int j=1; j<n; j++){
                if(obstacleGrid[i][j]== 0){
                    dp[i][j] = dp[i-1][j] + dp[i][j-1];
                }
            }
        }
        return dp[m-1][n-1];
    }
};
```


Iteration 的做法就是反向操作， **每一格的有效路徑是由其上方或左邊那格的路徑數量以及當前是否有障礙來決定的。** 而對於做左側那行中的每一格只會來自他的上面，而對於在最下面那列的所有格中，只會來自於他的左側，因此透過兩個迴圈來處理這兩種狀況，最後就是透過雙重迴圈來去迭代每一個進行有效路徑的加總。 而 Iteration 的初始化，則是將 `dp` 都初始化為 `0`，默認為無效路徑 (每一格路徑總數為`0`)。


```cpp
if(obstacleGrid[i][0] == 0 && dp[i-1][0] == 1)dp[i][0] = 1;
else dp[i][0] =0;
```

如果當前無障礙物，並且當前格子上面的格子有有效路徑，則當前格子也會是有效路徑 `dp[i][0]=1` 否則為 `dp[i][0]=0`。對於相同行也一樣，如果當前無障礙物，並且當前格子上面的格子有有效路徑，則當前格子也會是有效路徑 `dp[0][j]=1` 否則為 `dp[0][j]=0`，最後透過雙重迴圈來迭代進行路徑數量加總。迭代到最右下角那格， **則代表從最左上角起點加總到右下角終點的所有唯一的路徑總數。**


### 執行結果

![](/img/LeetCode/63/result2.jpeg)

# 複雜度

| 方法                   | 時間複雜度 | 分析過程                                                                                           |
|------------------------|------------|----------------------------------------------------------------------------------------------------|
| Recursion + Memoization | $O(m \times n)$   | 每個網格的狀態只會計算一次，因為使用了記憶化避免了重複計算，最多遍歷 $m \times n$ 個網格。                    |
| Iteration              | $O(m \times n)$   | 動態規劃需要遍歷整個表格來填充 `dp`，因此最多也需要 $m \times n$ 次迭代                                    |


| 方法                   | 空間複雜度 | 分析過程                                                                                           |
|------------------------|------------|----------------------------------------------------------------------------------------------------|
| Recursion + Memoization | $O(m \times n)$  | 使用了一個大小為 $m \times n$  的記憶化表格來存儲每個狀態的計算結果，並額外需要 $O(h)$ 的遞迴棧空間，其中 $h$ 是遞迴深度 |
| Iteration              | $O(m \times n)$ | 使用了一個大小為 $m \times n$  的 `dp` 表格來存儲中間結果，無需額外的遞迴空間                               |

---
