---
title: Min 堆疊 | Medium | LeetCode#155 Min Stack
toc: true
tags:
  - Linked List
  - Stack
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 511cdb2f
date: 2024-07-06 20:44:36
cover: /img/LeetCode/155/cover.jpg
---

# 題目敘述

![](/img/LeetCode/155/question.jpeg)
![](/img/LeetCode/155/question2.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目要求設計一個 Stack, 可以支援 push, pop, top 以及在常數時間內獲取最小值


# 解法


## 一開始的想法

## 我的解法

```cpp
class MinStack {
public:
    int val, size = 0;
    MinStack *next;
    MinStack *Top = NULL;

    MinStack() : val(0), next(0) {}
    MinStack(int x) : val(x), next(0) {}
    MinStack(int x, MinStack *nextNode) : val(x), next(nextNode) {}

    void push(int val);
    void pop();
    int top();
    int getMin();
    bool isEmpty();
};

void MinStack::push(int val) {
    if (isEmpty()) {
        Top = new MinStack(val);
        size++;
        return;
    }
    MinStack *newNode = new MinStack(val);
    newNode->next = Top;
    Top = newNode;
    size++;
}

void MinStack::pop() {
    if (isEmpty()) {
        return;
    }
    MinStack *tempNode = Top;
    Top = Top->next;
    delete tempNode;
    size--;
}

int MinStack::top() {
    if (!isEmpty()) {
        return Top->val;
    }
    return -1;
}

int MinStack::getMin() {
    if (isEmpty()) {
        return -1; 
    }
    MinStack *ptr = Top;
    int minValue = ptr->val;
    while (ptr != NULL) {
        if (ptr->val < minValue) {
            minValue = ptr->val;
        }
        ptr = ptr->next;
    }
    return minValue;
}

bool MinStack::isEmpty() {
    return Top == nullptr;
}


/**
 * Your MinStack object will be instantiated and called as such:
 * MinStack* obj = new MinStack();
 * obj->push(val);
 * obj->pop();
 * int param_3 = obj->top();
 * int param_4 = obj->getMin();
 */
```

### 說明

> 這裡我選擇用 Linked List 來實作 Stack

首先是宣告成員變數
    - `int val`: 節點值。
    - `int size`: Stack大小，初始化為 0。
    - `MinStack *next`: 指向下一個節點的指標
    - `MinStack *Top`: 指向Stack頂端的指標，初始化為 NULL。
接著定義 Constructor
```cpp
MinStack() : val(0), next(0) {}
MinStack(int x) : val(x), next(0) {}
MinStack(int x, MinStack *nextNode) : val(x), next(nextNode) {}
```
- 這裡有三個constructor，分別對應處理，甚麼參數都沒給，只給節點值，兩個都給的狀況，來初始化節點
- 之後定義成員函數
```cpp
void push(int val);
void pop();
int top();
int getMin();
bool isEmpty();
```

Push
```cpp
void MinStack::push(int val) {
    if (isEmpty()) {
        Top = new MinStack(val);
        size++;
        return;
    }
    MinStack *newNode = new MinStack(val);
    newNode->next = Top;
    Top = newNode;
    size++;
}
```
- 將值 `val` 推入Stack
- 如果Stack為空，則初始化並設置 `Top` 為新節點
- 如果不為空，則創建新節點並將其壓入Stack頂部，實踐了等同 `push_front` 的功能

pop
```cpp
void MinStack::pop() {
    if (isEmpty()) {
        return;
    }
    MinStack *tempNode = Top;
    Top = Top->next;
    delete tempNode;
    size--;
}
```
- 將頂端元素彈出Stack
- 更新 `Top` 指向下一個節點並釋放要被pop的節點。
 

top
```cpp
int MinStack::top() {
    if (!isEmpty()) {
        return Top->val;
    }
    return -1; 
}
```
- 返回頂端元素的值，若為空，返回 -1。

getMin
```cpp
int MinStack::getMin() {
    if (isEmpty()) {
        return -1;
    }
    MinStack *ptr = Top;
    int minValue = ptr->val;
    while (ptr != NULL) {
        if (ptr->val < minValue) {
            minValue = ptr->val;
        }
        ptr = ptr->next;
    }
    return minValue;
}
```
- Traverse stack，找到最小值，並返回最小值。

isEmpty
```cpp
bool MinStack::isEmpty() {
    return Top == nullptr;
}
```
- 這裡我額外寫一個函數判斷Stack是否為空

### 執行結果

![](/img/LeetCode/155/results.jpeg)

> 其實就是又長又冗，而且這樣 `getMin`複雜度會是 $O(N)$，因此這段程式並不能滿足要求
> 而且看了別人的作法才發現自己在耍白癡，這題明明也沒說不能用 `<stack>` ，還以為要重頭到尾重新刻出一個 Stack 出來 XD
> 即使沒用 `<stack>` 也還是有更加 optimized 的做法

## 更好的做法

```cpp
class MinStack {
private:
    vector<vector<int>> st;

public:
    MinStack() {
        
    }
    
    void push(int val) {
        int min_val = getMin();
        if (st.empty() || min_val > val) {
            min_val = val;
        }
        st.push_back({val, min_val});        
    }
    
    void pop() {
        st.pop_back();
    }
    
    int top() {
        return st.empty() ? -1 : st.back()[0];
    }
    
    int getMin() {
        return st.empty() ? -1 : st.back()[1]; 
    }
};
```

或者透過 `<stack>` 實作

> https://www.youtube.com/watch?v=GhvT9Ob8aps

### 執行結果

![](/img/LeetCode/155/results2.jpeg)

# 複雜度分析

## 時間複雜度

我原本的做法:
- push: $O(1)$
- pop: $O(1)$
- top: $O(1)$
- getMin: $O(n)$
- isEmpty: $O(1)$

改良做法:
- push: $O(1)$
- pop: $O(1)$
- top: $O(1)$
- getMin: $O(1)$
  
## 空間複雜度

O(N), N 為節點數量。

# 結語

> 下次要更加仔細理解題意...