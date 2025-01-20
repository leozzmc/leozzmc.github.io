---
title: 刷題知識整理 | 圖(Graph)-3
tags:
  - Graph
  - DAG
  - Cycle
  - LeetCode
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/graph/cover.png
abbrlink: 597eaffb
date: 2025-01-20 11:32:23
---

# 前言

要能夠確保像是有先修微積分，才能修工程數學，這種 **有前後關係的圖論問題**，通常會用 **拓樸排序(Topological Sort)** 

![](/img/LeetCode/graph/course.png)


## 尋找 Strong Connected Components(SCC)

- Strong Connected Components 的定義就是從 vertex(A) 走到 vertex(B) 同時 vertex(B) 也要有 edge 連到 vertex(A)
- 透過 DFS 只能從一個方向找到 Connected Components，但如果要滿足 SCC 要從不同搜尋起點做兩次 DFS 才有辦法得到 Strong Connected Components



# 參考
https://alrightchiu.github.io/SecondRound/graph-li-yong-dfsxun-zhao-dagde-topological-sorttuo-pu-pai-xu.html
https://hackmd.io/@bangyewu/BknWuaVlT#Topological-sort%E7%AF%84%E4%BE%8B
https://bclin.tw/2022/01/18/leetcode-207/