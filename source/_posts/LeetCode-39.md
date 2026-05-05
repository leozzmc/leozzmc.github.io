---
title: 組合之和問題 | Medium | LeetCode#39. Combination Sum
tags:
  - backtracking
  - combinations
  - recursion
  - LeetCode
  - Medium
  - C++
abbrlink: e650f909
date: 2024-09-23 22:14:30
cover: /img/LeetCode/39/cover.jpg
---

# 題目敘述

![](/img/LeetCode/39/question1.png)

![](/img/LeetCode/39/question2.png)

- 題目難度: `Medium`
- 題目敘述: 題目會給一個整數陣列叫做 `candidates` 和一個目標整數 `target`，回傳一系列`candidates`的unique組合，其中對於每種組合中數字的總和要等於 `target`，可以以任何順序回傳各種可能。

{% note info %}
在這個問題中，每個`candidates`中的數字可以被選擇無限次。若至少有一個數字被選擇的次數不同，那麼兩個組合即被視為唯一的。
Ex. `[2,2,3] != [2,2,2,2,3]`
測試案例會保證在給定的輸入下，組成目標數字的唯一組合總數少於 150 個。
{% endnote %}

# 解法

## 一開始的想法

既然是組合問題，那就直接聯想到 Backtracking，另外由於這題與 [**77.Combinations 那篇**](https://leozzmc.github.io/posts/eb632302.html) 不同的是，這個沒有限制層數，因為題目也說了 `candidates` 中的數字可以被重複選擇無限多次，因此終止條件不會跟往常一樣是透過層數來做限制。

而可能會需要透過變數來在每次做選擇時儲存該值，並將變數值傳遞到下一層進行累加，最後在看是否與 `target` 相等。如果不相等就繼續選擇數字，另外與往常不同的是，由於可以重複選擇相同數字，因此進入每一層時，不用跳過原本的數字，可以重選。

## 我的解法

```cpp
class Solution {
public:
    vector<vector<int>> result;
    void combinationHelper(int currentVal, vector<int> &candidate, int target, vector<int> &subResults, int start){
        if(currentVal == target){
            result.push_back(subResults);
            return;
        }
        else if(currentVal < target){
            for(int i=start; i< candidate.size();i++){
                subResults.push_back(candidate[i]);
                //currentVal += candidate[i];
                combinationHelper(currentVal + candidate[i], candidate, target,subResults, i);
                subResults.pop_back();
            }
        }
    }
    vector<vector<int>> combinationSum(vector<int>& candidates, int target){
        vector<int> sub;
        combinationHelper(0,candidates, target, sub, 0);
        return result;
    }

};
```

這裡我們一樣去定義了一個 helper function 來進行主要 backtracking 的處理，以下是參數說明:

- `currentVal`：目前組合中數字的總和
- `candidate`：題目給的數字的列表
- `target`：題目給的目標值
- `subResults`：存放當前的組合的陣列
- `start`：控制數字的起始位置

`if(currentVal == target)` 為遞迴終止條件，代表找到值了。如果目前的總和 `currentVal` 小於目標值 `target`，則繼續從 `candiate`中選擇數字進行組合。這裡通過一個 for 迴圈來遍歷 `candidate`，從索引 `start` 開始從索引 start 開始，以確保不會出現重複組合。 

```cpp
combinationHelper(currentVal + candidate[i], candidate, target, subResults, i)
```
接著每次選擇一個數字 `candidate[i]` 後，將其加入當前的總和 `currentVal`，並繼續遞迴搜索下一個數字。**這裡的 `i` 被傳遞給遞迴函數，意味著同一個數字可以多次選擇**

> 我在這之前犯了一個錯誤就是寫成 `currentVal += candidate[i]` 然後傳遞 `currentVal`，**但由於這樣做會累積 `currentVal 的變化`，無法在遞迴返回後正確還原 `currentVal` 的值，從而影響到整個搜索過程**
 
```cpp
subResults.pop_back()
```

回退到上一個選擇

一旦找到 `target` 後就會將陣列加入到 `result` 陣列中，最後回傳結果。

### 執行結果

![](/img/LeetCode/39/result.png)

# 複雜度

## 時間複雜度

在每一層遞迴中，我們都可以選擇任意的候選數字，這使得每個數字都可以被選擇多次，從而形成大量的組合。 每次選擇一個數字進行遞迴，會產生兩種選擇：**選擇這個數字或不選擇。**
因此，當考慮所有可能的組合時，時間複雜度可以接近 $O(2^n)$

## 空間複雜度

- Recursive Call
在最壞情況下，遞迴的深度取決於目標值 `target`。每次選擇一個數字進行遞迴，當總和不斷累加時，最深的遞迴層數可以達到 $O(target)$
每一層遞迴堆疊將會保存當前的狀態（包括參數），因此在最壞情況下的堆疊空間複雜度是 $O(target)$
- Result storage
`result` 用來存儲所有符合條件的組合。如果找到的組合數量為 `k`，而每個組合的平均長度為 `m`，則結果存儲所需的空間為 $O(k * m)$
在最壞情況下，組合的數量 k 可能接近於 $O(2^n)$，這是因為每個候選數字可以被多次選擇。每個組合的長度 m 在最壞情況下也可能接近於 `target`

因此，整體空間複雜度可以寫作：$O(target+k⋅m)$