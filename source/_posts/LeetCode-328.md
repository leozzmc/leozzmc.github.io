---
title: 奇偶數鏈節串列 | Medium | LeetCode#328 Odd Even Linked List
toc: true
tags:
  - Linked List
  - LeetCode
  - Medium
categories: LeetCode筆記
aside: true
abbrlink: Odd_Even_Linked_List
date: 2024-06-17 23:56:35
cover: /img/LeetCode/328/cover.jpg
---

# 題目敘述

![](/img/LeetCode/328/question1.png)

- 題目難度: `Medium`
- 題目敘述: 給定一個 single linked list 的 `head`，將所有具有奇數索引的節點分組在一起，然後將具有偶數索引的節點分組，並傳回重新排序的list。第一個節點為奇數索引，接著第二個為偶數，以此類推，此題要求實作的演算法空間複雜度為 $O(1)$ 而時間複雜度為 $O(n)$


# 解法


## 一開始的想法

![](/img/LeetCode/328/algo1.png)


> 我的想法就是先traverse list，然後紀錄偶數節點個數和奇數節點個數，之後各自建立新的lists，最後合併兩個lists然後回傳薪的head


## 我的解法

```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* oddEvenList(struct ListNode* head) {

    if (head == NULL) return NULL;
    int counter = 0;
    int oddCounter = 0;
    int evenCounter = 0;
    struct ListNode *ptr = head;

    // traverse through the list, derive the length of the list
    while(ptr != NULL){
        counter++;
        if (counter % 2 == 0){
            evenCounter++;
        } else {
            oddCounter++;
        }
        ptr = ptr->next;
    }

    // Create odd list
    struct ListNode *oddPtr = head;
    struct ListNode *newOddHead = NULL;
    struct ListNode *OddTail = NULL;
    struct ListNode *oddPrevious = NULL;

    for (int i = 0; i < oddCounter; i++) {
        struct ListNode *newNode = (struct ListNode *)malloc(sizeof(struct ListNode));
        newNode->val = oddPtr->val;
        if(i == 0){
            newOddHead = newNode;
        } else {
            oddPrevious->next = newNode;
        }
        oddPrevious = newNode;
        if (oddPtr->next != NULL && oddPtr->next->next != NULL) {
            oddPtr = oddPtr->next->next;
        } else {
            break;
        }
    }
    OddTail = oddPrevious;
    if (OddTail != NULL) {
        OddTail->next = NULL;
    }

    // Create even list
    struct ListNode *evenPtr = head->next;
    struct ListNode *newEvenHead = NULL;
    struct ListNode *evenPrevious = NULL;

    for (int i = 0; i < evenCounter; i++) {
        struct ListNode *newNode = (struct ListNode *)malloc(sizeof(struct ListNode));
        newNode->val = evenPtr->val;
        if(i == 0){
            newEvenHead = newNode;
        } else {
            evenPrevious->next = newNode;
        }
        evenPrevious = newNode;
        if (evenPtr->next != NULL && evenPtr->next->next != NULL) {
            evenPtr = evenPtr->next->next;
        } else {
            break;
        }
    }
    if (evenPrevious != NULL) {
        evenPrevious->next = NULL;
    }


    // merge two lists
    if (OddTail != NULL) {
        OddTail->next = newEvenHead;
    } else {
        newOddHead = newEvenHead;
    }

    return newOddHead;
}
```


### 說明

- 首先，函數檢查輸入的list是否為空，如果是empty list，則直接返回 NULL。

```c
    int counter = 0;
    int oddCounter = 0;
    int evenCounter = 0;
    struct ListNode *ptr = head;

    while(ptr != NULL){
        counter++;
        if (counter % 2 == 0){
            evenCounter++;
        } else {
            oddCounter++;
        }
        ptr = ptr->next;
    }
```
- 這個部分主要是用來計算奇數和偶數節點各自的數量

```c
    struct ListNode *oddPtr = head;
    struct ListNode *newOddHead = NULL;
    struct ListNode *OddTail = NULL;
    struct ListNode *oddPrevious = NULL;

    for (int i = 0; i < oddCounter; i++) {
        struct ListNode *newNode = (struct ListNode *)malloc(sizeof(struct ListNode));
        newNode->val = oddPtr->val;
        if(i == 0){
            newOddHead = newNode;
        } else {
            oddPrevious->next = newNode;
        }
        oddPrevious = newNode;
        if (oddPtr->next != NULL && oddPtr->next->next != NULL) {
            oddPtr = oddPtr->next->next;
        } else {
            break;
        }
    }
    OddTail = oddPrevious;
    if (OddTail != NULL) {
        OddTail->next = NULL;
    }
```
- 上面這段則是要建立奇數 linked list
- 首先宣告的奇數的指標 `oddPtr`，用於走訪原本的List，`newOddHead`、`OddTail` 新的 Head 與 Tail，用於存放前一個節點的指標 `oddPrevious`
- 接著就是在 for 迴圈中創建奇數節點，特別需要針對在 `i==0` 的時候指定新的 Head，其餘就將 `oddPrevious->next = newNode;` 在if-else判斷式之外，會將 `oddPrevious` 更新為當前節點，**接著就是讓 `oddPtr` 走訪到原始List的下下個節點(奇數)**，這裡需要小心的是，`oddPtr->next` 或者 `oddPtr->next->next` 可能會訪問到NULL，形成空指標，這會導致 RuntimeError，因此需要做判斷。
- list建立完後，指定最後一個節點為 Tail 節點，並將其指向 NULL

