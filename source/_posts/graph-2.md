---
title: 刷題知識整理 | 圖(Graph)-2
tags:
  - Graph
  - LeetCode
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/graph/cover.png
abbrlink: 2e799f6d
date: 2024-12-23 14:28:08
---


# 前言

這裡接續前一篇關於 [圖的基本介紹](https://leozzmc.github.io/posts/2009beb7.html)，接著需要來了解在圖中要如何搜尋特定的 vertex，也就是需要知道怎麼走訪圖，主要有三種基本的演算法:

- Breadth-First Search (BFS)： 用於有向和無向圖的走訪
- Depth-First Search (DFS)：用於有向和無向圖的走訪
- Topological Search： 用於偵測有向無環圖(Directed Acyclic Graph, DAG)的偵測。

# BFS

以前有介紹過 [Tree的 BFS(Level-Order Traversal)](https://leozzmc.github.io/posts/tree_for_leetcode.html?highlight=tree#Level-order-Traversal)，Level-Order 會依序造訪不同level的節點，而level 其實就對應到 Graph概念中節點與節點之間的距離(Distance)，它其實就代表 root 和 node 之間的距離。 那圖的 BFS又會有哪些差異呢？如果要走訪一個 connected 的無向圖，那可以由任意節點(假設是 vertex(A))出發，另外由於是 connected 的， **因此可以走訪跟 vertex(A)相同connected components的所有節點，並且獲得距離vertex(A)的最短距離，和可走的路徑**

## 演算法介紹

進行 `bfs()` 之前會需要幾個資料結構來儲存走訪過程中的資料：

{% note info %}
- queue：跟 Tree BFS 一樣，用於依序紀錄各層節點
- label：用於紀錄每個節點查找狀態，需要紀錄 `找過`, `沒找過`, `已移除`
- distance array：用來記錄各節點距離起點的距離
- predecessor array：用來紀錄每個節點是由是從節點找到，可以用來回溯路徑
{% endnote %}

  
{% hideToggle Step1 初始化資料結構 ,bg,color %}
![](/img/LeetCode/graph/init.png)
{% endhideToggle %}

首先需要初始化:
- 所有 vertex 都是 `沒找到`
- 所有 vertex 的距離都設無限大
- 將所有 vertex 的 predecessor 清除(`NULL` 或 `-1`)
- 建立一個空的queue

{% hideToggle Step2 Push起點 ,bg,color %}
![](/img/LeetCode/graph/bfs-1.png)
{% endhideToggle %}

接著

(1) 將起點 push 到 queue 中，這裡選擇起點為 vertex(A)
(2) 將vertex(A) 標注為 `已找到` (這裏用灰色表示)
(3) 並且將 `distance[A]` 設為 0， **設為0就代表這個vertex會是這個connected components 上的起點** 
(4) `predecessor[A]` 不變，這樣代表在 BFS結束後，只要 `predecessor` 值為 null 的節點即為起點

{% hideToggle Step3   Search Neighbors ,bg,color %}
![](/img/LeetCode/graph/bfs-2.png)
{% endhideToggle %}



接著需要以 **queue 的 front 作為新的搜尋起點** ，新的起點會是 vertex(A)，這時需要搜尋 vertex(A) 的鄰居，vertex(A)的 neighbor可以從 Adjacency Matrix或 Adjacency List 中獲得。找到後需要做三件事：

(1)將搜尋到的vertex標注為 `已找到` (這裏用灰色表示)
(2) 將搜尋到節點對應的 distance 設為 `distance[A]+1`
```
distance[B] = distance[A]+1 = 1 
distance[C] = distance[A]+1 = 1 
```
(3) 將搜尋到節點的 predecessor 設為 vertex(A)
(4) 按照節點找到的順序，依序push進queue
(5) 將 vertex(A) 移出 Queue

繼續以queue的front當作新的起點搜尋。這時新的起點會是 vertex(B)，這時需要搜尋 vertex(B) 的鄰居

{% hideToggle Step4  vertex(B)  Search Neighbors ,bg,color %}
![](/img/LeetCode/graph/bfs-4.png)
{% endhideToggle %}

(1)將vertex(D), vertex(E)標注為 `已找到` (這裏用灰色表示)
(2) 將搜尋到節點對應的 distance 設為 `distance[B]+1`
```
distance[D] = distance[B]+1 = 2 
distance[E] = distance[B]+1 = 2 
```
(3) 將搜尋到節點的 predecessor 設為 vertex(B)
(4) 按照節點找到的順序，依序push進queue
(5) 將 vertex(B) 移出 Queue

由於 vertex(B) 已經被移除了，因此queue的新的front - vertex(C) 會是新的起點。 

{% hideToggle Step5  vertex(C)  Search Neighbors ,bg,color %}
![](/img/LeetCode/graph/bfs-5.png)
{% endhideToggle %}

(1)將vertex(F)標注為 `已找到` (這裏用灰色表示)
(2) 將搜尋到節點對應的 distance 設為 `distance[C]+1`
```
distance[F] = distance[C]+1 = 2 
```
(3) 將搜尋到節點的 predecessor 設為 vertex(C)
(4) 按照節點找到的順序，依序push進queue
(5) 將 vertex(C) 移出 Queue


之後一路重複循環，直到 queue被清空，則完成圖的 BFS 走訪

{% hideToggle Following Steps ,bg,color %}
![](/img/LeetCode/graph/bfs-6.png)
{% endhideToggle %}


## 程式碼實作

```c++
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <climits>
using namespace std;

class Graph{
    private:
        int num_vertex;
        vector<vector<int>> adjList;
        int *label,  // 0: not found, 1: found, 2. removed
            *distance,  // 0: starting point, MAX_INT: vertex that cannot be found by the starting point
            *predecessor; // -1: no predecessor, starting point
    public:
        Graph(): num_vertex(0) {};
        Graph(int N): num_vertex(N){
            adjList.resize(num_vertex);
        };
        //member function
        void addEdgeList(int from, int to);
        void bfs(int start);
        
         // Getter functions for debugging
        int getNumVertex() const { return num_vertex; }
        int* getDistances() const { return distance; }
        int* getPredecessors() const { return predecessor; }
};

void Graph::addEdgeList(int from, int to){
    adjList[from].push_back(to);
}

void Graph::bfs(int start){

    // init the arrays
    label = new int[num_vertex];
    distance = new int[num_vertex];
    predecessor = new int[num_vertex];

    for(int i=0; i<num_vertex; i++){
        label[i] = 0;
        distance[i] = INT_MAX;
        predecessor[i] = -1;
    }
    queue<int> q;
    int i=start;

    for(int j=0; j<num_vertex; j++){
        if(label[i]==0){
            label[i]=1;
            distance[i]=0;
            predecessor[i]=-1;
            q.push(i);
            while(!q.empty()){
                int u = q.front();
                for(auto it=adjList[u].begin(); it!=adjList[u].end(); ++it){
                    if(label[*it]==0){
                        label[*it]=1;
                        distance[*it] = distance[u] + 1;
                        predecessor[*it] = u;
                        q.push(*it);
                    }
                }
                q.pop();
                label[u] = 2;
            }
        }
        i =j;
    }
}

int main(){

    //construct the graph
    Graph g1(8);
    g1.addEdgeList(0,1); g1.addEdgeList(0,2);
    g1.addEdgeList(1,0); g1.addEdgeList(1,3); g1.addEdgeList(1,4);
    g1.addEdgeList(2,0); g1.addEdgeList(2,5);
    g1.addEdgeList(3,1); g1.addEdgeList(3,4); g1.addEdgeList(3,6);g1.addEdgeList(3,7);
    g1.addEdgeList(4,1); g1.addEdgeList(4,3); g1.addEdgeList(4,5); g1.addEdgeList(3,7);
    g1.addEdgeList(5,2); g1.addEdgeList(5,4); g1.addEdgeList(5,6); 
    g1.addEdgeList(6,3); g1.addEdgeList(6,5); g1.addEdgeList(6,7);
    g1.addEdgeList(7,3); g1.addEdgeList(7,4); g1.addEdgeList(7,6);

    g1.bfs(0);

    for (int i = 0; i < g1.getNumVertex(); i++) {
        cout << "Distance[" << i << "]: " << g1.getDistances()[i] << " | ";
        cout << "Predecessor[" << i << "]: " << g1.getPredecessors()[i] << endl;
    }


    return 0;
}
```

輸出結果:

```
Distance[0]: 0  | Predecessor[0]: -1
Distance[1]: 1  | Predecessor[1]: 0
Distance[2]: 1  | Predecessor[2]: 0
Distance[3]: 2  | Predecessor[3]: 1
Distance[4]: 2  | Predecessor[4]: 1
Distance[5]: 2  | Predecessor[5]: 2
Distance[6]: 3  | Predecessor[6]: 3
Distance[7]: 3  | Predecessor[7]: 3
```

## 延伸概念

透過得到的 `predecessor` 陣列，可以知道由起點開始的節點先後關係，可以畫出一個 predecessor subgraph，通常具有 connected 和 acyclic 的特性，這使得 predecessor subgraph 會是一個以起始點 vertex 為root的一顆tree，這種樹又被稱為 **Breadth-First Tree** 其中相互連接vertex的edge 又被稱為 **Tree Edge** 

![](/img/LeetCode/graph/subgraph-1.png)


{% note info %}
一張圖的 Breadth-First Tree 可能不只一種，因為 Predecessor Array 會是由發現vertex 的先後順序組成，而vertex 發現順序則是會被建構 adjList 的順序所影響，順序不同則建構出的 Breadth-First Tree 也不盡相同。 雖然 Breadth-First Tree 結構不同，最後節點與節點彼此的距離依舊相同。 (使用 `vector<vector<int>>` 作為鄰接表時，鄰居節點的遍歷順序取決於節點在 `vector<int>` 中的排列順序（即插入順序）)
{% endnote %}


> 若 Graph 本身包含多個 connected components，則可能可以畫出 Breadth-First Forest



# 參考
https://alrightchiu.github.io/SecondRound/graph-breadth-first-searchbfsguang-du-you-xian-sou-xun.html


---