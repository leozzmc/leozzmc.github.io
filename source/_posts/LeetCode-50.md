---
title: 'Pow(x, n) | Medium | LeetCode#50. Pow(x, n)'
tags:
  - Math
  - LeetCode
  - Medium
  - "Exponentiation by Squaring"
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/50/cover.png
abbrlink: 8a835d3b
date: 2025-10-23 14:03:36
---

# 題目敘述

![](/img/LeetCode/50/question.png)

- 題目難度：`Medium`
- 題目描述：題目要求實現常見的 `pow` 函數，正常來說 `pow(x, n)` 就會回傳 `x` 的 `n` 次方的結果。

{% note info %}
而題目有給下面限制:
- `-100.0 < x < 100.0`
- `-231 <= n <= 231-1`
- `n is an integer.`
- `Either x is not zero or n > 0.`
- `-104 <= x^n <= 104`
{% endnote %}

# 解法

## 我的解法

原先的方法會 TLE，原先這種逐項去乘會有溢位風險，如果次方給很大，Ex. `x = 2.0, n = -2147483648` => 保證TLE

```c++
class Solution {
public:
    double myPow(double x, int n) {
        double ans;
        if(n == 0) return 1;
        else if(x==1) return x;
        else if(x==0) return 0;
        else if(n ==1) return x;
        else if(n >1){
            double num = x;
            for(double i=1; i<n; i++){
                num = num* x ;
            }
            ans = num;
        }
        else {
            double num = x; 
            if(n==-1) return 1/x;
            for(double i=1; i< abs((double)n); i++){
                num = num * x;
            }
            ans = 1/num;
        }
        return ans;
    }
};
```
## 快速冪次法

另一種做法叫做 **快速冪次法(Exponentiation by Squaring)**，這是一種用於快速計算大整數乘冪的演算法，並且時間複雜度會是 $O(log n)$，其原理如下：
- 二進位分解: 將指數 `n` 轉換為二進位表示，Ex. $a^13$ 則 `13` 的二進位會是 `1101`
- 平方跟累乘: 
    - 從底數 `a` 開始，依序計算 $a^1$,$a^2$,$a^4$,$a^8$, .... (不斷平方)
    - 將指數的二進位表示中為 `1` 的位元所對應的次方數相乘，舉例來說 $a^13$ (二進位 `1101`)，表示 `13=8+4+1`。 因此需要將 $a^{8},a^{4},a^{1}$ 相乘，即 $a^{13}=a^{8}\times a^{4}\times a^{1}$

快速冪次過程只需進行約 $log _{2}n$ 次的平方和乘法，而不是傳統的 $n-1$ 次乘法。 

```c++
class Solution {
public:
    // use exponentiation by squaring
    // Example: x^13 = x^(8+4+1) = x^8 + x^4 + x^1 ( = x^(1011) binary) 
    double myPow(double x, int n) {

        if(n == 0) return 1.0;
        long long e = n;
        if(e<0){
            x = 1.0 / x;
            e = -e;
        }

        double ans = 1.0;
        while(e>0){
            // check if the LSB equal to 1, if its 1 then multiply it
            if(e & 1LL) ans *= x;
            x *= x;
            e = e>> 1;
        }
        return ans;
    }
};
```

`myPow` 中前半段先宣告一個 long long 型別的變數 `e` 用於存放指數 `n`。接著需要對負指數進行處理，如果指數為負，那 `myPow` 後的結果要是分數，因此 `x = 1.0/ x` 並且可以把負數搬回正數 `e = -e`。 揭著進行累乘，主要透過一個while迴圈，只要 `e` 還大於0就繼續計算：
1. 判斷做右邊那位元是否為 `1`:  `if(e & 1LL) ams *= x;`
2. 接下來，每一輪底數平方
3.  `e` 右移一位（丟掉處理完的那一位）

> 這邊的原理是：
> `x^13 = x^(8 + 4 + 1) = x^8 * x^4 * x^1`
```
| 位元          | 意義  | 要不要乘這個次方的 x |
| ----------- | --- | ----------- |
| 最右邊 bit (1) | x^1 | ✅ 要乘        |
| 下一個 bit (0) | x^2 | ❌ 不乘        |
| 下一個 bit (1) | x^4 | ✅ 要乘        |
| 下一個 bit (1) | x^8 | ✅ 要乘        |
```

> 另外因為 `e` 的型別是 long long，所以判斷最右邊位元是否為 1 的方式就是乘上 `1LL` => 就代表跟 64 bit 長的 1 (`0000000....0001`) 去進行 & operation，如果最右邊位元是 `1` 才會為 true

### 執行結果

![](/img/LeetCode/50/result.png)

# 複雜度

時間複雜度
$O(log n)$
空間複雜度
$O(1)$