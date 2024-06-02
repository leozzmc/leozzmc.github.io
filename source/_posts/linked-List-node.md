---
title: 刷題必備神器 | 鏈結串列 (Linked List) | LeetCode 筆記
toc: true
tags:
  - Linked List
  - LeetCode
categories: LeetCode筆記
aside: true
abbrlink: c1fe4928
date: 2024-06-02 17:03:24
cover: /img/LeetCode/Linked_List/linked_list_cover.jpg
---

# 鏈結串列(Linked List)介紹

![](/img/LeetCode/Linked_List/linked_list.png)

Linked List 是一種常見的資料結構，其組成主要包含 **資料** 和 **下一個節點的位址**，因此構成節點與節點相互鏈結的結構，其中最後一個節點會指向到 NULL 這個位址。

我們實踐的主要方式還是透過 C 語言去操作，想要實現 Linked List 必須先透過 `struct` 來去先定義節點本身


# Linked List 實踐

## 定義節點

```C
typedef struct node{
	int data;
	struct node *next;
} Node;
```

上面定義了 node 這個結構，其中包含了整數資料 `data`， 代表節點本身存放的資料 以及struct 型別的指標，下一個結構相同節點的記憶體位址 `next`。並且此結構的宣告為 `Node`，方便我們後續宣告節點。

```c
Node *first_node;
Node *current_node;
Node *previous_node;
```

我們可以透過 Node 來去宣告三個指標，指向三個結構的記憶體位址，分別為 `first_node`, `current_node`, `previous_node`。這三個指標的用途:

- `first_node` 用來指向鏈結的起始位址
- `current_node` 用來指向鏈結目前所在節點，通常再 traverse link 的時候很常用
- `previous_node` 用來指向current_node 的前一個節點，在建立節點或者反轉整個linked list 的時候很常用


現在可以開始從0 建立鏈結。

## 建立 Linked List

```c

int main(){
  int node_numbers;
  scanf("%d",&node_numbers);
  create_new_node(node_numbers);
  current_node = first_node;
  while (current_node!= NULL){
    printf("[%p]|",current_node);
    printf("Data: %d",current_node->data);
    printf("| Addr. of next node=%p \n",current_node->next);
    current_node=current_node->next;
  }
  return 0;
}
```

在上面的程式碼中，我們首先提供輸入來決定要建立的節點數量，接著呼叫 `create_new_node` 函式，並且從第一個節點依序印出節點資料和下一個節點的位址，最後透過 `current_node=current_node->next;` 來移動到下一個節點。

這裡最需要做的就是要建立 `create_new_node` 函式

## 建立節點 (`Create_new_node`)


```c
void create_new_node(int node_nums){
    int i;
    for (i=0; i< node_nums; i++){
        // Declare new node
        current_node = (Node*)malloc(sizeof(Node));
        printf("Data for node %d : ",i+1);
        // Enter node data
        scanf("%d", &(current_node->data));
        
        // First node, don't have previous node, so let the first_node and previous_node equal to current_node
        if(i==0){
            first_node = current_node;
            previous_node = current_node;
        }
        else{
            // Set the previous node point to the current node
            previous_node->next = current_node;
            current_node->next = NULL;
            // Set the previous node to current node, prepare to next node creation (or not)
            previous_node = current_node;
        }
    }
}
```
- 在函式內，透過 `for loop` 來重複節點的建立
- 透過 malloc 動態分配具有 `Node` 大小空間，並將 current_node 指向其記憶體位址
- 讓使用者手動輸入 data 內容
- `current_node -> data` 代表存取這個記憶體位址的 data 變數，這裡也是直接將手動輸入的資料值存放到節點中的data變數中
- 接著就是判斷是否是建立第一個節點，當建立第一個節點的時候，記得要更新 `first_node` 這個指標，確保指到當前節點，並且這時候也沒有前一個節點，因此也將 `previous_node` 更新為 `current_node` 也就是目前節點
- 如果開始建立後續的節點，則要讓前一個節點指向到目前節點的記憶體位址，才能夠鏈結起來，所以 `previous_node->next = current_node;`
- 並且將 `current_node` 的下一個節點記憶體位址指向 NULL，所以 `current_node -> next = NULL;`
- 最後還需要更新 `previous_node` 為當前節點


## 印出節點 (`PrintList`)

在建立完節點，難免想要印出整個串列

```c
// input parameter is node struct
void PrintList(Node* first){
    // Decalre the address of input node
    Node *node = first;
    if (first == NULL){
        printf("List is empty!\n");
    }
    else{
        while( node != NULL){
            printf("%d -> ", node->data);
            node = node->next;
        }
        printf ("Null \n");
    }
}
```
- 主要邏輯就是讓從 first node 順著鏈結一直往下跑，所以將 `node = node -> next` 直到遇到 Null
- 函式的輸入會式初始節點位址
- 需要判斷list是否為空

