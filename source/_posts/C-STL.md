---
title: C++ 刷題利器 - STL (Standard Template Library) | LeetCode
description: 這篇主要是來記錄學習STL，並且在刷題過程中方便查找好用的STL的筆記
toc: true
tags:
  - C++
  - LeetCode
  - STL
categories: LeetCode筆記
aside: true
abbrlink: efa232a7
date: 2024-06-18 22:56:42
cover: /img/LeetCode/C++_STL/cover.jpg
---

# 甚麼是 STL (Standard Template Library)?

在 C++ 中，STL即為一群容器(Container)的集合，不同容器可以實現不同的資料結構，其實是大量使用了 C++中的 Template 來去實現的。
透過該資料結構實現出演算法，STL還提供對於容器的操作，不同資料結構的容器分別也有不同的操作方式。

> Template 簡單來說就是定義好結構，並且可用於不同的資料型別上，例如我寫了一個陣列的Template，但它可以是 int[], float[], double [] 或者是 char []
> `template <typename T>` 通常可以這樣來定義 Template ，通常使指角括號內的東西，可以想像成compiler 幫你做複製貼上


# STL 元件

主要有6大個元件:

- 容器 (Container)
- 演算法 (Algorithm)
- 迭代器（Iterator）
- 仿函數（Function object）
- 適配器（Adaptor）
- 空間配置器（allocator）

> 對於刷題，最需要focus的重點會是容器和迭代器，另外還有algorithm，例如 `sort`，通常以 function 的形式存在，多是一次性的計算，但Leetcode中大多需要自己實作，因此不細談

# STL 容器

**container 通常是屬於資料結構的部份，以變數的方式存在，可持續地互動與維護資料**

![](/img/LeetCode/C++_STL/containers.jpg)


其中Leetcode 能使用的容器類型有: **Vector**, **List**, **Stack**, **Queue**, **PriorityQueue(Binary Heap)**, **Set/MultiSet**, **Unorder Set**, **Map/MultiMap**, **Unorder Map**

# STL 迭代器

**iterator 用來依序拜訪一個 container 的所有元素，也用以指稱 container 中的特定元素，可表達搜尋結果或者範圍的端點**

下面是範例

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main()
{
    int n, i;
    vector<int> v;
    while (cin >> n)
    {
        v.resize(n);
        for (i=0; i<n; i++)
        {
            cin >> v[i];
        }
        sort(v.begin(), v.end());
        for (vector<int>::iterator it=v.begin(); it!=v.end(); ++it)
        {
            cout << *it << "\n";
        }
    }
    return 0;
}
```
> 取自: https://hackmd.io/@sa072686/cp/%2F%40sa072686%2FS11uDpiuH


可以看到在`for` 迴圈內可以使用 `vector<int>::iterator` 來去宣告一個迭代器 `it`，並且它會從 vector 的首端開始，若不等於尾端則+1；

這裡可以觀察到幾個重點:
1. iterator 的宣告方式是 `容器類型::iterator`
2. iterator 支援 `++` 或 `--` 運算
3. **支援 iterator 的 container，基本都能用 `.begin()` 取得最初的元素，`.end()` 取得最後的元素的再下一個位置，是個不存在的空位，符合 STL 左包含、右不包含的規則**
4.  透過取值運算子 `*` 可以取得iterator目前位址的值

> 大多數的時候，把它理解為指標是沒有問題的（指標是迭代器的一個特例，它也屬於迭代器）

## auto 自動型別判別

上面的範例會發現一件事，就是宣告 iterator的時候真的長度很長，因此有個偷懶作法就是透過 `auto` 來讓compiler來進行自動型別判別，**compiler 會依據初始值的型別來決定變數的型別**

可以將for迴圈改成下面這樣

```cpp
vector<int> v;
for (auto it=v.begin(); it!=v.end(); ++i){
  //...
}
```

對於 `vector` 來說，這算是一種random access 的 iterator，甚麼事random access?

## Random Access

**若一個 container 可以在 $O(1)$ 複雜度進行存取，則它就具有 random access 的特性**

如果是為了刷題，會使用到的迭代器也隨著容器種類有所不同，可以參考下面表格

|Iterator Type| Description |Container|
|-------------|-------------|---------|
|Bidirectional iterator|Read and Writes forward and backward|list,set,multiset,map,multimap|
Random access iterator|Read and Write with random access|vector,deque,array,string|



# 常見 STL 容器
## Vector

可以想成是一個動態的陣列

- 可以在 $O(1)$ 時間內存取跟修改元素
- 在集合的中間修改元素會是 $O(n)$，**一般建議將要刪除的值先swap到最後，然後再刪除。**

```cpp
# include <vector>
```

### Vector 初始化
```cpp
// 宣告一個 int vector
vector<int> v;

