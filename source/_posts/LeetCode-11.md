---
title: 裝最多水的容器 | Medium | LeetCode#11. Container With Most Water
tags:
  - Two Pointers
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 806bf38
date: 2024-12-17 19:20:26
cover: /img/LeetCode/11/cover.png
---

# 題目敘述

![](/img/LeetCode/11/question.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給了一個整數陣列 `height` 並且長度為 `n`， `n` 代表有 `n` 條垂直的線，第 `i` 條線的長度範圍為座標 `(i,0)` 到 `(i, height[i])` (反正 `height` 的值就會是線的長度)，請找到兩條線與X軸共同形成一個容器，可以裝最多的水，請回傳可能裝的最大面積。

# 解法

## 一開始的想法

總之面積會是由比較矮的直線乘上底邊 $Area = \min(height[i], height[j]) \times (j-i)$

## 暴力解

```c++
class Solution {
public:
    int maxArea(vector<int>& height){
        int maxArea = 0;
        int n = height.size();
        for(int i = 0; i < n; i++){
            for(int j=i+1; j < n; j++){
                if(height[j] > height[i]) maxArea = max(maxArea, height[i]*(j-i));
                else maxArea = max(maxArea, height[j]*(j-i));
            }
        }

        return maxArea;

    }
};
```

這裡透過兩個迴圈來迭代形成不同的容器大小，但這樣做會 Time Limit Exceeded!

## 雙指針解

```c++
class Solution {
public:
    int maxArea(vector<int>& height){
        int maxArea = 0;
        int left = 0;
        int right = height.size()-1;
        while(left < right){
            if(height[right]>height[left]){
            maxArea = max(maxArea, height[left]*(right-left)); 
            } 
            else{
            maxArea = max(maxArea, height[right]*(right-left));
            }
            if(height[left] < height[right]) left++;
            else right--;
            
        }
        return maxArea;

    }
};
```

這邊通過兩個指標 `left`, `right` 來包夾出容器大小，面積計算一樣，若比先前面積大，則取當前面積。而移動 `left`, `right` 指針的關鍵在於， **如果 `height[left] < height[right]`，則左邊垂直線限制了整體面積，這時如果`right` 保持不動並減少距離，並不會讓面積改變，因此要移動 `left`，並期望找到更高的垂直線** ，反之亦然。


### 執行結果

![](/img/LeetCode/11/result.jpeg)

# 複雜度

時間複雜度(暴力解): $O(n^2)$
時間複雜度(雙指標解): $O(n)$

空間複雜度: $O(1)$

---