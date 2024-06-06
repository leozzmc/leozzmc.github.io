---
title: 合併鏈結串列 | Easy | LeetCode#21 Merge Two Sorted Lists
tags:
  - Linked List
  - LeetCode
  - Easy
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/21/cover.jpeg
abbrlink: 8b576379
date: 2024-06-06 07:24:58
---

# 題目敘述

![](/img/LeetCode/21/question1.png)
![](/img/LeetCode/21/question2.png)

- 題目難度: `Easy`
- 題目描述: 給定兩個已排序 linked list 的 `head`，希望能夠合併成一個已排序的list

# 解法

## 一開始的想法
![](/img/LeetCode/21/algo1.png)

一開始我想說可以先走訪 `list1` 然後逐項比對 `list2` 的item，如果 `list1`中的元素小於 `list2` 的，就插入到 `list2`，並且插入後，再繼續迭代 `list1`當中的元素

原始代碼：

```c
    Node *ptr1, *ptr2, *previous, *preceding; 
    ptr1 = list1;
    ptr2 = list2;
    preceding = ptr1;
    previous = ptr2;

    //Empty lists
    if(ptr1==NULL && ptr2==NULL){
        //return empty list
        return ptr1;
    }
    else if (ptr1 == NULL ){
        return ptr2;
    }
    else if (ptr2 == NULL){
        return ptr1;
    }
    

    while (ptr1 != NULL){
        while (ptr2 !=NULL){
            if (ptr1-> val <= ptr2->val){
                preceding = ptr1->next;
                ptr1->next = ptr2;
                previous->next = ptr1;
                previous = previous -> next;
                break;
            }
            else{
                // //Tail Node
                // if ( (ptr1-> val == ptr2->val) && (ptr1->next == NULL)){
                //     ptr2 -> next = ptr1;
                //     break;
                // }
                previous = ptr2;
                //traverse list2
                ptr2 = ptr2->next;
            }

        }
        ptr1 = preceding;
    }
    return list2;
    
```

但這種做法會在 `previous`, `preceding`更新指標時候會出問題，並且還需要額外判斷 Tail node，由於太過麻煩後續我就放棄這種做法

## 我的解法

```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) {

    struct ListNode  *ptr1, *ptr2;
    struct ListNode  dummy;
    struct ListNode  *tail = &dummy;
    ptr1 = list1;
    ptr2 = list2;
    tail->next = NULL;

    while (ptr1 != NULL && ptr2 != NULL){
        if (ptr1->val <= ptr2->val){
            tail->next = ptr1;
            ptr1 = ptr1->next;

        }
        else{
            tail->next = ptr2;
            ptr2 = ptr2->next;
        }
        tail = tail -> next;

    }
    
    if (ptr1 != NULL) {
        tail->next = ptr1;
    }
    if (ptr2 != NULL) {
        tail->next = ptr2;
    }

    return dummy.next;
    
}
```

### 說明

我後面取而代之的是，建立新的 Linked List 在比較兩個lists的時候就放到新創建的list中

- 先建立一個Linked List，將要返回的內容串接在後面
- 比較兩個Linked List 的value大小，將較小的加入dummy list
- 加入後，原先list的元素會少一個，因此會需要將指標更新 (`ptr2 = ptr2->next;`, `ptr1 = ptr1->next;`)
- 結束後，若還有剩餘的元素在，就在直接加進 dummy 串列中
- 最後回傳 dummyy串列中第一個有值的位址


> 參考： https://hackmd.io/@ChangTL/S1z11PWJv#021-Merge-Two-Sorted-Lists

### 執行結果

![](/img/LeetCode/21/results.png)

## 其他做法



```c
					// 😉😉😉😉Please upvote if it helps 😉😉😉😉
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
       
	    // if list1 happen to be NULL
		// we will simply return list2.
        if(list1 == NULL)
            return list2;
		
		// if list2 happen to be NULL
		// we will simply return list1.
        if(list2 == NULL)
            return list1;
        
        ListNode * ptr = list1;
        if(list1 -> val > list2 -> val)
        {
            ptr = list2;
            list2 = list2 -> next;
        }
        else
        {
            list1 = list1 -> next;
        }
        ListNode *curr = ptr;
        
		// till one of the list doesn't reaches NULL
        while(list1 &&  list2)
        {
            if(list1 -> val < list2 -> val){
                curr->next = list1;
                list1 = list1 -> next;
            }
            else{
                curr->next = list2;
                list2 = list2 -> next;
            }
            curr = curr -> next;
                
        }
		
		// adding remaining elements of bigger list.
        if(!list1)
            curr -> next = list2;
        else
            curr -> next = list1;
            
        return ptr;
       
    }
};
```
- **Time Complexity:** $O(n+m)$
- **Space Complexity:** $O(1)$

### 執行結果

![](/img/LeetCode/21/results2.png)

## 時間複雜度分析

### 時間複雜度

在這個合併兩個已排序linked list的函數中，我們主要考慮走訪每個節點所需的時間，**在最壞情況下，兩個linked list中的每個節點都需要被traverse一次**

- 假設 `list1` 有`n` 個節點，而 `list2` 有 `m` 個節點
- 因此，整個過程中，走訪的節點總數是 `n + m`
- 節點的比較和鏈結操作都是常數時間操作
- 所以，時間複雜度是 $O(n + m)$
 
### 空間複雜度

空間複雜度分析考慮的是程式執行所需的額外記憶體空間，在這個函數中：
- 使用了一個 dummy 節點，它的空間是常數級別的 $O(1)$
- 其餘使用的指標 (如 `ptr1`, `ptr2`, `tail`) 也都是常數級別的空間
- 所以空間複雜度會是 $O(1)$
- 
