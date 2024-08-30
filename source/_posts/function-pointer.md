---
title: 【C/C++】傳遞函式- Function Pointer
tags:
  - Pointer
  - C++
categories: 學習筆記
aside: true
abbrlink: bf93d608
date: 2024-08-30 09:52:21
cover:
---

# 函式指標 (Function Pointer)

> 當你透過 C/C++ 中宣告一個函式時，就會分配一段起始記憶體位址，而 Function Pointer 就可以用來指向以及儲存函式位址。 所以我們可以直接透過 Function Pointer **1.來呼叫一個函式**  **2.或者將它傳遞給其他函式**

![](/img/c++/func.png)

# 用法

宣告：

```
[回傳值的data type] (* function pointer name)(input parameter1, input parameter2, ...);
```

**記得需要將函數的位址 assign 給 function pointer**，可以透過取位址運算子 `&` 來進行，這裡看下方範例：


```cpp
#include <iostream>
using namespace std;

int add(int a, int b){
    return a+b;
}

int main() {
	int (*func_ptr)(int,int);
	int result;
	func_ptr = &add;
	result = func_ptr(1,2);
	cout << result;
}
```

這段程式碼執行的輸出結果會是： `3`。這裡如果的拿先前建構 Binary Tree 的 Class 去整合使用看看，程式碼會像是下面這樣

```cpp
#include <iostream>
using namespace std;

class BT;

// Declare of tree structure
class TreeNode{
    public:
        int val;
        TreeNode *left, *right;
        
        TreeNode():val(0),left(nullptr),right(nullptr){};
        TreeNode(int x):val(x),left(nullptr),right(nullptr){};
        TreeNode(int x, TreeNode *leftNode, TreeNode *rightNode):val(x),left(leftNode),right(rightNode){};
    friend class BT;
};

// Declare of binary tree class

class BT{
    public:
        TreeNode *root = new TreeNode;
        BT():root(nullptr){};
        BT(TreeNode *node):root(node){};
        
        TreeNode* returnRoot(TreeNode* root);
};

TreeNode* BT::returnRoot(TreeNode* root){
    return root;
}

int main() {
    //Declare tree node
    TreeNode *nodeA = new TreeNode(1);
    BT T(nodeA);
    
    TreeNode* (BT::*func_ptr)(TreeNode*);
    func_ptr = &BT::returnRoot;
    
    cout << (T.*func_ptr)(T.root)->val << endl;
    
    return 0;
}
```

前上半段的 `class TreeNode` 以及 `class BT`  定義了二元樹的架構，這裡先不理它。可以觀察到我們在BT class 底下宣告了一個函數 `returnRoot` 他做的事就是將輸入的節點回傳，沒什麼用途。接著看到 `main`，其中我們只定義了一個節點，其節點值為整數 `1` ，並且將改節點作為樹的 `root` ，接著才是使用 function pointer 的地方：

```cpp
TreeNode* (BT::func_ptr)(TreeNode*);
```

{% note info %}
這裡定義了一個指向 BT Class member function 的指標，其參數跟回傳值都是 `TreeNode*`
參數跟回傳值其實都跟上面的 `returnRoot` 一樣
{% endnote %}

我們將BT的成員函數位址取出並交給 `func_ptr` 指標變數 

```cpp
func_ptr = &BT::returnRoot;
```

接著印出結果，由於 `returnRoot` 的回傳值會是一個節點，因此這裡印出它的節點值

```cpp
cout << (T.*func_ptr)(T.root)->val << endl;
```

{% note info %}
這裡要特別注意，因為 `funct_ptr` 被宣告為指向任何 BT class 的成員函數的指標，因此在存取的時候需要透過初始化過的 BT class 的物件來存取，這裡會是 `T`
{% endnote %}

輸出結果： `1`

## 成員函數指標

剛剛可以發現後 Function Pointer 宣告在 `main` 中去進行存取，**那如果 Function Pointer 想要作為某個 class 內的成員會怎麼樣呢？**

其實自己實驗下來體感上差異在於在 caller (`main`) 的存取方式:

```cpp

...

class BT{
    public:
        TreeNode *root = new TreeNode;
        //Declare the member function pointer
        TreeNode* (BT::*func_ptr)(TreeNode*);

        BT():root(nullptr){};
        BT(TreeNode *node):root(node){};

        TreeNode* returnRoot(TreeNode* root);
};

...

int main(){
    TreeNode *nodeA = new TreeNode(1);
    BT T(nodeA);
    // Assign function address to member function pointer
    T.func_ptr = &BT::returnRoot;
    // Calling member function through member function pointer
    cout << (T.*T.func_ptr)(T.root)->val << endl;
}
```

> 在 class 中，function pointer 的宣告還是一樣，一樣需要指定這個pointer 是要存取哪個class 的 member function，還是要說清楚。


但在 `main` 的存取就要小心了，由於該 function pointer 一樣屬於 `BT` class 裡，因此在 assign function address 的時候一樣需要透過 class object `T` 來存取function pointer

```cpp
T.funt_ptr = &BT::returnt_ptr;
```


{% note warning %}
而在呼叫的部分，需要更加注意，由於是透過成員函數指標來存取函數
- `*T.funt_ptr` 指向目標成員函數，因此需要另一個物件來呼叫該指標
- `T.*T.funt_ptr` 透過前面的 `T` 來存取後面用來指向目標函數的指標
{% endnote %}

## Function Pointer 實際應用

- **Callback Function**: Function Pointer 常常用在 Callback 方式的實踐，像是 Event-Driven 的架構或者 Interrupt Handling 都可以採用
- **Dynamic Dispatch**: 在有多個具有相似介面但不同實作（多態, Polymorphism）的函數的情況下，可以使用 Function Pointer 在這些函數之間進行切換。
- **Function Table**: Function pointers 可以被存放在 Array 或其他資料結構中，建立 Function Table，根據index 來選擇要呼叫哪個函式


# 底層流程

![](/img/c++/memory.png)


這裡我們換一個範例來實際看看使用 Function Pointer 時候的記憶體變化：

*exmaple.cpp*

```cpp
  #include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int subtract(int a, int b) {
    return a - b;
}

int main() {
    int (*func_ptr)(int, int);
    func_ptr = &add;
    int result1 = func_ptr(10, 5);

    func_ptr = &subtract;
    int result2 = func_ptr(10, 5);

    cout << "Result1: " << result1 << endl;
    cout << "Result2: " << result2 << endl;

    return 0;
}
```

上面定義了兩個函式，可以用 Function Pointer 去分別呼叫 `add` 和 `subtract` ，這裡我們在Linux 環境中編譯程式，接著啟動 gdb

```
g++ -g -o func_pointer_test func_pointer_test.cpp
gdb ./func_pointer_test
```


# 指標函數 vs. 函式指標

```cpp

```

# Reference

[1] - https://medium.com/@hatronix/function-pointers-in-c-unleashing-the-power-of-dynamic-dispatch-29672ffcf502

[2] - https://www.boardinfinity.com/blog/function-pointers-in-c/

[3] - https://www.javatpoint.com/function-pointer-in-cpp

[4] - https://www.geeksforgeeks.org/function-pointer-in-cpp/

[5] - https://kheresy.wordpress.com/2010/11/03/function_pointer/

[6] - https://chenhh.gitbooks.io/parallel_processing/content/cython/function_pointer.html

[7] - https://www.youtube.com/watch?v=ynYtgGUNelE