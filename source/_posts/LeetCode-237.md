---
title: 刪除鏈結串列 | Medium | LeetCode#237 Delete Node in a Linked List
toc: true
tags:
  - Linked List
  - LeetCode
  - Medium
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/237/cover.jpg
abbrlink: 5efda43a
date: 2024-06-02 23:39:09
---


# 題目敘述

![](/img/LeetCode/237/question-1.png)

![](/img/LeetCode/237/question-2.png)

![](/img/LeetCode/237/question-3.png)

- 題目難度: `Medium`
- 題目描述: 如同圖中所述，題目中要求我們對一個 Single Linked List `head` 去實現一個刪除特定節點的函式，函式的輸入叫做 `node`，題目中有特別說明。
- 限制:
    - `node` 不會是 `head`中的最後一個節點，並且我們並不能夠存取 `head` 中的第一個元素，也就是整個 List 的初始節點。
    - 這題的刪除節點不需要釋放記憶體，僅需將前一個節點連接到 `node` 的後一個節點

> 在 Run 以及 Submit 的時候，題目會建好List 並且呼叫我們寫的function，來去進行測試，這題只需要專注在刪除節點的邏輯上就好

# 解法

## 一開始的想法

一開始我陷入了傳統刪除節點的做法當中，也就是已知初始節點的條件下去走訪每個節點，指到找到給定節點，再去執行刪除的邏輯。

### 傳統作法

```c
Node* DeleteNode(Node* first ,Node* node){
    Node* ptr= first;
    if (first == NULL)
    {
        printf("Noting to print\n");
    }
    // Delete first node of the list
    if (node == first){
        // Update the first pointer to the next node
        first = first->next;
        free(node);
        return first;
    }
    else{
        // ptr traverse through the list
        while (ptr->next != node)
        {
            ptr = ptr->next;
        }
        ptr->next = node->next;
        free(node);
        return first;
    }
}
```

這種做法會**需要知道 `node`的前一個節點，才有辦法指向到 `node`的下一個節點**，但這題中，已知資訊只有 `node` 的位址，**因此沒辦法知道前一個節點是誰。**

![](/img/LeetCode/237/explain.png)

## 我的解法

面對這種狀況，可以換一個想法，**可以把 `node` 後面節點的資料往前複製過來，持續進行，直到遇到NULL，也能夠實現一樣的效果**


![](/img/LeetCode/237/solution.png)
```c
void deleteNode(struct ListNode* node){
    struct ListNode  *nextNode, *current = node ;
    while(current->next != NULL){

        nextNode = current->next;
        current->val = nextNode->val;
        if(current->next->next == NULL){
            current->next = NULL;
        }
        else{
            //update current pointer
            current = nextNode;
        }
    }
}
```

執行結果如下:

![](/img/LeetCode/237/result-1.png)


## 更好的做法

其實有更加精簡的寫法，但時間複雜度其實沒什麼太大差異

```c
void deleteNode(struct ListNode* node){
    node->val = node->next->val;
    node->next = node->next->next;
}
```

執行結果:
![](/img/LeetCode/237/result-2.png)

> 但好像多花費了 1ms, ....

## 時間複雜度分析

**時間複雜度**: $O(1)$: 本演算法包含固定數量的操作，像是更新當前節點的資料並更改其下一個指標，這些操作中的每一個都需要固定的時間，無論 Linked List 的大小如何。
**空間複雜度**: $O(1)$: 這種刪除技術不需要任何額外的記憶體分配，因為它直接在現有節點上操作而無需建立額外的資料結構


