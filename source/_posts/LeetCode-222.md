---
title: 計算完整二元術節點 | Easy | LeetCode#222. Count Complete Tree Nodes
tags:
  - Tree
  - Binary Tree
  - Complete Binary Tree
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: e51c6896
date: 2024-08-16 08:12:22
cover: /img/LeetCode/222/cover.jpg
---

# 題目敘述

![](/img/LeetCode/222/question1.jpeg)

![](/img/LeetCode/222/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 題目要求給定一個 **Complete Binary Tree** 的 `root`，需要計算 Tree 中的所有節點

> 根據[維基百科](https://zh.wikipedia.org/wiki/%E4%BA%8C%E5%8F%89%E6%A0%91)定義，在一顆二元樹中，若除最後一層外的其餘層都是滿的，並且最後一層要麼是滿的，要麼在右邊缺少連續若干節點，則此二元樹為完全二元樹（Complete Binary Tree）。深度為k的完全二元樹，至少有 $\displaystyle 2^{\begin{aligned}k-1\end{aligned}}$ 個節點，至多有 $\displaystyle 2^{\begin{aligned}k\end{aligned}}-1$　個節點。

最後題目有個要求是，**請設計一套演算法其時間複雜度小於 $O(n)$**

![](/img/LeetCode/222/tree.png)

# 解法

## 一開始的想法

這題我一開始的想法其實都是 $O(N)$ 的做法 (各種 Traversal 算節點)，到後面是想說，首先可以瘋狂往樹的左子樹走就可以知道整顆 Tree 的 leftmost 節點，這樣也就能夠知道這個Tree 的高度。 接下來只要能夠知道 leaf 數量就能夠得到節點總數了。

但為了找到 leaf，我想到的所有辦法都必須先耗費 $O(N)$ 的複雜度，因為如果在已知高度的狀況，剩餘未知就是最後一層的數量。

{% note info %}
之後參考了 [這篇](https://leetcode.wang/leetcode-222-Count-Complete-Tree-Nodes.html) 的做法，才恍然大悟，其實一定還是會有 Traversal，但我們把部分狀況的複雜度降低，那整體的時間複雜度就不會是 $O(N)$ 了，但是為了找到 Leaf，大多做法肯定會讓複雜度提升到 $O(N)$，所以需要換一種作法
{% endnote %}

## 說明

在提到正確做法前，需要知道甚麼是 Perfect Binary Tree，可以參考我之前的紀錄 - [樹 (Tree) | 基礎篇](https://leozzmc.github.io/posts/tree_for_leetcode.html#Binary-Tree)，一個 Perfect Binary Tree 代表除了Leaf Node外，所有節點都有兩個 child node，並且所有 leaf node 都有相同高度

![](/img/LeetCode/222/perfect.png)


{% note info %}
對於一個 Perfect Binary Tree，節點的總數就是一個累加值: $2^{0} + 2^{1} + ... + 2^{h-1}$ 其中 $h$ 為樹的高度。透過等比數列可以計算最後的 sum 會是 $2^{h}-1$，這也就滿足剛剛所說 Complete Binary Tree 的節點數量範圍，畢竟 Complete Binary Tree 在最後一層填滿後就會是 Perfect Binary Tree 了

{% endnote %}


## 我的解法

如果今天是一個普通的Binary Tree 求節點，那僅需要寫下面這樣就好:

```cpp
int countNodes(TreeNode* root){
    if(root==null) return 0;
    return countNodes(root->left) + countNodes(root->right) +1;
}
```
這樣它會遞迴找到 leaf，並且從 leaf 開始加1累加回最一開始的caller。

而今天我們題目中，對於 Perfect Binary Tree 有公式解: $2^{h}-1$，因此把他從遞迴中獨立出來計算，**所以就會需要先判斷Tree 是否是 perfect 的**

我們可以透過找到 Tree 中的 Leftmost node 以及 rightmost node 來知道樹的左側高度跟右側高度，如果高度不一樣那就不是 Perfect Binary Tree，反之則為 Perfect Binary Tree。

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
    int counter =0;
    int countNodes(TreeNode* root) {
        TreeNode *current = root;
        if(current==nullptr) return 0;
        
        int leftheight=0;
        TreeNode *leftNode = root;
        while(leftNode!=nullptr){
            leftNode=leftNode->left;
            leftheight++;
        }

        
        int rightheight=0;
        TreeNode *rightNode = root;
        while(rightNode!=nullptr){
            rightNode=rightNode->right;
            rightheight++;
        }
        
        // perfect binary tree, the number of nodes is 2^0+2^1+2...+2^h (h is the height of tree) = 2^h -1
        if(leftheight == rightheight){
            return (1 << leftheight) -1;
        }
        else{
            return countNodes(current->left) + countNodes(current->right) +1;
        }
    }
};
```


### 執行結果

![](/img/LeetCode/222/result.jpeg)

# 複雜度

這題的重點會是複雜度，需要確定這樣的複雜度是否小於 $O(N)$

## 時間複雜度

對於 `countNodes` 的時間計算假設為 $T(n)$ 那對於他的左右子樹的時間計算就會是 $T(n/2)$，對於每一層計算高度的複雜度可以記為 $log_{2}n$

因此對於一個Non-perfect binary tree (Complete Binary Tree) 的計算耗費時間可以記為 $T(n)=T(n/2)+ c \cdot log_{2}n $ 如果逐項遞迴進行化簡

$T(n/2) = T(n/4) + c \cdot log_{2}(n/2)$, $T(n)=T(n/4)+ c \cdot log_{2}(n/2) + c \cdot log_{2}(n) $ 一路計算下去

$T(n) = T(1) + c \cdot 2 log(n) \cdot (log(N+1))$

因此整體時間複雜度為 $O(Log^{2}n)$

## 空間複雜度

$O(logn)$，主要由 function call stack 深度決定。