---
title: 使用Queue來實現Stack | Easy | LeetCode#225. Implement Stack using Queues
tags:
  - Stack
  - Queue
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 6dfa2271
date: 2024-07-24 13:07:30
cover: /img/LeetCode/225/cover.jpg
---

# 題目敘述

![](/img/LeetCode/225/question1.jpeg)
![](/img/LeetCode/225/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 本題要求僅能使用兩個Queue來實現具有LIFO特性的Stack功能，需要能夠支援正常的Stack操作像是(`push`, `pop`, `top`, `empty`功能)，題目額外提醒，我們只能使用常規queue操作，像是`push to back`, `peek/pop from the front`, `size`, `isEmpty`。

# 解法

## 一開始的想法

由於 **我覺得Stack 跟 Queue最大的不同就是 FIFO 以及 LIFO，因此只要有辦法調整pop出來的順序即可**，因此push可以正常push，但pop需要能夠回傳queue的尾端元素，top的話就直接用`<queue>` 的 `back()` 即可。

![](/img/LeetCode/225/algo.png)

題目有說可以用兩個Queue，因此一個正常push進去的queue，如果要對它進行 pop，我們就需要依序將queue內資料Pop出來直到找到最後一個資料，但這些被pop出來的資料從Stack角度來看應該還要存在於Stack中，所以我們需要另一個queue將原先pop出來的元素存放起來。一旦原先的queue清空後，這時候可能使用者又會再進行push，由於我們push,pop操作都是在第一個queue進行，目前有資料的queue只是用來暫存資料用，因此需要把第二個queue的資料全部移動回第一個queue。

接著 top 以及empty用queue原本的STL即可實現。


## 我的解法

```cpp
class MyStack {
public:
    queue<int> q1;
    queue<int>q2;
    MyStack() {
        
    }
    
    void push(int x) {
        q1.push(x);
    }
    
    int pop() {
        int size = q1.size();
        int result;
        if(q1.empty()){
            //cout << "empty queue" << endl;
            return -1;
        }
        for (int i = 0; i < size; i++) {
            //the last element in the queue
            if(i==size-1) {
                result = q1.front();
                q1.pop();
                //copy q2 to q1
                size = q2.size();
                for(int j = 0; j < size; j++) {
                    q1.push(q2.front());
                    q2.pop();
                }
                size =0;
            }
            else{
                q2.push(q1.front());
                q1.pop();
            }
        }
        return result;
    }
    
  
    
    int top() {
        if(!q1.empty()) return q1.back();
        else{
            //cout << "empty queue" << endl;
            return -1;
        }
    }
    
    bool empty() {
        if(q1.size()==0) return true;
        else return false;
    }
};

/**
 * Your MyStack object will be instantiated and called as such:
 * MyStack* obj = new MyStack();
 * obj->push(x);
 * int param_2 = obj->pop();
 * int param_3 = obj->top();
 * bool param_4 = obj->empty();
 */
```

### 說明

一開始宣告兩個 `int` 型別的Queue, q1 和 q2

```cpp
queue<int> q1;
queue<int> q2;
```
`push` 函數將元素 x 推入Stack中，實際操作其實是將資料加入到 `q1` 的尾部

```cpp
void push(int x) {
    q1.push(x);
}
```


`pop` 函數，首先檢查 `q1` 是否為空，如果回空直接返回。接著就是迭代 `q1` queue，將除了最後一個資料的其他資料從 `q1` 移動到 `q2`，一旦發現最後一個資料，將它保存在　`result` 變數中，並將最後元素從 `q1` pop 出來，接著將 `q2` queue中資料全部移動回 `q1`，方便下一次的 push操作。最後就是回傳 `result`。

```cpp
int pop() {
    int size = q1.size();
    int result;
    if(q1.empty()){
        return -1;
    }
    for (int i = 0; i < size; i++) {
        if(i==size-1) {
            result = q1.front();
            q1.pop();
            size = q2.size();
            for(int j = 0; j < size; j++) {
                q1.push(q2.front());
                q2.pop();
            }
            size =0;
        }
        else{
            q2.push(q1.front());
            q1.pop();
        }
    }
    return result;
}
```

`top` 函數用來檢查stack的最頂端資料值，但以queue的角度看會是最後進入queue的末端元素，因此直接使用 `back()` 回傳資料值，當然一樣要先檢查 `q1` 是否為空。

```cpp
int top() {
    if(!q1.empty()) return q1.back();
    else{
        return -1;
    }
}
```

`empty()` 函數就是確認stack是否為空，而這裡也就是要確認queue是否為空。
```cpp
bool empty() {
    if(q1.size()==0) return true;
    else return false;
}
```

### 執行結果

![](/img/LeetCode/225/result.jpeg)

### 完整程式碼

```cpp
#include <iostream>
#include <queue>
using namespace std;

class MyStack {
public:
    queue<int> q1;
    queue<int>q2;
    MyStack() {
        
    }
    
    void push(int x) {
        q1.push(x);
    }
    
    int pop() {
        int size = q1.size();
        int result;
        if(q1.empty()){
            cout << "empty queue" << endl;
            return -1;
        }
        for (int i = 0; i < size; i++) {
            //the last element in the queue
            if(i==size-1) {
                result = q1.front();
                q1.pop();
                //copy q2 to q1
                size = q2.size();
                for(int j = 0; j < size; j++) {
                    q1.push(q2.front());
                    q2.pop();
                }
                size =0;
            }
            else{
                q2.push(q1.front());
                q1.pop();
            }
        }
        return result;
    }
    
  
    
    int top() {
        if(!q1.empty()) return q1.back();
        else{
            cout << "empty queue" << endl;
            return -1;
        }
    }
    
    bool empty() {
        if(q1.size()==0) return true;
        else return false;
    }
};

int main(){

    MyStack sk;
    sk.push(1);
    cout << "Stack push: 1" << endl;
    sk.push(2);
    cout << "Stack push: 2" << endl;
    sk.push(3);
    cout << "Stack push: 3" << endl;
    cout << "Pop the top element, which is: " <<  sk.pop() << endl;
    // sk.push(4);
    // cout << "Stack push: 4" << endl;
    // cout << "Pop the top element, which is:" <<  sk.pop() << endl;
    cout << "Pop the top element, which is:" <<  sk.pop() << endl;
    cout << "Pop the top element, which is:" <<  sk.pop() << endl;
    cout << "Is the stack empty? " << sk.empty() << endl;
    cout << "Check the top element:" << sk.top() << endl;
    return 0 ;
}
```

# 複雜度

## 時間複雜度

- `push(int x)` 的時間複雜度為 $O(1)$
- `pop()` 的時間複雜度為 $O(n)$，第一次 for 循環將 `q1` 中的元素轉移到 `q2`，除了最後一個元素。這需要 $O(n)$ 的時間，其中 `n` 是 `q1` 的大小。第二次 for 將 `q2` 中的元素轉移回 `q1`，這也需要 $O(n)$ 的時間
- `top()` 的時間複雜度為 $O(1)$
- `empty()` 的時間複雜度為 $O(1)$

整體的空間複雜度為 $O(n)$

## 空間複雜度

使用兩個 queue來儲存資料，每個queue可能包含n個元素，因此整體會是 $O(n)$
