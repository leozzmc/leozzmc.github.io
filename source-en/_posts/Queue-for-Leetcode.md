---
title: Must-Know Problem-Solving Knowledge | Queue | LeetCode Notes
toc: true
tags:
  - Queue
  - LeetCode
  - C++
categories: LeetCode Notes
aside: true
abbrlink: "22a8b30b"
date: 2024-07-22 13:18:02
cover: /img/LeetCode/queue/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/22a8b30b.html)

# What is a Queue?

A Queue is also a data structure used to temporarily store elements. Unlike a Stack, it has the **FIFO (First-In-First-Out)** property, meaning the element that enters the queue first comes out first, and new elements are added to the tail of the queue.

Queues are usually used in systems that need ordering consistency, like network packet processing, OS process scheduling, BFS, and so on. Think of it like waiting in line to buy tickets.

## Queue operations:

- Front of the line: `front`
- Back of the line: `back`
- Enter the line: `push`, can only enter from the `back`
- Leave the line: `pop`, can only leave from the `front`

<!-- 可以插入手繪圖片 -->

- `Push(data)`: put data into the queue from the back and update it to the new back; adding data to the queue is also called `enqueue`
- `Pop`: remove the data pointed to by front from the queue and update front; removing data from the queue is also called `dequeue`
- `getFront`: return the data pointed to by front
- `getBack`: return the data pointed to by back
- `IsEmpty`: check whether the queue has any data
- `getSize`: return the number of data items in the queue

# Queue implementation (C++)

## Implementing a Queue with a Linked List

![](/img/LeetCode/queue/queue1.png)


- The queue's front is the first node of the linked list, and back is the last node of the list
- But since a queue needs getFront and getBack, besides a pointer tracking the front node we also need a pointer tracking the back node

### Code

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

Output

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

## Implementing a Queue with a List

### Code

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

Output

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

# Queue-related STL

C++ also has a ready-made STL for queue. Before using it you need to declare `<queue>`. Below are the common member functions:

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

Output

```
1
3
3
1 0x76fc70
1 0x7ffc0ddca00c
1 0x76fc70
1 2 3 
```

> For the STL of various data structures you can refer to **[this post](/en/posts/efa232a7.html)** I put together.

# Time complexity of Queue operations

Both insertion and deletion are $O(1)$, while searching and accessing are both $O(N)$.

# Queue-related LeetCode problems

Easy

- [225. Implement Stack using Queues](https://leetcode.com/problems/implement-stack-using-queues/description/)
- [232. Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/description/)

Medium

- [950. Reveal Cards In Increasing Order](https://leetcode.com/problems/reveal-cards-in-increasing-order/description/)
- [641. Design Circular Deque](https://leetcode.com/problems/design-circular-deque/description/)
- [622. Design Circular Queue](https://leetcode.com/problems/design-circular-queue/description/)

Hard

- [2444. Count Subarrays With Fixed Bounds](https://leetcode.com/problems/count-subarrays-with-fixed-bounds/description/)


# References

[1] https://ithelp.ithome.com.tw/articles/10326158
[2] https://alrightchiu.github.io/SecondRound/queue-introjian-jie-bing-yi-linked-listshi-zuo.html
[3] https://alrightchiu.github.io/SecondRound/queue-yi-arrayshi-zuo-queue.html
