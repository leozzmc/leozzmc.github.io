---
title: 合併排序陣列 | Easy | LeetCode#88. Merge Sorted Array
tags:
  - Array
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 5a4ba06f
date: 2024-11-19 09:27:17
cover: /img/LeetCode/88/cover.png
---

# 題目敘述

![](/img/LeetCode/88/question.jpeg)

- 題目難度：`Easy`
- 題目敘述： 題目給定兩個整數陣列 `nums1`, `nums2`，並以 **非遞減的順序排序(non-decreasing order)** ，並且給定整數 `m` 以及 `n` 分別代表兩個陣列中有多少元素。 **題目要求合併兩個陣列，並且一樣已非遞增的順序存放**，需要將 `nums2` 的元素合併到 `nums1`，而不需用函數返回，`nums1` 函數的長度會是 `m+n` 而前 `m` 的元素會是原先 `nums1` 中的元素。

> 可以看上面範例圖中的第一個測資，`nums1` 中的0會被 `nums2` 取代掉，並且 `m` 為3，由於是非遞減排序的陣列，因此0不算是元素之一。

# 解法

## 一開始的想法

我的想法就是先將 `nums2` 的部分填補到 `nums1` 多出來的地方，在去排序

## 我的解答

```cpp
class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n){
        if(nums2.size()==0) return;
        if(m==0){
            for(int i=0; i< nums2.size(); i++){
                nums1[i] = nums2[i];
            }
            return;
        }
        int i=m;
        int j=0;
        while(j<n){
            nums1[i]=nums2[j];
            j++;
            i++;
        }
        sort(nums1.begin(), nums1.begin() + m +n);
    }
};
```

如果 `nums2` 為空，則可以直接回傳，因為答案就會是 `nums1` 本身。如果 `nums1` 元素都為0 (`m=0`)，則需要將`nums2` 內容全部複製到 `nums1`。 接著後面透過while迴圈來實現 **將 `nums2` 元素填補到 `nums1` 空的地方** 這回事，這裡透過兩個額外變數 `i` `j` 來分別保存 `nums1` 中0元素的起點以及 `nums2`的起點。迴圈結束後就代表 `nums2` 元素都添加到 `nums1` 空的地方了，接著就透過 `sort()` 進行排序。

### 執行結果

![](/img/LeetCode/88/result.jpeg)

# 複雜度

## 時間複雜度

- `nums1` 元素全為0的處理狀況會是 $O(n)$, $n$ 為 `nums1` 長度
- while 迴圈 `nums2` 將 `nums1` 插入陣列尾端，會進行 `n` 次操作，因此是 $O(n)$
- `sort()` 會將 `nums1` 中的前 $m+n$ 個元素進行排序，因此複雜度會是 $O(m+n)log(m+n)$

整體時間複雜度會是 $O((m+n)log(m+n))$

## 空間複雜度

$O(1)$ 額外變數都是使用常數空間

---
