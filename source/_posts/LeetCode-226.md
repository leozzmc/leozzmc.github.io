---
title: 反轉二元樹 | Easy | LeetCode#226. Invert Binary Tree
tags:
  - Tree
  - Binary Tree
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 5371066e
date: 2024-08-02 22:50:53
cover:  /img/LeetCode/226/cover.jpg
---

# 題目敘述

![](/img/LeetCode/226/question1.jpeg)
- 題目難度: `Easy`
- 題目敘述: 給定一個 Binary Tree 的`root`，反轉他以後，回傳它的 `root`


# 解法

## 一開始的想法

> 題目敘述很簡短，但基本上就是除了root以外，左葉子樹的成員都對調

> 但學會了[上一題](https://leozzmc.github.io/posts/4cd60718.html)遞迴的概念後，這題幾乎是秒解，但還是有考慮不周到的地方

我一開始的想法，就是一樣透過遞迴的方式，一開始就 traverse 到樹葉，碰到樹葉後，再將他們的左右child進行對調，之後一路fuction return 回去，然後回傳一開始原先的root即可


我一開始的思路會是下面這樣

```cpp
TreeNode *BT::invertTree(TreeNode* root){
    TreeNode *tmp = 0;
    TreeNode *current = root;
    if (root == nullptr) {
            return nullptr;
    }
    if(current->left != NULL && current->right != NULL){
        invertTree(current->left);
        invertTree(current->right);
    }
    
    tmp = current->left;
    current->left = current->right;
    current->right = tmp;
    tmp =0;
    
    return root;
}
```

但上面的 `if(current->left != NULL && current->right != NULL){}` 會在 skewd tree 的時候出問題:

原本給的 tree會是 `[2,3,null,1]`，如果按照這樣跑出來會是 `[2,null,3,1]`

題目原先的樹會長這樣:

![](/img/LeetCode/226/edge.jpeg)


預期輸出:  `[2,null,3,null,1]`

![](/img/LeetCode/226/edge2.jpeg)

但我上面的作法會變成:  `[2,null,3,1]`，這是因為條件判斷 `if(current->left != NULL && current->right != NULL)` 只在當前節點的左右子節點都不為 NULL 的情況下進行遞迴調用和交換。因此，它無法處理只有一個子節點的情況，從而導致錯誤的樹結構

![](/img/LeetCode/226/edge3.jpeg)

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
    TreeNode* invertTree(TreeNode* root) {
        TreeNode *tmp = 0;
        TreeNode *current = root;
        if (root == nullptr) {
                return nullptr;
        }
        
        invertTree(current->left);
        invertTree(current->right);
        
        
        tmp = current->left;
        current->left = current->right;
        current->right = tmp;
        tmp =0;
        
        return root;
    }
};
```

### 說明

上面使用深度優先搜索（DFS）的遞迴方法遍歷整棵樹。在遞迴過程中，首先翻轉每個節點的左右子樹，然後進行交換操作。這樣，每次遞迴完成後，當前節點的子樹就被翻轉了。最終，整棵樹的所有節點都被翻轉。

翻轉後，樹中每個節點的左子節點和右子節點都被交換，形成了整棵樹的鏡像。

### 執行結果

![](/img/LeetCode/226/result.jpeg)


### 完整本地測試程式碼


```cpp
# include <iostream>
# include <queue>

using namespace std;

class BT;
class TreeNode{
    public:
        int val;
        TreeNode *left, *right;

        TreeNode():val(0),left(0),right(0){};
        TreeNode(int x):val(x),left(0),right(0){};
        TreeNode(int x, TreeNode* leftnode, TreeNode* rightnode):val(x),left(leftnode),right(rightnode){};
        friend class BT;
}; 


class BT{
    public:
        TreeNode *root = new TreeNode;

        //constructor
        BT(): root(0) {};
        BT(TreeNode* node):root(node){};

        //member function
        TreeNode * invertTree(TreeNode* root);
        void levelOrder();
};



void BT::levelOrder(){ 
    queue<TreeNode*> q;
    q.push(this->root);

    while(!q.empty()){
        TreeNode *current = q.front();
        q.pop();

        cout << current->val << " ";
        if(current->left != NULL){
            q.push(current->left);
        }
        if(current->right != NULL){
            q.push(current->right);
        }
    }
}

TreeNode *BT::invertTree(TreeNode* root){
    TreeNode *tmp = 0;
    TreeNode *current = root;
    if (root == nullptr) {
            return nullptr;
    }
    invertTree(current->left);
    invertTree(current->right);
    
    
    tmp = current->left;
    current->left = current->right;
    current->right = tmp;
    tmp =0;
    
    return root;
}

int main(){


    TreeNode *nodeA =  new TreeNode(4);
    TreeNode *nodeB =  new TreeNode(2);
    TreeNode *nodeC =  new TreeNode(7);
    TreeNode *nodeD =  new TreeNode(1);
    TreeNode *nodeE =  new TreeNode(3);
    TreeNode *nodeF =  new TreeNode(6);
    TreeNode *nodeG =  new TreeNode(9);

    // TreeNode *nodeA =  new TreeNode(2);
    // TreeNode *nodeB =  new TreeNode(3);
    // TreeNode *nodeC =  new TreeNode(1);


    nodeA->left = nodeB;
    nodeA->right = nodeC;
    nodeB->left = nodeD;
    nodeB->right = nodeE;
    nodeC->left = nodeF;
    nodeC->right = nodeG;

    // nodeA->right = nodeB;
    // nodeB->right = nodeC;
    // nodeB->left = NULL;


    BT T(nodeA);

    cout << "Level Order: " << endl;
    T.levelOrder();

    T.invertTree(T.root);
    cout << "\nAfter Inverstion:" << endl;
    T.levelOrder();

    return 0;
}
```

# 複雜度

## 時間複雜度

$O(N)$, 每個節點都會被訪問一次，其中 n 是樹中節點的數量。

## 空間複雜度

在一般情況下，對於一棵平衡二元樹，空間複雜度是 $O(log n)$，因為樹的高度 h 大約為 $log n$。但對於完全不平衡的樹，空間複雜度會退化到 $O(n)$

