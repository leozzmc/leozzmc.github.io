---
title: LRU 快取 | Medium | LeetCode#146. LRU Cache
tags:
  - Linked List
  - Hash Table
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: d5aafc8e
date: 2025-01-08 08:52:19
cover: /img/LeetCode/146/cover.png
---


# 題目敘述

![](/img/LeetCode/146/question.jpeg)

- 題目難度： `Medium`
- 題目描述： 題目要求設計一套結構能夠滿足 [LRU(Least Recently Used) Cache])(https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU)

{% note info %}
題目要求實踐 `LRUCache` class：
- `LRUCache(capacity)`: 使用 `capacity` 初始化 LRUCache 大小
- `int get(int key)`: 如果 `key` 存在，則返回對應的值，若不存在則返回 -1
- `void put(int key, int value)`: 如果 `key` 存在，則更新它的值，否則添加 `key-value` pair 到 cache。若 key 的數量車超出 `capacity` 大小，則逐出最近最少使用的Key
{% endnote %}


# 解法

## 一開始的想法

這題因為很偏系統設計，所以剛接觸的時候反而沒太多想法，可以知道的是大多做法都是使用 **doubly linked list 搭配 Hash Table 去進行實作** ，而為什麼要是這樣做，主要是因為這個結構在搜尋特定的 key 是否存在這樣可以達到 $O(1)$ 的時間複雜度，而如果用 Queue 或是Stack 這種只能單向進出的結構，會讓搜尋時的複雜度提高到 $O(n)$
 
![](/img/LeetCode/146/LRU.png)

## 我的解法

```c++
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

class Node {
    public:
        int key, value;
        Node *next, *prev;
        Node(): key(0), value(0) {
            next = nullptr;
            prev = nullptr;
        };
        Node(int k, int v) : key(k), value(v){
            next = nullptr;
            prev = nullptr;
        };
         Node(int k, int v, Node *nNode, Node *pNode) : key(k), value(v){
            next = nNode;
            prev = pNode;
        };
};

class LRUCache {
    private:
        int capacity;
        Node *front, *tail, *currentPtr;
        unordered_map<int, Node*>  cacheMap; // {Key, Node}
       
        void moveToFront(Node* node){
           if(node == front) return;

           node->prev->next = node->next; // skip current node, link the previous node's next to current node's next node
           if(node->next) node->next->prev = node->prev; // skip current node, link the next node's prev to current node's prev node
           else tail = node->prev; // if current node's tail node, then update tail pointer to the previous node

           node->next = front; // Insert current node to the front
           node->prev = nullptr;
           front -> prev = node; // Update front pointer
           front = node;
        };

        // Remove the lease recent use entry from the cache
        void removeTail(){
            if(tail==nullptr) return;


            //update cacheMap
            cacheMap.erase(tail->key);
            //updae pointers
            if(tail->prev){
                tail = tail->prev;
                tail->next = nullptr; 
            }
            else{
                front = tail = nullptr;
            }
        };  

    
    public: 
        LRUCache(int cap) : capacity(cap), front(nullptr), tail(nullptr) {};

        int get(int key) {
            if(cacheMap.find(key) != cacheMap.end()){
                Node *node = cacheMap[key];
                //update cache
                moveToFront(node);
                return node->value;
            }
            else return -1;
        }
        
        void put(int key, int value) {
            if(cacheMap.find(key) != cacheMap.end()){
                Node *node = cacheMap[key];
                node->value = value;
                moveToFront(node);
            }
            else{ // Update to cache (1) Check if cache is full (2) add to cache
                Node *newData = new Node(key, value);
                if(cacheMap.size() == capacity){
                    removeTail(); // Remove least recently used node
                }

                if(front==nullptr){
                    front = tail = newData;
                }
                else{
                    newData->next = front;
                    front->prev = newData;
                    front = newData;
                }

                //update cache map
                cacheMap[key] = newData;
            }
        }
};


int main(){

    LRUCache cache(2); // Capacity = 2
    cache.put(1, 1);
    cache.put(2, 2);
    cout << cache.get(1) << endl; // Returns 1
    cache.put(3, 3);              // Evicts key 2
    cout << cache.get(2) << endl; // Returns -1 (not found)
    cache.put(4, 4);              // Evicts key 1
    cout << cache.get(1) << endl; // Returns -1 (not found)
    cout << cache.get(3) << endl; // Returns 3
    cout << cache.get(4) << endl; // Returns 4

    return 0;
}
```

