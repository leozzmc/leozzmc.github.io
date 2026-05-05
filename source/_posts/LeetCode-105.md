---
title: >-
  透過 Preorder Traversal 和 Inorder Traversal 建構二元樹 | Medium | LeetCode#105.
  Construct Binary Tree from Preorder and Inorder Traversal
tags:
  - Tree
  - Binary Tree
  - In-Order Traversal
  - Pre-Order Traversal
  - LeetCode
  - Medium
  - C++
categories: LeetCode筆記
aside: true
abbrlink: 13d1e5ab
date: 2024-08-10 11:38:14
cover: /img/LeetCode/105/cover.jpg
---

# 題目敘述

![](/img/LeetCode/105/question.jpeg)

![](/img/LeetCode/105/question2.jpeg)

- 題目難度: `Medium`
- 題目敘述: 給兩個整數陣列 `preorder` 以及 `inorder`， `preorder` 存放一棵二元樹進行 Pre-Order Traversal 的結果，`inorder` 存放相同二元樹進行 In-Order Traversal 的結果，題目要求透過這兩個陣列來建構出原本的Binary Tree，並回傳 root 節點。

# 解法

## 一開始的想法

這次的題目卡了很久，主要流程有嘗試寫下想法，但不知道該如何用遞迴去實作。

![](/img/LeetCode/105/thought1.png)

![](/img/LeetCode/105/thought2.png)

> 字有點醜，請見諒XD

首先第一個想法就是，**Preorder Traversal 後的第一個元素必定會是Root**，而再來就是 Inorder Traversal 後的第一個元素會是整棵樹的 leftmost node，也就是最左邊的節點，所以如果能夠迭題目給的 `preorder` list，從 Root 到 leftmost node 之間的元素都會是左子樹的 left child。**在 Preorder Traversal 中，root 節點的下一個節點會是左子樹的Root**，這時檢查　`inorder` list 中， 左子樹的root，到整棵樹的root之間所經過的節點，就會是左子樹的 right child 節點。 到這裡其實已經亂掉了，比較像是看圖說故事。

## 核心想法

後來砍掉重練後，花了不少時間打底，這題的核心思想只有幾個，也就是上面標註的:

- Preorder Traversal 後的第一個元素必定會是Root
- Preorder List 中，Root 後面的節點，會先是左子樹節點，再來是右子樹，**但需要知道如何分割左右子樹**
- 這時去對照 Root 在 Inorder Traversal 中的位置，**陣列中 Root 的左側會是左子樹，右側會是右子樹**
- 既然知道左右子樹各有多少節點，**就可以回到原先的 Preorder List 中對除了 Root 以外的節點去做 partitions**
- 在左柚子樹中，就可以遞迴的去跑演算法來建立節點 **(但左右子樹要做的事情也一樣 1.找Root 2. 分割左右子樹)**

![](/img/LeetCode/105/algo1.png)

![](/img/LeetCode/105/algo2.png)

![](/img/LeetCode/105/algo3.png)

![](/img/LeetCode/105/algo4.png)

![](/img/LeetCode/105/algo5.png)

![](/img/LeetCode/105/algo6.png)


## 錯誤寫法



一開始寫出的是下面這一坨，這一坨出來的答案會是錯誤的

```cpp
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:

    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if(preorder.empty() || inorder.empty() || preorder.size() != inorder.size()) return nullptr;
        
        int rootVal = preorder[0];
        TreeNode *root = new TreeNode(rootVal);
        
        // find the mid value of the inorder list
        int mid;
        for(int mid=0; mid<inorder.size();mid++){
            if(inorder[mid]== rootVal){
                break;
            }
        }
        
        //This parts are for storing the orginal list into sub arrays.
        // except for root node
        vector <int> LeftPreorder = {preorder.begin()+1,preorder.begin()+1+mid};
        
        vector <int> LeftInorder = {inorder.begin(),inorder.begin()+mid};
        
        root -> left = buildTree(LeftPreorder, LeftInorder);

        vector <int> RightPreorder = {preorder.begin()+1+mid, preorder.end()};
        
        vector <int> RightInorder = {inorder.begin()+1+mid, inorder.end()};
        
        
        root -> right = buildTree(RightPreorder, RightInorder);
        
        return root;

    }
};
```

主要會事先宣告一個 mid，作為後續切分子樹的中間值，上面主要是要找 preorder 的 root，對應到 inorder 陣列中的位置。但其實我寫的這段會出問題，後續會進行說明。

下方遞迴呼叫其實就是去拆分子樹，並且遞迴建立節點。

