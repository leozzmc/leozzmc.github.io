---
title: 兌換零錢 | Medium | LeetCode#322. Coin Change
tags:
  - Dynamic Programming
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
toc: true
abbrlink: 35e03d8a
date: 2024-11-13 11:18:25
cover: /img/LeetCode/322/cover.png
---

# 題目敘述

![](/img/LeetCode/322/question.jpeg)

- 題目難度： `Medium`
- 題目敘述： 給定一個整數陣列 `coins`，分別代表不同硬幣的面額，另外給定目標金額 `amount`，題目要求回傳，達到目標金額 `amount` 所需的 **最少硬幣數量**，如果 `coins` 中的面額無法達到目標金額就回傳 `-1`

# 解法

## 一開始的想法

首先假設今天陣列是 `[1,2,5]` 那對於 `amount` 每次可以選擇減1減2或減5，扣除完畢後下一輪又可以選擇要減1減2還是減5，直到最後如果 `amount` 為 0 則代表達到目標金額，如果扣除太多 `amount < 0` 就代表不能達到目標金額，這時候就需要回傳 `-1`。如果畫出這個想法的遞迴樹會像是下面這樣。

{% hideToggle Step1 解法的遞迴樹,bg,color %}
![](/img/LeetCode/322/tree.png)
{% endhideToggle %}

可以看到應該會有很多重複的計算，因此稍後也會有最佳化的空間在。

## 我的解答

### Step-1

```c++
int coinchangehelper(vector<int>& coins, int amount){
    if(amount==0) return 0;
    if(amount <0) return -1;
    
    int minCount = -1;
    for(int i=0; i<coins.size(); i++){
        int result = coinchangehelper(coins, amount-coins[i]);
        if(result >= 0){
            if(minCount==-1 || result+1 < minCount) minCount = result+1;
        }
    }
    return minCount;
}
int coinChange(vector<int>& coins, int amount){
    return coinchangehelper(coins, amount);
}
```

步驟一就是先決定基本的遞迴關係式，以及 base case。首先只要 `amount` 扣到0就會回傳0，而扣超過的話就帶表上一步選擇的面額沒辦法達到目標金額。由於 `coins` 陣列的每個元素都可以選或不選，因此透過迴圈，讓每個元素都去用 `amount` 去扣掉當前元素，進入下一層遞迴，而遞迴返回的結果會被存放到 `result`，代表硬幣數量，如果這個 `result > 0` 就代表，從該條路徑找到了一個可行的解，並且我們更新最小的硬幣數量 `minCoins`。 **這裡之所以要加 1，是表示使用了當前硬幣**：每當我們嘗試一枚硬幣時，會減去該硬幣的面值，並遞迴呼叫 `coinChangeHelper` 來計算剩餘金額的硬幣數量。這時候，因為我們已經選擇了一枚硬幣，所以總數需要加上 1。而前面的條件 `minCount == -1` 則代表第一次找到有效解。

最後就是返回 `minCount`

> 這樣初步的做法如果在 `coins` 和 `amount` 數值小的時候還不會出事，但如果數字一大，就會 Time Limit Exceeded。因此會需要進行第二步驟 - Memoization

### Step-2


```c++
vector<int> dp;
int coinchangehelper(vector<int>& coins, int amount){
    if(amount==0) return 0;
    if(amount <0) return -1;
    
    if(dp[amount]!=-1) return dp[amount];
    
    int minCount = -1;
    for(int i=0; i<coins.size(); i++){
        int result = coinchangehelper(coins, amount-coins[i]);
        if(result >= 0){
            if(minCount==-1 || result+1 < minCount) minCount = result+1;
        }
    }
    dp[amount] = minCount;
    return dp[amount];
}
int coinChange(vector<int>& coins, int amount){
    dp.resize(amount+1, -1);
    return coinchangehelper(coins, amount);
}
```

這裡另外宣告了一個陣列 `dp` 用來儲存重複的計算，但這樣做如果去執行一樣會是 Time Limit Excceded! **原因在於 `minCount`初始值的設定**

由於我們的 `dp` 也都初始化成 -1，`dp[amount]=-1` 代表這個金額尚未被計算過，而 `result=-1`則代表分支無法找到有效解，代表的前面額組合無法達到目標金額，當 `result == -1` 時，會必須檢查 `minCount == -1`，以確保在這些無效解中找到有效的最小解。這樣的 `-1` 邏輯會讓每次檢查 `minCount` 時，都必須額外處理 -1 的條件，並且在 `dp` 的值尚未更新（仍為 `-1`）時，也會進行多次重複計算。

```c++
vector<int> dp;
int coinchangehelper(vector<int>& coins, int amount){
    if(amount==0) return 0;
    if(amount <0) return INT_MAX;
    
    if(dp[amount]!=-1) return dp[amount];
    
    int minCount = INT_MAX;
    for(int i=0; i<coins.size(); i++){
        int result = coinchangehelper(coins, amount-coins[i]);
        if(result != INT_MAX){
            minCount = min(minCount, result+1);
        }
    }
    dp[amount] = minCount;
    return dp[amount];
}
int coinChange(vector<int>& coins, int amount){
    dp.resize(amount+1, -1);
    int result = coinchangehelper(coins, amount);
    if(result==INT_MAX) return -1;
    else return result;
}
```