這裡先定義用於作爲 Cache 結構的 doubly-linked list，需要先宣告 Node 的結構，這裡定義了一個 `Node` class，首先需要定義用於保存資料本身的 `key` 與 `value` ，接著定義指標，每個節點都需要指向其前一個節點與後一個節點，因此需要 `*prev` 和 `*next`。 然後就用 constructor 去定義當物件被初始化後的行為。

```c++
class Node {
    public:
        int key, value;
        Node *next, *prev;
        Node(): key(0), value(0) {
            next = nullptr;
            prev = nullptr;
        };
        Node(int k, int v) : key(k), value(v){
            next = nullptr;
            prev = nullptr;
        };
         Node(int k, int v, Node *nNode, Node *pNode) : key(k), value(v){
            next = nNode;
            prev = pNode;
        };
};
```

接著就需要定義 `LRUCache` class 內部的實作，需要先定義出 Cache 的雛形，以下是變數說明

`int capacity` 為 Cache 的容量大小

`Node *front, *tail, *currentPtr` 宣告指標用來指向 doubly-linked list 當中的頭部，尾端，以及當前節點 `*currentPtr`

`unordered_map<int, Node*> cacheMap` 用來儲存 key-node pair，可以用來判斷資料是否有存取過


結著需要定義 Doublylinked list 的行為， **LRU Cache 的特性是最常使用的的資料會被移動到 Front(Head) 而最少被使用的資料會移動到 Tail，當資料數量超出快取容量時，Tail會被逐出** ，所以對應這個特性我們定義出兩個函數 `moveToFront` 以及 `removeTail` ，這裡介紹這兩個函數：

```c++
void moveToFront(Node* node){
    if(node == front) return;

    node->prev->next = node->next; // skip current node, link the previous node's next to current node's next node
    if(node->next) node->next->prev = node->prev; // skip current node, link the next node's prev to current node's prev node
    else tail = node->prev; // if current node's tail node, then update tail pointer to the previous node

    node->next = front; // Insert current node to the front
    node->prev = nullptr;
    front -> prev = node; // Update front pointer
    front = node;
};
```

首先排除了單一節點的狀況，之後如果要將一個節點從一個 doubly-linked list 移動到他的頭部，需要將他上一個節點的 `next` 接到當前節點的下一個節點 (`node->prev->next = node->next`)，另外當前節點的下一個節點的 `prev` 需要接道當前節點的上一個節點 (`node->next->prev = node->prev`)。而如果當前節點正好就是 `tail` 那就將 `tail` 指標 update 成前一個節點。


![](/img/LeetCode/146/double.png)

接著要去將當前節點移動到頭部，這時需要將當前節點的 `prev`指向 `null` 並且當前節點的 `next` 要先指到當前 `front` 節點，而 `front` 節點的 `prev` 會是我們新節點，最後再更當前節點為新的 `front`


