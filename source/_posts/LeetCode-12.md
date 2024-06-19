---
title: 整數到羅馬數字 | Medium |LeetCode#12 Integer to Roman
toc: true
tags:
  - Hash Table
  - LeetCode
  - Medium
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/12/cover.jpeg
abbrlink: Integer_to_Roman
date: 2024-06-19 09:22:14
---

# 題目敘述

![](/img/LeetCode/12/question.png)
![](/img/LeetCode/12/question2.png)

- 題目難度：`Medium`
- 題目敘述：題目主要需求是將輸入的整數 `num` 轉換成對應的羅馬數字符號，並給定一個對應表，在轉換過程有幾項轉換規則：
    - 羅馬數字是通過從最高位到最低位將小數位值的轉換連接起來形成的
    - 如果該值不以4或9開頭,則選擇可以從輸入中減去的最大值的符號,將該符號附加到結果中,減去其值,然後將剩餘部分轉換為羅馬數字。
    - 如果該值以4或9開頭,則使用表示從下一個符號中減去一個符號的減法形式,例如,4是 5(`V`)減去1(`I`):`IV`,而9是10(`X`)減去1(`I`):`IX`。只使用以下減法形式:4(`IV`)、9(`IX`)、40(`XL`)、90(`XC`)、400(`CD`)和900(`CM`)。
    - 只有10的次方(`I`、`X`、`C`、`M`)可以最多連續附加3次以表示10的倍數。不能多次附加5(`V`)、50(`L`)或500(`D`)。如果需要附加4次符號,需使用減法形式
- 限制： `1 <= num <= 3999`


# 解法

## 一開始的想法

我其實一開始偏向暴力解，就根據條件去個別判斷，然後從數字的高位數開始判斷並轉換符號，已經轉過的數字就減掉

## 我的解法

```cpp
class Solution {
public:
    string intToRoman(int num) {

    int counter=0;
    int value;
    string results;
    // 1000-3000
    value = num /1000;
    for(int i=0;i<value;i++){
        results+= 'M';   
    }
    num = num - value * 1000;
    // 100 - 900
    if (num / 100 !=4 && num /100 !=9){
        if (num > 500){
            value = (num - 500)/100;
            results += 'D';
            for (int i = 0; i < value; i++){
                results += 'C';
            }
            num = num - 500 - 100 * value;
        }
        else if (num < 500){
            value = num/100;
            for (int i=0; i< value; i++){
                results += 'C';
            }
            num = num - 100* value;
        }
        else{
            results += 'D';
            num = num -500;
        }
    }
    else if (num/100 == 4){
        // insert 400
        results +='C';
        results += 'D';
        num = num - 400;
    }
    else if (num/100 == 9){
        results += 'C';
        results += 'M';
        num = num -900;
    }
    // 10 - 90
    if(num / 10 !=4 && num /10 !=9 ){
        if(num > 50){
            results += 'L';
            value = (num-50)/10;
            for(int i=0; i< value; i++){
                results += 'X';
            }
            num = num - 50 - 10 * value;
        }
        else if (num < 50){
            value = num /10;
            for(int i=0; i< value; i++){
                results += 'X';
            }
            num = num  - 10 * value;
        }
        else {
            results += 'L';
            num = num -50;
        }
    }
    else if (num /10 ==4){
        results += 'X';
        results += 'L';
        num = num - 40;
    }
    else if (num /10 ==9){
        results += 'X';
        results += 'C';
        num = num - 90;
    }

    // 1 - 9
    if(num !=4 && num !=9 ){
        if (num > 5){
            results += 'V';
            value = num -5;
            for (int i=0;i< value; i++){
                results += 'I';
            }
        }
        else if (num < 5){
            value = num;
            for (int i=0;i< value; i++){
                results += 'I';
            }
        }
        else {
            results += 'V';
        }
        
    }
    else if(num == 4){
        results += 'I';
        results += 'V';
    }
    else if (num ==9){
        results += 'I';
        results += 'X';
    }
    return results;
        
    }
};
```

