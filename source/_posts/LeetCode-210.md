---
title: 課程表 | Medium | LeetCode#210. Course Schedule II
tags:
  - Graph
  - DFS
  - Cycle
  - Topological Sort
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 975d3897
date: 2025-02-18 11:26:53
cover: /img/LeetCode/210/cover.png
---


# 題目敘述

![](/img/LeetCode/210/question.jpeg)

- 題目難度： `Medium`
- 題目描述： 總共有 `numCourses` 課程需要上，他們被標注為 `0` - `numCourses-1`，給定一個陣列 `prerequisites` 其中 `prerequisites[i] = [a_i, b_i]` 代表你需要先上過 `b_i` 課你才夠去上 `a_i` 課程。舉例來說，`[0,1]` 代表你需要先上課程 `1` 才能夠去上課程 `0`，請以陣列形式回傳上完所有課程的休課順序，如果沒辦法完成請回傳空陣列。

> 這題基本上是接續 [LeetCode-207 Course Schedule](https://leozzmc.github.io/posts/55e11871.html)，只不過上一題是判斷能否修完課，這題是要把修課順序印出來

# 解法

## 一開始的想法

不能修完課的狀況就是同時存在 `[0,1]`, `[1,0]` 因為順序就反了，會在Graph中構成 Cycle， **因此如果這是有向無環圖(DAG) 則可透過 topological sort 印出依序走訪完全部課程的路徑，如果有cycle 就回傳空陣列。**

## 我的解法

```c++
class Solution {
public:
    vector<list<int>> AdjList;
    bool hasCycle(int v, vector<int> &visited, stack<int> &finishStack){
        visited[v] = 1;
        for(int neighbor: AdjList[v]){
            if(visited[neighbor] == 1) return true;
            if(visited[neighbor]==0 && hasCycle(neighbor, visited, finishStack)) return true;
        }
        visited[v] = 2;
        finishStack.push(v);
        return false;
    }

    vector<int> findOrder(int numCourses, vector<vector<int>>& prerequisites) {
        int m = numCourses;
        vector<int> visited(m, 0); // 0:unvisited, 1:visiting, 2: finished
        stack<int> finishStack; 

        // Construct Adj list
        AdjList.resize(m);
        for(auto &pre: prerequisites){
            AdjList[pre[1]].push_back(pre[0]);
        }

        // First DFS
        for(int i=0; i<m;i++){
            if(visited[i]== 0 ){
                if(hasCycle(i, visited, finishStack)) return {};
            }
        }

        // Push finished node to stack
       vector<int> returnVector;
       while(!finishStack.empty()){
            int  vertex = finishStack.top();
            finishStack.pop();
            returnVector.push_back(vertex);
       }
       return returnVector;
    }
};
```

> Topological Sort 的重點就是要先執行一次 DFS 然後將按照完成時間將節點由finish時間晚到finsh時間早的順序吐出 (先將越早完成四周節點搜尋的節點push到stack)


首先來看 `findOrder` 題目中給的參數 `prerequisites` 並不是 Adjacency List 因此會需要將輸入參數轉換成 Adjacency List 我們宣告了一個global list `AdjList` 來儲存。另外在函數內部宣告了整數的 `visited` 陣列來保存節點造訪狀態， `0` 代表未造訪, `1` 代表造訪中, `2` 代表造訪完畢。另外宣告一個Stack  `finishStack` 按照順序保存造訪完畢節點。

DFS 的部分可以用來判斷 cycle 因此我們將函數命名為 `hasCycle`，每次造訪節點就會將對應的 `visited` 標注為 `1` (`visited[v] = 1;`) 接著需要去迭代當前節點的四周鄰居，這裡就需要透過剛剛建構得 `AdjList`  來去知道當前節點 `v` 的四周接鄰節點有哪些。

如果 `visited[neighbor] == 0` 代表節點尚未訪問，繼續進行DFS

如果 `visited[neighbor] == 1` 表示 `neighbor` 已經在 **訪問中** (也就是DFS 還沒結束)，這代表圖中會有一條 **回邊 (back edge)**


舉例：
```
numCourses = 2;
prerequisites = {{1, 0}, {0, 1}};


0 → 1
↑   ↓
1 ← 0
```

- `0` 訪問中 (`visited[0]=1`)
- 進入 `1` (`visited[1]=1`)
- `1` 指向 `0` ， 但是 `0` 是訪問中 (`visited[0]=1`)
- 發現有環，回傳 `true`

**所以只要發現有 `visited[neighbor]=1` 就代表該 `neighbor` 已經正在DFS 存在於 Call Stack 當中，已經開始循環。** 如果 `visited[neighbor] == 2` 代表完成訪問，以該節點進行的DFS已經結束，這時可以將該節點push 到 `finishStack` 中。

所以回到函數 `findOrder` 一旦DFS 時最後回傳回來是 `true` 就代表有環，直接回傳空陣列，如果沒有環，那就代表 `finishStack` 中已經有排序好的節點，將stack中元素依序Pop出來存進回傳陣列中，最後回傳陣列即可。

### 執行結果

![](/img/LeetCode/210/result.jpeg)

# 複雜度

## 時間複雜度
- 建立Adjacency List: $O(E)$, `prerequisites` 中共有 $E$ 條邊，每條邊都要插入 `AdjList` 所以是 $O(E)$
- 遍歷所有課程：$O(V)$, 一共 $V$ 個課程，最壞情況下會對每個課程執行一次 DFS
- DFS：$O(V+E)$ 每個節點都只會被訪問一次，而每條邊也都只會訪問一次
- Stack 轉陣列：$O(V)$
  

整體而言會是 $O(V+E)$
## 空間複雜度

- `AdjList` $O(V+E)$
- `visited` $O(V)$
- stack $O(V)$

整體會是 $O(V+E)$

---