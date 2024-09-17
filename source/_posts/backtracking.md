---
title: '刷題知識整理 |  Backtracking & Recursive'
tags:
  - Backtracking
  - Algorithms
  - LeetCode
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 48f553b3
date: 2024-09-15 18:54:56
cover: /img/LeetCode/backtracking/cover.jpg
---

# 遞迴

在解 backtracking 題目的時候，通常可以使用遞迴回來實現，那最好還是要先了解遞迴的想法。遞迴的核心想法就是 **「大問題拆成多個小問題，小問題也能按照相同方式切成更小的問題」**、**「除了最小的問題之外，每層的解決方式都一樣」**

![](/img/LeetCode/backtracking/recursion.png)

## 河內塔問題(Tower of Hanoi)

![](/img/LeetCode/backtracking/tower1.png)

河內塔問題就是經典的遞迴問題，它的問題是，**有三根柱子，並有 N 個圓盤套在最左邊柱子上面（上圖 N = 4)，現在我們要把它們全部移動到最右邊的柱子上，請問我們最少需要移動幾次？**

{% note info %}
1. 每次可選一個柱子，移動最上方的圓盤，一次只能一動一個
2. 大的圓盤不可以疊在小的上面
{% endnote %}

這裡就需要 Follow 一下遞迴的思維，**靠解決多個小問題來解決大問題**。 這裡的大問題就是 **要怎麼移動四個圓盤到最右邊要幾個步驟?** 而小問題則是 **移動三個圓盤要幾步?**

> 這邊問題本質一樣，只是問題範圍縮小而已，這裡假設我們已經知道移動兩個圓盤的答案，可以將問題想像成下面圖這樣

![](/img/LeetCode/backtracking/tower2.png)

1. 從左邊將上面三個圓盤移動到中間 (怎麼移動的先不管，總之目前結果就是有三個圓盤疊在中間)
2. 將最左邊的圓盤移動到最右邊
3. 將中間三個圓盤移動到最右邊  (怎麼移動的先不管，總之目前結果就是三個圓盤疊到最右邊圓盤)

因為題目在意的是 **移動的步驟數**，先假設移動左邊三個盤子到中間需要 $K$ 個步驟數，而將剩餘一個盤子移動到最右邊需要 1 個步驟數，最後將中間三個盤子移動到最右邊會需要 $K$ 個步驟數，因此整體步驟數會是 $2*K +1$。

從大小問題的關係中可以得到關係式會是 : $ F(N) = 2*F(N-1)+1$，其中 $F(N)$ 為移動 $N$ 個盤子的步驟數。當然實作的時候還需要考慮最小的問題，這裡最小的問題就是一個圓盤移動的步驟數，那當然就是 1 。因此我們可以將演算法寫成像是下面這樣:

```cpp
int HanoiTower(int n){
    if n==1 return 1;
    return 2* HaniTower(n-1) +1;
}
```

> 總結，在碰到遞迴時候總是要想這三點 (1) 大小問題分別是甚麼 (2) 大小問題的關聯式怎麼寫 (3)最小問題會是甚麼?

# 回溯法(Backtracking) 介紹

>　Backtracking 算是一種窮舉演算法，它的核心思想在於 **「路走不通就回頭」**，也就是當你想要搜尋一個資料的時候，某一個資料路徑走不通，就退回上一步，然後走其他路。所以一定會有一個條件用來判斷是不是要走的路，不符合條件就退回。




**Backtracking 可以通常透過遞迴來實現**

# 核心概念

## Enumerate
   - 列出每一個可進行的下一步  
##  Pruning
   - 遇到不符合條件的，就省略下一步，不繼續枚舉
   - 這其實比較進階，其實就是要能夠讓搜尋提早結束

> 老實說之前在解 Tree 相關概念的時候都已經有用到 backtracking 的概念，像是 DFS，在一開始就會設定終止條件 (Ex.走到leaf) 然後每次都會去遞迴呼叫下個dfs函數，來去走訪下一個節點。




# Backtracking 問題分類

## Permutations

找了網路上很多講解 backtracking 概念都是用 Permutations 來當範例解釋。問題大致上就是 **猜密碼**，例如 1,2,3 猜有幾種不重複的密碼組合，或是用符號來排序看有多少組合數。 **普遍的想法就是會以遞迴去解，去窮盡所有可能，而不對的答案就退回。**

