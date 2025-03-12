---
title: 找出重複數字| Medium | LeetCode#287. Find the Duplicate Number
tags:
  - Array
  - Binary Search
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: b8be61c6
date: 2025-03-12 21:19:47
cover: /img/LeetCode/287/cover.png
---

# 題目敘述

![](/img/LeetCode/287/question.jpeg)


- 題目難度: `medium`
- 題目敘述: 題目給定一個整數陣列 `nums` 包含了 `n+1` 個數字，每個數字範圍為 `[1,n]` ，在 `nums` 只會有一種數字重複，請回傳是哪個數字重複。


{% note  warning %}
**這題要求只能使用常數空間，並且不能夠修改 `nums` 本身**
{% endnote %}

# 解法

## 一開始的想法

這題規定只能使用常數空間，就代表要用時間換空間，基本上陣列或是 `unordered_set` 這種額外樣保存 n筆陣列資料的方式都不能用了，另外如果直接使用雙重回圈暴力解應該也會 TLE，因此這裡需要別的做法

## 解法

```c++
class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int left = 1;
        int right = nums.size()-1;

        while(left < right){
            int mid = left + (right - left) /2;
            int count=0;

            for(int num: nums){
                if(num<=mid){
                    count++;
                }
            }

            if(count > mid){
                right = mid;
            }
            else{
                left = mid+1;
            }
        }
        return left;
    }
};
```

這裡透過 Binary Search 的方式先針對所有數字範圍 `[1,2,...n]` 進行檢索。首先計算出中間值 `mid`。並且宣告一個變數 `count`。 接著迭代 `nums` 陣列。如果陣列數字比中間值小，`counter` 就增加。這樣的好處在可以用於檢測重複數字

舉例來說，下面的情況是經過for迴圈後的結果
```
nums = [1,2,3,2,1]
mid = 3
count = 5 
```

明明只有數字 `1`, `2`, `3` 比中間值 `mid=3`小，而累計次數 `count` 卻為 `5` 就代表有數字重複，因此可以繼續收窄 `mid` 的範圍，這時就可以往`mid`左邊收窄。 `right = mid` 反之則往`mid` 收窄。

### 執行結果

![](/img/LeetCode/287/result.jpeg)


# 複雜度

時間複雜度: $O(NlogN)$


空間複雜度: $O(1)$

---
