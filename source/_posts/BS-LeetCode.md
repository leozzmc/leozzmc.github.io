---
title: 二元搜尋法 | ✅ 704. Binary Search | LeetCode 
toc: true
tags:
  - Search
  - LeetCode
  - Array
categories: LeetCode筆記
aside: true
abbrlink: 22bf447e
date: 2024-05-28 19:10:28
cover: /img/LeetCode/BS_cover.jpg
---

# 題目敘述

![](/img/LeetCode/BS_Question.jpeg)

題目中有一個整數陣列 nums, 這個陣列是以排序的陣列，並且在這當中想要找到 target 這個元素的 index, 如果沒找到就回傳 -1。並且要求所實現的演算法其實時間複雜度為 $O(Log n)$


# 解法

## 我的作法


```c=
int search(int* nums, int numsSize, int target) {
    
    // init
    int i,mid=0,low=0, high=numsSize-1;

    // Binary search
    // 1. find lower index and high index according to the length of array
    // 2  calculate middle value
    // 3. update low and high value
    // 4. again calcuate the new middle value until derive the target value or return -1
    
    while(low <= high){
    // needs to consider the situation that the middle number is not an even number
    mid = (int)((low + high)/2.0); 
    // need to find the lower section of array
    
    if(nums[mid] > target){ 
            high = mid-1;  
    }
    else if(nums[mid] < target){
        low = mid+1;
    }
    else {
        // find value
        return mid;
    }
    }
  
  return -1;
}
```

這邊使用了 Binary Search 的標準做法，**首先設定進行切分的中間值 mid，透過 low 以及 high 去取平均來找中間值。** 接著我們開始判斷狀況:
- 當 `nums[mid] > target:` 這就代表中間值大於要找的target 值，**也就是說可以把 mid 的右側部分捨棄，僅找左側部分**，因此需要調整 high 的值，來縮小查找範圍
   - ```high = mid -1;```
-   當 `nums[mid] < target:` 這就代表中間值小於要找的target 值，**也就是說可以把 mid 的左側部分捨棄，僅找右側部分**，因此需要調整 low 的值，來縮小查找範圍
   - ```low = mid +1;```
- 第三種狀況就是找到 `target` 值就在陣列中，即回傳 mid 值
- while 迴圈的中止條件會是 `low > high`，這就代表已經找太多遍，確定陣列中沒有target值了，直接結束迴圈並且 `return -1`

> 注意，在中間值時候建議改寫成 `mid =  low + (high -  low)/2` 這樣做可以避免 high 跟 low 都是較大的數字，相加導致溢位的問題

## 執行結果

![](/img/LeetCode/BS_Result.png)

## 其他做法 -  求上界

![](/img/LeetCode/BS_upper.png)


這是在 LeetCode 解答區看到的其他做法，與其直接找到 Target 本身，**不如去找能夠 Target 在這個陣列中能夠插入的點**

這個解法中首先定義了能被插入的區塊，如同圖片中描述的一樣，如一個陣列假設是 `[-7,-4,3,9,9,9,12]` 那他最大能夠插入的位置會是在 `9` 與 `12`之間，而他最小能夠插入的位置會是 `3` 和 `9` 之間。

首先 一樣需要計算中間值的位置，接著做判斷時分別考慮:

-   當 `nums[mid] < target:` 這就代表中間值小於要找的target 值，這時代表可能插入的位置在 mid 的右側，因此調整 low 的範圍，繼續找上界
   - ```low = mid +1;```
-   當 `nums[mid] == target:` 這就代表中間值等於要找的target 值，時代表可能插入的位置在 mid 的右側，因此調整 low 的範圍，繼續找上界
   - ```low = mid +1;```
- 當 `nums[mid] > target:` 這就代表中間值大於要找的target 值，時代表可能插入的位置在 mid 的左側，因此調整 high 的範圍，繼續找上界，這時 mid 也可能是可插入的位置，因此 high 設為 mid
   - ```high = mid;```

一旦迴圈結束， **`high` 代表的意義是插入的位置， `low -1` 代表的是不大於 `target` 的最大元素** 所以結束後會去需要檢查 `nums[low-1]` 是否等於 `target`，有就回傳 low-1 沒有就回傳 -1


演算法如下:

```c=
int search(int* nums, int numsSize, int target) {
    
    // array init
    int i,mid=0,low=0, high=numsSize-1;

    
    // Approach-2 Find Upper Bound
    while (low < high){

        mid = low + (int)((high-low)/2.0);

        if (nums[mid] <= target){
            low = mid +1;
        }
        else {
            high = mid;
        }

    }

    if( low > 0 && target == nums[low-1]){
        return low -1;
    }
    else if( nums[low] == target && low ==0 ){ // edge case
        return low;
    }
    else if ( high == numsSize-1 && target == nums[high]){ //edge case
        return high;
    }
    else {
        return -1;
    }
}
```

### 為什麼這種方法能找到目標值? 

- **合併條件**：在這種方法中，我們將 nums[mid] < target 和 nums[mid] == target 這兩個條件合併了，因為不管是小於還是等於，目標值的插入位置都應該在 mid 的右側。所以這時候都將 left 設為 mid + 1。
- **保持有效範圍**：如果 nums[mid] > target，說明目標值應該在 mid 及其左側，所以我們將 right 設為 mid，而不是 mid - 1，這樣我們保留了 mid 作為一個可能的位置。
- **循環結束判斷**：當 left 和 right 相等時，循環結束，left 即為目標值的插入位置。如果目標值在陣列中存在，那麼 left - 1 即為目標值的最後一個位置。這時候我們只需要檢查 nums[left - 1] 是否等於目標值即可。

### 特殊狀況

- 陣列中所有元素都大於目標值：這種情況下，最終 left 會等於 0，此時說明目標值不存在於陣列中。
- 陣列中所有元素都小於目標值：這種情況下，最終 left 會等於陣列長度，目標值應該插入在陣列的最後位置。

### 執行結果



![](/img/LeetCode/BS_upper_result.png)

## 時間複雜度

執行步驟數 N -> 1/2 N -> 1/4 N -> 1/8 N ... 隨著 $Log n$ 函數收斂到定值