![](/img/LeetCode/backtracking/backt.png)

這裡也可先分成不同層來看待，上途中每次遞迴呼叫都會往下走一層，而一開始由於根本沒有號碼，因此沒有值，可以想成第0層，而往下一層就代表要開始探究可能的數字了，首先密碼的第一碼可能是 `1`, `2` 或 `3`。之後一樣遞迴呼叫下一層，對於第一碼為 `1` 的狀況來說，第二碼也可能是 `1`, `2` 或 `3`，新增的號碼append在舊號碼後面，因此目前會有 `1,1`, `1,2`, `1,3`，而第二碼為 `2` 的狀況下，它的下一層會是 `2,1`, `2,2`, `2,3`，而 `3` 的下一層也可能是 `3,1`, `3,2`, `3,3`。接著再遞迴呼叫下一層。而遞迴呼叫的終止條件就是當我們到達所需層數後，找到密碼。

下面是簡易的實作方式:

```cpp
# include <iostream>
# include <vector>
# define MAX_DEPTH 3
using namespace std;

void permutate(int depth, vector<int> &password){
   if(depth == MAX_DEPTH){
      for(auto i = 0; i < password.size(); i++){
         cout << password[i] <<" ";
      }
      cout << endl;
      return;
   };
   for(int i = 1; i <= MAX_DEPTH; i++){
      password.push_back(i);
      permutate(depth+1, password);
      password.pop_back();
   }
}

int main(){
    vector<int> passList;
    permutate(0, passList);
    return 0;
}
```

上面的這段就是終止條件，一旦為最大深度就停止繼續查找
```cpp
 if(depth == MAX_DEPTH){
      for(auto i = 0; i < password.size(); i++){
         cout << password[i] <<" ";
      }
      cout << endl;
      return;
   };
```

下面則是在每個節點都嘗試插入`1`, `2` 或 `3` 後再去往下一層前進，而如果到達最大深度就退回，退回一層後就把原先占用在 `password` 最後一位的數字清空

```cpp
for(int i = 1; i <= MAX_DEPTH; i++){
      password.push_back(i);
      permutate(depth+1, password);
      password.pop_back();
}
```




輸出結果:
```
1 1 1 
1 1 2 
1 1 3 
1 2 1 
1 2 2 
1 2 3 
1 3 1 
1 3 2 
1 3 3 
2 1 1 
2 1 2 
2 1 3 
2 2 1 
2 2 2 
...(略)...

```

## Subnets

> 這類題目通常會給定一個不含重複數字的整數集合，要你找出所有可能的子集

{% note info %}
對於整數集合: `[1,2,3]` 來說，所有可能子集合為:
{ `[]`,`[1]`,`[2]`,`[3]`,`[1,2]`,`[1,3]`,`[2,3]`,`[1,2,3]`}
- `[1,2]` = `[2,1]`
- `[1]` = `[1,1]`
{% endnote %}

這種類型題目可用 Backtracking 來解，**並且在每一步都可以選擇是否包含某個元素**

```cpp
#include <iostream>
#include <vector>

using namespace std;

vector<int> nums = {1, 2, 3};
vector<int> result; 


void subsets(vector<int> &sets, int index) {
    if (index == sets.size()) { 
        cout << "{ ";
        for (int i = 0; i < result.size(); i++) {
            cout << result[i] << " ";
        }
        cout << "}" << endl;
        return;
    }
    
    // 不加入當前元素
    subsets(sets, index + 1);
    
    // 加入當前元素
    result.push_back(sets[index]);
    subsets(sets, index + 1);
    
    // 退回上一個選擇
    result.pop_back();
}

int main() {
    subsets(nums, 0);
    return 0;
}
```

輸出結果:

```
{ }
{ 3 }
{ 2 }
{ 2 3 }
{ 1 }
{ 1 3 }
{ 1 2 }
{ 1 2 3 }
```

它的呼叫邏輯也會是一個經典的樹狀結構

