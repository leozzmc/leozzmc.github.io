---
title: 對稱的二元樹 | Easy | LeetCode#101. Symmetric Tree
tags:
  - Tree
  - Binary Tree
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/101/cover.jpg
abbrlink: ac5f27c1
date: 2024-08-05 22:51:02
---

# 題目敘述

![](/img/LeetCode/101/question1.jpeg)

![](/img/LeetCode/101/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 給定一個二元樹的 `root`，題目要我們檢查該二元樹是否是對稱的。

# 解法

## 一開始的想法

我一開始的想法就錯了，我一開始認為只要 Inorder Traversal 後的結果，只要反向過來也一樣那就是對稱的了

所以我一開始的解法是錯的:

```cpp

vector<int> result_inorder;

void BT::inorder(TreeNode* node){
    if(node==NULL) return;
    
    cout << node->val << " ";
    result_inorder.push_back(node->val);
    inorder(node->left);
    inorder(node->right);
};

bool BT::isSymmetric(TreeNode* root){
    bool result = false;
    inorder(root);
    for(int i=0; i<(int)(result_inorder.size()/2)+1;++i){
        if(result_inorder[i]!=result_inorder[result_inorder.size() -i -1]) return false;
        else result = true;
    }
    return result;    
}
```

上面的程式只能判斷值是否對稱，但無法判斷結構是否對稱，像是下面這顆樹就會判斷成是對稱的樹

`root = [1,2,2,2,null,2]`

![](/img/LeetCode/101/case.png)


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
    bool isMirror(TreeNode* leftNode, TreeNode* rightNode){
        if(leftNode == NULL && rightNode == NULL) return true;
        if(leftNode == NULL || rightNode == NULL) return false;
        
        if (leftNode->val == rightNode->val && isMirror(leftNode->right, rightNode->left) && isMirror(leftNode->left, rightNode->right)) return true;
        else return false;
    }
    bool isSymmetric(TreeNode* root) {
        bool result;
        if (root == NULL) return true;
        result = isMirror(root->left, root->right);
        return result;    
    }
};
```
### 說明

後續的解法還是參考了一下網路上的提示，也就是宣告了一個以左節點和右節點作為參數的函數來進行判斷。

- 首先檢查兩個節點是否同時為空（NULL），如果是，則返回 `true`，表示兩個空 subTree 是鏡像對稱的
- 如果只有一個節點為空就代表結構不對稱
- 如果左右兩節點都不為空，那就檢查他們的值是否一樣，並且進行遞迴檢查：
    - 這裡可以參考題目上的圖，**鏡像對稱的特點會是left child 的 right child 與 right child 的 left child 一樣**
    - **同理，right child 的 left child 會與 left child 的　right child 一樣**
    - 如果上面條件都同時滿足，那就回傳 `true`

### 執行結果

![](/img/LeetCode/101/result.jpeg)



## 另一種做法

有看到另一種蠻直觀的作法，就是用queue去做

```cpp
class Solution {
public:
    bool isSymmetric(TreeNode* root) {
        if(root == NULL) return true; // An empty tree is symmetric
        queue<TreeNode*> q;
        q.push(root->left);
        q.push(root->right);
        while (!q.empty()){
            TreeNode* left = q.front(); q.pop();
            TreeNode* right = q.front(); q.pop();
            if(left == NULL  && right == NULL) continue; // Both are NULL, symmetric at this level
            if(left ==NULL  or  right==NULL) return false; // One is NULL and the other is not, not symmetric
            if(left->val != right->val) return false; // Values differ, not symmetric
            // Enqueue children in the order to compare them as mirror images
            q.push(left->left);
            q.push(right->right);
            q.push(left->right);
            q.push(right->left);
        }
        return true; // tree is symmetric
    }
};
```

- 這裡首先將左右 child push 進 queue
- 接著當 queue不為空的時候就會開始進行一系列操作:
    - 首先透過 `left` 和 `right` 指標來指向剛剛放入queue的左右節點
    - 接著就是比較，如果其中一個為null，那就是tree結構不對稱
    - 如果都是 null，就代表到目前為止是對稱的，繼續往下執行
    - 如果都不為null，就去比較左右節點的資料值 `val`，如果不一樣回傳 `false`
    - 接著依序將left child 的 left child 放入 queue
    - 再將 right child 的 right child 放入 queue，可以看題目的範例圖，其中一對需要比較對稱的位置就是這
    - 將 left child 的 right child 放入 queue
    - 再將 right child 的 left child 放入 queue，可以看題目的範例圖，其中一對需要比較對稱的位置就是這

# 複雜度

## 時間複雜度

$O(n)$， n 為樹的節點數量

## 空間複雜度

$O(h)$，h 為樹的高度，在平衡樹下 $h = logN$

# 結語

今天狀況不太好，一開始就急著解題，沒有思考 Traversal 僅能判斷值是否對稱，少考慮了結構上的對稱。我很慚愧。
