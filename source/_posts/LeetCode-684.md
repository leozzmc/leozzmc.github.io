---
title: 冗餘的連線 | Medium | LeetCode#684. Redundant Connection
tags:
  - Graph
  - DFS
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 1025b1fe
date: 2025-03-18 20:27:30
cover: /img/LeetCode/684/cover.png
---

# 題目敘述

![](/img/LeetCode/684/question.jpeg)
![](/img/LeetCode/684/question2.jpeg)

- 題目難度: `medium`
- 題目敘述: 在這個問題中，Tree是一個無向圖，它是Connected的且沒有環。給定一個圖，它最初是一棵包含 `n` 個節點（標記為 `1` 到 `n`）的樹，但後來新增了一條額外的邊。這條新增的邊連接了從 `1` 到 `n` 中選擇的兩個不同的節點，且這條邊之前並不存在於樹中。這個圖由一個長度為 `n` 的陣列 `edges` 表示，其中 `edges[i] = [a_i, b_i]` 表示在圖中節點 `a_i` 和 `b_i` 之間存在一條邊。題目要求 **返回一條可以被移除的邊，使得剩下的圖仍然是一棵包含 n 個節點的樹。** 如果有多個答案，請返回輸入中 **最後出現的那條邊。**

# 解法

## 一開始的想法

一開始的想法想說，只要按照原先找 Connected Components 的思路，在 Adjacency List 找鄰居的時候，如果找回到已經造訪過的點，那就會是有迴圈，則該edge 是可被移除的。

> 這樣的想法沒錯，但實際執行時卻會碰到 DFS 遍歷順序的問題，例如測資 `[[1,2],[1,3],[2,3]]`，當加入 `edges[2] = {2,3}` 時，會形成一個環（cycle），迭代時會按照鄰接陣列內部存儲順序遍歷當前節點的鄰居，因此有可能會順序不對，給出的邊不一定最後加入的，因為遇到的節點可能只是比較早造訪過。

```
  1
 / \
2---3
```

因此想法改成:

{% note info %}
- 逐步將邊加入圖，並在每次加入時檢查是否會形成環
- 如果新加入的邊形成環，則該邊是冗餘的邊，應該被移除
- 如何檢測環？
    - 使用 DFS 來檢查是否新加入的邊導致環
    - 若 DFS 訪問到 已訪問過的節點，則代表形成環
{% endnote %}


## 我的解法

```c++
class Solution {
public:
    bool dfs(vector<bool> &visited, vector<vector<int>> &adjList, int prevNode, int node){
        visited[node] = true;
        for(int neighbor: adjList[node]){
            if(neighbor == prevNode) continue;
            if(visited[neighbor] || dfs(visited, adjList, node, neighbor)){
                return true;
            }
        }
        return false;
    }
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int n = edges.size();
        vector<vector<int>> adjList;
        adjList.resize(n+1);
        
        for(auto edge: edges){
            // construct adjacency list
            adjList[edge[0]].push_back(edge[1]);
            adjList[edge[1]].push_back(edge[0]);

            vector<bool> visited(n+1, false);
            if(dfs(visited, adjList,-1, edge[0])){
                // cycle detected, return redundant edge
                return edge;
            }
        }
        return {};
    }
};
```

**這裡不單獨用迴圈迭代 `edge` 來建構鄰接串列，而是在迭代過程中一邊加入，之後就去檢查是否有 Cycle。** 由於條件 `1 <= ai < bi <= edges.length` 因此用於存儲造訪狀態的陣列 `visited` 以及 `adjList` 的大小會是 `n+1`。 接著就可以進行 DFS。

這題的 DFS 函式 `bool dfs(vector<bool> &visited, vector<vector<int>> &adjList, int prevNode, int node)` 主要用於檢測有無 Cycle。因此在造訪節點後首先更新 `visited` 為 `true` 並且迭代當前節點的鄰居，確保所有相鄰的節點都會被檢查。接著 `if(neighbor == prevNode) continue;` 代表跳過來自 prevNode 的邊，這是因為無向圖中，每條邊都是雙向的，(`1` 接到 `2` 等同於 `2` 接到 `1`)

```
1-2
```

接著就是檢測環

```c++
if (visited[neighbor] || dfs(visited, adjList, node, neighbor))
```
- 如果 `neighbor` 已經被造訪過，代表存在一條 回到已訪問節點的邊，這就是一個環，直接回傳 true
- 如果 `neighbor` 沒訪問過，則使用 dfs() 遞迴往下探索，如果在後續遞迴中找到了環，則回傳 true

如果到最後都沒檢查出環，那就是 false。回到 `findRedundantConnection` 如果有環，那就回傳當前的邊 `edge` 做為需要移除的邊，如果無環，則回傳空陣列。


### 執行結果

![](/img/LeetCode/684/result.jpeg)


# 複雜度

時間複雜度
$O(V + E)$，在無向圖中通常 E ≈ V，所以 DFS 的複雜度可以近似為 $O(V)$

空間複雜度
$O(V+E)$ 儲存 $V$ 個節點跟  $E$ 條邊

---