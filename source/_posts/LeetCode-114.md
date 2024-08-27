---
title: 將二元樹展平為Linked List| Medium | LeetCode#114. Flatten Binary Tree to Linked List
tags:
  - Binary Tree
  - Traversal
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: f15c47a9
date: 2024-08-27 13:23:00
cover: /img/LeetCode/114/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/114/question.png)

- 題目難度： `Medium`
- 題目敘述：給定一棵 Binary Tree 的 `root`，將 Binary tree 展平成一個 Linked List

{% note info %}
- Linked List 要與題目的 `TreeNode` 是相同的 class，`right` child pointer 要指向list中的下一個節點，而 `left` child pointer 皆指向null
- **Linked List 節點順序要與對這棵樹進行 Pre-order Traversal 的節點順序一樣**
{% endnote %}


# 解法

## 一開始的想法

> 這題的想法沒有花很久時間，算是解到目前最快的一題，大概從有想法到AC大概20min

這題的目的是要將一棵任意的二元樹轉換為一個往右側節點生長的Linked List (其實就是 skewed tree)。我一開始的想法如下：

![](/img/LeetCode/114/algo1.png)

首先宣告一個指標，用來指向 right subTree 的 root，走到任意節點時，如果他的左子樹存在，就將其左子樹嫁接到當前節點的右子樹位置，但這樣原先的右子樹怎辦？這就是剛剛要宣告一個新指標的原因。**接著嫁接完畢後就將原本 right subTree 的 root 接回來，接著持續在右子樹 traversal，一旦發現有節點具有 Left-child 則重複剛剛的步驟。**

![](/img/LeetCode/114/algo2.png)

> 當然這個初始的想法後續再寫的過程中也有進行修改，成果如下：

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
    void flatten(TreeNode* root) {
       if(root == nullptr) return;
        TreeNode *current = root;
        TreeNode *ptr = nullptr;
        if(current->left!= nullptr){
            ptr = current -> right;
            current -> right = current -> left;
            current -> left = nullptr;

            while(current->right != nullptr){
                current = current -> right;
            }
            current -> right = ptr;
        }
    
        flatten(root->right);  
    }
};
```

- 一旦有left child，那就將 `ptr` 指標指向當前節點的 right-child
- 將左子樹嫁接到右子樹： `current -> right = current -> left`
- 將  `current->left` 指向 nullptr
- 接著沿著新的右子樹一路往下走，走到 rightmost child，將原本的右子樹接回來 `current -> right = ptr`
- 接著從 `root` 的右側節點一路遞迴檢查有無左子樹存在，有就嫁接

### 執行結果

![](/img/LeetCode/114/result.jpeg)

# 複雜度

## 時間複雜度

$O(N)$，$N$ 為節點數量。

## 空間複雜度

$O(h)$，$h$ 為Binary Tree的高度，最壞狀況下為 $O(N)$
