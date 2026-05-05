---
title: 刷題必會知識 | 佇列 (Queue) | LeetCode 筆記
toc: true
tags:
  - Queue
  - LeetCode
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 22a8b30b
date: 2024-07-22 13:18:02
cover: /img/LeetCode/queue/cover.jpg
---

# 甚麼是 Queue?

Queue 也是一種資料結構，用於暫時儲存元素 ，它與 Stack 不同的是，它是屬於 **FIFO (First-In-First-Out)** 的特性，也就是先進入 Queue 的元素先出來，並且新元素會被加入到 Queue 的尾端。

通常 Queue 會被應用在需要具有順序一致性的系統中，像是網路封包處理、OS的 Process Schedule, BFS等等，反正就是想像是在排隊買票的感覺。

## Queue 操作:

- 隊伍前方: `front`
- 隊伍後方: `back`
- 進入隊伍: `push`, 一定只能從 `back` 進入
- 離開隊伍: `pop`, 一定只能從 `front` 離開

<!-- 可以插入手繪圖片 -->

- `Push(data)`: 將 data 從 back 放入Queue， 並更新成新的back，在Queue 中新增資料又稱 `enqueue`
- `Pop`: 把 front 指向的資料從Queue 中移除，並且更新front，從Queue中移除資料的行為又稱 `dequeue`
- `getFront`: 回傳 front 所指向的資料
- `getBack`: 回傳 back 所指向的資料
- `IsEmpty`: 檢查 Queue 中是否有資料
- `getSize`: 回傳 Queue 中的資料個數

# Queue 實作 (C++)

## 以 Linked List 實踐 Queue

![](/img/LeetCode/queue/queue1.png)


- Queue中的 front 即為 linked list 中的 first node，而back則為list中的最後一個節點
- 但由於一個 Queue 會需要，getfront 跟 getBack，因此除了會需要有個 pointer紀錄front節點，還需要一個pointer 紀錄back節點

### 程式碼

```cpp
#include <iostream>
using namespace std;

struct QueueNode {
    int data;
    QueueNode *next;
    QueueNode(): data(0), next(0){};
    QueueNode(int x):data(x), next(0){};
    
};

class QueueList{
    private:
        QueueNode *front;
        QueueNode *back;
        int size;
    public:
        QueueList(): front(0), back(0), size(0){};
        void Push(int x);
        void Pop();
        int getFront();
        int getBack();
        int getSize();
        bool IsEmpty();
};


void QueueList::Push(int x){
    if(IsEmpty()){
        front = new QueueNode(x);
        back = front;
        size++;
        return;  
    }
    QueueNode *newNode = new QueueNode(x);
    back->next = newNode;
    back = newNode;
    size++;
}

void QueueList::Pop(){
    if (IsEmpty()){
        cout << "empty queue" << endl;
        return;
    }
    else{
        QueueNode *tempNode = front;
        front = front->next;
        delete tempNode;
        tempNode = 0;
        size--;
    }
}

int QueueList::getFront(){
    if(IsEmpty()){
        cout << "empty queue" << endl;
        return -1;
    }
    else{
        return front->data;
    }
}

int QueueList::getBack(){
    if(IsEmpty()){
        cout << "empty queue" << endl;
        return -1;
    }
    else{
        return back->data;
    }
}

int QueueList::getSize(){
    return size;
}

bool QueueList::IsEmpty(){
    if(size == 0) return true;
    else return false;
}

int main(){

    QueueList q;
    if(q.IsEmpty()){
        cout << "empty queue" << endl;
    }

    q.Push(24);
    cout<< "After push 24: \n";
    cout << "front: " << q.getFront() << "    back: " << q.getBack() << "\n";
    q.Push(8);
    cout<< "After push 8: \n";
    cout << "front: " << q.getFront() << "    back: " << q.getBack() << "\n";
    q.Push(23);
    cout<< "After push 23: \n";
    cout << "front: " << q.getFront() << "    back: " << q.getBack() << "\n";
    q.Push(13);
    cout<< "After push 13: \n";
    cout << "front: " << q.getFront() << "    back: " << q.getBack() << "\n";
    q.Pop();
    cout<< "After pop the front element: \n";
    cout << "front: " << q.getFront() << "     back: " << q.getBack() << "\n";
    q.Push(35);
    cout<< "After push 35: \n";
    cout << "front: " << q.getFront() << "     back: " << q.getBack() << "\n";
    q.Pop();
    cout<< "After pop the front element: \n";
    cout << "front: " << q.getFront() << "    back: " << q.getBack() << "\n";
    q.Pop();
    cout<< "After pop the front element: \n";
    cout << "front: " << q.getFront() << "    back: " << q.getBack() << "\n";
    q.Pop();
    std::cout<< "After pop the front element: \n";
    std::cout << "front: " << q.getFront() << "    back: " << q.getBack() << "\n";
    q.Pop();
    cout<< "After pop the front element: \n"; 
    q.Pop();

    return 0;
}

```

輸出結果

