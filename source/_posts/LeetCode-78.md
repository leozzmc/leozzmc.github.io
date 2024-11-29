---
title: 子集問題 | Medium | LeetCode#78. Subsets
tags:
  - backtracking
  - recursion
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/78/cover.jpeg
abbrlink: 3e4bf679
date: 2024-10-11 23:19:54
---

# 題目敘述

![](/img/LeetCode/78/question.jpeg)

- 題目難度: `Medium`
- 題目敘述:  給定一個具有不重複元素的整數陣列 `nums`，**回傳所有可能的子集合**

{% note info %}
子集會包含空集合，另外，若子集中的元素相同但順序不同，則視為相同子集。
```
Ex. nums = {1,2,3}
[1,2] = [2,1]
[1,3,2] = [3,1,2]
```
{% endnote %}

# 解法

## 一開始的想法

子集合問題也是典型的 backtracking 問題，它包含了在每個數字中選與不選，因此終止條件會是目前選擇的深度到達題目所給的長度上限就停止，而在每一層中要做的事就是選跟不選，首先是不選，那就會需要直接往往下一層去，到下一層在進行選以及不選，直到到達長度限制。

假設題目是 `nums={1,2}` 則他的樹狀結構會如下：

```
            []
         /      \
      []         [1]
     /  \       /    \
   []   [2]  [1]    [1,2]

```

## 我的解法

```cpp
class Solution {
public:
    vector<vector<int>> result;
    void subsetsHelper(vector<int>& nums, vector<int>& current, int depth){
        if(depth == nums.size()){
            result.push_back(current);
            return;
        }
        
        // No pick
        subsetsHelper(nums, current, depth+1);
        
        // Pick
        current.push_back(nums[depth]);
        subsetsHelper(nums, current, depth+1);
        current.pop_back();
    }

    vector<vector<int>> subsets(vector<int>& nums){
        vector<int> cur;
        subsetsHelper(nums, cur, 0);
        return result;
    }
};
```

這裡透過兩個函數來實現，`subsets` 和 `subsetsHelper`，這裡主要透過 `subsetsHelper` 來完成 backtracking 的主要邏輯。以下是參數說明：
- `nums` 是題目給的陣列
- `current` 用於存放當前的子集
- `depth` 表示目前處於 `nums` 的第幾層，控制當前考慮數組的哪個元素

遞迴過程：
- 若 `depth` 等於 `nums.size()`，說明已經處理完所有數字，把當前子集 `current` 放入 `result`

在遞迴過程有兩個分支，分別為: **不選擇當前 `depth` 所指的數字，即直接進入下一層遞迴** 以及 **選擇當前 `depth` 所指的數字，將該數字加入 `current`，再進入下一層遞迴**， 而在遞迴完畢後再將該數字移出（即 backtrack 回上一層狀態）。

所以按照題目給的範例測資，如果題目上限長度是3，那對應 `nums={1,2,3}` 在初始狀況如果連續 三層都不選，最後就會添加空集合到我們的回傳陣列中。

題目給的 `subsets` 函數則用於呼叫我們定義的 `subsetsHelper` 進行 backtracking，之後回傳答案。


### 執行結果

![](/img/LeetCode/78/result.jpeg)

# 複雜度

## 時間複雜度

對於 `nums` 來說一共有 $N$ 個元素，所以將一個子集複製到 `result` 所需的時間為 $O(N)$，另外，每種元素都有選跟不選兩種可能，因此遞迴會進行 $2^N$，因此整體時間複雜度會是 $O(2^N \times N)$

## 空間複雜度

遞迴的深度為 $N$，即每個元素在每次遞迴中都被考慮，因此遞迴棧的最大深度是 $O(N)$，result 會存儲 $2^N$ 個子集，每個子集最多包含 $N$ 個元素。因此，結果集佔用的空間是 $O(2^N \times N)$，而用於臨時存放子集的陣列其空間複雜度為 $O(N)$，因此整體空間複雜度會是 $O(2^N \times N)$

---