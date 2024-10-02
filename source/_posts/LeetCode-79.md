---
title: 查找字詞 | Medium | LeetCode#79. Word Search
toc: true
tags:
  - backtracking
  - combinations
  - dfs
  - matrix
  - recursive
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 4b53ee93
date: 2024-10-01 21:47:10
cover: /img/LeetCode/79/cover.jpg
---

# 題目敘述

![](/img/LeetCode/79/question1.jpeg)

![](/img/LeetCode/79/question2.jpeg)

![](/img/LeetCode/79/question3.jpeg)

- 題目難度: `Medium`
- 題目敘述: 題目給定一個 `m x n` 大小的字母網格 `board` 以及一個字串 `word`，如果在網格中存在 `word` 則回傳 `true`。

{% note info %}
Word 可以由字母的相鄰Cell中組合而成，相鄰可以是水平相鄰或者是垂直相鄰。相同的Cell不可重複使用。
{% endnote %}

# 解法

## 一開始的想法

首先由於也是要嘗試**多種不同組合**，因此想法上還是會偏向 backtracking，**我的想法上覺得應該要先找出 `word` 中的第一個字是否存在於 `board` 之中，如果存在則可以先取得第一個字的座標 (在board上的位置)**，一旦有初始位置後，就可以去進行 backtracking嘗試看看各種鄰接組合。

![](/img/LeetCode/79/algo.png)


組合方式可能會是上下左右，因此每次遞迴輸入時會有四種不同可能，分別是向左、向右、向上以及向下，而這個過程中應該也要確保沒有超出邊界。 而遞迴的中止條件，應該會是backtracking 樹狀結構深度 `depth` 與題目給定的`word` 長度一樣則停止，並回傳 `True`。

## 我的解法

```cpp
class Solution {
public:
    bool existhelper(int depth ,vector<vector<char>>& board, string word, int UpperIndex, int InnerIndex){
        if( depth == word.length()) return true;

        //boundary check
        if(UpperIndex <0 || InnerIndex <0 || UpperIndex >= board.size() || InnerIndex >= board[0].size()) return false;
        
        if(board[UpperIndex][InnerIndex] != word[depth]) return false;
        
        char temp = board[UpperIndex][InnerIndex];
        board[UpperIndex][InnerIndex] = '#';
        
        //backtracking
        bool found = ( existhelper(depth+1, board, word, UpperIndex+1, InnerIndex) || 
        existhelper(depth+1, board, word, UpperIndex, InnerIndex+1) || 
        existhelper(depth+1, board, word, UpperIndex, InnerIndex-1) || 
        existhelper(depth+1, board, word, UpperIndex-1, InnerIndex));
        
        board[UpperIndex][InnerIndex] = temp;
        
        return found;   
    }
    bool exist(vector<vector<char>>& board, string word){
        //find the init value
        for(int i=0; i< board.size();i++){
            for(int j=0; j< board[i].size();j++){
                if(board[i][j] == word[0]){
                    if(existhelper(0,board, word , i, j)) return true;
                }
            }
        }
        return false;
    }
};
```

這裡透過兩個函數來實現題目的要求，首先 `exist` 函數負責先在矩陣內找出 `word`的第一個字的位置，而如果都沒有找到則回傳 `false`。一旦找到後就呼叫 `existhelper`函數進行backtracking。在初次呼叫函數過程中，會去將剛才找到的初始值的index `i`, `j`傳遞到函數中。


`existhelper`函數主要負責回溯邏輯，以下是參數介紹:
- `int depth`: 代表的組合數量
- `vector<vector<char>>& board`: 題目給的單字網格，是一個矩陣
- `string word`: 為題目給予的字串，也是我們要找的目標
- `int UpperIndex`: 為單字網格的列
- `int InnerIndex`: 為單字網格的行

首先判斷是否找到，也就是遞迴終止的條件就是當 `depth == word.length()`，一旦滿足就回傳 `true`

接著我們可以先看 backtracking 的邏輯，**下面主要會針對當前cell 移動到下一個cell的一共四種可能(上、下、左、右)進行遞迴呼叫** 一旦有其中一個回傳true，就代表在相鄰cell中找到我們下一個字了，回傳結果會放到 `found` 這個變數。

```cpp
//backtracking
bool found = ( existhelper(depth+1, board, word, UpperIndex+1, InnerIndex) || 
existhelper(depth+1, board, word, UpperIndex, InnerIndex+1) || 
existhelper(depth+1, board, word, UpperIndex, InnerIndex-1) || 
existhelper(depth+1, board, word, UpperIndex-1, InnerIndex));
        
```

而每次遞迴函數執行時，必須優先檢查當 index 是否有超出邊界，如果有就回傳 `false` ( `if(UpperIndex <0 || InnerIndex <0 || UpperIndex >= board.size() || InnerIndex >= board[0].size()) return false;`)。 接著就是每一層中需要判斷，你移動到的Cell中的字是否是你要的 `if (board[x][y] != word[depth]) return false;` 如果不是就回傳 `false`。


接下來的部份是我在第一次實作過程中沒有注意到的，就是題目有說 **The same letter cell may not be used more than once.** 所以在每一層搜尋過程中，必須先把你所使用到的字先排除或進行替換，這裡就是先另外建一個變數 `temp` 來暫時存放走訪的cell值，**然後將當前走訪的Cell當中的字暫時替換成 `'#'`，表示這個位置已經被訪問過，來避免重複使用**，而在 backtracking 完畢後再將這個值復原回來。最後回傳　`found` 變數。

### 執行結果

![](/img/LeetCode/79/result.jpeg)


# 複雜度

## 時間複雜度

- 在最壞的情況下，程式需要檢查 `board` 中的每個格子，**並從每個格子出發進行深度優先搜索（DFS）**。DFS的時間複雜度是 $O(4^L)$，其中 $L$ 是單詞的長度，因為每個位置最多有四個方向可以嘗試。
- 考慮到整個網格有 `M x N` 個格子，所以整個演算法的最壞情況時間複雜度是 $O(M * N * 4^L)$

## 空間複雜度

- 主要遞迴深度決定，最多會有 $L$ 層遞迴深度，因為單詞的長度為 $L$。此外，每次遞迴中會暫時改變 `board` 中的值，但這不會增加額外的空間需求，因為修改後還會還原原始值。因此空間複雜度為 $O(L)$

# 結語

看了發現其實寫的跟解答區的差不多，看完才發現其實會是根據網格的初始位置去做DFS，自己都沒意識到這是一個DFS XD。 但這題還是嘗試許久，對於 matrix 相關的應用也還沒很熟練 (雖然這題是考backtracking)，可能也是之後要去熟悉的目標。