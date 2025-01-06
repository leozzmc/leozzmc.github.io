---
title: 包圍的區域 | Medium | LeetCode#130. Surrounded Regions
tags:
  - Graph
  - DFS
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: '51295e83'
date: 2025-01-06 17:55:14
cover: /img/LeetCode/130/cover.png
---

# 題目敘述

![](/img/LeetCode/130/question.jpeg)

- 題目難度： `Medium`
- 題目描述： 給定一個 `m x n` 大小的 `board`，包含兩種字母 `X` 或者 `O`，目的是捕捉被包圍的區域：

{% note info %}
**Connected：** 一個格子可以與相鄰的格子（水平或垂直）相連
**Region：** 通過連接每個 `O` 格子來形成一個區域(Region)
**Surround：** 如果一個區域的所有 `O` 格子都能被 `X` 格子連接，並且該區域中的 `O` 格子不在矩陣的邊緣上，則該區域被視為被包圍
{% endnote %}

> 題目要捕捉被包圍的區域， **將原始矩陣中所有被包圍的 `O` 替換為 `X`。**  此操作應直接在原始矩陣上進行，無需返回任何值。

# 解法

## 一開始的想法

這題我一開始的想法有點偏掉，但這題的意思就是：
1. 找出被包圍 Region 並將 Region 中的 `O` 換成 `X`
2. 如果 Region 有接到矩陣邊緣，則不替換成 `X`


這樣依舊會需要先透過 DFS 或者是 BFS 來先去走訪 connected components (相連的 `O`) 這裡可以透過 **先從邊緣查找是否有 `O`，如果有作爲起點進行 DFS， 找到的Connected components 這都代表是不能轉換成 `X` 的區域** ，可以先替換成其他符號，之後再走訪一次 `board` 將轉換成 其他符號的區域變回來，然後將還是 `O` 的區域轉換成 `X`


## 我的解法


```c++
class Solution {
public:
    void dfs(vector<vector<char>>& board, int row, int col){
        if(row < 0 || row >= board.size() || col < 0 || col >= board[0].size() || board[row][col] != 'O') return;
        
        board[row][col] = 'T';
        
        int offsetRow[4] = {1,0,-1,0};
        int offsetCol[4] = {0,1,0,-1};

        for(int k = 0; k < 4; k++){
        dfs(board ,row+offsetRow[k], col+offsetCol[k]);
        }
    }

    void solve(vector<vector<char>>& board) {
        //Traverse the board
        int m = board.size();
        int n = board[0].size();
        
        //Handle boundary
        for(int row=0; row< m; row++){
            // Find connected components connected to boundary
            if(board[row][0] == 'O') dfs(board, row, 0);
            if(board[row][n-1] == 'O') dfs(board, row, n-1);
        }
        
        for(int col=0; col <n ; col++){
            if(board[0][col] == 'O') dfs(board, 0, col);
            if(board[m-1][col] == 'O') dfs(board, m-1, col);
        }
        
        for(int row=0; row< m; row++){
            for(int col=0; col < n; col++){
                if(board[row][col] == 'O'){
                    board[row][col] = 'X';
                }
                else if (board[row][col] == 'T'){
                    board[row][col] = 'O';
                }
            }
        }
    }
};
```

這裡宣告的 `dfs` 的終止條件會是當當前的 row 或 col 超出陣列範圍，或者當前的格子已經不是 `O` ，則返回。而在每一格會去將 `O` 變更為 `T`， **這是因為這個 dfs 只用來在以 `board` 邊緣為起點時才會需要** ，因此走訪的 `O` 都是不可轉換成 `X` 的，因此轉成一個不相干的字母 `T`。 而在函數 `solve` 中會先迭代 `board` 的四個邊緣，如果發現有 `O` 就作為搜尋起點進行走訪，四個邊都走訪完畢後，接著透過雙層迴圈迭代 `board` 查找每一格中剩餘的 `O` 這剩餘的 `O` 就會是要替換成 `X` 的格子。而 `board` 中的所有 `T` 都要轉換回 `O`。 這樣就能夠成功包圍出有效的 region。


### 執行結果

![](/img/LeetCode/130/result.jpeg)

# 複雜度

時間複雜度

$O(m \times n)$

空間複雜度

$O(m \times n)$ 

最壞情況下，DFS 可能會遞迴訪問矩陣中的每個 `O`，因此遞迴調用棧的深度最多為矩陣中 `O` 的數量
假設矩陣中所有元素都是 `O`，則遞迴Stackk的空間複雜度為 $O(m \times n)$ 


---
