---
title: Must-Know Problem-Solving Knowledge | Tree | Basics | LeetCode Notes
toc: true
tags:
  - Tree
  - Binary Tree
  - Tree Traversal
  - LeetCode
categories: LeetCode Notes
aside: true
abbrlink: tree_for_leetcode
date: 2024-07-26 12:35:56
cover: /img/LeetCode/tree/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/tree_for_leetcode.html)

<!-- Roadmap: (Tree 介紹) -> (Binary Tree介紹) -> (Binary Tree 與 Binary Search Tree 差異) -> (Tree的走訪) -> (建立Binary Tree)  -->


# What is a Tree?

![](/img/LeetCode/tree/tree.png)


A Tree is a common data structure. Intuitively, a tree structure represents a hierarchical structure, like a family tree or a lineage chart of different languages and language families, which are often represented with trees.


## Basic introduction

- **Node**: the basic unit of a tree
- **Root**: the initial node of the tree structure
- **Branch**: the branch between nodes
- **Child**: a node other than the root
- **Leaf**: a node not connected to any other child node, i.e. an end node of the tree structure

## Definition of a Tree

Definition of a Tree: **a finite set made up of one or several nodes,** and

- there exists a specific node that is the root
- the remaining nodes can be partitioned into $n >= 0$ disjoint sets $T_{1},T_{2},...,T_{n}$, which are the subtrees of this root

> This is a recursive definition. For node A (the root) in the figure above, there are two subtrees whose roots are node B and node C. **Every node in the tree is the root of some subtree.** For example, node C contains two subtrees whose roots are node E and node F, and nodes E and F are roots of two trees that have no subtrees.

- A's subtrees: $T_{1}(B,D)$, $T_{2}(C,E,F)$
- B's subtrees: $T_{1}(D)$
- C's subtrees: $T_{1}(E)$, $T_{2}(F)$

## Properties of a Tree

<!-- 這段感覺可以改成用圖表示，比較不冗 -->

- **The degree is the number of subtrees of a node.** Using the figure above, the degrees of the different nodes are:
  - A's degree = 2
  - B's degree = 1
  - C's degree = 2
- **Leaves of the tree**
  - The leaves of this tree are D, E, F
- **Children of the tree**
  - B, C are A's child nodes
  - D is B's child node
  - E, F are C's child nodes
- **Parents of the tree**
  - A is the parent node of B, C
  - B is the parent node of D
  - C is the parent node of E, F
- **Siblings of the tree**
  - B, C are siblings of each other
  - E and F are siblings of each other
  - It's easy to understand if you think of a family tree or lineage chart
- **Descendant nodes of the tree: all nodes in the subtree of a given node**
  - A's descendant nodes are all nodes of the whole tree
  - C's descendant nodes are E and F; if new nodes grow under E and F, they'd also be C's descendant nodes
- **Level of the tree: the level is defined starting from the root, and the root's level is level 1**
  - A: Level 1
  - B, C: Level 2
  - D, E, F: Level 3
- **Depth: the level difference from a node to the root**
  - B, C's depth is 1
  - D, E, F's depth is 2

## Pros and cons of a Tree

Here we can summarize the pros and cons of the data structures learned earlier.

| Structure | Pros | Cons |
|------|------|-----|
|Array|Fast access|Inefficient insertion/deletion of elements|
|Linked list|Efficient insertion/deletion and similar operations|Inefficient access to a specific node's value, needs to traverse the list|

A tree structure can improve storage and retrieval efficiency. For example, a Binary Sort Tree can guarantee search speed while also guaranteeing the speed of insertion, deletion, and modification.

## Tree representation

![](/img/LeetCode/tree/tree2.png)

The **Left Child-Right Sibling Representation** is a way to express a tree structure. Its principle is that **each node has at most one left child, and to the right of a node there is at most one nearest sibling.** With this representation we can draw the tree above as the tree below.

![](/img/LeetCode/tree/LC-RS.png)

> The benefit of this representation is that you can easily get a tree with degree 2 (`degree = 2`), just by rotating the left-child right-sibling tree 45 degrees clockwise.

![](/img/LeetCode/tree/binary_tree.png)


