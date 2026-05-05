---
title: 島的最大面積 | Medium | LeetCode#695. Max Area of Island
tags:
  - Matrix
  - Graph
  - DFS
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 6c6d3ce
date: 2024-12-30 09:17:46
cover: /img/LeetCode/695/cover.png
---

# 題目敘述

![](/img/LeetCode/695/question.jpeg)

- 題目難度：`Medium`
- 題目描述：  題目給定一個 m x n 大小的二元陣列 `grid`，陣列中 `1` 代表陸地，`0` 代表水域，島嶼四面環水，相鄰的陸地會水平或垂直地連接而成，請回傳陣列中島嶼的最大面積，如果沒有島嶼則回傳 0

# 解法

## 一開始的想法

這題算是接續 [LeetCode#200. Number of Islands](https://leozzmc.github.io/posts/b7e69c9.html) 所以我的解題策略會基於這題，就是一樣先透過 DFS 找到 Connected Components 然後這裡累加Connected Components 的面積，再比較最大面積。

## 我的解法

```c++
class Solution {
public:
    vector<vector<int>> visited; 
    int dfs(vector<vector<int>> &grid, int row, int col){
        if(row < 0 || row >= grid.size() || col < 0 || col >= grid[0].size() || visited[row][col] == 1 || grid[row][col] == 0) return 0;

        visited[row][col] = 1;
        int sum = 1;

        int offsetRow[4] = {1,0,-1,0};
        int offsetCol[4] = {0,1,0,-1};
        for(int k=0; k<4; k++){
            sum += dfs(grid, row+offsetRow[k], col+offsetCol[k]);
        }
        return sum;
    }

    int maxAreaOfIsland(vector<vector<int>>& grid){
        int m = grid.size();
        int n = grid[0].size();

        visited.resize(m, vector<int>(n,0));
        int  maxIslandArea = 0;

        for(int i=0; i<m; i++){
            for(int j=0; j<n; j++){
                if(grid[i][j]==1 && visited[i][j] ==0){
                    int currentArea = dfs(grid, i,j);
                    maxIslandArea = max(maxIslandArea, currentArea );
                }
            }
        }
        return maxIslandArea;
    }
};
```

這題一樣先在 `maxAreaOfIsland` 函數去初始化一個用於保存是否走訪過的2D Vector `visited` 並且都初始化為 0 (`0`: unvisited,`1`: visited)，接著需要迭代 `grid`，一旦發現當前網格會是小島 (`grid[i][j]==1`) 並且並未造訪過 (`visited[i][j]==0`) 這時候就會去進行 `dfs` 而回傳結果會是該格相連島嶼的總面積 (connected components 面積)，這時會去與先前的最大面積 `maxIslandArea` 進行比較，保留大的。

在 `dfs` 部分，因為會是遞迴進行，因此需要先定義終止條件，這裏的條件不外就是超出 `grid` 範圍，還有網格已經造訪過，以及跑到水中 (`grid[row][col]==0`) 。而每一層遞迴中，會去將 `visited[row][col]` 更新成已造訪 (`1`)，接著需要遞迴判斷當前這一格的上下左右是否一樣是島嶼

```c++
dfs(row+1,col);
dfs(row, col+1);
dfs(row-1, col);
dfs(row, col-1);
```

而每個結果都需要更新到 `sum` 中，最後回傳 `sum`。因為不想寫四遍，所以定了一個迴圈來處理。回到 `maxAreaOfIsland` 後，迭代完 `grid` 後回傳 `maxIslandArea` 就會是最大面積。

### 執行結果

![](/img/LeetCode/695/result.jpeg)


# 複雜度

時間複雜度： $O(mn)$

空間複雜度： $O(mn)$


---
