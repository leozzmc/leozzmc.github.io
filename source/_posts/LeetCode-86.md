---
title: 分隔鏈結串列 | Medium | LeetCode#86. Partition List
tags:
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: e23d455d
date: 2024-12-14 19:15:26
cover: /img/LeetCode/86/cover.png
---

# 題目敘述

![](/img/LeetCode/86/question.jpeg)
- 題目難度：`Medium`
- 題目描述： 給定一個Linked List 的 `head` 以及一個整數 `x`, 將整個 Linked List 以 `x` 來分隔，使節點值比 `x` 小的節點排在 `x` 前面，而節點值大於等於 `x` 的節點則排在 `x` 節點後面。


# 解法

## 一開始的想法

使用兩個陣列來分別儲存 **1. 位置在 `x` 節點前面，但節點值比 `x` 還大的節點** 和 **2. 位置在 `x` 節點後面，但節點值比 `x` 還小的節點** 這兩個種類的節點需要他過額外的陣列儲存，以利後續串列的重新建構。

但如過再讀取陣列值進行建構，還需要找到需要插入的位置，這樣複雜度會提高，因此不如分別建立兩個 list 的 head，然後迭代尋找並分別串列所有小於 `x` 的節點以及所有大於等於 `x` 的節點。

## 我的解法

```c++
class Solution {
public:
    ListNode* partition(ListNode* head, int x){
        ListNode *bigHead = new ListNode(0);
        ListNode *smallHead = new ListNode(0);
        ListNode *smaller = smallHead;
        ListNode *bigger = bigHead;
        ListNode *ptr = head;
        
        while(ptr!=nullptr){
            if(ptr->val < x){
                smaller->next = ptr;
                smaller = smaller->next;
            }
            else{
                bigger->next = ptr;
                bigger = bigger->next;
            }
            ptr = ptr->next;
        }
        
        bigger->next = nullptr;
        smaller->next = bigHead->next;
        return smallHead->next;
    }
};                                                                                                                                           
```

這裡建立兩個新的頭 `bigHead` 以及 `smallHead`，分別用於建構大於等於 `x` 的節點串列和小於 `x` 的節點串列。 這裏一樣透過 `ptr` 來去迭代原本的串列。一旦發現節點值小於 `x` 則將該節點加入到以 `smallHead` 為頭的串列中 (`smaller->next = ptr`)。而一旦發現節點值大於或等於 `x` 則將該節點加入到以 `bigHead` 為頭的串列中 (`bigHead->next = ptr`)。迭代完畢後，則需要將兩串列合併，將數字小串列的最後一個節點串到串列的頭上 (`smaller->next = bighead->next`)。 最後只要回傳小串列的初始節點就好。

### 執行結果

![](/img/LeetCode/86/result.jpeg)

## 複雜度

時間複雜度： $O(n)$

空間複雜度： $O(1)$

---
