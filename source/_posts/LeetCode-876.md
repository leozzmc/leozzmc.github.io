---
title: 找到鏈結串列的中間節點 | Easy |LeetCode#876 Middle of the Linked List
tags:
  - Linked List
  - LeetCode
  - Easy
  - C
categories: LeetCode筆記
aside: true
abbrlink: the_middle_of_the_list
date: 2024-06-16 14:49:36
cover: /img/LeetCode/876/cover.jpg
---

# 題目敘述

![](/img/LeetCode/876/question1.png)
![](/img/LeetCode/876/question2.png)
- 題目難度: `Easy`
- 題目敘述: 給定一個 single linked list 的 `head` 並且希望回傳 list 的中間節點，若中間節點有兩個，需要回傳第二個

# 解法

## 一開始的想法

![](/img/LeetCode/876/algo.png)

1. 定義節點結構
2. 建立 linked list
3. 呼叫函數 `middleNode()`

在 `middleNode` 內:
1. Traverse list，才有辦法知道中間節點，在 traverse過程透過一個counter來紀錄數量
2. 判斷當前節點數量是奇數還是偶數，取得中間節點的 index 
3. 接著重新走訪到 middleNode，並回傳節點


## 我的解法

```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* middleNode(struct ListNode* head) {
    struct ListNode *current = head;
    struct ListNode *middle= NULL;
    int counter=0;
    int middleNodeIndex;
    bool isEven;


    // (1) Get the length of list (2) Get the index of the middle
    while (current != NULL){
        counter++;
        if(counter%2 == 0){
            isEven = true;
            middleNodeIndex = counter/2;
        }
        else{
            isEven = false;
            middleNodeIndex = (int)(floor(counter/2));
        }
        current = current->next;
        
    }
    
    // Traverse to the middle node, and return middle node
    current = head;
    for (int i=0; i<counter; i++){
        if ( i == middleNodeIndex){
            middle = current;
            break;
        }
        current = current->next;
    }
    return middle;
    
```

### 說明

- 初始化變數:
  -  `current` 用於遍歷鏈結串列，`middle` 用於儲存中間節點，`counter` 用於計算節點總數，`middleNodeIndex` 用於儲存中間節點的索引，`isEven` 用於判斷節點數是否為偶數
- 計算list 長度跟中間索引:
  - 每走到一個節點就判斷基數偶數，並計算中間節點
-  之後重新初始化 `current` 指標並traverse 到 `middleNodeIndex`的節點
-  返回中間節點


### 完整測試程式碼

```c
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <math.h>

typedef struct node {
    int val;
    struct node* next;
} Node;

Node *first, *current, *previous;
void PrintList(Node *first);
void FreeList(Node *first);
Node * middleNode(Node *first);

int main(){

    // Create a 3-nodes linked list
    int i;

    for( i=0; i<4; i++) {
        Node *current = (Node*)malloc(sizeof(Node));
        if (i==0){
            current->val = 7;
            first = current;
            previous = current;
        }
        else if (i==1){
            current->val = 2;
            previous->next = current;
            current->next =NULL;
            previous = current;
        }
        else if (i==2){
            current->val = 3;
            previous->next = current;
            current->next =NULL;
            previous = current;
        }
        else{
            current->val = 9;
            previous->next = current;
            current->next =NULL;
            previous = current;
        }
    }

    PrintList(first);
    Node *mid = middleNode(first);
    if (mid != NULL) {
        printf("Middle Node: %d \n", mid->val);
    } else {
        printf("No middle node found.\n");
    }
    FreeList(first);

    return 0;
}

void PrintList(Node* first){
    Node * ptr = first;
    if (ptr == NULL){
        printf("empty list\n");
    }
    else {
        while ( ptr != NULL){
            printf("%d ->", ptr->val);
            ptr = ptr -> next;

        }
    }
    printf("NULL\n");
}

void FreeList(Node* first){
    Node *tmp, *current;
    current = first;
    while(current != NULL){
        tmp = current;
        current = current->next;
        free(tmp);
    }

}

Node * middleNode(Node *first){
    Node *current = first;
    Node *middle= NULL;
    int counter=0;
    int middleNodeIndex;
    bool isEven;


    // (1) Get the length of list (2) Get the index of the middle
    while (current != NULL){
        counter++;
        if(counter%2 == 0){
            isEven = true;
            middleNodeIndex = counter/2;
        }
        else{
            isEven = false;
            middleNodeIndex = (int)(floor(counter/2));
        }
        current = current->next;
        
    }
    

    current = first;
    for (int i=0; i<counter; i++){
        if ( i == middleNodeIndex){
            middle = current;
            break;
        }
        current = current->next;
    }
    return middle;
}
```

