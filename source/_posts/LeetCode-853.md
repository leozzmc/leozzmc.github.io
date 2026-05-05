---
title: 車隊 | Medium | LeetCode#853. Car Fleet
tags:
  - Stack
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 8a24439e
date: 2025-08-30 14:46:55
cover: /img/LeetCode/853/cover.png
---


# 題目敘述

![](/img/LeetCode/853/question.png)

- 題目難度：`Medium`
- 題目描述： 本題給定 `n` 個車輛，其中每輛車需要抵達到終點位置 `target`，第 `i` 輛車的位置為 `position[i]` 第 `i` 輛車的速度為 `speed[i]`，題目中有個規定 **輛車不得超越另一輛車，只能保持相同速度行駛**，也就是說如果後車比前車快，那後車只能降速，降到與前車同等速度一同行駛，這樣就形成一個兩輛車行駛的車隊，題目中另外還有說明，**單獨一輛車也算是車隊的一部份**，題目最終要求，請計算共有多少車隊會抵達終點。

# 解法

## 一開始的想法

核心想法我覺得是首先， **要能夠記錄每輛車當前的位置** ，並且會需要知道每輛車速度與位置之間的關係。但我一開始的想法比較複雜，就是用 pair 或 hasp table 紀錄車輛當前位置跟速度，每一小時就更新車輛位置跟速度，一旦有車隊抵達終點後就不再更新那幾輛車，但這樣可能會有多重迴圈，並且需要額外紀錄是否抵達終點。


## 我的解法


```c++
class Solution {
public:
   int carFleet(int target, vector<int>& position, vector<int>& speed) {
        int n = position.size();
        vector<pair<int, double>> cars(n);
        double timeToTravel;
        for (int i=0; i<n; i++){
            timeToTravel = (double)(target - position[i]) /(double)speed[i];
            cars[i] ={position[i],timeToTravel};
        }
    sort(cars.begin(), cars.end());
    stack<double> fleetStack;
    for(int i=n-1; i>=0; i--){
        if(fleetStack.empty()){
            fleetStack.push(cars[i].second);
        } 
        else{
            if(cars[i].second > fleetStack.top()){
                fleetStack.push(cars[i].second);
            }
        }
    }
    return (int)fleetStack.size();
    }
};
```

這題的重點在於：每輛車抵達終點所需的時間 = **(target - position) / speed** 。我們不需要真的去模擬車子的移動，只要算出 **到達終點的時間**，就能判斷會不會形成車隊。 舉例來說，若時間陣列為 `[1, 1, 3, 5]`：

- 前兩台車到達時間相同 → 在終點會「同時」抵達，因此算一個車隊。
- 第三台車需要 3 小時，前面兩台只需要 1 小時，代表第三台絕對追不上前面 → 形成新車隊。
- 第四台車需要 5 小時，比第三台更慢，因此它也不會追上第三台 → 再形成新車隊。

由此可知，每一個 **比前車更久的時間** 會開啟一個新的車隊

因此只要能夠先由迭代每輛車距離終點還要多久時間，就能夠知道會有多少車隊，這個車輛所需時間就可以放在 stack 當中。 **可以迭代每輛車檢查，如果有車的所需時間比前車少，那就代表他速度更快，需要降速，因此stack內元素不變。**

```
stack:                          |    5    |
                |   3   |       |    3    |
|  1  |    ->   |   1   |   ->  |    1    |
|_____|         |_______|       |_________|

```

這樣我們就能夠知道 **抵達終點時的車隊數量燈同於 stack 內元素數量**

所以在程式碼中，首先需要計算每輛車抵達終點的花費時間，透過一個迴圈來計算，那為了避免整數除不盡，需要用 double 型別來儲存時間，並且需要把當前汽車位置以及所需時間綁定起來，可以透過宣告 `pair` 物件來去儲存。

題目描述中，車輛可能分散在道路上。為了知道「誰在誰前面」，我們必須依 **位置由大到**  排序，確保我們能從最接近終點的車開始處理，但 `sorted` 預設是由小到大，所以知道迭代要從 `n-1` 開始迭代。

之後宣告stack `fleetStack`,利用 stack 來判斷車隊數量
- 從最右邊（接近終點）的車開始往左掃
- 若當前車的抵達時間 大於 stack 頂端時間，代表追不上 → 新車隊
- 否則，時間小於等於 stack 頂端，代表會被併入 → 不新增車隊

而答案就會是 stack 大小

### 執行結果
![](/img/LeetCode/853/result.png)

# 複雜度
時間複雜度
$O(n)$
空間複雜的
$O(n)$
---