---
title: 重新排序鏈結 | Medium | LeetCode#143. Reorder List
tags:
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/143/cover.jpg
abbrlink: 94b01956
date: 2024-10-18 22:31:43
---

# 題目敘述

![](/img/LeetCode/143/question1.jpeg)

![](/img/LeetCode/143/question2.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給定一個 single linked list，`L0 → L1 → … → Ln - 1 → Ln` 請將這個 list 重組成 `L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …` 在這當中請不要改動節點值。

# 解法

## 一開始的想法


![](/img/LeetCode/143/algo1.png)

由於排序看起來像是把一個 linked list 頭尾對折然後再交互連接，**因此我的想法會是先找到鏈結的中間節點，再將其拆分成兩個 list，之後將後半部分的 list 進行反序排列，接著再跟前半部分的list交互排列。**

## 我的解法

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
    ListNode* reverseList(ListNode *head){
        ListNode *prev = NULL;
        ListNode *cur = head;
        while( cur != nullptr){
            ListNode* nextTemp = cur->next;
            cur->next = prev;
            prev =cur;
            cur = nextTemp;
        }
        return prev;
    }

    void reorderList(ListNode* head){
        if (!head || !head->next) return;
        ListNode *ptr1 = head;
        ListNode *ptr2 = head;

        // Find the middle node  of the list
        while( ptr2->next!= nullptr  && ptr2->next->next !=nullptr){
            ptr1 = ptr1->next;
            ptr2 = ptr2->next->next;
        }
        // Now the ptr2 point to the end of the list, and the ptr1 point to the middle node
        // Reverse the second half of the list

        ptr2 = reverseList(ptr1->next);
        ptr1->next =  nullptr;

        ptr1=head;
        while(ptr2 != nullptr){
            ListNode *nextPtr = ptr1->next;
            ListNode *nextPtr2 = ptr2->next;
            
            ptr1->next =  ptr2;
            ptr1 = nextPtr;
            ptr2->next =  ptr1;
            ptr2 = nextPtr2;
        }
    }
};
```

這裡透過兩個函數來進行實踐， `reorderList` 以及 `reverseList`，首先在 `reorderList` 的部分，要先找到中間節點，這裡是採用 **Two-Pointer** 的作法，也就是讓兩個指標走的速度不一樣，指標 `ptr1` 一次走一個，而 `ptr2` 一次走兩個，當 `ptr2` 走到最後一個節點的時候，`ptr1` 會剛好找到中間的節點。

**這時中間節點的下一個節點就會是後半部鏈結的頭**，就直接將他丟到 `reverseList` 函數中，並將回傳結果更新為 `ptr2`

*reverseList* 這裡挺基本的，就是透過兩個指標，一個指向前一個節點，另一個指向當前節點，另外宣告一個暫存下一個位址的指標(當前的`next`)，接著，**當前節點的下一個節點，由於要反序鏈結，所以要指向前一個節點 (`prev`)**，而這時 `prev` 的任務就完成了，將其指向到當前節點的位置 (`cur`)，接著要更新當前節點，讓他繼續往下走，所以讓他指向 `nextTemp`，最後在跳出迴圈時，`cur` 會指向 `NULL` 而 `prev` 會指向最後一個節點的位址，而現在他會是反序鏈結的頭

```cpp
ListNode* reverseList(ListNode *head){
  ListNode *prev = NULL;
  ListNode *cur = head;
  while( cur != nullptr){
      ListNode* nextTemp = cur->next;
      cur->next = prev;
      prev =cur;
      cur = nextTemp;
  }
  return prev;
}
```
![](/img/LeetCode/143/reverse.png)


我們回到 `reorderList`

```cpp
ptr1->next =  nullptr;

ptr1=head;
while(ptr2 != nullptr){
    ListNode *nextPtr = ptr1->next;
    ListNode *nextPtr2 = ptr2->next;
    
    ptr1->next =  ptr2;
    ptr1 = nextPtr;
    ptr2->next =  ptr1;
    ptr2 = nextPtr2;
}
```

接著要將兩個鏈結切乾淨，因此將原先在前鏈結中間節點接到 `NULL`，並 `ptr1` 指回原本的 `head`，這時就可以來交互排列了，這裡需要兩個額外的指標來保存原先個別節點的下一個位址

接著就是從 `ptr1` 的下一個節點指向給 `ptr2`， `ptr1` 移動到它原先的下個節點 `nextPtr`
而 `ptr2` 指向給 `ptr1` 原先的下一個節點， `ptr2` 移動到它原先的下個節點 `nextPtr2`

```cpp
while(ptr2 != nullptr){
    ListNode *nextPtr = ptr1->next;
    ListNode *nextPtr2 = ptr2->next;
    
    ptr1->next =  ptr2;
    ptr1 = nextPtr;
    ptr2->next =  ptr1;
    ptr2 = nextPtr2;
}
```

這樣就能夠成功排序。

### 執行結果

![](/img/LeetCode/143/result.jpeg)


# 複雜度
## 時間複雜度

- 找中間節點: $O(n/2)$，$n$ 為節點數量
- 反轉鏈表後半部分: $O(n/2)$，$n$ 為節點數量
- 合併兩個鏈表: $O(n)$

因此整體時間複雜度為 $O(n)$


## 空間複雜度

$O(1)$，額外使用的指標變數僅占用常數規模的空間複雜度。