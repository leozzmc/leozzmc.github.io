---
title: 刷題必會知識 | 樹 (Tree) | 基礎篇 | LeetCode 筆記
toc: true
tags:
  - Tree
  - Binary Tree
  - Tree Traversal
  - LeetCode
categories: LeetCode筆記
aside: true
abbrlink: 1f138bdd
date: 2024-07-26 12:35:56
cover: /img/LeetCode/tree/cover.jpg
---


<!-- Roadmap: (Tree 介紹) -> (Binary Tree介紹) -> (Binary Tree 與 Binary Search Tree 差異) -> (Tree的走訪) -> (建立Binary Tree)  -->


# 甚麼是 Tree?

![](/img/LeetCode/tree/tree.png)


Tree 是一種常見的資料結構，直觀上來看樹狀結構代表階層式結構，像是族譜或是不同語言，語系的直系表就很常用樹來表示。


## 基本介紹

- **節點(Node)**: 樹的基本單位
- **根(Root)**: 樹狀結構的初始節點
- **分支(Branch)**: 節點與節點之間的分支
- **子節點(child)**: Root以外的節點
- **葉子節點(leaf)**: 沒有連接到其他子節點的節點，即樹狀結構的末端節點

## 樹的定義

Tree的定義: **由一個或是數個節點組成的有限集合** 並且

- 存在一個特定節點為Root
- 其餘節點可以分割成 $n >= 0$ 個沒有交集的(disjoint)集合 $T_{1},T_{2},...,T_{n}$ 為此Root的子樹(subtree)

> 這是一個遞迴的定義，對於上面圖中的節點A(Root)，有兩個子樹，其樹根分別是節點B和節點C，**樹中的每一個節點都是某個子樹的root**，例如節點C 就包含了兩個子樹，它們的root分別是節點E 與節點F，而節點E與F為兩個沒有子樹的樹的樹根

- A的子樹: $T_{1}(B,D)$, $T_{2}(C,E,F)$
- B的子樹: $T_{1}(D)$
- C的子樹: $T_{1}(E)$, $T_{2}(F)$

## Tree的特性

<!-- 這段感覺可以改成用圖表示，比較不冗 -->

- **分支度(Degree)為一個節點子樹數量**，以上圖為例，不同節點的degree分別為:
  - A 的 degree=2
  - B 的 degree=1
  - C 的 degree=2
- **Leaf of the tree**
  - 這棵樹的leaf分別為 D, E, F
- **childs of the tree**
  - B,C 為 A的 child node
  - D 為 B 的 child node
  - E, F 為 C 的 child node
- **Parents of the tree**
  - A 為 B,C 的 parent node
  - B 為 D 的 parent node
  - C 為 E, F 的 parent node
- **Siblings of the tree**
  - B,C 彼此為 sliblings
  - E 與 F 彼此為 sliblings
  - 其實想成家系表或族譜就好理解了
- **Descendant nodes of the tree: 代表某個節點棋子樹的所有節點**
  - A 的 descendant nodes 即為整棵樹的所有節點
  - C 的 descendant ndoes 就是 E 根 F，如果E跟F底下長出新的節點，也會是C的 descendant node
- **Level of the tree: 樹的level由root開始定義，root level 為level1**
  - A: Level 1
  - B, C: Level 2
  - D,E,F: Level 3
- **Depth: 某個node到root的level差距**
  - BC 的 Depth 為 1
  - D,E,F 的　Depth 為 2

## 樹的優缺點

這裡可以統整之前學習的資料結構的優缺點

| 結構 | 優點 | 缺點 |
|------|------|-----|
|陣列|存取速度快|插入刪除元素效率低|
|鏈結串列|插入刪除等操作效率高|存取特定節點值效率低，會需要遍歷list|

而Tree結構能增加儲存、讀取效率，Ex. Binary Sort Tree，既可以保證搜尋速度，同時也可以保證插入、刪除、修改的速度。

## Tree 的表示法

![](/img/LeetCode/tree/tree2.png)

**左子-右兄弟表示法(Left Child-Right Sibling Representation)** 是一種表達樹結構的表示法，它的原則是**每個節點至多只有一個左兒子，節點右邊至多也只有一個最近的兄弟**，透過這種表示法可以把上面的樹畫成下面的樹

![](/img/LeetCode/tree/LC-RS.png)

> 這種表示法的好處在於，可以很輕易地得到分支度為2 (`dregee = 2`) 的樹，只要將 Left-child right sibling樹順時鐘旋轉45度即可

![](/img/LeetCode/tree/binary_tree.png)


{% note info %}
這個樹的Root的右兒子是空的，這是一定的，因為轉換前的樹跟也必定不會有sibling
{% endnote %}

> **而上面這種分支度至多為2的樹也就代表每個節點最多就是兩個子樹，這種樹又稱為二元樹(Binary Tree)**