### 執行結果

![](/img/LeetCode/876/results1.png)


> 大概執行時間是 3ms，並不太算是效能良好的寫法
> 空間也用的挺多，5.66MB

## 修正程式碼

```c
// (1) Get the length of list (2) Get the index of the middle
    while (current != NULL){
        counter++;
        if(counter%2 == 0){
            isEven = true;
            middleNodeIndex = counter/2;
        }
        else{
            isEven = false;
            middleNodeIndex = (int)(floor(counter/2));
        }
        current = current->next;
        
    }
```
上面這段程式碼有些冗，因為題目要求多個中間節點時，取第二個節點就好，因此奇偶數不用分開處理，可以改成下面

```c
// (1) Get the length of list (2) Get the index of the middle
    while (current != NULL){
        counter++;
        middleNodeIndex = (int)(floor(counter/2));
        current = current->next;
        
    }

```

執行結果也會大幅提升

![](/img/LeetCode/876/results3.png)

## 其他做法

在解答區看到一個寫得很讚的作法，他的想法是:

1. 想像你跟你朋友正要爬樓梯
2. 你們都站在樓梯底部
3. 你每次爬一階，而你朋友每次爬兩階 (你的平均上樓速度會是你朋友的一半)
4. 當他爬到頂端，你就停下 (恰好會待在樓梯的一半位置)

### 步驟

![](/img/LeetCode/876/algo2.png)

1. **Initialization:** Start with two pointers, fast and slow, both pointing to the head of the list.
2. **Traversal:** Move the fast pointer two steps at a time and the slow pointer one step at a time. This ensures that when the fast pointer reaches the end of the list, the slow pointer will be at the middle node.
3. **Find the Middle Node:** After traversal, the slow pointer will be at the middle node of the list.
4. **Edge Case Handling:** Check if the list is empty or contains only one node. In such cases, the middle node is the head itself.
5. **Return:** Return the node pointed to by the slow pointer as the middle node.


```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */
struct ListNode* middleNode(struct ListNode* head) {
    struct ListNode *fast_ptr, *slw_ptr;
    fast_ptr = head;
    slw_ptr = head;

    while (fast_ptr != NULL && fast_ptr->next != NULL){
        fast_ptr = fast_ptr->next->next;
        slw_ptr = slw_ptr->next;
    }
    return  slw_ptr;
}
```

### 執行結果

![](/img/LeetCode/876/results2.png)

## 複雜度分析


### 時間複雜度
- 在走訪整個 list 的時候間複雜度是 $O(N)$，N 為節點數量
- 接著在找尋中間節點時間複雜度同樣是 $O(N)$
- 整體而言，`middleNode` 函式的時間複雜度式 $O(N)+ O(N) = O(N)$

### 空間複雜度

空間消耗
```
struct ListNode *current = head;
struct ListNode *middle = NULL;
int counter = 0;
int middleNodeIndex;
bool isEven;
```
- 為常數空間，因此這裡空間複雜度會是 $O(1)$
- 並且沒有使用額外的資料結構，所以整體而言空間複雜度也是 $O(1)$