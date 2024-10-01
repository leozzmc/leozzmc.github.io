---
title: 產生括號 | Medium | LeetCode#22. Generate Parentheses
tags:
  - backtracking
  - combinations
  - parentheses
  - recursive
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 8c983568
date: 2024-09-26 22:40:28
cover: /img/LeetCode/22/cover.jpeg
---

# 題目敘述

![](/img/LeetCode/22/question.png)

- 題目難度: `Medium`
- 題目敘述: 給定 `n` 組括號，請產生所有可能的閉合括號的組合

{% note info %}
反正就是沒有 `(()` 或者是 `)()` 類似這樣的組合
{% endnote %}

# 解法

## 一開始的想法


這題求組合的所有可能性，所以想法上一定還是 backtracking，但今天的問題會是要怎麼樣 **控制括號能夠閉合**，以 backtracking 的解題架構來看，首先可以思考退回條件會是一旦每個組合中的長度到達了 `2 * n` 因為 **會是 `n` 組括號**，另外每一層中在選一定要先選左括號再選右括號，因此需要判斷當前右括號數量是否小於左括號，如果小於就代表一定至少有一組括號還沒閉合完畢。


## 我的解法

```cpp
class Solution {
public:
    vector<string> parentheseList;
    void generateParentheseshelper(int left, int right, vector<string> &parenthese, string current, int n){
        if(current.length() == 2* n ){
            parenthese.push_back(current);
            return;
        }
        if(left < n){
            generateParentheseshelper(left+1, right, parenthese, current +"(", n);
        }
        if(right < left){
            generateParentheseshelper(left,right+1 ,parenthese,current +")", n);
        }
    }

    vector<string> generateParenthesis(int n){
        string temp="";
        generateParentheseshelper(0,0, parentheseList, temp, n);
        return parentheseList;
    }
};
```

上面程式中一樣定義了一個 `generateParentheseshelper` 來去處理 backtracking 的邏輯，下面是參數說明：

- `int left`
  - 代表左括號目前出現在當前字串中的數量
- `int right`
  - 代表右括號目前出現在當前字串中的數量
- `vector<string> &parenthese`
  - 用來儲存每一種組合的，返回用vector
- `string current`
  - 用來保存當前組合可能的字串變數
- `int n`
  - 題目給的括號pair 數量

**這裡的 bracking 終止條件是一旦所有括號都用掉，就將當前字串 `current` 加入到回傳vector `parenthese` 當中**，這裡判斷一旦 `current` 的長度達到 `2 * n` 就會是括號都用掉。接著是每一層中需要做的事，這裡首先看左掛號數量如果小於 `n`  就會進入下一層，並且在參數地回傳遞的過程中將 `current + "("` 放在函式參數中也是避免退回的時候，還需要再對 `current` 中的 `(` 去做處理，另外就是在傳遞時需要將左括號數量+1 `left+1`，接著就是需要判斷右括號的數量是否小於左括號 `right < left` 如果小於就代表，一定存在括號是沒有閉合的，這時就需要去閉合括號，在進入下一層的參數中讓 `current + ")"`，這個過程中也需要讓右括號數量增加 `right+1`。


### 執行結果

![](/img/LeetCode/22/result.png)

# 複雜度

## 時間複雜度

- 遞迴樹的高度，由於每個有效括號組合的長度為 $2n$，因此遞迴樹的深度為 $2n$
- 有效的解數量： 這裡可以透過**卡塔蘭數** 來計算，給定 `n` 對括號，有效組合數量為第n 個卡塔蘭數 $C_n = \frac{1}{n + 1} \binom{2n}{n} = \frac{(2n)!}{(n+1)!n!}$ 而這個值會為趨近於 $O(\frac{4^n}{\sqrt{n} \cdot n})$

因此，遞歸會探索所有可能的括號組合，並剪枝掉無效組合。每一個有效組合需要 $O(2n)$ 的時間來生成，因此整體時間複雜度為： $O(\frac{4^n}{\sqrt{n}})$

> [卡塔蘭數(Catalan Number)](https://zh.wikipedia.org/zh-tw/%E5%8D%A1%E5%A1%94%E5%85%B0%E6%95%B0)，根據維基百科，**其應用之一就是可以找出包含 N 組括號的合法運算式的個數**

## 空間複雜度

- 遞迴深度：$O(2n)$
- 結果列表大小用來保存所有組合可能，一共有 $O(\frac{4^n}{\sqrt{n} \cdot n})$ 個解，每個解長度為 2N，因此儲存所有解需要的空間為 $O(\frac{4^n}{\sqrt{n} \cdot 2n})$

因此整體空間複雜度為 $O(\frac{4^n}{\sqrt{n} \cdot 2n})$