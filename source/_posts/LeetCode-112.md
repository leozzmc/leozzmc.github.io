---
title: 二元樹路徑總和 | Easy | LeetCode#112. Path Sum
tags:
  - Tree
  - Binary Tree
  - Easy
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 74aa4179
date: 2024-08-13 23:19:38
cover: /img/LeetCode/112/cover.jpg
---

# 題目敘述

![](/img/LeetCode/112/question1.jpeg)

![](/img/LeetCode/112/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 給定一個二元樹的 `root` 以及一個整數 `targetSum`，若從 root 到 任意leaf 之間節點值的加總等於 `targetSum` 則回傳 true


# 解法

## 一開始的想法

![](/img/LeetCode/112/algo.png)

這題一開始的想法就是用 DFS，去找到 root，途中運用變數來儲存節點值，邊traverse 邊累加節點值，走到leaf就能夠知道是否等於 `targetSum`

## 錯誤寫法

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
    bool inorder (TreeNode *current, int counter, int targetSum){
    
        if (current == nullptr){
            if(counter != targetSum){
                return false;
            }
            else return true;
        }
        counter += current->val;
        //cout << current->val << endl;
        //cout << "count: " << counter << endl;
        bool path1 = inorder(current->left, counter , targetSum);
        if( path1 ){
            return true;
        }

        
        bool path2 = inorder(current->right, counter , targetSum);
        if(path2){
            return true;
        }

        return false;
    }

    bool hasPathSum(TreeNode* current, int targetSum){
        int count = 0;
        if(current == nullptr) return false;
        return inorder(current,count, targetSum);
    }
};
```

這裡就是初次 submit 的錯誤寫法，這在測資為 `root = [1,2]`, `targetSum=1` 的時候會出問題，其實塭堤發生在，我們每次在呼叫 `inorder` 的時候，即使走到leaf 回傳 false，如果走到 2，那 `counter` 值會是 3，此時 `counter!=targetSum` 因此回傳 `false`，但當我們一路回傳到原先的 caller 節點1的時候，此時 counter 值，並不會是我們在 callee 中所累加的值，而是又會被更新為原本還在 caller 時候的 counter 值，此時 counter 還是1，但這樣會讓我們接下來在 `path2` function call 的時候以為  `counter==targetSum`，這樣就會出問題。

{% note info %}
總而言之，counter 在遞迴過程中被錯誤修改。當我們在Tree中 traverse時，counter 應該代表當前路徑上所有節點值的總和。遞迴的每一條路徑都應該獨立計算，不應該試圖回退或修改之前的計算值。
{% endnote %}


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
    bool inorder (TreeNode *current, int counter, int targetSum){
    
        if (current == nullptr) return false;

        counter += current->val;
        // compare the counter and targetSum while visiting the leaf node. 
        if(current->left == nullptr && current->right == nullptr){
        if(counter == targetSum){
            return true;
        }
        else{
            return false;
        }
        }

        bool path1 = inorder(current->left, counter , targetSum);
        if( path1 ){
            return true;
        }

        
        bool path2 = inorder(current->right, counter , targetSum);
        if(path2){
            return true;
        }

        return false;
    }

    bool hasPathSum(TreeNode* current, int targetSum){
        int count = 0;
        if(current == nullptr) return false;
        return inorder(current,count, targetSum);
    }
};
```

這裡做的改動就是，**將 counter 值以及targetSum 的比較，提前到 node visiting 階段就進行比較，而不是等到 function call 結束後才return 比較結果** 這樣做的好處是，每條遞迴路徑可以獨立進行判斷，一旦發現符合條件的路徑就立即返回 true，避免了不必要的回溯和計算。


### 執行結果

![](/img/LeetCode/112/result.jpeg)

## 更好的做法

解答區發現了一個更精簡的作法，它的核心想法就是：
- 若 root 為 null，回傳false
- 若 root 就是leaf，檢查 targetSum 是否跟 leaf 值一樣
- 若上面條件都不滿足，遞迴檢查左右子樹是否有valid的路徑，在function call 前會先將 `targetSum` 減去當前節點值，反正如果path sum 跟 `targetSum` 一樣，那檢查到 leaf 節點時， `targetSum` 也會與 leaf 節點值一樣。
- 如果都不滿足，就回傳false

```cpp
class Solution {
public:
    bool hasPathSum(TreeNode* root, int targetSum) {
        if (!root) {
            return false;
        }
        
        if (!root->left && !root->right) {
            return targetSum == root->val;
        }
        
        bool left_sum = hasPathSum(root->left, targetSum - root->val);
        bool right_sum = hasPathSum(root->right, targetSum - root->val);
        
        return left_sum || right_sum;
    }
};
```

# 複雜度

## 時間複雜度

我們需要遍歷整個Binary Tree，以便檢查是否存在一條從根節點到葉節點的路徑，因此複雜度會是 $O(N)$，$N$ 為節點數量

## 空間複雜度
- worst case: $O(h)$，$h$ 為樹的高度
- balanced tree: $O(LogN)$, $N$ 為節點數量

# 結語

這次少考慮了 function call 在傳遞過程中，參數的變化。