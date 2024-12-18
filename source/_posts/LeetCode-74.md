---
title: 搜尋二維矩陣 | Medium | LeetCode#74. Search a 2D Matrix
tags:
  - Binary Search
  - Matrix
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 975824a6
date: 2024-12-18 16:16:32
cover: /img/LeetCode/74/cover.png
---

# 題目敘述

![](/img/LeetCode/74/question1.jpeg)
![](/img/LeetCode/74/question2.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給定一個大小 `m x n` 的整數矩陣 `matrix`，並且遵循下面兩個特性：
    -  每一行中元素都以非遞減排序
    -  每一行的第一個元素都大於上一行的最後一個元素
  
    此時題目給定一個整數 `target` 請回傳 `target` 是否存在於 `matrix`

> 題目額外限制實踐出的解法必須為 $O(log(m \times n))$ 

# 解法

## 一開始的想法

最直覺還是使用暴力解，就雙重迴圈迭代下去．但這樣複雜度會是 $O(m \times n)$，排序資料比大小正常來說會想到二元搜索，而現在題目是二維矩陣， **此時可以嘗試將二維陣列同樣用一維的方式進行二元搜索，只要注意最後 index 的計算即可**

## 解法 - Binary Search

```c++
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target){
        int m = matrix.size();
        int n = matrix[0].size();
        int left=0;
        int right = m*n-1;
        
        while(left <= right){
            int mid = left + (right-left/2);
            int midValue = matrix[mid/n][mid%n];
            if(midValue == target) return true;
            else if(target < midValue){
                right = mid-1;
            }
            else if(target > midValue){
                left = mid+1;
            }
        }
        return false;
    }
};
```

在標準二元搜索中會先定義出邊界： `left`, `right`， **這邊可以想像成將二維陣列拼接成一維度很長的陣列** ，那這裏的 `right` 會是二維陣列中的最後一個元素，如果 `5*6` 大小的陣列，那邊界就會是 `0` 到 `29`。

接著透過 `left<=left` 作為條件包夾出搜尋區間，然後定義中間值 `mid = left + (right - left/2)` 這會是超長一維陣列的中間值，因此需要對應到二為陣列找到它的 index，可以先知道它是在哪一行， **想像超長陣列每 `n` 個元素就會是一列，因此中間值會是第 `mid/n` 列，並且剩餘的餘數會是他在第幾個 column，因此中間值 `midValue` 的定義就會是 `matrix[mid/n][mid%n]`。** 

定義完畢中間值後，就可以來搜尋這個超長一維陣列了，若找到中間值 `midValue` 則回傳 `true` 若 `target < midValue` 則將右邊範圍收窄，將其指定為 `mid-1` 而反之則將左邊收窄，將 `left` 指定為 `mid+1`。一旦超長迴圈都找遍了還是沒有 `target` 就回傳 `false`。

### 執行結果

![](/img/LeetCode/74/result.jpeg)

# 複雜度

時間複雜度: $O(log(m \times n))$
空間複雜度: $O(1)$

---