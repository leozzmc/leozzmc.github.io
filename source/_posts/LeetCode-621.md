---
title: 任務排程器 | Medium | LeetCode#621. Task Scheduler
tags:
  - Heap
  - Priority Queue
  - LeetCode
  - Array
  - Greedy
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/621/cover.png
abbrlink: 766819da
date: 2025-09-11 20:29:51
---

# 題目敘述

![](/img/LeetCode/621/question.png)

- 題目難度：`Medium`
- 題目描述：題目給了一個陣列 `tasks` 裡面有許多不同中類的任務要丟給CPU執行，任務種類有 A~Z，每個 CPU Interval 可以選擇執行完成一個任務或者空閒。任務可以以任何順序執行，但有個條件 **任何兩個相同種類的任務，執行時需要相隔 `n` 個 intervals** ， 請回傳完成所有任務時，CPU所需的最少 intervals。


# 解法

## 一開始的想法

一開始比較偏向暴力去解，就是宣告一個 hash table 來儲存每個任務類型的剩餘等待間隔為多少，透過遞迴去找最小intervals 解，但這樣容易 TLE，並且這樣的做法沒有考慮到 **到底要不要放idle** 這件事。

```c++
class Solution {
public:
    unordered_map<char, int> taskCount = {
        {'A',0},{'B',0},{'C',0},{'D',0},
        {'E',0},{'F',0},{'G',0},{'H',0},
        {'I',0},{'J',0},{'K',0},{'L',0},
        {'M',0},{'N',0},{'O',0},{'P',0},
        {'Q',0},{'R',0},{'S',0},{'T',0},
        {'U',0},{'V',0},{'W',0},{'X',0},
        {'Y',0},{'Z',0}
    };

    int helper(vector<char>& tasks, int index, int n){
        if(index == tasks.size()){
            return 0; 
        }

        int res = INT_MAX;

        if(taskCount[tasks[index]] == 0){
            taskCount[tasks[index]] = n; 
            res = min(res, 1 + helper(tasks, index+1, n));
            taskCount[tasks[index]] = 0; 
        } else {
            taskCount[tasks[index]]--;
            res = min(res, 1 + helper(tasks, index+1, n));
            taskCount[tasks[index]]++; 
        }

        return res;
    }

    int leastInterval(vector<char>& tasks, int n) {
        return helper(tasks, 0, n);
    }
};

```

## 我的解法


```c++
class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        priority_queue<int> maxHeap;
        vector<int> charCount(26, 0);
        for(char c: tasks){
            charCount[c-'A']++;
        }
        sort(charCount.begin(), charCount.end());
        for(int i=0; i<charCount.size(); i++){
            if(charCount[i]>0){
                maxHeap.push(charCount[i]);
            }
        }
        int intervals=0;

        while(!maxHeap.empty()){
            vector<int> temp;
            int cycle = n+1;
            while(cycle>0 && !maxHeap.empty()){
                int count = maxHeap.top();
                if(count-1 > 0 )temp.push_back(count-1);
                maxHeap.pop();
                intervals++;
                cycle--;
            }

            for(int t: temp){
                maxHeap.push(t);
            }
            //pedding idles
            if (!maxHeap.empty()) {
                intervals += cycle;
            }
        }
        return intervals;
    }
};
```


其實另外的做法就是透過 Piritory Queue去解，舉體思路如下：
1. 先算出字母頻率，然後放入 maxHeap (最多的任務放最上面)
2. 每一輪最多可以排 `n+1` 個不同任務：
    - 從 heap 拿出最多的任務，執行一次（`count--`）
    - 若該任務還有剩餘次數，就暫存在一個 `temp` 陣列裡，等這輪結束再放回 heap
3. 一輪最多跑 `n+1` 步，如果這輪沒把 heap 清空 → 要補上 idle
4. 重複直到 heap 清空

> **這裡解釋為何要用 maxHeap:**
> 先把頻率高的任務拿出來排，等於把它們當「骨架」分佈在時間軸上。每次排完某任務就會有一段長度為 `n` 的冷卻「空隙」，這些空隙能被頻率較低的任務塞進去。越早把高頻任務鋪開，越多空隙能被其他任務填滿，idle 就越少，intervals 就越小

