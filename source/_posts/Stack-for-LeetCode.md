---
title: 刷題必會知識 | 堆疊 (Stack) | LeetCode 筆記
toc: true
tags:
  - Stack
  - LeetCode
categories: LeetCode筆記
aside: true
abbrlink: a27c9492
date: 2024-06-27 21:41:18
cover: /img/LeetCode/stack/cover.jpg
---

# 甚麼是 Stack?

Stack 是一種資料結構，具有**後進先出(Last-In-First-Out, LIFO)**的特性，

![](/img/LeetCode/stack/stack.png)

# Stack 實作 (C++)

這裡我想透過 C++ 去時做一個完整的 Stack 功能，並且實踐常見的 `push`, `pop`, `isEmpty` 等等操作

## 用 Array 實作 Stack

再透過C++ 實作Stack得時候，需要注意某些變數不能被外部存取，像是

- `top`: 用於指向stack 的頂端，也就是最上面的index
- `capacity`: stack的記憶體大小
- `*stack`:  指向stack的指標

因此與上面相關的變數需要作為 Private 的成員變數。另外再使用陣列實踐Stack的時候有時候會出現，記憶體不夠的狀況，因此可以透過建立一個自動擴展capacity的函數來解決。

另外，在實作Pop的時候，**並不需要將資料實際移除，而是將 `top` 扣掉1，好像是我們真的把資料從stack刪除一樣，但實際上並沒有，而是在未來Push的時候再將現有資料蓋過去即可，這樣的做法可以節省記憶體操作成本**

![](/img/LeetCode/stack/pop.png)

> 注意: 在進行Pop或者是 Top操作(回傳現在Stack最頂端資料值)前都需要先判斷 Stack是否為空，`st.empty()`

### 完整程式碼

```cpp
# include <iostream>
using namespace std;

class StackArray{
    private:
        int top; //Index of top element of Stack
        int capacity; // Allocated memory
        int *stack;
        void DoubleCapacity();
    public:
        // Define constructor with initial state: top=-1, capacity=1
        StackArray():top(-1),capacity(1) {
            //Init a int array with capacity=1
            stack = new int[capacity];
        }
        void Push(int x);
        void Pop();
        bool isEmpty();
        int  Top();
        int  getSize();  
};

void StackArray::DoubleCapacity() {
    // Double capacity
    capacity = capacity *2;
    // Reallocate memory
    int *new_stack = new int[capacity];

    //copy elements to new stack
    for(int i = 0; i < capacity/2;i++){
        new_stack[i] = stack[i];
    }

    // free memory, this is used to free memory that allocated by new[]
    delete[] stack;  
    // redrect new_stack to stack
    stack = new_stack;

}

void StackArray::Push(int x) {
    if (top == capacity-1){
        DoubleCapacity();
    }
    stack[++top] = x;
}

void StackArray::Pop() {
    if (isEmpty()) {
        cout << "Empty Stack, nothing to pop!" << endl;
        return;
    }
    //update top
    top--;
}

bool StackArray::isEmpty(){
    if(top == -1){
        return true;
    }
    else {
        return false;
    }
}

// Return top element of stack
int StackArray::Top(){
    if(isEmpty()) {
        cout << "Empty Stack, nothing on the top!" << endl;
        return -1;
    }
    return stack[top];
}

int StackArray::getSize(){
    return top+1;
}

int main(){
    StackArray sk;
    sk.Pop();
    sk.Push(14);
    sk.Push(9);
    cout << "\n top: " << sk.Top() << "\nsize: " << sk.getSize() << endl;
    sk.Push(7);
    cout << "\n top: " << sk.Top() << "\nsize: " << sk.getSize() << endl;
    sk.Pop();
    sk.Pop();
    cout << "\n top: " << sk.Top() << "\nsize: " << sk.getSize() << endl;
    sk.Pop();
    cout << "\n top: " << sk.Top() << "\nsize: " << sk.getSize() << endl;

    return 0;
}
```

執行結果:

```
Empty Stack, nothing to pop!
top: 9
size: 2

top: 7
size: 3

top: 14
size: 1
Empty Stack, nothing on the top!

top: -1
size: 0
```

### 程式碼說明

