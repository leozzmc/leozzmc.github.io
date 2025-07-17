---
title: 螺旋矩陣 | Medium | LeetCode#54. Spiral Matrix
tags:
  - Matrix
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 3d362b68
date: 2025-07-17 10:32:14
cover: /img/LeetCode/54/cover.png
---

# 題目敘述

![](/img/LeetCode/54/question.png)

- 題目難度：`Medium`
- 題目描述： 給定一個 `m x n` 的 `matrix`，請以螺旋順序回傳 `matrix` 內的所有元素

> 看題目的範例應該是要用順時鐘方向然後由外而內來螺旋

# 解法

## 一開始的想法

一開始看到，想說應該要能夠用遞迴方式來逐一存取特定的格子，可能指定 row 跟 column 然後要想某種方式來每次都跑完一層後轉向，但我後來發現這樣的判斷方式會太複雜，因為我原本的想法是每一層遞回要跑一個螺旋邊 (Ex. 最上層的元素依序存入輸出vector) 但這樣遞迴終止條件會太複雜，用來控制轉向的參數也會太多。 **後來改成將四個螺旋邊的存取放在相同的遞迴中，螺旋到內圈時才會進到下一層遞迴。**

## 我的解法

```c++
class Solution {
public:
    vector<int>output;    
    void helper(vector<vector<int>> & matrix, int top, int bottom, int left, int right){
        
        if(top > bottom || left > right) return;

        for(int j=left; j<=right; j++){
            output.push_back(matrix[top][j]);
        }
        for(int i=top+1; i<= bottom; i++){
            output.push_back(matrix[i][right]);
        }
        if(top < bottom){
            for(int j=right-1; j>=left; j--){
                output.push_back(matrix[bottom][j]);
            }
        }
        if(left < right){
            for(int i=bottom-1; i>top;i--){
                output.push_back(matrix[i][left]);
            }
        }
        helper(matrix, top+1, bottom-1, left+1,right-1);
    }

    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        int m= matrix.size();
        int n= matrix[0].size();
        helper(matrix, 0, m-1, 0, n-1);
        return output;
    }
};
```

這邊額外定義了一個 `helper` 函數主要負責透過遞迴進行螺旋存取的任務，但是這邊會有四個參數 `left`, `right`, `top`, `bottom`  主要是用來調整矩陣範圍用的，在 `sprialOrder` 會先取出矩陣的長 `m` 跟寬 `n` 然後將其各自減一作為 `right` 跟 `bottom` 的值丟入 `helper` 函式中。 

由於矩陣的存取方式會是順時針螺旋，那在 `helper` 函式中就需要按照螺旋的規律來去依序存取，所以 

(1) 從上邊由左至右存取陣列

![](/img/LeetCode/54/Array-1.png)

```c++
for(int j=left; j<=right; j++){
    output.push_back(matrix[top][j]);
}
```

(2) 從右邊由上至下存取陣列

![](/img/LeetCode/54/Array-2.png)

```c++
for(int i=top+1; i<= bottom; i++){
    output.push_back(matrix[i][right]);
}
```

(3) 從下邊由右至左存取陣列

![](/img/LeetCode/54/Array-3.png)

```c++
if(top < bottom){
    for(int j=right-1; j>=left; j--){
        output.push_back(matrix[bottom][j]);
    }
}
```

(4) 從左邊由下至上存取陣列

```c++
if(left < right){
    for(int i=bottom-1; i>=top; i--){
        output.push_back(matrix[i][left]);
    }
}
```

這邊說明一下，在 `helper` 中的 終止條件 `if(top > bottom || left > right) return;` 是在整圈都不能走的時候才停止，但在剛剛的下邊跟左邊（也就是第三步驟跟第四步驟），之所以在走訪下邊會需要先判斷 `if(top < bottom)` 是因為這樣才有下邊可以走，如果等於了，那就會是走到重複的邊 (走會是走剛剛的上邊)，所以要確定下面有路可以走才開始由下邊的最右走到下邊的最左，同理，你要確定最左邊有路才能走 `if(left < right)` 如果沒路你就會是走剛剛走過的最右邊。 **這些判斷的目的是避免在剩下一行或一列時重複走訪已經走過的邊界。**


### 執行結果

![](/img/LeetCode/54/result.png)

# 複雜度

時間複雜度: $O(mn)$ $m$ $n$ 矩陣中的每個元素都會被存取一次 (每一層迴圈的加總)

空間複雜度: output陣列會是 $O(mn)$ 然後遞迴深度會是 $O(min(m,n)/2)$ 但 $O(min(m,n)) < O(mn)$ 

---