{% note info %}
The root of this tree has an empty right child, which is guaranteed, because the root of the tree before conversion must have no sibling.
{% endnote %}

> **And the above tree with degree at most 2 means each node has at most two subtrees. This kind of tree is also called a Binary Tree.**


# Binary Tree

A Binary Tree and a Tree are two different things. A binary tree is defined as follows:

> A finite set made up of nodes (which can be the empty set), where each node has at most two subtrees, and the left subtree and right subtree are ordered (unlike a Tree, where left and right are unordered).

From the definition you can see the difference between a Binary Tree and a Tree: a Tree can't be empty, while a Binary Tree can be empty; a Binary Tree cares about the order of the left and right subtrees, while a Tree doesn't care about order.

## Types of Binary Tree

### Skewed Tree
- Left skewed tree: all nodes have only a left subtree
![](/img/LeetCode/tree/ls_tree.png)
- Right skewed tree: all nodes have only a right subtree
![](/img/LeetCode/tree/rs_tree.png)

### Full Binary Tree

- Except for the leaves, all nodes have two children, **meaning every node has both a left and right subtree**
- All leaf nodes are at the same level
- The levels aren't necessarily all filled
![](/img/LeetCode/tree/new_full_btr.png)

### Perfect Binary Tree
- A Full Binary Tree whose levels are all filled
![](/img/LeetCode/tree/full_btr.png)

### Complete Binary Tree

Numbering a binary tree's nodes top to bottom and left to right, **if the numbered nodes are exactly the same as a full binary tree's nodes, it's called a complete binary tree.**

![](/img/LeetCode/tree/complete_btr.png)
The numbered nodes above match a Full Binary Tree's nodes, so it's a Complete Binary Tree.

![](/img/LeetCode/tree/not_complete_btr.png)
The node numbering above doesn't match a Full Binary Tree's node numbering, so it's not a Complete Binary Tree.

{% note info %}
A full / perfect binary tree is a complete binary tree, but a complete binary tree isn't necessarily a full / perfect binary tree.
{% endnote%}

> Summarizing the properties of a Complete Binary Tree: the nodes of each level are all filled except the last level, and the last level's nodes are all aligned to the left.


## Representing a Tree with a Linked List

A node structure looks like this:

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

## Representing a Tree with an Array

