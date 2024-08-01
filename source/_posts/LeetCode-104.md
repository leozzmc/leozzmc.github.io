---
title: 二元樹的最大深度 | Easy | LeetCode#104. Maximum Depth of Binary Tree
tags:
  - Tree
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 4cd60718
date: 2024-08-01 22:33:24
cover: /img/LeetCode/104/cover.jpg
---

# 題目敘述

![](/img/LeetCode/104/question.jpeg)

- 題目難度: `Easy`
- 題目敘述: 題目給定一個Binary Tree 的 `Root`，要求這棵二元樹的最大深度

{% note info %}
最大深度即 root 到樹葉的最遠距離
{% endnote %}

# 解法

## 一開始的想法

一開始的想法只有停留在 Traversal 本身，所以寫了 Inorder, Preorder, Postorder 甚至是 Level-order，都還是沒有太多想法...

這次是看了提示後才寫出來，並且了解到我自己對Recursive 的不熟練

## 解法

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
    int maxDepth(TreeNode* root) {
       if(root == 0) return 0;
        int leftdepth = maxDepth(root->left);
        int rightdepth = maxDepth(root->right);
        //cout << root->val << " ";
        return max(leftdepth, rightdepth) + 1;
    }
};
```

### 說明

![](/img/LeetCode/104/algo1.png)
![](/img/LeetCode/104/algo2.png)

首先程式碼對於 root pointer 存取到NULL，則回傳0 (也就是已經走到Leaf了)，之後遞迴求每個節點的各自子節點的最大深度值，當走到 leaf 的時候，由於左右子節點都為 NULL，因此對於 leaf node 來說它的 `leftdepth` 以及 `rightdepth` 都是0，因此回傳 1 (0+1)，代表從leaf 開始往回算深度，目前深度為1。

之後就會沿著之前的 functional call chain 一路返回到 Root，**並且在返回過程比較左右子樹的深度哪個比較大，因此一旦跑完程式，回傳結果必定會是最大深度。**


### 執行結果

![](/img/LeetCode/104/result.jpeg)

### 完整本地測試程式碼

```cpp
# include <iostream>
# include <vector>
# include <queue>

using namespace std;

class BinaryTree;

class TreeNode{
    public:
        int val;
        TreeNode *leftchild, *rightchild;

        TreeNode():val(0),leftchild(0),rightchild(0){};
        TreeNode(int x):val(x),leftchild(0),rightchild(0){};
        TreeNode(int x, TreeNode *left, TreeNode *right):val(x),leftchild(left),rightchild(right){};
    
    friend class BinaryTree;
};

class BinaryTree{
    public:
        TreeNode *root;
        //Constructor
        BinaryTree():root(0){};
        BinaryTree(TreeNode * node):root(node){};

        //member function
        void Levelorder();
        int maxDepth(TreeNode * root);
};



int BinaryTree::maxDepth(TreeNode * current){
    if(current == 0) return 0;

    int leftdepth = maxDepth(current->leftchild);
    int rightdepth = maxDepth(current->rightchild);
    //cout << root->val << " ";
    return max(leftdepth, rightdepth) + 1;
}


int main(){
     // Instanitate  all tree nodes
    TreeNode *nodeA = new TreeNode(1);
    TreeNode *nodeB = new TreeNode(2);
    TreeNode *nodeC = new TreeNode(3);
    TreeNode *nodeD = new TreeNode(4);
    TreeNode *nodeE = new TreeNode(5);

    nodeA->leftchild = nodeB;
    nodeB -> leftchild = nodeD;
    nodeA->rightchild = nodeC;
    nodeC->rightchild = nodeE;

    //Define root node
    BinaryTree T(nodeA);

   cout << "max depth: " <<  T.maxDepth(T.root) << endl;
    
    

    return 0;
}
```

# 複雜度

## 時間複雜度

時間複雜度會是 $O(n)$，因為它需要遍歷樹中的每個節點一次

## 空間複雜度

在一般情況下（例如平衡二元樹），遞迴方法的空間複雜度是 $O(log(n))$ (也就是跟平衡樹的高度一樣，高度為 log(n)，其中 n 是節點數目)，但如果是 skewed tree，則樹高與節點數量一樣，也就是 n ，因此最壞情況下的空間複雜度會是 $O(n)$

# 結語

這次讓我體會到了遞迴的力量，我應該會回去複習 Recursive 的各種用法