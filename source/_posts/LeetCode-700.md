---
title: 在 BST 中進行搜尋 | Easy | LeetCode#700. Search in a Binary Search Tree
tags:
  - Tree
  - Binary Tree
  - Binary Search Tree
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: e21e131f
date: 2025-02-14 11:03:14
cover: /img/LeetCode/700/cover.png
---

# 題目敘述

![](/img/LeetCode/700/question.jpeg)

- 題目難度: `Easy`
- 題目描述: 題目給定一個Binary Search Tree，每個樹節點都有值 `val`，請在BST找到以該 `val` 作為值的節點，如果沒找到就回傳 `null`


# 解法

BST 的特性就是左邊節點 < 右邊節點，因此只要跟每個節點比較輸入的   `val` ，如果 `val` 大於當前節點就去查找其右子樹的 root，如果小於就給左子樹的root，就這樣遞迴查找，如果碰到 Leaf 後還是沒有找到就回傳 `nullptr`

>   但注意某些題目的定義會是 `<=`

## 我的解法

```c++
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}ㄑㄑ
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    TreeNode* searchBST(TreeNode* root, int val){
        
        if(root == nullptr) return nullptr;
        
        if(root->val > val){
            return searchBST(root->left, val);
        }
        else if(root->val < val){
            return searchBST(root->right, val);
        }
        else{
            return root;
        }
    }
};
```

### 執行結果

![](/img/LeetCode/700/result.jpeg)

# 複雜度

時間複雜度
$O(LogN)$: $N$ 個節點每次都會比大小進入其左或右子樹，因此不會每個節點都去查找，因此會是 $O(LogN)$

空間複雜度
$O(H)$: 沒有使用到額外的空間變數，所以空間複雜度由遞迴深度決定，遞迴深度這裡等於樹高 $H$


---
