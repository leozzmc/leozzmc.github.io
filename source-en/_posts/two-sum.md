---
title: Using a Hash Table | LeetCode#1 Two Sum
toc: true
tags:
  - Hash Table
  - LeetCode
  - Array
  - C
categories: LeetCode Notes
aside: true
abbrlink: "cb46ac9d"
date: 2024-05-31 23:04:03
cover: /img/LeetCode/Two_Sum/two_sum_cover.jpg
--- 

> 🌐 中文版：[繁體中文](/posts/cb46ac9d.html)

# Problem statement

![](/img/LeetCode/Two_Sum/two_sum_question.png)

The problem gives an integer array and an integer `target`, and asks us to find any two elements in the array that add up to `target` and return their indices. Also, each input array has exactly one output answer.

# Solution 1: brute force

As usual, we start with brute force: get a solution first, then see how to optimize later.


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

The core approach here is: **pick one element, compare it against another element, and see whether the sum is `target`.**

But doing this has a time complexity of $O(n^2)$.

Also, since the problem requires the returned array to be dynamically allocated, we must free the memory address at the end. `*returnSize` is used to tell the caller the size of the returned array. Since C doesn't support returning multiple values directly, the problem needs a pointer to modify an external variable, which lets us pass more information.


### Execution result:

![](/img/LeetCode/Two_Sum/two_sum_result-2.png)

# Solution 2: using a hash table


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

The main flow of the program is:
- Define the hashtable structure and the hashtable size
- Define the hash function
- Initialize the return array
- Initialize the hashtable
- Insert elements, first checking whether an element already exists at the index
    - When a collision happens, handle it with linear probing to find an empty slot
    - If no element exists, insert the element directly
- Free memory and return the result array

This approach is also called a **two-pass hash table**, mainly because it iterates twice: once to fill each element's value and index into the hashtable's key and value, and once to check whether each element's complement exists in the hash table.

This way, using a hash table, the runtime complexity can drop to $O(n)$. Looking up a hash table is actually $O(1)$, but accounting for possible collisions and the linear probing, the overall time complexity becomes $O(n)$.

![](/img/LeetCode/Two_Sum/two_sum_result.png)

# Reflection

When I was first implementing this, my original hashtable structure only defined

```c
typedef struct{
        int key;
        int value;
    } twosum;
```

and in the condition I used `while( hashtable[index].key != 0 || hashtable[index].value != 0 )`.

But later I found this had problems with certain test cases, like when `nums = [0,4,3,0]` and `target = 0`, there wouldn't be any output.

## Problem analysis

The reason is that when inserting into the hash table, taking the first element as an example, the key inserted into the hashtable would be 0. **But we defined the no-data state as 0 during initialization, and in the middle condition we also used 0 as the basis for judging whether a slot has a value.** So when the value we actually want to store is itself 0, there's a conflict. The subsequent fix was therefore to define a `hasData` field in the hashtable structure to judge whether data exists.

But doing this also has a downside: it increases the space complexity.

# Another solution: one-pass hash

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

Here we merge inserting into the hashtable and checking the complement into the same iteration. But since we still iterate over n elements, the time complexity is still $O(n)$.

> At this point I also started thinking about switching to C++ for LeetCode, lol. For a problem like this, C++ has a lot of handy STL like `unordered_map` you can use directly, without having to redesign much.

# C++ solution

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
