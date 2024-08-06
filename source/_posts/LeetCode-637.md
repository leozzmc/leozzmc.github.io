---
title: 二元樹各層的平均值 | Easy | LeetCode#637. Average of Levels in Binary Tree
tags:
  - Tree
  - Binary Tree
  - BFS
  - Level-Order Traversal
  - LeetCode
  - Easy
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/637/cover.jpg
abbrlink: c75ae7a5
date: 2024-08-06 22:31:12
---

# 題目敘述

![](/img/LeetCode/637/question1.jpeg)

![](/img/LeetCode/637/question2.jpeg)

- 題目難度: `Easy`
- 題目敘述: 題目給定一個 Binary Tree 的 `root`，求各層level 節點值的平均值，結果以陣列回傳


# 解法

## 一開始的想法

這題與[之前碰過的題目](https://leozzmc.github.io/posts/db053989.html)很像，**首先想法一樣會是先BFS (Level-Order Traversal)**。

如果能夠在各層加入某個變數，在各層結束時加入回傳陣列即可。

## 我的解法

這是我一開始的解法，但這是錯的

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
    vector<double> averageOfLevels(TreeNode* root) {
        vector<double> result;
        queue<TreeNode*> q;
        
        q.push(root);
        result.push_back(root->val);

        //cout << q.front() << " ";
        while(!q.empty()){
            int levelSize = q.size();
            int avg=0;
            double counter =0;
            TreeNode *current = q.front();
            q.pop();
            //cout << current->val << " ";
            for(int i = 0; i < levelSize; i++){
                if(current->left != NULL){
                    q.push(current->left);
                    avg+=current->left->val;
                    counter++;
                }
                if(current->right != NULL){
                    q.push(current->right);
                    avg+=current->right->val;
                    counter++;
                }
            }
            if(avg!=0) result.push_back((double)(avg/counter));
        }
        return result;
    }
};
```

這超白癡，這個 code在同層有四個child的情況下，它只能兩個兩個child去做平均，這裡其實還沒有活用到 **[這篇](https://leozzmc.github.io/posts/db053989.html)** 所學

後面改良版本的做法是這樣:

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
    vector<double> averageOfLevels(TreeNode* root) {
        vector<double> result;
        queue<TreeNode*> q;
        double counter =0;
        
        q.push(root);
        while(!q.empty()){
            int levelSize = q.size();
            int avg=0;
        
            for(int i = 0; i < levelSize; i++){
                TreeNode *current = q.front();
                q.pop();
                avg+=current->val;
                
                if(current->left != NULL)q.push(current->left);
                if(current->right != NULL)q.push(current->right);
            }
            if(avg!=0) result.push_back((double)(avg/(double)levelSize));
        }
        return result;
    }
};
```

但這個程式在我後續 submit 的時候發現了問題，只要題目 input 出現 0，0就不會輸出。

```
input: [0,-1]
output: [-1.00000]
Expect output: [0,-1.00000]
```

```
input: [98,97,null,88,null,84,null,79,87,64,null,null,null,63,69,62,null,null,null,30,null,27,59,9,null,null,null,3,null,0,null,-4,null,-16,null,-18,-7,-19,null,null,null,-23,null,-34,null,-42,null,-59,null,-63,null,-64,null,-69,null,-75,null,-81]
```

![](/img/LeetCode/637/error.jpeg)


因為我手賤加了這個不明所以的判斷，移除前面判斷後即可，但又有一個更大的問題

```cpp
if(avg!=0) result.push_back((double)(avg/(double)levelSize));
```

當測資為

```
root = [2147483647,2147483647,2147483647]
expect output: [2147483647,2147483647]
```

**這時候發生 Runtime Error**，這時候我才意識到 **我前面的變數 `int avg` overflow了**，改成 `double` 後就解決了。

> 但這也說明平常解題沒有考慮到 Edge Case，並且也不夠系統性的解決 edge case

### 程式碼說明

- 宣告一個用於儲存回傳陣列用的 vector
- 這裡實現 Level-Order Traversal 的方式一樣是用 queue
    - 首先將根節點 root 推入 queue `q`
    - 使用 while 迴圈遍歷每一層，直到 queue 為空
    - `levelSize` 儲存當前層的節點數量
    - 初始化 `avg` 來累加當前層的節點值
    - 用一個 for 迴圈存取同一層中的每一個節點
    - 走到每個節點時，檢查是否有child，如果有就送進queue裡
    - 每一層結束後，計算平均值，並添加到回傳陣列當中
- 回傳陣列


### 執行結果

![](/img/LeetCode/637/result.jpeg)


## 另一種做法 -  DFS

有看到解答區，也有人是透過DFS，然後持續追縱當前深度，並把同一深度的值做加總

![](/img/LeetCode/637/dfs.png)

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
    vector<pair<double,double>> count;
    void dfs(TreeNode* node, int depth){
        if(node==nullptr) return;
        double sum = node->val;
        if(count.size()<=depth){
            count.push_back({sum, 1});
        }
        else{
            count[depth].first +=sum;
            count[depth].second++;
        }
        
        dfs(node->left, depth+1);
        dfs(node->right, depth+1);
    }
    vector<double> averageOfLevels(TreeNode* root) {
        count.clear();
        dfs(root,0);
        //iterate through the vector
        vector<double> ans;
        for(int i=0; i<count.size();i++){
            ans.push_back(count[i].first/count[i].second);
        }
        return ans;
    }
};
```

- 上面最一開始宣告了一個 `vector<pair<double,double>>`，第一個元素用來放同一層的節點值加總，第二個元素會是同一層中的節點數量 (用來之後當作平均的分母)
- 接著額外宣告了一個函式 `dfs`，參數中除了節點指標外還有一個深度 `depth`
- 首先宣告一個sum為當前節點值
- 由於每一層都會是一個pair，因此遞迴呼叫時，一開始count中是不會有該層的，因此我們需要新增一層
```
if(count.size()<=depth){
    count.push_back({sum, 1});
}
```
- 如果 `count.size() <= depth`，就說明 `count` 中還沒有該層的資料 (剛進入下一層)
- 如果不是剛進入下一層，那就將該層節點值，陸續添加到 `count` 的第一個元素中，每次都將第二個元素+1 (代表節點數量增加) 
- 之後就是遞迴呼叫child，直到沒有節點為止

- 在主函式 `averageOfLevels`中，呼叫完 `dfs` 就遍歷 `count`，依序計算平均，並回傳結果 `ans`


### 執行結果

![](/img/LeetCode/637/result2.jpeg)


# 複雜度

## 時間複雜度

$O(n)$，其中  n 是樹中節點的數量

## 空間複雜度

$O(w)$, w 為樹的寬度，在一般情況下，空間複雜度也可視為 $O(n)$ 因為最寬的一層的節點數可能接近於節點總數的一半 ($O(n/2) = O(n)$)

# 結語


對於題目的 constraints 要多加留意，並且解題時候需要考慮大數操作 Overflow/ Underflow 的可能性。