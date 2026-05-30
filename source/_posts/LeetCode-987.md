---
title: 二元樹的垂直走訪 | Hard | LeetCode#987. Vertical Order Traversal of a Binary Tree
tags:
  - Hash Table
  - BFS
  - DFS
  - Queue
  - Sorting
  - Binary Tree
  - LeetCode
  - Hard
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 5d37ec65
date: 2026-05-30 13:56:11
cover: /img/LeetCode/987/cover.png
---

# 題目敘述


![](/img/LeetCode/987/question-1.png)

![](/img/LeetCode/987/question-2.png)

![](/img/LeetCode/987/question-3.png)

- 題目難度： `Hard`
- 題目描述： 這題給定二元樹的 `root`, 要我們實踐垂直走訪二元樹

這邊題目解釋垂直走訪的定義，每個節點都有位置 `(row, col)`， 而 left children 的座標相對於 root 會是 `(row+1, col-1)` 反之 right children 的座標會是 `(row+1, col+1)` 。 垂直走訪的意思是由上而下，由左而右的方式開始走訪，起點會是最左側的節點，接著會是下一個 column 依序走訪，而在 column 當中最後回傳的走訪順序，同column 需按照節點值大小由小排到大。也會有多個節點存在於相同座標的情況，也一樣依照節點值排序。最終輸出走訪順序。 

# 解法

## 一開始的想法

這題一開始想法有點歪掉，原本是想說如果把最左側當成新的root, 橫的進行BFS，然後依序把下一column 丟到queue，但這樣還會需要用複雜的邏輯紀錄每個節點的parents是誰，挺麻煩。

後來換了想法，其實題目給的座標很方便，**要是我們有個結構同時存放節點值跟座標的關聯，那就只要迭代最終這個節點，按照 column 順序輸出即可。**


> 所以這邊值跟位置的關聯要怎樣實作？


我起初的想法是建立一個 map: `{{rol, col}: {values}}` 然後建立一個 queue: `{tree node pointer, {pos}}`。

這樣的話我們只要正常進行一般的BFS 然後只要當前節點的左子樹存在，就把左子樹跟它的位置(當前row+1, 當前col-1) 推入 queue中，右子樹也照做 (當前row+1, 當前col+1)。然後我們再處理每一層的時候就把當前的座標跟值存放入 map 中。

**也就是說，目的其實是想透過正常的走訪，正常的BFS，來去載每一層節點更新自己的的座標關聯，同步下一層資訊推入queue中進行處理。** 這樣之後只要再去迭代座標跟值的關聯，應該就可以輕鬆輸出走訪順序。


但我BFS 結束後再去迭代map，如果按照我原本的 map 結構，在後續迭代過程中 map會沒辦法正確用 column 進行排序，因此下面是修正版本。

## 我的解法

```c++
vector<vector<int>> verticalTraversal(TreeNode* root) {
        if(root==nullptr) return {};
        // format: {col: {row: {val1, val2,...} }}
        map<int, map<int, vector<int>>> nodePack;
        // format: {root*, {row, col}}
        queue<pair<TreeNode*, pair<int,int>>> nodePos;
        
        // BFS, add position information
        nodePos.push({root, {0,0}});

        while(!nodePos.empty()){
            int size = nodePos.size();

            // process level
            for(int i=0; i< size; i++){
                TreeNode* curr = nodePos.front().first;
                auto [currRow, currCol] = nodePos.front().second;
                nodePos.pop();

                nodePack[currCol][currRow].push_back(curr->val);

                if(curr->left){
                    nodePos.push({curr->left, {currRow+1, currCol-1}});
                }
                if(curr->right){
                    nodePos.push({curr->right, {currRow+1, currCol+1}});
                }

            }

        }

        // process nodePack
        vector<vector<int>> output;
        for(auto& [col, rowMap]: nodePack){
            vector<int> colGroup;
            for(auto &[row, values]: rowMap){
                sort(values.begin(), values.end());
                colGroup.insert(colGroup.end(), values.begin(), values.end());
            }
            output.push_back(colGroup);
        }
        
        return output;
    }
```

這邊把 map 結構改成： `map<int, map<int, vector<int>>> nodePack;` 也就是用 col 當成最外層的 key，實際儲存資料格式看起來會像

```
format: {col: {row: {val1, val2,...} }}
```

這樣最終在迭代時，對於每個 column 值，宣告一個陣存陣列 `colGroup`，我們對 `row` 當中的 數值陣列排序後，再insert 到 `colGroup.end()` ，這樣就可以確保不同 row 對應的 節點值 array 依序添加到 colGroup 尾端。這樣最後再輸出回傳陣列即可。


### 執行結果

![](/img/LeetCode/987/result.png)

> 想出想法時間大概:20min, 經過改良後，最後AC大概是1小時，也是挺花時間

# 複雜度

時間複雜度: $O(NlogN)$
- $O(N)$: BFS
- $O(\log N)$: `std::map` 插入

map 的底層是紅黑樹(一種Balanced Binary Search Tree), 每次執行 `nodePack[currCol][currRow].push_back(...)` 時，系統需要花時間在 map 中尋找或插入 `currCol` 和 `currRow`。單次查找/插入的時間大約是 $O(\log N)$，因為有 $N$ 個節點，所以總共是 $O(N \log N)$

空間複雜度: $O(N)$

- $O(N)$: queue 會放N個節點
- $O(N)$: Nested Map, 紀錄所有 `row`, `col` 以及所有節點 `val`，一定會裝滿 `N` 個節點
- $O(N)$: output vector


---