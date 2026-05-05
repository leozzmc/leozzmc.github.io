---
title: 旋轉陣列 | Medium | LeetCode#189. Rotate Array
tags:
  - Array
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/189/cover.png
abbrlink: b5a764d5
date: 2025-08-30 21:55:52
---


# 題目敘述

![](/img/LeetCode/189/question.png)

- 題目難度：`Medium`
- 題目描述： 題目給定一個整數陣列，請旋轉該陣列元素到右邊 `k` 次，其中 `k` 為非負整數

{% note info %}
這裡的陣列會是一維陣列，旋轉的意思是尾端元素移動到首端，其餘元素跟著連帶移動。
{% endnote %}


# 解法

## 一開始的想法

我首先觀察到 `k` 的範圍會是 `0 <= k <= 10^5` 因此會需要對 `k` 取餘數看最少旋轉幾次。另外就是旋轉的方法，最直觀就會是透過迴圈把尾端元素不斷往首端放，但是 `nums.length` 範圍挺廣，這樣不停移動剩下元素，時間複雜度會到 $O(n^2)$ 肯定會 time limit exceeded。

我想到另一個方法，就是找插入點，看題目給的測資可以發現，旋轉幾次其實只是取末端元素數量不同而已，然後再把末端整組元素接回首端，就能夠完成旋轉。


## 我的解法

```c++
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n=nums.size();
        k = k % n;
        if(k==0) return;
        vector<int> temp(k);
        for(int i=0; i<k; i++){
            temp[i] = nums[n-k+i];
        }
        for(int i=n-1; i>=k; i--){
            nums[i] = nums[i-k];
        }
        for(int i=0; i<k; i++){
            nums[i] = temp[i];
        }
    }
};
```

首先跟剛剛講得一樣，先判斷最少需要旋轉幾次，所以先對 `k` 取餘數。如果是 0 就直接回傳，代表不用旋轉。 另外會需要知道，旋轉 `k` 次，等同於從第幾個元素開始接到首端，這裡同樣可以觀察到：

```
nums = [1, 2, 3, 4, 5, 6, 7]
n = nums.length()

K=1 取 [7] 接到 [1,2,3,4,5,6]
K=2 取 [6,7] 接到 [1,2,3,4,5]
...
```

那如果 `k=i` 就代表要從第 `n-k` 個元素開始取，直到 `n-1`。 因此後面宣告一個暫存陣列，來去存放尾端元素。接著需要移動剩下元素往後面擠。最後就是把暫存陣列 `temp` 當中的值放到首端剛剛空出的空位裡。這樣就完成旋轉了。


### 執行結果

![](/img/LeetCode/189/result.png)


## $O(1)$ 空間複雜度的做法

只能說這個做法挺酷，其前面一樣會是對 `k` 取餘數，但這時候他會去把陣列翻轉

```
[1,2,3,4,5,6,7]
↓
[7,6,5,4,3,2,1]
```

這時候我們原先想要取出的末端元素就會在首端，並且此時會發現 `k` 即為我們之前計算時的插入點，原先會是 `n-k` 但反過來就會會是在位置 `k`。所以可以分成 `k` 之前跟 `k` 之後兩個區域

```
     k
[7,6,5,4,3,2,1]
 # # * * * * *
```

接著只要把 `k` 之後跟之前的所有元素再度個別翻轉，就會得到我們要的旋轉後的陣列

```
     k
[7,6,5,4,3,2,1]
 # # * * * * *
↓
     k
[6,7,1,2,3,4,5]
 # # * * * * *
```

實際步驟超簡單

```c++
class Solution {
public:
    void rotate(vector<int>& nums, int k) {
        int n=nums.size();
        k = k % n;
        if(k==0) return;
        reverse(nums.begin(), nums.end());
        reverse(nums.begin()+k, nums.end());
        reverse(nums.begin(), nums.begin()+k);
    }
};
```


# 複雜度

時間複雜度
$O(n)$

空間複雜度
$O(k)$ 會多使用等同於尾端元素 `k` 大小空間

第二中做法的空間複雜度會是 $O(1)$

---