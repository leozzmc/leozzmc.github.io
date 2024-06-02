---
title: 刷題必備神器 | 雜湊表 (Hash Table) | LeetCode 筆記
toc: true
tags:
  - hash table
  - complexity
  - LeetCode
categories: LeetCode筆記
aside: true
abbrlink: ef71152b
date: 2024-05-30 22:51:40
cover: /img/pepe.jpg
---


# 基本介紹 

雜湊表是一種 Key Value Mapping 的結構，可以用快速查找資料，相較於一般搜尋演算法的時間複查度 $O(Log n)$ 他時間複雜度會是 $O(1)$

主要神速的原因是因為 Hash Function，如果先把 n 個數字儲存在 Hash Table 裡面，那如果要判斷這個數字 A 是不是已經被存在 Hash Table 裡面，只要先把這個數字丟進 hash function，就可以直接知道 A 對應到 Hash Table 中哪一格。


### Hash Table 不適合使用的時機

- 資料有處理上的時間優先順序，這種比較適合 Queue (FIFO)的結構
- **如果資料想要被排序，那也不適合用 Hash Table**
    - https://www.reddit.com/r/learnprogramming/comments/29t4s4/when_is_it_bad_to_use_a_hash_table/

### Hash Table 適合的使用條件

- 題目要求使用時間複雜度 $O(1)$  的演算法來存取元素
- 最糟的狀況也有 $O(n)$ 時間複雜度

# Hash Function

一個 hash function 要成立會有三中條件

1. hash function 計算出來的值是非負整數
2. 如果 key1 = key2 ，則 `hash (key1) = hash (key2)`
3. 如果 key1 ≠ key2 ，則 `hash (key1) ≠ hash (key2)`

需要要注意的點是，在多筆資料放在同個空間容易發生**碰撞(collision)**，**load factor** 就是用來衡量碰撞發生的因子
    - $load factor = n / m$
    - $n$  =  輸入資料個數
    - $m$ =  雜湊表的大小
    - 如果 $load factor > 1$ 則很可能發生碰撞
        - https://zh.wikipedia.org/wiki/鴿巢原理
        - 白話文解釋就是如果 n > m 那必定有資料要跟別的資料住在同個桶子裡

## Hash Function 的實作方式 （除法, 儲存方式用陣列）

首先可以定義每筆資料在雜湊表中的索引值 (index)

```c
index = key % m        // 0 <= index < m 
```

範例:

```
A ( Key = 11324)

B ( Key = 6356)

C ( Key = 345)

D ( key = 4171 )
```

M (雜湊表大小)= 6, 則雜湊表的 index 會如下：

```
Index of A :  11324 % 6 = 2

Index of B:   6356 % 6 = 2

Index of C:  345 % 6 = 3

Index of D: 4171 % 6 =1
```

可以發現到 A 與 B 發生碰撞，這會與 m  的選擇有關，m 的選擇要盡可能元離 $2^p$  越遠越好

![](/img/LeetCode/HashTable/hashtable.drawio.png)

### Hash Function的實作 （乘法, 儲存方式用陣列）

$index = [ m \cdot ((key \cdot A) \mod 1) ]$

$0 ≤  index < (m-1)$


步驟：

- Key 乘上一個小於 1 的無理數，即 Ａ， A 通常會選擇  $\frac{\sqrt5 -1}{2}$  ，乘完後會得到一個更大的無理數
- 將這個無理數去跟 1 取餘數，這麼做也會將無理數的整數部分去除，僅剩下小數
- m 乘上小數，這一步會得到一個 $0$ 與 ($m-1)$ 之間 的 無理數
- 透過高斯符號對無理數去取整數
    - https://zh.wikipedia.org/wiki/取整函数


> 下面的圖講解得挺好
> 圖來源: https://medium.com/@ralph-tech/%E8%B3%87%E6%96%99%E7%B5%90%E6%A7%8B%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E9%9B%9C%E6%B9%8A%E8%A1%A8-hash-table-15f490f8ede6


![](/img/LeetCode/HashTable/hashfunction.png)

這麼繁瑣求 index 的方法有什麼優點：

- 沒有 m 要遠離 $2^p$ 的限制
- 可以提高隨機性

