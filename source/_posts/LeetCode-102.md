---
title: >-
  二元樹 Level Order Traversal | Medium | LeetCode#102. Binary Tree Level Order
  Traversal
tags:
  - Tree
  - Binary Tree
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: db053989
date: 2024-08-04 13:28:54
cover: img/LeetCode/102/cover.jpg
---

# 題目敘述


![](/img/LeetCode/102/question.jpeg)

- 題目難度: `Medium`
-  題目敘述: 給定一個 Binary Tree 的 `root`，求 Level Order Traversal 的結果 (須將節點值存在一個二維list中)

# 解法

## 一開始的想法

就是先實踐經典的 Level Order Traversal，然後再嘗試存進 `vector<vector<int>> result` 返回。但我的想法在我剛實現完標準的 level_order_traversal 後就卡住了，由於我是用 queue 來去做實現，而每一次 push 進 queue後的節點會為同一層 (因為上一層已經被pop出來了) ，因此就可以處理在每一層的時候將節點值添加進 `result` 中，但我高估了我對 `vector` 的熟悉程度...

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
    vector<vector<int>> result={};
    vector<vector<int>> levelOrder(TreeNode* root) {
        if(root == NULL) return result;
        queue<TreeNode*>q;
        int count = 0;
        q.push(root);

        while(!q.empty()){
            int levelSize = q.size();
            ++count;
            vector<int> currentLevel;  

            //cout << "Level " << ++count << endl;
            for(int i = 0; i < levelSize; ++i){
                TreeNode *current = q.front();
                q.pop();
                currentLevel.push_back(current->val); 

                if(current->left!=NULL){ 
                    q.push(current->left);
                    
                }
                if(current->right!=NULL){
                    q.push(current->right);
                }

            }
            result.push_back(currentLevel);
        }
        return result;
    }
};
```

### 說明

- 首先，宣告一個 `vector<vector<int>> result` 來儲存lever order後的結果
- 使用一個 `while` loop，當queue不為空時，執行以下步驟：
    - 獲取當前層的節點數  `levelSize`，跟剛剛一樣，queue中尚未pop出來的元素會是相同level的節點
    - 創建一個  `vector<int> currentLevel`     用於存放當前層的節點值，這也會是二維vector操作的標準做法之一能說這塊第一次練習到
    - 使用一個 `for` loop，對當前層的每個節點進行如下操作：
      - 取出 front node，將其值加入 `currentLevel`
      - 若該節點的left child不為空，將它push 進入queue
      - 若該節點的right child不為空，將它push 進入queue
    - 將 `currentLevel` 加入 result 中。

### 執行結果

![](/img/LeetCode/102/result.jpeg)


# 複雜度

## 時間複雜度

整個樹的所有節點都會被訪問一次，時間複雜度是 $O(N)$，N 是二元樹中節點的總數

## 空間複雜度

空間複雜度主要受結果vector `result` 影響，`result` 的大小取決於二元樹的節點數，因此其空間需求為 $O(N)$，另外有使用到 queue，最壞狀況下可能會儲存整棵樹倒queue中，因此空間複雜度會是  $O(N)$

整體而言的空間複雜度會是 $O(N)$ + $O(N)$ = $O(N)$


# 結語

這題直接讓我了解自己對於 `vector` 的使用不太熟悉，另外在判斷層的時候也時常想錯，尚有很大的進步空間。