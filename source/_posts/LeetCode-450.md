---
title: 刪除 BST 當中的節點 | Medium | LeetCode#450. Delete Node in a BST
tags:
  - Binary Search Tree
  - Traversal
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
abbrlink: ff74cea1
date: 2025-11-17 15:04:34
cover: /img/LeetCode/450/cover.png
---

# 題目敘述


![](/img/LeetCode/450/question.jpeg)
![](/img/LeetCode/450/question2.jpeg)

- 題目難度： `Medium`
- 題目敘述： 題目給定一個 BST 的 root 跟整數 `key`，請刪除給定的 key node 並回傳 root

{% note info %}
刪除行為可以分成兩階段:
1. 找到要被刪除的節點
2. 如果節點被找到，那就刪除該節點
{% endnote %}

# 解法


## 一開始的想法

題目提示的很清楚，刪除行為分成兩階段，(1) 找到節點 (2) 刪除節點。重點會是刪除節點後，要怎麼接回原先的 BST。
所以可以分成兩個問題對應處理:
(1) 找到節點: DFS Traversal
(2) 刪除節點，並接回原先的 BST: 可以細分成幾種處理狀況
    - 要被移除的節點，左右子樹都存在: 這時候如果把當前節點移除，那可以選擇把: **恰好比當前節點大** 或者 **恰好比當前節點小** 的節點移動到目前節點，做為新的 root。
    - 要被移除的節點，只有左/右子樹都存在: 刪除當前節點，然後以左/右子樹做為新的 root

至於要找恰好比當前節點大，可以回想一下 BST 的性質，對於任意節點而言 $leftNode < root < rightNode$ 因此，要找當前節點右子樹的最左下角的節點，也就是 leftMost 節點，反之亦然，洽好比當前節點小的節點，就會是當前節點左子樹的 rigthMost 節點。

一旦找到新的 root 後，就需要把他的值將原先的 root 值取代掉然後再把自己的節點位置移除，有點像是用新節點靈魂取代掉舊ROOT節點，然後就可以把新節點的軀體移除了，這可以透過遞迴來做

## 我的解法

```c++
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

    // TreeNode *rightMost(TreeNode *root){
    //     if(root==nullptr) return nullptr;
    //     while(root->right) root = root->right;
    //     return root;
    // }

    TreeNode *leftMost(TreeNode *root){
        if(root==nullptr) return nullptr;
        while(root->left) root = root->left;
        return root;
    }
    // true: left, false; right
    TreeNode* deleteHelper(TreeNode *root, TreeNode *prev, bool direction, int key){
        if(root == nullptr) return nullptr;
        
        if(root->val < key){
            root->right = deleteHelper(root->right, root, false, key);
        }
        else if( root->val > key){
            root->left = deleteHelper(root->left, root, true, key);
        }
        else {
            if(!root->left){
                TreeNode *r = root->right;
                delete root;
                return r;
            }
            else if(!root->right){
                TreeNode *l = root->left;
                delete root;
                return l;
            }
            else{
                // both left and right subtree exisit
                // find leftmost or rightmost element in the subtree
                TreeNode *successor = leftMost(root->right);

                // replace the value
                root->val = successor->val;
                root->right = deleteHelper(root->right, root, false, successor->val);

            }
        }    
        return root;
    }

    TreeNode* deleteNode(TreeNode* root, int key) {
        return deleteHelper(root, nullptr,true, key);
    }
};
```

這裡會透過額外的函式 `deleteHelper`  來去實踐找 key node 跟刪除節點的主要邏輯，在每次遞迴過程中都會去比較當前節點與 `key` 之間的大小關係，如果比 `key` 大，那就代表要往左子樹去找，因此會遞迴呼叫左子樹。相反來看，比 `key` 小 那就代表 key 會落在當前節點的右子樹，所以遞迴呼叫右子樹。

如果當前節點值就等於 `key` 那就要去執行刪除節點的行為：這裡也根據不同情況來刪除，如果當前節點沒有左子樹，那右子樹就會是新的 root，如果當前節點沒有右子樹，那左子樹會是新的 root，把當前節點刪除並回傳新root

如果子樹都存在，就去找其右子樹的 leftMost 元素，這裡定義了一個 `leftMost` 函式，找到後會需要將他的值，用來取代目前的 root 值，這樣靈魂移動完後，剛剛的 leftMost　節點的身體就不需要了，遞迴呼叫　`deleteHelper` 來去進行刪除行為，並且最後回傳新的 ROOT 值

### 執行結果

![](/img/LeetCode/450/result.jpeg)

# 複雜度
時間複雜度: $O(H)$, $H$ 為樹高

空間複雜度: $O(H)$,  $H$ 為樹高