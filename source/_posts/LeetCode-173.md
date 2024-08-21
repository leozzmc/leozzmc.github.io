---
title: 二元搜尋樹迭代器 | Medium | LeetCode#173. Binary Search Tree Iterator
tags:
  - Binary Search Tree
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 4a669d62
date: 2024-08-21 09:12:54
cover: /img/LeetCode/173/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/173/question1.png)
![](/img/LeetCode/173/question2.png)
- 題目難度： `Easy`
- 題目敘述： 題目要求你實作一個 `BSTIterator` 作為二元樹的 Iterator，可以對一個 Binary Search Tree 進行 in-order traversal

- `BSTIterator(TreeNode root)` 為 `BSTIterator` class 的 constructor，整個 BST 的 `root` 會作為 constructor 的初始參數
- `boolean hasNext()` 會去檢查當前 pointer 的右側是否有值存在，如果有就回傳 `true` 否則則是 `false`
- `int next()` 則會將指標移動到下一個指標，並且回傳其指向的資料值

{% note info %}
注意：第一次呼叫 `next()` 會需要回傳 null，可假設每次呼叫 `next()` 都會 valid，也就是每次呼叫都會至少有一個值可被回傳 （以 in-order traversal 
順序） 
{% endnote %}

# 解法

## 一開始的想法

一開始有點被我的[這篇文章](https://leozzmc.github.io/posts/tree_for_leetcode_2.html)誤導，我原先的想法也是要找到 leftmost 元素，接下來去找 successor (即下一個節點)，但下一個節點可能會是右子樹中的最左節點，或者是以 left-child 身份往回找到的 ancestor。在往回找 ancestor 這邊會仰賴 `parent` 指標，但題目中對於 `TreeNode` 的成員中並沒有 `parent` 因此這樣的做法會行不通。


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
class BSTIterator {
public:
    TreeNode *current = nullptr;
    queue <int> q;
    BSTIterator(TreeNode* root){
        inorderTraversal(root);
    }
    
    void inorderTraversal(TreeNode *current){
        if(current == NULL) return;
        inorderTraversal(current->left);
        q.push(current->val);
        inorderTraversal(current->right);
    }
    int next() {
        if(!q.empty()){
            int top = q.front();
            q.pop();
            return top;    
        }
        else return -1; 
    }
    bool hasNext(){
        if(!q.empty()) return true;
        else return false;
    }
};

/**
 * Your BSTIterator object will be instantiated and called as such:
 * BSTIterator* obj = new BSTIterator(root);
 * int param_1 = obj->next();
 * bool param_2 = obj->hasNext();
 */
```

這裡主要思維會是， **Binary Search Tree 其實其實也就是滿足 In-order Traversal 的 Tree，因此只要對整顆樹進行 In-Order Traversal，將節點依序保存即可。**

因此我們額外宣告了一個 queue `q` 來用於保存節點，另外我們也在 class 內另外宣告一個 `inorderTraversal` ，當我們在拜訪節點的時候同時將資料值 push 進 queue 中。

``` cpp
void inorderTraversal(TreeNode *current){
        if(current == NULL) return;
        inorderTraversal(current->left);
        q.push(current->val);
        inorderTraversal(current->right);
}
```

然後我們一開始在 constructor 中就呼叫 `inorderTraversal` , 這樣在初始化class的時候就可以將節點全部拜訪完畢


接著在 `next()` 中依序將 queue 中節點取出。


```cpp
int next() {
        if(!q.empty()){
            int top = q.front();
            q.pop();
            return top;    
        }
        else return -1; 
}
```

一旦 queue 中還有值，就還有下個節點存在，反之則否。

```cpp
bool hasNext(){
        if(!q.empty()) return true;
        else return false;
}
```


### 執行結果

![](/img/LeetCode/173/result.png)

# 複雜度

## 時間複雜度

- `BSTIterator(TreeNode* root)` : $O(N)$
- `int next()`: 對 queue 中的第一個元素進行 pop操作，因此是 $O(1)$ 
- `bool hasNext()`: 檢查 queue 大小而已，$O(1)$

## 空間複雜度

queue 所使用的空間會佔用 $O(N)$ 的複雜度，而遞迴走訪的call stack 會佔用 $O(h)$, h 為樹高，最壞狀況為 $O(N)$
因此整體而言空間複雜度為 $O(N)$