```
root->left = buildTree(左子樹Preorder陣列，左子樹Inorder陣列)
root->right = buildTree(右子樹Preorder陣列，右子樹Inorder陣列)
```
但上面的程式會有幾個問題，首先是計算 mid 還有建立節點的時候，由於函數遞迴執行，因此每次都會重新建立值為 `preorder[0]` 的節點，另外找 mid 的時候，如果進到左右子樹 sub Array 去找子樹的 Root，這裡迴圈中給的範圍也會有問題。

**另外，再進行遞迴呼叫前，宣告了多個新的向量，需要確保沒有分割錯誤和越界，並且這種作法又會占用更多記憶體**

## 我的解法

```cpp
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:

    TreeNode* buildTreeHelper(const std::vector<int>& preorder, int preStart, int preEnd,
                              const std::vector<int>& inorder, int inStart, int inEnd) {
        if (preStart > preEnd || inStart > inEnd) return nullptr;

        int rootVal = preorder[preStart];
        TreeNode* root = new TreeNode(rootVal);

        int mid;
        for (mid = inStart; mid <= inEnd; mid++) {
            if (inorder[mid] == rootVal) {
                break;
            }
        }

        int leftTreeSize = mid - inStart;

        root->left = buildTreeHelper(preorder, preStart + 1, preStart + leftTreeSize, inorder, inStart, mid - 1);
        root->right = buildTreeHelper(preorder, preStart + leftTreeSize + 1, preEnd, inorder, mid + 1, inEnd);

        return root;
    }

    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if (preorder.empty() || inorder.empty() || preorder.size() != inorder.size()) return nullptr;

        return buildTreeHelper(preorder, 0, preorder.size() - 1, inorder, 0, inorder.size() - 1);
    }

};
```

這裡我們宣告一個新的 `buildTreeHelper` 函數，在一開始的參數就給定原本 list 中的 index 範圍，然後遞迴呼叫它，在反覆呼叫的過程將左右子樹的起點終點作為參數輸入，而不是去建立新的向量。


在 `buildTreeHelper` 函式中，首先輸入參數為:

```cpp
const std::vector<int>& preorder, 
int preStart, 
int preEnd,
const std::vector<int>& inorder, 
int inStart, 
int inEnd
```
分別代表，preorder 的開始index,結束index，以及 inorder 的開始index, 結束index 
另外也有傳入 `preorder` list 跟 `inorder` list，使用 `const` 可以避免在函數內意外修改list

首先

```cpp
if (preStart > preEnd || inStart > inEnd) return nullptr;
```
如果 `preStart > preEnd ` 或者 `inStart > inEnd` 則回傳 nullptr

Root 的節點值會是 `preorder[preStart]`，這就與一開始的寫法不同，這就保證了每次都能夠找到正確的 Root 值，不論是整棵樹或者是子樹。接著就是去建立節點。以及要去找到 Root 值在 Inorder List 當中的位置在哪，也就是 `mid` ，知道 `mid` 後就能夠去知道下一次建立節點，該如何切分左右子樹的範圍。

```cpp
int leftTreeSize = mid - inStart;
```

這個步驟可以知道對於 Inorder List，左子樹有多少個節點


因此一樣再度呼叫 `buildTreeHelper` 函式

```cpp
root->left = buildTreeHelper(preorder, preStart + 1, preStart + leftTreeSize, inorder, inStart, mid - 1);
root->right = buildTreeHelper(preorder, preStart + leftTreeSize + 1, preEnd, inorder, mid + 1, inEnd);
```

建構左子樹時，給定的 Preorder 範圍，會從原先的 `preStart+1` (首先要從原先的 Root 的下一個值開始建構)，到剛剛的 mid 對應preorder的位置，`preStart + leftTreeSize` 這邊會是對於當前 Root 來說，左子樹在 Preorder ˋ這個 List 的範圍。接下來 inorder 的範圍就是從 `inStart` 到 `mid-1` (排除 mid 本身，因為它會是當前的root)。

建構右子樹時，道理一樣，要去給定 Preorder 和 Inorder sub Array 的範圍，以 Preorder 來說右子樹起點會是 `preStart + leftTreeSize+1`，終點會是 `preEnd`，Inorder 的右子樹起點會是 `mid+1` (排除mid本身，因為它會是當前的root)，終點會是 `inEnd`。 

最後回來看，原本的 `buildTree` 需要判斷輸入的兩個list 是否為空，並且長度一樣，接著就呼叫 `buildTreeHelper` 函數，並將root回傳給 callee (or main())，Preorder 以及 Inorder 的範圍就先給整個list的長度。

