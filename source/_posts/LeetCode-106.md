---
title: >-
  從 Inorder 和 Postorder Traversal 建構二元樹 | Medium | LeetCode#106. Construct
  Binary Tree from Inorder and Postorder Traversal
tags:
  - Binary Tree
  - Traversal
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 7af71e27
date: 2024-09-07 22:13:23
---


# 題目敘述

![](/img/LeetCode/106/question1.png)
![](/img/LeetCode/106/question2.png)

- 題目難度: `Medium`
- 題目敘述: 給定兩個整數 `inorder` 和 `postorder`  分別代表對一個 binary tree 進行 inorder traversal 和 postorder traversal 的結果，請建構一棵二元樹，並回傳二元樹的  `root`。 

# 解法

## 一開始的想法

這題算是 [LeetCode 105](https://leozzmc.github.io/posts/13d1e5ab.html) 的延伸題目。

![](/img/LeetCode/106/algo.png)


其實有想法很像:

{% noet info %}
- Inorder 的第一個元素是 leftmost 元素
- Preorder 的最後一個元素會是 root
{% endnote %}

> 因此每次迭代過程中，透過 `postorder` 中找到的 `root` 節點值，來去找到 `inorder` 中的 subTree 該怎麼切分左右子樹


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
    TreeNode* buildTreeHelper(vector<int>& inorder, vector<int>& postorder, int inStart, int inEnd, int postStart, int postEnd){
        if(inStart> inEnd || postStart > postEnd) return nullptr;
        int rootVal = postorder[postEnd];
        TreeNode* root = new TreeNode(rootVal);

        // divided into subArrays
        int mid;
        for(mid= inStart; mid <=inEnd; mid++){
            if(inorder[mid]==rootVal){
                break;
            }
        }
        
        int leftTreeSize = mid - inStart;
        root -> left = buildTreeHelper(inorder, postorder,inStart, mid-1, postStart, postStart+leftTreeSize-1 );
        root -> right = buildTreeHelper(inorder, postorder, mid+1, inEnd,postStart+leftTreeSize, postEnd-1);
        return root;
    }


    TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder){
        if(inorder.size()==0 || postorder.size()==0) return nullptr;
        return buildTreeHelper(inorder, postorder, 0, inorder.size()-1, 0, postorder.size()-1);
    }
};
```

整體作法跟 LeetCode-105 很像 都是額外建立一個 `helper` 函數，每次迭代過程中找到用來在陣列區分左右子樹的中間值的index，找到在 `inorder` 當中的分界值就可以 `break` 了。

之後就是透過下面這樣的 pattern 來建構樹
```
root->left = buildTree(左子樹inorder陣列，左子樹postorder陣列)
root->right = buildTree(右子樹inorder陣列，右子樹postorder陣列)
```

### 執行結果

![](/img/LeetCode/106/result.png)

# 複雜度

## 時間複雜度

尋找根節點在 inorder 陣列中的位置：這需要遍歷 `inorder` 陣列的一部分，最差情況下要進行 $O(n)$ 次比較，其中 $n$ 是節點的數量。

接著是遞迴建立左右子樹：每次遞迴的步驟包括找根節點並且再次呼叫 `buildTreeHelper` 來建立左右子樹。對於每個節點，我們都會進行一次遍歷來確定 `root` 的位置。因此每個節點的時間複雜度是 O(n)。而整棵樹有 n 個節點，因此時間複雜度為 $O(n^2)$

## 空間複雜度

$O(n)$，每個節點都需要儲存左右子樹的指標，並且需要與 inorder 和 postorder 陣列中的節點對應。因此儲存樹結構的空間需求是 $O(n)$。