```
                             subsets(nums, 0)
                          /                      \
               subsets(nums, 1)               subsets(nums, 1)
               (不加入 1)                         (加入 1)
             /             \                   /           \
  subsets(nums, 2)  subsets(nums, 2)   subsets(nums, 2)   subsets(nums, 2)
   (不加入 2)        (加入 2)           (不加入 2)          (加入 2)
   /       \          /      \           /      \            /     \
subsets   subsets  subsets  subsets   subsets  subsets  subsets  subsets
(nums, 3) (nums, 3) (nums, 3) (nums, 3) (nums, 3) (nums, 3) (nums, 3) (nums, 3)
 (不加入 3)   (加入 3)   (不加入 3)   (加入 3)   (不加入 3)  (加入 3)  (不加入 3)  (加入 3)

```

當我們到達葉子節點（`index == nums.size()`），此時我們已經做出了所有決策，並且形成了一個完整的子集，該子集就會被輸出

## Combinations
> 這種就類似高中的排列組合，給整數 1 到 N，選擇 K 個數字，求所有可能的組合。

{% note info %}
`N=4`, `K=2`
則輸出結果為:
`{[1,2],[2,3],[3,4],[1,3],[1,4],[2,4]}`
{% endnote %}

**這種問題解法跟 subsets 類似，就是需要給定起始index，當選出了 K 個數字後就停止。**

```cpp
#include <iostream>
#include <vector>
using namespace std;

vector<int> result; 

void combinations(int N, int K, int index, int start) {
    if (index == K) {  // 如果子集長度達到 K，則輸出當前子集
        cout << "{ ";
        for (int i = 0; i < result.size(); i++) {
            cout << result[i] << " ";
        }
        cout << "}" << endl;
        return;
    }
    
    // 遍歷剩下的所有可能的選擇
    for (int i = start; i <= N; i++) {
        result.push_back(i);  // 加入當前數字
        combinations(N, K, index + 1, i + 1); // 前往下一層
        result.pop_back();  // 回溯，移除當前數字
    }
}

int main() {
    int N = 4;
    int K = 2; 
    combinations(N, K, 0, 1);
    return 0;
}
```

輸出結果:
```
{ 1 2 }
{ 1 3 }
{ 1 4 }
{ 2 3 }
{ 2 4 }
{ 3 4 }
```

以下透過樹狀結構來圖解查找輸出結果 (N=4, K=2)的遞迴過程:

`從 1 ~ 4`
```
                          combinations(N=4, K=2, index=0, start=1)
                               /                                \
          combinations(N=4, K=2, index=1, start=2)       (skip 1, start at 2)
            (選擇1)                         /                     \
                         combinations(N=4, K=2, index=2, start=3)    (skip 2)
                           (選擇2)                     /                     \
                             {1,2}           combinations(N=4, K=2, index=2, start=4)
                                                      (選擇3)           \
                                                        {1,3}        combinations(N=4, K=2, index=2, start=5)
                                                                             (選擇4) 
                                                                               {1,4}

```

`從 2 ~ 4`
```
                          combinations(N=4, K=2, index=0, start=2)
                               /                                \
          combinations(N=4, K=2, index=1, start=3)       (skip 2, start at 3)
            (選擇2)                         /                     \
                         combinations(N=4, K=2, index=2, start=4)    (skip 3)
                           (選擇3)                     /                     \
                             {2,3}           combinations(N=4, K=2, index=2, start=5)
                                                      (選擇4)             
                                                        {2,4}

```

`從 3 ~ 4`
```
                          combinations(N=4, K=2, index=0, start=3)
                               /                                \
          combinations(N=4, K=2, index=1, start=4)       (skip 3, start at 4)
            (選擇3)                         /                     \
                         combinations(N=4, K=2, index=2, start=5)    
                           (選擇4)                               
                             {3,4}

```

## Palindrome Partitioning

> 將一個字串切割成為一群回文字串，每個子字串都是回文字串，列出所有切割方式


