---
title: 從排序鏈結串列刪除重複 | Easy | LeetCode#83. Remove Duplicates from Sorted List
toc: true
tags:
  - Linked List
  - LeetCode
  - Easy
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/83/cover.jpg
abbrlink: c8064a2b
date: 2024-06-24 16:59:26
---

# 題目敘述


![](/img/LeetCode/83/question1.png)
![](/img/LeetCode/83/question2.png)

- 題目難度: `Easy`
- 題目敘述: 給定一個排序鍊結串列的 `head`, 刪除所有重複節點，每個節點元素僅能出現一次，回傳排列串列

# 解法

> 這是第一次改用 C++ 寫 Linked List 題目，但由於題目是 single linked list，因此沒能夠用到透過 double linked list 實作的 **std:list** STL Library，有點小可惜，所以思路上還是用到了慣用的 C

時間紀錄:
- 想解決辦法: 1min
- 實際撰寫程式碼: 15 minutes
  
> 大概 Run 兩次，第一次沒有考慮到結尾 Null Pointer 的狀況

## 一開始的想法

![](/img/LeetCode/83/algo.png)

1. 定義好兩個指標，分別指到前一個節點跟當前節點
2. 遍歷整個list
3. 每次都檢查當前節點值與前一個節點值是否一樣，結束後更新指標值
4. 回傳head


## 我的解法

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
    ListNode* deleteDuplicates(ListNode* head) {

        ListNode * ansHead = head;
        ListNode * current = head;
        ListNode *previous  =NULL;

        while (current != NULL){
            if(current == head){ // head
                previous = current;
                current = current->next;
            }
            else{ // the following nodes
                while ( previous->val == current->val && current->next != NULL ){
                    ListNode* temp = current->next; 
                    current = current->next;
                    previous -> next = current;
                }
                if ( previous->val == current->val && current->next == NULL){
                    ListNode* temp = current->next; 
                    current = current->next;
                    previous -> next = current;
                }
                else{
                    current = current-> next;
                    previous = previous->next;
                } 
            }
        }
        return ansHead;
            
    }
};
```

### 說明

首先是初始化，`ansHead` 用來保存結果list的head，`current` 用來遍歷list，`previous` 用來記錄當前節點的前一個節點。接著當 `current!= NULL` 的時候，會去循環遍歷節點，這裡將頭節點以及其他節點分開處理，因為我希望如果有重複，刪除的都是第2個以後的節點，因此走到頭節點僅需要更新指標就好，走到其他節點時，就需要檢查前一個節點跟現在節點是否一樣 (`previous->val == current->val && current->next != NULL`) 如果一樣，要做的事情有三件:
1. 建立臨時指標，用來指向 `current` 的下一個節點
2. 將 `current` 指向其下一個節點
3. 更新 `previous->next` 為 `current`

![](/img/LeetCode/83/algo2.png)

如果有多個重複節點，就可以在 while 迴圈內一併刪除

如果走到最後一個節點，一樣建立臨時節點只到NULL，更新`current`成 NULL，並且更新 `previous` 指標。

最後回傳 `ansHead`



### 完整本地測試程式碼

```cpp
#include <iostream>
#include <list>
using namespace std;

typedef struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
} Node;

Node *first, *current;

void PrintList(Node *first);

Node * deleteDuplicates(ListNode* head);

int main (){
    // Define a 4-nodes linked list
    ListNode node4(3);
    ListNode node3(3, &node4);
    ListNode node2(2, &node3);
    ListNode node1(1, &node2);

    // Print the list
    PrintList(&node1);

    deleteDuplicates(&node1);
    PrintList(&node1);


    return 0;
}

void PrintList(Node *first){
    Node * current = first;
    if(current!= NULL){
        while ( current != NULL){
            cout << current->val << "->" ;
            current = current->next;
        }
    }   
    else{
        cout << "Emppty List" << endl;
    }
    cout << "NULL" << endl;
}

Node * deleteDuplicates(ListNode* head){
    Node * ansHead = head;
    Node * current = head;
    Node *previous  =NULL;

    while (current != NULL){
        if(current == head){ // head
            previous = current;
            current = current->next;
        }
        else{ // the following nodes
            while ( previous->val == current->val && current->next != NULL ){
                ListNode* temp = current->next;
                current = current->next;
                previous -> next = current;
            }
            if ( previous->val == current->val && current->next == NULL){
                ListNode* temp = current->next;
                current = current->next;
                previous -> next = current;
            }
            else{
                current = current-> next;
                previous = previous->next;
            } 
        }
    }
    return ansHead;
    
}
```

### 執行結果

![](/img/LeetCode/83/results1.jpeg)



## 其他作法

```cpp
class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        if (!head) return nullptr; // 如果鏈表為空，返回 nullptr

        ListNode* current = head;
        
        while (current && current->next) {
            if (current->val == current->next->val) {
                ListNode* temp = current->next; // 暫存重複節點
                current->next = current->next->next; // 跳過重複節點
                delete temp; // 釋放重複節點的記憶體
            } else {
                current = current->next; // 移動到下一節點
            }
        }
        
        return head;
    }
};

```
> 這裡的作法是如果有重複，直接將當前節點跳過重複節點，透過 `->next->next` 來存取下下個節點

### 執行結果

![](/img/LeetCode/83/results2.jpeg)


# 複雜度分析

## 時間複雜度

- 外層 while 迴圈: 這個迴圈遍歷整個list，每個節點訪問一次，因此總共執行 **n** 次，其中 n 是list的節點數。

- 內層 while 迴圈: 這個迴圈在遇到重複的節點時會執行，並且最多也只會執行 **n** 次（因為每次內層迴圈執行都會將 `current` 推進至少一個節點，從而保證內層迴圈的總執行次數不會超過節點數 **n**）。

- 其他操作: 內部的條件判斷和指針操作都是常數時間的操作

整個程式碼的時間複雜度為 $O(n)%，因為每個節點最多被訪問兩次（一次在外層迴圈，一次在內層迴圈）

## 空間複雜度

- 額外變數: 只使用了少量的額外變數 (`ansHead`，`current`，`previous` 和 `temp`)，這些變數的數量與list的大小無關，是常數個數。
- 並沒有使用額外的動態記憶體，創建了臨時`temp` 並不影響整體的空間複雜度。

因此，空間複雜度為 $O(1)$，即常數空間複雜度

# 結語

這次算是第一次用 c++ 寫 linked list題目，但沒用到 **std:list** 有點可惜，因為原本只是想要練習STL用法的 XD
但想法主要還是跟C一樣，就當多一題 C 的練習吧