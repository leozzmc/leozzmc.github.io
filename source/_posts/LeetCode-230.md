---
title: BST 中第K小的元素 | Medium | LeetCode#230. Kth Smallest Element in a BST
tags:
  - Binary Search Tree
  - Traversal
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/230/cover.jpeg
abbrlink: 34a2c233
date: 2024-09-05 09:53:29
---

# 題目敘述

![](/img/LeetCode/230/question1.jpeg)
![](/img/LeetCode/230/question2.jpeg)

- 題目難度：`Medium`
- 題目敘述：給定一個 Binary Search Tree 的 `root`，以及一個整數 `k` ，回傳第 $k^{th}$ 小的節點值

# 解法

> 這題是刷題到目前下來解最快的一題，從打開題目到最後 Accept 大概花 15 分鐘，其中包含 5 分鐘在local端手動寫測試
 
## 一開始的想法

題目要求回傳 第 K 個最小的節點值，所以想法很簡單，**首先 BST 的由左至右的大小排序跟你對樹進行 In-Order Traversal 的順序會一致，因此當你進行 In-Order Traversal 第一個拜訪的節點就會是最小值，接著拜訪到的就是 BST 中第二小的節點，依序下去...。** 因此只要透過一個 counter 來計算現在是否第K個節點就好，如果找到就回傳節點值。

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
    int count =0;
    int result;
    void dfs(TreeNode *current, int k){
        if(current==nullptr) return;
        dfs(current -> left, k);
        //node visiting
        count++;
        if(count==k){result=current->val;return}
        dfs(current -> right,k);

    }   
    int kthSmallest(TreeNode* root, int k){
        if(root==nullptr) return -1;
        dfs(root, k);
        return result;
    }
};
```

這裡除了題目給的 `kthSmallest` 函數之外額外宣告了一個 `dfs` 來進行節點走訪，另外有宣告一個 `count` 來記錄當前是第幾個節點， `result` 負責儲存回傳結果。 在節點拜訪過程中只要 `count == k` 就將節點值保存在 `result` 當中

> 其實這時候就可以 return 了，沒必要走訪完整棵樹

### 執行結果

![](/img/LeetCode/230/result.jpeg)


# 複雜度

## 時間複雜度

$O(N)$，$N$ 為節點總數

## 空間複雜度

$O(H)$，$H$ 為樹高，最壞狀況下會為 $O(N)$，而平衡樹的狀況下會是 $O(LogN)$