---
title: 刪除從鏈結末端第N個節點 | Medium | LeetCode#19. Remove Nth Node From End of List
tags:
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: a0e0ab51
date: 2024-10-18 08:59:36
cover: /img/LeetCode/19/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/19/question.jpeg)

- 題目難度：`Medium`

- 題目敘述： 給定一個 Linked List 的 `head`，移除從尾端數來第 `n` 個節點，並返回list

# 解法


## 一開始的想法

最直覺的做法就是，先取得 list 長度，再用長度扣掉 `n` 得到的數字假設是 `m`，就要被刪除的就是從首端往後數的第 `m` 個節點。 刪除節點這部分也很基本，那就是透過一個 pointer 指向要被刪除節點指向的下一個節點位址，在讓待刪除節點的前一個節點指向這個 pointer，最後返回 `head`
 
## 我的解法

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) 
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* removeNthFromEnd(ListNode* head, int n){
        if(head == nullptr) return nullptr;
        if(head->next == nullptr) return nullptr;
        ListNode *ptr=head;
        ListNode *prev=ptr;
        ListNode *temp = nullptr;
        int count = 1;
        int len=1;
        
        while(ptr!=nullptr && ptr->next!=nullptr){
            ptr = ptr->next;
            len++;
        }
        cout << len << endl;
        ptr=head;
        int m = len-n+1;
        // delete head
        if(m==1){
            head = ptr->next;
            return head;
        }
        while(ptr!=nullptr && count<m){
            prev = ptr;
            ptr = ptr->next;
            count++;
        }
        temp = ptr->next;
        prev->next = temp;
        ptr=nullptr;
        delete ptr;
        return head;
    }
};
```


那實際寫code，還是有少考慮到一些 edge case，像是如果要刪除的節點本身就是 `head`，這樣就需要將最終回傳的 `head` 指定為當前 `head` 的下一個節點，另外就是若只是一個節點的List，那就直接回傳 `NULL` 即可。其他部分做法就跟剛剛提的一樣。首先讓 `ptr` 指標走完整個 list，並記錄長度。之後再將 ptr指回 `head`。另外這裡也透過一個變數 `m` 來看從 `head` 到底要走多少步。

```cpp
while(ptr!=nullptr && count<m){
    prev = ptr;
    ptr = ptr->next;
    count++;
}
```

這段代表讓指標移動到我們要刪除的位置，迴圈跑完後 `prev` 會移動到刪除節點的前一個節點位置，`ptr` 會待向帶刪除節點，這裡其實可以將 `prev->next` 直接指向 `ptr->next` 就不需要額外的 `temp` 接著將 `ptr` 指向 `nullptr` 並且刪除指標。最後回傳 `head` 


### 執行結果

![](/img/LeetCode/19/result.jpeg)

## 其他做法

其他做法處理 edge case 的方式我覺得很值得參考：

```cpp
ListNode *dummy = new ListNode(0);
dummy->next = head;

....

return dummy->next;
```

透過一個新的節點，可以保證都會指導鏈結頭部，最後只要回傳 dummy node 的 `next` 就好


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
    ListNode* removeNthFromEnd(ListNode* head, int n){
        ListNode *dummy = new ListNode(0);
        dummy->next = head;
        ListNode *ptr=dummy;
        ListNode *prev=dummy;

        for(int i=0; i<=n; ++i){
            ptr=ptr->next;
        }

        while(ptr!=nullptr){
            ptr=ptr->next;
            prev=prev->next;
        }

        ListNode* temp = prev->next;
        prev->next = prev->next->next;
        delete temp;

        
        return dummy->next;
    }

};
```


### 執行結果

![](/img/LeetCode/19/result2.jpeg)

# 複雜度

## 時間複雜度

*我原本的程式*
$O(L)$: 計算長度時需要遍歷 $L$ 個節點，找到待刪除節點最壞狀況也會遍歷 $N$ 個節點，因此會是 $O(N)+O(N) = O(N)$ 

*新的做法*
$O(L)$: 前半迴圈走了 $N+1$ 步，後半迴圈執行了 $L-N$ 次，因此執行時間複雜度為 $O(L)$, $L$ 為鏈結長度

## 空間複雜度

*我原本的程式*

$O(1)$: 宣告指標，常數級別儲存

*新的做法*

$O(1)$: 宣告指標跟空節點，常數級別儲存