# 如何處理尋址衝突？

## 1.  Seperate Chaining / Close Addressing 

在每個儲存空間中再生成新的鏈狀儲存空間，可以用 Linked List 或者是 Array 來實現

![](/img/LeetCode/HashTable/hashtable-linkedlist.png)


由於需要額外的指標，如果存儲的資料大小小於一個指標，那麼使用鏈結串列會消耗雙倍的記憶體來存儲資料。然而，如果要存儲的資料遠大於一個指標的大小，指標的額外消耗就可以忽略不計了。事實上，我們可以對鏈結串列進行改造，讓其後端結合紅黑樹、跳表等資料結構，這樣最終 Hash Table 的查找時間只需要 $O(log n)$

這種結構適合存儲大量資料且每筆資料較大的情況，而且它還支持更多樣的優化策略，可以結合紅黑樹等一起使用。

## 2. Open Addressing

Open Addressing 主要透過 **probing** 的方式來尋找未儲存資料的空間，可以分成：

- Linear Probing
- Quadratic probing

### Linear Probing

遇到衝突時，檢查下一個索引位置是否空閒，如果是空的就放入資料，如果不是就繼續往下找。當要尋找元素時，如果遇到衝突，也需要向後搜尋，直到找到一個空的位置才停止搜尋。

**缺點**：Hash Table 支援刪除操作，但被刪除的元素需要標記，否則直接刪除會導致後續的搜尋過程被中斷。

### Quadratic probing

可以用來解決 Linear Probing 效率低，Linear Probing 在插入元素多的時候，在尋址時也會效率緩慢

```c
hash(key)+1, hash(key)+2, hash(key)+3,…..hash(key)+n
```

所以在 Quadratic probing 的時候將尋址方式改成：
```c
hash(key)+ 1^2 , hash(key)+ 2^2, hash(key)+3^2
```
每次都增加 `n^2` 來找空位址

### Double hashing

另外，若有衝突發生，也可以直接再跑另一個 Hash Function，也就是當衝突發生時，**持續進行hash 直到衝突結束**

$index_{n} = F_{1}(k) + (n-1)* F_{2}(k)$ 直到找到最後的 index為止

### 開放尋址法的優缺點：

**優點：**

Open addressing 方法不使用鏈結串列，所有資料都存放在 Array 中，有助於通過快取加快存取速度。

**缺點：**

刪除資料較為麻煩，需要特別標記要刪除的數據。
所有資料都存放在同一個 hash table 中，發生衝突的代價較高，因此 load factor 不宜太高，這使得這種方法比較浪費記憶體。

# Hash Table 實作

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

如果使用 C++　STL 再刷題時會方便更多:

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

## 添加碰撞處理

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

當發生碰撞時，這裡使用 close addressing (即 linked list) 來解決問題。具體實現如下：

Linked List：

每個 person 結構中包含一個 next 指標，以形成 linked list。
**Hash Table 的每個槽 ( `hash_table[index]` ) 都是一個 linked list 的 Head Pointer。**

- 插入操作：

`hash_table_insert` 函數在計算出索引後，將新的 person 插入到對應索引的 linked list 的頭部。

- 查找操作：

`hash_table_lookup` 函數 traverse 指定索引的 linked list，查找特定名稱的 person。

- 刪除操作：

`hash_table_delete` 函數在指定索引的 linked list 中查找並刪除特定的 person，並維持 linked list 的結構。
這樣的實現方法使用了 linked list 來解決 Hash Table 中的哈希碰撞問題，保證在發生碰撞時依然能正確地插入、查找和刪除資料。

# Reference

[1] https://medium.com/@ralph-tech/%E8%B3%87%E6%96%99%E7%B5%90%E6%A7%8B%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E9%9B%9C%E6%B9%8A%E8%A1%A8-hash-table-15f490f8ede6
[2] https://hackmd.io/@coherent17/Sk4fomSkt#%E9%9B%9C%E6%B9%8A%E8%A1%A8Hash-table
[3] https://blog.techbridge.cc/2017/01/21/simple-hash-table-intro/
[4] https://haogroot.com/2022/06/19/how-to-design-hash-table/