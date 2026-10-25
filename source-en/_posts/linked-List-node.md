---
title: Essential Problem-Solving Tool | Linked List | LeetCode Notes
toc: true
tags:
  - Linked List
  - LeetCode
categories: LeetCode Notes
aside: true
abbrlink: "c1fe4928"
date: 2024-06-02 17:03:24
cover: /img/LeetCode/Linked_List/linked_list_cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/c1fe4928.html)

# Introduction to the Linked List

![](/img/LeetCode/Linked_List/linked_list.png)

A Linked List is a common data structure, composed mainly of **data** and **the address of the next node,** forming a structure where nodes link to each other, with the last node pointing to the NULL address.

The main way we implement it is with C. To implement a Linked List, we must first define the node itself with a `struct`.


# Implementing a Linked List

## Defining the node

```C
typedef struct node{
	int data;
	struct node *next;
} Node;
```

Above we define the `node` struct, which contains integer data `data`, representing the data the node holds, and a struct-type pointer `next`, the memory address of the next node of the same struct. This struct is declared as `Node` for convenience in declaring nodes later.

```c
Node *first_node;
Node *current_node;
Node *previous_node;
```

We can use Node to declare three pointers pointing to the memory addresses of three structs: `first_node`, `current_node`, `previous_node`. The uses of these three pointers:

- `first_node` points to the starting address of the chain
- `current_node` points to the current node in the chain, often used when traversing the list
- `previous_node` points to the node before current_node, often used when creating nodes or reversing the whole linked list


Now we can start building the chain from scratch.

## Building the Linked List

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

In the code above, we first provide input to decide the number of nodes to create, then call the `create_new_node` function, and print each node's data and the next node's address in order from the first node, finally moving to the next node via `current_node=current_node->next;`.

The main thing to do here is build the `create_new_node` function.

## Creating nodes (`create_new_node`)


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
- Inside the function, a `for loop` repeats the node creation
- Dynamically allocate space of `Node` size with malloc, and point current_node at its memory address
- Let the user manually enter the data content
- `current_node -> data` means accessing the data variable at this memory address; here we directly store the manually entered data value into the node's data variable
- Then judge whether we're creating the first node. When creating the first node, remember to update the `first_node` pointer to point to the current node, and since there's no previous node at this point, also update `previous_node` to `current_node`, i.e. the current node
- When creating subsequent nodes, make the previous node point to the current node's memory address so they link up, so `previous_node->next = current_node;`
- And point `current_node`'s next node memory address to NULL, so `current_node -> next = NULL;`
- Finally, update `previous_node` to the current node


## Printing the list (`PrintList`)

After building the nodes, you inevitably want to print the whole list

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
- The main logic is to run from the first node along the chain, so `node = node -> next` until hitting Null
- The function's input is the initial node address
- Need to judge whether the list is empty

Then call it in the main function to print
```c
PrintList(first_node);
```
## Freeing memory

Since every node is dynamically declared with **malloc**, the memory addresses occupied must be freed after execution ends, so we likewise need to iterate over each chain node and `free()` it

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
- The function's input parameter is likewise the initial node's address
- Before reaching NULL, we need to put the current node into a temporary memory address to `free()` it; if we directly `free(current)`, the next node's memory address stored in it can't be found
- Then let the current node keep going down the list `current = current->next;`

## Searching for a node

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
- The function's declared type is also `Node*` because the return value is a struct pointer, i.e. a node's memory address
- The input parameters also need the list's initial node address and the data value to find
- Likewise go down the list (`node= node->next;`); if a node's data value equals `item` is found, return the node, until hitting Null

## Inserting a node

Inserting a node is split into different functions for different situations:
- Insert into the middle of the list
- Insert at the head of the list
- Insert at the tail of the list

### Insert in the middle

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
- The function's input parameter is a node, and you also need to provide the inserted node's data value
- Then create a new node and allocate memory for it
- Put the data value `item` into the new node's `data` variable
- Put the original input node's next node address into the new node's `next`
- Point the original input node's `next` at the new node we created
This completes the node insertion.

### Insert at the head
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
- Since it's the head, the input parameter is just the data value
- Likewise create a new node and allocate memory for it
- Put `item` into the new node's `data`
- Point the new node's `next` at the first node
- Update `first_node` to the new node

### Insert at the tail

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
- Likewise the input parameter is the new node's data value
- Likewise create a new node and allocate memory for it
- Give the new node's data value `item`
- Point the new node's pointer at NULL
- Next is handling the insertion, but first there's an exception case: judge whether the list is empty; if empty, update `first_node` to our newly created `new_node`
- If the list isn't empty, first traverse the whole list to find the last node, so update `current_node` to `first_node`
- If the last node hasn't been reached, keep traversing `current_node = current_node->next;`
- After reaching the last node, point the last node's pointer at the newly created node

## Deleting a node

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
- The input parameters are the initial node and the node to be deleted
- At the start we likewise need to judge whether `first_node` is null; if null there's nothing to delete
- Then split into different cases:
  - Delete the head
  - Delete the middle and tail
- To delete the head, first update `first_node` to its next node
- Then directly use `free()` to release the memory
- Otherwise, while the chain hasn't reached the node to be deleted, keep traversing (`ptr = ptr->next`)
- Once found, point its pointer at the next node's next node address
- Then directly use `free()` to release the memory

## Reversing the Linked List (Reverse Linked List)

![](/img/LeetCode/Linked_List/reverse-1.png)

To reverse a list, you need an extra node to temporarily hold a node's address.

### Explanation
If you first point the initial node (node A)'s pointer at NULL, there's a problem: the original pointer stored the next node's address. **If you change it to NULL, don't you then not know the original next node's address?** Without even the node's address, how do you reverse? So you need an extra node pointing to node B to hold B's memory address.

So the steps are as shown below:
1. Define a pointer pointing to NULL
2. Create a temporary node pointing to the current node's next node
3. Change the current node to point to NULL
4. Change the next node (node B) to point to the previous node (node A)
5. Update the temporary node's pointer to point to the next node's address
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
- `current`: the pointer to the current node, initialized to the linked list's first node `first_node`
- `previous`: the pointer to the previous node, initialized to NULL, since there's no previous node at the start
- `preceding`: the pointer to the current node's next node, initialized to `first_node`'s next node
- Then in the while loop, loop through the linked list until preceding becomes NULL
- `current->next = previous;`: point the current node's `next` pointer at the previous node (reversing the pointer direction)
- `previous = current;`: update `previous` to the current node
- `current = preceding;`: update `current` to the next node
- `preceding = preceding->next;`: update `preceding` to the next node's next node
- Then handle the last node, likewise pointing the last node's `next` pointer at the previous node (reversing the pointer direction)
- Also update the initial node's pointer to the current node
- `first_node = current;`: update the linked list's head node `first_node`; now current points to the original linked list's last node, i.e. the new head node


# Full code

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
## Execution result

![](/img/LeetCode/Linked_List/result-1.png)
![](/img/LeetCode/Linked_List/result-2.png)

> Summary: through this writeup, I got more familiar again with the linked-list operations I'd forgotten. Next I'll just grab related LeetCode problems for practice.

# References
[1] https://jacychu.medium.com/leetcode-linked-list-%E9%8F%88%E7%B5%90%E4%B8%B2%E5%88%97-c2edabee9958
[2] https://codimd.mcl.math.ncu.edu.tw/s/B1rd5-sM4#%E6%8F%92%E5%85%A5%E7%AF%80%E9%BB%9E%E5%87%BD%E6%95%B8-InsertNode-
