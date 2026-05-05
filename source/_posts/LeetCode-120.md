---
title: 三角形 | Medium | LeetCode#120. Triangle
tags:
  - Dynamic Programming
  - Multidimensional DP
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: cd4d1860
date: 2024-11-19 21:32:54
cover:  /img/LeetCode/120/cover.jpg
---

# 題目敘述

![](/img/LeetCode/120/question.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給定一個2D陣列 `triangle`，求從最頂端走到最底端的最小路徑總和值

{% note info %}
對於每個 row 只能往下一層走，並且每次都會有兩種走法，假設現在在當前row的位置是 `i`，則下一層能夠選擇繼續走到 `i` 或者是 `i+1` 的位置。
{% endnote %}

```
範例:
   2
  3 4
 6 5 7
4 1 8 3
最短路徑總和會是: 2 + 3 + 5 + 1 = 11
```

# 解法

## 一開始的想法

想法其實也還蠻單純的，**就是每層都可以有選或不選特定路徑**，由於要找最短的路徑和， **因此需要兩條路徑都選擇，比較回傳結果大小** ，然後選小的回傳，這樣整體遞迴呼叫完畢後就能夠求出最短路徑和。

## 我的解法

### Recursive 

```cpp
class Solution {
public:
    
    int helper(vector<vector<int>>& triangle, int row, int index ,int result ){
        if(row == triangle.size()){
            return result;
        }
        // boundary conditions
        int r1 = helper(triangle, row+1, index, result+triangle[row][index]);
        if(index+1 < triangle[row].size()){
            int r2 = helper(triangle, row+1, index+1, result+triangle[row][index+1]); 
            return min(r1,r2);
        }
        else return r1; 
    }

    int minimumTotal(vector<vector<int>>& triangle){
        int result = 0;
        result += triangle[0][0];
        return helper(triangle, 1, 0, result);
    }

};
```

這是初次找出遞迴關係後的版本，首先在 `minimumTotal`中會初始化一個用於儲存路徑和的變數 `result`，由於頂端元素必定存在 (題目的限制)，因此可以直接先加入到 `result`，接著呼叫 `helper()`，在 `helper` 函數中， `r1` 和 `r2` 分別儲存 `helper()` 函數遞迴呼叫的結果，接著比較 `min(r1,r2)` 回傳路徑和比較小的結果。 而遞迴呼叫的停止條件就是當 `row` 到達最後一層。

> 但這樣包含了大量的重複計算，會花費大量時間，因此會是 Time Limit Exceeded

### Recursive + Memoization

```cpp
class Solution {
public:
    
    vector<vector<int>> dp;
    int helper(vector<vector<int>>& triangle, int row, int index ){
        if(row == triangle.size()){
            return 0;
        }
        
        if(dp[row][index]!=INT_MAX) return dp[row][index];
        
        int r1 = helper(triangle, row+1, index);
        int r2 = helper(triangle, row+1, index+1); 
        dp[row][index] = triangle[row][index] + min(r1, r2);
        
        return dp[row][index];
        
    }

    int minimumTotal(vector<vector<int>>& triangle){

        dp = vector<vector<int>>(triangle.size(), vector<int>(triangle.size(), INT_MAX));
        return helper(triangle, 0, 0);
    }

};
```

這裡透過另外一個二維向量 `dp` 來儲存重複運算的結果，這裡將向量初始化為 `INT_MAX`，而在 `helper` 函數中，一旦發現有先前計算過的結果就直接回傳，並且由於已經有用於儲存計算結果的 `dp`，因此也不需要額外的變數來儲存最短路徑和了 

### 執行結果

![](/img/LeetCode/120/result.jpeg)
> 但這應該也算是複雜度較高的做法了

## 其他做法

```cpp
class Solution {
public:
    int minimumTotal(vector<vector<int> > &triangle) 
    {
        vector<int> mini = triangle[triangle.size()-1];
        for ( int i = triangle.size() - 2; i>= 0 ; --i )
            for ( int j = 0; j < triangle[i].size() ; ++ j )
                mini[j] = triangle[i][j] + min(mini[j],mini[j+1]);
        return mini[0];
    }
};
```

### 執行結果

![](/img/LeetCode/120/result2.jpeg)

# 複雜度

| 方法類型       | 時間複雜度 | 簡略時間複雜度分析                          | 
|----------------|------------|---------------------------------------------|
| Recursive + Memoization  | $O(n^2)$ | 每個節點計算一次，三角形總節點數為 $n(n+1)/2$ |
| Iteration（Bottom Up） | $O(n^2)$ | 遍歷所有節點，每層需要處理該層節點數量，總計 $n(n+1)/2$ |

| 方法類型       |空間複雜度 | 簡略空間複雜度分析                                 |
|----------------|------------|--------------------------------------------------|
| Recursive + Memoization | $O(n^2)$ | 使用大小為 $n \times n$ 的記憶化表 + 遞迴棧深度為 $O(n)$ |
| Iteration（Bottom Up） | $O(n)$    | 僅用一個大小為 $n$ 的一維陣列保存當前層與下一層結果 |



----