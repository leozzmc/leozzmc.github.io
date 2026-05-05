---
title: 在 C/C++ 中傳遞函式- 深入 Function Pointer 的記憶體位址變化
tags:
  - Pointer
  - C++
categories: 學習筆記
aside: true
abbrlink: bf93d608
date: 2024-08-30 09:52:21
cover: /img/c++/cover.jpg
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

> 這裡我認為 Function Table 的實現非常強大，像是 Linux Kernel 中維護的 System Call Table 其實也是一個 Function Pointer Table，它將 syscall number mapping 到對應的 kernel 處理函數。每個 system call 都透過一個唯一的 syscall number 索引到這張表中對應的 function pointer
> 詳細原理也可以參考 [這篇](https://medium.com/@7FrogTW/powerpc-syscall-%E8%B8%A9%E9%9B%B7%E5%A4%A7%E5%85%A8-75b5d477ac0b)

# 底層流程



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

![](/img/c++/gdb1.png)

> 那我自己是有裝 gdb-peda，畫面好看很多，安裝可以參考 [這篇](https://n0a110w.github.io/notes/security-stuff/peda.html)

![](/img/c++/gdb2.png)


當程式執行到 `func_ptr = &add;` 時，GDB 暫停了執行，從上面的組合語言可以看到

```
=> 0x555555555203 <main()+12>:  lea    rax,[rip+0xffffffffffffffbf]        # 0x5555555551c9 <_Z3addii>
```

`lea` 指令用來計算 memory位址。這裡 `RAX` 將被設為一個基於 `RIP` 的偏移地址。這個偏移量應該用來載入 add 函數的地址並存儲在 `RAX` 中，以後可以通過這個地址來 call add 函數。


所以這時候可以檢查一下最上方的 `RAX` 暫存器放了甚麼。 **`RAX` 暫存器被給定 `add` 函數的位址，這就代表了 function pointer 正在被初始化。**

我們可以看下一行要執行甚麼:

```
0x55555555520a <main()+19>:  mov    QWORD PTR [rbp-0x8],rax
```

這行會做的事情就是，將 `rax` 中的值存入base pointer 位址減掉 `0X8` 偏移量的的位址，而這應該就是 function pointer 的所在位址 

接著我們進入下一行指令，可以透過 `s` 指令來追蹤下一行 (17行)

![](/img/c++/GDB3.png)


現在我們可以檢查看看 `func_ptr` 的值，看它是否指向了 `add` 函數的地址，**而結果顯然是真的指向到  `add` 函數的記憶體位址**

```
print func_ptr
```

```
$1 = (int (*)(int, int)) 0x5555555551c9 <add(int, int)>
```

接著可以執行 `r` 繼續執行到下一個斷點，也就是將 function pointer 賦值給 subtract 函數的地方



接著一路單步執行到 `func_ptr = &subtract;` 那行，接著再 `print func_ptr`


![](/img/c++/gdb4.png)

一樣可以看到這行指令

```
=> 0x555555555221 <main()+42>:  lea    rax,[rip+0xffffffffffffffb9]        # 0x5555555551e1 <_Z8subtractii>
```
這裡也是將 `subtract` 函數位址載入到 `RAX` 中，我們可以輸入 `n` 看下一個指令

```
=> 0x55555555522c <main()+53>:  mov    rax,QWORD PTR [rbp-0x8]
```

這行會做的事情就是跟剛剛一樣，**將 `rax` 中的值存入 function pointer 的所在位址**

接著我們進入下一行指令，可以透過 `n` 指令來追蹤第22行，函數執行完並且輸出結果

我們這時候也可以檢查 function pointer 是否指向 `subtract` 函數的記憶體位址


![](/img/c++/gdb5.png)


而這個答案也是肯定的。而如果我們執行到 `int result1 = func_ptr(10, 5);` 這時也可以觀察一下暫存器的變化，如果覺得畫面太亂，可以用下面指令來查看暫存器的狀態， `RIP` 代表下一個要執行的CPU指令，而 `RSP` 則是 Stack Pointer 代表當前 stack frame 的上緣，可以透過這兩個 register 來了解 function call 時候的流程

```
info registers 
```

![](/img/c++/gdb6.png)


這是進入 `add` 之前的 `rip` 和 `rsp`

```
rsp            0x7fffffffdfb0      0x7fffffffdfb0
rip            0x55555555520e      0x55555555520e <main()+23>
```

而這是進入 `add` 之後的 `rip` 和 `rsp`

```
rsp            0x7fffffffdfa0      0x7fffffffdfa0
rip            0x5555555551d7      0x5555555551d7 <add(int, int)+14>
```

可以觀察到，Stack 大概差了2 bytes，這兩byte 也可以從 stack 視圖中觀察到:

這是進入 `add` 之前:

![](/img/c++/stack1.png)

這是進入 `add` 之後:
![](/img/c++/stack2.png)

這之2 bytes 其中包含了 回到 `main` 的 return address  ` 0x55555555521e `。 這時我們繼續執行 `s` 直到跳回 `main` 函數，可以從 code section 看到我們正在剛剛函數 return address 的下一個指令位址 `0x555555555221`。

最後執行 `print result1` 察看結果

```
$1 = 0xf
```
也代表結果 15

> 這時實驗也更了解 function pointer 還有function call 期間的記憶體變化

## 觀念澄清

![](/img/c++/memory.png)


在 C/C++ 中，pointer變數的記憶體位址存放在哪個地方取決於它是怎麼被宣告的，

- 如果 pointer 是在函數內部宣告的local variable，像是 `int *ptr;` 那pointer本身會被存放在 Stack
- 如果 pointer是一塊隨機的記憶體位址，如果你是用動態宣告 `int *ptr = new int`，那pointer本身還是會在 Stack 或global 但所指向的對象會是在 heap上
- 如果宣告的 pointer 是global的，那他就會被存放在 global/staic 區域中，如果是靜態變數一樣 `static int* ptr`
- Pointer 本身不會被存放在 code 區域，但 Function Pointer 會指向 code 區域中的函數入口點
  - `void (*func_ptr)() = &myFunction;` 這個 pointer 儲存的值 (函數位址) 會是在 code section，而 pointer本身還是會是 stack 或是 gloal/stack 區段。 

# 結語

更加了解了 function pointer 對應到的記憶體變化，之後有機會再實際透過 Function Pointer來實現 Function Table。

# Reference

[1] - https://medium.com/@hatronix/function-pointers-in-c-unleashing-the-power-of-dynamic-dispatch-29672ffcf502
[2] - https://www.boardinfinity.com/blog/function-pointers-in-c/
[3] - https://www.javatpoint.com/function-pointer-in-cpp
[4] - https://www.geeksforgeeks.org/function-pointer-in-cpp/
[5] - https://kheresy.wordpress.com/2010/11/03/function_pointer/
[6] - https://chenhh.gitbooks.io/parallel_processing/content/cython/function_pointer.html
[7] - https://www.youtube.com/watch?v=ynYtgGUNelE