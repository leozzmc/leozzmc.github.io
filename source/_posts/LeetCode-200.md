---
title: 島的數量 | Medium | LeetCode#200. Number of Islands
tags:
  - Matrix
  - Graph
  - DFS
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: b7e69c9
date: 2024-12-27 13:04:33
cover: /img/LeetCode/200/cover.png
---


# 題目敘述

![](/img/LeetCode/200/question.jpeg)

- 題目難度：`Medium`
- 題目描述： 題目給定一個 m x n 大小的二元陣列 `grid`，陣列中 `1` 代表陸地，`0` 代表水域，請回傳島嶼的數量。島嶼四面環水，相鄰的陸地會水平或垂直地連接而成。

# 解法

## 一開始的想法

這裡的想法就是這應該其實要找的是 **這個 Grid 中的所有 connected components 的數量** ， 這可以透過對所有尚未訪問節點進行 BFS 或 DFS 並透過一個 counter 來紀錄就可實現。

## 我的解法

```c++
class Solution {
public:
    int row, col;
    vector<vector<int>> visited; //0:unvisited, 1:visited
    void dfs(int r, int c, vector<vector<char>>& grid){
        if(r<0 || r>= grid.size() || c <0 || c>= grid[0].size() || grid[r][c]=='0' || visited[r][c]==1) return;
        
        visited[r][c] = 1;
        dfs(r+1,c, grid);
        dfs(r-1,c, grid);
        dfs(r,c+1, grid);
        dfs(r,c-1, grid);
    }


    int numIslands(vector<vector<char>>& grid){
        row = grid.size();
        col = grid[0].size();
        visited.resize(row, vector<int>(col,0));
        int count = 0;


        for(int i=0; i<row; i++){
            for(int j=0; j<col; j++){
                if(grid[i][j]=='1' && visited[i][j] == 0){
                    dfs(i,j,grid);
                    count++;
                }
            }
        }
        return count;
    }
};
```

我這裡的主要透過 DFS 來進行走訪，首先對於這題會需要先定義幾個變數來進行記錄：
- `int row, col` 主要用於記錄目前走訪到 `grid` 的哪一格
- `vector<vector<int>> visited` 用於記錄此格是否拜訪過，`0` 代表尚未拜訪，`1` 代表已拜訪

接著回到函數 `numIslands`，首先需要初始化 `visited` 大小，大小要跟 `grid` 一樣, 這裏透過兩個變數 (`row`, `col`)來保存行跟列長度，接著要宣告一個變數 `count` 用於保存島的數量。 接著我們需要透過一個迴圈來迭代每一格，若每一格中的值為 `1` 並且是尚未造訪過的 `visited[i][j] == 0` ，這時就需要去遞迴查看跟他相連的節點是否有其他是島嶼，而每次遞迴結束回到 `numIslands` 就代表找到一個 connected components，這時 `count` 就可以累加。

這裏的 `dfs` 跟Tree的 `dfs` 很像，一樣要去設定終止條件，這裏的終止條件就是：(1)超出範圍 (2)碰到 `0` 跟 (3)已經造訪過 就會返回。還沒遇到終止條件前，需要先將節點標注為「已造訪」(`visited[r][c] =1`) 接著就會去遞迴查找其上下左右鄰接節點是一樣是島嶼。一旦在 `numsIslands` 都查找完畢後，就會回傳所記錄的 connected components 的數量。


### 執行結果

![](/img/LeetCode/200/result.jpeg)


## BFS 作法

```c++
class Solution {
public:
    int row, col;
    vector<vector<int>> visited;
    int numIslands(vector<vector<char>>& grid){
        row = grid.size();
        col = grid[0].size();
        int offsetRow[4] = {0, 1, 0, -1}; 
        int offsetCol[4] = {1, 0, -1, 0}; 
        visited.resize(row, vector<int>(col,0));
        int count = 0;
        queue<pair<int, int>> q;

        for(int i=0; i<row; i++){
            for(int j=0; j<col; j++){
                if(visited[i][j] == 0 && grid[i][j] == '1'){
                    visited[i][j] = 1;
                    count++;
                    q.push({i,j});
                    while(!q.empty()){
                        pair<int, int>f = q.front();
                        q.pop();
                        for(int k=0; k<4 ;k++){
                            int subRow = f.first + offsetRow[k];
                            int subCol = f.second + offsetCol[k];
                            if(subRow>=0 && subRow < row && subCol >=0 && subCol < col && grid[subRow][subCol]=='1' && visited[subRow][subCol] == 0){
                                visited[subRow][subCol] = 1;
                                q.push({subRow, subCol});
                            }
                            
                        }
                    }
                }
            }
        }
        return count;
    }
};
```

BFS 的做法就是透過一個 queue 將尚未訪問且為島嶼的節點推入,並且對於每一層節點,會去找出與他相臨的上下左右的節點是否是島嶼，如果相鄰節點是島嶼且尚未造訪則將其推入到 Queue 中, 並且將 `visited` 標注為 1。 但核心思想其實一樣，都是要找 connected components 的數量。

### 執行結果

![](/img/LeetCode/200/result2.jpeg)



# 複雜度

| 方法         | 時間複雜度  | 空間複雜度 | 分析                                                                                       |
|--------------|-------------|-------------|--------------------------------------------------------------------------------------------|
| **DFS 方法** | $O(M \times N)$ | $O(M \times N)$ | - 每個節點最多訪問一次，遞迴深度最多為島嶼的大小，需額外的遞迴棧空間（最壞情況 $O(M \times N)$）。 |
| **BFS 方法** | $O(M \times N)$ | $O(M \times N)$ | - 每個節點最多訪問一次，使用隊列存儲節點，隊列的大小與整個島嶼的節點數成比例。                |


---