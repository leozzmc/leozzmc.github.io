---
title: 排序陣列轉換成 BST | Easy | LeetCode#108. Convert Sorted Array to Binary Search Tree
tags:
  - Tree
  - Binary Search Tree
  - Divide and Conqeur
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 9f0b74f6
date: 2025-07-06 15:11:00
cover: /img/LeetCode/108/cover.png
---


# 題目敘述


![](/img/LeetCode/108/question.jpeg)

- 題目難度: `Easy`
- 題目敘述:  給定一個已排序的陣列 `nums` (升階排序)，請將其轉換為 **height-balanced BST**

{% note info %}
Height-based BST: 其實就是左右子樹高度差距小於等於 1 。 
[參考連結](https://www.digitalocean.com/community/tutorials/height-of-a-binary-tree-in-c-plus-plus)
{% endnote %}


# 解法

## 一開始的想法

太久沒刷題，回來從 Easy 開始刷，這也是第一次刷 **Divide and Conquer** 類別的題目，但這個概念很常用到，一開始以為跟 Quick Sort 很像，就是選pivot 比它大就放在右子樹，比它小就放到左子樹，但後來發現這想法有問題，因為 Quick Sort 會是要去做排序，這裡則是建構子樹。

回憶BST的特性，對於任意root，左子樹小於 root ，而root小於右子樹， **因此這題的重點會是要怎麼選擇 ROOT 這樣依序遞迴建構才會是 height-balanced BST** 這常來說就會是要往中間找，建立出的 BST才會相對平衡。

## 我的解法

```c++
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
    TreeNode* helper(vector<int>&nums, int left, int right){
        if(left > right) return nullptr;

        int mid = left + (right - left)/2;
        TreeNode *root = new TreeNode(nums[mid]);
        root->left = helper(nums,left, mid-1);
        root->right = helper(nums,mid+1, right);
        return root;
    }

    TreeNode* sortedArrayToBST(vector<int>& nums){
        return helper(nums, 0, nums.size()-1);
    }
};
```

### 說明

看到 **「已排序陣列」** 然後  **「查找特定元素」** 就會想到 **Binary Search** ! 因此我們找 Root 方式會是以 Binary Search 方式來以中間節點當成 Root，大於中間節點的會在右子樹，小於中間節點的會在左子樹。

這裡透過 `helper` 函式做為主要遞迴的主體，每次遞迴都會根據當前陣列範圍，去找出中間 `nums[mid]` 作為 ROOT 去切分左右子樹，而對於左右子樹分別給予不同的左右區間 (`left`, `right`) 一旦 `left > right` 則代表BST樹建立完畢

### 執行結果

![](/img/LeetCode/108/result.jpeg)


# 複雜度

## 時間複雜度

$O(n)$: 每個節點還是會走訪一次 

## 空間複雜度

$O(n)$: 樹高會是 $O(LogN)$ 但整個數一樣會需要建立 n 個節點，因此一樣還會是 $O(n)$