# Binary Tree

Binary tree 與 Tree是兩回事，一棵 binary tree 的定義如下：

> 為節點組成的有限集合 (可以是空集合)，每個節點至多有兩個 subTree，左子樹以及有右子樹是有順序的 (不像 Tree 的左右是無序的)

從定義上就可以看出 Binary Tree 與 Tree 之間的差異，Tree不可為空，而Binary Tree可以是空的，Binary Tree在意左右subTree的順序，但Tree並不在意順序。

## Binary Tree 種類

### Skewed Tree
- Left skewed tree: 所有的 node 都只有 left subTree
![](/img/LeetCode/tree/ls_tree.png)
- Right skewed tree: 所有的 node 都只有 right subTree
![](/img/LeetCode/tree/rs_tree.png)

###  Full Binary Tree

- 除了 leaf以外，所有節點都有兩個child，**也就是每個節點都存在left和right subTree**
- 所有的 leaf node 都在同一個 level
- 各層節點不一定全滿
![](/img/LeetCode/tree/new_full_btr.png)

### Perfect Binary Tree
- 各層全滿的 Full Binary Tree
![](/img/LeetCode/tree/full_btr.png)

### Complete BinaryTree

對一棵 binary tree 的 node 由上至下，由左至右編號，**若其編號的 node 和 full binary tree 的 node 一模一樣，則可稱為 complete binary tree**

![](/img/LeetCode/tree/complete_btr.png)
上圖編號節點與Full Binary Tree節點一致，因此為 Complete Binary Tree

![](/img/LeetCode/tree/not_complete_btr.png)
上圖節點編號與Full Binary Tree節點編號不一致，因此不為 Complete Binary Tree

{% note info %}
Full / perfect binary tree 為 complete binary tree，但 complete binary tree 不一定是 full / perfect binary tree
{% endnote%}

> 其實總結 Complete Binary Tree的特性其實就是各層節點全滿，除了最後一層，最後一層節點全部靠左


## 用 Linked List 表示一個 Tree

一個節點結構如下:

```cpp
struct Node
{
	Node* parent;
	Node* left;
	Node* right;
	int data;
};

Node* root = 0;
```

##  用 Array 表示一個 Tree

