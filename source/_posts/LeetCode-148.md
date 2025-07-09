---
title: 鏈結串列排序 | Medium | LeetCode#148. Sort List
tags:
  - Linked List
  - Divide and Conqeur
  - LeetCode
  - Merged Sort
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 9c4eaa61
date: 2025-07-09 16:13:55
cover: /img/LeetCode/148/cover.png
---


# 題目敘述

![](/img/LeetCode/148/question.png)

- 題目難度：`Medium`
- 題目描述：給定一個 Linked List 的 `head` 請將這個 list 進行升階排序 (由小排到大)


# 解法

## 一開始的想法

一開始有想到比較蠢的方法，就是把先在的節點對應到記憶體位址可能存到一個hasht table 之類的，然後把key額外存成陣列進行排序後再建立另一個 linked list。 但後來想要用題目的 follow up條件來做看看，也就是時間複雜度要 $O(nlogn)$ 然後空間複雜度要 $O(1)$

但這空間複雜度 $O(1)$ 基本上就代表只能在原本的 list 上進行操作，然後時間複雜度 $O(nlogn)$ 就代表應該是要用 quick sort 或者 merge sort 之類的方式來對 linked list中的節點進行排序。

我原先想說可以用 quick sort 但 **quick sort 比較適合對 Array 做排序，原因一：Linked Listed 不能夠 random access，存取第 n 個元素就真的要從頭走到第 n 個節點。第二個原因就是做partition 很困難，因為每次切完partition後還需要將比pivot 大或比pivot小的節點移動到pivot節點的兩側，會需要瘋狂動 `next` pointer**，另外 quick sort pivot 沒選好最糟糕時間複雜度會是 $O(n^2)$

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
    ListNode* findMiddle(ListNode* head) {
        if (!head || !head->next) return head;
        ListNode* slow = head;
        ListNode* fast = head->next;
        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }


    ListNode* merge(ListNode* l1, ListNode* l2){
        ListNode dummy;
        ListNode *tail = &dummy;

        while(l1 && l2){
            if(l1->val < l2->val){
                tail->next = l1;
                l1 = l1->next;
            }
            else{
                tail->next = l2;
                l2 = l2->next;
            }
            tail = tail->next;
        }
        if(l1){
            tail->next= l1;
            l1=l1->next;
        }
        else{
            tail->next = l2;
            l2 = l2->next;
        }
        return dummy.next;
    } 



    ListNode* sortList(ListNode* head){
        if(!head || !head->next) return head;

        ListNode *mid = findMiddle(head);
        ListNode *right= mid->next;
        mid->next = nullptr;

        ListNode *left_sorted = sortList(head);
        ListNode *right_sorted = sortList(right);

        return merge(left_sorted, right_sorted);
    }

};
```

對linked list 做merged sort，大方向上就是三個步驟：
- 找中點 → 切兩半
- 左右各自排序
- 合併兩條已排序 linked list

這裡也有用到 Divide and Conquer 的概念，這邊會遞迴去做直到遇到 base case: 也就是只有一個節點時，就不能夠再找中點去切兩半，就時候就會回到上一個caller去排序然後合併，開始一路 return 回去最初的 caller。

{% hideToggle Step1 找中點並切一半 ,bg,color %}
![](/img/LeetCode/148/algo-1.png)
{% endhideToggle %}

{% hideToggle Step2-3 左右各自排序然後合併 ,bg,color %}
(可以點圖片放大看)
![](/img/LeetCode/148/algo-2.png)
但這裡描述的會是兩鏈已經透過 `sortList`函數排序完，並且正要透過 `merge` 合併的狀況
{% endhideToggle %}


首先串列會先被丟到 `findMiddle` 函數透過 fast-slow pointer 去找中點，然後直接將中點pointer的 `next` 接到 `nullptr` 這樣就能拆成兩個list接著會需要各自排序，但排序的原則是要做到只有一個node才能排序，因此遞迴執行下去一樣需要對各自串列找中點切一半，然後 **合併** 。 合併的部分就需要透過 `merge` 函數去做。這邊會先宣告一個 dummy node 方便之後回傳list的head，而另一個 `tail` pointer 會先指到 `dummy`。

`merge` 的精髓就是當兩條鏈都還有節點時，就會去進行比大小，比較小的節點會先接到 dummy 的後面，例如 `l1`  當前節點值比 `l2`當前節點值小，那 `l1` 就會接到 dummy 後面，此時 `l1` 會更新自己的 head 到下一個節點，反之 `l2`如果比較大，那 `l2` 當前節點會接到 dummy 後面，然後 `l2` 的head 更新到自己的下一個節點。每次比較完畢後， `tail` 更新到最新節點，下一個要被新增的節點就從這開始繼續。一旦兩鏈比較完後，如果還有list節點有剩，則後面整條接到重新串的節點後面。


### 執行結果

![](/img/LeetCode/148/result.png)


# 複雜度

時間複雜度：

- 第一層： $O(n)$ merge
- 第二層：兩段各 $n/2$ → $O(n)$
- 第三層：四段各 $n/4$ → $O(n)$
一共會有 $log_{2}^{n}$ 層，而每一層在找中點花費 $O(n)$, 進行 merge 也花費 $O(n)$，因此整體複雜度 $O(n) \times log{n} = O(nlogn)$ 

空間複雜度：
不需要額外array 只有多一個dummy node，因此為 $O(1)$ 但 recursive callstack 會是等同於層數，所以是 $O(log{n})$ 因此整體會是 $O(logn)$

> 結果還是沒有達成空間複雜度 $O(1)$

---
