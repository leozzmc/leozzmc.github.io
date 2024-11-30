---
title: LeetCode 刷題知識總整理
tags:
  - LeetCode
categories: LeetCode筆記
aside: true
toc: true
abbrlink: d0fc136d
date: 2100-11-29 09:08:02
cover:
---

# 前言

這篇用來記錄刷leetcode 的各類主題，以及不同情境下要用的對應解題策略是哪些，也連接到之前所做的筆記跟部落格

### Roadmap

> 這邊是參考 [NeetCode 官網的roadmap](https://neetcode.io/roadmap) 按照不同主題進行刷題的


# Big-O

![](/img/LeetCode/org/bigo.jpeg)

![](/img/LeetCode/org/bigo-2.jpeg)

> https://www.bigocheatsheet.com/


# Two Pointers

# Sliding Window

# Hash Table


## 使用時機1: 用於快速存取元素

一旦建立好 Hash Table 就可以用 $O(1)$ 的時間複雜度來存取元素
- [leetcode#1 two sum](https://leozzmc.github.io/posts/cb46ac9d.html)

## 使用時機2: 比對無序資料

在 Python 中實踐 Hash Table的方式就是 Dictionary，而在C++中則是透過 `unordered_map`，他們的特點就是都是 Key-Value Pair，這代表他們就是一個無序元素映射的集合。因此在比較無序資料時也會用到 Hash Table，像是可以用來記錄特定單字在某個文章出現的頻率那也可以使用 Hash Table

- [leetCode#49 Group Anagrams](https://leozzmc.github.io/posts/e106a70e.html)

# Stack

> [Stack 筆記整理](https://leozzmc.github.io/posts/a27c9492.html)： 介紹如何實作Stack，以及一些Stack STL 的基本操作

## 使用時機1: LIFO 問題

像是 **括號匹配問題(Parentheses)** `{()}` 這種檢查括號是否閉合的問題就是後進先出(LIFO)的問題，可以由左至右將左括號依序 Push 進入 Stack，碰到右括號就 Pop 出來看是否匹配。或是像用相對路徑存取檔案的這種題目，像是 `/var/www/html` 這種 **檔案路徑的情境題** 也很適合用 Stack 去做，先 push 進先前的目錄，而如果要從子目錄移動到上一層，則也需要先將子目錄 Pop 出來，這也會是 LIFO 的情境。 

- [leetcode#20 Valid Parentheses](https://leozzmc.github.io/posts/92b56b8e.html)
- [leetcode#71 Simplify Path](https://leozzmc.github.io/posts/59f3a7b5.html)


# Queue

> [Queue 筆記整理](https://leozzmc.github.io/posts/22a8b30b.html): 介紹怎麼實作Queue，並且介紹Queue STL 的基本操作

## 使用時機1: FIFO 問題

如果題目情境很講求順序，例如系統接收請求的順序這種 FIFO的問題，就很適合用到Queue，但我目前並未做到這類的 Queue題目，只有類似資料結構實作題目

- [LeetCode#225. Implement Stack using Queues](https://leozzmc.github.io/posts/6dfa2271.html)


# Linked List

> [Linked List 筆記整理](https://leozzmc.github.io/posts/c1fe4928.html) 當時主要是用C來進行實作，但是C與C++在Linked List實踐邏輯中其實一樣，語法稍有差異而已，但不太影響解題



## 使用時機1. Two Pointer

**當需要遍歷Linked List，並且需要快速找到特定節點或結構時**，快慢指針可以在一次遍歷中完成查找，適合處理效率要求較高的問題，例如尋找中間節點或判斷是否有循環。**或者今天需要比較或操作多個指針時**，雙指針可以用來實現倒數第 N 個節點的定位，或在兩條list間進行同步操作

- [**LeetCode#876 Middle of the Linked List**](https://leozzmc.github.io/posts/the_middle_of_the_list.html) 
  快慢指針找中點
- [**LeetCode#141 Linked List Cycle**](https://leozzmc.github.io/posts/992d29db.html)  
  快慢指針檢測循環
- [**LeetCode#19 Remove Nth Node From End of List**](https://leozzmc.github.io/posts/a0e0ab51.html)  
  雙指針刪除倒數第 N 個節點
- [**LeetCode#143 Reorder List**](https://leozzmc.github.io/posts/94b01956.html) 
  快慢指針找中點 + 鏈表翻轉 + 交替合併



## 使用時機2. Dummy Head

**通常如果要新增或刪除節點，抑或是頻繁的操作頭節點**，dummy head 就會試一種簡化操作的基礎技巧，**也可以用來避免特殊判斷**

- [**LeetCode#203 Remove Linked List Elements**](https://leozzmc.github.io/posts/2db2c541.html)  
  使用 dummy head 刪除指定值的節點
- [**LeetCode#21 Merge Two Sorted Lists**](https://leozzmc.github.io/posts/8b576379.html) 
  使用 dummy head 合併Linked List
- [**LeetCode#2 Add Two Numbers**](https://leozzmc.github.io/posts/3864fd1b.html) 
  使用 dummy head 構建新Linked List處理多位數相加


## 使用時機3. 反轉與結構轉換

處理single Linked List反轉、旋轉等結構轉換相關的問題，或是將其他資料結構轉換成linked list

- [**LeetCode#206 Reverse Linked List**](https://leozzmc.github.io/posts/a6b83df3.html)  
  經典Linked List反轉
- [**LeetCode#61 Rotate List**](https://leozzmc.github.io/posts/ea1b4e6c.html)  
  利用反轉實現旋轉操作
- [**LeetCode#114 Flatten Binary Tree to Linked List**](https://leozzmc.github.io/posts/f15c47a9.html)  
  將二叉樹轉換為單向Linked List


## 使用時機4. 排序與合併
處理Linked List的合併、重排和排序問題
- [**LeetCode#21 Merge Two Sorted Lists**](https://leozzmc.github.io/posts/8b576379.html)  
  合併兩個排序Linked List
- [**LeetCode#328 Odd Even Linked List**](https://leozzmc.github.io/posts/Odd_Even_Linked_List.html) 
  根據奇偶節點位置重排
- [**LeetCode#143 Reorder List**](https://leozzmc.github.io/posts/94b01956.html)  
  合併已翻轉和未翻轉的Linked List


## 使用時機5. 特殊指標處理
處理Linked List中帶有隨機指針或其他特殊結構的問題
- [**LeetCode#138 Copy List with Random Pointer**](https://leozzmc.github.io/posts/28674f4b.html)  
  深拷貝帶隨機指針的Linked List
- [**LeetCode#2 Add Two Numbers**](https://leozzmc.github.io/posts/3864fd1b.html)  
  處理帶進位的Linked List


## 使用時機6. 刪除重複節點
刪除Linked List中多餘或重複的節點
- [**LeetCode#83 Remove Duplicates from Sorted List**](https://leozzmc.github.io/posts/c8064a2b.html)  
  刪除排序Linked List中的重複節點

# Traversal

# Tree
> [Tree 筆記整理-基本](https://leozzmc.github.io/posts/tree_for_leetcode.html)
> [Tree 筆記整理-進階](https://leozzmc.github.io/posts/tree_for_leetcode_2.html)

# Recursion

> [Recursion 和 Backtracking 筆記整理](https://leozzmc.github.io/posts/48f553b3.html)

## 使用情境1: 排列組合

## 使用情境2: 子集

## 使用情境3: 迴文


# Binary Search 

# Heap

# Dynamic Programming

> [DP 筆記整理](https://leozzmc.github.io/posts/dynamic_programming.html) 整理了Dynamic Programming 的解題邏輯，跟問題背景會是怎樣的， **DP會是最佳化解答的好工具!**

判斷：**1. 大量重複子問題**, **2. 解決所有子問題，可以得到整體問題的最最佳化答案** 這時候就可以先找出題目的遞迴關係式(暴力解)，接著再透過 Memoization進行最佳化，或者如果透過Iteration 的方式直接提出最佳解。

## 使用情境1: 選與不選的問題

**對於每個元素，都可以選或不選，藉由多種選或不選的組合，可以找出正確結果，但包含了大量的重複計算**

- [LeetCode#70. Climbing Stairs](https://leozzmc.github.io/posts/355cc876.html)
- [LeetCode#322. Coin Change](https://leozzmc.github.io/posts/35e03d8a.html)
- [LeetCode#139. Word Break](https://leozzmc.github.io/posts/9081d01d.html)
- [LeetCode#120. Triangle](https://leozzmc.github.io/posts/cd4d1860.html)

其中還包括許多變形，像是股票交易的題目

- [LeetCode#309. Best Time to Buy and Sell Stock with Cooldown](https://leozzmc.github.io/posts/c95a58c1.html)

## 使用情境2: 迴文系列問題

這類題目通常在遞迴函數之外還需要額外定義的 **用於檢查回文的函數 `checkPalindrome`**，通常會將最佳化的 `dp` 陣列用於這個函數，來避免大量重複計算，如果直接用 `reverse()` 會是較高的複雜度，通常會透過 Two Pointer 的方式來去實踐回文檢查

Example
```cpp
 while(left < right){
    if(s[left] != s[right]){
        return false;
    } 
    left++;
    right--;
}
return true;
```

- [LeetCode#647. Palindromic Substrings](https://leozzmc.github.io/posts/141899d4.html)
- [LeetCode#5. Longest Palindromic Substring](https://leozzmc.github.io/posts/bf0dee7b.html)

# 常見演算法