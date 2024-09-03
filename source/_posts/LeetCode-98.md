---
title: Valid 的二元搜尋樹 | Medium| LeetCode#98. Validate Binary Search Tree
tags:
  - Binary Search Tree
  - Traversal
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
date: 2024-09-03 08:34:21
abbrlink: 5ebb4e47
cover: /img/LeetCode/98/cover.jpeg
--- 

# 題目敘述

![](/img/LeetCode/98/question.jpeg)

![](/img/LeetCode/98/question2.jpeg)

- 題目難度： `Medium`
- 題目敘述： 題目給定一個 Binary Tree 的 `root` ，我們需要確認這棵 Binary Tree 是否是 Binary Search Tree

{% note info %}
一個 valid 的 Binary Search Tree(BST) 包含了：
- 對於任意節點，其 Left SubTree 的任意節點值一定小於當前節點值
- 對於任意節點，其節點值一定小於其 Right SubTree 的任意節點值
- Left SubTree 和 Right SubTree 都要是 binary search tree
{% endnote %}

# 解法

## 一開始的想法

這題想法很簡單，這題的花費時間很少，首先可以知道的是： **BST 從小到大走訪，其走訪順序會是對同一棵樹進行 inorder traversal。** 所以只要能夠 **在 Inorder 走訪過程中比較前一個節點值與當前節點值，看前一個節點是否比當前節點小即可**

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
    bool result =  true;
    TreeNode* prev = nullptr;
    void dfs(TreeNode *current){
        if(current==nullptr) return;
        dfs(current->left);
        if(prev && prev->val >= current->val) result = false;
        prev = current;
        dfs(current->right);
    }

    bool isValidBST(TreeNode* root){
        if(root==nullptr) return false;
        dfs(root);
        return result;
    }
};
```

這裡多宣告了一個節點叫做 `prev` 用來儲存 inorder traversal 過程中的前一個節點，另外透過一個變數 `result` 來儲存是否valid的狀態。一旦 `prev` 存在且大於當前節點，則將 `result` 狀態變更為 `false`。在每次visiting 節點過程會將當前節點更新到 `prev`，以便下一次的比較。

之後便是回傳結果到 `isValidBST` 函數中，返回結果。

### 執行結果

![](/img/LeetCode/98/result.jpeg)

## 其他做法

```cpp
	class Solution {
	public:
		bool isValidBST(TreeNode* root) {
			return validate(root, std::numeric_limits<long>::min(), std::numeric_limits<long>::max() );
		}
	private:
		bool validate(TreeNode* node, long lower, long upper){
			if( node == NULL ){
				// empty node or empty tree is valid always
				return true;
			}

			if( (lower < node->val) && (node->val < upper) ){
				// check if all tree nodes follow BST rule
				return validate(node->left, lower, node->val) && validate(node->right, node->val, upper);
			}
			else{
				// early reject when we find violation
				return false;
			}
		}
	};
```


我看解答區普遍有其他做法，這種作法主要定義了另一個用來確定是否為 BST 的 `validate` 函數，其中的參數會給定上界和下界，一旦給定的下界小於當前節點值，而當前節點值小於上界，就持續遞迴，將node的左右child分別傳入參數。而其他情形則回傳 false，而return 結果需要左右子樹都是BST `return validate(node->left, lower, node->val) && validate(node->right, node->val, upper);` 最後才會是 valid 結果。  


# 複雜度

## 時間複雜度

$O(N)$, $N$ 為節點總數。

## 空間複雜度

$O(H)$, worst-case: $H = N$

