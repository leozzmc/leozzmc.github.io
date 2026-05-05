---
title: 組合問題 | Medium | LeetCode#77. Combinations
tags:
  - backtracking
  - combinations
  - recursion
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: eb632302
date: 2024-09-21 13:53:11
cover: /img/LeetCode/77/cover.jpg
---

# 題目敘述

![](/img/LeetCode/77/question.png)

- 題目難度: `medium`
- 題目敘述: 給定兩個整數 `n` 和 `k`，求 `[1,n]` 範圍中，任意 `k` 個數字的所有組合可能，要用二維vector回傳。

{% note info %}
其實數學意義就是要求 $C^{n}_{k} 的答案$
{% endnote %}


# 解法

## 一開始的想法

一開始的大方向也是 backtracking，並且思考方想跟 [46.Permutations](https://leozzmc.github.io/posts/713e66af.html) 很像，骨幹一樣是一個 for 迴圈，迴圈代表每一層中要組合的數字，會去從 `[1,N]` 去進行組合，而由於數字不能重複，因此我們迴圈的初始值會給定一個變數 `start`，並且會在每次進入下一層時，去更新傳入的 `start`參數。如果抵達給定的層這裡也就是題目的 `N`，那就會退回，而這裡為了輸出最終結果，會將陣列添加到儲存最終結果的二維陣列中。 之後如同其他 backtracking 題目一樣，會回退，將原先占用陣列的值pop 出來，以便進行其他選擇。

## 我的解法

```cpp
class Solution {
public:
    vector<vector<int>> result;
    vector<int> subArray;
    void combinHelper(int depth, int K, int N ,vector<int> &result_Subarray, int start){
        if(depth == K){
            result.push_back(result_Subarray);
            return;
        }
        for(int i=start; i<=N; i++){
            result_Subarray.push_back(i);
            combinHelper(depth+1, K, N ,result_Subarray, i+1);
            result_Subarray.pop_back();
        }      
    }
    vector<vector<int>> combine(int n, int k){
        combinHelper(0, k, n ,subArray, 1);
        return result;
    }

};
```

參數說明:

`depth`：當前遞歸的深度，表示已經選了多少個數字
`K`：目標組合大小（即最終選出 `K` 個數字）
`N`：範圍上限（`1` 到 `N` 之間的數字）
`result_Subarray`：目前的部分組合結果
`start`：控制選擇下一個數字時的起始位置，以避免重複選擇相同的數字

遞迴邏輯：

當 `depth == K`，表示已經選了 `K` 個數字，則將當前的組合 `result_Subarray` 放入 `result` 中 。否則，從當前起點 `start` 到 `N` 去遞迴嘗試每個數字，將每個數字加入 `result_Subarray`，遞迴嘗試更大的數字，直到達到目標大小。回到上一層時，利用 `pop_back()` 來撤銷選擇，並且進行下一輪選擇。


### 執行結果

![](/img/LeetCode/77/result.png)

## 更好的做法

看到留言有提到這類型組合問題的答題模板，覺得挺好的也放上來

```cpp
vector<vector<int>> main(...){
    vector<vector<int>>res;  // Store the result, could be other container
    backtrack(res, ...);  // Recursion function to fill the res
    return res;
}

void backtrack(vector<vector<int>>& res, int cur, ..., vector<int>vec){
    if(meet the end critria, i.e. cur reach the end of array){  
        //vec could be a certain path/combination/subset
        res.push_back(vec);
        return;
    }
    // Current element is not selected
    backtrack(res, cur+1, ..., vec);
    // Current element is selected
    vec.push_back(cur); // or could be vec.push_back(nums[cur]), vec.push_back(graph[cur]);
    backtrack(res,cur+1, ..., vec);
}
```

# 複雜度

## 時間複雜度

這段程式碼的時間複雜度主要由遞歸生成組合的過程決定。

組合數量：從 `n` 個元素中選擇 `k` 個的組合數量為 $C(n,k) = \frac{n!}{k!(n-k)!} \times k $ 。這表示最壞情況下生成組合的總數量。

每個組合的生成過程：對於每個組合，向量 result_Subarray 的填充和 pop_back 操作是 $O(k)$，因為每次遞迴會處理一個大小為 k 的子集合。

因此，總的時間複雜度為： $O(C(n,k) \times k) = O ( \binom{n}{k} \times k ) = O( \frac{n!}{k!(n-k)!} \times k )$


## 空間複雜度

- Recursive Call Stack: 由於要選出 `k` 個元素，因此為 $O(k)$
- 組合結果儲存空間，組合存放在 `result` 中，並且每個組合大小維 `k`，並且一共有  $C(n,k)$ 個組合

因此整體空間複雜度會是:  $O(C(n,k) \times k) = O ( \binom{n}{k} \times k ) = O( \frac{n!}{k!(n-k)!} \times k )$