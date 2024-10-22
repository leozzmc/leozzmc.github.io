---
title: 刷題知識整理 | 動態規劃 Dynamic Programming(DP)  
abbrlink: dynamic_programming
date: 2024-10-20 14:44:06
toc: true
tags:
  - Dynamic Programming
  - LeetCode
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/dp/cover.jpg
---


# 前言

從還沒開始刷題前就耳聞了DP題目的恐怖，因此想說在實際開始刷類似題目前整理一下DP的知識。

> 在閱讀網路資料的時候發現這篇文章解釋得很好，因此非常推薦先閱讀這篇 [文章](https://medium.com/@al.eks/the-ultimate-guide-to-dynamic-programming-65865ef7ec5b)，作者有提到要理解 DP，**耐心很重要，然後還需要熟悉遞迴，因為DP問題通常會用遞迴來解決**

# 甚麼是 Dynamic Programming(DP)?

這裡我必須提到上面那篇文章說的結論: **Dynamic Programming 是一種用來幫助遞迴程式碼更加有效率的工具**，所以文章作者也認為不該在面對一個問題的時候就先去識別這個問題是否是一個 DP問題，而是先判斷是否需要用到遞迴，而在遞迴的基礎上，會延伸思考到這個遞迴程式碼可能會很冗，因此有答案應該會有改善空間，**而改善的方式就透過 Dynamic Programming**

> DP 是用來改善現有 Solution 的方式 !

接下來介紹使用這個工具的步驟，其中包含了4個步驟，這裡會用一個題目來逐步解釋

題目:　[LeetCode62. Unique Paths](https://leetcode.com/problems/unique-paths/description/)

![](/img/LeetCode/dp/robot_maze.png)

這題中給了一個大小 *m x n* 的格子，有一個機器人在最左上角的位置，機器人每次執行可以往下或往右走一格，機器人要試圖抵達最右下角的 Finish 格，要找出有多少種可能的獨特的路徑組合。

## 步驟一: Recursion

這個步驟通常是最重要的一步會是制定整個解題計畫的關鍵!，需要做的事就是要回歸到最純粹的中心思想 - 遞迴，其實也就是相當於 **先提出暴力解**

> 同時這也能先說服面試官，你知道這題要使用怎樣的遞迴關係來解，也就是說要先找到遞迴關係，才有後面改善的空間


![](/img/LeetCode/dp/unipath.png)

首先這題要找的是最終有多少條路徑可以到終點，那會需要先知道甚麼? **會需要知道從起點到任一格會有幾條路徑**，我們從上面的圖看，可以知道從起點 `grid[0][0]` 到它右下角那格 `grid[1][1]` 可以從右邊走也可以從下面走 (題目規定只能右或往下移動) 一共是兩條路線，那從起點單獨往右以及單獨往下都各只有一條路線。

上面的例子應該也能看出，對於任意格 `[i][j]`，它的上一步可能是:
- 從上面一格一移動下來，即 `[i-1][j]`
- 從左邊一格一移動下來，即 `[i][j-1]`

而從上或從左移動一格都是在相同路徑上，因此數量不變，因此可以知道對於任意格 `[i][j]`，從起點到達它的路徑數量會是 `[i-1][j] + [i][j-1]`

![](/img/LeetCode/dp/unipath2.png)

在舉例一次也能驗證，若想移動到 `grid[2][2]`，所有的路徑數量勢必為 `grid[1][2] + grid[2][1]`

![](/img/LeetCode/dp/unipath3.png)

若我們將上面的想法寫成遞迴式如下，遞迴的終止條件會發生在執行到 **起點的右邊一行或者是下面一列就停止** 

```cpp
class Solution {
public:
    int uniquePaths(int m, int n) {

        if(m==1 || n==1) return 1;
        
        return uniquePaths(m-1,n) + uniquePaths(m,n-1);
    }
};
```


> 但實際跑下去會發現錯誤，Time Limit Exceeded ! 這就代表會有需要改善的地方，所以接下來第二步

## 步驟二: Recursion + Memoization

這一步驟才真正開始使用 DP，但並不是所有沒有效率的問題都需要用 DP 解決，**因此要先衡量這個問題值不值得用 DP 來解**，根據步驟一的結果，**若以下狀況存在並同時成立，才應蓋要使用DP來解決**

- 具有重疊的子問題 (Overlapping subproblems):  *你有多次解決相同的子問題* 
- 具有最佳子結構 (An optimal substructure): *透過獲取每個子問題的最佳解，你可以得到整個問題的最佳解*

如果在面試或解題過程中發現這兩點沒辦法完全滿足，那就不該使用DP (或本篇介紹的方式)，可能可以用其他像是 backtracking 技巧來解。

> 所以要怎麼確定，這題題目中有滿足這兩個條件呢?

我下面畫了 Step1 的遞迴樹，可以發現其實並非所有子問題都重疊，但還是可以看到有很多重複計算，像是 `uniquePaths(2, 6)` 和 `uniquePaths(2, 5)`，所以還是可以看成是有重疊的子問題。

{% hideToggle Step1 解法的遞迴樹,bg,color %}

可以放大來看

![](/img/LeetCode/dp/unipath4.png)

{% endhideToggle %}

第二個條件也可以被滿足，因為我們可以用 `[m-1][n]` 以及 `[m][n-1]` 來去得到 `[m][n]` 的最佳解

> 所以這個步驟要達成的目標很簡單，**那就是讓重複計算的部分只計算一次，並想辦法安全地保存起來(*memoization*)**

儲存的目的是要讓後續重複計算的部分能夠方便查找，來降低計算量，因此在後續儲存中查找，**也希望盡量達到 $O(1)$ 的複雜度**，可以看情況用陣列或者是雜湊表。


```cpp
class Solution {
public:
    vector<vector<int>> dp;
    int helper(int m, int n){
        if(dp[m][n]){
            return dp[m][n];
        }
        else if(m==1 || n==1) {
            dp[m][n]=1;
            return dp[m][n];
        }
        
        dp[m][n] = helper(m-1,n) + helper(m,n-1);
        return dp[m][n];
    }
    int uniquePaths(int m, int n) {
        dp = vector<vector<int>>(m + 1, vector<int>(n + 1, 0));
        return  helper(m,n);
    }
};
```

上面這是修正後的結果，主要透過一個2D Vector 來存放計算過的路徑數量，而由於要初始化陣列大小為 *m+1 x n+1* (這裡是怕存取超出邊界)，因此分成兩個函數進行操作。對於這題來說，需要改動的地方也不多，對於原先的邏輯只需要改動有兩處:

- **儲存遞迴呼叫結果**
- **當一個遞迴呼叫已經存在於陣列中，則返回儲存值** (i.e. `helper(m,n)` 的結果已經儲存在 `dp[m][n]` 當中)

> 這時再次執行，就會發現 Submit Accepted 了

並且這樣執行的時間複雜度為 $O(M \times N)$，相比步驟一的做法為 $O(2^{M+N})$ (因為遞迴的每一層會將問題分解為兩個子問題) 提升更多效率，雖然時間複雜度降低了，但所使用的複雜度卻提升了，但這也說明了 **DP 會是一種用空間換取時間的做法**，這其實是非常值得的，**因為這麼做的空間複雜度大多都是線性成長，但卻能夠指數型的改善時間複雜度**

> 所以到目前為止的進度是，先能夠提出暴力解的遞迴做法後，接著透過額外的記憶體空間來去改善先前的做法! (面試的話到這一步已經很讚了)
> 那是否還有其他可以進一步最佳化的地方呢? 這就會到第三步

## 步驟三 : Iteration + Tabulation

正常而言，如果在上一步中沒有明顯的效能提升 (或者面試官希望你進一步改善你的答案)，那就會需要第三步。這一步驟中使用 *Tabulation*，而非 *Memoization*，並且使透過 Iteration 而非 Recursion 的方式實作。

> 但無論是 *Tabulation* 或者是 *Memoization* 他們的目標都一樣，**就是要將先前計算結果儲存，在後續重複計算時取出使用**

兩者的區別主要在於資料的儲存方式，*Tabulation* 主要是透過 **陣列儲存 (通常是二微陣列)** ，而 *Memoization* 則通常是用 Set, Hash Table 等方式儲存。 **所以 *Tabulation* 會透過迭代的方式來走遍每個陣列，而 *Memoization* 則是藉助於遞迴呼叫。**

{% note info %}
這個變更不一定會讓時間或空間複雜度改善，但重點是， **使用迭代陣列的方式可以容納更大的 Input Size，而不會受限於遞迴呼叫的 Call Stack 的最大上限**  (Call Stack 太深還有機會 Stack Overflow)
{% endnote %}

所以回頭看原先 Unique Paths的題目，如果要用 Iterations，就可以透過迴圈反向迭代。

![](/img/LeetCode/dp/unipath5.png)


可以看這張圖的右邊，原則上就是從右下角往左上角走，而作者在這裡選擇從倒數第二行和倒數第二列那格開始往回做的原因是，因為最下面那列和最右邊那行的可走路徑數量都會是 1，因此對於 `gird[1][5]` 從新的起點走到它會有的步驟數等於 `grid[2][5]` 和 `grid[1][6]`，因此可以得到一個關係式為 $F(m,n) = F(m+1, n) + F(m, n+1)$。

重新改寫程式後會像是下面這樣:

```cpp
class Solution {
public:
    int uniquePaths(int m, int n) {
        // init a m x n 2D vector with value 1
        vector<vector<int>> dp(m, vector<int>(n, 1));
        
        for(int i=m-2; i>=0; i--){
            for(int j=n-2; j>=0; j--){
                // do it backwardly
                dp[i][j] = dp[i+1][j] + dp[i][j+1];
            }
        }
        return dp[0][0];
    }
};
```

這裡詳細解釋程式碼的變更步驟:

1. 宣告一個大小 m x n 的2D Vector，其值為 1 (代表一整個網格，默認的路徑數量是 1)
2. 建立迴圈，將倒數第二行以及到數第二列的格子 (`[m-2][n-2]`) 作為迴圈的起點，每次迭代都會將index 減去 1
3. 走訪每個格子，並且規則就是我們剛剛得出的關係式
4. 從右下角一路迭代回 `[0][0]`，一旦抵達 `[0][0]`，其儲存值就會是所有的路徑值

如果把走訪過程視覺化就會像是下圖

![](/img/LeetCode/dp/tab.png)


> 執行結果和複雜度也跟步驟二一樣，並且也都是100% Runtime! 
> 另外文章作者也提到這種做法很適合用在這種從A走到B 類型的題目，要做的事情就是填表格而已

## 步驟四: Iteration + Tabulation [Optimized]

(未完待續)

# Reference
https://medium.com/@al.eks/the-ultimate-guide-to-dynamic-programming-65865ef7ec5b
https://shannonhung.github.io/posts/lecture-dp/