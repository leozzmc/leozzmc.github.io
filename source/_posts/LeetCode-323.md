---
title: >-
  無向圖中連通元件的數量 | Medium | LeetCode#323. Number of Connected Components in an
  Undirected Graph
tags:
  - Graph
  - DFS
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/323/cover.jpeg
abbrlink: ff5764dc
date: 2025-03-15 13:20:36
---

# 題目敘述

![](/img/LeetCode/323/question.jpeg)

- 題目難度：`Medium`
- 題目描述： 給定一張圖中有 `n` 個節點，以及一個陣列 `edges` 其中 `edges[i] = [a_i, b_i]` 代表從節點A到節點B存在 Edge，本題要求回傳這個圖紹 Connected Components 的數量。

# 解法

## 一開始的想法

由於題目給得是 `edge` 的陣列，可以由此陣列去建構出一個 `n x n` 的鄰接矩陣，如果矩陣中有值就為 `true` 開始針對已經有 `true` 的節點進行 DFS 然後每次返回到 Caller 時就讓某變數 `sum` 增加一，最後再回傳 `sum` 即可，就代表 Connected Components 的數量。


> 但 `n x n` 的鄰接矩陣，如果想要去選取出發點，勢必須要透過雙重迴圈來尋找，只要 `n` 夠大就會 Time Limit Excced，因此改良做法是改成鄰接串列（Adjacency List）


## 我的解法

```c++
class Solution {
    public:
        void dfs(vector<vector<int>> &adjList, vector<bool> &visited, int node){
            if(visited[node]) return;

            visited[node] = true;
            
            for(int neighbor: adjList[node]){
                dfs(adjList, visited, neighbor);
            }
        }

        int countComponents(int n, vector<vector<int>>& edges) {
            // Define a adjacency list
            vector<vector<int>> adjList;
            vector<bool> visited(n, false);
            int sum = 0;

            adjList.resize(n);
            // Construct adjacency list
            for(int i=0; i< edges.size();i++){
                adjList[edges[i][0]].push_back(edges[i][1]);
                adjList[edges[i][1]].push_back(edges[i][0]);
            }

            // Perform DFS, and calculate the number of connected components
            for(int i=0; i<n; i++){
                if(!visited[i]){
                    dfs(adjList, visited, i);
                    sum++;
                }
            }
            return sum;
        }
};
```


在 `countComponents` 中初始化鄰接串列 `adjList` , 用於儲存走訪狀態的陣列 `visited` 以及紀錄 connected components 數量的變數 `sum` 之後將 `adjList` 初始化大小為 `n`。

建構 `adList` 的時候，可以回憶一下鄰接串列的特性，對於每個節點 `i`，其 subVector 的元素就是與 `i` 相鄰的節點

```
[
[0] | [1,5,7,9]
[1] | [2,4,5,6]
[2] | [3,5]
[3] | [0,9,]
]
```

對於每個 `edges[i]` 其第一個元素 `edges[i][0]` 要作為 `adjList` 的 index 然後將對應接到的node `edges[i][1]` push到 subVector。另外本題是一個無向圖，因此只要存在 `[a_i, b_i]` 那一定也存在 `[b_i, a_i]`。所以也需要將 `edges[i][1]` 作為 index 然後將其 `edges[i][0]` push 到 subvector 中。

後面尋找起點主要是迭代 `visited[n]` 只要發現有尚未造訪的節點 (`visited[i]== false`)，就會去進行DFS。在 DFS 過程中，每次帶訪節點會去將 `visited[node]` 標注為已造訪 (`true`)。在 `dfs` 中，對於每個傳入的 `node`會去透過 `adjList` 看其對應的 subVector 是否有相鄰的節點是尚未造訪的，但如果造訪過了就會回傳。 只要 dfs結束回到 `countComponents` 的時候就代表已經走房完成一個 Connected Components，此時可以將 `sum` 增加。 走訪完全圖後就回傳  `sum`。


### 執行結果

![](/img/LeetCode/323/result.jpeg)

# 複雜度

時間複雜度
$O(V+E)$ 建構 `adjList` 會需要拜訪 `E` 個 edge，另外走訪完全圖，一共會走訪到 `V` 個節點。     

空間複雜度
$O(V+E)$ 需要儲存 `V` 個節點 並且有 `E`個 edge 


---

