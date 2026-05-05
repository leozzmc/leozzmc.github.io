---
title: 反向鏈結串列 | Easy |LeetCode#206 Reverse Linked List
tags:
  - Linked List
  - LeetCode
  - Easy
  - C
categories: LeetCode筆記
aside: true
abbrlink: a6b83df3
date: 2024-06-05 23:10:39
cover: /img/LeetCode/206/cover.jpg
---


# 題目敘述

![](/img/LeetCode/206/question-1.png)

![](/img/LeetCode/206/question-2.png)

- 題目難度: `Easy`
- 題目描述: 給定一個 linked list 的 `head`，希望整個 list 反轉，並且回傳反轉後的list

# 解法


## 一開始的想法

```
1. 定義節點結構
2. 建立 linked list
3. reverseList()
4. 建立暫存節點，用來存放下一個節點的位址，也需要站存上一個節點的位址
4-1. 將下一個節點的位址鏈結到上一個節點
4-2. 更新暫時存節點
4-3 . 更新前一個節點
4-4.  移動至下一個節點
5. 更新初始節點指標
6. 回傳初始節點指標
```

![](/img/LeetCode/206/algo.png)

> 後來我發現 `head` 跟tail 其實可以不用各別分開處理


## 我的解法

```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* reverseList(struct ListNode* head) {
    struct ListNode *tempNode, *current, *previous;    
    current = head;
    previous = NULL;

    while ( current != NULL){
        tempNode = current-> next;
        current->next = previous;
        previous = current;
        current = tempNode;
    }
    return previous;
}
```

### 說明
-  一開始宣告了三個指標變數:
   -  `tempNode`: 用於臨時保存當前節點的下一個節點
   -  `current`: 用於走訪 linked list 的當前節點
   -  `previous`: 用於保存當前節點的前一個節點，最終會成為反轉後的新的頭節點

- 初始化:
    - 將 `current` 初始化為 `head`，即list的頭節點
    - 將 `previous` 初始化為 NULL，因為反轉後的新頭節點的下一個節點應為 NULL

- 迴圈部分:
  - 只要還有節點需要處理，就繼續反轉，直到遇到 NULL
  - 一開始先保存當前節點的下一個節點，這樣在改變指標方向後不會丟失剩下的 list
  - **將當前節點的 `next` 指標指向前一個節點 (`previous`)，這是實現反轉的關鍵一步**
  - `previous = current`: 移動 previous 指標，使其指向當前節點，為下一次迴圈做準備
  - `current = tempNode`: 移動 current 指標，使其指向原來的下一個節點，繼續處理下一個節點
- 當迴圈結束時，`previous` 指向的是反轉後的 list 的頭節點，因為當 `current` 為 NULL 時， `previous` 剛好是最後一個非空節點
- 回傳 `previous`

### 執行結果

![](/img/LeetCode/206/results.png)

## 其他做法

```C
struct ListNode* reverseList(struct ListNode* head){
    // Special case...
    if(head == NULL || head->next == NULL)  return head;
    // Initialize prev pointer as the head...
    struct ListNode* prev = head;
    // Initialize curr pointer as the next pointer of prev...
    struct ListNode* curr = prev->next;
    // Initialize next of head pointer as NULL...
    head->next = NULL;
    // Run a loop till curr and prev points to NULL...
    while(prev != NULL && curr != NULL){
        // Initialize next pointer as the next pointer of curr...
        struct ListNode* next = curr->next;
        // Now assign the prev pointer to curr’s next pointer.
        curr->next = prev;
        // Assign curr to prev, next to curr...
        prev = curr;
        curr = next;
    }
    return prev;    // Return the prev pointer to get the reverse linked list...
}
```

這是解答區其他人回覆的做法，也是 0ms，他的做法跟我的大同小異，但他的會需要額外去判斷是否為 empty list 並且把 `head` 指向 NULL 單獨出來做。


### 執行結果

![](/img/LeetCode/206/results-2.png)

> 看來這樣要多判斷的狀況，會添加將近 3ms...

## 時間複雜度分析
- 時間複雜度: $O(n)$: while迴圈這部分是traverse鏈結串列的主要邏輯，遍歷整個鏈結串列的時間複雜度是 $O(n)$， `n` 會是節點數量
- 空間複雜度 $O(1)$: 三個指標（`tempNode`, `current`, `previous`）：這些變量佔用常數空間  $O(1)$。