> **為何是 `n+1` ?**
> 因為題目的條件會是如果有兩個相同的任務，它們之間必須間隔至少 `n` 個不同任務或 idle，也就是說，當你執行了一個任務後，要「等 n 步」它才能再出現。 所以今天如果出現 `A`任務，那從這個`A` 到下個 `A` 出現一共會佔掉 `n+1` 個intervals


以下講解code的部分：
首先定義 priority queue 會是 `maxHeap`，並且我們需要一個額外紀錄任務類型頻率的陣列 `charCount`，這便迭代 `tasks` 並計算個別任務出現次數，同樣對於CPU來說，也代表 **每個字母還剩幾次要做**

之後會需要把大於0，也就是實際有出現的任務類型的次數，推入 `maxheap` 當中。這時候 `maxHeap` 的 top 會是出現次數頻率最高的任務。接著宣告用於記錄用的 `intervals`。這裡即將開始插空隙：起初我們會宣告一個陣列 `temp` 它的用途是用來放本輪 (`cycle`)中被拿來執行過，但仍有剩餘次數的那些任務，等差這輪結束後再丟回 heap。

`cycle` 則代表本輪剩餘可排列的格子數，起初會是 `n+1` 每安排一次任務或idle 就會減一。所以一開始宣告 `cycle = n+1` 之後當這輪結束前就會去拿去排格子，具體行為就是要去把 heap中的任務拿出來 (`int count = maxHeap.top();`) 扣一後，然後放入 `temp` 此時就代表這輪中排了一個任務，`cycle--`然後 `interval` 增加。內層迴圈在插入一個任務後，就會從 heap中選另一個剩餘次數最高的任務起來做，之後一樣丟入 `temp` 重複步驟

{% hideToggle 步驟舉例  ,bg,color %}
以範例 tasks = [A,A,A,B,B,B ], n = 2 逐輪說明
### 初始化
- `charCount`: A=3, B=3，其餘 0
- `maxHeap`: [3, 3]（順序表示堆中值，不是排序陣列）
- `intervals` = 0

### 第 1 輪（`cycle = 3`）
- 取出 3（A）→ 做一次，剩 2 → `temp = [2]`，`intervals = 1`，`cycle = 2`
- 取出 3（B）→ 做一次，剩 2 → `temp = [2,2]`，`intervals = 2`，`cycle = 1`
- 已空，內圈結束
- 把 `temp` 的 [2,2] 丟回堆 → `maxHeap` = [2,2]
- 堆還不空，代表這一輪剩下 1 格要補 idle → `intervals += cycle(=1)` → `intervals = 3`

### 第 2 輪（`cycle = 3`）
- 取出 2（A）→ 做一次，剩 1 → `temp = [1]`，`intervals = 4`，`cycle = 2`
- 取出 2（B）→ 做一次，剩 1 → `temp = [1,1]`，`intervals = 5`，`cycle = 1`
- 堆已空，內圈結束
- 丟回 `temp`→ `maxHeap = [1,1]`
- 堆還不空 → 補 idle 1 格 → `intervals = 6`

### 第 3 輪（`cycle = 3`）
- 取出 1（A）→ 做一次，剩 0 → 不進 `temp`，`intervals = 7`，`cycle = 2`
- 取出 1（B）→ 做一次，剩 0 → 不進 `temp`，`intervals = 8`，`cycle = 1`
- 丟回 `temp`（空）→ 堆為空
- 堆已空 → 不需要補 idle（因為全部完成了）

最後 `intervals = 8`，對應排程： `A, B, idle, A, B, idle, A, B`

{% endhideToggle %}


### 執行結果

![](/img/LeetCode/621/result.png)


# 複雜度

時間複雜度： $O(N)$, N 為 `task.size()`

空間複雜度: $O(1)$，頻率表為 $O(26)$, 而 `maxHeap` 當中最多 K個元素為，$O(K)$ K在本題為26算是固定限制，因此會是 $O(1)$

---