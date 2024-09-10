---
title: 二元樹的最近共同祖先 | Medium | LeetCode#236. Lowest Common Ancestor of a Binary Tree
tags:
  - Binary Tree
  - Traversal
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/236/cover.jpg
abbrlink: c8b16daf
date: 2024-09-10 21:47:47
---

# 題目敘述

![](/img/LeetCode/236/question.png)

![](/img/LeetCode/236/question2.png)

- 題目難度: `Medium`
- 題目敘述: 給定一個 binary tree，請找到任兩節點 `p` 和 `q` 的 **lowest common ancestor (LCA)**

{% note info %}
[最近公同祖先(lowest common ancestor)](https://zh.wikipedia.org/wiki/%E6%9C%80%E8%BF%91%E5%85%AC%E5%85%B1%E7%A5%96%E5%85%88_(%E5%9B%BE%E8%AE%BA)): 是指在節點 `p` 和 `q` 之間，二元樹 `T` 中最低的、同時擁有 `p` 和 `q` 作為後代的節點 **（本題允許當前節點是自己的後代）**
{% endnote %}

# 解法

## 一開始的想法

想法一樣會是 DFS，因為在正常實踐 DFS 的過程中，我們是透過遞迴函式呼叫來實現，Ancestor 一定會是 descendant 的 caller之一。因此朝著 DFS方向去想。另外沒必要把 Traversal全部跑完，只要能夠找到 `p` 與 `q` 即可。

## 我的解法

```cpp
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}
 * };
 */
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q){
        if(root==nullptr || root == p || root == q){
            return root;
        }
        
        TreeNode *left = lowestCommonAncestor(root->left, p, q);
        TreeNode *right = lowestCommonAncestor(root->right, p, q);
        if(left!= nullptr && right!=nullptr) return root;
        if(left!=nullptr && right==nullptr ) return left;
        if(left==nullptr && right!=nullptr) return right;
        return nullptr;
    }
};
```

在這個 `lowestCommonAncestor` 函數內，終止條件會是，**一旦碰到 leaf 就返回，或者找到 `p` 或 `q` 節點就回傳節點。** 接下來就是 dfs 遞迴呼叫，本題使用 post-order traversal，因為要找的是 Ancestor，因此 每個子樹的root節點會最後才造訪，另外在左右child 的遞迴結果會分別保存在 `*left` 和 `*right` 指標中。而造訪節點要做的事就是做判斷，如果 `left` 與 `right` 都不為空，就代表已經找到 `p` 跟 `q`，因此當前節點會是他們的共同祖先。

而如果 `left` 與 `right` 其中一個還沒找到，那就將當前的 `left` 或 `right` 繼續回傳給 Caller。

> 最後一行的 `nullptr` 主要是因為 leetcode 在 run 的時候如果函數有 return value，那他會期待每個控制路徑都要有 return 否則不給過。其實可以將 return 那邊改寫成下面這樣，就比較短。

```cpp
if (left != nullptr && right != nullptr) return root; 
return left != nullptr ? left : right; 
```

### 執行結果

![](/img/LeetCode/236/result.png)

## 更好的作法

我看解答區有人用4行就寫出來了，但邏輯跟上面一樣，只是寫得更加精簡

```cpp
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* left = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    return !left ? right : !right ? left : root;
}
```

# 複雜度

## 時間複雜度

$O(N)$

## 空間複雜度

Worst Case: $O(N)$