```c++
void removeTail(){
    if(tail==nullptr) return;


    //update cacheMap
    cacheMap.erase(tail->key);
    //updae pointers
    if(tail->prev){
        tail = tail->prev;
        tail->next = nullptr; 
    }
    else{
        front = tail = nullptr;
    }
};  
```
`removeTail` 的部分，一樣如果當前沒有 `tail` 則返回，而移除步驟要先將 Hash Table 中對應的 TailEntry 移除，可以透過 `unordered_map` 中的 `erase` 方法來實現。而當接著要處理鏈結的部分，如果並非單一節點，則 `tail-prev` 存在，這樣就需要將當前的 tail 節點的前一個節點更新為新的 `tail` (`tail = tail->prev`) 而新的 `tail`節點的 `next` 就會是 `nullptr` 而如果是單一節點的狀況，那 `front` 與 `tail` 都會被移除，因此直接指定為    `nullptr`


定義好 Cache 本身的更新行為後，可以來定義客戶端呼叫Cache 可以用的方法 `get` 和 `put`


```c++
int get(int key) {
    if(cacheMap.find(key) != cacheMap.end()){
        Node *node = cacheMap[key];
        //update cache
        moveToFront(node);
        return node->value;
    }
    else return -1;
}
```

`get` 行為會先去從 Cache 中查看對應的值是否存在，這就是查找Hash Table `cacheMap` 如果有找到值，就透過一個指標 `*node` 指向該值在Table 中保存的記憶體位址 (`Node *node =cacheMap[key]`)，由於每次存取，節點都需要移動到 front，因此呼叫 `moveToFront` 方法，並且返回該 `node` 的 `value` 而若是沒在 cache 中找到為應資料就回傳 -1。

```c++
void put(int key, int value) {
    if(cacheMap.find(key) != cacheMap.end()){
        Node *node = cacheMap[key];
        node->value = value;
        moveToFront(node);
    }
    else{ // Update to cache (1) Check if cache is full (2) add to cache
        Node *newData = new Node(key, value);
        if(cacheMap.size() == capacity){
            removeTail(); // Remove least recently used node
        }

        if(front==nullptr){
            front = tail = newData;
        }
        else{
            newData->next = front;
            front->prev = newData;
            front = newData;
        }

        //update cache map
        cacheMap[key] = newData;
    }
}
```

`put` 的部分，如果要insert資料，但是對應的資料已經存在於 Cache 中，則一樣需要將該值進行更新，這裡一樣宣告一個指標來存取該節點 (`Node *node = cacheMap[key]`) 並且更新該節點的值 (`node->value = value`)然後因為有存取行為，所以還是要將該節點移動到 front (`moveToFront(node)`)。

然而如果要插入的Key-value pair 不存在於 cache中，就需要去建立新的節點 (`Node *newData = new Node(key, value)`)  然而再插入節點前需要先檢查Cache 容量是否足夠，一旦到達容量上限就需要去騰出空間，需要將最少使用的資料逐出 (`removeTail();`)，另一種狀況是今天Cache 是空的，要被插入的資料會是第一筆資料，這時候就需要將 `front` 跟 `tail` 更新為 `newData` 其餘多節點的狀況就比較單純了，需要將新資料差入到 front ，所以新資料的 `next` 需要指向當前得 `front` 然後當前 `front` 的前一個節點要指向新插入資料 （` front->prev = newData;`） 最後再將新資料更新為新的 `front` 。此外也需要將將 Hash Table 添加新資料  `cacheMap[key] = newData;`。

> 這樣就完成了一套基本的 LRU 系統

### 執行結果

![](/img/LeetCode/146/result.jpeg)

# 複雜度

| 方法  | 時間複雜度 | 空間複雜度 | 複雜度分析說明                                     |
|-------|------------|------------|---------------------------------------------------|
| `get` | $O(1)$       | $O(1)$       | 使用Hash Table（`unordered_map`）透過鍵直接存取對應節點，實現常數時間的操作 |
| `put` | $O(1)$       | $O(1)$       | 新增與刪除操作均透過哈希表與雙向鏈表完成，每次插入或刪除節點的操作時間為常數級別 |
| 總體  | $O(1)$       | $O(n)$       | Hash Table儲存鍵值對，雙向鏈表用於維護最近使用順序，空間複雜度與緩存容量成正比 |

---