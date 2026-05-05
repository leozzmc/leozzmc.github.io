---
title: 旋轉鏈結串列 | Medium | LeetCode#61. Rotate List
tags:
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: ea1b4e6c
date: 2024-11-20 10:37:09
cover: /img/LeetCode/61/cover.png
---

# 題目敘述

![](/img/LeetCode/61/question.jpeg)
- 題目難度：`Medium`
- 題目描述： 給定一個 Linked List 的 `head`，選轉整個 List `k` 次後回傳新的List head

# 解法

## 一開始的想法

> 看題目給的範例測資，可以知道所謂旋轉就是尾端的 node 插入到 List 前端作為新的 head，而這個操作要進行 `k` 次，一開始的想法就是很直觀， **找到尾端節點，插入到首端，然後遞迴操作**

## 先前的解法

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* rotateRight(ListNode* head, int k){
        if(head == nullptr) return nullptr;
        if(!head || !head->next || k==0) return head; 

        //find the last node of the list
        ListNode *last = head;
        ListNode *prev = new ListNode();
        prev->next = last;
        ListNode *front = head;
        
        while(last->next!=nullptr){
            last = last->next;
            prev = prev->next;
        }
        last->next =head;
        prev->next = nullptr;
        prev = nullptr;
        delete prev;
        return rotateRight(last, k-1);
    }
};
```

這裡的想法就是先宣告兩個指標 `last` 跟 `prev`，`last` 用於指向Linked List 的最後一個節點，而 `prev` 用於紀錄 `last` 的前一個元素，也就代表新的尾端元素。接著就將 `last` 指向到 `head`，然後由於 `prev` 會是新的末端節點，因此需要指向 `nullptr`，然後就遞迴呼叫 `rotateRight` 本身，最後一旦 `k` 減為0，就回傳新的 `head`。

> **這種做法會導致每一次的遞迴呼叫都會建立 `prev` 節點，會大量消耗記憶體，出現 Memory Limit Exceeded**

## 更好的做法

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* rotateRight(ListNode* head, int k){
        if(head == nullptr) return nullptr;
        if(!head || !head->next || k==0) return head; 

        //find the last node of the list
        ListNode *last = head;
        int length = 1;
        
        while(last->next!=nullptr){
            last = last->next;
            length++;
        }
        last->next = head;
        
        //Find new head positions
        k = k % length;
        int countToNewHead = length - k;
        ListNode* newTail = head;
        for(int i=1; i<countToNewHead; i++){
            newTail = newTail -> next; 
        }
        
        ListNode *newHead = newTail-> next;
        newTail->next = nullptr;
        return newHead;
    }
};
```

這裡改用 Iteration 的方式來實作，首先原先的 `last` 在迭代的時候同時也紀錄 list 的長度，接著將 `last` 指向 `head` 作為新的 `head`。 `k` 代表要選轉多少次，但這個數字可能會遠大於 linked list 長度 `length`，所以可以透過 `k % length` 來先找到最終的 `head` 會輪到哪個節點。

知道是哪個節點後，還需要知道從該節點 走到該節點走到末端節點要走幾步，所以透過 `length - k` 來得到 `countToNewHead`，之後定義一個新的 `newTail` 來獲取當前 Linked List 的倒數第二個節點，這樣他的 `next` 就會是新的head `newHead`，之後將 `newTail` 指向到 `nullptr` 斷開環形結構後就可以直接回傳 `newHead` 了。

### 執行結果

![](/img/LeetCode/61/result.jpeg)

# 複雜度

## 時間複雜度


| 方法      | 時間複雜度 | 分析簡述                                                                                  |
|-----------|------------|-------------------------------------------------------------------------------------------|
| Recursion | $O(k \times n)$   | 每次遞歸都會遍歷整個鏈表找到最後一個節點，總共執行 $k$ 次，因此時間複雜度為 $O(k \times n)$            |
| Iteration | $O(n)$       | 計算鏈表長度需遍歷一次，再執行一次遍歷找到新頭節點，因此總共遍歷 2 次，時間複雜度為 $O(n)$      |


## 空間複雜度

| 方法      | 空間複雜度 | 分析簡述                                                                                  |
|-----------|------------|-------------------------------------------------------------------------------------------|
| Recursion | $O(k)$       | 每次遞歸會佔用棧空間，深度為 $k$，因此空間複雜度為 $O(k)$                                      |
| Iteration | $O(1)$       | 僅使用少量指針變數進行操作，不需要額外的空間，空間複雜度為 $O(1)$                             |
