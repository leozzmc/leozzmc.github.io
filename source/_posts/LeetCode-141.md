---
title: 鏈節串列循環 | Easy | LeetCode#141. Linked List Cycle
toc: true
tags:
  - Linked List
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 992d29db
date: 2024-10-02 22:37:07
cover: /img/LeetCode/141/cover.jpg
---

# 題目敘述

![](/img/LeetCode/141/question.jpeg)

![](/img/LeetCode/141/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 這題給定一個linked list 的 `head` 要求，判斷這個linked list 當中是否存在 Cycle。


{% note info %}
這裡的 Cycle 代表，你能夠透過持續跟隨`next`指標走訪list，而重複的訪問到曾經訪問過的節點，則代表有Cycle
{% endnote %}

> 另外，題目還說明了他們是用一個 `pos` 變數來去將一個linked list 讓Tail node接到特定index的節點上，這代表這題的cycle 只會從 tail node 往回接，而 `pos` 變數對我們而言不重要，因為它並不是這題能夠存取到的變數

# 解法

## 一開始的想法

我的想法是這題可以透過記錄節點是否有走訪過來判斷是否有 Cycle，因為這題會將Tail node 接回其他node，因此如果有Cycle 必定會有節點重複走訪，且無法抵達 `NULL`。而儲存方式比較快的應該是用 Hash Table 來去實現。

## 我的解法- Hash Table

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    unordered_map<ListNode*, int> umap;
    bool hasCycle(ListNode *head){
        struct ListNode *ptr = head;

        while(ptr != NULL){
            if(umap.find(ptr) != umap.end()){
                return true;
            }
            umap[ptr] = ptr->val;
            ptr = ptr->next;
        }
        return false;
    }
};
```

上面定義了一個 hash table 叫做 `umap` 他的Key與Value 分別為 `<ListNode*, int>`，分別儲存節點的位址以及節點值，但其實這題節點值也非必要，主要是靠節點位址來判斷是否重複訪問。

一旦指標 `ptr` 尚未抵達 tail node 時，就會先將節點位址以及節點值存放到 hash table，接著就移動到下一個節點

```cpp
umap[ptr] = ptr->val;
ptr = ptr->next;
```
而一旦每次拜訪節點時，會去檢查這個節點是否存在於Hash table 當中，一旦找到就直接回傳 True

```cpp
if(umap.find(ptr) != umap.end()){
    return true;
}
```


## 我的解法- Vector

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    vector<ListNode*> nodelist;
    bool hasCycle(ListNode *head){
        struct ListNode *ptr = head;

        while(ptr != NULL){
            for(int i=0; i<nodelist.size(); i++){
                if(ptr == nodelist[i]) return true;
            }
                nodelist.push_back(ptr);
                ptr = ptr->next;
            }
            return false;
        }
};
```

這裡儲存方式使用 `vector` 但缺點就是在每次檢查時，都會耗費 $O(n)$ 時間，`n` 為 vector 長度，會隨節點數量增加而提升 


## 其他做法 - Floyd's Cycle-Finding Algorithm

其實就是 Two-Pointer 做法，只要 **快跟慢指標在某個節點相遇，就代表有cycle**

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    bool hasCycle(ListNode *head){
        if (!head || !head->next) return false; 
        ListNode *slow = head; 
        ListNode *fast = head;

        while (fast && fast->next) {
            slow = slow->next;
            fast = fast->next->next; 

            if (slow == fast) { 
                return true;
            }
        }
        return false;  
    }
};
```

### 執行結果

*Hash Table*
![](/img/LeetCode/141/result1.jpeg)

*Vector*
![](/img/LeetCode/141/result2.jpeg)

*Two-Pointer*
![](/img/LeetCode/141/result3.jpeg)

# 複雜度

## 時間複雜度

*Hash Table*
- $O(N)$: 檢查和插入雜湊表都僅耗費 $O(1)$，但還是需要遍歷每個節點一次，如果Link list中有 N 個節點，則複雜度就會是 $O(N)$

*vector*
- $O(N^2)$: 在遍歷 N 個節點的過程中，還會去 `nodelist` 檢查已儲存的 N-1 個元素，因此為 $O(N^2)$

*Two-pointer*
- $O(N)$: 在最壞的情況下，`slow` 和 `fast` 指針最多需要遍歷整個List，當linked list中有環時，`fast` 會在某個時刻與 `slow` 相遇；如果沒有環，則 fast 最終會到達鏈表末尾。因此，時間複雜度為 $O(N)$，$N$為節點數量

## 空間複雜度

*Hash Table*
- $O(N)$: 我們需要將所有 N 個節點的指針都存入 `unordered_map`，因此空間複雜度為 $O(N)$

*vector*
- $O(N)$: 將所有 N 個節點指針存儲在 `nodelist` 中

*Two-pointer*
- $O(1)$: 因為只使用了兩個額外的指針 (`slow` 和 `fast`) 來進行遍歷，不需要使用額外的資料結構來存儲鏈表的節點。因此，空間複雜度為 $O(1)$，即使用的空間量是常數。