```cpp
class StackArray{
    private:
        int top; //Index of top element of Stack
        int capacity; // Allocated memory
        int *stack;
        void DoubleCapacity();
    public:
        // Define constructor with initial state: top=-1, capacity=1
        StackArray():top(-1),capacity(1) {
            //Init a int array with capacity=1
            stack = new int[capacity];
        }
        void Push(int x);
        void Pop();
        bool isEmpty();
        int  Top();
        int  getSize();  
};
```

我們透過建立一個 StackArray Class 來去定義Stack 本身以及相應的操作，其中在初始化方面，我們透過constructor `StackArray` (建構子會與class名稱一樣) 來去初始化 private成員變數 `top=-1`, `capacity=1`，並且宣告一個新的記憶體空間，是一個大小為 `capacity` 的整數陣列，並且透過指標 `stack*` 指向該陣列。

接著再 Public 區域就宣告了我們之後會對Stack 進行的各種操作。


```cpp
void StackArray::DoubleCapacity() {
    // Double capacity
    capacity = capacity *2;
    // Reallocate memory
    int *new_stack = new int[capacity];

    //copy elements to new stack
    for(int i = 0; i < capacity/2;i++){
        new_stack[i] = stack[i];
    }
    // free memory, this is used to free memory that allocated by new[]
    delete[] stack;  
    // redrect new_stack to stack
    stack = new_stack;
}
```
`DoubleCapacity` 這個函數主要會去將 `capacity` 乘上2，然後定義具有雙倍capacity的新stack，再將舊stack的資料都複製到新的，接著把舊stack的陣列記憶體空間釋放，並且更新指標。

```cpp
void StackArray::Push(int x) {
    if (top == capacity-1){
        DoubleCapacity();
    }
    stack[++top] = x;
}

void StackArray::Pop() {
    if (isEmpty()) {
        cout << "Empty Stack, nothing to pop!" << endl;
        return;
    }
    //update top
    top--;
}
```

Push的部分首先，**要先確定 Stack 滿了沒?**，確認方式就是檢查 `top` 的值是否跟 `capacity-1`一樣(因為是陣列，所以要扣1)，如果一樣，就代表滿了，需要更多空間，就直接呼叫剛才定義過的 `DoubleCapacity` 函數。接著就是push資料進Stack，這裡為了減少行數，將 `++top` 以及 `stack[top] =x` 合併乘同一行。

Pop的部分就需要先檢查Stack是否為空，因此需要先呼叫 `isEmpty()` 函數來確認是否是空，如果是空的就跳訊息並回到 main function，如果非空，那就直接將top值減少1

```cpp
bool StackArray::isEmpty(){
    if(top == -1){
        return true;
    }
    else {
        return false;
    }
}

// Return top element of stack
int StackArray::Top(){
    if(isEmpty()) {
        cout << "Empty Stack, nothing on the top!" << endl;
        return -1;
    }
    return stack[top];
}

int StackArray::getSize(){
    return top+1;
}
```

- `isEmpty()` 的部分，就去比較top是否為初始值，如果是那就是空的，如果不是就不空。
- `Top()` 的部分，一樣會需要先檢查stack 是否為空，如果空的就回到main func，如果非空就回傳stack最top的內容值
- `getSize()`: 就直接回傳top+1 (因為陣列index運算的關係，一開始宣成-1，所以要加回來)


## 用 Linked List 實作 Stack

![](/img/LeetCode/stack/linked_list.png)

如果用 Linked List來實作Stack，在Linkest List 中的 `first` 或 `head`，也就是鏈結的首端元素會是Stack的頂部，所以你要push到Stack，等同於是使用 Linked List中的 `push_front()` 函數。

下面的程式碼主要是透過兩個 class 來實作，分別是 `StackNode` 以及 `StackList`，`StackNode` 用來定義Linked List的節點，而 `StackList` 用來定應首端節點，也就是 `*top`。

> **用 Struct 和 Class 定義節點的差異在哪?**
> > 用 Struct 定義的成員變數一定是 public，誰都可以存取，但用class，可以將stack入口的 `top` 放入private，就可以限制對節點的存取，main()就無法變更每個節點的資料，這可能會是安全性上的考量


### 完整程式碼