接著在 main 函式呼叫即可印出
```c
PrintList(first_node);
```
## 釋放記憶體

由於每個節點都是透過 **malloc** 進行動態宣告的，引此占用的記憶體位址在執行結束後要進行釋放，因此一樣需要檢索每個鏈結節點去進行 `free()`

```c
void FreeList(Node* first){
    Node *current, *temp_node;
    current = first;
    while ( current != NULL ){
        // Put the node that wants to be removed into temp_node
        temp_node = current;
        // Let the current node point to the next node
        current = current->next;
        // Free the node
        free(temp_node);   
    }
}
```
- 函式傳入參數一樣會是初始節點的位址
- 一旦尚未到 NULL 的時候會需要將 當前節點丟到一個暫存的記憶體位址去進行 `free()`，如果直接 `free(current)` 則所存放的下一個節點的記憶體位址就找不到了
- 接著在讓當前節點繼續著 list 往下走 `current = current->next;`

## 查找節點

```c
// Return value should be the address of the node
Node* SearchNode(Node* first, int item){
    Node * node = first;
    while ( node != NULL){ 
        if (node->data == item){
            return node;
        }
        else{
            node = node->next;
        }
    }
}
```
- 這裡函數的宣告型別也是用 `Node* ` 因為回傳值會是一個結構指標，也就是節點的記憶體位址
- 傳入參數也需要傳輸 list 的初始節點位址，以及想要找的data值
- 一樣順著 Lists 找 (`node= node->next;`) 如果有找到節點的資料值等於 `item` 就回傳節點，直到遇到 Null 為止

## 插入節點

插入節點這邊根據不同狀況分成不同函數處理:
- 插入到 List 中間
- 插入到 List 的頭
- 插入到 List 的尾端

### 插中間

```c
void InsertNode(Node* node, int item){
    Node *new_node;
    new_node = (Node*)malloc(sizeof(Node));
    // Point the new node to the nexy item of original node
    new_node->data = item;
    new_node->next = node->next;
    // Point the original node to new node
    node -> next = new_node;
}
```
- 函數的傳入參數會是一個 node，並且還需要提供插入節點的資料值
- 接著就是新建立一個節點，為它分配記憶體空間
- 將新節點的 `data` 變數放入 `item` 這個資料值
- 將新結點的 `next` 放入原本輸入節點的下一個節點位址
- 將原本書入節點的 `next` 指向我們新建立的節點
這樣就完成插入節點的操作了

### 插頭
```c
// Insert a node to the front of the list
void push_front(int  item){
    Node * new_node;
    new_node = (Node*)malloc(sizeof(Node));
    new_node->data = item;
    new_node->next = first_node; // new node pointer point to original first node
    first_node = new_node;  // Update the first node to the new node
}
```
- 因為是頭，所以輸入參數就直接給資料值就好
- 一樣建立新節點，並為其分配記憶體空間
- 將 `item` 放入新節點的 `data`
- 將新節點的 `next` 指向到第一個節點
- 更新 `first_node` 為新的節點

### 插尾端

```c
// Insert a node to the back of the list
void push_back(int item){
    Node * new_node;
    new_node = (Node*)malloc(sizeof(Node));
    new_node->data = item;
    new_node->next = NULL;
    // Handle empty list
    if (first_node == NULL){
        first_node = new_node;
    }
    else{
        // Initailize the current node to the first node for traversal
        Node * current_node = first_node;
        while (current_node->next != NULL){
            // traverse through the list
            current_node = current_node->next;
        }
        // Point to the new node
        current_node->next = new_node;
    }
}
```
- 一樣輸入參數會是新節點的資料值
- 一樣建立新的節點，並且分配記憶體空間給他
- 將新節點的資料值給予 `item`
- 將新節點的指標指向 NULL
- 接下來就是處理插入，但這樣會先進行一個例外處理，就是要先判斷 List是否為空，如果是空的就將 `first_node` 更新為我們新建立的 `new_node`
- 若 list 非空，則需要先 traverse 整個 list 找到最後一個節點，所以將 `current_node` 更新為 `first_node`
- 若尚未抵達最後一個節點，則繼續 traverse `current_node = current_node->next;`
- 抵達最後節點後，將最後節點的指標值指向新建立的節點

## 刪除節點

