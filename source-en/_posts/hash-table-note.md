---
title: Essential Problem-Solving Tool | Hash Table | LeetCode Notes
toc: true
tags:
  - hash table
  - complexity
  - LeetCode
categories: LeetCode Notes
aside: true
abbrlink: "ef71152b"
date: 2024-05-30 22:51:40
cover: /img/pepe.jpg
---

> 🌐 中文版：[繁體中文](/posts/ef71152b.html)

# Basic introduction

A hash table is a Key-Value mapping structure used for fast data lookup. Compared to the $O(\log n)$ time complexity of general search algorithms, its time complexity is $O(1)$.

The main reason for the lightning speed is the hash function. If we first store n numbers in a hash table, then to check whether a number A is already in the hash table, we just throw A into the hash function and immediately know which slot in the hash table A maps to.


### When a Hash Table is not suitable

- When the data has a time-priority order for processing, a Queue (FIFO) structure is more suitable
- **If you want the data to be sorted, a hash table isn't suitable either**
    - https://www.reddit.com/r/learnprogramming/comments/29t4s4/when_is_it_bad_to_use_a_hash_table/

### Conditions where a Hash Table is suitable

- The problem requires an $O(1)$ time-complexity algorithm to access elements
- The worst case is also $O(n)$ time complexity

# Hash Function

For a hash function to hold, there are three conditions

1. The value computed by the hash function is a non-negative integer
2. If key1 = key2, then `hash(key1) = hash(key2)`
3. If key1 ≠ key2, then `hash(key1) ≠ hash(key2)`

A point to note is that putting multiple pieces of data in the same slot easily causes a **collision**, and the **load factor** is the factor used to measure how likely a collision is to happen.
    - $load factor = n / m$
    - $n$ = number of input data items
    - $m$ = size of the hash table
    - If $load factor > 1$, a collision is very likely
        - https://zh.wikipedia.org/wiki/鴿巢原理
        - In plain terms: if n > m, then some data must share a bucket with other data

## Implementing the hash function (division, stored with an array)

First we can define each data item's index in the hash table

```c
index = key % m        // 0 <= index < m 
```

Example:

```
A ( Key = 11324)

B ( Key = 6356)

C ( Key = 345)

D ( key = 4171 )
```

M (hash table size) = 6, so the hash table's indices are as follows:

```
Index of A :  11324 % 6 = 2

Index of B:   6356 % 6 = 2

Index of C:  345 % 6 = 3

Index of D: 4171 % 6 =1
```

You can see that A and B collide, which is related to the choice of m. The choice of m should be as far as possible from $2^p$.

![](/img/LeetCode/HashTable/hashtable.drawio.png)

### Implementing the hash function (multiplication, stored with an array)

$index = [ m \cdot ((key \cdot A) \mod 1) ]$

$0 ≤  index < (m-1)$


Steps:

- Multiply the key by an irrational number less than 1, i.e. A, where A is usually chosen as $\frac{\sqrt5 -1}{2}$; after multiplying you get a larger irrational number
- Take this irrational number mod 1, which removes the integer part and leaves only the decimal
- Multiply m by the decimal; this step gives an irrational number between $0$ and $(m-1)$
- Use the floor function to take the integer of the irrational number
    - https://zh.wikipedia.org/wiki/取整函数


> The figure below explains it quite well
> Image source: https://medium.com/@ralph-tech/%E8%B3%87%E6%96%99%E7%B5%90%E6%A7%8B%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E9%9B%9C%E6%B9%8A%E8%A1%A8-hash-table-15f490f8ede6


![](/img/LeetCode/HashTable/hashfunction.png)

What are the advantages of this more elaborate way of computing the index:

- No constraint that m must be far from $2^p$
- Can increase randomness

# How to handle addressing collisions?

## 1. Separate Chaining / Closed Addressing

Generate a new chained storage space within each storage slot, which can be implemented with a linked list or an array

![](/img/LeetCode/HashTable/hashtable-linkedlist.png)


Since extra pointers are needed, if the stored data is smaller than a pointer, using a linked list consumes double the memory to store the data. However, if the data to be stored is much larger than the size of a pointer, the extra cost of the pointer becomes negligible. In fact, we can modify the linked list to combine its back end with data structures like a red-black tree or a skip list, so that the final hash table's lookup time only needs $O(\log n)$.

This structure is suitable for storing large amounts of data where each item is relatively large, and it also supports more varied optimization strategies, usable in combination with a red-black tree, etc.

## 2. Open Addressing

Open addressing mainly uses **probing** to find unoccupied space, which can be divided into:

- Linear Probing
- Quadratic probing

### Linear Probing

When a collision occurs, check whether the next index position is free; if it's empty, put the data in, if not, keep looking downward. When searching for an element, if a collision occurs, you also need to search backward, not stopping until you find an empty slot.

**Downside**: a hash table supports deletion, but a deleted element needs to be marked, otherwise deleting it directly would interrupt subsequent search processes.

### Quadratic probing

