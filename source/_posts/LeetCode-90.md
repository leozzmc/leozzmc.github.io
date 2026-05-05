---
title: 子集問題ii | Medium | LeetCode#90. Subsets II
tags:
  - backtracking
  - recursion
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 80e799a5
date: 2024-10-13 16:05:33
cover: /img/LeetCode/90/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/90/question.jpeg)

- 題目難度: `Medium`
- 題目敘述：給定一個整數陣列 `nums`， 回傳所有可能的子集，回傳的子集不能重複，但可以任意順序排序

{% note info %}
這題是 [78.Subsets](https://leetcode.com/problems/subsets/description/) 的延伸題型，可以看我[這一篇解法](https://leozzmc.github.io/posts/3e4bf679.html)，但是這題不同的是，對於 `nums` 陣列中 `[2]` 是不等於 `[2,2]` 的，但 `[1,2]` 是等於 `[2,1]` 的，**也就是説對於個別子集來說，若相同元素但元素數量不同則看成不同子集**
{% endnote %}

# 解法

## 一開始的想法

我的想法就跟上一題差不多，只是想說在添加到回傳陣列時，額外進行檢查，踢除重複的子集。

## 我的解法

```cpp
class Solution {
public:
    vector<vector<int>> result;
    void subsetHelper(vector<int>&nums, vector<int> &cur, int depth){
        
        if(depth == nums.size()){
            for(int i=0; i< result.size(); i++){
                if(cur == result[i]) return;
            }
            result.push_back(cur);
            return;
        }
        
        //not pick
        subsetHelper(nums, cur, depth+1);

        //pick
        cur.push_back(nums[depth]);
        subsetHelper(nums, cur, depth+1);
        cur.pop_back();
    }


    vector<vector<int>> subsetsWithDup(vector<int>& nums){
        sort(nums.begin(), nums.end()); 
        vector<int> cur;
        subsetHelper(nums,cur,0);
        return result;
    }
};
```

這裡額外說明

```cpp
sort(nums.begin(), nums.end()); 
```

這段的作用是對輸入陣列進行排序，這對於處理重複元素非常重要，**一旦將輸入陣列排序後，所有重複的元素會相鄰排列。我們就可在遞迴處理時能夠輕鬆跳過這些重複元素。** 例如，如果輸入是 `[2,1,2]`，排序後會變成 `[1,2,2]`，這樣可以在遞迴中只選擇一組 `2`，而不會產生重複子集

如果沒排序產生的子集可能會像是下面這樣
```
[]
[2]
[1]
[2]
[2, 1]
[2, 2]
[1, 2]
[2, 1, 2]
```

而這裡再將子集加入到回傳陣列前，進行重複檢查

### 執行結果

這樣做的執行結果就很爛，畢竟每次產生一種子集前都需要進行 `result.size()` 次的運算 

![](/img/LeetCode/90/result1.jpeg)

## 更正後的解法

```cpp
class Solution {
public:
    vector<vector<int>> result;
    void subsetHelper(vector<int>&nums, vector<int> &cur, int depth){
        
        result.push_back(cur);

        
        for(int i=depth; i< nums.size(); i++){
            if (i > depth && nums[i] == nums[i - 1]) continue;
            cur.push_back(nums[i]);
            subsetHelper(nums, cur, i+1);
            cur.pop_back();
        }
    }


    vector<vector<int>> subsetsWithDup(vector<int>& nums){
        sort(nums.begin(), nums.end()); 
        vector<int> cur;
        subsetHelper(nums,cur,0);
        return result;
    }
};
```

這裡更正的地方，這裡改成透過迴圈來控制嘗試組合，這裡 `int i=depth`  **是為了確保生成的子集是從當前的遞迴層次開始，而不會重複處理之前已經包含在其他子集中的元素** 若設成0 會導致每次遞迴都會從頭重新選擇元素，子集就會重複生成。

```cpp
if (i > depth && nums[i] == nums[i - 1]) continue;
```
這行的邏輯是：如果當前元素 `nums[i]` 與前一個元素 `nums[i-1]` 相同，**並且這是第一次出現重複，我們就跳過這個元素的處理，這樣避免生成相同的子集。** 例如，對於 `[1, 2, 2]`：
- 當 `i = 2` 且 `nums[2] == nums[1]`（它們都是 2），我們就會跳過這次

> 上面這步驟也歸功於先前有先對 `nums` 進行排序

如果通過檢查，則將當前元素加入子集並繼續進行遞迴，而若退回 backtrack 到當前層，則將目前的子集元素 pop出來嘗試下一種可能。



### 執行結果

![](/img/LeetCode/90/result2.jpeg)

# 複雜度

這裡分析更正後的寫法

## 時間複雜度

- 子集的產生： 對於每個元素都有選或不選的兩種可能，因此這裡的複雜度會是 $2^n$，其中$n$ 為 `nums` 長度
- 判斷重複元素：`if (i > depth && nums[i] == nums[i - 1]) continue` 並不改變複雜度
- 元素排序： $O(n Log n)$

因此整題時間複雜度為 $O(nLogn + 2^n)$

## 空間複雜度
- 遞迴的深度最大為 $n$，即所有元素都加入子集的情況，因此遞迴調用的空間複雜度為 $O(n)$
- 一共可能有  $2^n$ 個子集 (選vs不選)

因此整體空間複雜度會是 $O(n * 2^n)$

---