---
title: >-
  填充每個節點的右側指標 II| Medium | LeetCode#117. Populating Next Right Pointers in Each
  Node II
tags:
  - Binary Tree
  - Traversal
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: d0f655d4
date: 2024-09-12 10:52:05
cover: /img/LeetCode/117/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/117/question1.jpeg)
![](/img/LeetCode/117/question2.jpeg)

- 題目難度：`Medium`
- 題目敘述： 題目會給 Binary Tree 的節點，節點結構如下，除了 `*left`, `*right` pointer 之外，還多了一個 `*next` 指標，用於指向該層中右方的節點，而如果右方節點不存在，則 `*next` 指向 `NULL`

```cpp
struct Node {
  int val;
  Node *left;
  Node *right;
  Node *next;
}
```

上圖中的例子中，題目會依序給 Binary Tree 的節點 `[1,2,3,4,5,null,7]` 而輸出結果也如圖，節點 `1` 沒有右邊節點，所以它的 `*next` 指向 `NULL`。再來就是下一層，節點 `2` 的下一個是節點 `3`，而節點 `3` 沒有右邊節點，所以會是指向 NULL

```
(1) -> NULL
(2) -> (3) -> NULL
(4) -> (5) -> (7) -> NULL
```

# 解法

## 一開始的想法

看到這個題目的第一想法就是 BFS，因為題目要求要找右邊節點，而這個操作都會在相同 level 去做，因此我在想可以用之解 BFS 題目中計算 level 的相同方式，來去順便將當前節點的 next 指向同一層的下一個節點，這可以透過 Queue 輕易做到，因為之前建構 BFS 也習慣將每一層節點由左至右的 push 進 queue 當中。

## 我的解法

```cpp
/*
// Definition for a Node.
class Node {
public:
    int val;
    Node* left;
    Node* right;
    Node* next;

    Node() : val(0), left(NULL), right(NULL), next(NULL) {}

    Node(int _val) : val(_val), left(NULL), right(NULL), next(NULL) {}

    Node(int _val, Node* _left, Node* _right, Node* _next)
        : val(_val), left(_left), right(_right), next(_next) {}
};
*/

class Solution {
public:
    Node* connect(Node* root){
        if(root == NULL) return NULL;
        queue<Node*> q;
        q.push(root);
        while(!q.empty()){
            int level = q.size();
            for(int i = 0; i < level; i++){
                Node *current = q.front();
                q.pop();
                if(i == level-1){
                    current->next = NULL;
                }
                else{
                    current->next = q.front();
                }
                if(current->left) q.push(current->left);
                if(current->right) q.push(current->right);
            }
        }
        return root;
    }
};
```

可以看到整體架構輪廓都是 BFS，但是在操作相同層節點的時候 (for 迴圈那邊)多了一個判斷

```cpp
if(i == level-1){
    current->next = NULL;
}
else{
    current->next = q.front();
}
```

一旦輪到同一層的最右邊元素，就將它的 `*next` 指向 NULL，而其他節點就指向當前 queue 的 front 節點，由於 `current` 所代表的節點在 queue 中已經被 pop 出來，因此目前 queue 中的節點會是下一個節點

### 執行結果

![](/img/LeetCode/117/result.jpeg)


## 更好的寫法

```cpp
/*
// Definition for a Node.
class Node {
public:
    int val;
    Node* left;
    Node* right;
    Node* next;

    Node() : val(0), left(NULL), right(NULL), next(NULL) {}

    Node(int _val) : val(_val), left(NULL), right(NULL), next(NULL) {}

    Node(int _val, Node* _left, Node* _right, Node* _next)
        : val(_val), left(_left), right(_right), next(_next) {}
};
*/

class Solution {
public:
    Node* connect(Node* root){
        if(root == NULL) return NULL;
        queue<Node*> q;
        q.push(root);
        q.push(NULL);
        while(q.size()>1){
            Node* current = q.front();
            q.pop();
            if(!current){
                q.push(NULL);
                continue;
            }
            current->next = q.front();
            if(current->left) q.push(current->left);
            if(current->right) q.push(current->right);
        }
        return root;
    }
};
```

其實大同小異，但就更加簡潔一些．這裡沒有判斷層，而是一但在 BFS 過程中 queue 為空的，就代表那一層結束，則 push NULL，然後這時就可以直接 `current->next = q.front()`，就少了許多判斷式


# 複雜度

## 時間複雜度

$O(N)＄

## 空間複雜度

$O(N)＄
