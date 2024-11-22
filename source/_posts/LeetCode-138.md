---
title: 複製有 Random 指標的鏈結串列 | Medium | LeetCode#138. Copy List with Random Pointer
tags:
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 28674f4b
date: 2024-11-22 11:09:57
cover: /img/LeetCode/138/cover.png
---

# 題目敘述

![](/img/LeetCode/138/question.jpeg)

![](/img/LeetCode/138/question2.jpeg)

- 題目難度：`Medium`
- 題目描述： 給定長度為 `n` 的 Linked List，每個節點都有一個額外的指標 `random`，可以指向相同list中的任意節點，以及 `NULL`，題目要求建立這個 List 的 **[Deep Copy](https://en.wikipedia.org/wiki/Object_copying#Deep_copy)** 

{% note info %}
以下是節錄自維基百科對於 Deep Copy 的定義
*Deep copy involves copying the state of all subordinate objects – recursively dereferencing object references at each level of the tree that is the state of the original object and creating new objects and copying fields. A modification of either the original or copied object, including their inner objects, does not affect the other since they share none of the content.*
{% endnote %}

舉例來說如果今天有 A 跟 B 兩個節點，並且 `A.random -> B` 那將他們進行複製後的節點 a 和 b 也會滿足 `a.random->b`， **原則上就是新複製的 Linked List 它們的 `random` 指標都不能夠指向原來的 Linked List**

# 解法

## 我的做法

```cpp
/*
// Definition for a Node.
class Node {
public:
    int val;
    Node* next;
    Node* random;
    
    Node(int _val) {
        val = _val;
        next = NULL;
        random = NULL;
    }   
};
*/

class Solution {
public:
    Node* copyRandomList(Node* head){
        if(!head) return nullptr;
        Node *ptr = head;
        
        unordered_map <Node*, Node*> randomMap;

        while(ptr != nullptr){
            randomMap[ptr] = new Node(ptr->val);
            ptr = ptr->next;
        }
        ptr = head;
        while(ptr != nullptr){
            randomMap[ptr]->next = randomMap[ptr->next];
            randomMap[ptr]->random = randomMap[ptr->random];
            ptr = ptr->next;
        }
        return randomMap[head];
    }
};
```

這裡宣告了一個 hash table `unordered_map <Node*, Node*>` 來分別儲存 原本 list 的節點指標跟複製後的 List 節點指標。 首先透過一個迴圈來迭代原本的list，並且依序將原本的節點位址指標 `ptr` 作為 key 而新建立的節點 `new Node(ptr->val)` 作為 value，並且在初始化時就給定與原節點相同的值 `ptr->val`。

建立完畢，則回到 `head` 並且一樣透過 `ptr` 去迭代剛剛建立的 hash table，去為新節點鏈結 `next` 以及 `random`指標

```cpp
randomMap[ptr]->next = randomMap[ptr->next];
randomMap[ptr]->random = randomMap[ptr->random];
```

**`randomMap[ptr]->next` 代表新節點的 `next` 會指向到 `randomMap[ptr->next]` 原節點的 `next` 所指的位址。而 `randomMap[ptr]->random` 新節點的 `random` 則會指向到原節點的 `random` 指向的位址。**


### 執行結果

![](/img/LeetCode/138/result.jpeg)

# 複雜度

## 時間複雜度

$O(n)$ = $O(n)$ + $O(n)$

## 空間複雜度

`unordered_map` 會多儲存 $O(n)$ 大小的空間。其他變數佔用常數空間大小，因此整體空間複雜度會是 $O(n )$