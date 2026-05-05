---
title: 應用 Hash Table | LeetCode#1  Two Sum
toc: true
tags:
  - Hash Table
  - LeetCode
  - Array
  - C
categories: LeetCode筆記
aside: true
abbrlink: cb46ac9d
date: 2024-05-31 23:04:03
cover: /img/LeetCode/Two_Sum/two_sum_cover.jpg
--- 

# 題目敘述

![](/img/LeetCode/Two_Sum/two_sum_question.png)

題目描述給定整數的陣列以及整數 `target` 值，請在陣列找到任兩元素相加等於 target，並且回傳元素的索引，另外對於每個輸入陣列只會有一組輸出答案。

# 解法-1: 暴力解

首先一樣從暴力解開始，先有解法，後續再看要怎麼優化


```c
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {

    int i, j;
    // init return array
    int* results = (int*)malloc(2 * sizeof(int));
    // i could not iterated to n-1, since every element is compared.
    for (i=0; i< numsSize-1; i++){ 
        for (j = i+1; j < numsSize; j++){ 
            if(nums[i] + nums[j] == target){
                results[0] = i;
                results[1] = j;
                *returnSize = 2;
                return results;
            }        
        }
    }
    // If no solution is found
    free(results); // Free the allocated memory before returning
    *returnSize = 0;
    return NULL;
}
```

這裡的核心做法為: **選擇一個元素，去比較另一個元素，看相加是否為 `target`**

但這麼做的時間複雜度為 $O(n^2)$

另外因為題目要求回傳陣列需要動態宣告，因此在結尾必須釋放記憶體位址 `*returnSize` 是用來告訴呼叫者返回的陣列的大小。由於 C 語言不支援直接返回多個值，題目需要指標來修改外部變數，這樣可以傳遞更多的資訊。


###　執行結果:

![](/img/LeetCode/Two_Sum/two_sum_result-2.png)

# 解法-2: 使用雜湊表(Hash Table)


```c
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */

 // Define hash 
int hash(int key, int size){
    return abs(key) % size;
}

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {

    // Define hash table structure.
    typedef struct{
        int key;
        int value;
        bool hasData;
    } twosum;

    int hashtableSize = numsSize * 2; 
    twosum* hashtable = (twosum*)calloc(hashtableSize, sizeof(twosum));

    // Initialize return array
    int* results = (int*)malloc(2 * sizeof(int)); 
    if (!results) return NULL; // Return NULL if memory allocation fails
    
    // init hash table
    for(int i=0;i<hashtableSize;i++){   
        hashtable[i].key=0;
        hashtable[i].value=0;
        hashtable[i].hasData = false;
    }
       
    // insert key to certain index.
    for (int i=0; i < numsSize; i++){
        // only needs to insert the complement number
        int complement = target - nums[i]; 

        int index = hash(complement, hashtableSize); 
        
        // Linear probing for searching empty slot
        while(hashtable[index].hasData ){
            // find target
            if ( hashtable[index].key == complement){
                results[0] = hashtable[index].value;
                results[1] = i;
                *returnSize = 2;
                free(hashtable);
                return results;
            }
            // try to find empty index.
            index = hash(index+1, hashtableSize); 
        }


        // insert current number
        index = hash(nums[i], hashtableSize); 
        while (hashtable[index].hasData) {
            index = hash(index+1, hashtableSize);
        }
        hashtable[index].key = nums[i]; 
        hashtable[index].value = i;
        hashtable[index].hasData = true;
        
    }

    free(hashtable);
    free(results);
    *returnSize = 0;
    return NULL;

}
```

程式的主要的流程為:
- 定義 hashtable 結構以及 hashtable 大小
- 定義 hash function
- 初始化回傳陣列
- 初始化 hashtable
- 插入元素，需要先判斷 index 內是否已經有元素存在
    - 發生碰撞時，透過 Linear Probing 來處理碰撞，找到空位址
    - 若無元素存在則直接插入元素
- 釋放記憶體，返回回傳陣列

這種作法又被稱為 **Two-pass Hash Table**，主要原因是他經過兩次迭代，一次將元素的值和索引填到 hashtable的 key跟value，另一次檢查每個元素的 complement 是否存在於 hash table 當中。

這樣透過雜湊表的執行時間複雜度可以降到 $O(n)$，其實查找Hash Table的時間複雜度會是 $O(1)$，但考量到碰撞可能發生，進行 Linear Probing，這會讓整體的時間複雜度變成 $O(n)$。

![](/img/LeetCode/Two_Sum/two_sum_result.png)

# 心得

原本在實作的時候，我原本的 hashtable 結構只有定義

```c
typedef struct{
        int key;
        int value;
    } twosum;
```

並且在判斷式是使用 `while( hashtable[index].key != 0 || hashtable[index].value != 0 )`

但後面發現對特定的測資會出現問題，像是 `nums = [0,4,3,0]` 並且 `target= 0`的時候，並不會有任何輸出出現

## 問題分析

原因是在插入hash table 的時候，以第一個元素為例，插入至hashtable的key會是 0，**但我們在初始化將沒有資料的狀況定義成0，並且在中間判斷式也以0作為有無值的判斷依據**，但在想要出儲存的值本身為 0 時，這樣會發生衝突，因此後續解法就是在 hashtable 的結構中定義一個 `hasData` 來判斷是否有資料存在。

但這麼做也有缺點，那就是增加了空間複雜度。

# 其他解法 - One Pass Hash

```c
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    struct hashTable {
        int key;
        int value;
        UT_hash_handle hh;
    } *hashTable = NULL, *item;

    for (int i = 0; i < numsSize; i++) {
        int complement = target - nums[i];
        HASH_FIND_INT(hashTable, &complement, item);
        if (item) {
            int* result = malloc(sizeof(int) * 2);
            result[0] = item->value;
            result[1] = i;
            *returnSize = 2;
            HASH_CLEAR(hh, hashTable);  // Free the hash table
            return result;
        }
        item = malloc(sizeof(struct hashTable));
        item->key = nums[i];
        item->value = i;
        HASH_ADD_INT(hashTable, key, item);
    }
    *returnSize = 0;
    HASH_CLEAR(hh, hashTable);  // Free the hash table
    return NULL;
}
```

這裡就是將插入 hashtable 和檢查 complement 併入同一個迭代中，但由於還是迭代了 n 個元素，因此時間複雜度一樣是 $O(n)$

> 這裡我也開始考慮改成學習使用 C++ 來刷題XD，C++ 像這種題目就有很多好用的 STL  `unordered_map` 能夠直接使用，不需要重新設計太多東西。

# C++ 的解法

```cpp
class Solution {
public:
    vector<int> twoSum(vector<int> &nums, int target) {
        unordered_map<int, int> hash;
        for (int i = 0; i < nums.size(); i++) {
            hash[nums[i]] = i;
        }
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (hash.find(complement) != hash.end() && hash[complement] != i) {
                return {i, hash[complement]};
            }
        }
        return {};
    }
};
```


