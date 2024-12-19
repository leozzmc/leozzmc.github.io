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
cover:
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

相鄰矩陣

# 相關概念解釋

# 圖的應用場景

# 參考
- https://hackmd.io/@meyr543/SJJ47oWoY
- https://ithelp.ithome.com.tw/articles/10336847
- https://ithelp.ithome.com.tw/articles/10268666?sc=rss.iron
- https://hackmd.io/@bangyewu/BknWuaVlT
- https://alrightchiu.github.io/SecondRound/graph-introjian-jie.html
---