According to [this article](https://web.ntnu.edu.tw/~algo/BinaryTree.html), you can also implement a tree with an array.


That is, access nodes by array index, and judge left or right subtree by the odd/even index. Build an array and get a node by array index: the root's index is one, twice the index is the left child, twice the index plus one is the right child, and the index divided by two is the parent.

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


But the downside of this is obvious: the tree's size is fixed, and if it isn't a perfect binary tree, the array will have a lot of empty slots, wasting a lot of memory. Taking an array size of 1024 as an example, the tree's height is only 10 ($2^{10}$).
 
# Binary Tree Traversal

> What counts as traversal?
> It depends on the implementation. If the tree is implemented with a linked list, being at node(A) you can move from A to B via the pointer to node(B), which can be considered traversal.

![](/img/LeetCode/tree/traversal.png)

Operations you can perform on the current node:
- V: visiting, which can be an operation like printing the node's data
- L: move to the left child
- R: move to the right child

> If the current node is now node A, adding a constraint that **"L always comes before R"** produces three traversal methods: preorder traversal, inorder traversal, postorder traversal, and level-order traversal.

![](/img/LeetCode/tree/3traversal.png)

## Pre-Order Traversal

The traversal order is: Root, Left subtree, Right subtree

Applicable to **Depth-First Search (DFS)**

![](/img/LeetCode/tree/preorder_traversal.png)

The traversal order is illustrated above. At first CurrentNode enters the Root node, i.e. node A, then checks in VLR order: first Visiting node A (possibly printing the node's value), then checks whether left-child B(L) is null; if not, CurrentNode moves to B(L), then with currentNode as scope visits B and continues checking its left-child, moving to node D(L) and Visiting D(L). Since node D is a leaf (both left and right children are null), it returns to B as currentNode and visits its right child E(R). Once done, all nodes within B's scope have been visited, so it returns to B's parent node as currentNode's scope, which is A(V), and continues visiting its right child, which is C(R). After visiting C it visits its left child F(L), and after that, trying to visit C's right child finds it null. All nodes have been visited, completing this traversal, printing A B D E C F.


## In-Order Traversal

The traversal order is: Left subtree, Root, Right subtree
It actually uses depth-first search, just changing the order in which nodes are output.

![](/img/LeetCode/tree/Inorder_traversal.png)

The traversal order is illustrated above. At first CurrentNode enters the Root node, i.e. node A, then checks in LVR order: first check whether left-child B is NULL; if not, CurrentNode moves to B(L), then with currentNode as scope checks its children in order, first checking whether B's left-child D is NULL; if not, move CurrentNode to D(L), then do another in-order check with D as currentNode. At this point D's left and right children are both NULL, so it returns to D itself for visiting (possibly printing D's value, etc.). All nodes in the current scope have been visited, so it returns to D's parent as the current CurrentNode's scope, and currentNode moves back to B. Then it visits B's right child E(R), and after that, all of B's scope has been visited, so it returns to B's parent A(V) for Visiting, then moves to C(R), checks the current currentNode's left child F(L) and visits it, then moves back to C(V) to visit, and after confirming there's no right child, this traversal ends, printing D B E A F C.


## Post-Order Traversal

The traversal order is: Left subtree, Right subtree, Root


![](/img/LeetCode/tree/postorder_traversal.png)


The traversal order is illustrated above. At first CurrentNode enters the Root node, i.e. node A, then checks in LRV order: first check whether left-child B is NULL; if not, CurrentNode moves to B(L), then with currentNode as scope checks its children in order, first checking whether B's left-child D is NULL; if not, move CurrentNode to D(L), then do another post-order check with D as currentNode. At this point D's left and right children are both NULL, so it returns to D itself for visiting (possibly printing D's value, etc.). All nodes in the current scope have been visited, so it returns to D's parent as the current CurrentNode's scope, and currentNode moves back to B.

> Returning to B means the loop or function with D as CurrentNode has ended.

With B as CurrentNode, in post-order terms the left child has now been visited, so next we visit the right child, moving to E(R). But since E, like D, is a leaf, it won't move toward null, so it returns to node B(v) for visiting. This completes the visiting of all nodes with B as scope. Then it returns to A(V), and with A as CurrentNode it checks, now moving toward the right child C(R). At this point currentNode is C(R); checking in post-order it finds F is a leaf node, so it visits F, and then finds C's right child is null, so it skips the right child and returns to C(V) to visit C, after which currentNode returns to A(V) for visiting, completing this traversal, printing D E B F C A.

## Level-order Traversal

This is **breadth-first search (BFS)**, which mainly visits each node top to bottom by level order, and within the same level visits from left to right.

> It's usually implemented with a Queue.

![](/img/LeetCode/tree/levelorder_traversal.png)


The output order is: A B C D E F G H I

# Implementing different traversals of a Binary Tree

## Brute-force implementation of a Binary Tree

```cpp

# include <iostream>
# include <string>
# include <queue>
using namespace std;

class BinaryTree;

class TreeNode{
    public:
        TreeNode *leftchild;
        TreeNode *rightchild;
        TreeNode *parent;
        string str;

        //constructor
        TreeNode(): leftchild(0), rightchild(0),parent(0), str(""){};
        TreeNode(string s): leftchild(0), rightchild(0), parent(0), str(s){};

        friend class BinaryTree;
};


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
};
```

In `main()` we create and link the nodes in order, forming a Binary Tree.

```cpp
int main(){
    // Instanitate  all tree nodes
    TreeNode *nodeA = new TreeNode("A");
    TreeNode *nodeB = new TreeNode("B");
    TreeNode *nodeC = new TreeNode("C");
    TreeNode *nodeD = new TreeNode("D");
    TreeNode *nodeE = new TreeNode("E");
    TreeNode *nodeF = new TreeNode("F");
    TreeNode *nodeG = new TreeNode("G");
    TreeNode *nodeH = new TreeNode("H");
    TreeNode *nodeI = new TreeNode("I");

    //Construct a binary tree
    nodeA -> leftchild = nodeB;
    nodeA -> rightchild = nodeC;
    nodeB -> leftchild = nodeD;
    nodeB -> rightchild = nodeE;
    nodeE -> leftchild = nodeG;
    nodeE -> rightchild = nodeH;
    nodeC -> leftchild = nodeF;
    nodeF -> rightchild = nodeI;

    // Given a root node
    BinaryTree T(nodeA);

    //Traversal
    T.Preorder(T.root);
    cout << endl;
    T.Inorder(T.root);
    cout << endl;
    T.Postorder(T.root);
    cout << endl;
    T.Levelorder();
    cout << endl;

    return 0;
}
```
The tree built here looks like this


![](/img/LeetCode/tree/BT.png)

Next we define the traversal methods, mainly implemented recursively, because this lets us return to a child's parent after visiting the child.

## Pre-Order

```cpp
// V-> L-> R
void BinaryTree::Preorder(TreeNode *current){
    if(current){
        // visiting the current node
        cout << current->str << " " ;
        // if leftchild exists, moving currentNode to the left child
        Preorder(current->leftchild);
        Preorder(current->rightchild);
    }
}
```

## In-Order

```cpp
// L -> V -> R
void BinaryTree::Inorder(TreeNode *current){
    if(current){
        Inorder(current->leftchild);
        cout << current->str << " " ;
        Inorder(current->rightchild);
    }

}
```

## Post-Order

```cpp
// L -> R -> V
void BinaryTree::Postorder(TreeNode *current){
    if(current){
        Postorder(current->leftchild);
        Postorder(current->rightchild);
        cout << current->str << " " ;
    }
}
```

## Level-Order

The characteristic of Level-Order is accessing left to right within the same level and top to bottom across different levels. Since what's accessed first is visited first, this property resembles a Queue, so we choose a Queue to implement it.

```cpp
// Using Queue
void BinaryTree::Levelorder(){
    queue<TreeNode*> q;
    q.push(this->root);

    while(!q.empty()){
        TreeNode *current = q.front();
        q.pop();

        cout << current->str << " " ;
        if(current->leftchild != NULL){
            q.push(current->leftchild);
        }
        if(current->rightchild != NULL){
            q.push(current->rightchild);
        }
    }
}
```

First we define a Queue and push the root node into the queue. When traversal begins, current is defined as the Queue's front and that node is removed from the Queue, then the current node's value is printed. After that, first check the left child; if not NULL, push it into the queue. Within the same level, check whether the right child is empty; if not, push it into the queue too. Then, since the Queue isn't empty, the front at this point is the left child from before, so update current to the front and print its value, then check whether its left and right subtrees are empty, pushing into the queue if not. The next iteration handles the right child just pushed into the queue, likewise printing its value and checking whether its descendants are empty, pushing into the queue if not. This completes the visiting of the second level, and afterward it processes the next level (the elements now in the Queue).

## Output

```
A B D E G H C F I   // Preorder
D B G E H A F I C   // Inorder
D G H E B I F C A   // Postorder
A B C D E F G H I   // Levelorder
```


# Conclusion

This post introduced what a Tree is, its definition and properties, the Binary Tree, and the different traversal methods and code. Later I'll go further into extended code implementations, and introduce the BST (Binary Search Tree) along with the implementation of BFS and DFS.


# Reference

[1] https://hackmd.io/@meyr543/r1lbVkb-K
[2] https://www.geeksforgeeks.org/difference-between-bfs-and-dfs/
[3] https://alrightchiu.github.io/SecondRound/binary-tree-jian-li-yi-ke-binary-tree.html
[4] https://web.ntnu.edu.tw/~algo/BinaryTree.html
[5] https://alrightchiu.github.io/SecondRound/binary-tree-traversalxun-fang.html?source=post_page-----a02fedbc51a8--------------------------------#in
[6] https://it5606.medium.com/%E5%BB%BA%E7%AB%8Bbinary-tree-a02fedbc51a8
[7] https://hackmd.io/@Aquamay/HyCgHXfid
[8] https://jimmyswebnote.com/tree/
