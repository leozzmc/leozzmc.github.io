---
title: 八皇后問題 | Hard | LeetCode#51. N-Queens
tags:
  - backtracking
  - recursive
  - LeetCode
  - Hard
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 55b0eaae
date: 2024-10-08 15:09:18
cover: /img/LeetCode/51/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/51/question1.jpeg)

![](/img/LeetCode/51/question2.jpeg)

- 題目難度： `Hard`
- 題目描述： **N-Queens 其實就是有名的八皇后問題**，將 `n` 個皇后放到一個大小為 `n x n` 的棋盤，**使得任何一個皇后都無法直接吃掉其他的皇后**，題目要求輸入 `n` 求所有可能的棋盤組合，答案的可以是任意順序。每個解答中都需要能夠呈現皇后的擺放位置，題目中以 `'Q'` 代表皇后，而 `'.'` 代表空位。

> 這裡可以看八皇后問題的介紹：[八皇后問題](https://zh.wikipedia.org/zh-tw/%E5%85%AB%E7%9A%87%E5%90%8E%E9%97%AE%E9%A2%98)

{% note info %}
補充：在西洋棋中，皇后可以走直的、橫的和協的，因此如果皇后的的位置如下，則以它為中心的十字及對角都不能走，都可能會被攻擊

```
| . | $ | . | $ |
| $ | $ | $ | . |
| $ | Q | $ | $ |
| $ | $ | $ | . |
```
{% endnote %}

# 解法

## 一開始的想法

首先這個問題一樣是要窮盡各種可能的走法組合，因此想法一樣會是朝 backtracking 想。首先對於 backtracking 的遞迴終止條件，首先題目給的棋盤會是二維的向量 `vector<vector<string>>`因此我們在每一層中會去窮盡所有可能的排法，一定會需要一個 subVector 來儲存可能的結果，並且在 subVector 中的長度與 `n` 一樣後停止，並且將結果加入到回傳向量中。

而其他每一層做的事情，**就是去判斷棋盤中每個位置是否已經被放皇后，來決定是否可放皇后。**

## 我的解法

```cpp
class Solution {
public:
    vector<vector<string>> result;
    bool isValid(vector<string> &current, int row, int column){
        for(int i=0; i<row; i++){
            if(current[i][column] == 'Q') return false;
        }
        for(int i=row-1,j=column-1; i>=0 && j>=0; i--, j--){
            if(current[i][j] == 'Q') return false;
        }
        for(int i=row-1,j=column+1; i>=0 && j<current.size(); i--, j++){
            if(current[i][j] == 'Q') return false;
        }
        return true;
    }

    void nQueensHelper(vector<string> &current, int n, int row){
        if(row == n){
            result.push_back(current);
            return;
        }
        for(int col=0; col< n; col++){
            if(current[row][col] == '.' && isValid(current, row, col)){
                    current[row][col] = 'Q';
                    nQueensHelper(current, n, row+1);
                    current[row][col] = '.';
            }
        
        }
    }
    vector<vector<string>> solveNQueens(int n){
        vector<string> board(n, string(n, '.'));
        nQueensHelper(board,n, 0);
        return result;
    }
};
```

實際解題一共有三個函數，分別是題目給的 `solveNQueens` 以及用於 backtracking 主要邏輯的 `nQueensHelper` 還有用於判斷位置是否有效的  `isValid`，以下先介紹 `solveNQueens`

*solveNQueens* 當中首先初始化了棋盤，**棋盤為空，因此都先初始化為 `'.'`** ，接著呼叫 `nQueensHelper` 在這當中會去將結果加入到回傳向量 `result` 然後透過本函數來回傳。


接著是 `nQueensHelper`，以下是參數說明：
- `vector<string> &current` 會是用於儲存當前排列方式的向量
- `int n` 接著是題目給的 棋盤大小/皇后數量
- `int row` 代表棋盤的列


首先是遞迴的終止條件，也就是當這個棋盤的一種棋盤擺法都擺完后，也就是行數到達 `n` 就可以將 `current` 加入到回傳向量中。 接著就是在每一行中要嘗試各種可能，因此會是下面的迴圈來去跑每一個column

```cpp
for(int col=0; col< n; col++){
    if(current[row][col] == '.' && isValid(current, row, col)){
        current[row][col] = 'Q';
        nQueensHelper(current, n, row+1);
        current[row][col] = '.';
    }
}
```

由於棋盤初始化為 `.` 代表空位，因此同一個 row 的 每個 col 如果出現空位 (有`.`) 並且該位置是 valid 的

{% note info %}
該位置valid 代表該位置:
- **同一列中沒有其他 `Q`**
- **同一行中沒有其他 `Q`**
- **對角線中沒有其他 `Q`**
{% endnote %}


這裡選擇呼叫 `isValid` 來去進行檢查，**如果為 true 並且有空位那就將該位置的符號替換成 `Q` 並且進入下一層 `nQueensHelper(current, n, row+1);`** ，如果從下一層中退回這層，那就代表下一層會因為這個位置擺放 `Q` 而導致無法擺放成功，**這時就需要將本層的這個位置的 `Q` 替換回 `.`，並且往下一個 column 嘗試。**


最後， *isValid* 函數，他會先檢查你穿傳入座標中的同一column 底下是否有其他為 `Q` 的，如果有直接回傳 `false` 
> 這裡不需要判斷 `current[row][i]` 因為你在 `nQueensHelper` 中會丟下一個 col 值進來

接著判斷對角線，這裡的 for 用法其實我個人很少這樣用，就是同時透過 `i` 以及 `j` 變數進行迭代

![](/img/LeetCode/51/algo.png)

這裡分別會去 **檢查同一個 column 有沒有被放過 `Q`，下一步就是去看對角線有沒有被放過 `Q`** ， 這邊再檢查的時候務必要注意範圍，避免 segmentation fault。 如果檢查都過了那就回傳 `true`
 
```cpp
bool isValid(vector<string> &current, int row, int column){
    for(int i=0; i<row; i++){
        if(current[i][column] == 'Q') return false;
    }
    for(int i=row-1,j=column-1; i>=0 && j>=0; i--, j--){
        if(current[i][j] == 'Q') return false;
    }
    for(int i=row-1,j=column+1; i>=0 && j<current.size(); i--, j++){
        if(current[i][j] == 'Q') return false;
    }
    return true;
}
```

### 執行結果

![](/img/LeetCode/51/result.jpeg)

# 複雜度

## 時間複雜度

這裡需要分成兩部分分析，第一個是皇后擺放方式，第二個是是否 valid：

皇后擺放方式，每一行中有 $N$ 中選擇，而下一行能選擇的數量會減少，這裡假設每次都減少一個位置可選，這樣選擇數量會是 $N \times N-1 \times ... \times 1$ 即為 $O(N! )$

**每當我們放置一個皇后時，還需要檢查這個擺放是否合法（即皇后是否被其他皇后攻擊）**。檢查一個皇后的合法性需要掃描行、列和對角線，這需要 $O(n)$ 的時間，因此整體時間複雜度會是 $O(N! \times N)$

## 空間複雜度

這裡由三個部分組成，第一個是遞迴樹的深度，以及棋盤儲存和回傳向量

- 遞迴樹深度為 $N$ 因此所使用空間為 $O(N)$
- 棋盤的儲存為 $N \times N$，所使用空間為 $O(N^2)$
- 結果儲存，最壞的狀況下解法數量為 $O(N!)$，每個解法需要 $N$ 行來儲存，因此會是 $O(O \times O!)$
所以整體空間複雜度會是 $O(N^2 + N!)$


---
