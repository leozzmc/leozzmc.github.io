---
title: 相同的二元樹 | Easy | LeetCode#100. Same Tree
tags:
  - Tree
  - Binary Tree
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 3dab679e
date: 2024-08-03 12:48:08
cover: /img/LeetCode/100/cover.jpg
---

# 題目敘述

![](/img/LeetCode/100/question.jpeg)

![](/img/LeetCode/100/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 給定兩個 Binary Tree 的 root，分別是 `p` 與 `q`，請寫一個函式檢查他們是否相同

> 相同的定義: 結構一樣，並且節點值一樣

# 解法

## 一開始的想法

我的想法一樣是遞迴，首先Traverse 到 Leaf，之後檢查節點值，如果不一樣就直接回傳 `false`，我們可以用一個變數值，將遞迴回傳的結果保存起來，再做為函式的返回值

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
    bool result =true;
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if(p == NULL && q == NULL) return true;
        if (p == NULL && q != NULL) return false;
        if (p != NULL && q == NULL) return false;
        cout << "P:" << p->val << "q:" << q->val << endl;
        if(p->val != q->val ) {
            cout << "Not the same Tree" << endl;
            return  false;
        }
        if(p->left != NULL || q->left != NULL) result = isSameTree(p->left, q->left);
        if(p->right != NULL || q->right != NULL) result = isSameTree(p->right, q->right);
        return result;
    }
};
```

### 說明

```cpp
if(p == NULL && q == NULL) return true;

```
表示已經遍歷到兩棵樹的末端，並且到目前為止兩棵樹是相同的，所以返回 `true`

```cpp
if (p == NULL && q != NULL) return false;
if (p != NULL && q == NULL) return false;

```
如果其中一個節點是 NULL 而另一個不是，這表示兩棵樹在這個位置上結構不同，因此返回 `false`

```cpp
if(p->val != q->val ) {
    cout << "Not the same Tree" << endl;
    return  false;
}
```
`p` 和 `q` 的值不同，返回 false

```cpp
if(p->left != NULL || q->left != NULL) result = isSameTree(p->left, q->left);
if(p->right != NULL || q->right != NULL) result = isSameTree(p->right, q->right);
```
檢查左子樹：如果 p 或 q 的左子樹不為 NULL，遞迴檢查左子樹是否相同
檢查右子樹：如果 p 或 q 的右子樹不為 NULL，遞迴檢查右子樹是否相同

> 但其實這裡會有問題，因為如果左子樹返回 false，而右子樹返回 true，它仍會返回最後一次賦值的結果。應該需要加個判斷式來判斷是否出現false result

### 執行結果

![](/img/LeetCode/100/result.jpeg)

## 更好的寫法

```cpp
if (p == NULL || q == NULL) return p == q;

cout << "P:" << p->val << " q:" << q->val << endl;

if (p->val != q->val) {
    cout << "Not the same Tree" << endl;
    return false;
}

return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);

```
{% note info %}
這裡合併了上面很冗的判斷式，將 `p` 和 `q` 同時為 NULL 或其中之一為 NULL 的情況合併成一個條件。並且移掉了冗餘檢查：在呼叫 isSameTree 前，檢查子樹是否為 NULL 是多餘的，因為遞迴呼叫中已經處理了這種情況，使用遞迴直接返回，利用邏輯運算 `&&` 直接返回子樹比較結果，減少不必要的變數。

{% endnote %}

# 複雜度

## 時間複雜度

$O(N)$, N 為節點個數，每個節點在遞迴中被訪問一次，進行比較操作，因此時間複雜度是線性的。

## 空間複雜度

$O(H)$, H　為樹的高度，最壞情況下樹高會等於節點數量 N，而如果式平衡二元樹，則會是 $O(LogN)$