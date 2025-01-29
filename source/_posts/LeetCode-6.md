---
title: 之字形轉換 | Medium | LeetCode#6. Zigzag Conversion
tags:
  - String
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: bb246426
date: 2025-01-29 22:30:28
cover: /img/LeetCode/6/cover.png
---

# 題目敘述

![](/img/LeetCode/6/question.jpeg)

- 題目難度: `Medium`
- 題目描述: 題目給定一個字串 `s` 假設是 `PAYPALISHIRING`，需要根據給定的列數 `numRows` 來用之字形 (Zigzag) 形式來呈現，並且逐列讀取字元後輸出字串 `PAHNAPLSIIGYIR`

```
P   A   H   N
A P L S I I G
Y   I   R
```

# 解法

## 一開始的想法

這裡的之字形會是先往下，碰到底部後再往右上方移動，移動到頂部後再往下直到把所有的字元都寫完。之後再逐行輸出。一開始的想法就是用個2維陣列按照之字形來儲存字串值，然後按照跟題目一樣的規則來填充到2維陣列中，

## 我的解法

但後來發現其實用一維度陣列就好，由於可以型態是字串，所以原先2為陣列的其他列都可以加入到對應行的後面，比較節省空間。

Ex.
```
row 0 | "P   A   H   N"
row 1 | "A P L S I I G"
row 2 | "Y   I   R"
```

```c++
class Solution {
public:
    string convert(string s, int numRows) {
        if(numRows==1) return s;
        vector<string> matrix(min(numRows, (int)s.length()));
        int row=0, col=0;
        bool zig = false;
        for(char c: s){
            matrix[row]+= c;
            if(row==0) zig= false;
            if(row == numRows-1) zig=true;
            if(!zig) row++;
            else row--;
        }

        string result="";
        for(string c: matrix){
            result+=c;
        }
        return result;
    }
};
```

這裡宣告一維陣列長度主要是根據題目指定的列數 `numRows` 跟字串長度共同決定。 這裡的一為陣列其實會是列數， 因此如果列數小於字串長度，則大小取列數就好，如果列數大於字串長度，則取字串長度就好。

接著透過一個變數 `zig` 來表示是否現在是往斜上方走的狀態，一開始為 `false`，接著我們迭代字串，每次都將字元加入到不同行的 `matrix` 的字串中，每個字串在填入時，一旦發現當前的 `row` 抵達最上方 (`row==0`) 則代表斜走狀態結束，將 `zig = false` 而一旦發現當前 `row` 抵達最下面那列，則代表準備要斜走了，將 `zig = true` 每次迭代中，檢查 `zig` 是否為 `true` 如果不為斜走狀態則將列數增加 `row++` 反之則減少列數 `row--`。

迭代結束後，將陣列結果加入到回傳字串中 `result` 。

另外處理 Edge Case: 一旦只有要求一列 `numRows==1` 則代表根本不用Z字型排列，直接回傳字串 `s` 就好

### 執行結果

![](/img/LeetCode/6/result.jpeg)

# 複雜度

時間複雜度

$O(N)$, $N$ 為字串長度

空間複雜度

$O(N)$, $N$ 為字串長度

---