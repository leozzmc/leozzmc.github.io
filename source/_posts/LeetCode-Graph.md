---
title: 刷題知識整理 | 圖(Graph)
tags:
  - Graph
  - LeetCode
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 2009beb7
date: 2024-12-17 19:44:16
cover: /img/LeetCode/graph/cover.png
---


# 前言

以前我們在儲存資料的時候，常見的資料結構有陣列、雜湊表、鏈結串列等。想像你今天你剛上大學然後有個修課表，用表格列出各種課程，但你並不知道哪些課程需要先修，哪些可能需要之後再修，或者某些課程可能會擋修，這時候用圖來表示課程之間的關係就很方便了。所以圖的重點之一 **就是保存資料與資料之間的關係** 。

![](/img/LeetCode/graph/course.png)

> 這篇部落格主要參考 [這篇](https://alrightchiu.github.io/SecondRound/graph-introjian-jie.html) 的講解

# 圖(Graph)的定義

延續上面的課程圖，每個課程都代表一個 **節點**，節點是可用於存放資料，資料就是課程名稱。而課程與課程之間有箭頭相連，代表課程與課程之間的關係。

**vertex**: 每個節點在圖中被稱為vertex，或 node，並定義所有 vertex 的集合叫做 $V$ 或是  $V(G)$
**edge**: 每個線段稱為 edge， **在圖中通常會用一對vertex 來表示他們之間的edge** ，$(V_{i}, V_{j})$ 就代表 $V_{i}$ 與 $V_{j}$ 之間的 edge，通常定義所有 edge 的集合為 $E$ 或者 $E(G)$

> 有了 $V$ 和 $E$ 就可以定義什麼是圖， **也就是節點與節點之間關係的集合** $G(V, E)$

## 圖的分類

圖主要根據 edge 是否有方向性來分成 **有向圖(Directed Graph)** 跟 **無向圖(Undirected Graph)**

**有向圖(Directed Graph)** ： vertex(A) 和 vertex(B) 之間的關係為單向的，則 edge具方向性，則所有vertex和有方向性edge 形成的集合為 directed graph
**無向圖(Undirected Graph)** ： vertex(A) 和 vertex(B) 之間的關係為雙向的，則他們之間的 edge 不具有方向性，因此所形成的 vertex和 edge 的集合為 undirected graph

![](/img/LeetCode/graph/graph-1.png)


## 圖的表示法

那如何用資料結構來表示圖呢，常見的表示法有 **相鄰矩陣(Adjacency Matrix)** 和 **相鄰串列(Adjacency List)** 。

### 相鄰矩陣
![](/img/LeetCode/graph/graph-2.png)

可以先看無向圖中透過相鄰矩陣的表示法，vertex(A) 到 vertex(B) 之間有 edge，則對應 (A,B) 以及 (B,A) 的位置為 1，若無任意兩 vertex 間沒有 edge 則矩陣值為0。而對於有向圖來說，如果 vertex(A) 到 vertex(B) 有 edge，但是 vertex(B) 到 vertex(A) 沒有 edge 則對應 (A,B)為1 但 (B,A) 為 0。

**從上面相鄰矩陣表示法中也可以發現，無向圖的相臨矩陣會是對稱的(Sysmetric)，而有向圖則否。另外這樣也可以推測出，將有向圖矩陣進行轉置後，重疊於原本的矩陣就會變成無向圖的表示法。**

有向圖：$A[i][j]=1$ 代表從節點 i 到節點j有邊
無向圖： $A[i][j]= A[j][i] = 1$ 代表從節點 i 到節點j存在無向邊

將 $A^T = A^{T}[i][j] = A[j][i]$ 代表從節點 j 到節點 i 有邊。 因此 $A_{undirected}[i][j] = A[i][j] V A[j][i]$

### 相鄰串列

![](/img/LeetCode/graph/graph-3.png)

相鄰串列表示法必須先用一個一為陣列來表示所有的 vertex，對於每個陣列再用Linked List 來表示跟他相連的其他 vertex。 **在這裡，接入 Linked List 的順序並不重要，因為 graph 是定義成 set** 。在上面的無向圖中，以 vertex(D) 為例，他會連接到 vertex(C), vertex(B), vertex(E)，因此 `[3]` 也就是 vertex(D) 可以建立連接到 vertex(C), vertex(B), vertex(E) 的 linked list (不用按順序)。而有向圖則是， **則 vertex(D) 的 linked list 只能接入由 vertex(D) 出發的節點，也就是 vertex(B) 和 vertex(E)。**

## 差異

|  |相鄰矩陣 |相鄰串列  |
|--|--|--|
|空間複雜度| $O(\lvert V \rvert^{2})$ | $O( \lvert V \rvert + \lvert E  \rvert)$|
|說明|適合稠密的圖(vertex和edge數量多)|適合稀疏的圖(edge數量少)|
|Access| 連續記憶體會比較快|動態記憶體較慢|
|Add edge|新增edge只是把對應位置從 0 設成 1，所以是 $O(1)$| 添加 vertex到Linked List 的 front，會是 $O(1)$，但 worst case 會是 $O( \lvert E \rvert )$|
|Delete edge|刪除 edge 只是把對應位置從1改成0，所以是 $O(1)$|如同在 Linked List刪除資料 $O( \lvert E  \rvert)$|


# 相關概念解釋

**Adjacent**: vertex(A) 與 vertex(B) 之間只要有 edge 就算是相鄰(adjacent)
**Subgraph**: 對於一個 $G'$ 來說若構成它的 Edge 和 Vertex 的集合滿足 $V(G')\subseteq V(G)$, $E(G') \subseteq E(G)$ 則 $G'$ 為 $G$ 的子圖
![](/img/LeetCode/graph/subgraph.png)
**Path**: 從 vertex(V1) 到 vertex(V2) 間，經過的一連串前後相接的 edge 被稱為 從vertex(v1) 到 vertex(v2) 的path
**Length/Distance**: path中的 edge數量
**Simple path**: 若一條 path 中，除了起點 vertex和終點 vertex 之外，其餘的vertex都只經過一次，則這條path為 simple path 
![](/img/LeetCode/graph/path.png)
**Cycle**:  若一條 simple path 的起點 vertex 和終點 vertex相同，則稱這條path 為 cycle，如果cycle 中的 edge 是無向的，那就是無向循環(undirected cycle) 若 cycle 中是按照方向依序經過，則該cycle 會是有向的 (directed cycle)
![](/img/LeetCode/graph/cycle.png)
**Acyclic graph**： 若 graph 中不存在 cycle 則稱該graph 為 acyclic graph，通常 tree 也是一種 graph， **然而如果在 tree 中找不到一個 simple path 它的起點vertex 以及終點 vertex是相同的，則該 tree 一定會是 acyclic graph**

**Weight**：也就是權重，通常可以代表兩個地理位置之間的距離或是成本，可以在 edge 上加上權重，有權重的 graph 又稱 weighted graph

**Connected**: 怎樣算是兩個 vertex 是彼此connected 的呢？那就是從 vertex(A) 可以走到 vertex(B), 從vertex(B)也能走到 vertex(A)，所以對於無向圖來說，就是 vertex(A) 和 vertex(B)有edge相連，對於有向圖來說那就是存在 edge(A→B) 以及 edge(B→A)

**Connected in undirected graph**: 對於無向圖來說，任意vertex都存在一條 **path**連接彼此，那就會稱這個無向圖為connteced的
![](/img/LeetCode/graph/connected.png)

**Connected components**：在無向圖中，存在某個 subgraph 是 connected 的，若加入其他vertex 或 edge 會破壞這個 connected 的特性，則稱為這個 subgraph 為 connected component。 上圖的下方的兩個 subgraph 都滿足這個特性。

**strongly connected in directed graph**: 在有向圖中，對於任意兩個 vertex(A) 和 vertex(B)，同時存在 (1) 從 vertex(A) 走到 vertex(B) 的 path  (2)  從 vertex(B) 走到 vertex(A) 的 path。則稱呼此有向圖為 strongly connected

![](/img/LeetCode/graph/connected-2.png)

**strongly connected component**: 在有向圖中，存在某個 subgraph 是 strongly connected 的，若加入其他vertex 或 edge 會破壞這個 strongly connected 的特性，則稱為這個 subgraph 為 strongly connected component。 (可以維持connected的最大集合)

**Self-loop**: 如果有 edge 從 vertex(A) 接到 vertex(A) 則為 self-loop

# 圖的應用場景

主要可以運用在 **最小生成樹(Minimum Spanning Tree, MST)**, **網路流量** 以及 **最短路徑問題** 等情景中，在套用情境前需要先知道 Graph 中搜尋vertex的方法。

# 參考
- https://hackmd.io/@meyr543/SJJ47oWoY
- https://ithelp.ithome.com.tw/articles/10336847
- https://ithelp.ithome.com.tw/articles/10268666?sc=rss.iron
- https://hackmd.io/@bangyewu/BknWuaVlT
- https://alrightchiu.github.io/SecondRound/graph-introjian-jie.html
---