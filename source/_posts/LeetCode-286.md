---
title: 牆壁與閘門 | Medium | LeetCode#286. Walls and Gates
tags:
  - Graph
  - BFS
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 79e94c86
date: 2025-01-02 13:49:37
cover: /img/LeetCode/286/cover.png
---

# 題目敘述

![](/img/LeetCode/286/question.jpeg)

- 題目難度：`Medium`
- 題目描述： 給定一個 `m x n` 大小的網格 `rooms` 並且可能初始化三種值：(1) `-1` 代表牆壁或者障礙物 (2) `0` 代表閘門 (3) `INF` 則代表空房間，這裏的 `INF` 代表 `2^31 - 1 = 2147483647` (整數的上界)，其實就想成是房間到閘門的距離初始化無限大。 本提要求將空房間填入距離他最近閘門的距離值。


# 解法

## 一開始的想法

這裡其實也是要求從圖中的閘門當成搜尋起點，來去進行路徑走訪，將所有路過的空房間都標注與閘門的距離，所以要做的事會是 BFS 走訪。只不過在 BFS 發現新的 Connected Vertex 的時候會需要將其標注上與搜尋起點(閘門)的距離

## 我的解法

```c++
class Solution {
public:
    void wallsAndGates(vector<vector<int>>& rooms){
        int m= rooms.size();
        int n= rooms[0].size();

        queue<pair<int, int>> q;
        int offsetRow[4] = {1,0,-1,0};
        int offsetCol[4] = {0,1,0,-1};

        for(int i=0; i<m; i++){
            for(int j=0; j<n; j++){
                if(rooms[i][j]== 0 ){
                    q.push({i,j});
                    
                }
            }
        }
        
    
        while(!q.empty()){
            pair<int, int> current = q.front();
            q.pop();
            for(int k=0; k<4; k++){
                int subRow = current.first + offsetRow[k];
                int subCol = current.second + offsetCol[k];

                if(subRow >= 0 && subRow < m && subCol >=0 && subCol < n  && rooms[subRow][subCol] == INT_MAX ){
                    rooms[subRow][subCol] = rooms[current.first][current.second] +1;
                    q.push({subRow,subCol});
                    
                }
            }
        }
}
};
```

這裡其實也是經典的 Graph BFS 的走訪方式，這裡先將符合資格的 vertex (`rooms[i][j]==0`)，也就是閘門推入 Queue 

```c++
for(int i=0; i<m; i++){
    for(int j=0; j<n; j++){
        if(rooms[i][j]== 0 ){
            q.push({i,j});
            
        }
    }
}
```

接著逐一將queue中元素取出作為搜尋起點，每個搜尋起點都需要查看他的上下左右四個方位的格子是否是空房間 (`rooms[subRow][subCol] == INT_MAX`)，如果是空房間的話就去將其添入距離，而上下做有格子一定是距離當前格子 `1` 單位的距離，因此 `rooms[subRow][subCol] = rooms[current.furst][current.second] + 1` ， 並且後續也需要將其作為新的搜尋起點，所以需要繼續推入 queue (`q.push({i,j})`)。

### 執行結果

![](/img/LeetCode/286/result.jpeg)

# 複雜度

時間複雜度

$O(m \times n)$ = $O(m \times n)$ + $O(m \times n)$ 

$m \times n$ 為 `rooms` 大小， 另外最壞狀況下 queue中可能會有 $m \times n$ 個節點要處理，因此整體複雜度為 $O(m \times n)$

空間複雜度

$O(m \times n)$ queue 最糟糕狀況可能同時儲存 $m \times n$ 個節點


---