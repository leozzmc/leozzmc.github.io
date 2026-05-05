---
title: 用圖判斷有效的樹 | Medium | LeetCode#261. Graph Valid Tree
tags:
  - Graph
  - DFS
  - Cycle
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 21c39498
date: 2025-02-20 09:42:26
cover: /img/LeetCode/261/cover.png
---


# 題目敘述

![](/img/LeetCode/261/question.jpeg)

- 題目難度： `Medium`
- 題目描述：

> You have a graph of `n` nodes labeled from `0` to `n - 1`. You are given an integer `n` and a list of `edges` where `edges[i] = [ai, bi]` indicates that there is an undirected edge between nodes `ai` and `bi` in the graph.
> Return `true` if the edges of the given graph make up a valid tree, and `false` otherwise.


# 解法

## 一開始的想法

這題會是一個無向圖要判斷有沒有 Cycle，由於是無向圖判斷Cycle，因此可以透過 DFS來去看能不能形成一個 DFS Tree，如果不行那就是會有Cycle。另外這題給的邊形成的陣列，也會需要額外處理變成鄰接串列進行處理。

## 我的解法

```c++
class Solution {
public:

    bool hasCycle(vector<int> &visited, vector<list<int>> &adjList, int v, int parrent){
        visited[v]= 1;
        for(auto neighbor: adjList[v]){
            if(neighbor == parrent) continue;
            if(visited[neighbor]==1) return true;
            if(visited[neighbor]==0 && hasCycle(visited, adjList, neighbor, v)) return true;
        }
        visited[v] =2;
        return false; 
    }

    bool validTree(int n, vector<vector<int>>& edges) {
        vector<int> visited(n, 0); // 0: unvisited, 1: visiting, 2: finish
        vector<list<int>> adjList(n);

        // Turn edges into adj list
        // O(|E|)
        for(auto edge: edges){
            adjList[edge[0]].push_back(edge[1]);
            adjList[edge[1]].push_back(edge[0]);
        }

        // It's a tree, so giving root node, it will traverse whole node in the tree
        // O(|V| + |E|)
        if(hasCycle(visited, adjList, 0 , -1)) return false;

        // It it's a tree, all node should finish visiting
        // O(V)
        for(int i=0; i<n; i++){
            if(visited[i]!=2 ) return false;
        }

        return true;
    }
};
```


首先在 `validTree` 函數中，透過 `visited` 陣列來保存節點的造訪狀態 (0: unvisited, 1: visiting, 2: finish)。接著就是建構 Adjacency List 的部分： 透過迴圈迭代 `edges`，由於 `edges[i] = [ai, bi]`，但由於是無向圖，所以 `[ai, bi] == [bi, ai]` 因此每輪迭代都需要將從A走到B跟 B走到A 的關係加入到 `adjList`。

建構完畢後，由於要判斷是否是一個Tree 去進行DFS 按理說就能夠將所有節點走訪完畢了，所有節點走訪完畢那他們的 `visited` 都將要等於 `2` 如果有Cycle就代表他們會維持在 `1` 無法關閉。因此這裡先呼叫 `hasCycle` 函數。

`hasCycle` 中有多個參數，主要會傳遞 `visited` 陣列, `adjList` 以及當前節點 `v` 和當前節點的 `parent`。每次被呼叫都會先去將當前節點狀態標注為 **造訪中** ( `visited[v] = 1` ) 接著會去拜訪當前節點的鄰居，透過傳進來的 `adjList` 可以知道當前節點的鄰居有哪些節點，一旦發現鄰居的狀態是 拜訪中 (`visited[neighbor] = 1`) 則代表發生Cycle 這時就回傳 `true` 如果鄰居的狀態是尚未造訪 ( `visited[v] = 0` ) 但是以該節點當成root進行遞回判斷卻發現有Cycle，這樣就一樣回傳 `true`。另外這裡有個特別狀況，因為Tree DFS 會回溯到當前節點的 Parent 節點然後再往其他子節點traverse **但我們的判斷邏輯可能會讓回到parent這件事判斷成有 cycle，因為以 parent 節點當成root的造訪還沒結束 (`visited[parent] = 1`)** ，因此如果鄰居為 `parent` 則 `continue` 。 一旦所有鄰居造訪結束，當前節點的探索完畢，標注為結束造訪 (`visited[v] = 2`) 並且做到這就代表沒有 Cycle， 回傳 `false`。

回到 `validTree` 如果是一棵樹，則DFS完畢後所有節點都要造訪到，因此檢查所有節點，如果有節點的狀態不是造訪完畢，則代表不是一個valid 的 Tree，回傳 `false` 否則回傳 `true`。

### 執行結果

![](/img/LeetCode/261/result.jpeg)

# 複雜度

時間複雜度

所有節點跟邊都會造訪到 $O(V+E)$

空間複雜度

- `visited`: $O(V)$
- `adjList`: $O(V+E)$
- call stack 會與樹深度成正比，最壞狀況會是 $O(V)$

整體也會是 $O(V+E)$

---