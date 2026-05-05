---
title: 二元樹的右視圖 | Medium | LeetCode#199. Binary Tree Right Side View
tags:
  - BFS
  - Binary Tree
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/199/cover.jpg
abbrlink: 88663fd5
date: 2024-08-25 22:19:15
---

# 題目敘述

![](/img/LeetCode/199/question.png)

- 題目難度: `Medium`
- 題目敘述: 這題要求給定一個 Binary Tree 的 `root`，請想像站在樹的右側，由上而下將節點列出。


# 解法

## 一開始的想法

我一開始直接理解錯題目，我以為題目要我們想像站在樹右側是正面面對樹，然後朝向右半側，所以覺得題目只是要我們列出除了ROOT之外右邊子樹的所有節點，**但其實是要站在樹的右邊面向樹，由上往下看，因此有被遮擋住的節點就不會回傳。**

![](/img/LeetCode/199/tree.png)

所以如果是上面這棵樹，則會印出 [1,3,4]

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
    vector<int> result = {};
    vector<int> rightSideView(TreeNode* root) {
        if(root==nullptr) return result;
        queue<TreeNode*> q;
        //push root
        q.push(root);

        while(!q.empty()){
            int levelsize = q.size();
            
            for(int i=0; i< levelsize ;i++){
                TreeNode *current = q.front();
                q.pop();
            
                if(i==0) result.push_back(current->val);
                if(current->right) q.push(current->right);
                if( current->left) q.push(current->left);
            }
            
            
        }
        return result;
    }
};
```

這題就是BFS，只不過右邊的重要性高於左邊，因此調整了push進入queue的順序。

```cpp
if(current->right) q.push(current->right);
if( current->left) q.push(current->left);
```
但如果只是按照這樣寫，那也是所有節點都會 traverse 到，如果是上面那棵樹，就會輸出

```
1 3 2 4
```

這裡可以知道， **如果同一層中最右側的節點已經存在，那其餘節點就不需要添加到回傳 vector 中。** 因此接下來的關鍵是 **判斷層**

在 [之前的題目中](https://leozzmc.github.io/posts/db053989.html) 已經有做過在BFS的過程中判斷層數，基本框架是像下面這樣:

```cpp
int level = q.size();
for(int i=0; i<level; i++){
    TreeNode *current = q.front();
    .....
}
```

這裡我們如法炮製，由於我們會優先traverse 右子樹，因此我們可以 **在迴圈中的第一圈就先將節點值寫入回傳vector中。**

這裡也可以用正常BFS的順序，只不過就需要改成，將最後一次迴圈值寫入回傳vector中。

最後回傳 vector 則AC。

### 執行結果

![](/img/LeetCode/199/result.png)


# 複雜度

## 時間複雜度

因為 traverse 了所有節點，因此 $O(N)$

## 空間複雜度

- `result`: $O(H)$，$H$ 為樹的高度
- `queue<TreeNode*> q`: worst case: $O(N)$

因此整體也會是 $O(N)$

