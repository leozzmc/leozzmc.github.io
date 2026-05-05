---
title: 太平洋-大西洋水流 | Medium | LeetCode#417. Pacific Atlantic Water Flow
tags:
  - Graph
  - BFS
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 7fd7eb24
date: 2025-01-13 18:33:31
cover: /img/LeetCode/417/cover.png
---

# 題目敘述

![](/img/LeetCode/417/question1.jpeg)

![](/img/LeetCode/417/question2.jpeg)

- 題目難度： `Medium`
- 題目描述： 有個大小 `m x n` 的長方形島嶼，它的邊界被太平洋與大西洋包圍。與太平洋交界的會是島嶼的上方以及左側邊緣，與大西洋交界的會是島嶼的下方和右側邊緣。島嶼被切分成許多網格單元，可以視為一個 `m x n` 大小的矩陣 `heights`，其中 `heights[r][c]` 代表座標 `(r,c)` 位置的海拔高度。 島上很常下雨， **只要當前單元格的海拔高度大於或等於其上下左右單元格的海拔高度，則雨水可以自由流向他的上下左右單元格。** 雨水可以透過相鄰單元格一路流到海洋中。 題目要求回傳一個 2D 矩陣 `result`， 其中 `result[i] = [r_i, c_i]` 代表雨水可以從座標 `(r_i, c_i)` **同時流到太平洋與大西洋。**


# 解法

## 一開始的想法

一開始覺得這題一樣會是 connected components 只是 connected 的條件變成只要四周格子比當前格子小，就能 connected，但沒有好好想到要如何同時滿足流向大西洋以及太平洋，並且要怎麼挑選走訪時候的起始點。


> 後來看了提示後發現，可以 **反向模擬水流流向**，也就是個別從大西洋的邊以及太平洋的邊去進行BFS，並且將個別BFS造訪過的單元格進行標注，最後將兩個結果取交集，就會是可以同時流向太平洋以及搭西洋的單元格。


## 我的解法

```c++
class Solution {
public:
    void bfs(queue<pair<int, int>>& q, vector<vector<int>> &heights, vector<vector<bool>> &ocean){
        int offsetRow[4] = {1,0,-1,0};
        int offsetCol[4] = {0,1,0,-1};

        while(!q.empty()){
            pair<int,int> current = q.front();
            q.pop();
            for(int k=0; k<4; k++){
                int subRow = current.first + offsetRow[k];
                int subCol = current.second + offsetCol[k];

                if(subRow >=0 && subRow < heights.size() && subCol >=0 && subCol < heights[0].size() && heights[current.first][current.second] <= heights[subRow][subCol] && !ocean[subRow][subCol]){
                    ocean[subRow][subCol] = true;
                    q.push({subRow, subCol});
                }
            }
        }
    }

    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int m = heights.size();
        int n = heights[0].size();
        vector<vector<bool>> pacific(m, vector<bool>(n, false));
        vector<vector<bool>> atlantic(m, vector<bool>(n, false));

        queue<pair<int, int>> pacificQueue;
        queue<pair<int, int>> atlanticQueue;

        // init the pacific edge
        for(int i=0; i<m; i++){
            pacificQueue.push({i,0});
            atlanticQueue.push({i,n-1});
            pacific[i][0] = true;
            atlantic[i][n-1] = true;
        }

        //init the atlantic edge
        for(int i=0; i<n; i++){
            pacificQueue.push({0,i});
            atlanticQueue.push({m-1,i});
            pacific[0][i] =true;
            atlantic[m-1][i] = true;
        }

        // Conduct BFS to PacificQueue
        bfs(pacificQueue, heights, pacific);

        // Conduct BFS to AtlanticQueue
        bfs(atlanticQueue, heights, atlantic);

        // Retrive the intersection of the two vectors.
        vector<vector<int>> result;
        for(int i=0; i<m; i++){
            for(int j=0; j<n; j++){
                if(pacific[i][j] && atlantic[i][j]) result.push_back({i,j});
            }
        }
        return result;

    }
};
```

在函數 `pacificAtlantic` 中首先定義了兩個2D陣列 `pacific`, `atlantic`，用來儲存從太平洋邊緣以及從大西洋邊緣進行BFS的走訪紀錄。以及各自行BFS 所需要的 queue `pacificQueue`, `atlanticQueue`，由於需要從邊緣作為起始點開始走訪，因此一開始會需要先將太平洋和大西洋的邊緣個別透過迴圈將其 Push 進入各自的 queue 中，並且需要更新對應在 `pacific` 以及 `atlantic`  中的拜訪紀錄，將對應位置標注為 `True`。接著呼叫兩次 `bfs` 並且 BFS 走訪結束後， `pacific`  以及 `atlantic` 中儲存的資料取交集，並添加到 `result` 中，最後回傳。


`bfs` 的部分，首先參數的地方，會需要傳入所使用的 queue, 題目給的 `heights` 以及對應的走訪2D陣列。接著就是依序將 BFS 中 queue 的首端元素取出，這裡會是一個 `pair<int, int>` 型態的變數，接著就是要走訪當前單元格的上下左右單元格，若上下左右單元格還在島嶼範圍內， **並且 `heights[current.first][current.second] <= heights[subRow][subCol] && !ocean[subRow][subCol]` 這裡代表當單元格小於其上下左右單元格，這裡的原因是因為我們是反向查找，水流要能夠從海拔高留到海拔低，但我們的搜尋起點會是從邊緣開始，因此我們需要找比當前儲存格還高，且未拜訪過的單元格** ，一旦找到後就需要該單元格標注為已拜訪 (`ocean[subRow][subCol] = true;`) 並且將其也推入對應的 queue中之後繼續進行下一層的走訪。

所以總結來看會是，各自從大西洋和太平洋的邊緣進行BFS 走訪的紀錄取交集，就會是雨水能夠同時流到太平洋和大西洋的單元格了。

### 執行結果

![](/img/LeetCode/417/result.jpeg)

# 複雜度

時間複雜度

$O( m \times n )$ + $O( m \times n)$ =  $O( m \times n)$

空間複雜度

$O( m \times n )$ + $O( m \times n)$ = $O( m \times n)$

---