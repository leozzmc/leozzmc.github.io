---
title: 使用Stack來實現Queue | Easy | LeetCode#232. Implement Queue using Stacks
tags:
  - Stack
  - Queue
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/232/cover.jpg
abbrlink: 8cb54984
date: 2024-07-25 13:07:24
---


# 題目敘述

![](/img/LeetCode/232/question1.jpeg)
![](/img/LeetCode/232/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 這題要求透過兩個 Stack 來實現一個Queue具有的基本操作，像是 `push`, `peek`, `pop` 以及 `empty`

題目也有提醒只可以使用標準 Stack 操作來實現 You must use only standard operations of a stack, which means only push to top, peek/pop from top, size, and is empty operations are valid.

# 解法

## 一開始的想法

這題跟 [225. Implement Stack using Queues](https://leozzmc.github.io/posts/6dfa2271.html) 其實是很類似的:

![](/img/LeetCode/232/algo.png)

Push 操作可以直接使用 `<stack>` 中的 `push()` STL 進行操作，重點會是實現 `pop()` 跟 `peak()`，由於Queue會是 FIFO，因此先進去Queue的會先出來，因此我們用Stack實作的時候等同於要優先將Stack的底部元素pop出來，這時候就需要第二個Stack進行暫存。

因此每當我們需要Pop時，都必須將最底部元素以外的資料全部push進第二個stack，結束操作後就可以再複製回第一個stack。

## 我的解法

```cpp
class MyQueue {
public:
    MyQueue() {}
    stack<int> sk1;
    stack<int> sk2;
    int size_Sk1=0;
    int size_Sk2=0;

    void push(int x) {
        sk1.push(x);
        size_Sk1++;
    }
        
    int pop() {
        if(sk1.empty()){
            return -1;
        }
        int result;
        for(int i = 0; i < size_Sk1; i++){
            // if it is the last element
            if(i==size_Sk1-1){
                result = sk1.top();
                sk1.pop();
            }
            else{
                sk2.push(sk1.top());
                sk1.pop();
                size_Sk2++;
            }
        }

        //copy sk2 to sk1
        for(int i = 0; i < size_Sk2; i++){
            sk1.push(sk2.top());
            sk2.pop();
        }
        size_Sk2=0;
        size_Sk1--;
        return result;
    }
        
    // queue.front(), This is equal to the bottom of the stack
    int peek() {
        if(sk1.empty()){
            return -1;
        }
        int result;
        for(int i = 0; i < size_Sk1; i++){
            // if it is the last element
            if(i==size_Sk1-1){
                result = sk1.top();
            }
            else{
                sk2.push(sk1.top());
                sk1.pop();
                size_Sk2++;
            }
        }
        //copy sk2 to sk1
        for(int i = 0; i < size_Sk2; i++){
            sk1.push(sk2.top());
            sk2.pop();
        }
        size_Sk2=0;
        return result;
    }
        
    bool empty() {
        if(sk1.empty()) return true;
        else return false;
    }
};

/**
 * Your MyQueue object will be instantiated and called as such:
 * MyQueue* obj = new MyQueue();
 * obj->push(x);
 * int param_2 = obj->pop();
 * int param_3 = obj->peek();
 * bool param_4 = obj->empty();
 */
```

### 說明

```cpp
stack<int> sk1;
stack<int> sk2;
int size_Sk1=0;
int size_Sk2=0;
```
首先初始化兩個 stack 以及stack大小

```cpp
void push(int x) {
    sk1.push(x);
    size_Sk1++;
}
```
主要的Queue操作都由Sk1實現，這裡就正常push

```cpp
int pop() {
    if(sk1.empty()){
        return -1;
    }
    int result;
    for(int i = 0; i < size_Sk1; i++){
        if(i==size_Sk1-1){
            result = sk1.top();
            sk1.pop();
        }
        else{
            sk2.push(sk1.top());
            sk1.pop();
            size_Sk2++;
        }
    }
    for(int i = 0; i < size_Sk2; i++){
        sk1.push(sk2.top());
        sk2.pop();
    }
    size_Sk2=0;
    size_Sk1--;
    return result;
}
```
- pop() 從Queue中移除並返回front
- 如果 `sk1` 為空，則返回 -1
- 使用 for 循環將 `sk1` 中的所有資料移動到 `sk2`，但保留最後一個資料，這個資料就是要返回的結果
- 然後將 `sk2` 中的所有資料移回 `sk1`
- 最後更新 `size_Sk1` 和 `size_Sk2` 的值，並返回結果

```cpp
int peek() {
    if(sk1.empty()){
        return -1;
    }
    int result;
    for(int i = 0; i < size_Sk1; i++){
        if(i==size_Sk1-1){
            result = sk1.top();
        }
        else{
            sk2.push(sk1.top());
            sk1.pop();
            size_Sk2++;
        }
    }
    for(int i = 0; i < size_Sk2; i++){
        sk1.push(sk2.top());
        sk2.pop();
    }
    size_Sk2=0;
    return result;
}
```

- peek() 返回隊列front元素，但不移除它
- 如果 `sk1` 為空，則返回 -1
- 操作類似於 pop() ，但最後不pop出最前面的資料(Stack底部資料)，而是僅保存其值並將 `sk2` 所有資料移回 `sk1`

```cpp
bool empty() {
    if(sk1.empty()) return true;
    else return false;
}
```
檢查Queue 是否為空，等同於檢查 `sk1` 是否為空


### 執行結果

![](/img/LeetCode/232/result.jpeg)

> 我覺得是 peak 跟 pop 花費太久時間


## 比較簡潔的寫法

```cpp
class MyQueue {
    stack<int> s1, s2;
public:
    MyQueue() {}
    
    void push(int x) {
        s1.push(x);
    }
    
    int pop() {
        while(!s1.empty()) s2.push(s1.top()), s1.pop();
        int ans = s2.top();
        s2.pop();
        while(!s2.empty()) s1.push(s2.top()), s2.pop();
        return ans;
    }   
    
    int peek() {
        while(!s1.empty()) s2.push(s1.top()), s1.pop();
        int ans = s2.top();
        while(!s2.empty()) s1.push(s2.top()), s2.pop();
        return ans;
    }
    
    bool empty() {
        return s1.empty();
    }
};
```

> 這中間的概念就是，push一樣正常push到s1，但pop的時候，只要將s1依序push到s2，這樣stack中的top就會是queue的front，直接回傳top資料就好，而這時再將s2元素丟回s1。
> 然後我那個 for 去迭代的寫法真的醜，用 `while(!s1.empty())` 比較水

# 複雜度

## 時間複雜度

- `push`, `empty`: $O(1)$
- `pop`, `peak`: $O(N)$

## 空間複雜度

四個 method 都是 $O(1)$，大多是重新排列現有元素