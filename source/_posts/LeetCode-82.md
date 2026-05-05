---
title: 從排序串鏈移除重複節點 II | Medium | LeetCode#82. Remove Duplicates from Sorted List II
toc: true
tags:
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 947efc60
date: 2024-12-06 11:07:38
cover: /img/LeetCode/82/cover.png
---


# 題目敘述

![](/img/LeetCode/82/question.jpeg)

- 題目難度： `Medium`
- 題目描述：給定一個排序鏈結的 `head`，刪除所有具有重複數字的節點，使原有鏈結最後只剩下相異的數值的節點，並回傳該list的 `head`


# 解法

## 一開始的想法

由於要檢查是否有數值重複，因此這部分會想到要用 Hash Table 來實現，並且移除重複節點，還需要一個dummy head 搭新的指標來去指向前一個節點。

## 我的做法

```c++
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
    ListNode* deleteDuplicates(ListNode* head){
        if(head==nullptr) return nullptr; 
        unordered_map <int, int> umap;
        ListNode *ptr = head;

        // Iterate over the list
        while( ptr!=nullptr){
            umap[ptr->val]++;
            ptr = ptr->next;
        }

        ListNode *dummy = new ListNode(0, head);
        ListNode *prev = dummy;
        ptr = head;
        while(ptr!=nullptr){
            if(umap[ptr->val]>1){
                prev->next = ptr->next;
            }
            else{
                prev = ptr;
            }
            ptr = ptr->next;
        }

        return dummy->next;
    }
};
```

這裡宣告一個 `unordered_map<int, int>` 分別以節點值作為 key 而出現次數作為 value，另外新建立一個指向 `head` 的 dummy head 並且新建立指標 `prev` 隨時指向 `ptr` 之前的節點。 

```c++
ListNode *dummy = new ListNode(0, head);
ListNode *prev = dummy;
```
接著就是移動 `ptr` 若發現節點值有出現過 `umap[ptr->val]>1` 則跳過當前節點，讓前一個節點接到當前節點的下一個節點 `prev->next = ptr->next`，反之則值正常的移動節點 `prev = ptr`,`ptr = ptr->next`。最後只要回傳 `dummy` 的下一個點即可。 

### 執行結果

![](/img/LeetCode/82/result.jpeg)

# 複雜度

| **複雜度類型**       | **複雜度**  |**分析**                                                                 |
|--------------------|----|---------------------------------------------------------------------|
| **時間複雜度**       | $O(n)$ |需要兩次遍歷鏈結串列。第一次用於建立頻率表（$O(n)$），第二次用於移除重複節點（$O(n)$），因此總時間複雜度為線性|
| **空間複雜度**       | $O(n)$ | 使用了一個 `unordered_map`（哈希表）來儲存每個節點值的頻率，所需的空間取決於鏈結串列中唯一值的數量 |

---