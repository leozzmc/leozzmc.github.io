---
title: 每日溫度 | Medium | LeetCode#739. Daily Temperatures
tags:
  - Stack
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 6dcce06b
date: 2025-04-11 22:13:55
cover: img/LeetCode/739/cover.png
---

# 題目敘述

![](/img/LeetCode/739/question.png)

- 題目難度：`Medium`
- 題目描述： 給定一個整數陣列 `temperatures` 代表每天的氣溫，請回傳一個陣列 `answer`，`answer[i]` 代表你必須再等 `i-th` 天才能夠獲得一個更溫暖的天氣，如果接下來幾天的天氣不可能變更溫暖，則 `answer[i] == 0`。

# 解法

## 一開始的想法

我一開始的想法會是，如果隔天溫度比今天溫度低，則將氣溫丟入 Stack 中，但是這樣會有問題，你要額外紀錄當初第一個push進入 stack 的 Index 這樣再回傳陣列的時候才能夠知道從哪個 index 會隔多少天才能夠溫度提升。

這樣不如直接用 Stack 紀錄 index 本身。

## 我的解法

```c++
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures){
        if(temperatures.size()==1) return {0};
        vector<int> returnVec(temperatures.size(), 0);
        //Store vector index
        stack<int> tempStack;
        for(int i=0; i<temperatures.size(); i++){
            while(!tempStack.empty() && temperatures[i] > temperatures[tempStack.top()]){
                int prevIndex = tempStack.top();
                tempStack.pop();
                returnVec[prevIndex] = i - prevIndex;
            }
            tempStack.push(i);
        }
        return returnVec;
    }
};
```

`dailyTemperatures` 當中首先紀錄了當 `temperature` 只有一天溫度的狀況，這樣直接回傳 `{0}`， 接著宣告回傳陣列 `returnVec` 其長度為天數，等同於 `temperature.size()` 並且需要初始化為0。

接著宣告整數 Stack 為 `tempStack` 用來存放代表第幾天的 index。接著需要去迭代不同日期的溫度，在每一天當中，如果 stack 不為空，並且當日溫度比起 stack 中存放的之前的溫度還要高，則代表先前溫度的日期 `prevIndex` 與當前日期相差 `i - prevIndex` 天數。 如此迭代每一天的溫度，即可獲得正確的 `returnVec`

> 這種Stack 的用法相對於我原先的想法就方便多了，因為不需額外的資料結構來儲存溫度對應的index值。


### 執行結果

![](/img/LeetCode/739/result.png)

# 複雜度

時間複雜度: $O(n)$
- 每個元素最多 被 push 一次 到 stack 中
- 每個元素最多被 Pop 一次
- Push 跟 Pop 的總數不會超過 n
空間複雜度: $O(n)$
- `returnVec` 長度為 n 的輸出陣列
- `tempStack`   最壞狀況下可能需要放 n 個 index

---