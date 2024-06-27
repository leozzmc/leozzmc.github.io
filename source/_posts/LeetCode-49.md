---
title: Group Anagrams | Medium |LeetCode#49 Group Anagrams
toc: true
tags:
  - Hash Table
  - LeetCode
  - Medium
  - 'C++'
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/49/cover.jpeg
abbrlink: e106a70e
date: 2024-06-20 08:45:54
---

# 題目敘述

![](/img/LeetCode/49/Question.png)

- 題目難度： `Medium`
- 題目描述： 題目要求給定一個字串陣列 `strs`，需要將 Anagrams 分組，並且回傳經過分組過的陣列，回傳陣列中的Anagrams 可以是任何順序

> Anagram 代表兩個單字裡面組成的字母和數量是完全一樣的，簡單來說 Anagram 就是由A單字重新排列組合成一個B單字。

# 解法

## 一開始的想法

1. 迭代 Input Vector
2. 為每個Obj 建立Table
3. 迭代 Vector 檢查是否有其他匹配的 Pair
4. 如果有 insert item

## 我的解法

我後來沒有在時間內解出來，因此還是參考了一下網路上的作法

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {

        vector<vector<string>> ans;
        vector<vector<int>> charCounts(strs.size(), vector<int>(26,0));

        //Step1 - Build the hash table 
        for(int i=0; i<strs.size(); i++){
            //iterate the string
            for(char c: strs[i]){
                charCounts[i][c -'a']++;
            }
        }

        //Step2 - group the anagram
        unordered_map<string, vector<string>> groups;
        for (int i = 0; i < strs.size(); i++) {
            string key = "";
            for (int count : charCounts[i]) {
                key += to_string(count) + "#";
            }
            key.pop_back(); // 移除最後一個多餘的"#"
            groups[key].push_back(strs[i]);
        }

        // Step 3 - Store grouped anagrams in the result vector
        for (const auto& group : groups) {
            ans.push_back(group.second);
        }
        return ans;
    }
};
```


### 說明

初始化變數

```cpp
vector<vector<string>> ans;
vector<vector<int>> charCounts(strs.size(), vector<int>(26,0));
```
-  `ans` 是要return 的結果
-  `charCounts` 是一個二維向量,用於存儲每個字串中各個字元的出現次數。它的大小與輸入字串的數量相同,每個內層向量的長度為 26,對應 26 個小寫英文字母的出現次數。

建構 Hash Table

```cpp
for(int i=0; i<strs.size(); i++){
    for(char c: strs[i]){
        charCounts[i][c -'a']++;
    }
}
```
- 迴圈循環遍歷每個字串,並計算每個字串中各個字元的出現次數,存儲在 `charCounts` 中


將 anagrams 分組：

```cpp
unordered_map<string, vector<string>> groups;
for (int i = 0; i < strs.size(); i++) {
    string key = "";
    for (int count : charCounts[i]) {
        key += to_string(count) + "#";
    }
    key.pop_back(); // 移除最後一個多餘的"#"
    groups[key].push_back(strs[i]);
}

```
-  定義了一個 `unordered_map` 類型的變數 groups,鍵是字串類型,值是一個向量,用於存儲具有相同字元計數的字串
-  對於每個字串,程式碼首先構建一個字串 key,該字串是通過將對應的字元計數向量中的每個元素連接而成的。例如,如果字符計數向量為 [1, 0, 1, 0, ...],那麼對應的鍵字符串將是 "1#0#1#0#..."。
- 然後,程式碼使用這個 key 作為鍵,將當前字串插入到 groups 中對應的向量中


儲存分組結果
```cpp
for (const auto& group : groups) {
    ans.push_back(group.second);
}
```
最後,程式碼遍歷 groups 中的每個鍵值對,將每個值向量(即每組 Anagram)添加到 `ans`中。

返回結果
```
return ans;
```


## 執行結果

![](/img/LeetCode/49/results.png)

> 好像其實執行時間跟空間使用都不太優...

## 其他做法

```cpp
class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {

        unordered_map <string, vector<string>> Dict;

        // Build hash table
        for (auto c: strs){
            string word = c;
            sort(word.begin(), word.end());
            Dict[word].push_back(c);
        }
        // Build the results
        vector<vector<string>> ans;
        for(auto x: Dict){ 
            ans.push_back(x.second);
        }
        return ans;
    }
};
```

> 這個做法反而更簡潔，空間複雜度也更低

- 首先一樣透過 `unordered_map` 去初始化一個 Dict
- 接著就是要建立 Hash Table，首先透過在for迴圈內用 c 去迭代輸入字串陣列 `strs`
- 對於每個字串，我們建立一個新的字串變數 `word` 來儲存，接著就是將 `word` 進行排序，如果有Anagram，他們做sorting 後的結果也會一樣
- 然後就是在我們的 HashTable的Key中放入排序過後的  `word`，而value 則是存放對應的輸入字串，我們使用 `push_back()` 將每個字串加入對應value的最尾端
- 最後就是要建立回傳的vector，並且我們將value的值，寫到用於回傳的 `ans` vector 中

我們的 Hash Table 會長的像是這樣

```
{
  "aet": ["eat", "tea", "ate"],
  "ant": ["tan", "nat"],
  "abt": ["bat"]
}
```

而回傳的 `ans` 會長的像是這樣：

```
[
  ["eat", "tea", "ate"],
  ["tan", "nat"],
  ["bat"]
]
```

### 執行結果

![](/img/LeetCode/49/results2.png)

> 在空間使用方面完勝之前的寫法

# 複雜度分析

以下分析原始寫法的時間以及空間複雜度

## 時間複雜度-1

時間複雜度為 $O(n * k)$, 其中 $n$ 是字串的數量, $k$ 是字串的平均長度


## 空間複雜度-1

空間複雜度為 $O(n * k)$, 因為需要創建 `charCounts` 和 `groups` 這兩個額外的數據結構。


接下來是第二種寫法的時間以及空間複雜度

## 時間複雜度-2


- 在第一個 for 循環中,對於每個字串,需要執行以下操作:
    -  創建一個新的字串 `word`。這個操作的時間複雜度為 $O(k)$, 其中 $k$ 是字串的長度。
    - 對 `word` 進行排序。排序操作的時間複雜度為 $O(k log k)$。
    - 將原字串插入到Hash Table `Dict` 中對應的向量中。這個操作的時間複雜度為 $O(1)$。
    - 因此,第一個循環的總時間複雜度為 $O(n * k * (k + k log k))$ = $O(n * k^2 log k)$ ,其中 $n$ 是字串的數量。
- 在第二個 for 循環中,需要遍歷Hash Table `Dict` 並將每個向量添加到 `ans` 中。這個操作的時間複雜度為 $O(n * k)$, 因為需要遍歷所有字串。
- 綜合起來,整個程式碼的時間複雜度為 $O(n * k^2 log k)$。

## 空間複雜度-2

- 需要創建一個Hash Table `Dict`,Hash Table中的Key是經過排序的字串,值是一個向量。在最壞情況下,所有字串都是不同的Anagram,因此Table的大小為 $O(n)$。
- 每個向量中存儲的是原始字串,因此所有向量的總空間為 $O(n * k)$
- 最終結果 `ans` 的空間複雜度也是 $O(n * k)$。


## 結語

透過這題，再次了解到自己對於C++ STL 的不熟悉，只能繼續努力了