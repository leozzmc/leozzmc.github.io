---
title: 兩鏈相加 | Medium |LeetCode#2. Add Two Numbers
toc: true
tags:
  - Linked List
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/2/cover.jpeg
abbrlink: 3864fd1b
date: 2024-06-26 08:46:57
---


# 題目敘述

![](/img/LeetCode/2/question1.png)
![](/img/LeetCode/2/question2.png)

- 題目難度： `Medium`
- 題目敘述：這題要求給定兩個非空的linked list來代表兩個非整數數字，兩個數字以反向排序，每一個digit被存在個別的node上，題目要求將兩個數字相加後同樣以反向存成一個linked list並回傳
- 舉例：可以看範例1，342 和 465 分別以反向排序儲存，並且相加後的值為 807，最後再反向初存成list，輸出 [7,0,8]


# 解法


## 一開始的想法

> 最一開始的想法大概花費10分鐘定義好，但實際上較為複雜
> 我的想法是從個別List取得個別數字，相加後，再存成list


1. 宣告變數 a1, a2. sum
2. Traverse List1 長度
3. 檢查 list1 的值，逐項相加，存入變數a1
4. Traverse List2 長度
5. 檢查 list2 的值，逐項相加，存入變數a2
6. sum = a1 +a2;
7. 建立新list，反向存入sum 中的值
8. 回傳 new list head

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
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        int len1=0, len2=0;
        int val1=0, val2=0;
        int sum;
        vector<int> value1, value2;
        ListNode * current = l1;
        ListNode * previous;
        ListNode * head;

        //Traverse through list1, derive the length of l1
        while(current != NULL){
            len1++;
            current = current->next;
        }
        current = l1;
        //Derive the value of list1
        while (current != NULL){
            value1.push_back(current->val);
            current = current -> next;
        }

        current = l2;
        //Traverse through list2, derive the length of l2
        while(current != NULL){
            len2++;
            current = current ->next;
        }
        current = l2;
        //Derive the value of list2
        while(current != NULL){
            value2.push_back(current->val);
            current = current->next;
        }

        //value1
        int factor = value1.size() -1;
        for (int i=value1.size()-1; i>=0; i--){
            val1 += value1[i] * pow(10,factor);
            factor--;
        }

        //value2
        factor = value2.size() -1;
        for (int i=value2.size()-1; i>=0; i--){
            val2 += value2[i] * pow(10,factor);
            factor--;
        }
        
        //sum
        sum = val1 + val2;
        
        // head
        if(sum %10 != 0){ 
        ListNode* newHead = new ListNode(sum % 10);
        sum = sum /10;
        current = newHead;
        previous  = newHead;
        head = newHead;
        }
        else{
        // 0 tail
        ListNode* newHead = new ListNode(0);
        sum = sum /10;
        current = newHead;
        previous  = newHead;
        head = newHead;
        }

        // body
        while (sum  != 0){
            ListNode* newNode = new ListNode(sum % 10);
            current = newNode;
            previous -> next = newNode;
            previous = newNode;
            sum = sum /10;
        }

        if (head == nullptr) {
            head = new ListNode(sum);
        }
        return head;
            
    }
};
```

### 說明

想法與剛剛一樣，但在sum 存成list的時候要下很多心思，要開始透過取餘數和除以10的方式來獲取每一個digit，再建立新節點，放入值。**但最重要的問題是，這樣的作法容易發生Overflow**

![](/img/LeetCode/2/runtime_error.png)

如果把變數改成 `long long`  或者 `unsigned long long` 在提交答案時還是會Overflow

![](/img/LeetCode/2/runtime_error2.png)


因此這題的答案肯定不是要用我們轉成數字用加的


## 其他做法

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
    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
        int sum =0;
        int carry=0;
        ListNode *newHead = new ListNode(0);
        ListNode *current = newHead;


        while( l1 != nullptr || l2 != nullptr ){
            sum = carry;
            if (l1 != nullptr){
                sum += l1->val;
                l1 = l1 -> next;
            }
            if (l2 != nullptr){
                sum += l2->val;
                l2 = l2->next;
            } 
            carry = sum /10;
            current->next = new ListNode(sum % 10);
            current = current -> next;       
        }
        if(carry > 0){
                current->next = new ListNode(carry);
                current = current -> next;
        }
        return newHead->next;         
    }
};
```

後來的想法改變成：**直接在list中進行相加，而不轉成數字**

需要額外處理的會是進位

### 說明

- 首先宣告了一個新的head，但就是dummyHead
- 然後宣告 `current`指標，指向dummyHead
- 當 `l1` 或 `l2` 尚未走到最後節點時，會持續進行相加和計算進位

```cpp
if (l1 != nullptr){
    sum += l1->val;
    l1 = l1 -> next;
}
if (l2 != nullptr){
    sum += l2->val;
    l2 = l2->next;
} 
```
- 兩個 list 個別處理，將節點的值加進 `sum` 中，並將個別list 移到下一個節點
- 接著計算進位進位會是 `carry = sum /10`
- 接著就是在 dummyHead 後面新增一個新節點，節點值會是 `sum % 10` 也就是取sum的個位數數字
- 更新 `current` 指標
- 最後判斷如果到最後 `carry > 0` 新增一個進位用的節點，並更新指標，最後回傳dummyHead的下一個節點位址


### 完整本地測試程式碼

```cpp
# include <iostream>
# include <vector>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
 };

 struct ListNode *current;

void PrintList(ListNode *first){
    struct ListNode *ptr = first;
    if(first != NULL){
        while(ptr != NULL){
            cout << ptr->val << "->";
            ptr = ptr -> next;
        }
    }
    else{
        cout << "empty list" << endl;
    }
    cout << "NULL" << endl;
}

ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {
    int sum =0;
    int carry=0;
    ListNode *newHead = new ListNode(0);
    ListNode *current = newHead;


    while( l1 != nullptr || l2 != nullptr ){
        sum = carry;
        if (l1 != nullptr){
            sum += l1->val;
            l1 = l1 -> next;
        }
        if (l2 != nullptr){
            sum += l2->val;
            l2 = l2->next;
        } 
        carry = sum /10;
        current->next = new ListNode(sum % 10);
        current = current -> next;

        
    }
    if(carry > 0){
            current->next = new ListNode(carry);
            current = current -> next;
    }
    return newHead->next;

}

int main(){
    //Create list 1
    // ListNode node1_3(9);
    ListNode node1_2(9);
    ListNode node1_1(9, &node1_2);
    //Print List1
    cout << "list1:";
    PrintList(&node1_1);
    //Create list 2
    //ListNode node2_2(9);
    ListNode node2_1(9);
    //Print List2
    cout << "list2:";
    PrintList(&node2_1);

    //Output
    cout << "Reverse output:";
    PrintList(addTwoNumbers(&node1_1, &node2_1));


    return 0;
}

```


### 執行結果

![](/img/LeetCode/2/results.png)

# 複雜度分析

## 時間複雜度

這個函數主要由一個 while 迴圈組成，迴圈會運行直到 `l1` 和 `l2` 都為 `nullptr`，在每次迭代中，我們至多只訪問 `l1` 和 `l2` 的每個節點一次。因此，時間複雜度取決於 `l1` 和 `l2` 的長度，假設 `l1` 和 `l2` 的長度分別為 $N$, $M$，則時間複雜度為 $O(max(N,M))$

## 空間複雜度

除了輸入的list外，我們創建了一個新的list來存儲結果。新list的長度將等於較長的輸入鏈表的長度加上可能的一個額外節點（存儲最後的進位）。
因此，空間複雜度也是 $O(max(n,m))$