根據[這篇文章](https://web.ntnu.edu.tw/~algo/BinaryTree.html)，也可以透過陣列去實作一個Tree。


也就是以陣列編號來存取節點，並且以編號奇偶數來判斷左或是右子樹。建立一個陣列，以陣列索引值得到節點：樹根的索引值是一，索引值的兩倍是left child，索引值的兩倍再加一是right child，索引值除以二是parent。

```cpp
int tree[1024];	// tree[0] do nothing
int parent(int index) {return index / 2;}
int left(int index) {return index * 2;}
int right(int index) {return index * 2 + 1;}

void binary_tree()
{
	cout << "Root: " << tree[1];
	cout << "The left child of the root: " << tree[left(1)];
	cout << "The right child of the root: " << tree[right(1)];
}
```

![](/img/LeetCode/tree/arrary_tree.png)


但這樣做的缺點也顯而易見，就是樹的大小是固定的，並且如果不是perfect binary tree的話，陣列中會有大量的空值，非常浪費記憶體空間。以陣列大小1024為例，樹的高度也僅為10  ($2^{10}$) 
 
# Binary Tree Traversal

> 怎樣算是 Traversal?
> 取決於實作方式，如果是用 Linked List 實現的 Tree，位於 node(A) 可以藉由指向 node(B) 的pointer，由A往B進行移動，可被視為 traversal

![](/img/LeetCode/tree/traversal.png)

對於當前節點可以進行的操作:
- V: visting, 可以是印出節點資料之類的操作
- L: 移動到 left child
- R: 移動到 right child

> 如果現在當前節點是 A節點，加入一個限制  **「L 一定在 R 之前」**，則會產生三種 Traversal 方式: 前序遍歷(preorder traversal)、中序遍歷(inorder traversal)、後序遍歷(postorder traversal)、層序遍歷 (level-order traversal)

![](/img/LeetCode/tree/3traversal.png)

## Pre-Order Traversal

遍歷順序會是: Root, Left subTree, Right subTree

可應用於 **Depth-first Search (DFS)**

![](/img/LeetCode/tree/preorder_traversal.png)

遍歷順序的圖解如上圖，一開始 CurrentNode 會進到 Root 節點，也就是 A 節點，接著按到 VLR 的順序進行檢查，首先先 Visiting A節點(可能執行print節點值之類的操作)，接著檢查 left-child B(L)是否為 null，若不是則 CurrentNode 移動到 B(L)，接著以currentNode為scope，之後拜訪 B，並接續檢查 left-child，並移動到 D(L)節點，並且Visiting D(L)，由於 D 節點是 Leaf (Left, Right Child 都是 null)，因此回到 B 作為 currentNode 並且拜訪其 right child E(R)，完成後以 B 為 currentNode 的 scope 所有節點拜訪完畢，回到 B的 Parent Node 作為 currenNode 的 scope，這裡也就是指 A(V)，並且接續拜訪其 right child，也就是 C(R)，visiting C完畢後拜訪其 left child，也就是 F(L)，拜訪完畢後，嘗試訪問C的Rigth Child 發現為null，所有結點拜訪完畢，完成本次 Traversal，印出  A B D E C F。


## In-Order Traversal

遍歷順序會是: Left subTree, Root, Right subTree
實際上是採用depth-first search，只不過更動了節點的輸出順序。

![](/img/LeetCode/tree/inorder_traversal.png)

遍歷順序的圖解如上圖，一開始 CurrentNode 會進到 Root 節點，也就是 A 節點，接著按到 LVR 的順序進行檢查，先檢查 Left-Child 也就是 B 是否為 NULL，若不是則 CurrentNode 移動到 B(L)，接著以currentNode為scope 依序檢查其child，首先檢查 B的 Left-child，也就是 D 是否為NULL，若不是則將 CurrentNode 移動到 D(L)，接著就是以 D作為 currentNode 再做一次 post-order 檢查，這時會發現 D的 Letf child 和 right child 都是 NULL，這時就回到 D本身做 visiting (可能是print出D的資料值等等行為)，當前 scope 中所有節點拜訪完畢，之後就要回到 D 的 Parent 來作為當前 CurrentNode 的 scope，currentNode 便移動回 B。接著拜訪 B 的 Right child 也就是 E(R)，拜訪完畢後，以 B 為 currentNode 的 scope 全部拜訪完畢，回到 B 的 parent 也就是 A(V) 進行 Visiting，之後移動到 C(R)，檢查當前 currentNode 的 Left child 也就是 F(L)，進行拜訪，結束後移動回 C(V) 進行拜訪，確認沒有 Right child 後，本次 Traversal 結束，印出 D B E A F C。


## Post-Order Traversal

遍歷順序會是: Left subTree, Right subTree, Root


![](/img/LeetCode/tree/postorder_traversal.png)


遍歷順序的圖解如上圖，一開始 CurrentNode 會進到 Root 節點，也就是 A 節點，接著按到 LRV 的順序進行檢查，先檢查 Left-Child 也就是 B 是否為 NULL，若不是則 CurrentNode 移動到 B(L)，接著以currentNode為scope 依序檢查其child，首先檢查 B的 Left-child，也就是 D 是否為NULL，若不是則將 CurrentNode 移動到 D(L)，接著就是以 D作為 currentNode 再做一次 post-order 檢查，這時會發現 D的 Letf child 和 right child 都是 NULL，這時就回到 D本身做 visiting (可能是print出D的資料值等等行為)，當前 scope 中所有節點拜訪完畢，之後就要回到 D 的 Parent 來作為當前 CurrentNode 的 scope，currentNode 便移動回 B。

> 回到 B 就代表 以 D 作為 CurrentNode 的迴圈或函式結束

以 B 作為 CurrentNode，post-order 規則來看，目前 Left child 拜訪完畢，接著要拜訪 right child，所以往 E(R) 移動，但也由於 E 跟 D 一樣都是 Leaf，並不會朝 null 移動，因此回到 B(v) 節點進行visting，這樣就完成以 B 為 Scope 的所有 node 之 Visiting。之後回到 A(V)，以A作為 CurrentNode 進行檢查，這時要朝Right child，也就是 C(R) 移動，此時 currentNode 為 C(R)，按照post-order 進行檢查，發現 F 為 Leaf Node，就對 F 進行 Visiting，而之後可以發現 C 的 Right child 為 null，因此掠過 right child 回到 C(V)，對 C 進行 Visiting，之後 currentNode 再回到 A(V) 進行 Visiting，完成本次 Traversal，印出 D E B F C A。

## Level-order Traversal

即為 **breadth-first search(BFS)**


# 實作 Binary Tree 的不同 Traversal




# Tree 相關的 LeetCode 題目


# Reference

[1] https://hackmd.io/@meyr543/r1lbVkb-K
[2] https://www.geeksforgeeks.org/difference-between-bfs-and-dfs/
[3] https://alrightchiu.github.io/SecondRound/binary-tree-jian-li-yi-ke-binary-tree.html
[4] https://web.ntnu.edu.tw/~algo/BinaryTree.html
[5] https://alrightchiu.github.io/SecondRound/binary-tree-traversalxun-fang.html?source=post_page-----a02fedbc51a8--------------------------------#in
[6] https://it5606.medium.com/%E5%BB%BA%E7%AB%8Bbinary-tree-a02fedbc51a8
[7] https://hackmd.io/@Aquamay/HyCgHXfid
[8] https://jimmyswebnote.com/tree/