```cpp
# include <iostream>
using namespace std;

class StackList;

// Define node structure
class StackNode{
    private:
        int data;
        StackNode *next;
    public:
        //Define constructor
        StackNode(): data(0),next(0){
            //next = 0;
        }
        //Define constructor with initial data
        StackNode(int x):data(x), next(0){}
        //Define constructor with initial data and next node address
        StackNode(int x, StackNode *nextNode):data(x), next(nextNode){};
        friend class StackList;
};

// Define first node, and stack-related functions
class StackList{
    private:
        StackNode *top;
        int size;
    public:
        StackList():top(0),size(0){};
        void Push(int x);
        void Pop();
        bool isEmpty();
        int Top();
        int getSize();
};

void StackList::Push(int x){
    if(isEmpty()){
        top = new StackNode(x);
        size++;
        return;
    }
    //push_front() in linked list
    StackNode *newNode = new StackNode(x);
    //Link the new node to the origin top node
    newNode->next = top;
    //update top pointer
    top = newNode;
    size++;
}

void StackList::Pop(){
    if(isEmpty()){
        cout << "Empty stack, nothing to pop out!" << endl;
        return;
    }
    StackNode *tempNode = top;
    top = top->next;
    delete tempNode;
    // set tempNode to a null pointer, to prevent dangling pointer
    // The constructor will set the *next to  0 (NULL)
    tempNode =0;
    size--;
}

bool StackList::isEmpty(){
    if( size == 0) return true;
    else return false;
}

int StackList::Top(){
    if(isEmpty()){
        cout << "Empty stack, nothing to return" << endl;
        return -1;
    } 
    return top->data;
}

int StackList::getSize(){
    return size;
}

int main(){
    StackList sk;
    sk.Pop();
    sk.Push(32);
    sk.Push(4);
    std::cout << "\ntop: " << sk.Top() << "\nsize: " << sk.getSize() << std::endl;        
    sk.Push(15);
    std::cout << "\ntop: " << sk.Top() << "\nsize: " << sk.getSize() << std::endl;         
    sk.Pop();
    sk.Pop();
    std::cout << "\ntop: " << sk.Top() << "\nsize: " << sk.getSize() << std::endl;          
    sk.Pop();
    std::cout << "\ntop: " << sk.Top() << "\nsize: " << sk.getSize() << std::endl;
    return 0;
}
```

執行結果
```
Empty stack, nothing to pop out!

top: 4
size: 2

top: 15
size: 3

top: 32
size: 1
Empty stack, nothing to return

top: -1
size: 0
```

### 程式碼說明

```cpp
class StackList;

class StackNode{
private:
    int data;
    StackNode *next;
public:
    StackNode():data(0){
        next = 0;
    }
    StackNode(int x):data(x){
        next = 0;
    }
    StackNode(int x, StackNode *nextNode):data(x),next(nextNode){};
    friend class StackList;
};

class StackList{
private:
    StackNode *top;     // remember the address of top element 
    int size;           // number of elements in Stack
public:                 
    StackList():size(0),top(0){};
    void Push(int x);
    void Pop();
    bool IsEmpty();
    int Top();
    int getSize();
};
```

StackNode 部分:
- 首先一開始就先宣告 `class StackList`，因為在 `class StackNode` 中會先將 `StackList` 作為 friend class
- 接著就是定義 `class StackNode`，這裡定義了三個 constructor，分別對應三種狀況:
    - 未給參數，則將node中的 data 和指標初始化為0，這代表有一個single node，其資料為0
    - 給定參數x，將node中的資料初始化為 x，而next為0，這代表single node資料為 x
    - 給定參數x和下一個節點位址 `next`，這代表在非空stack中新增了一個節點
- 之後就是將`StackList` 作為 `StackNode`　的 friend Class

StackList部分:
- 首先宣告 private 成員: `*top`, `size`，分別代表stack的頂端節點和stack的大小
- 之後就是 public 成員，首先一樣透過 constructor 去初始化 `size=0`, `top=0 (nullptr)`
- 定義 `Push(int x)`, `Pop()`, `IsEmpty()`, `Top()`, `getSize()` 等函式

```cpp
void StackList::Push(int x){
    if(isEmpty()){
        top = new StackNode(x);
        size++;
        return;
    }
    //push_front() in linked list
    StackNode *newNode = new StackNode(x);
    //Link the new node to the origin top node
    newNode->next = top;
    //update top pointer
    top = newNode;
    size++;
}
```

