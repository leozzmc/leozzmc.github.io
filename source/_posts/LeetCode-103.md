---
title: 二元樹Z字形走訪 | Medium| LeetCode#103. Binary Tree Zigzag Level Order Traversal
tags:
  - Binary Tree
  - Traversal
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/103/cover.jpeg
abbrlink: 60d71d58
date: 2024-09-03 16:36:03
---

# 題目敘述

![](/img/LeetCode/103/question.jpeg)

- 題目難度：`Medium`
- 題目敘述：給定一個二元樹的 `root` ，回傳對這棵樹進行 **Z 字走訪 (Zigzag Level Order Traversal)的結果**

{% note info %}
Zigzag Level Order Traversal 代表先從左走到右，下一層再從右走到左，每一層走訪方向交互替換
{% endnote %}

# 解法

## 一開始的想法

這題想法也很直觀，就BFS，然後宣告一個用來存放結果的 2D Vector，**透過變數控制在每一層走訪的時候，按照順序或反向順序放入 vector 當中。**

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
    vector<vector<int>> result;
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        if(root == nullptr) return {};
        queue<TreeNode*> q;
        bool leftToRight = true;
        q.push(root);

        while(!q.empty()){
            int levelSize = q.size();
            vector<int> levelorderList(levelSize);
            
            for(int i = 0; i < levelSize; i++){
                TreeNode *current = q.front();
                q.pop();
                if(leftToRight) levelorderList[i] = current->val;
                else levelorderList[levelSize-i-1] = current->val;
                
                if(current->left) q.push(current->left);
                if(current->right) q.push(current->right);
            }
            leftToRight = !leftToRight;
            result.push_back(levelorderList);
        }   
        return result;
    }
};
```

這裡大架構一樣會是BFS標準做法，透過一個 `levelSize` 來去得到當前 level 中的節點數，接著在每一層走訪中，透過變數 `leftToRight` 控制要正向放入 vector   還是反向

```cpp
bool leftToRight = true;
...
if(leftToRight) levelorderList[i] = current->val;
else levelorderList[levelSize-i-1] = current->val;
... 
leftToRight = !leftToRight;
```

每一層結束後再更新變數 `leftToRight`



### 執行結果

![](/img/LeetCode/103/result.jpeg)


# 複雜度

## 時間複雜度

$O(N)$，$N$ 為節點總數

## 空間複雜度

$O(N)$，$N$ 為節點總數