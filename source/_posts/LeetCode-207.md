---
title: 課程表 | Medium | LeetCode#207. Course Schedule
tags:
  - Graph
  - DFS
  - Cycle
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: '55e11871'
date: 2025-01-20 09:02:18
cover:
---


# 題目敘述

![](/img/LeetCode/207/question.jpeg)

- 題目難度： `Medium`
- 題目描述：總共有 `numCourses` 課程需要上，他們被標注為 `0` - `numCourses-1`，給定一個陣列 `prerequisites` 其中 `prerequisites[i] = [a_i, b_i]` 代表你需要先上過 `b_i` 課你才夠去上 `a_i` 課程。舉例來說，`[0,1]` 代表你需要先上課程 `1` 才能夠去上課程 `0`，如果可以完成所有課程就回傳 `true` 否則回傳 `false`。


# 解法

## 一開始的想法

一開始其實還沒有很懂題意，但在看了題目給的範例後才發現這題，**其實是要在有向圖中找是否有 Cycle** ， 如果看範例二就可以發現他其實就是一個Cycle，並且也會邏輯上不順，**先修課程0再修課程1 跟先修課程1再修課程0 這兩個沒辦法同時成立**

![](/img/LeetCode/207/cycle.png)

> 我這裡一樣是透過 DFS 去做，但還沒處理過找Cycle 的題目，因此有看了下Hint，這裡會需要額外的陣列來去保存DFS的呼叫路徑，一旦發現有走訪到走過的路，那就是有Cycle

## 我的解法

```c++
class Solution {
public:

    bool dfs(vector<vector<int>> &adjMatrix, vector<int> &visited, vector<int> &recStack, int node){
        if(!visited[node]){
            visited[node] = 1;
             
            // Add the node to the recursion stack
            recStack[node] = 1;

            for(int neighbor = 0; neighbor < adjMatrix.size(); neighbor++){
                if(adjMatrix[node][neighbor] == 1){
                    if(!visited[neighbor] && dfs(adjMatrix, visited, recStack, neighbor) || recStack[neighbor]){
                        return true; // cycle detected
                    }
                }
            }
        }
         // Remove the node from the recursion stack
        recStack[node] = 0;
        return false;
    }

    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        int m = numCourses;
        vector<vector<int>> adjMatrix(m, vector<int>(m, 0));
        vector<int> visited(m, 0); //0: unvisited
        vector<int> recStack(m, 0); // 0: not in recursion stack
 
        // transform prerequisites into adjMatrix
        for(auto &prerequisite : prerequisites){
            adjMatrix[prerequisite[1]][prerequisite[0]] = 1; // Directed edge from prerequisite[1] to prerequisite[0]
        }

        // Check for cycle in the graph
        for(int i=0; i< m; i++){
            if(!visited[i]){
                if(dfs(adjMatrix, visited, recStack, i)){
                    return false;
                }

            }
        }

        return true;

    }
};
```

{% note info %}
我這裡的做法是，首先我對 `prerequisites` 陣列不熟悉，所以我希望將它轉換為鄰接矩陣 (Adjacent Matrix)，並且行與列都會是課程Label，有了Adjacent Matrix後，接著透過 DFS 進行走訪，走訪過程中，如果會路過檢查到有 Cycle 則回傳 `false` 一旦所有未拜訪都的路徑都沒有 cycle 最後則回傳 `true`。
{% endnote %}

首先在 `canFinish` 中，一開始宣告了一個 `m x m` 大小的鄰接矩陣 `adjMatrix`，並且後面除了定義 `visited` 陣列外，還額外宣告一個 `recStack` 來保存每次的路徑 (Call Stack)，都先初始化為 0。接著需要將題目給的陣列轉成我自己熟悉的鄰接矩陣，由於 `prerequisites` 中，題目的限制會是，`prerequisites[i] = [a_i, b_i]`，因此會是從 vertex(B) 指向到 vertex(A)，因此對應到 `adjMatrix` 中會是 `row=vertex(B), column=vertex(A)` 那一格會是 `1`，代表從 vertex(B) 走到 vertex(A) 是有 edge 的。

透過迴圈建構完畢後，就可以開始迭代走訪每個未造訪過的節點進行DFS 然後檢查是否有 Cycle。走訪跟檢查Cycle 都由 `dfs` 處理，一旦傳入的節點 `node` 是尚未造訪過的 (`!visited(node)`) 則會先去更新對應的狀態:
- 標注為「已造訪」 (`visited[node] = 1`)
- 將該節點加入到 call stack (保存路徑) (`recStack[node] = 1`)

由於是圖的走訪，因此需要從當前節點檢查鄰接節點是否可以造訪，這裡會是去迭代 `adjMatrix` 對應 `node` 行的其他列來去看是否有 edge (`adjMatrix[node][neighbor] == 1`)，如果有 edge 則需要進一步確認下面條件，如果下面條件成立則代表有 Cycle：

- 該 neighbor 尚未被造訪，但以該 neighbor 去遞回呼叫 `dfs` 會偵測出 cycle
- 該 neighbor 已經出現在 call stack 當中 (`recStack[neighbor] == 1`)

一旦所有 `node` 的鄰接節點都沒有檢查出 cycle則代表到目前節點為止都沒有檢查出 cycle，將當前節點移出 call stack (`recStack[node] = 0`) 並回傳 `false` (沒有 cycle)。回到 `canFinish` 如果每個搜尋起點都沒有偵測出 cycle，則最後回傳 `true` 代表課程可以順利完成。


> 這裡可以發現，Adjacent Matrix 跟 2D 陣列表示島嶼那種的題目走訪方式不太一樣
> 前者會是去根據當前節點迭代那列對應在鄰接矩陣的不同行，後者會是去走訪當前節點在圖中的上下左右四個方向的節點


### 執行結果

![](/img/LeetCode/207/result.jpeg)


> https://leetcode.com/problems/course-schedule/submissions/1513628253/

## 其他解法  -  BFS/ Topological Sort

如果一開始的想法，這題是要判斷這是否是一張有向無環圖(Directed Acyclic Graph, DAG) 通常會透過拓樸排序法(Topological Sort) 進行判斷。


# 複雜度


# References
https://bclin.tw/2022/01/18/leetcode-207/

---