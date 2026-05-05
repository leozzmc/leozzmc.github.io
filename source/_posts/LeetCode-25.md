---
title: K 組反轉節點 | Hard | LeetCode#25. Reverse Nodes in k-Group
tags:
  - LeetCode
  - Hard
  - Linked List
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 34b4f737
date: 2025-12-22 19:05:33
cover: /img/LeetCode/25/cover.png
---

# 題目敘述

![](/img/LeetCode/25/question1.png)
![](/img/LeetCode/25/question2.png)

- 題目難度: `Hard`
- 題目敘述: 題目給定一個 linked list 的 `head`，請每 `k` 個節點反轉一次，最後回傳整個 linked list 的 `head`

{% note info %}
這邊的 `k` 會是正整數，如果 list 長度無法整除 `k` 則剩餘的節點不反轉
然後題目有提醒，你只能變更整的節點，不能夠透過改節點值來完成這題，另外也希望在 O(1) 空間複雜度完成這題
{% endnote %}

這邊也可以觀察題目的 constraint， `1 <= k <= n <= 5000`

# 解法

## 一開始的想法

我的想法其實就是，先找有幾組，然後剩餘湊不滿一組的就不管它。然後每一組會做反轉，因為每 `k` 個節點會是一組，可能單獨一個用於反轉的函數來處理，然後丟那一組的 `head`, `tail` 跟 前一組的尾端。

所以應該會是，迴圈迭代去找每一組的頭跟尾，回圈內呼叫用於反轉list的函數，接著回傳回來的節點應該要是新的 head，這個 head 還要再去跟前一組尾端接起來。

最後回傳新的 list 的頭

## 我的解法

```c++

ListNode *reverseList (ListNode* pprev, ListNode* head, ListNode* tail){
    ListNode *after = tail->next;
    ListNode *current = head;
    ListNode *prev = after;

    while(current!=after){
        ListNode *nextNode = current->next;
        current->next = prev;
        prev = current;
        current = nextNode;
    }
    pprev->next = prev;
    return head;
}


ListNode* reverseKGroup(ListNode* head, int k) {

    ListNode dummy = ListNode(0, head);
    ListNode *group_prev = &dummy;

    while(true){
        ListNode *kth = group_prev;
        for(int i=0; i<k; i++){
            if(kth) kth = kth ->next;
        }
        if(!kth) break;

        group_prev = reverseList(group_prev,group_prev->next,kth);
        
    }

    return dummy.next;
}
```

這邊可以先看主程式 `reverseKGroup`，首先可以新建立一個 dummy node 作為之後回傳用的頭。接著宣告一個指標 `group_prev` 用來指向每一組的最後一個節點，這樣下一組在反轉完畢後，就可以跟前一組的接在一起。

> 下面的寫法後來有參考其他人的做法，我知道那個 `while(true)` 看起來讓人很不安心

不過接下來要去找每個 Group 當中的第 K 個節點是甚麼。首先在迴圈內，每一組的起點會是上一組的終點 `group_prev` 而每組中有 k 個節點，因此要從上一組的終點會需要移動 k 次才會到當前組別的最後一個節點。

移動到每組第 k 的節點後，直接呼叫 `reverseList`  用來處理組別內的節點反轉，回傳值會是反轉後的新的 `group_prev`，也就是當前組別新的尾端。

而整個無窮迴圈會在甚麼時候停止，也就會是在找不到第 K 個節點值就會停止。所以有可能是 list 長度可以整除 `k` 但已經走完了，或者是 list 長度不能整除 `k` 所以有剩餘不滿 k 個節點，在這種作法下都可以涵蓋到，就不用寫一堆 edge case 處理邏輯了。

另外可以看一下用於處裡反轉的函數 `reverseList`，函數內會給定頭跟尾 (`head`, `tail`) 以及前一個 group的最末端節點 `pprev`。這邊宣告三個指標來進行反轉：

- `after` 用來指向當前組別末端節點接到的下一個節點位址
- `current` 用來操作當前節點
- `prev` 用來操作前一個節點

![](/img/LeetCode/25/algo.png)

這邊有畫個圖解，只要當當前指標不會 `after` 那就先新宣告一個新指標 `nextNode` 保存當前節點的下一個節點位址，接著當前節點就可以反過來接回到 `prev` 也就是往這組的尾端去接，節完後 `prev` 就更新為當前節點，當前節點更新為剛剛紀錄的 `nextNode`。

做完後整組鏈結就反轉過來了，而前一組的最末節點需要指向到新的頭， 所以 `PPREV->next = prev`。而這樣原先傳入的 `head` 會是新的本組鏈結尾端，回傳回主程式。 


### 執行結果

![](/img/LeetCode/25/result.png)


# 複雜度

時間複雜度: $O(N)$

空間複雜度: $O(1)$

---
