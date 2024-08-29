---
title: BST 中的最小節點差值 | Easy| LeetCode#530. Minimum Absolute Difference in BST
tags:
  - Binary Search Tree
  - Traversal
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
cover: img/LeetCode/530/cover.jpeg
abbrlink: 9f5948c3
date: 2024-08-29 13:31:25
---

# 題目敘述

![](/img/LeetCode/530/question.jpeg)

![](/img/LeetCode/530/question2.jpeg)

- 題目難度： `Easy`
- 題目敘述： 給定一個 Binary Search Tree (BST) 的 `root` ，回傳樹中任意兩個節點的絕對值當中最小的。


# 解法


## 一開始的想法

首先 Binary Search Tree 的特性就是對於任意節點， **其左子樹必定 < 當前節點 < 右子樹。**

**因此可以判斷，在對這顆樹進行 Inorder Traversal 的過程中，相鄰節點的差值會是最小的，不存在跨一個節點之間差值更小的問題**

所以基本上我的想法就是跑一遍 Inorder Traversal，將節點記錄到一個 list，在 list 中再計算差值．但這樣缺點就是 runtime 會增加。

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
    vector<int> nodes;
    vector<int> nodeDifferences;
    vector<int>::iterator result;

    void inorder(TreeNode *current){
        if(current== nullptr) return;
        inorder(current->left);
        nodes.push_back(current->val);
        inorder(current->right);
    }


    int getMinimumDifference(TreeNode* root){
        if(root == nullptr) return 0;
        inorder(root);
        for(int i=1; i< nodes.size(); i++){
            nodeDifferences.push_back(abs(nodes[i]-nodes[i-1]));
        }
        result = min_element(nodeDifferences.begin(), nodeDifferences.end());
        return *result;
    }

};
```

上面在 `void inorder(TreeNode *current)` 中紀錄了節點值，記錄完畢後回到 caller `int getMinimumDifference(TreeNode* root)` 這時候依序將相鄰節點差值計算出。

最後透過一格 `vector iterator` 去找回傳list當中最小的值。

> 要使用這個 iterator 必須 include 標頭 `<algorithm>`

### 執行結果

![](/img/LeetCode/530/result.jpeg)

## 更好的做法

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
    int diff = INT_MAX;
    TreeNode *prev = nullptr;

    void dfs(TreeNode* current){
        if(current==nullptr) return;
        dfs(current->left);
        if(prev!= nullptr) diff = min(diff, abs(current->val - prev->val));
        prev = current;
        dfs(current->right);
    }


    int getMinimumDifference(TreeNode* root){
        dfs(root);
        return diff;
    }

};
```

這裡首先初始化一個變數 `diff` 為  `INT_MAX`

{% note info %}
**INT_MAX** 是C/C++ 中的一個巨集，定義了變數可以儲存但不能超過的上限
- INT_MAX = 2147483647   (for 32-bit Integers)
- INT_MAX = 9,223,372,036,854,775,807   (for 64-bit Integers)
{% endnote %}

這裡另外宣告一個節點，用來儲存 traversal 的時候的上一個節點，每次拜訪當前節點時，會與上一個節點值相減並且取絕對值，看結果與到目前為止的最小差值 `diff` 相比看看誰小，並更新到 `diff`

在準備進入右子樹前，將 `prev` 變更為當前節點。

> 這樣的執行結果， Runtime 明顯比原先的做法好得多

### 執行結果

![](/img/LeetCode/530/result2.jpeg)

# 複雜度

## 時間複雜度

第一種做法：

- inorder traversal: $O(N)$
- 計算節點差值的迴圈: $O(N)$
- min_element: $O(N)$

整體而言：$O(N)$ +$O(N)$+$O(N)$ = $O(N)$ 

第二種做法：
$O(N)$，$N$ 為節點個數

## 空間複雜度

第一種做法： $O(N)$ +$O(N)$+$O(H)$ = $O(N)$ 

第二種做法：
$O(H)$，$H$ 為樹高，worst case 會是 $O(N)$