```c
Node* DeleteNode(Node* first ,Node* node){
    Node* ptr= first;
    if (first == NULL)
    {
        printf("Noting to print\n");
    }
    // Delete first node of the list
    if (node == first){
        // Update the first pointer to the next node
        first = first->next;
        free(node);
        return first;
    }
    else{
        // ptr traverse through the list
        while (ptr->next != node)
        {
            ptr = ptr->next;
        }
        ptr->next = node->next;
        free(node);
        return first;
    }
}
```
- 傳入參數會有，初始節點，以及要被刪除的節點
- 一開始一樣會需要判斷 `first_node` 是否為 null，如果是 null 也沒東西給你刪
- 接著一樣會分成不同情況處理，分別是
  -  刪除頭
  -  刪除中間和尾端
- 刪除頭的處理方式會是先更新 `first_node` 更新為它的下一個節點
- 接著直接使用 `free()` 釋放記憶體
- 再來就是當鏈結還沒抵達要被刪除的節點時，繼續 traverse  (`ptr = ptr->next`)
- 一旦找到了則將它的指標，先指向下一個節點的下一個節點位址
- 接著直接使用 `free()` 釋放記憶體

## 反轉鏈結串列 (Reverse Linked List)

![](/img/LeetCode/Linked_List/reverse-1.png)

要反轉一個陣列，會需要一個額外節點來暫時存放節點位址。

### 解釋
如果首先就把初始節點 (A節點)的指標指向 NULL 會有個問題，原先的指標存放的是下一個節點的位址，**如果改成 NULL 不就不知道原先下一個節點的位址了嗎?** 連節點位址都沒有要怎麼進行反轉?因此才需要額外的節點才指向到 B 節點，來存放B的記憶體位址。

因此步驟如下圖：
1. 定義指標指向 NULL
2. 建立暫存節點，指向到當前節點的下一個節點
3. 將當前節點改指向 NULL
4. 將下一個節點 (B節點)改指向上一個節點 (A節點)
5. 更新暫存節點的指標，指向再下一個節點的位址
![](/img/LeetCode/Linked_List/reverse-2.png)


```c
void Reverse(){  
    Node *current, *previous, *preceding;
    previous = NULL;
    current = first_node;
    // preceding node store the previous address of the current node
    preceding = first_node->next;
    while (preceding != NULL){
        // pointer the current node to the NULL (previous) node
        current->next = previous;
        // Update previous poinert to current pointer
        previous = current;
        // Update current pointer to the preceding point
        current = preceding;
        // Update the preceding pointer to the next node;
        preceding = preceding->next;
    }
    current->next =previous;
    first_node=current;    
}
```
- `current`：指向當前節點的指標，初始值為linked list的第一個節點 `first_node`
- `previous`：指向前一個節點的指標，初始值為 NULL，因為在開始時沒有前一個節點
- `preceding`：指向當前節點的下一個節點的指標，初始值為 `first_node` 的下一個節點
- 接著在 while 迴圈內，循環走訪linked list，直到 preceding 變為 NULL
- `current->next = previous;`：將當前節點的 `next` 指標指向前一個節點（反轉指標方向）
- `previous = current;`：將 `previous` 更新為目前節點
- `current = preceding;`：將 `current` 更新為下一個節點
- `preceding = preceding->next;`：將 `preceding` 更新為下一個節點的下一個節點
- 接著是最後一個節點的處理，這時也是將，將最後節點的 `next` 指標指向前一個節點（反轉指標方向）
- 另外就是要將初始節點的指標更新為當前節點
- `first_node = current;`：更新linked list的頭節點 `first_node`，現在 current 指向原始linked list的最後一個節點，即新的頭節點


# 全部程式碼

