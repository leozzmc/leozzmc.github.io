---
title: >-
  BST的最小共同祖先(LCA) | Medium | LeetCode#235. Lowest Common Ancestor of a Binary
  Search Tree
tags:
  - Linked List
  - Binary Search Tree
  - LCA
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 6a04863
date: 2025-08-30 16:07:15
cover: /img/LeetCode/235/cover.png
---

# 題目敘述

![](/img/LeetCode/235/question.png)

- 題目難度：`Medium`
- 題目描述：給定一個BST, 求在BST內任意兩節點的最小共同祖先，其中自己可以是自己的祖先，求任意兩節點 `p`, `q` 的LCA

# 解法

## 一開始的想法

首先一定是先 traversal 查找 `p`, `q` 兩節點，而我的想法是，如果用 post-traversal 來走訪測資一，這樣對於任意兩節點，假設是 `3`,或是 `5` 這兩個元素的 caller(當前遞迴節點) 會是 `4`，而對於 `5` 或是 `7` 這兩個的caller會是節點 `6`。因此其實就是要找同時具有 `p`跟`q`節點返回值的那層 caller 就會是 LCA

## 我的解法

```c++
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (root == nullptr) return nullptr;

    if (root == p || root == q) return root;

    TreeNode *leftNode = lowestCommonAncestor(root->left, p, q);
    TreeNode *rightNode = lowestCommonAncestor(root->right, p, q);

    if (leftNode != nullptr && rightNode != nullptr)  return root;
    if(leftNode != nullptr) return leftNode;
    else return rightNode; 
}
```

```c++
if (root == p || root == q) return root;
```
上面可以看到，如果traverse 找到 `p` 或者 `q` 則直接返回。

如果同時找到 `leftNode` 跟 `rightNode` 則當前節點就是LCA，而如果只有其中一個節點返回，那當前節電同時會是 `p` 或 `q` 並且自己就是自己的祖先

但是上面這種做法其實不限於 BST, 其他 binary tree 也能用，如果是 BST 其實不用那麼麻煩，因為已經排序好了，而且BST本來就是設計來讓你找節點用的:
- `p、q` 都比 `root` 小 → 走左
- `p、q` 都比 `root` 大 → 走右

而其他狀況root都是LCA:
- root 本來就是 q 或 p
- `q < root  < p`
- `p < root  < q`



```c++
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if(root==nullptr)return nullptr;
    
        if(root->val > p->val && root->val > q->val) return lowestCommonAncestor(root->left, p, q);
        else if(root-> val < p->val && root->val < q->val) return lowestCommonAncestor(root->right, p, q);
        else return root; // when root is q or p
    }
};
```

### 執行結果

![](/img/LeetCode/235/result.png)

# 複雜度

時間複雜度
$O(LogN)$ -> 二元查找
空間複雜度
$O(1)$

---