This can be used to solve the inefficiency of linear probing. When many elements are inserted, linear probing is also slow during addressing.

```c
hash(key)+1, hash(key)+2, hash(key)+3,…..hash(key)+n
```

So with quadratic probing the addressing is changed to:
```c
hash(key)+ 1^2 , hash(key)+ 2^2, hash(key)+3^2
```
Each time it increases by `n^2` to find a free slot

### Double hashing

Alternatively, if a collision occurs, you can directly run another hash function, i.e. when a collision happens, **keep hashing until the collision ends**

$index_{n} = F_{1}(k) + (n-1)* F_{2}(k)$ until the final index is found

### Pros and cons of open addressing:

**Pros:**

The open addressing method doesn't use linked lists; all data is stored in an array, which helps speed up access through caching.

**Cons:**

Deleting data is more troublesome, requiring special marking of the data to be deleted.
All data is stored in the same hash table, so the cost of a collision is higher, which means the load factor shouldn't be too high, making this method more wasteful of memory.

# Hash Table implementation

```c
#include <stdio.h>
#include <string.h>
// in order to use bool function in C
#include <stdbool.h>
#define MAX_NAME 256
#define TABLE_SIZE 10

typedef struct{
    char name[MAX_NAME];
    int age;
}person; 


person *hash_table[TABLE_SIZE];

unsigned int hash(char *name);
void init_hash_table();
void print_table();
bool hash_table_insert(person *p);
bool hash_table_delete(person *p);


int main(){
    init_hash_table();

    person Walt={.name="Walt",.age=26};
    person Skyler={.name="Skyler",.age=27};
    person Saul={.name="Saul",.age=28};
    person Mike={.name="Mike",.age=29};
    person Hank={.name="Hank",.age=30};
    person Mary={.name="Mary",.age=31};

    //add person into hash_table
    hash_table_insert(&Walt);
    hash_table_insert(&Skyler);
    hash_table_insert(&Saul);
    hash_table_insert(&Mike);
    hash_table_insert(&Hank);
    hash_table_insert(&Mary);

    print_table();

    //delete persion in hash table
    hash_table_delete(&Walt);
    print_table();

    return 0;
}


//define the hash function
unsigned int hash(char *name){
    int length=strnlen(name, MAX_NAME);
    unsigned int hash_value=0;
    for(int i=0;i<length;i++){
        hash_value+=name[i];
        hash_value=(hash_value*name[i])%TABLE_SIZE;
    }
    return hash_value;
}

//initialize the hash table to NULL (let it be empty)
void init_hash_table(){
    for(int i=0;i<TABLE_SIZE;i++){
        hash_table[i]=NULL;
    }
}

//print out the hash table
void print_table(){
    printf("--------Start--------\n");
    for(int i=0;i<TABLE_SIZE;i++){
        //nothing in the hash table
        if(hash_table[i]==NULL) printf("\t%d\t---\n",i);
        //something in the hash table
        else printf("\t%d\t%s\n",i,hash_table[i]->name);
    }
    printf("--------End----------\n");
}

//insert the element into the hash_table
bool hash_table_insert(person *p){
    //make sure not call this function with null ptr
    if(p==NULL) return false;

    //insert the person into the index return by hash_function
    int index=hash(p->name);
    //check the pointer at that index in the table is null or not
    if(hash_table[index]!=NULL) return false; //collision, somebody had occupied there already
    
    //if no one occupied there, then occupied the address
    hash_table[index]=p;
    return true;
}


bool hash_table_delete(person *p){

    // to avoid null ptr
    if(p==NULL) return false;

    //get index
    int index=hash(p->name);

    if(hash_table[index]!=NULL){
        hash_table[index] = NULL;
    }

    return true;
}
```

Using the C++ STL makes problem solving much more convenient:

```cpp
#include <iostream>
#include <unordered_map>
#include <string>

using namespace std;

struct Person {
    string name;
    int age;
};

unordered_map<string, Person> hash_table;

void init_hash_table();
void print_table();
bool hash_table_insert(const Person& p);
bool hash_table_delete(const string& name);

int main() {
    init_hash_table();

    Person Walt = {.name = "Walt", .age = 26};
    Person Skyler = {.name = "Skyler", .age = 27};
    Person Saul = {.name = "Saul", .age = 28};
    Person Mike = {.name = "Mike", .age = 29};
    Person Hank = {.name = "Hank", .age = 30};
    Person Mary = {.name = "Mary", .age = 31};

    // Add persons into hash_table
    hash_table_insert(Walt);
    hash_table_insert(Skyler);
    hash_table_insert(Saul);
    hash_table_insert(Mike);
    hash_table_insert(Hank);
    hash_table_insert(Mary);

    print_table();

    // Delete person from hash table
    hash_table_delete("Walt");
    print_table();

    return 0;
}

void init_hash_table() {
    hash_table.clear();
}

void print_table() {
    cout << "--------Start--------" << endl;
    for (const auto& pair : hash_table) {
        cout << "\t" << pair.first << "\t" << pair.second.name << endl;
    }
    cout << "--------End----------" << endl;
}

bool hash_table_insert(const Person& p) {
    auto result = hash_table.insert({p.name, p});
    return result.second; // True if insertion took place, false if key already existed
}

bool hash_table_delete(const string& name) {
    return hash_table.erase(name) > 0; // True if element was removed, false if key didn't exist
}

```