### 說明
- 從最高位的 1000 - 3000 開始處理，判斷最高位的數字，並且將 `results` 添加相對應個數的 `M`
- 接著判斷百位數，首先處理400 以及 900 外的狀況，並且分別考慮 >500 以及 < 500 和 = 500 的三種狀況，如果有500則需要額外在 `results` 添加 `D` 並且`num` 需要額外扣掉500
- 分別處理 400 和 900的狀況
- 接著處理十位數，一樣先處理 40, 90外的狀況，並且分別考慮 >50, <50 和 =50 三種狀況，若有50則需額外在 `results` 添加 `L`,並且`results`要扣掉50
- 最後處理個位數
- 回傳結果

### 執行結果

![](/img/LeetCode/12/results.png)


## 其他做法

```cpp
class Solution {
public:
    string intToRoman(int num) {

        string results="";
        vector<pair<int, string>> RomanDict = {{1000, "M"}, {900, "CM"}, {500, "D"}, {400, "CD"}, {100, "C"}, {90, "XC"}, {50, "L"}, {40, "XL"}, {10, "X"}, {9, "IX"}, {5, "V"}, {4, "IV"}, {1, "I"}};

        for (int i=0; i< RomanDict.size(); i++){
            while (num >= RomanDict[i].first){
                results += RomanDict[i].second;
                num -= RomanDict[i].first;
            } 
        }
        return results;
        
    }
};
```

另一種做法就是透過實作 Hash Table，這裡可以透過 C++ STL 中的 pair 容器去建立對應的字典，並且透過迴圈在判斷數字是否大於字典中的key欄位(數字)，如果大於等於該Key，則就在results 添加對應的符號，並且將num 扣除已經添加的數字
如此迭代下來，得出的結果也會是我們要的羅馬字串。

> 在 Pair 中，可以透過 `first` 代表第一個元素，也就是key，`second` 可代表第二個元素，也就是 value


### 執行結果

![](/img/LeetCode/12/results2.png)


# 複雜度分析

這裡可以分析最佳解的複雜度
## 時間複雜度

這段代碼的時間複雜度為 $O(1)$


外層的 for 循環遍歷了 `RomanDict` 向量,向量的大小是固定的 13,所以循環執行的次數是常數時間 $O(1)$
內層的 while 循環的執行次數取決於輸入數字 num 的大小。然而,由於輸入範圍是有限的 (1 <= num <= 3999),因此內層循環的執行次數也是有限的。
在最壞的情況下,內層循環需要執行的次數與輸入數字的位數成正比。由於輸入範圍有限,位數也是有限的,因此內層循環的時間複雜度是常數時間 $O(1)$
總的來說,無論輸入數字是多少,程式碼的執行時間都是固定的,因此時間複雜度為常數時間 $O(1)$

## 空間複雜度

這段代碼的空間複雜度為 $O(1)$


程式碼中使用了一個固定大小的向量 `RomanDict` 來存儲羅馬數字及其對應的值,它的大小為 13,不隨輸入的變化而變化。
輸出字符串 `results` 的大小最多為 15 個字符(對應最大的羅馬數字"MMMCMXCIX"),這也是一個固定的常數空間。
因此,無論輸入數字是多少,代碼所需的額外空間都是固定的,因此空間複雜度為常數空間 $O(1)$


至於原本暴力解的複雜度在，輸入範圍提高的時候，複雜度也會隨之增加，如果需要支持更大範圍的輸入,當輸入數字 num 的大小增加時,這段代碼的時間複雜度將會變為 $O(logn)$,其中 n 是輸入數字的大小。


# 參考
[1] https://blog.techbridge.cc/2017/01/21/simple-hash-table-intro/
[2] https://shengyu7697.github.io/std-unordered_map/
[3] https://leozzmc.github.io/posts/efa232a7.html#Map-%E5%92%8C-MulitMap