// 宣告一個長度為N的 T型別的 Vector
vector<T> v(n);

// 宣告一個長度為N的 int Vector，並且初始化成 0
vector<int> v(n,0);

// 將set中的資料初始化成 vector
vector<T> v(s.begin(), s.end());

//Subvector
vector<T> sub(v.begin(),v.begin()+5);

//2維Vector
vector<vector<T>> v2d;

//宣告一個2維Vector，大小為 nxm
vector<vector<T>> v_2d1(n, vector<T>(m));
```

### Vector 常見操作

```cpp
v.empty();
v.size();
v.front();
v.back();

v.push_back();    // 將obj推到vector的最後端
v.pop_back();  // 將vector的最後端obj移除
v.insert();      // 插入到指定位置
v.insert(v.begin(), target); // 加入target到最前面
v.insert(v.begin() + n, target); // 加入taret到任意位置, n <= v.size()
v1.insert(v1.end(), v2.begin(), v2.end()); // 將 v2 插入到 v1 的最尾端
v.reverse(first, last); // 反轉vector從first到last
v.erase();  // 移除某個指定位置element
v.clear();       // 清除全部element
```
最後面的 `v.erase()`，其實如果不在乎順序的話可以改成使用

```cpp
swap(v[n], v.back()); // 交換n和最後一個位置
```

剩下還有一些操作

```cpp
// Traversal
for(int i = 0; i < v.size(); ++i) {
    cout << v[i] << endl;
}