## Adding collision handling

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAX_NAME 256
#define TABLE_SIZE 10

typedef struct person {
    char name[MAX_NAME];
    int age;
    struct person *next; // pointer to the next person in the list
} person;

person *hash_table[TABLE_SIZE];

unsigned int hash(char *name);
void init_hash_table();
void print_table();
bool hash_table_insert(person *p);
person* hash_table_lookup(char *name);
bool hash_table_delete(char *name);

int main() {
    init_hash_table();

    person Walt = {.name = "Walt", .age = 26};
    person Skyler = {.name = "Skyler", .age = 27};
    person Saul = {.name = "Saul", .age = 28};
    person Mike = {.name = "Mike", .age = 29};
    person Hank = {.name = "Hank", .age = 30};
    person Mary = {.name = "Mary", .age = 31};

    // Add persons into hash_table
    hash_table_insert(&Walt);
    hash_table_insert(&Skyler);
    hash_table_insert(&Saul);
    hash_table_insert(&Mike);
    hash_table_insert(&Hank);
    hash_table_insert(&Mary);

    print_table();

    // Delete person from hash table
    hash_table_delete("Walt");
    print_table();

    return 0;
}

// Define the hash function
unsigned int hash(char *name) {
    int length = strnlen(name, MAX_NAME);
    unsigned int hash_value = 0;
    for (int i = 0; i < length; i++) {
        hash_value += name[i];
        hash_value = (hash_value * name[i]) % TABLE_SIZE;
    }
    return hash_value;
}

// Initialize the hash table to NULL (let it be empty)
void init_hash_table() {
    for (int i = 0; i < TABLE_SIZE; i++) {
        hash_table[i] = NULL;
    }
}

// Print out the hash table
void print_table() {
    printf("--------Start--------\n");
    for (int i = 0; i < TABLE_SIZE; i++) {
        if (hash_table[i] == NULL) {
            printf("\t%d\t---\n", i);
        } else {
            person *tmp = hash_table[i];
            while (tmp != NULL) {
                printf("\t%d\t%s\n", i, tmp->name);
                tmp = tmp->next;
            }
        }
    }
    printf("--------End----------\n");
}

// Insert the element into the hash_table
bool hash_table_insert(person *p) {
    if (p == NULL) return false;

    int index = hash(p->name);

    // Insert at the head of the list
    p->next = hash_table[index];
    hash_table[index] = p;

    return true;
}

// Lookup a person in the hash table by name
person* hash_table_lookup(char *name) {
    int index = hash(name);
    person *tmp = hash_table[index];
    while (tmp != NULL && strncmp(tmp->name, name, MAX_NAME) != 0) {
        tmp = tmp->next;
    }
    return tmp;
}

// Delete a person from the hash table by name
bool hash_table_delete(char *name) {
    int index = hash(name);
    person *tmp = hash_table[index];
    person *prev = NULL;

    while (tmp != NULL && strncmp(tmp->name, name, MAX_NAME) != 0) {
        prev = tmp;
        tmp = tmp->next;
    }

    if (tmp == NULL) return false;

    if (prev == NULL) {
        hash_table[index] = tmp->next;
    } else {
        prev->next = tmp->next;
    }

    return true;
}

```

When a collision occurs, here we use closed addressing (i.e. a linked list) to solve the problem. The concrete implementation is as follows:

Linked List:

Each person struct contains a next pointer to form a linked list.
**Each slot of the hash table (`hash_table[index]`) is the head pointer of a linked list.**

- Insert operation:

The `hash_table_insert` function, after computing the index, inserts the new person at the head of the linked list at the corresponding index.

- Lookup operation:

The `hash_table_lookup` function traverses the linked list at the given index, looking for a person with a specific name.

- Delete operation:

The `hash_table_delete` function finds and deletes a specific person in the linked list at the given index, while maintaining the linked list's structure.
This implementation uses a linked list to solve the hash collision problem in a hash table, ensuring that insertion, lookup, and deletion still work correctly when a collision occurs.

# Reference

[1] https://medium.com/@ralph-tech/%E8%B3%87%E6%96%99%E7%B5%90%E6%A7%8B%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E9%9B%9C%E6%B9%8A%E8%A1%A8-hash-table-15f490f8ede6
[2] https://hackmd.io/@coherent17/Sk4fomSkt#%E9%9B%9C%E6%B9%8A%E8%A1%A8Hash-table
[3] https://blog.techbridge.cc/2017/01/21/simple-hash-table-intro/
[4] https://haogroot.com/2022/06/19/how-to-design-hash-table/
