---
title: 替換後的最長重複字元 | Medium | LeetCode#424. Longest Repeating Character Replacement
tags:
  - String
  - Sliding Window
  - Hash Table
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 1717ddff
date: 2025-01-14 19:42:32
cover: /img/LeetCode/424/cover.png
---

# 題目敘述

![](/img/LeetCode/424/question.jpeg)

- 題目難度： `Medium`
- 題目描述： 給定一個字串 `s` 以及整數 `k` ，題目要求我們需要去將 `s` 中的任意字元替換成其他英文大寫字母，這樣的替換操作可以進行 `k` 次，在進行 `k` 次操做後，請回傳具有相同字母的最長的子字串

# 解法

## 一開始的想法

對於關鍵字，最長子字串，可以直接聯想到要使用 Sliding Window，但這題除了找到子字串之外，還需要透過 Hash Table 來去紀錄個別字母的出現頻率，同時在滑動窗口的同時需要紀錄最大長度。


## 我的解法

```c++
class Solution {
public:
    int characterReplacement(string s, int k) {
        unordered_map<char, int> umap;
        int maxFreq = 0;
        int maxLength = 0;
        string tempStr = s;

        int left = 0;
        for(int right=0; right<s.length();right++){
            umap[s[right]]++;
            maxFreq = max(maxFreq, umap[s[right]]);

            while((right - left +1) - maxFreq > k ){
                umap[s[left]]--;
                left++;
            }

            maxLength = max(maxLength, right-left+1);
        }
        return maxLength;
    }
};
```

這裡的 Hash Table `unordered_map<char, int>`  **主要用於儲存子字串中的個別字母出現頻率** ， 這裡還額外初始化了兩個變數 `maxFreq` 以及 `maxLength` 分別用來儲存，子字串中出現最高頻率字母的個數，以及最長子字串的長度。 


這裡也先將左指針 `left` 歸零，透過 for 迴圈來去移動右指針 `right` ，每次移動右指針，`umap` 中對應字元的出現次數就增加 (`umap[s[right]]++`)，並且每到一個字母就去取出當前最高頻率的字母的次數 (`maxFreq = max(maxFreq, umap[s[right]])`)，這個 `maxFreq` 的目的在於，如果窗口中的元素，在進行 `k` 次替換後還有剩餘元素，這樣就需要去把窗口收窄，因此如果在迴圈中發現當前窗口大小 `right-left+1` 在扣掉最高頻率字母的個數 `maxFreq` 後，仍然比 `k` 還要大，那這時候就需要將窗口收窄，收窄的行為會包含： 

(1) 更新 `umap`，因為它代表當前窗口底下不同字母的出現次數 
(2) 更新左指針。

每次移動右指針中，如果窗口大小調整適當，則會去與當前最長子字串長度 `maxLength` 進行比較 (`maxLength = max(maxLength, right-left+1)`)，全部結束後就回傳最長子字串長度。

### 執行結果

![](/img/LeetCode/424/result.jpeg)

# 複雜度

時間複雜度
$O(n)$ = $O(n)$ + $O(n)$ : 左右指針都只會便字串一次。每個指針最多移動 $n$ 次

空間複雜度

$O(1)$: Hash Table 僅會記錄大寫英文字母，因此為 $O(26)$ = $O(1)$

---