```c
    struct ListNode *evenPtr = head->next;
    struct ListNode *newEvenHead = NULL;
    struct ListNode *evenPrevious = NULL;

    for (int i = 0; i < evenCounter; i++) {
        struct ListNode *newNode = (struct ListNode *)malloc(sizeof(struct ListNode));
        newNode->val = evenPtr->val;
        if(i == 0){
            newEvenHead = newNode;
        } else {
            evenPrevious->next = newNode;
        }
        evenPrevious = newNode;
        if (evenPtr->next != NULL && evenPtr->next->next != NULL) {
            evenPtr = evenPtr->next->next;
        } else {
            break;
        }
    }
    if (evenPrevious != NULL) {
        evenPrevious->next = NULL;
    }
```
- 偶數List做的事情一樣，差別是不用指定 Tail 節點

```c
    if (OddTail != NULL) {
        OddTail->next = newEvenHead;
    } else {
        newOddHead = newEvenHead;
    }

    return newOddHead;
}
```
- 最後就是合併Lists，將奇數list的Tail 接到偶數list的Head，之後回傳新的 head 

### 執行結果

![](/img/LeetCode/328/results1.png)

> 這種作法感覺有點太過冗長，並且需要額外考慮很多空指標的狀況...

## 更好的做法

```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* oddEvenList(struct ListNode* head) {
    
    if (head == NULL || head->next == NULL) return head;

    struct ListNode *oddPtr = head;
    struct ListNode *evenPtr = head->next;
    struct ListNode *evenHead = evenPtr;

    while (evenPtr != NULL && evenPtr->next != NULL) {
        oddPtr->next = evenPtr->next;
        oddPtr = oddPtr->next;
        evenPtr->next = oddPtr->next;
        evenPtr = evenPtr->next;
    }

    oddPtr->next = evenHead;

    return head;

}
    
```

> 超級優美的寫法

- 一樣是先判斷是否有空鏈結，如果有就回傳null
- 這段代碼初始化了三個指標：
    - `oddPtr` 指向奇數位置的節點（初始指向 `head`）
    - `evenPtr` 指向偶數位置的節點（初始指向 `head->next`）
    - `evenHead` 用來保存偶數鏈表的頭指針，以便後續合併list

接著就是神奇的地方了
- 只要把奇數節點的下一個鏈結到偶數節點的下一個，則可以建立奇數鏈結
- 只要把偶數節點的下一個鏈結到奇數節點的下一個，則可以建立偶數鏈結
- 最後將奇數的指標接到偶數的Head 即完成

### 執行結果

![](/img/LeetCode/328/results2.png)

## 複雜度分析- 我的解法

### 時間複雜度
- 計算節點數量:程式碼首先遍歷整個linked list以計算鏈表的長度 n。這個操作的時間複雜度是 $O(n)$，其中 n 是 list 的節點數量
- 創建奇數索引linked list: 根據奇數索引的節點數量 `oddCounter` 遍歷原始list，創建一個新的奇數索引list。**由於 `oddCounter` 最大為 `n/2`，因此創建過程的時間複雜度為 $O(n)$**
- 創建偶數索引linked list: 根據奇數索引的節點數量 `evenCounter` 遍歷原始list，創建一個新的奇數索引list。**由於 `evenCounter` 最大為 `n/2`，因此創建過程的時間複雜度為 $O(n)$**
- 最後，合併兩個鏈表的操作是常數時間的 $O(1)$

### 空間複雜度

除了存儲原始list之外，程式碼使用了額外的空間來存儲新創建的奇數索引和偶數索引list的節點。
`oddCounter` 和 `evenCounter` 分別代表奇數索引和偶數索引的節點數量。最壞情況下，它們各自最多為 `n/2`，因此額外空間複雜度為 $O(n)$

> 因此這不滿足題目要求

## 複雜度分析- 另一個解法

### 時間複雜度

只做了單次traverse，程式碼只需一次遍歷整個List，並在遍歷過程中執行節點的重新排列操作。
因此，時間複雜度為 $O(n)$，其中 n 是節點數量

### 空間複雜度

程式碼僅使用了幾個額外的指標變數來記錄奇數節點 `oddPtr`、偶數節點 `evenPtr` 以及偶數節點鏈表的頭部 `evenHead`
因此，額外空間的使用是常數級別的 $O(1)$