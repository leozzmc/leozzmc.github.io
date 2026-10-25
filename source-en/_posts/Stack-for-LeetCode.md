---
title: Must-Know Problem-Solving Knowledge | Stack | LeetCode Notes
toc: true
tags:
  - Stack
  - LeetCode
categories: LeetCode Notes
aside: true
abbrlink: "a27c9492"
date: 2024-06-27 21:41:18
cover: /img/LeetCode/stack/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/a27c9492.html)

# What is a Stack?

A Stack is a data structure with the **Last-In-First-Out (LIFO)** property.

![](/img/LeetCode/stack/stack.png)

# Stack implementation (C++)

Here I want to implement a complete Stack in C++, realizing the common operations like `push`, `pop`, `isEmpty`, and so on.

## Implementing a Stack with an Array

When implementing a Stack in C++, note that some variables shouldn't be accessible from outside, like

- `top`: used to point to the top of the stack, i.e. the topmost index
- `capacity`: the stack's memory size
- `*stack`: a pointer to the stack

So the variables related to the above need to be private member variables. Also, when implementing a Stack with an array, you sometimes run out of memory, so you can solve this by creating a function that automatically expands the capacity.

Also, when implementing Pop, **you don't actually need to remove the data; instead you subtract 1 from `top`, as if we really deleted the data from the stack, but we actually didn't, and we just overwrite the existing data on a future Push. This approach saves memory-operation cost.**

![](/img/LeetCode/stack/pop.png)

> Note: before a Pop or a Top operation (returning the current topmost data value of the stack), you need to first check whether the stack is empty, `st.empty()`

### Full code

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

Output:

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

### Code explanation

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

We define the Stack itself and the corresponding operations by creating a StackArray class. For initialization, we use the constructor `StackArray` (the constructor has the same name as the class) to initialize the private member variables `top=-1`, `capacity=1`, and declare a new memory space, an integer array of size `capacity`, with the pointer `stack*` pointing to it.

Then in the public section we declare the various operations we'll later perform on the Stack.


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
The `DoubleCapacity` function mainly multiplies `capacity` by 2, then defines a new stack with double the capacity, copies all the old stack's data over, then frees the old stack's array memory and updates the pointer.

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

For Push, first **make sure the Stack is full or not.** The way to check is whether `top`'s value equals `capacity-1` (subtract 1 because it's an array); if equal, it's full and needs more space, so just call the `DoubleCapacity` function we defined earlier. Then push data into the Stack. Here, to reduce line count, `++top` and `stack[top] =x` are merged into one line.

For Pop, you first need to check whether the Stack is empty, so call the `isEmpty()` function to confirm. If empty, print a message and return to the main function; if not empty, just decrement the top value by 1.

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

- For `isEmpty()`, compare whether top is the initial value; if so it's empty, if not it's not empty.
- For `Top()`, likewise first check whether the stack is empty; if empty return to main func, if not empty return the content value at the top of the stack
- `getSize()`: just return top+1 (because of array index arithmetic, it's declared as -1 at first, so you add it back)


## Implementing a Stack with a Linked List

![](/img/LeetCode/stack/linked_list.png)

If you implement a Stack with a Linked List, the `first` or `head` in the Linked List, i.e. the first element of the chain, is the top of the Stack, so pushing onto the Stack is equivalent to using the `push_front()` function in the Linked List.

The code below mainly implements it with two classes, `StackNode` and `StackList`. `StackNode` defines the Linked List's node, while `StackList` defines the head node, i.e. `*top`.

> **What's the difference between defining a node with a struct vs a class?**
> > Member variables defined with a struct are always public, accessible by anyone, but with a class you can put the stack's entry `top` in private, which restricts access to the node, so main() can't change each node's data. This could be a security consideration.


### Full code

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

Output
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

### Code explanation

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

StackNode part:
- First, declare `class StackList` at the beginning, because in `class StackNode` we'll make `StackList` a friend class
- Then define `class StackNode`. Here three constructors are defined, corresponding to three cases:
    - No argument given: initialize the node's data and pointer to 0, meaning a single node with data 0
    - Given argument x: initialize the node's data to x and next to 0, meaning a single node with data x
    - Given argument x and the next node's address `next`: meaning a node is added to a non-empty stack
- Then make `StackList` a friend class of `StackNode`

StackList part:
- First declare the private members `*top`, `size`, representing the stack's top node and the stack's size
- Then the public members. First, likewise use the constructor to initialize `size=0`, `top=0 (nullptr)`
- Define functions like `Push(int x)`, `Pop()`, `IsEmpty()`, `Top()`, `getSize()`

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

- For the Push function, first likewise confirm whether it's an empty stack, because this affects which constructor we use. If empty, create a new node `new StackNode(x)`, i.e. a new node with `data=x`, and point `top` at that node; at this point the stack size needs +1, then return to the main function. If the stack isn't empty, we need to realize push_front, so again add a new node. There are two ways to write this: the one above defines the node via the second constructor, manually points it at the original top node, then updates the top pointer. This can also be rewritten as `stackNode *newNode = new StackNode(x, top)`, then just update the top pointer.


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

- For the Pop function, likewise first confirm whether it's empty; if the stack is empty, return to main()
- If not empty, follow the same steps as deleting a node in a regular Linked List: define a temporary node, temporarily keep the top node, then update top to the next node, then delete the temporary node's data
- The most important step is to set the temporary node to 0, i.e. `nullptr` (because `next` is set to 0), to prevent a dangling pointer, since the pointer variable still exists.
- Remember stack size needs -1

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
- `isEmpty` just checks the `size` value
- `Top()` likewise first checks whether it's an empty stack; if not, just return the top node's data value
- `getSize()` returns `size`


# Stack-related STL

You need to include the stack template library

```cpp
# include <stack>

stack<int> sk;
```
The `<int>` inside the angle brackets means this stack holds integers.
If you want to hold other types of data in the stack,
you can also declare it like this

```cpp
stack<float> sk;
stack<string> sk;
stack<char> sk;
```

Using the STL you don't need to implement `push()` and `pop()` yourself

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

# Time complexity of Stack operations

According to the summary in [5], the average time complexities of regular stack operations are:

- Access: $O(N)$
- Search: $O(N)$
- Insertion: $O(1)$
- Deletion: $O(1)$

$N$ is the number of data items in the stack

# Classic Stack LeetCode problems

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


# Reference
[1] https://hackmd.io/@meyr543/SksrPAEIt
[2] https://hackmd.io/@Greenleaf/advanced_cpp#%F0%9F%8E%A0-stack-%E5%A0%86%E7%96%8A
[3] https://alrightchiu.github.io/SecondRound/stack-yi-arrayyu-linked-listshi-zuo.html
[4] https://hackmd.io/@CLKO/BkZaF56Cm?type=view
[5] https://www.bigocheatsheet.com/
