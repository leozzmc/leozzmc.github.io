---
title: 最長連續序列 | Medium | LeetCode#128. Longest Consecutive Sequence
tags:
  - Array
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 5405cff7
date: 2024-12-19 21:51:15
cover: /img/LeetCode/128/cover.png
---

# 題目敘述

![](/img/LeetCode/128/question.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給定一個未排序的整數陣列 `nums`，請回傳它元素的最長度序列， **本題要求實踐出的演算法複雜度為 $O(n)$**

# 解法

## 一開始的想法

雖然這題的 tag 在 LeetCode 裡面是有 hash table，但其實這題應該可以不用到它，我的想法是 **既然是未排序，但又要找連續序列，那就將它排序再迭代去檢查就好。**

## 我的解法

```c++
class Solution {
public:
    int longestConsecutive(vector<int>& nums){
        if(nums.empty()) return 0;
        if(nums.size()==1) return 1;

        int counter = 1;
        int maxValue = 1;
        sort(nums.begin(), nums.end());
        for(int i=1; i<nums.size();i++){
            if(nums[i]-nums[i-1] == 0) continue;
            if(nums[i]-nums[i-1] == 1){
                counter++;
            }
            else{
                counter = 1;
            }
            maxValue = max(maxValue, counter);
        }

        return maxValue;
    }
};
```

除了 `nums` 為空或者只有一個元素的狀況之外，我們先將 `nums` 排序，排序完畢後就迭代它，從 `i=1` 開始如果跟前一個元素相等就跳過這輪，如果相差一那就代表為連續序列，將 `counter` 加一，如果相差不為一，那就將 `counter` 回到原本的 1，每迴圈中都可以去計算當前的　`counter` 值是否是最大值，將最大 `counter` 值保存到 `maxValue` 最後回傳即可。

### 執行結果

![](/img/LeetCode/128/result.jpeg)


> 但其實這樣的複雜度會是 $O(n \cdot log(n))$，因此換成別種做法!

## 另一種做法

**另一種做法就是使用 `unordered_set`，這種方法不需要排序，只需用集合檢查每個數是否是連續序列的起點：**

```c++
int longestConsecutive(vector<int>& nums){

    int maxValue = 0;
    unordered_set<int> uset(nums.begin(), nums.end());
    for(int num: uset){
        if(uset.count(num-1)== 0){
            int counNum =num; 
            int counter=1;
            
            while(uset.count(counNum+1)){
                counNum++;
                counter++;
            }
            maxValue = max(maxValue, counter);
        }
       
    }
    return maxValue;

}
```

> 在 `unordered_set` 中，可以透過 `count` 方法來確認集合中的元素是否存在，如果存在就回傳1，不存在就回傳 0

首先程式定義了一個 `unordered_set` 其中元素為 `nums`　中的非重複元素。　接著迭代`uset`，`f(uset.count(num-1)== 0)` 這裡是要確定元素是否是序列起點，舉例來說


```
vector<int> nums = {100, 4, 200, 1, 3, 2};

100是序列起點，但後續沒有連續數字，序列長度為 1
4 不是序列起點，因為 3 存在於集合中。
200 是序列起點，但後續沒有連續數字，序列長度為 1
1 是序列起點，連續序列為 {1, 2, 3, 4}，序列長度為 4
```

如果當前元素是序列起點，接著就從起點開始，檢查序列中的後續數字是否存在，並計算當前序列長度

```c++
while (numSet.count(currentNum + 1)) {
    currentNum++;
    counter++;
}
```

計算長度結束就可以更新最大值 (`maxValue = max(maxValue, counter);`)，最後回傳即可。


> 其實這是我第一次使用 `unordered_set`，可以參考一下 [這篇](https://shengyu7697.github.io/std-unordered_set/) 來了解使用方法

# 複雜度

時間複雜度: $O(n \cdot log(n))$
時間複雜度(使用 `unordered_set`): $O(n)$

空間複雜度: $O(1)$
空間複雜度(使用 `unordered_set`): $O(n)$

---
