---
title: 腐爛中的橘子 | Medium | LeetCode#994. Rotting Oranges
tags:
  - Graph
  - BFS
  - Queue
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 873eb125
date: 2025-01-03 15:01:26
cover: /img/LeetCode/994/cover.png
---

# 題目敘述

![](/img/LeetCode/994/question.jpeg)

- 題目難度： `Medium`
- 題目描述： 給定一個 `m x n` 大小的矩陣叫做 `grid` ，其中每一格可能會這三種值其中一種： (1) `0` 代表那格是空的 (2) `1` 代表新鮮橘子 (2) `2` 代表腐爛橘子。每分鐘在腐爛橘子四周的(上下左右)其他新鮮橘子都會腐爛，請回傳整個 `grid` 中所有新鮮橘子都腐爛最少需要幾分鐘，如果不可能全都腐爛，則回傳 `-1` 


# 解法

## 一開始的想法

我原先認為這題就是要將腐爛橘子作為搜尋起點，然後BFS走訪附近的新鮮橘子，並且計算距離，每多走一格就會變成腐爛橘子，最後回傳最小距離就好。但後來發現這樣不符合題意，因為題目的要求是每一分鐘腐爛過子四周的新鮮橘子也會變腐爛，原先的做法會忽略了 **「一輪 BFS 表示一分鐘」的關鍵邏輯。** 腐蝕的時間應該是按 **層數**來計算，而非單純依照單一節點的距離。並且在BFS結束後，可能還是會有新鮮橘子存在(可能是分隔在其他cell中)， **所以為了判斷最後是否還有新鮮橘子存在，需要一個變數再一開始就紀錄有多少新鮮橘子，並且在BFS走訪過程，每經過一層，就會將路過的新鮮橘子數量扣除。這樣最後就能判斷是否還有剩新鮮橘子**

## 我的解法

```c++
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid){
        int m = grid.size();
        int n = grid[0].size();
        int minute = 0;
        int freshCount = 0;
        int offsetRow[4] = {1,0,-1,0};
        int offsetCol[4] = {0,1,0,-1};
        queue<pair<int,int>> q;

        for(int i=0; i<m;i++){
            for(int j=0; j<n; j++){
                if(grid[i][j] == 2){
                    q.push({i,j});
                }
                else if(grid[i][j]==1){
                    freshCount++;
                }
            }
        }

        while(!q.empty() && freshCount >0){
            int size = q.size();
            for(int i =0; i< size;i++){
                    pair<int,int> current = q.front();
                    q.pop();
                    for(int k=0; k<4; k++){
                        int subRow = current.first + offsetRow[k];
                        int subCol = current.second + offsetCol[k];
            
                        if(subCol >=0 && subCol < n && subRow >=0 && subRow < m && grid[subRow][subCol]==1){
                            grid[subRow][subCol]=2;
                            freshCount--;
                            q.push({subRow,subCol});
                        }
                    }
            }
        minute++;

        }
        return freshCount == 0 ? minute : -1;
    }
};
```

這題跟 [LeetCode#286. Walls and Gates](https://leozzmc.github.io/posts/79e94c86.html) 很像，一樣先把符合條件的搜尋起點 Push 進入 queue中 (`q.push({i,j});`) ，這裏也順便紀錄新鮮橘子的數量 (`freshCount`)，接著就是要以腐爛橘子作為起點來進行BFS，同時如果已經沒有新鮮橘子的話 BFS就可停止 (`while(!q.empty() && freshCount > 0)`) ，這裡有個關鍵，**每分鐘腐爛橘子的四周都會變腐爛** ， 這就代表若要將新鮮橘子更新為腐爛橘子，會需要以 Level 來進行，這裡可以回想成以前樹的 Level-Order Traversal，而每往下一層就會腐爛，意思是一樣的，只不過這裡會是Graph。腐蝕的時間應該是按層數來計算，因此我們透過變數 `size` 來保存這一層vertex數量，然後依序去作為搜尋起點找四周的新鮮橘子，如果四周節點在 `grid` 範圍內並且為新鮮橘子 (`grid[subRow][subCol]==1`) 則將該橘子更新為腐爛橘子 `grid[subRow][subCol]=2;` 並且減少 `freshCount` 數量，然後將腐爛橘子push 進入 queue 作為下一層的搜尋起點。 每一層搜尋結束後，都會多一分鐘，因此需要更新 `minute`。 函數的最後如果還有新鮮橘子則回傳 `-1` 如果沒有則回傳 `minute`。


### 執行結果

![](/img/LeetCode/994/result.jpeg)

# 複雜度

時間複雜度

$O(m \times n)$ = $O(m \times n)$ + $O(m \times n)$ 

$m \times n$ 為 `grid` 大小， 另外最壞狀況下 queue中可能會有 $m \times n$ 個節點要處理，因此整體複雜度為 $O(m \times n)$

空間複雜度

$O(m \times n)$ queue 最糟糕狀況可能同時儲存 $m \times n$ 個節點

---