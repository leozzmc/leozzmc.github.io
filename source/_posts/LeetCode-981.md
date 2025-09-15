---
title: 基於時間的鍵值對儲存 | Medium | LeetCode#981. Time Based Key-Value Store
tags:
  - Hash Table
  - Binary Saerch
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/981/cover.png
abbrlink: 5d887d47
date: 2025-09-15 17:48:20
---

# 題目敘述

![](/img/LeetCode/981/question.png)

- 題目難度：`Medium`
- 題目描述： 題目要求設計一個 time-based 的 key-value 儲存結構，可以相同key可以儲存多種值並且對於相同Key可以有多個不同的timestamp，並且用戶可以透過特定 timestamp 獲取值

{% note info %}
請實踐一個 `TimeMap` class:
- `TimeMap()` 用於初始化物件
- `void set(String key, String value, int timestamp)`: 在給定 `timestamp` 條件下， 儲存 `value` 到對應到特定的 `key` 上
- `String get(String key, int timestamp)`: 回傳先前透過 `set` 函數儲存的值，並且請找出小於等於當前 `timestamp` 的timestamp。如果有多個值，請回傳具有最大但小於 `timestamp` 的 timestamp 值。若沒有值，則回傳 `""` 
{% endnote %}


# 解法


## 我的解法


```c++
class TimeMap {
public:

    // {{key, timestamp},value}
    unordered_map<string, vector<pair<string, int>>> umap;
    TimeMap() {}
    
    void set(string key, string value, int timestamp) {
        // Since it' push back, the timestamp is strictly increasing
        umap[key].push_back({value, timestamp});
    }
    
    string get(string key, int timestamp) {
        // find item
        if(umap.find(key)!=umap.end()){
            // find timestamp <= given timestamp
            // binary search
            int left = 0;
            int right = umap[key].size()-1;
            string returnString="";

            while(left <= right){
                int mid = left + (right - left) /2;
                if(umap[key][mid].second > timestamp){
                    right = mid-1;
                }
                else if (umap[key][mid].second <= timestamp){
                    returnString = umap[key][mid].first;
                    left = mid + 1;
                }
            }
            return returnString;
        }
        else{
            return "";
        }
    }
};

/**
 * Your TimeMap object will be instantiated and called as such:
 * TimeMap* obj = new TimeMap();
 * obj->set(key,value,timestamp);
 * string param_2 = obj->get(key,timestamp);
 */
```

我的想法也蠻簡單的，其實就是要先有個結構能夠同時有key跟value 跟不同的 timestamp，直覺想到使用 Hash Table 只是可能要變化一下，首先宣告成員變數 `umap` 這邊希望儲存結構會是長成 ` {key, {value, timestamp}}`

```c++
unordered_map<string, vector<pair<string, int>>> umap
```

在 `set` 函數就比較直覺，直接把input 中的 `value`, `timestamp` 包成pair 放入 `umap[key]` 這邊由於是 `push_back` 且題目呼叫的 timestamp 會是由小到大呼叫，因此在 `umap[key]` 當中的pair中的timestamp 會是嚴格由小到大排序。

再來是 `get` 函數，這邊如果在 `umap` 中找不到 key 就會直接回傳 `""`。如果有找到，由於已經排序好了，因此目標要找小於當前的 `timestamp` 值中最大的那個，因此 **已排序陣列找特定元素，要用 Binary Search**， 這邊宣告兩個變數 `left` 和 `right`來執行二元搜尋。

```c++
while(left <= right){
    int mid = left + (right - left) /2;
    if(umap[key][mid].second > timestamp){
        right = mid-1;
    }
    else if (umap[key][mid].second <= timestamp){
        returnString = umap[key][mid].first;
        left = mid + 1;
    }
}
```

這邊一旦發現中間值的 timestamp 比input的 timestamp值大，那就需要收窄 `right`，而如果中間值的 timestamp 比input的 timestamp值小，代表我們在正確的範圍，需要持續收窄 `left` 並且將 `returnString` 指定為 value (`umap[key][mid].first`) 步驟持續直到搜索完畢，最後回傳 `returnString`

### 執行結果

![](/img/LeetCode/981/result.png)

# 複雜度

時間複雜度 $O(LogN)$

空間複雜度 $O(N)$

---