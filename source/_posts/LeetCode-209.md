---
title: 長度最小的子陣列和 | Medium | LeetCode#209. Minimum Size Subarray Sum
tags:
  - String
  - Sliding Window
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 33b92d95
date: 2024-12-01 16:16:52
cover: /img/LeetCode/209/cover.png
---


# 題目敘述

![](/img/LeetCode/209/question.jpeg)
- 題目難度： `Medium`
- 題目描述： 給定一個整數陣列 `nums`，以及正整數 `target`，請回傳長度最短的子陣列，其所有元素和大於或等於 `target` 值。若沒有任何子陣列，則回傳 0


# 解法

## 一開始的想法

這題的關鍵就是要 **回傳滿足條件的子陣列** ，因此可以很直覺地聯想到要用 sliding windo來去找出滿足要求的子陣列。

## 我的做法

```cpp
class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums){
        int left=0, right=0;
        int sum = 0;
        int length = INT_MAX;
        while(right < nums.size()){

            sum += nums[right];
            while( sum >= target){
                length = min(length,right - left+1);
                sum -= nums[left];
                left++;
            }
            right++;
        }

        if(length==INT_MAX) return 0;
        else return length;
    }
};
```

首先定義出用於夾出窗口的 `left` 以及 `right`，以及用於保存元素和的 `sum`，另外還有紀錄子陣列長度的 `length`，接著就是 sliding window 的標準流程：

- 擴展窗口
- 滿足條件
- 操作窗口
- 收縮窗口

透過移動 `right` 來擴展窗口，每次移動過程就去將 `num` 中元素加入到 `sum`，一旦當前元素總和 `sum>= target`，則代表條件滿足，接著就是找出當前子陣列長度是否與先前儲存的 `length` 誰比較小，並更新到 `length`，接著就是要收縮窗口，也就是要移動 `left`，在過程中先前加入到 `sum` 的元素也需要被扣除。 跑完迴圈後就回傳 `length`

### 執行結果

![](/img/LeetCode/209/result.jpeg)

# 複雜度

| **複雜度類型** | **複雜度值** | **分析**                                                                 |
|-----------------|--------------|---------------------------------------------------------------------------|
| **時間複雜度**  | $O(n)$         | 由於使用了雙指針方法，每個元素最多被訪問兩次（右指針和左指針各一次，最多只會是 $2n$），因此是線性時間複雜度|
| **空間複雜度**  | $O(1)$         | 僅使用了固定數量的變數（`left`、`right`、`sum`、`length`），沒有使用額外的空間 |

---