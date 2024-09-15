---
title: '刷題知識整理 |  Backtracking & Recursive'
tags:
  - Backtracking
  - Algorithms
  - LeetCode
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 48f553b3
date: 2024-09-15 18:54:56
cover:
---

# 回溯法(Backtracking) 介紹

>　Backtracking 算是一種窮舉演算法，它的核心思想在於 **「路走不通就回頭」**，也就是當你想要搜尋一個資料的時候，某一個資料路徑走不通，就退回上一步，然後走其他路。所以一定會有一個條件用來判斷是不是要走的路，不符合條件就退回。

Backtracking 可以通常透過遞迴來實現

# 核心概念

#### **Enumerate**
   - 列出每一個可進行的下一步  
####  **Pruning**
   - 遇到不符合條件的，就省略下一步，不繼續枚舉
   - 這其實比較進階，其實就是要能夠讓搜尋提早結束

> 老實說之前在解 Tree 相關概念的時候都已經有用到 backtracking 的概念，像是 DFS，在一開始就會設定終止條件 (Ex.走到leaf) 然後每次都會去遞迴呼叫下個dfs函數，來去走訪下一個節點。

# 遞迴

在解 backtracking 題目的時候，通常可以使用遞迴回來實現，那最好還是要先了解遞迴的想法。遞迴的核心想法就是 **「大問題拆成多個小問題，小問題也能按照相同方式切成更小的問題」**、**「除了最小的問題之外，每層的解決方式都一樣」**

![](/img/LeetCode/backtracking/recursion.png)

## 河內塔問題(Tower of Hanoi)

![](/img/LeetCode/backtracking/tower1.png)

河內塔問題就是經典的遞迴問題，它的問題是，**有三根柱子，並有 N 個圓盤套在最左邊柱子上面（上圖 N = 4)，現在我們要把它們全部移動到最右邊的柱子上，請問我們最少需要移動幾次？**

{% note info %}
1. 每次可選一個柱子，移動最上方的圓盤，一次只能一動一個
2. 大的圓盤不可以疊在小的上面
{% endnote %}

這裡就需要 Follow 一下遞迴的思維，**靠解決多個小問題來解決大問題**。 這裡的大問題就是 **要怎麼移動四個圓盤到最右邊要幾個步驟?** 而小問題則是 **移動三個圓盤要幾步?**

> 這邊問題本質一樣，只是問題範圍縮小而已，這裡假設我們已經知道移動兩個圓盤的答案，可以將問題想像成下面圖這樣

![](/img/LeetCode/backtracking/tower2.png)

1. 從左邊將上面三個圓盤移動到中間 (怎麼移動的先不管，總之目前結果就是有三個圓盤疊在中間)
2. 將最左邊的圓盤移動到最右邊
3. 將中間三個圓盤移動到最右邊  (怎麼移動的先不管，總之目前結果就是三個圓盤疊到最右邊圓盤)

因為題目在意的是 **移動的步驟數**，先假設移動左邊三個盤子到中間需要 $K$ 個步驟數，而將剩餘一個盤子移動到最右邊需要 1 個步驟數，最後將中間三個盤子移動到最右邊會需要 $K$ 個步驟數，因此整體步驟數會是 $2*K +1$。

從大小問題的關係中可以得到關係式會是 : $ F(N) = 2*F(N-1)+1$，其中 $F(N)$ 為移動 $N$ 個盤子的步驟數。當然實作的時候還需要考慮最小的問題，這裡最小的問題就是一個圓盤移動的步驟數，那當然就是 1 。因此我們可以將演算法寫成像是下面這樣:

```cpp
int HanoiTower(int n){
    if n==1 return 1;
    return 2* HaniTower(n-1) +1;
}
```

> 總結，在碰到遞迴時候總是要想這三點 (1) 大小問題分別是甚麼 (2) 大小問題的關聯式怎麼寫 (3)最小問題會是甚麼?


# Backtracking 問題分類


#　Backtracking 相關 LeetCode 題目

# Reference
[1] https://www.secondlife.tw/algorithms-backtracking/
[2] https://web.ntnu.edu.tw/~algo/Backtracking.html
[3] https://medium.com/@ralph-tech/%E6%BC%94%E7%AE%97%E6%B3%95%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E5%9B%9E%E6%BA%AF%E6%B3%95-backtracking-%E5%88%86%E6%94%AF%E5%AE%9A%E7%95%8C%E6%B3%95-branch-and-bound-29165391c377
[4] https://wiki.csie.ncku.edu.tw/acm/course/Backtracking
[5] https://www.javatpoint.com/backtracking-introduction
[6] https://willrosenbaum.com/teaching/2021s-cosc-112/notes/recursive-image/