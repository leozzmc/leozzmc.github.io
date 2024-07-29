---
title: 刷題必會知識 | 樹 (Tree) | 進階實作篇 | LeetCode 筆記
toc: true
tags:
  - Tree
  - Binary Tree
  - Tree Traversal
  - LeetCode
categories: LeetCode筆記
aside: true
abbrlink: tree_for_leetcode_2
date: 2024-07-27 21:24:07
cover: /img/LeetCode/tree/cover.jpg
---

# In-Order Traversal by Parent Field

在[前一篇介紹 Tree 的文章](https://leozzmc.github.io/posts/tree_for_leetcode.html) 中應該有發現，我們在實作 Binary Tree Node 的時候有宣告一個 `TreeNode *parent` 指標，但卻沒有使用。

我們在實踐 Inorder Traversal 也可以透過 Parent Field來去進行，若要善用 `*parent` 進行 Traversal 需要提及兩個重要函式:

- `InorderSuccessor()` : 以 inorder 順序尋找 (LVR) 進行 Traversal 的 **下一個 node**
- `InorderPredecessor()`: 以 inorder 順序尋找 (LVR) 進行 Traversal 的 **前一個 node**


![](/img/LeetCode/tree/new_inorder.png)


> 這裡提到的概念會與之後的 BST(Binary Search Tree) 有關聯


在實作這兩個函式來實踐 Inorder Traversal 之間還有幾項前置作業必須先完成:

- 在 `main()` 中將不同節點的 `*parent` 之間串接起來
- 在 `class BinartTree` 中定義六個成員函式

```cpp
// Link the parent pointers
    nodeB -> parent = nodeA;
    nodeC -> parent = nodeA;
    nodeD -> parent = nodeB;
    nodeE -> parent = nodeB;
    nodeG -> parent = nodeE;
    nodeH -> parent = nodeE;
    nodeF -> parent = nodeC;
    nodeI -> parent = nodeF;
```

```cpp
class BinaryTree{
    public:
        // the root is the starting node ot the tree
        TreeNode *root; 
        BinaryTree(): root(0){};
        BinaryTree(TreeNode *node): root(node){};

        void Preorder(TreeNode *current);
        void Inorder(TreeNode *current);
        void Postorder(TreeNode *current);
        void Levelorder();


        // add 6 new member functions
        TreeNode * Leftmost(TreeNode *current);
        TreeNode * Rightmost(TreeNode *current);
        TreeNode * InorderSuccessor(TreeNode *current);
        TreeNode * InorderPredecessor(TreeNode *current);
        void Inorder_by_parent(TreeNode *root);
        void Inorder_Reverse(TreeNode *root);
};
```

## Leftmost and Successor

前置作業完成後接著就是要個別定義成員函式，首先是 `Letfmost()`

```cpp
TreeNode * BinaryTree::Leftmost(TreeNode *current){
    while(current->leftchild != NULL){
        current = current->leftchild;
    }
    return current;
}
```

這邊很直觀，就是取得以currentNode為基準，最左的child節點(也就是該 subTree 第一個要訪問的節點)，**如果輸入是root Node，則輸出會是整個 Inorder Traversal 中的起始節點**

接著就是 `Successor` ，用來尋找 currentNode 的下一個節點。但這樣會有兩種狀況:

**第一種: 若 CurrentNode 的 right child 不是 NULL，則 CurrentNode下一個順序的node 會是 "Current->rightchild 為 root" 的 subTree 當中最左邊的node** 聽起來很繞口，舉例來說，下圖中的 nodeB 為 CurrentNode 的時候，此時它的 right child 不為 null，因此它的 Successor 會是以 right child 為 root 的 subTree 中最左邊的節點，也就是 nodeG

**第二種: 如果 CurrentNode 沒有 right child，則 CurrentNode 的下一個node 會是 "以 left child 身分找到的 ancestor"** ， 舉例來說，下圖中的 nodeH 並沒有 right child，因此它的 Successor 必定是它的 Ancestor，但必須得是尚未 Visiting 過的 ancestor 節點，由於順序是 inorder (LVR)，因此必須是以 Left child 身分找到得 ancestor 才會是下一個節點。因此nodeH 會找到 nodeA 為 Successor。

![](/img/LeetCode/tree/Inorder_by_parent.png)

{% note info %}
**特別提醒，在實作第二種狀況的時候，在特定的 Tree 會發生問題，例如只有 left subTree 的 skewed tree，整棵樹都沒有 right subTree，這時就必須回傳 NULL，代表 root 沒有 successor**
{% endnote %}



```cpp
TreeNode * BinaryTree::InorderSuccessor(TreeNode *current){
    if(current->rightchild != NULL){
        return Leftmost(current->rightchild);
    }
    TreeNode *Successor = current->parent;
    // if current node is succesor's right child, then keep moving back to it's parent node.
    while( Successor != NULL && current == Successor->rightchild){
        current = Successor;
        Successor = Successor->parent;
    }
    // Suceessor == NULL or the current node is Successor's left child
    return Successor;
}
```

有了 `Leftmost` 跟   `InorderSuccessor` 其實就可以進行 Inorder Traversal 了，整體會合併實現在 `Inorder_by_parent`

```cpp
void BinaryTree::Inorder_by_parent(TreeNode *root){
  TreeNode *current = new TreeNode;
  current = Leftmost(root);
  while(current != NULL ){
    cout << current->str << " ";
    current= InorderSuccessor(current);
  }
}
```
此時在 `main()` 呼叫 `T.Inorder_by_parent(T.root)` 即可輸出 

```
D B G E H A F I C 
```

## Rightmost and Predecessor

`Rightmost` 以及 `Predecessor` 和 `Leftmost` 跟 `Successor` 的概念相近，幾乎就是 left right 互換而已:

**Rightmost 要做的事就是以 CurrentNode 為 root 找到 subtree 中最右邊的節點**


```cpp
TreeNode * BinaryTree::Rightmost(TreeNode *current){
    while(current->rightchild != NULL){
        current = current->rightchild;
    }
    return current;
}
```

而 Predecessor 代表 CurrentNode 的前一個節點，其位置跟 Successor 一樣有兩種可能:

**第一種: 若 CurrentNode 的 leftchild 不為 null，則 CurrentNode 的上一個節點會是以 CurrentNode->leftchild 為 root 的 subTree 中最右邊的 node**。 舉例來說，下圖中 nodeC的 Predecessor 就會是以 nodeF (L) 為 root 之 subTree 的最右邊節點，也就是 nodeI。


**第二種: 若 CurrentNode 沒有 leftchild，則 CurrentNode 的前一個 node 會是 "以right child 身分找到的 ancestor"** 。舉例來說，下圖中 nodeF 並沒有 leftchild，因此按照 Inorder 順序 (LVR)，它的上一個節點必定為它的 ancestor，但會是已經拜訪過的 ancestor，因此尋找到 ancestor 的身分必定會是 rightchild，引此 nodeF 以 leftchild 身分找到的 ancestor nodeC 並不是它的 Predecessor，因此繼續往上找到 nodeA，即為它的 Predecessor。


![](/img/LeetCode/tree/Inorder_by_Parent_2.png)


{% note info %}
**特別提醒，跟 Successor 一樣，在實作第二種狀況的時候，在特定的 Tree 會發生問題，例如只有 right subTree 的 skewed tree，整棵樹都沒有 left subTree，這時就必須回傳 NULL，代表 root 沒有 predecessor**
{% endnote %}


```cpp
TreeNode * BinaryTree::InorderPredecessor(TreeNode *current){
    if(current->leftchild != NULL){
        return Rightmost(current->leftchild);
    }

    TreeNode *Predecessor = current->parent;
    // if current node is not predecessor's right child, then keep moving back to it's parent node.
    while(Predecessor != NULL && current == Predecessor->leftchild){
        current = Predecessor;
        Predecessor = Predecessor->parent;
    }
    // Predecesor == NULL or current node is predecessor's right child.
    return Predecessor;

}
```

透過 `rightmost` 和 `InorderPredecessor` 即可完成針對Binart Tree 的反向 Inorder Traversal。可以透過 `Inorder_Reverse` 來實現

```cpp
void BinaryTree::Inorder_Reverse(TreeNode *root){
    TreeNode *current = new TreeNode;
    current = rightmost(root);

    while(current){
        std::cout << current->str << " ";
        current = InorderPredecessor(current);
    }
}
```

此時在 `main()` 中呼叫 `T.Inorder_Reverse(T.root)` 即可得到 Tree 節點的反向 Inorder 輸出 

```
C I F A H E G B D
```

> 完整程式碼可以看我的 **[GitHub](https://github.com/leozzmc/Leetcode/blob/main/Tree/Binary_Tree-2.cpp)**

# 如果給定一個字元陣列，要如何重新建構 Binary Tree?

<!-- https://alrightchiu.github.io/SecondRound/binary-tree-jian-li-yi-ke-binary-tree.html -->

前一篇暴力建構Binary Tree 其實是有些問題的，因為定義的 pointer 都放 `public`，目的是為了能夠讓 main存取，接下來會進行一些改動，也就是把 pointer 放入 `private` 區塊中。 

# Binary Search Tree(BST)

<!-- https://alrightchiu.github.io/SecondRound/binary-search-tree-searchsou-xun-zi-liao-insertxin-zeng-zi-liao.html -->
<!-- https://alrightchiu.github.io/SecondRound/binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao.html#binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao -->

## 甚麼是 Binary Search Tree?

> Binary Search Tree 是一種 Binary Tree，它的節點滿足一個特性的順序: 所有左子樹節點 <= n < 右子樹節點，對於每個節點 n 都要成立，也就代表對節點的所有後代，這個不等式都要成立

![](/img/LeetCode/tree/BST.png)

{% note info %}
上面定義中的等式部分可能會有所不同，某些定義中樹不可以有重複值，或者重複值會位在右側，所以還是要回歸到題目定義。
{% endnote %}

```
對任一節點R，以其左節點為根的子樹(左子樹)的所有節點必小於R
對任一節點R，以其右節點為根的子樹(右子樹)的所有節點必大於R
以子樹中任一子節點為根的子樹也都符合上述定義
```

滿足上面定義的也稱作 **Normal Binary Search Tree**，而具有其他特性的 BST，像紅黑樹就以後再討論。 

## 建構 Binary Search Tree

```cpp
#include <iostream>
#include <string>

using namespace std;

class BST;

class TreeNode{
    private:
        TreeNode *leftchild, *rightchild, *parent;
        int key;
        string element;
    public:
        //constructor
        TreeNode():leftchild(0),rightchild(0), parent(0), key(0), element("") {};
        TreeNode(int a, string b):leftchild(0),rightchild(0),parent(0), key(a), element(b){};

        // main() will use these functions to access pointers in the private section
        int GetKey() { return key;}
        string GetElement() { return element;}

    friend class BST; // Can access pointers in the private section in TreeNode class
};

class BST{
    private:
        TreeNode *root;
        TreeNode *leftmost(TreeNode *current);
        TreeNode *rightmost(TreeNode *current);
    public:
        BST(): root(0){};

        TreeNode * search(int key);
        void insertBST(int key, string element);
        void inorderPrint();
        void levelorder();
    friend class BST;
};
```


## Search 

![](/img/LeetCode/tree/BST_example.png)

## Insertion

## Sort

可以觀察一下圖，其實上面的樹也可以看成對一棵樹進行 Inorder Traversal 後的結果。因為BST的定義 ~`L subTree <= n < R subTree` 與 Inorder `(L<V<R)` 順序相同。

## Deletion

# Reference

[1] https://alrightchiu.github.io/SecondRound/binary-tree-traversalxun-fang.html?source=post_page-----a02fedbc51a8--------------------------------#in

[2] https://alrightchiu.github.io/SecondRound/binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao.html#binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao
