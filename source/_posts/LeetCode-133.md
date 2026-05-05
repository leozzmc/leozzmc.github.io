---
title: 複製圖 | Medium | LeetCode#133. Clone Graph
tags:
  - Graph
  - DFS
  - Hash Table
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 8d1c6ed0
date: 2024-12-31 10:23:24
cover: /img/LeetCode/133/cover.png
---


# 題目敘述

![](/img/LeetCode/133/question.jpeg)

- 題目難度：`Medium`
- 題目描述： 題目給定了一個 connected undirect graph 中節點的參考設計，希望你回傳這個 graph 的 [Deep Copy](https://en.wikipedia.org/wiki/Object_copying#Deep_copy)

```
class Node {
    public int val;
    public List<Node> neighbors;
}
```

> 其實看到 Deep Copy 就可以想的是要用 Hash Table 了

{% note info %}
這題還有說明，這題節點的 index 與節點的 value 相同，也就是第一個節點的 `val` 就會是 `1` ，而第二個節點的 `val` 就會是 `2` 以此類推。 然後題目會給定一個 adjacency list 這個 list 中的每個 sublist 都描述了個別節點與其他節點的相鄰狀況，例如：

```
adjList = [[2,4],[1,3],[2,4],[1,3]]
```

這代表第ㄧ個節點 (`index=0`) 的鄰接節點有 `val==2` 以及 `val==4` 的節點。 而這代表第二個節點 (`index=1`) 的鄰接節點有 `val==1` 以及 `val==3` 的節點，以此類推。

{% endnote %}

# 解法

## 一開始的想法

我的想法就是要透過 hash table 紀錄原先節點以及新節點之間的對應關係，邏輯會有點像是這題 [LeetCode#138. Copy List with Random Pointer](https://leozzmc.github.io/posts/28674f4b.html)，透過建立節點的 hash table 可以輕易的進行 deep copy。所以為了要將節點保存到 Hash Table 需要先對 Graph 進行 Traversal。

## 我的解法

```c++
/*
// Definition for a Node.
class Node {
public:
    int val;
    vector<Node*> neighbors;
    Node() {
        val = 0;
        neighbors = vector<Node*>();
    }
    Node(int _val) {
        val = _val;
        neighbors = vector<Node*>();
    }
    Node(int _val, vector<Node*> _neighbors) {
        val = _val;
        neighbors = _neighbors;
    }
};
*/

class Solution {
public:
    Node* cloneGraph(Node* node){

        if(node==nullptr) return nullptr;

        // Step1: BFS traveral for constructing an map
        unordered_map<Node*, Node*> nodeMap;
        queue<Node*> nodeToVisit;
        nodeToVisit.push(node);
        
        nodeMap[node] = new Node(node->val);

        while(!nodeToVisit.empty()){
            Node* current = nodeToVisit.front();
            nodeToVisit.pop();

            for(Node* n : current->neighbors){
                if(nodeMap.find(n) == nodeMap.end()){
                    nodeMap[n] = new Node(n->val);
                    nodeToVisit.push(n);
                }
                // Update the adjlist of current node to the corresponding new nodes
                nodeMap[current]->neighbors.push_back(nodeMap[n]);
            }
        }
        // Step2: Recreate new nodes from the map
        return nodeMap[node];
    }
};
```

這裡首先先宣告 Hash Table  `unordered_map<Node*, Node*> nodeMap` 以及用於進行 BFS 的 queue `nodeToVisit`，接著就會將初始節點 `node` push 進 queue 中，並且將其保存於 hash table 中，這一步驟同時會在 `node` 這個 key 對應到新建立的節點，並且該節點具有與 `node` 相同的節點值 （`nodeMap[node] =  new Node(node->val)`）。

接著就能夠進行 BFS Traversal，當 queue 未空時，取出 front 節點作為當前的搜尋起點，接折會去迭代 `current` 的 adjacency list `neighbors` 若在 `nodeMap` 中沒有找到該節點為 key 的 entry 則這時會去新增一筆 entry，並且會把該節點 push 進入queue 中作為之後的搜尋起點。接著就是要把 `current` 所有的鄰接節點都更新到 `nodeMap[current]` (也就是對應的新節點) 的 adjacency list (`nodeMap[current]->neighbors.push_back(nodeMap[n]);`)


函數的最後回傳任意新節點。

### 執行結果

![](/img/LeetCode/133/result.jpeg)

# 複雜度

時間複雜度

$O(N+ E)$：使用 queue 進行 BFS 遍歷，每個節點被訪問一次，每條邊也被處理一次，$N$ 為圖中節點數量，而 $E$ 為邊的數量

空間複雜度

$O(1)$

---