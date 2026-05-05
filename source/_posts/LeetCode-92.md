---
title: 反轉鏈結串列 II | Medium | LeetCode#92. Reverse Linked List II
tags:
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 8317fd5b
date: 2024-12-16 19:10:12
cover: /img/LeetCode/92/cover.png
---


# 題目敘述


![](/img/LeetCode/92/question.jpeg)

- 題目難度：`Medium`
- 題目描述：給定一個鏈結串列的 `head` 以及整數 `left` 和 `right`，其中 `left<= right`，請將 `left` 到 `right` 範圍內的鏈結進行反轉，最後回傳整個串列的頭。 

# 解法

## 一開始的想法

一開始的想法蠻單純的，就是要找到 `left` 的前一個節點，以及 `right` 的後一個節點 (**用來記錄反轉後要連接的節點**)，將中間鏈結反轉後再接回這兩個節點。

## 我的解法

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
    ListNode* reverseBetween(ListNode* head, int left, int right){
    
        ListNode *dummyNode = new ListNode(0);
        dummyNode->next = head;
        ListNode *leftNode = dummyNode;

        // Find the left and right node
        for(int i=1; i<left; i++){
            leftNode = leftNode->next;
        }
        
        ListNode *prev=nullptr;
        ListNode *ptr=leftNode->next;
        for(int i=left; i<=right; i++){
            ListNode *temp = ptr->next;
            ptr->next = prev;
            prev = ptr;
            ptr = temp;
            left++;
        }
        

        // Connect the reversed sublist with the original list
        leftNode->next->next = ptr;
        leftNode->next = prev;

        return dummyNode->next;
    }
};
```

後來發現也不用找到 `right` 後面的節點，找到 `left` 後就可以開始反轉了。這裏反轉的操作就是典型做法，透過一個 `temp` 指標紀錄當前節點的下一個位址，接著將當前節點接到前一個節點上，最後更新當前節點指標 `ptr` 和先前節點指標 `prev`，一旦反轉到 `right` 節點，則停止。 最後需要將反轉後的串列跟原本的節點合併。


*反轉前*
```
dummy -> ... -> leftNode -> [待反轉區域] -> ptr -> ...
```

*反轉後*
```
dummy -> ... -> leftNode -> [反轉後的區域頭節點 prev] -> ... -> [反轉後的區域尾節點] -> ptr -> ...
```

反轉後的 `ptr` 會是反轉後串列右側需要接上的節點，但因為串列被反轉了，因此目前最右側的節點會是 `leftNode->next` 因此需要將他的下一個節點指向 `ptr` (`leftNode->next->next = ptr`) 接著需要將反轉前的左節點連接到反轉後的子串列的尾端節點 (`leftNode->next`)。

函數最後回傳 `dummyNode->next` 則會是新串列的頭。

### 執行結果

![](/img/LeetCode/92/result.jpeg)

## 複雜度

時間複雜度: $O(n)$

空間複雜度: $O(1)$

---