```
empty queue
 After push 24:  //1
front: 24    back: 24 
After push 8:   //2
front: 24    back: 8
After push 23:  //3
front: 24    back: 23
After push 13:  //4
front: 24    back: 13
After pop the front element:  //5
After push 35: front: 8 back: 35 //6
After pop the front element: front: 23 back: 35  //7
After pop the front element: front: 13 back: 35 //8
After pop the front element: front: 35 back: 35 //9
After pop the front element: Queue is empty. //10
```

![](/img/LeetCode/queue/queue2.png)

## 以 List 實踐 Queue

### 程式碼

```c++
#include <iostream>
#include <vector>

using namespace std;

class QueueList{
    private:
        int front, back;
        vector<int> queue;
    public:
        QueueList():front(NULL), back(NULL), queue(NULL){}
        void Push(int x);
        void Pop();
        int getFront();
        int getBack();
        int getSize();
        bool IsEmpty();
};

void QueueList::Push(int x) {
    queue.push_back(x);
    return;
}

void QueueList::Pop(){
    if(queue.empty()){
        cout << "empty queue" << endl;
        return;
    }
    else{
        queue.erase(queue.begin());
        return;
    }
}

int QueueList::getFront(){
    if(queue.empty()){
        cout << "empty queue" << endl;
        return -1;
    }
    else{
        vector<int>::iterator it=queue.begin();
        return *it;
    }
}

int QueueList::getBack(){
    if(queue.empty()){
        cout << "empty queue" << endl;
        return -1;
    }
    else{
        vector<int>::iterator it=queue.end()-1;
        return *it;
    }

}

int QueueList::getSize(){
    return queue.size();
}

bool QueueList::IsEmpty(){
    if(queue.empty()){
        return true;
    }
    else{ return false; }
}


int main(){

    QueueList q;
    q.Push(25);
    cout << "After Pushing 25: " << "front:" << q.getFront() << " back:" <<  q.getBack() << endl;
    q.Push(50);
    cout << "After Pushing 50: " << "front:" << q.getFront() << " back:" <<  q.getBack() << endl;
    q.Push(77);
    cout << "After Pushing 77: " << "front:" << q.getFront() << " back:" <<  q.getBack() << endl;
    q.Pop();
    cout << "After Poping the front element: " << "front:" << q.getFront() << " back:" <<  q.getBack() << endl;
    q.Pop();
    cout << "After Poping the front element: " << "front:" << q.getFront() << " back:" <<  q.getBack() << endl;
    q.Pop();
    cout << "After Poping the front element: " << "front:" << q.getFront() << " back:" <<  q.getBack() << endl;
    q.Pop();
    cout << "After Poping the front element: " << "front:" << q.getFront() << " back:" <<  q.getBack() << endl;

    return 0;  
}
```

輸出結果

```
After Pushing 25: front:25 back:25
After Pushing 50: front:25 back:50
After Pushing 77: front:25 back:77
After Poping the front element: front:50 back:77
After Poping the front element: front:77 back:77
empty queue
empty queue
After Poping the front element: front:-1 back:-1
```

# Queue 相關 STL

C++ 中對於 queue也有現成的STL可以使用，使用前會需要先宣告 `<queue>`，以下是常見的成員函式:

```cpp
# include <iostream>
# include <queue>

using namespace std;


int main(){
    queue<int> q;
    q.push(1);
    q.push(2);
    q.push(3);

    cout << q.front() << endl;
    cout << q.back() << endl;
    cout << q.size() << endl;

    // copy the queue
    int a = q.front();
    int &b = q.front();

    cout << q.front() << " " << &q.front() << endl; // print the memory 
    cout << a << " " << &a << endl;
    cout << b << " " << &b << endl; // same as memory addr of q.front()

    // print the  queue contents
    int size = q.size();
    for (int i = 0; i < size; i++) {
        cout << q.front() << " ";
        q.pop();
    }
    cout << "\n";

    return 0;
}

```

輸出結果

```
1
3
3
1 0x76fc70
1 0x7ffc0ddca00c
1 0x76fc70
1 2 3 
```

> 各類資料結構的STL可以參考我整理的 **[這篇](https://leozzmc.github.io/posts/efa232a7.html)**

# Queue 操作的時間複雜度

插入和刪除的時間複雜度都是 $O(1)$，而搜尋和存取的時間複雜度都是 $O(N)$

# Queue 相關 LeetCode 題目

Easy

- [225. Implement Stack using Queues](https://leetcode.com/problems/implement-stack-using-queues/description/)
- [232. Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/description/)

Medium

- [950. Reveal Cards In Increasing Order](https://leetcode.com/problems/reveal-cards-in-increasing-order/description/)
- [641. Design Circular Deque](https://leetcode.com/problems/design-circular-deque/description/)
- [622. Design Circular Queue](https://leetcode.com/problems/design-circular-queue/description/)

Hard

- [2444. Count Subarrays With Fixed Bounds](https://leetcode.com/problems/count-subarrays-with-fixed-bounds/description/)


# 參考

[1] https://ithelp.ithome.com.tw/articles/10326158
[2] https://alrightchiu.github.io/SecondRound/queue-introjian-jie-bing-yi-linked-listshi-zuo.html
[3] https://alrightchiu.github.io/SecondRound/queue-yi-arrayshi-zuo-queue.html