```c
#include <stdio.h>
#include <stdlib.h>

// define node
typedef struct node
{
    int data;
    struct node *next;
}Node;

Node *first_node;
Node *current_node;
Node *previous_node;

// Declare Fuctions

void create_new_node(int node_nums);
void PrintList(Node* first);
void FreeList(Node* first);
Node* SearchNode(Node* first, int item);
void InsertNode(Node* node, int item);
void push_front(int item);
void push_back(int item);
Node* DeleteNode( Node* first,Node* node);
void Reverse();

int main(){

    int node_numbers;
    int item;
    printf("The numbers of nodes:");
    scanf("%d",&node_numbers);
    create_new_node(node_numbers);
    current_node = first_node;
    while (current_node!= NULL){
        printf("[%p]|",current_node);
        printf("Data: %d",current_node->data);
        printf("| Addr. of next node=%p \n",current_node->next);
        current_node=current_node->next;
    }

    // Traverse the list of nodes
    printf("=========================================================\n\n");
    PrintList(first_node);
    printf("Serach Nodes: ");
    scanf("%d",&item);
    if (SearchNode(first_node,item)){ printf("Node found\n");} else {printf("Node not found\n");}


    printf("Insert Node:");
    // User input data
    scanf("%d",&item);
    if (SearchNode(first_node,item)){ 
        printf("Node exisit in the list");
    } 
    else {
        // Insert behind the current node
        InsertNode(first_node,item);
        PrintList(first_node);
    }

    printf("Reverse the list\n");
    Reverse();
    PrintList(first_node);

    FreeList(first_node);

    system("pause");
    return 0;
}

void create_new_node(int node_nums){
    int i;
    for (i=0; i< node_nums; i++){
        // Declare new node
        current_node = (Node*)malloc(sizeof(Node));
        printf("Data for node %d : ",i+1);
        // Enter node data
        scanf("%d", &(current_node->data));
        
        // First node, don't have previous node, so let the first_node and previous_node equal to current_node
        if(i==0){
            first_node = current_node;
            previous_node = current_node;
        }
        else{
            // Set the previous node point to the current node
            previous_node->next = current_node;
            current_node->next = NULL;
            // Set the previous node to current node, prepare to next node creation (or not)
            previous_node = current_node;
        }
    }
}

// input parameter is node struct
void PrintList(Node* first){
    // Decalre the address of input node
    Node *node = first;
    if (first == NULL){
        printf("List is empty!\n");
    }
    else{
        while( node != NULL){
            printf("%d -> ", node->data);
            node = node->next;
        }
        printf ("Null \n");
    }
}

void FreeList(Node* first){
    Node *current, *temp_node;
    current = first;
    while ( current != NULL ){
        // Put the node that wants to be removed into temp_node
        temp_node = current;
        // Let the current node point to the next node
        current = current->next;
        // Free the node
        free(temp_node);   
    }
}

// Return value should be the address of the node
Node* SearchNode(Node* first, int item){
    Node * node = first;
    while ( node != NULL){
       
        if (node->data == item){
            return node;
        }
        else{
            node = node->next;
        }
    }
}

void InsertNode(Node* node, int item){
    Node *new_node;
    new_node = (Node*)malloc(sizeof(Node));
    // Point the new node to the nexy item of original node
    new_node->data = item;
    new_node->next = node->next;
    // Point the original node to new node
    node -> next = new_node;
}

// Insert a node to the front of the list
void push_front(int  item){
    Node * new_node;
    new_node = (Node*)malloc(sizeof(Node));
    new_node->data = item;
    new_node->next = first_node; // new node pointer point to original first node
    first_node = new_node;  // Update the first node to the new node
}

// Insert a node to the back of the list
void push_back(int item){
    Node * new_node;
    new_node = (Node*)malloc(sizeof(Node));
    new_node->data = item;
    new_node->next = NULL;
    // Handle empty list
    if (first_node == NULL){
        first_node = new_node;
    }
    else{
        // Initailize the current node to the first node for traversal
        Node * current_node = first_node;
        while (current_node->next != NULL){
            // traverse through the list
            current_node = current_node->next;
        }
        // Point to the new node
        current_node->next = new_node;
    }
}

Node* DeleteNode(Node* first ,Node* node){
    Node* ptr= first;
    if (first == NULL)
    {
        printf("Noting to print\n");
    }
    // Delete first node of the list
    if (node == first){
        // Update the first pointer to the next node
        first = first->next;
        free(node);
        return first;
    }
    else{
        // ptr traverse through the list
        while (ptr->next != node)
        {
            ptr = ptr->next;
        }
        ptr->next = node->next;
        free(node);
        return first;
        
    }
}

void Reverse(){
    
    
    Node *current, *previous, *preceding;
    previous = NULL;
    current = first_node;
    // preceding node store the previous address of the current node
    preceding = first_node->next;
    
    while (preceding != NULL){
        // pointer the current node to the NULL (previous) node
        current->next = previous;
        // Update previous poinert to current pointer
        previous = current;
        // Update current pointer to the preceding point
        current = preceding;
        // Update the preceding pointer to the next node;
        preceding = preceding->next;
    }
    current->next =previous;
    first_node=current;    
}
```
## 執行結果

![](/img/LeetCode/Linked_List/result-1.png)
![](/img/LeetCode/Linked_List/result-2.png)

> 總結: 透過這次的整理，算是有更加熟悉已經忘光的 linked list 操作，接下來就直接拿相關的LeetCode題目當練習吧

# References
[1] https://jacychu.medium.com/leetcode-linked-list-%E9%8F%88%E7%B5%90%E4%B8%B2%E5%88%97-c2edabee9958
[2] https://codimd.mcl.math.ncu.edu.tw/s/B1rd5-sM4#%E6%8F%92%E5%85%A5%E7%AF%80%E9%BB%9E%E5%87%BD%E6%95%B8-InsertNode-

