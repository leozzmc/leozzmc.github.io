---
title: 所有 Root-Leaf 路徑總和 | Medium | LeetCode#129. Sum Root to Leaf Numbers
tags:
  - Binary Search Tree
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: d1a67e73
date: 2024-08-23 16:31:08
cover: /img/LeetCode/129/cover.jpeg
---


# 題目敘述

![](/img/LeetCode/129/question1.jpeg)
![](/img/LeetCode/129/question2.jpeg)

- 題目難度： `Medium`
- 題目描述：給定一個 Binary Tree 的 `root`，樹中的節點值為 0~9 的其中一個數字，從 Root 到 leaf 的節點值可以形成一個整數  ( `1->2->3` 就代表 `123` )，每一條從root到 leaf的路徑都有一個數字，本題需要你將每個數字加總。

{% note info %}
題目有提示，回傳的整數會需要為 **32-bit 整數**
{% endnote %}

# 解法

## 一開始的想法

這次的想法就會是，這種題目就是可以用 dfs 或者是 bfs 來解，這次選用 dfs 並且在每次拜訪節點的時候去紀錄節點值，並且可以再回傳到原先的 caller 的時候將原先的路徑值乘上10 (才能夠形成一個 10 進位數字)，然後後夾到當前節點值，一路遞迴回去就能得到某一路徑的加總值。

之後再將所有路徑的和在加總起來回傳就好。

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
    long long sum = 0;
    void dfs (TreeNode *current, int pathsum){
        if(current == nullptr) return;
        pathsum = current -> val + pathsum * 10;
        if(current->left != nullptr){
            dfs(current -> left, pathsum);
            
        }
        if(current->right != nullptr){
            dfs(current -> right, pathsum);
        }
        if(current->left == nullptr && current->right == nullptr) sum += pathsum;
        pathsum = 0;
    }

    int sumNumbers(TreeNode* current){
        if(current == nullptr) return 0;
        dfs(current, 0);
        return sum;
    }
};

```

我這裡拆分成兩個函數: `dfs` 以及題目給得 `sumNumbers` 也另外定義了兩個變數 `sum` 以及 `pathsum` 
- `sum` 用於儲存個條路徑總和的加總
- `pathsum` 則是在 DFS 過程中儲存節點的加總值


```cpp
void dfs (TreeNode *current, int pathsum){
    if(current == nullptr) return;
    pathsum = current -> val + pathsum * 10;
    if(current->left != nullptr){
        dfs(current -> left, pathsum);
        
    }
    if(current->right != nullptr){
        dfs(current -> right, pathsum);
    }
    if(current->left == nullptr && current->right == nullptr) sum += pathsum;
    pathsum = 0;
}
```
首先如果遇到 `nullptr` 就直接返回。而我們在拜訪節點的時候，會去將當前節點值，加上 `pathSum` 乘上 10，這代表將先前的節點進位並與當前節點值形成數字，並且更新到 `pathSum` 變數中，接著就是繼續 traverse，在遞迴左右子樹的過程中，一樣將 `pathSum` 作為參數，再下一次迭代中一樣去更新節點值，形成更大的數字。

> 可以看下面圖解

![](/img/LeetCode/129/algo.png)


### 執行結果

![](/img/LeetCode/129/result.jpeg)


# 複雜度

## 時間複雜度

用 DFS 遍歷了每個節點，因此是 $O(N)$，N 為節點數量。

## 空間複雜度

遞迴時候的 call stack 會與樹的形狀有關，最壞狀況會是 $O(N)$，如果是平衡樹就會是 $O(LogN)$

`sum` 或者 `pathSum` 等變數就是常數級別的複雜度，因此整體而言空間複雜度為 $O(N)$