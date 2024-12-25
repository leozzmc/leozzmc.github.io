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


# 參考
https://alrightchiu.github.io/SecondRound/graph-breadth-first-searchbfsguang-du-you-xian-sou-xun.html


---