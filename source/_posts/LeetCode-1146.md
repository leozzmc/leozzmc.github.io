---
title: 快照陣列 | Medium | LeetCode#1146. Snapshot Array
tags:
  - Array
  - System Design
  - Binary Search
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 22b66efc
date: 2026-05-28 13:46:03
cover: /img/LeetCode/1146/cover.png
---

# 題目敘述

![](/img/LeetCode/1146/question.png)

- 題目難度： `Medium`
- 題目描述： 這題要你實踐一個 `class SnapshotArray` 要支援以下功能：
  - `SnapshotArray(int length)` : 根據給定長度參數 `length` 初始化陣列結構大小，最初每個元素值為0
  - `void set(index, val)`: 將給定 `index` 對應值設定成 0
  - `int snap()`: 對陣列結構進行快照，並且回傳 `snap_id` 這邊的 `snap_id` 會是每次呼叫 `snap` method 次數扣掉 1
  - `int get(index, snap_id)`: 回傳給定 `snap_id` 時間中 `index` 對應的儲存值


# 解法

## 一開始的想法
一開始先釐清主要目標：

- 實踐類似陣列的 DS
- 紀錄每次呼叫 `snap` 次數
- 保存特定 `snap_id` 時刻，陣列結構狀態

這種想法有點偏暴力，我一開始的想法是，透過一個 Hash Table 保存像是 `{ snap_id: array}` 的結構，透過另一個暫存的 `latest_array` 來記錄當前最新的陣列是哪個， `set` 就直接更新 `latest_array`, `snap` 就把 `latest_array` 放入 hash table 並且 snap_id 的計算方式會是先前的 hash table size，因為只要呼叫 `snap` method 才會更新 hash table，snap_id 會等同於呼叫次數減一，因此 snap_id 會等於此次呼叫 snap 之前的 hash table size。 `get` 就是檢查 hash table 並回傳對應陣列值

> 但是想當然這樣做會 MLE, 因為每次更動都會保存完整陣列，而這題的 Constraints 中,每個 method 最多可以被呼叫 50000 次，然後陣列長度最長會是 50000次，這樣最最糟會需要 50000 * 50000 大小空間。**因此另一種做法就是，每次都只記錄狀態變更**

## 我的解法

```c++
class SnapshotArray {
public:
    // record the history of index-value changes
    // format: array=  {index0{{0: +1}{1: -1}}, index1: {{3: -1}},... }
    vector<vector<pair<int, int>>> historyVec;
    int callNum = 0;
    SnapshotArray(int length) {
        historyVec.resize(length);
        for(int i=0; i< length; i++){
            historyVec[i].push_back({0, 0});
        } 
    }
    
    void set(int index, int val) {
        // update exisit value of given index
        auto [latestSnapId, latestSnapValue] = historyVec[index].back();
        if(latestSnapId == callNum) historyVec[index].back().second = val;
        else historyVec[index].push_back({callNum, val});
    }
    
    int snap() {
        return  callNum++;
    }
    
    int get(int index, int snap_id) {
        // find the value that given snap_id <= real snap_id
        vector<pair<int,int>> &searchArray = historyVec[index];
        int leftPair = 0;
        int rightPair = searchArray.size()-1;
        while(leftPair <= rightPair){
            int midPair = leftPair + (rightPair - leftPair)/2;
            if(searchArray[midPair].first == snap_id) return searchArray[midPair].second;
            else if(searchArray[midPair].first < snap_id){
                leftPair = midPair +1;
            }
            else{
                rightPair = midPair-1;
            }
        }
        // after binary search, right pointer will point to the exact snap_id that <= given snap_id
        return searchArray[rightPair].second;
    }
};

/**
 * Your SnapshotArray object will be instantiated and called as such:
 * SnapshotArray* obj = new SnapshotArray(length);
 * obj->set(index,val);
 * int param_2 = obj->snap();
 * int param_3 = obj->get(index,snap_id);
 */
```

這邊用新的結構取代原先的結構：`vector<vector<pair<int,int>>>` 這樣的用意是：
- 外層的 index 對應要實踐的陣列結構 index
- 內層 pair 儲存該 index 在不同快照下的變更紀錄： `<snap_id, val>`

另外在 `set` method 中也需要做改變，當某個 `index` 被修改時，我們需要確認這個 `index` 的歷史資料，分成兩種狀況：
- 先前有呼叫過 `snap` 而我現在要 set新的值
- 前一步沒有呼叫過 `snap` 我現在要直接更新在最新的 snap_id pair

所以需要判斷該index最新 snap_id 跟當前記錄的 `snap` 呼叫次數作比較，如果相等就代表目前紀錄已經是最新，因此直接更新最新的 snap_id Pair 如果不是那就push 一個新的pair進去。

`snap` 的操作變簡單，只要回傳我們 maintain 的呼叫次數記錄就好。最後 `get` 會有蹊蹺，最直接的想法會是直接迭代給定 index 的歷史紀錄 (`vector<pair<int,int>>`) 去找，但是如果單一index 歷史紀錄很長呢？最長也是有機會到 50000次，很容易 TLE，因此這邊的條件會是 **在已排序的陣列中找不大於給定 snap_id 對應的 value 值** 聽起來很繞口，其實就是從一堆 snap pair中找小於等於snap_id 值對應的 value。 這邊因為就是基本的 Binary Search 就不贅述。最終回傳找到的歷史紀錄pair中第二個元素也就是實際儲存值即刻。

### 執行結果

![](/img/LeetCode/1146/result.png)

# 複雜度

時間複雜度
- `set()`: $O(1)$
- `snap()`: $O(1)$
- `get()`: $O(logK)$ 每次排除一半元素，假設 $k$ 是該 `index` 被修改的次數

空間複雜度

$O(L + S)$: $L$ 是初始化陣列長度, $S$ 會是透過 `set()` 修改的總次數


---