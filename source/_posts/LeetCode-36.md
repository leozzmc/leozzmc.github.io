---
title: 有效的數獨 | Medium | LeetCode#36. Valid Sudoku
tags:
  - Matrix
  - Hash Table
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: e10f7c64
date: 2025-01-04 12:56:33
cover: /img/LeetCode/36/cover.png
---

# 題目敘述

![](/img/LeetCode/36/question1.jpeg)

![](/img/LeetCode/36/question2.jpeg)

- 題目難度： `Medium`
- 題目描述： 給定一個 `9 x 9` 大小的數獨 `board`  請確認該數獨是否是有效的。

{% note info %}
只有當被填入數字滿足下面條件，數獨才會是有效的:
(1) 每一列只包含非重複的數字 `1-9`
(2) 每一行只包含非重複的數字 `1-9`
(3) 共9個 `3 x 3` 的子方格, 每個子方格中的數字 `1-9` 都不重複
{% endnote %}

# 解法

## 一開始的想法

想法就偏向暴力解，首先就是要迭代 `board` 中每一列，看數字是否重複，這時可以用一個 `unordered_set` 去儲存數字，並在每一格檢查數字是否重複，如果重複就回傳 false，接著迭代每一行檢查是否重複。每次換行換列 `unordered_set` 都要清空為的是保存新的一行/列的數字。 最後就是需要迭代 9 個 `3*3` 大小的子方格，如果重複就回傳 false 函數最後代表檢查完畢，回傳 true。


## 我的解法

```c++
class Solution {
public:
    bool isValidSudoku(vector<vector<char>>& board){
        unordered_set<char> uset;

        for(int i=0; i<board.size(); i++){
            for(int j=0; j<board[0].size(); j++){
                if(board[i][j]!= '.' ){
                    if(uset.find(board[i][j])!= uset.end()) return false;
                    else uset.insert(board[i][j]);
                }
            }
            uset.clear();
        }
        uset.clear();

        for(int j=0; j<board[0].size(); j++){
            for(int i=0; i<board.size(); i++){
                if(board[i][j]!= '.'){
                    if(uset.find(board[i][j])!= uset.end()) return false;
                    else uset.insert(board[i][j]);
                }
            }
            uset.clear();
        }
        uset.clear();
    
        for(int i=0; i<3; i++){
            for(int j=0; j< 3;j++ ){
                
                for(int row=i*3; row < i*3+3; row++){
                    for(int col = j*3; col<j*3+3; col++){
                        if (board[row][col] != '.') {
                            if(uset.find(board[row][col])!=uset.end()) return false;
                            else uset.insert(board[row][col]);
                        }
                    }
                }
                uset.clear();
            }
        }
        uset.clear();

        return true;

    }
};
```

實際操作上也跟想像上的一樣，分成三部分：檢查行、檢查列、檢查方格。其中也有宣告一個 `unordered_set uset` 來去為每一行/列保存數字。每一行/列結束後也會清空 `uset.clear()`。 只有最後在迭代子方格的時候需要注意，最外層兩格迴圈代表依序選擇不同的子方格去迭代，內部兩層迴圈則是迭代子方格內部，一但發現重複數字，就回傳 false，另外在每次迭代完子方格後，`uset` 要清空。

### 執行結果

![](/img/LeetCode/36/result.jpeg)

# 複雜度


時間複雜度

$O(1)$：棋盤一共 9 x 9 格，每一格進行檢查或插入的行為為 $O(1)$ 因此一共會是 $O(81)$ 為常數時間複雜度，因此整體會是 $O(1)$

空間複雜度

$O(1)$: 每次進行檢查完畢後 `unordered_set` 都會清空，因此整體會是 $O(1)$

> 但如果今天不是固定棋盤，而是 $n \times n$ 則時間複雜度會上升為 $O(n^2)$


---