```cpp
return buildTreeHelper(preorder, 0, preorder.size() - 1, inorder, 0, inorder.size() - 1);
```


### 執行結果

![](/img/LeetCode/105/result.jpeg)


{% note info %}
完整本地測試程式碼可以看 [我的GitHub](https://github.com/leozzmc/Leetcode/blob/main/leetcode-105.cpp)
{% endnote %}


## 更好的做法

我看比較好的做法都會是在 `buildTree` 當中增加一個 `map` 或者 `unorder_map` 來增加節點查找速度。

```cpp
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:

    TreeNode* buildTreeHelper(const std::vector<int>& preorder, int preStart, int preEnd,
                              const std::vector<int>& inorder, int inStart, int inEnd, map <int, int> & mp) {
        if (preStart > preEnd || inStart > inEnd) return nullptr;

        int rootVal = preorder[preStart];
        TreeNode* root = new TreeNode(rootVal);

        int mid = mp[root->val];

        // int mid;
        // for (mid = inStart; mid <= inEnd; mid++) {
        //     if (inorder[mid] == rootVal) {
        //         break;
        //     }
        // }

        int leftTreeSize = mid - inStart;

        root->left = buildTreeHelper(preorder, preStart + 1, preStart + leftTreeSize, inorder, inStart, mid - 1, mp);
        root->right = buildTreeHelper(preorder, preStart + leftTreeSize + 1, preEnd, inorder, mid + 1, inEnd, mp);

        return root;
    }

    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if (preorder.empty() || inorder.empty() || preorder.size() != inorder.size()) return nullptr;

        map <int, int> mp;
        for(int i=0; i < inorder.size();i++){
            mp[inorder[i]] = i;
        }

        return buildTreeHelper(preorder, 0, preorder.size() - 1, inorder, 0, inorder.size() - 1, mp);
    }

};
```

在 `buildTree` 的地方增加宣告一個 `map <int, int> mp;` 將 `inorder` 的值還有 index 放入

```cpp
map <int, int> mp;
for(int i=0; i < inorder.size();i++){
    mp[inorder[i]] = i;
}
```

在 `buildTreeHelper` 參數中多增加一個 `map <int, int> & mp`， 並且我們在最後呼叫的時候，記得把 `mp` 傳入參數。

接著在 `buildTreeHelper` 函式中找  `mid` 的時候就可以替換寫成，而不用每次遞迴呼叫函式時都執行一遍for迴圈

```cpp
int mid = mp[root->val];
```

### 執行結果

![](/img/LeetCode/105/result2.jpeg)

# 複雜度

## 時間複雜度

如果是更新前的做法：

`buildTreeHelper`: $O(n^{2})$
- 查找 root 節點，使用 for 循環從 inStart 到 inEnd 查找 rootVal 的位置， **n 為 inorder list 的長度**
- 遞迴建構左右子樹，每個節點會進行一次 for 循環查找操作，左子樹和右子樹的構建過程均會覆蓋所有節點

因此，每個節點被訪問一次並執行一個 $O(n)$ 的查找操作，總的時間複雜度為：$O(n^{2})$

`buildTree`:

調用 `buildTreeHelper`，使其主要整體函數複雜度，所以也是 $O(n^{2})$


但如果是使用 `map` 後的時間複雜度，由於遞迴呼叫不用每次都執行 for 迴圈查找 root節點，因此 `buildTreeHelper`時間複雜度降到 $O(n)$
，而 `buildTree` 也是 $O(n)$，因此整體時間複雜度會是  $O(n)$。


## 空間複雜度

- 遞迴深度與樹的高度成正比，遞迴深度為 $n$，因此function call stack 空間複雜度為 $O(n)$
- 總共創建 $n$ 個節點，因此樹結構本身的空間複雜度為 $O(n)$

因此整體空間複雜度也會是 $O(n)$

更新後的空間複雜度會需要額外 $O(n)$　大小的空間，因此整體空間複雜度還會是　$O(n)$


# 結語

這次一樣卡比較久，一開始卡最久的其實是要怎麼切分左右子樹，這次有參考這個 [YT頻道](https://www.youtube.com/watch?v=ihj4IQGZ2zc&t=21s)的講解，講得很清楚。其實感覺也可能需要重新去複習遞迴。另外我對於 `map` 的使用除了在 Hash Table 的題目外沒有甚麼使用過，感覺也可以整理一篇文章出來。