auto it = find(v.begin(), v.end(), val); // 尋找第一個val出現的位置。
v.count(v.begin(), v.end(), val); // 計算範圍內val出現的次數
```

Traversal 還可以寫成下面的形式，但這個就會提到 Iterator，稍後會提到。
```cpp
for(auto it = v.begin(); it != v.end(); ++it) {
    cout << *it << endl;
}
```

## List

移動或是刪除等操作都是 $O(1)$

```cpp
#include <list>
```

```cpp
// delcare list container
list<int> l;
```

常見操作:

```cpp
l.empty();
l.size();
l.push_back();
l.pop_back();
l.push_front();
l.pop_front();
```

將一個list中的值移到另一個list中
```cpp
l.splice(iterator pos, list& x); // 把x所有的element接到l中pos的位置。
l.splice (iterator pos, list& x, iterator i); // 把i單一個element從x中搬移到l中pos的位置。
l.splice (iterator pos, list& x, iterator first, iterator last); // 把x中從first到last的element搬到l中pos的位置。
```

## Stack

特性: LIFO(Last-In-First-Out)，	Stack是object的有限序列，並滿足序列中被刪除、檢索和修改的項只能是最近插入序列的obj

```cpp
#include <stack>
// declare a stack
stack<T> s;
// 常用function
s.empty(); //測試堆疊是否為空。若為空回傳 true，反之 false。
s.size(); //回傳目前堆疊中有幾個元素。
s.push(); //在堆疊中加入一個元素。
s.pop(); //移除目前堆疊中最上層元素
s.top(); //取得目前堆疊中最上層元素
```

## Queue

特性: FIFO(First-In-First-Out)，所以插入只可以在尾部進行，刪除、檢索和修改只允許從頭部進行。

```cpp
#include <queue>
// declare a queue
queue<T> q;
// 常用function
q.empty(); //測試佇列是否為空。若為空回傳 true，反之 false。
q.size(); //回傳目前佇列中有幾個元素。
q.push(); //在佇列中加入一個元素。
q.pop(); //移除目前佇列中最前端元素 (即最早進入佇列的元素)。
q.front(); //取得目前佇列中最前端元素的 reference
```

## PriorityQueue

其實就是 **heap** 結構，常用於Dijkstra 演算法中

```cpp
#include <queue>
// declare a priorityqueue
priority_queue<T> pq;    // 預設為最大在上面
priority_queue<T, vector<T>, greater<T> > pq;  //改成由小排到大
// 自己定義compare function
// 從小排到大，與sort的cmp相反
auto cmp = [](int& a, int& b) {
        return a > b;
};
priority_queue<int, vector<int>, decltype(cmp)> pq(cmp);
// 常用function
pq.empty(); //測試優先佇列是否為空。若為空回傳 true，反之 false。
pq.size(); //回傳目前優先佇列中有幾個元素。
pq.push(); //在優先佇列中加入一個元素。
pq.pop(); //移除目前優先佇列中優先順序最高的元素。
pq.top(); //取得目前優先佇列中優先順序最高元素的 constant reference。
```
	
要注意的是，PQ 的 `pop` 跟 `push` 複雜度會是 $O(Log n)$

### make heap 操作

有個省空間的方法，就是透過 `make_heap` 來讓 vector 變成 heap，這樣空間複雜度會變成 $O(1)$

```cpp
vector<int> nums{1, 3, 5, 2, 4, 6};
make_heap(nums.begin(), nums.end()); // 預設是max-heap
make_heap(nums.begin(), nums.end(), less<int>()); // max-heap
make_heap(nums.begin(), nums.end(), greater<int>()); // min-heap

// pop，因為pop_heap只是把element往最後移動，
// 所以還要pop_back()
pop_heap(nums.begin(), nums.end()); // for max-heap
pop_heap(nums.begin(), nums.end(), greater<int>()); // for min-heap
nums.pop_back();

// push, 需要先把element放到最後
nums.push_back(val);
push_heap(nums.begin(), nums.end()); // for max-heap
push_heap(nums.begin(), nums.end(), greater<int>()); // for min-heap

// sort_heap
sort_heap(nums.begin(), nums.end()); // 升序排序
sort_heap(nums.begin(), nums.end(), greater<int>()); // 降序排序
```

## Set 和 MultiSet

Set 就是集合
![](/img/LeetCode/C++_STL/set.png)



預設set會從小到大排序，set容器裡面的元素是唯一的，具有不重複的特性
而 multiset可以允許元素重複。unordered_set 不排序的set。unordered_multiset 不排序的multiset。



```cpp

#include <set>
// declare a set
set<T> s;
set<T> s{1, 2, 3, 4, 5}; // with initial value
set<T> s(vector<T>);    // 可以輸入vector
set<T> s(vector.begin(), vector.end()); // import data from vector，方便查找資料
set<T,greater<T>> s2; // 從大排到小
multiset<T> st;

// 常用function
s.empty();
s.size();
s.insert();
auto it = s.insert(val); // 可以取得insert之後的位置
s.erase();    // 可以傳入key或是iterator, 如果傳入為key會刪除重複的key
//所以必須先使用find找出value的iterator，這樣才可以確保只刪除一個
s.erase(s.find(value));
s.clear();
s.count(); // 看看elemet有幾個，因為set只容許一個，所以等於是判斷有無。multiset會回傳個數。
s.find(); // 回傳iterator，所以還要判斷使否是s.end();
// convert set to vector
vector<T> v(s.begin(), s.end());
// Traversal
for(const auto& item : s) {    //宣告成const前提是不會在function內修改item的值。
    cout << item << endl;
}
for(auto it = s.begin(); it != s.end(); ++it){
    cout << *it << endl;
}
for (auto it = s.rbegin(); it != s.rend(); ++it) {
    cout << *it << endl;
}
// 取第一個和最後一個element
cout << *s.begin() << endl;    // 取第一個element的值
cout << *s.rbegin() << endl;   // 取最後一個element的值，不可以直接使用end()
cout << *(--s.end()) << end;   // 必須使用end()的前一個

