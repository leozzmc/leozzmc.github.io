---
title: 鏈結串列刪除元素 | Easy |LeetCode#203 Remove Linked List Elements
toc: true
tags:
  - Linked List
  - LeetCode
  - Easy
  - C
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/203/cover.jpg
abbrlink: 2db2c541
date: 2024-06-03 15:37:28
---

# 題目敘述

![](/img/LeetCode/203/question1.png)

![](/img/LeetCode/203/question2.png)

- 題目難度: Easy
- 題目描述: 給定一個 Linked List 的 `head` 以及想要刪除節點的數值 `val`，要我們移除list中**所有等於 `val` 的節點**，所以如果所有節點數值都等於 `val` 則結果會是一個 emptt list

# 解法

## 一開始的想法

```
1. 定義節點結構
2. 建立 linked list
3. removeElements
3-1. 宣告暫存空間
3-2  判斷是否是 Empty List
3-3. 走訪整個List
3-4. 判斷是否等於 val，如果等於:那就將前一個節點連接到後一個節點，並釋放記憶體以刪除 val 所在節點
3-5  回傳head
```

這是看到題目後一開始的主要想法，並且一開始很天真的想說還需要考慮刪除節點在 Head, 中間 以及 Tail 三種狀況，實作後才發現其實只需要判斷頭跟其他地方就好，Tail 應該不用單獨拿出來處理。

## 我的解法

```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* removeElements(struct ListNode* head, int val) {
    struct ListNode * ptr = head;
    struct ListNode * previous = head;
    // empty list
    if (ptr== NULL){
        //printf("empty list\n");
        return ptr;   
    }

    while( ptr != NULL){
        if ( ptr->val == val){
            struct ListNode *tmp = ptr;
            if( ptr == head ){
                head = ptr->next;
                ptr = ptr->next;
                free(tmp);
            }
            else{   
                previous->next = ptr->next;
                ptr = ptr->next;
                free(tmp);
            }     
        }
        else{
            previous = ptr;
            ptr = ptr->next;
        }
    }
    return head;
}
```

### 說明

- 程式碼在一開始宣告了兩個指標，分別用來遍歷鏈結串列 (`ptr`) 和跟踪當前節點的前一個節點 (`previous`)
- 首先判斷 Empty List 的狀況，若發現 emptry list 回傳 head，原封不動的還回去
- 接著，若節點不是空的，則開始遍歷整個List，如果發現節點的資料等於 `val` (`if ( ptr->val == val)`)，則可以後續判斷是否是在頭節點還是其他地方，如果資料不匹配，那就直接換下一個節點 ，所以要更新 `previous` 指標以及 `ptr`指標 (`previous = ptr;`, `ptr = ptr->next;`)
- 當然，還需要宣告一個暫存用的指標，來存放要被刪除的節點位址
- 接著判斷 `ptr == head ` 是否為頭節點，如果是那就更新 `head` 指標，以及 `ptr` 指標，來繼續走訪，並且透過 free 來釋放記憶體位址
- 如果不是頭節點，也就是中間或tail節點，這時需要將前一個節點指向 `val` 的後一個節點 (`previous->next = ptr->next;`)，後續一樣再用 `ptr = ptr->next;` 來繼續走訪 list 
- 回傳 `head`

### 執行結果

![](/img/LeetCode/203/result1.png)

## 更好的做法

上面的做法使用了兩個指標來儲存狀態，其實也有辦法減少到使用一個指標

```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* removeElements(struct ListNode* head, int val) {
    // Apporach-2
    struct ListNode * ptr = head;
    // empty list
    if (ptr== NULL){
        //printf("empty list\n");
        return ptr;   
    }
    // Handle head node
    while(head!=NULL && head->val==val){
        head = head->next;
    }

    while( ptr != NULL && ptr->next != NULL){
        if ( ptr->next->val == val){
            ptr->next = ptr->next->next;     
        }
        else{
            ptr = ptr->next;
        }
    }
    return head;
}
```

### 執行結果


![](/img/LeetCode/203/result2.png)

對比先前的結果，又更進一步減少空間的使用


## 時間複雜度分析

- 時間複雜度: $O(n)$:  while迴圈這部分是traverse鏈結串列的主要邏輯。遍歷整個鏈結串列的時間複雜度是 $O(n)$，其中 `n` 是鏈結串列中的節點數量。在最壞情況下，每個節點都會被檢查一次，並且可能會被刪除
- 空間複雜度 $O(1)$: 這段程式碼不需要額外的數據結構來存儲鏈結串列或其部分，除了 `*ptr`, `*previous` 兩個指標變數，這些都是用於遍歷和操作鏈結串列的指針，佔用的是常數空間，即 $O(1)$，刪除節點時使用的臨時指標也屬於常數空間，因此整體空間複雜度依然是 $O(1)$

