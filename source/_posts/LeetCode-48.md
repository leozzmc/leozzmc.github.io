---
title: 旋轉圖片 | Medium | LeetCode#48. Rotate Image
tags:
  - Matrix
  - Math
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/48/cover.png
abbrlink: a68b0f6a
date: 2025-09-03 21:56:14
---

# 題目敘述


![](/img/LeetCode/48/question.jpeg)

- 題目難度: `medium` 
- 題目敘述: 題目給定一個 `matrix` 請將其順時針旋轉一次，並且必須 in-place修改，也就是不能宣告額外二元陣列去儲存元素

# 解法

## 一開始的想法

這題我是畫圖直接看矩陣關係

![](/img/LeetCode/48/algo1.png)


首先其實觀察 `matrix` 再經過一次順時針旋轉後的位置，然後比對原本的，可以發現一些關係。旋轉的過程也只是列元素變成行元素，可以觀察到 

```
- matrix[0][0] = matrix[0][2]
- matrix[1][0] = matrix[0][1]
- matrix[2][0]  = matrix[0][0]
```

透過上面關係可以發現， **順時鐘旋轉一次，其實只是先將 `matrix` 相同 column 元素全部 reversed 排列後，再去進行對稱的過程。**


## 我的解法


![](/img/LeetCode/48/algo2.png)

不過實際在解的時候，如果要對每一個 column 元素進行反序排列，會橫跨不同子陣列的元素交換，處理上比較不直觀， **因此我發現其實也可以先反序排列同一列元素再進行對稱，只不過這樣的結果會是原本 `matrix` 逆時針轉一次，但是其實逆時針轉三次就等於順時針轉一次。** 


```c++
class Solution {
public:
    void rotate(vector<vector<int>>& matrix){
        int n = matrix.size();
        int counter = 0;
        while(counter <3){
            // reversed subVec
            for(int i=0; i<n;i++){
                reverse(matrix[i].begin(), matrix[i].end());
                
            }
            //symmetric
            for(int i=0; i<n; i++){
                int temp=0;
                // only need to execute the lower-left triabgle
                for(int j=i; j<n; j++){
                    if(i!=j){
                        temp = matrix[i][j];
                        matrix[i][j] = matrix[j][i];
                        matrix[j][i] = temp;
                    }
                }
            }

            counter++;
        }
    }
};
```

上面要特別注意在交換元素時，迴圈不要迭代所有元素，只要迭代矩陣的左-下三角元素即可，若你迭代所有元素，那結果會保持不變，例如迭代到 `[0][1]` 用 `[1][0]` 元素替換，但是你再迭代到 `[1][0]` 時，又會把原本的元素換回來 


### 執行結果

![](/img/LeetCode/48/result.jpeg)

# 複雜度

時間複雜度
$O(n^2)$

空間複雜度
$O(1)$

---