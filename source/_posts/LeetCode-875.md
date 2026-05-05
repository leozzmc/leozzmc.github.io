---
title: KoKo 吃香蕉 | Medium | LeetCode#875. Koko Eating Bananas
tags:
  - Binary Search
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/875/cover.png
abbrlink: 7a271795
date: 2025-01-15 14:01:37
---

# 題目敘述

![](/img/LeetCode/875/question.jpeg)

- 題目難度： `Medium`
- 題目描述：Koko 愛吃香蕉，今天有 `n` 堆的香蕉，第 `i` 堆香蕉的數量會是 `piles[i]`，香蕉由守衛看守，守衛目前不在，但他會在 `h` 小時候回來。Koko 每小時吃香蕉的速度會是 `k`，每一小時 Koko 會去挑選一堆香蕉吃，如果某堆香蕉的數量小於 `k` 則Koko 會將它們全吃掉，並且在那一小時中不會再去吃其他堆香蕉。雖然 Koko 吃的很慢，但是他還是希望在守衛回來前將所有的香蕉都吃完，為了達到這個目的，Koko 每小時吃香蕉的速度 `k` 最小會是多少？

# 解法

## 一開始的想法

一開始還在想要怎麼樣決定`k`，這裡可以透過 Binary Search 的方式去將不同堆的元素作為 `k` 去嘗試，嘗試的方式就是將每堆元素扣除 K 直到變成 0，同時記錄時數，只要最終時數小於 `h` 則回傳 `k` 值，只要最終時數大於 `h` 則繼續透過二元法找其他的 `k`

## 我的解法

```c++
class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int left=1;
        int right = *max_element(piles.begin(), piles.end()); 
        int result = right;

        while(left <= right){
            int k = left + (right-left) /2;
            if(canFinish(piles, h, k)){
                    result = k;
                    right = k-1;
            }
            else{
                    left = k+1;
            }
        }
        return result;
    }
		
    bool canFinish(vector<int>&piles, int h, int k){
        long long hours = 0;
        for(int i=0; i< piles.size(); i++){
                    hours += (piles[i]  + k -1) / k;
                    if(hours > h) return false;
        }
        return true;
}
};
```

這裡將二元法和確認所選 `k` 值是否有效，分成兩個函數 `minEatingSpeed` 和 `canFinish`。在 `minEatingSpeed` 的部分，由於Koko 每小時至少會吃一根香蕉，因此`left` 設定為 1， 這裡在 binary search 的時候設定的右界會是元素中的最大值， **這裡透過 `<algorithm>` 中提供的 `*max_element` 方法來去獲取容器中的最大值** ， 其效果等同於 (先 `sort(piles.begin(), piles.end());` 再 `int right = piles[piles.size()-1]` 但這樣效率較低)。

接著透過 binary search 的方式在 `1` 和 piles中最大元素值 `right` 當中尋找可能的 `k` 值，這裡就先中中間值開始找，接著就要去判斷 `k` 是否為有效的吃香蕉速度，需要呼叫 `canFinish`  來進行確認。 在 `canFliish`  中透過變數 `long long hours`  來去累加給定 `k` 速度吃香蕉，最終會花費的時間。 


**這裡透過一個向上取整公式來去知道特定堆 `i` 香蕉會花費的時間** 為 $(\text{pile} + k -1)/k$ 

{% note info %}
其實就是取Ceil，如果今天有個整數a 和 b，則向上取整 $\frac{a}{b} = \frac{a+b-1}{b}$
也可以先透過取 mod 後是否為0 來去判斷除完後是否要加一，但這樣就比較麻煩

{% endnote%}

累加完畢後如果 `hours > h` 則代表這個 `k` 不能用，會被守衛抓到，因此 return `false`，一旦檢查過程都沒 `false` 就回傳 `true`。回到 `minEatingSpeed` 中，如果 `k`值有效，那就將 `k` 丟給 `result` 並且將 `right` 收窄成 `k-1` 繼續找可能最小的 `k` 值。如果 `k` 值無效，則收窄左邊 `left` 如此下來，最終能找到最小的 `k` 值返回。

### 執行結果

![](/img/LeetCode/875/result.jpeg)

# 複雜度

時間複雜度

$O(n \cdot log(n))$

空間複雜度

$O(1)$

---