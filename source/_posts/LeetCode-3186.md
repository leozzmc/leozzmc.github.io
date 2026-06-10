---
title: 施咒最大總傷害 | Medium |LeetCode#3186. Maximum Total Damage With Spell Casting
tags:
  - Dynamic Programming
  - DFS
  - Map
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/3186/cover.png
abbrlink: 1860e9ce
date: 2026-06-09 14:20:22
---


# 題目敘述


![](/img/LeetCode/3186/question.png)

- 題目難度： `Medium`
- 題目描述： 題目說明一個巫師會多種不同的咒語，給定一個 `power` 陣列，其中每個元素代表咒語的傷害值，多個咒語可以有相同的傷害值。已知巫師想要施展咒語時，可以選擇 `power[i]` 一旦選擇後，則不能選擇傷害值為 `power[i]-2`, `power[i]-1`, `power[i]+1`, `power[i]+2` 的咒語。 每個咒語只能使用一次，請回傳完巫師可以施展咒語的 **最大可能攻擊量。**


# 解法

## 一開始的想法

一開始最直觀就是暴力解，透過雙層迴圈來去迭代 `power` array 每個外層回圈結尾保存一個當前的最大攻擊值，而內層迴圈找可以施展咒語 (`> 外層傷害值+2` 或者 `<外層傷害值-2` ) 但這樣做肯定最後會 TLE。

## 我的解法

這邊顯然會是一個 DP 問題，因此會有兩種做法：Recursion 或 Iteration。 我自己認為 recursion 還是最直觀，但是並不是最優美的做法


Recursion + Memoization


```c++
class Solution {
public:
    vector<long long> memo;
    vector<int> keys;
    map<int, long long> dmg_map;

    long long dfs(int index){
        if(index >= keys.size()) return 0;

        // if found, return directly
        if(memo[index]!= -1) return memo[index];

        long long skip = dfs(index+1);

        long long take = dmg_map[keys[index]];
        int next_index = index+1;
        while(next_index < keys.size() && keys[next_index] <= keys[index]+2){
                next_index++;
        }

        take += dfs(next_index);

        return memo[index] = max(take, skip);
    }


    long long maximumTotalDamage(vector<int>& power) {
        int n = power.size();
        for(int i=0; i<n ;  i++){
            dmg_map[power[i]] += power[i];
        }

        for(auto &pair: dmg_map){
            keys.push_back(pair.first);
        }
        
        memo.resize(n, -1);

        return dfs(0);
        
    }
};
```




Iteration:

```c++
class Solution {
public:
    long long maximumTotalDamage(vector<int>& power) {
        map<int, long long> dmg_map;
        for(int p: power) dmg_map[p] +=p;
        
        vector<int> keys;
        for(auto &pair: dmg_map){
            keys.push_back(pair.first);
        }

        int n = keys.size();
        vector<long long> dp(n, 0);
        dp[0] = dmg_map[keys[0]];

        for(int i=1; i<n; i++){
            long long skip = dp[i-1];

            long long take = dmg_map[keys[i]];
            int prev = i - 1;
            while(prev >=0 && keys[prev] >= keys[i]-2){
                prev--;
            } 
            if(prev>=0) take += dp[prev];

            dp[i] = max(take, skip);

        }
        return dp[n-1];
    }
};
```

不論是哪種做法，這兩題的子問題就是: **當前的傷害值，可以跳過或拿取**

對於 Recursion而言

- 跳過：什麼都不做，直接走到下一關 `dfs(index+1)`  
- 拿取：將眼前的傷害值收到口袋，但是作為代價，必須跳過會衝突的傷害值，直接走到合法的關卡 `dfs(next_i)`

因為可能透過不同路徑選到相同的傷害值，為了避免重複運算，只要當前傷害值選過了，就把最高值紀錄在小本本裡 (`memo`) 下次直接抄答案就好。 



對於 Iteration 而言，邏輯會是反的，不是問未來我能夠拿多少傷害值，問題會變成 **如果只能選到第 i 咒語，我最多能選出多少攻擊值**，所以一樣從左掃描 `power` 到右邊，每走到一個新數字就會面臨兩個選擇：

- 跳過：當前最高分爲上一關的總攻擊值 
- 拿取：我拿走現在的攻擊值，然後透過計分班查上一格不衝突的咒語的最高分，並累加起來


上面會是主要DP邏輯，再來來談資料結構的選擇，這裡使用 `std::map` 的原因是因為DP決策需要由小到大處理數字，所以幫你做 Key-Value 的合並累加的同時也幫你排序好了，再來就是我們需要把不重複得數字從`map` 中提取出來，好方便迭代進行DP，因為題目允許不同咒語有相同攻擊值，所以只要選前面就先把相同攻擊值的作為key 並且傷害值累加過了。

### 執行結果


![](/img/LeetCode/3186/result.png)


# 複雜度

時間複雜度

$O(N Log N)$: 迭代長度為 $K$ 的陣列，之後把數字塞進 `map` 因為 `map` 底層是紅黑樹，單次插入時機會是 O(LogK)，所以最差狀況下 $K=N$

空間複雜度

$O(N)$: 對於每個獨特數字 (共 $k$ 個) 只會計算一次而已


---