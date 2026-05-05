---
title: 排列問題 | Medium | LeetCode#46. Permutations
tags:
  - backtracking
  - permutation
  - recursion
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 713e66af
date: 2024-09-19 20:50:13
cover: /img/LeetCode/46/cover.jpg
---

# 題目敘述

![](/img/LeetCode/46/question.png)

- 題目難度: `Medium`
- 題目敘述: 給定一個整數陣列 `nums` 其中不包含重複數字，找到所有數字排列後的可能情況。

{% note info %}
輸入: `nums = [1,2,3]`
輸出: `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`
輸出結果為輸入陣列中元素的各種排列結果。
{% endnote %}

# 解法

## 一開始的想法

Permutations 其實就是經典的 backtracking 題目，也是典型的樹狀結構，在每一層都先選擇一個數字，並且透過遞迴進入下一層，而一但到達指定層數，就可想辦法 return，退回後原先占用在陣列的數字就可以 pop 出來的。但我按照這個想法時做的時候，起初的結果是有重複數字的，也就是 `[1,1,1]`,`[1,1,2]` ... `[3,3,3]` 像是這種的，後來才進行了修正。

## 我的解法

```cpp
class Solution {
public:
    vector<int> numList;
    vector<vector<int>> final_result;
    void permutehelper(int depth, vector<int> &temp_result, int MAX_DEPTH){
        if (depth == MAX_DEPTH){
            final_result.push_back(temp_result);
            return;
        }
        for(int i=0;i<numList.size(); i++){
            temp_result.push_back(numList[i]);
            int restore = numList[i];
            numList.erase(numList.begin()+i);
            permutehelper(depth+1, temp_result, MAX_DEPTH);
            temp_result.pop_back();
            numList.insert(numList.begin()+i, restore);
            restore =0;
            
        }
    }
    vector<vector<int>> permute(vector<int>& nums){
        vector<int> subResult;
        numList = nums;
        int max_depth = nums.size();
        permutehelper(0, subResult, max_depth);
        return final_result;
    }
};
```

而修正的方式也就是透過 `vector` STL 當中的 `erase` 以及 `insert`，在迴圈當中，先將數字 push 進要回傳的二維陣列中的第二層陣列。接著透過一個變數 `restore` 保存push進的值，接著在下一層遞迴之前，**先將題目給的陣列中將我們選擇的數字 (`numList[i]`)去掉，否則就會發生重複**，一旦到達指定層數後，就代表不會在能夠有新的數字加進第二層陣列中，這也代表這一輪的排列完畢，即可加入最終要回傳的二維陣列中。

一旦有陣列從下一層回退到上一層，這時就要將第二層陣列中原先插入的值 pop 出來，以便挪出空位給之後其他種可能的數字放入，並且還要將剛剛從題目陣列中移除的值，加入回來，剛剛所使用的變數 `restore` 也就要用在這時候。

最後回傳二維陣列。

### 執行結果

![](/img/LeetCode/46/result.png)

## 更好的做法

```cpp
class Solution {
public:
    vector<int> numList;
    vector<vector<int>> final_result;
    void permutehelper(int depth, vector<int> &temp_result, int MAX_DEPTH, vector<bool>& used){
        if (depth == MAX_DEPTH){
            final_result.push_back(temp_result);
            return;
        }
        for(int i=0;i<numList.size(); i++){
            if(!used[i]){
                temp_result.push_back(numList[i]);
                used[i] = true;
                permutehelper(depth+1, temp_result, MAX_DEPTH, used );
                temp_result.pop_back();
                used[i] = false;
            }
        }
    }

    vector<vector<int>> permute(vector<int>& nums){
        vector<int> subResult;
        vector<bool> isused(nums.size(), false);
        numList = nums;
        int max_depth = nums.size();
        permutehelper(0, subResult, max_depth, isused);
        return final_result;
    }
};
```

透過在函數中添加一個 `vector<bool> &used` 來去控制在每個迴圈中該值是否有使用過，就不用持續對陣列進行移除跟插入的動作了。

# 複雜度

## 時間複雜度

- 排列的數量： 全排列的總數是 $n!$，其中 `n` 是 `nums` 的長度。
- 遞迴操作： 在每次遞迴調用中，程式會檢查哪些數字尚未被使用（即 `!used[i]`），這個操作的時間是 $O(n)$。在每個遞迴層，會依次處理所有剩下的數字，這是一個 $O(n)$ 的操作。

總體來說，程式會進行 n! 次排列生成，而每次生成的時間是 O(n)，因此時間複雜度為：$O(n \times n!)$

## 空間複雜度

- 遞迴深度： $O(n)$
- 結果保存在 `final_result` 中，總共有 $n!$ 個排列，每個排列的長度是 `n`。因此結果的空間複雜度是 $O(n \times n!)$