這裡改成將 `minCount` 初始化成 `INT_MAX`，就不會出現剛剛那種「此 -1 非彼 -1 的狀況」可以減少多餘的判斷。 **當 `result == INT_MAX` 時，表示無法達到目標金額**，我們可以簡單地檢查 `result != INT_MAX` 來判斷有效解。另外也透過 `min()` 來去判斷 `minCount` 還是遞迴呼叫結果哪個比較會小，也能減少判斷的複雜度。 


### 執行結果


![](/img/LeetCode/322/result.jpeg)

## 最佳化解答

當然進行到這，還是會有更佳解，就是 Iteration + Tabulation。

```c++
int coinChange(vector<int>& coins, int amount){
    vector<int> dp;
    dp.resize(amount+1, INT_MAX);
    dp[0]=0;
    
    for(int i=1; i<= amount; i++){
        for(int j=0; j<coins.size();j++){
            if(i - coins[j] >=0 && dp[i-coins[j]] != INT_MAX){
                dp[i] = min(dp[i], dp[i-coins[j]]+1);
            }
        }
    }
    if(dp[amount]==INT_MAX) return -1;
    else return dp[amount];
}
```

{% hideToggle 表格迭代變化,bg,color %}

初始狀態

| 金額 `i` | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|----------|---|---|---|---|---|---|---|---|---|---|----|----|
| `dp[i]`  | 0 | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞  | ∞  | ∞  |

外層迴圈: `i = 1`
- 嘗試硬幣 `1`：
  - `dp[1] = min(dp[1], dp[1 - 1] + 1) = min(∞, 0 + 1) = 1`

| 金額 `i` | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|----------|---|---|---|---|---|---|---|---|---|---|----|----|
| `dp[i]`  | 0 | 1 | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞  | ∞  | ∞  |

外層迴圈: `i = 2`
- 嘗試硬幣 `1`：
  - `dp[2] = min(dp[2], dp[2 - 1] + 1) = min(∞, 1 + 1) = 2`
- 嘗試硬幣 `2`：
  - `dp[2] = min(dp[2], dp[2 - 2] + 1) = min(2, 0 + 1) = 1`

| 金額 `i` | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|----------|---|---|---|---|---|---|---|---|---|---|----|----|
| `dp[i]`  | 0 | 1 | 1 | ∞ | ∞ | ∞ | ∞ | ∞ | ∞ | ∞  | ∞  | ∞  |

外層迴圈: `i = 3`
- 嘗試硬幣 `1`：
  - `dp[3] = min(dp[3], dp[3 - 1] + 1) = min(∞, 1 + 1) = 2`
- 嘗試硬幣 `2`：
  - `dp[3]` 不變（因為 `dp[1] = 1 + 1 = 2`）

| 金額 `i` | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|----------|---|---|---|---|---|---|---|---|---|---|----|----|
| `dp[i]`  | 0 | 1 | 1 | 2 | ∞ | ∞ | ∞ | ∞ | ∞ | ∞  | ∞  | ∞  |

外層迴圈: `i = 4`
- 嘗試硬幣 `1`：
  - `dp[4] = min(dp[4], dp[4 - 1] + 1) = min(∞, 2 + 1) = 3`
- 嘗試硬幣 `2`：
  - `dp[4] = min(dp[4], dp[4 - 2] + 1) = min(3, 1 + 1) = 2`

| 金額 `i` | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|----------|---|---|---|---|---|---|---|---|---|---|----|----|
| `dp[i]`  | 0 | 1 | 1 | 2 | 2 | ∞ | ∞ | ∞ | ∞ | ∞  | ∞  | ∞  |

外層迴圈: `i = 5`
- 嘗試硬幣 `1`：
  - `dp[5] = min(dp[5], dp[5 - 1] + 1) = min(∞, 2 + 1) = 3`
- 嘗試硬幣 `2`：
  - `dp[5] = min(dp[5], dp[5 - 2] + 1) = min(3, 2 + 1) = 3`
- 嘗試硬幣 `5`：
  - `dp[5] = min(dp[5], dp[5 - 5] + 1) = min(3, 0 + 1) = 1`

| 金額 `i` | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|----------|---|---|---|---|---|---|---|---|---|---|----|----|
| `dp[i]`  | 0 | 1 | 1 | 2 | 2 | 1 | ∞ | ∞ | ∞ | ∞  | ∞  | ∞  |

重複步驟直到 `i = 11`

最終結果

| 金額 `i` | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|----------|---|---|---|---|---|---|---|---|---|---|----|----|
| `dp[i]`  | 0 | 1 | 1 | 2 | 2 | 1 | 2 | 2 | 3 | 3  | 2  | 3  |

結果 `dp[11] = 3` 表示湊成金額 `11` 需要最少 `3` 個硬幣。

{% endhideToggle %}

### 執行結果

![](/img/LeetCode/322/result2.jpeg)

# 複雜度

## 時間複雜度

`dp[amount]` 儲存了從 `0` 到 `amount` 的所有子問題結果，所以會有 `amount+1` 個子問題。每個子問題的計算時間，在 `coinchangehelper` 中，我們對每個 `amount` 值都會遍歷一次 `coins` 陣列，並對每個硬幣遞迴呼叫一次。所以每次計算時間會是 $O(n)$，其中 $n$ 為 `coins` 長度。

因此整體時間複雜度會是 $O(amount \times n)$

## 空間複雜度

- `dp` 儲存空間大小取決於 `amount` 長度，因此為 $O(amount)$
- Recursive Call 深度，最慘會是 `amount`

因此整體空間複雜度會是 $O(amount)$

---