```cpp
#include <iostream>
#include <vector>
#include <string>

using namespace std;

string input = "aab"; 
vector<vector<string>> result;  
vector<string> currentPartition; 

// 判斷子字串是否是回文
bool isPalindrome(const string& s, int start, int end) {
    while (start < end) {
        if (s[start] != s[end]) {
            return false;
        }
        start++;
        end--;
    }
    return true;
}

// Bacltracking：在字串中切割回文
void Palindrome(const string& s, int start) {
    // 如果切到字串末端，則儲存當前的切割結果
    if (start == s.size()) {
        result.push_back(currentPartition);
        return;
    }

    // 從當前索引開始，嘗試每一個可能的子字串
    for (int i = start; i < s.size(); i++) {
        if (isPalindrome(s, start, i)) {
            // 將回文子串加入當前切割方式
            currentPartition.push_back(s.substr(start, i - start + 1));
            // 繼續遞歸切割剩下的字串
            Palindrome(s, i + 1);
            // 回退，移除最後一個加入的子串
            currentPartition.pop_back();
        }
    }
}

int main() {
    Palindrome(input, 0); 
    
    for (const auto& partition : result) {
        cout << "{ ";
        for (const auto& p : partition) {
            cout << p << " ";
        }
        cout << "}" << endl;
    }
    return 0;
}

```

這裡以字串 `aab` 為例

``` 
                                [""]           # 'aab'
                                 |
                               ["a"]           # 'ab'
                              /     \
                       ["a","a"]   ["aa"]      # 'b'
                         /             \
            ["a","a","b"]              ["aa","b"]

```

- 首先回傳的vector 會為空，接著才是第一層
- 第一層就是從 `a` 開始切，視為第一個回文字串，接著遞迴處理剩下來的 `ab`
- 除了只切出 `a` 之外，也可以切成 `aa` 也視為回文字串，接著處理剩下來的 `b`
- 之後便是第二層，在選擇了 `a` 之後，我們再從剩下的 `a` 中切割出另一個 `a`，然後處理剩下的字串 `b`
- 如果選擇了 `aa` 之後，只剩下 `b` 需要處理
- 第三層，當到達 `b` 時，因為 `b` 自身就是回文，所以它可以作為一個單獨的切割。

> 第一條路徑：**`["a", "a", "b"]`**，切割方式為 **`"a" → "a" → "b"`**
> 第二條路徑：**`["aa", "b"]`**，切割為 **`"aa" → "b"`**

# Backtracking 使用情境

由於計算量龐大，因此通常是用於需要找到所有解的狀況，但缺點也是計算量龐大，可能進一步導致時間複雜度提升，**通常也可以透過先前提過的 Pruning來降低搜尋次數**

#　Backtracking 相關 LeetCode 題目

Medium
- **[17. Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[77. Combinations](https://leetcode.com/problems/combinations/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[46. Permutations](https://leetcode.com/problems/permutations/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[39. Combination Sum](https://leetcode.com/problems/combination-sum/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[22. Generate Parentheses](https://leetcode.com/problems/generate-parentheses/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[79. Word Search](https://leetcode.com/problems/word-search/description/?envType=study-plan-v2&envId=top-interview-150)**
- **[688. Knight Probability in Chessboard](https://leetcode.com/problems/knight-probability-in-chessboard/description/?ref=secondlife.tw)**

Hard
- **[51. N-Queens](https://leetcode.com/problems/n-queens/description/)**
- **[52. N-Queens II](https://leetcode.com/problems/n-queens-ii/description/?envType=study-plan-v2&envId=top-interview-150)**

# Reference
[1] https://www.secondlife.tw/algorithms-backtracking/
[2] https://web.ntnu.edu.tw/~algo/Backtracking.html
[3] https://medium.com/@ralph-tech/%E6%BC%94%E7%AE%97%E6%B3%95%E5%AD%B8%E7%BF%92%E7%AD%86%E8%A8%98-%E5%9B%9E%E6%BA%AF%E6%B3%95-backtracking-%E5%88%86%E6%94%AF%E5%AE%9A%E7%95%8C%E6%B3%95-branch-and-bound-29165391c377
[4] https://wiki.csie.ncku.edu.tw/acm/course/Backtracking
[5] https://www.javatpoint.com/backtracking-introduction
[6] https://willrosenbaum.com/teaching/2021s-cosc-112/notes/recursive-image/
[7] https://www.javatpoint.com/backtracking-introduction
[8] https://ithelp.ithome.com.tw/articles/10273084?ref=secondlife.tw