---
title: 二元樹最大路徑總和 | Hard | LeetCode#124. Binary Tree Maximum Path Sum
tags:
  - Binary Tree
  - Traversal
  - LeetCode
  - Dynamic Programming
  - Hard
  - C++
categories: LeetCode筆記
aside: true
abbrlink: bea79d96
date: 2024-10-07 11:24:20
cover: /img/LeetCode/124/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/124/question1.jpeg)

![](/img/LeetCode/124/question2.jpeg)

- 題目難度：`Hard`
- 題目敘述： 題目給定你一個 Binary Tree 的 `root`，**求這棵二元樹中的所有路徑中，最大路徑和**

{% note info %}
這裡二元樹的路徑的代表的是 **節點序列**，序列由每個由邊連接的相鄰節點組成。一個節點最多只能在序列中出現一次。請注意，該路徑不需要經過Root節點
{% endnote %}

# 解法

> 這是第一次解 Hard，真的花比較久的時間，但也學習到很多

## 一開始的想法

我一開始的想法是有問題的，但還是紀錄一下這個錯誤思路，我一開始想得太簡單了，以為就先把所有二元樹的節點DFS 走訪一遍，就能夠得到一個節點順序，接著就是 backtracking 中的子集問題，在序列中找子集元素和最大的組合就是答案。

![](/img/LeetCode/124/algo1.png)

> 但這有一個缺陷，**那就是DFS(inorder)走訪過程的順序不滿足題目敘述的節點序列**

像是下面這個例子，經過 inorder 走訪過後的順序會是 `-8, 10, 20, -5, -10` 那這樣後面就可能以為 `10` 跟 `20` 會是相鄰的，且最大的就輸出 `30`，**但實際情況就是他們之間根本沒有邊相連。**
 
![](/img/LeetCode/124/case.jpeg)

因此這樣的做法會是錯的。

> 所以做法其實也算是 DFS 但不會是傳統意義上的 backtracking，在每一層中與當前最大的路徑值相加，並且將其與當前最大值比較，返回較大值

## 我的解法

```cpp
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    int maxPathSumHelper(TreeNode* node, int &globalMax) {
    if (node == nullptr) return 0;

    int leftMax = max(0, maxPathSumHelper(node->left, globalMax));
    int rightMax = max(0, maxPathSumHelper(node->right, globalMax));

    int currentMax = node->val + leftMax + rightMax;
    globalMax = max(globalMax, currentMax);
    return node->val + max(leftMax, rightMax);
}

    int maxPathSum(TreeNode* root) {
        int globalMax = INT_MIN; 
        maxPathSumHelper(root, globalMax);
        return globalMax;
    }
};
```

這裡主要定義了兩個函數，一個就是題目給的 `maxPathSum` 另一個是自己定義的 `maxPathSumHelper`

*maxPathSumHelper* 參數說明：
- `TreeNode *node`: 用於傳遞節點
- `int &globalMax`: 用於傳遞最大的 Max值 (Pass by reference)

遞迴的終止條件會是，一旦找到空節點則返回0，代表沒有可用的路徑和 (像是如果只有像是下面一個節點，路徑和就會是 20+0+0)

```
    20
   / \
NULL  NULL
```


接下來是遞迴處理的部分：

```cpp
int leftMax = max(0, maxPathSumHelper(node->left, globalMax));
int rightMax = max(0, maxPathSumHelper(node->right, globalMax));
```

計算左子樹的最大路徑和。如果左子樹的最大路徑和為負，則取 0 為 max值，因為負數會降低總路徑和，並將回傳結果保存到變數 `leftMax`。同理也計算右子樹的最大路徑和，若右子樹的最大路徑和為負，則取0 為max值，並將結果保存到變數 `rightMax`。

{% note info %}
這裡要注意如果要在本地用 `max` 函數，記得要加上標頭 `#include<algorithm>` 才能使用
{% endnote %}

接著就要考慮 **這條路徑從當前節點到左子樹和右子樹的最大路徑和。** 

```cpp
int currentMax = node->val + leftMax + rightMax;
```

接著要去將當前最大路徑和與 global 最大路徑和進行比較，目的是要更新 `globalMax` 確保 `globalMax` 始終是遍歷過程中發現的最大路徑和

```cpp
globalMax = max(currentMax, globalMax);
```
 
接著回傳當前節點的最大路徑和，當前節點到其左子樹或右子樹的最大路徑和。**這是為了讓上層遞歸的節點能夠選擇哪個子節點的路徑來構成更大的路徑和**

```cpp
return node->val + max(leftMax, rightMax);
```

{% note warning %}
一開始參數介紹有提到 `&globalMax` 參數是透過 pass by reference 傳遞的，這裡複習一下
- **Pass by value**: 當一個變數以值(Value)傳遞的方式作為函數參數時，**函數會創建一個變數的副本，在函數內部對該變數的修改不會影響到函數外的原始變數。**
- **Pass by reference**: 當使用引用(Reference)傳遞時，函數接受的是變數的引用(Reference)，**也就是該變數的「別名」。在函數內部對引用參數的修改會直接影響到函數外部的原始變數**

原理很簡單， **&** 就是一個取位址的運算子，因此你是直接修改該位址的變數，而不是像正常函數呼叫一樣，會在 push return address後再根據calling convention 依序將參數push到 call stack 中，你修改的是該變數實際存在的記憶體位址的值。因此，所有的修改都會直接反映在原來的變數上，而不需要在函數結束後再把修改結果回傳
{% endnote %}

> 所以加上 `&`，**函數內對 `globalMax` 的任何修改都會影響到外部的變數，這樣就可以確保在整棵樹的遞歸計算過程中，`globalMax` 不斷更新為當前的最大路徑和**

*maxPathSum*

```cpp
int maxPathSum(TreeNode* root) {
    int globalMax = INT_MIN; 
    maxPathSumHelper(root, globalMax);
    return globalMax;
}
```
傳入參數會是題目給的 `root` 節點，首先將 `globalMax` 初始化為常數 `INT_MIN` 防止溢位風險，接著呼叫  `maxPathSumHelper(root, globalMax)` 並且最後回傳全局最大的路徑和。

 
### 執行結果

![](/img/LeetCode/124/result.jpeg)


# 複雜度

## 時間複雜度

由於每個節點會被訪問一次，並且對每個節點進行常數次的運算，因此時間複雜度會是 $O(N)$, $N$ 為二元樹節點數量

## 空間複雜度

取決於遞迴的深度，與樹高成正比，因此平衡樹的狀況下會是 $O(Log(N))$，而最壞狀況下會是 $O(N)$

# 結語

**這一題並沒有進行「回溯」或者「嘗試其他可能的路徑」的過程**，因為二元樹的結構是固定的，對每個節點的路徑計算是確定的。程式是根據當前節點的值、左子樹最大值和右子樹最大值來計算當前路徑和，所以這不是一個典型的 backtracking 問題。 反而會是我可能尚未開始嘗試的 Dynamic Programming(DP) 問題，因為每一題都包含了 **選與不選 (選左子樹，或捨棄；選右子樹，或捨棄) 到問題**