- Push 函式的部分，首先一樣要確認是否式空的stack，因為這會牽涉到我們要用的constructor 是哪個，如果為空，那就建立一個新節點，`new StackNode(x)`，也就是建立一個 `data=x`的新節點，並且將 `top` 指向該節點，此時stack size 需要加上1，接著就 return main function。若stack非空，則需要實踐push_front 的功能，所以一樣新增一個新節點，這裡有兩種寫法，上面這種是透過第二個constructor 定義節點，在手動將他指向原先的top節點，再更新top指標，這裡也可以改寫成 `stackNode *newNode = new StackNode(x, top)`，然後再更新 top指標即可


```cpp
void StackList::Pop(){
    if(isEmpty()){
        cout << "Empty stack, nothing to pop out!" << endl;
        return;
    }
    StackNode *tempNode = top;
    top = top->next;
    delete tempNode;
    // set tempNode to a null pointer, to prevent dangling pointer
    // The constructor will set the *next to  0 (NULL)
    tempNode =0;
    size--;
}
```

- Pop函式部分，一樣會需要先確認是否為空，如果stack是空的，那就return 回 main()
- 如果非空，那就跟常規 Linked List 刪除節點的步驟一樣，定義暫存節點，暫時保留top節點，接著將 top　更新為下一個節點，然後刪除暫存節點的資料
- 最重要的一步就是要將暫存節點設為 0，也就是 `nullptr` (因為 `next` 被設成0)以防止懸空指標發生，因為指標變數還存在。
- 記得 stack size 要-1

```cpp
bool StackList::isEmpty(){
    if( size == 0) return true;
    else return false;
}

int StackList::Top(){
    if(isEmpty()){
        cout << "Empty stack, nothing to return" << endl;
        return -1;
    } 
    return top->data;
}

int StackList::getSize(){
    return size;
}
```
- `isEmpty` 就是去檢查 `size` 大小
- `Top()` 一樣要先去檢查是否為空stack，如果不是就直接回傳頂端節點的資料值
- `getSize()` 回傳 `size`


# Stack 相關的 STL

需要引入 stack template library

```cpp
# include <stack>

stack<int> sk;
```
尖括號內的<int>代表這個stack裡面放的都是整數
如果想要在stack裡面放其他型態的資料的話
也可以宣告成這樣

```cpp
stack<float> sk;
stack<string> sk;
stack<char> sk;
```

使用 STL 就不需要自己實作  `push()` 和 `pop()` 了

```cpp

sk.push(123);           //      | -78 |
sk.push(666);           //      | 666 | 
sk.push(-78);           //      | 123 |   
                        //      |_____|
```

```cpp
int a = sk.pop(); // -78
```

```cpp
sk.top(); //666, since -78 is poped from stack
```

```cpp
sk.empty(); //return true or false
```

# Stack 相關操作的時間複雜度

根據 [5] 的整理，常規 stack 操作的平均時間複雜度分別如下:

- Access: $O(N)$
- Serach: $O(N)$
- Insertion: $O(1)$
- Deletion: $O(1)$

$N$ 為stack中的資料數量

# Stack 經典LeetCode 題目

Easy
- **[20. Valid Parentheses](https://leetcode.com/problems/valid-parentheses/description/)**
- **[1614. Maximum Nesting Depth of the Parentheses](https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/description/)**
- **[232. Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/description/)**

Medium
- **[71. Simplify Path](https://leetcode.com/problems/simplify-path/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[155. Min Stack](https://leetcode.com/problems/min-stack/description/)**
- **[150. Evaluate Reverse Polish Notation](https://leetcode.com/problems/evaluate-reverse-polish-notation/description/?envType=study-plan-v2&envId=top-interview-150)**


Hard
- **[224. Basic Calculator](https://leetcode.com/problems/basic-calculator/description/?envType=study-plan-v2&envId=top-interview-150)**


# 參考
[1] https://hackmd.io/@meyr543/SksrPAEIt
[2] https://hackmd.io/@Greenleaf/advanced_cpp#%F0%9F%8E%A0-stack-%E5%A0%86%E7%96%8A
[3] https://alrightchiu.github.io/SecondRound/stack-yi-arrayyu-linked-listshi-zuo.html
[4] https://hackmd.io/@CLKO/BkZaF56Cm?type=view
[5] https://www.bigocheatsheet.com/