```

## Map 和 MulitMap

Map 就像是一個對應表，使用key-value pair 來去實現一對一的映射關係
![](/img/LeetCode/C++_STL/map.png)


- 預設也是從小到大排序
- multimap 允許多個相同的key-value pair。
- unordered_map 不排序的map。
- unordered_multimap 不排序的multimap。


簡單範例:
```cpp
#include <map>
using namespace std;

int main(){
    map<string, int> m;     // 從 string 對應到 int

                        // 設定對應的值
    m["one"] = 1;       // "one" -> 1
    m["two"] = 2;       // "two" -> 2
    m["three"] = 3;     // "three" -> 3

    cout << m.count("two") << endl;     // 1 -> 有對應
    cout << m.count("ten") << endl;     // 0 -> 沒有對應
}
```



```cpp
#include <map>
//declare a map
map<T, U> m;
map<T, U, greater<T>> m; // 從大排到小
// 常用function
m.empt();
m.size();
m.insert();
m.erase();  // 刪除element
m.clear();  // 清空所有的element
m.count();  // 回傳有幾個element
m.find();   // 回傳iterator
m.swap(x);  // 把m和x的資料交換，m和x必須一樣的type
// Traversal by reference
for (const auto& item : m) {
    cout << item.first << ":" << item.second << endl;
}
// Traversal by reference with name
for(const auto& [key, value] : m) {
    cout << key << ":" << value << endl;
}
// Traversal by iterator
for (auto it = m.begin(); it != m.end(); ++it) {
    cout << it->first << ":" << it->second << endl;
    // 使用prev()取得iterator的前一個
    cout << prev(it)->first << ":" << prev(it)->second << endl;
}
// 取第一個和最後一個element
cout << m.begin()->first << endl;    // 取第一個element的值
cout << m.rbegin()->first << endl;   // 取最後一個element的值，不可以直接使用end()
cout << (--m.end())->first << end;   // 必須使用end()的前一個
```


> map 的底層實現是用紅黑樹，因此它的對應都是按照key去做排序的，因此插入，查找，刪除等操作的複雜度都是 $O(Log n)$
> unordered_map 的底層實現則是用hash table，是無序的，因此複雜度會是 $O(1)$

使用unordered_map的時候，根據key產生出來的hash來查找value。既然是hash就會有碰撞問題
> As we know a Bucket is a slot in the container’s internal hash table to which all the element are assigned based on the hash value of their key . Buckets are numbered from 0 to bucket_count.

如果增加的數目超出bucket_count，map就會自動變大bucket_slot，並且重新計算所有item的hash。

> When the Load Factor(load_factor) reaches a certain threshold, the container increases the number of buckets and rehashes the map.

使用以下的程式碼，就是放大bucket到n，並且重新計算hash table。

```cpp
m.refresh(n);
```
如果我們事先知道大小可以使用以下function直接保留bucket到n，避免超出threshold需要放大container。因為事先保留了n個bucket也可以避免hash collision。

```cpp
m.reserve(n);
```




# 參考
[1] https://hackmd.io/@sa072686/cp/%2F%40sa072686%2FS11uDpiuH
[2] https://jasonblog.github.io/note/c++/stl_rong_qi_4e0029_-_ji_ben_jie_shao.html
[3] https://hackmd.io/@meyr543/BkgMaiV6Y#Vector
[4] https://blog.csdn.net/weixin_42292229/article/details/125523668
[5] https://ikaminyou.medium.com/leetcode-%E5%88%B71500%E9%A1%8C%E5%BF%83%E8%B7%AF%E6%AD%B7%E7%A8%8B-8614284f03da