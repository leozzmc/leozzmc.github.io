---
title: Must-Know Problem-Solving Knowledge | Tree | Advanced Implementation | LeetCode Notes
toc: true
tags:
  - Tree
  - Binary Tree
  - Tree Traversal
  - LeetCode
categories: LeetCode Notes
aside: true
abbrlink: tree_for_leetcode_2
date: 2024-07-27 21:24:07
cover: /img/LeetCode/tree/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/tree_for_leetcode_2.html)

# In-Order Traversal by Parent Field

In the [previous post introducing Tree](/en/posts/tree_for_leetcode.html) you may have noticed that when implementing the Binary Tree Node we declared a `TreeNode *parent` pointer but never used it.

We can also perform Inorder Traversal via the Parent Field. To make good use of `*parent` for traversal, two important functions need to be mentioned:

- `InorderSuccessor()`: in inorder order (LVR), find the **next node** of the traversal
- `InorderPredecessor()`: in inorder order (LVR), find the **previous node** of the traversal


![](/img/LeetCode/tree/new_inorder.png)


> The concept mentioned here will be related to the BST (Binary Search Tree) later


Before implementing these two functions to realize Inorder Traversal, there are a few preliminary tasks to complete:

- In `main()`, link up the `*parent` pointers of the different nodes
- In `class BinaryTree`, define six member functions

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

After the preliminary work, we define the member functions one by one, starting with `Leftmost()`

```cpp
TreeNode * BinaryTree::Leftmost(TreeNode *current){
    while(current->leftchild != NULL){
        current = current->leftchild;
    }
    return current;
}
```

This is intuitive: it gets, based on currentNode, the leftmost child node (i.e. the first node to visit in that subtree). **If the input is the root node, the output is the starting node of the whole Inorder Traversal.**

Next is `Successor`, which finds currentNode's next node. There are two cases here:

**Case 1: if currentNode's right child isn't NULL, then currentNode's next node in order is the leftmost node in the subtree rooted at "Current->rightchild".** It sounds convoluted; for example, in the figure below when nodeB is the currentNode, its right child isn't null, so its Successor is the leftmost node in the subtree rooted at its right child, i.e. nodeG.

**Case 2: if currentNode has no right child, then currentNode's next node is "an ancestor found via the left-child role".** For example, in the figure below nodeH has no right child, so its Successor must be its ancestor, but it has to be an ancestor node not yet visited. Since the order is inorder (LVR), it must be an ancestor found via the left-child role to be the next node. So nodeH finds nodeA as its Successor.

![](/img/LeetCode/tree/Inorder_by_parent.png)

{% note info %}
**A special reminder: when implementing Case 2, a problem occurs on certain trees, e.g. a skewed tree with only a left subtree, where the whole tree has no right subtree. In that case you must return NULL, meaning the root has no successor.**
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

With `Leftmost` and `InorderSuccessor` we can actually perform Inorder Traversal; the whole thing is combined in `Inorder_by_parent`

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
Now calling `T.Inorder_by_parent(T.root)` in `main()` outputs

```
D B G E H A F I C 
```

## Rightmost and Predecessor

`Rightmost` and `Predecessor` are conceptually similar to `Leftmost` and `Successor`, basically just with left and right swapped:

**What Rightmost does is find the rightmost node in the subtree rooted at currentNode**


```cpp
TreeNode * BinaryTree::Rightmost(TreeNode *current){
    while(current->rightchild != NULL){
        current = current->rightchild;
    }
    return current;
}
```

And Predecessor represents currentNode's previous node, whose position, like Successor, has two possibilities:

**Case 1: if currentNode's leftchild isn't null, then currentNode's previous node is the rightmost node in the subtree rooted at currentNode->leftchild.** For example, in the figure below nodeC's Predecessor is the rightmost node of the subtree rooted at nodeF (L), i.e. nodeI.


**Case 2: if currentNode has no leftchild, then currentNode's previous node is "an ancestor found via the right-child role".** For example, in the figure below nodeF has no leftchild, so by inorder order (LVR) its previous node must be its ancestor, but an already-visited ancestor, so the ancestor must be found via the right-child role. So the ancestor nodeC found by nodeF via the left-child role is not its Predecessor, so it keeps going up and finds nodeA, which is its Predecessor.


![](/img/LeetCode/tree/Inorder_by_Parent_2.png)


{% note info %}
**A special reminder: like Successor, when implementing Case 2 a problem occurs on certain trees, e.g. a skewed tree with only a right subtree, where the whole tree has no left subtree. In that case you must return NULL, meaning the root has no predecessor.**
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

With `Rightmost` and `InorderPredecessor` we can complete the reverse Inorder Traversal of a Binary Tree, realized via `Inorder_Reverse`

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

Now calling `T.Inorder_Reverse(T.root)` in `main()` gives the reverse Inorder output of the tree nodes

```
C I F A H E G B D
```

> For the full code see my **[GitHub](https://github.com/leozzmc/Leetcode/blob/main/Tree/Binary_Tree-2.cpp)**

### Rebuilding the Binary Tree

<!-- https://alrightchiu.github.io/SecondRound/binary-tree-jian-li-yi-ke-binary-tree.html -->

The brute-force Binary Tree construction in the previous post actually has some access-safety issues, because the defined pointers are all `public`, so that main can access them. Next we'll make some changes, putting the pointers into the `private` block.

# Binary Search Tree (BST)

<!-- https://alrightchiu.github.io/SecondRound/binary-search-tree-searchsou-xun-zi-liao-insertxin-zeng-zi-liao.html -->
<!-- https://alrightchiu.github.io/SecondRound/binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao.html#binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao -->

## What is a Binary Search Tree?

> A Binary Search Tree is a kind of Binary Tree whose nodes satisfy an ordering property: all left-subtree nodes <= n < right-subtree nodes, which must hold for every node n, meaning this inequality must hold for all descendants of a node

![](/img/LeetCode/tree/BST.png)

{% note info %}
The equality part in the definition above may vary; some definitions don't allow duplicate values in the tree, or duplicate values go on the right, so still go back to the problem's definition.
{% endnote %}

```
For any node R, all nodes of the subtree rooted at its left node (left subtree) must be less than R
For any node R, all nodes of the subtree rooted at its right node (right subtree) must be greater than R
The subtree rooted at any child node within a subtree also conforms to the above definition
```

Something satisfying the above definition is also called a **Normal Binary Search Tree,** while BSTs with other properties, like red-black trees, will be discussed later.

## Constructing a Binary Search Tree

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
        TreeNode* Successor(TreeNode *current);
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

> The figure above uses Jujutsu Kaisen manga characters as an example, with temporary power values assigned to them (set arbitrarily, don't take it seriously lol)

### Successful search
If I want to search for `KEY(1250)`, the flow is like this:

- First, entering the BST, `*current` points to the root, then KEY(1250) is compared with Toji's power (500); since 1250 > 500, we go into the right subtree
- current moves to Kenjaku (550), and comparing: 1250 > 550, so current moves to Kenjaku's right subtree, i.e. Gojo (2500)
- Comparing now: 2500 > 1250, so current moves to Gojo's left subtree, i.e. Yuta (1250)
- Comparing again: 1250 = 1250, a match is found, confirming the search result is Yuta, breaking out of the while loop and returning current

### Failed search

If I want to search for `KEY(6)`, the flow is:
- First, entering the BST, `*current` points to the root, then KEY(6) is compared with Toji's power (500); since 500 > 6, we go into the left subtree
- current moves to Itadori's Grandpa (13), and comparing: 13 > 6, so current moves to Itadori's Grandpa's right subtree, i.e. Itadori (12)
- Comparing now: 12 > 6, so current needs to move to Itadori's left subtree, but Itadori's left subtree is NULL
- current being NULL breaks out of the loop and returns NULL, meaning the search failed


```cpp
TreeNode *BST::search(int KEY){
    TreeNode *current = root;
    while(current!= NULL && KEY != current->key){
        if (current->key > KEY){
            current = current->leftchild;
        }
        else{
            current = current->rightchild;
        }
    }
    return current;
}
```

## Insertion

![](/img/LeetCode/tree/BST_insert_example.png)

Continuing from Search, if you want to insert data, **you must first find the appropriate insert position, then connect the node to the tree.**

To find the appropriate insert position, you need two pointers: one responsible for finding the position, one pointing to the newly inserted node's parent.

First, the pointer finding the position is called `*current`, and the pointer pointing to the parent is called `*parentInsert`; these two pointers move in sync each time.

- First `*current` enters the root node, at which point `*parentInsert` is the root's parent, i.e. NULL
- The character we want to insert now is Rika, with power 520, so KEY(520) is compared with `*current`'s Key(500); 520 > 500, so Rika should be in Toji's right subtree
- So move `*current` toward Toji's right child (Kenjaku), and update `*parentInsert` to Toji (500)
- Now compare Rika's Key(520) with Kenjaku (550); 520 < 550, so Rika should be in Kenjaku's left subtree
- So `*current` moves toward Kenjaku's left child (NULL), and `*parentInsert` is updated to Kenjaku (550)
- Since `*current` is now NULL, break out of the loop, because the appropriate insert position has been found, i.e. the child of the current `*parentInsert`

Now we just need to judge whether to insert at the current parent's left or right child position, so compare Rika (520) with the parent Kenjaku (550); the position to insert is Kenjaku's left child position, so add the node at that position, as shown in the figure.


```cpp
void BST::insertBST(int key, string element){
    TreeNode *current = root;
    TreeNode *parentInsert = NULL;
    TreeNode *insertNode = new TreeNode(key, element);


    //Find the appropriate insert position
    while(current != NULL){
        parentInsert = current;
        if(current-> key > insertNode->key){
            current = current->leftchild;
        }
        else if(current-> key < insertNode->key){
            current = current->rightchild;
        }
    }

    insertNode->parent = parentInsert;

    if(parentInsert == NULL){
        this->root = insertNode;
    }
    else if(insertNode->key > parentInsert->key){
        parentInsert->leftchild = insertNode;
    }
    else if (insertNode->key < parentInsert->key){
        parentInsert->rightchild = insertNode;
    }
}
```

You can use `insertBST` to build a BST tree

```cpp
int main(){

    BST T;

    T.insertBST(500,"Toji");
    T.insertBST(550,"Kenjaku");
    T.insertBST(2500,"Gojo");
    T.insertBST(48,"Nanami");
    T.insertBST(1250,"Yuta");
    T.insertBST(13,"Itadori's Grandpa");
    T.insertBST(3000,"Sukuna");
    T.insertBST(70,"Todo");
    T.insertBST(520,"Rika");
    T.insertBST(50,"Choso");
    T.insertBST(12,"Itadori");


    // Test insertion method
    cout << "Inorder Traversal:\n";
    T.inorderPrint();
    cout << endl;

    // Test search method
    TreeNode *node = T.search(1000);
    if(node != NULL){
        cout << "There is " << node->GetElement() << "(" << node->GetKey() << ")" << endl;
    }
    else {
        cout << "no element with Key(1000)" << endl;
    }

    node = T.search(73);
    if(node != NULL){
        cout << "There is " << node->GetElement() << "(" << node->GetKey() << ")" << endl;
    }
    else {
        cout << "no element with Key(73)" << endl;
    }


    return 0;
}
```

The `inorderPrint()` above can be realized via the `leftmost()` and `Successor` mentioned in the first half of this post.

```cpp
TreeNode *BST::leftmost(TreeNode *current){
    while(current->leftchild != NULL){
        current = current->leftchild;
    }
    return current;
};
```

```cpp
TreeNode *BST::Successor(TreeNode *current){
    if(current->rightchild != NULL){
        return leftmost(current->rightchild);
    }
    TreeNode *SuccessorNode = current->parent;
    // if current node is succesor's right child, then keep moving back to it's parent node.
    while( SuccessorNode != NULL && current == SuccessorNode->rightchild){
        current = SuccessorNode;
        SuccessorNode = SuccessorNode->parent;
    }
    // Suceessor == NULL or the current node is Successor's left child
    return SuccessorNode;
}
```

```cpp
void BST::inorderPrint(){
    TreeNode *current = new TreeNode;
    current = leftmost(root);
    while(current){
        cout << current->element << "(" << current->key << ")" << " ";
        current = Successor(current);
    }
}
```

After running the program, the output is as follows:

```output
Inorder Traversal:
Itadori(12) Itadori's Grandpa(13) Nanami(48) Choso(50) Todo(70) Toji(500) Rika(520) Kenjaku(550) Yuta(1250) Gojo(2500) Sukuna(3000) 
no element with Key(1000)
no element with Key(73)
```

This looks like the output is correct


## Sort

Take a look at the earlier figure; the tree above can actually be seen as the result of an Inorder Traversal on a tree. Because the BST definition `L subTree <= n < R subTree` matches the Inorder `(L<V<R)` order.

So running `inorderPrint()` is visiting the nodes in the BST in inorder order


## Deletion


Since deleting a node affects all nodes connected to it (`leftchild`, `rightchild`, `parent`), the following classifies three handling situations:

- **Case 1: the node to delete is a leaf, with no child pointer**
- **Case 2: the node to delete has only one child (whether leftchild or rightchild)**
- **Case 3: the node to delete has two children**


### Case 1

The solution is simple: just delete the leaf node directly, and point the original parent's child pointer at NULL

![](/img/LeetCode/tree/BST_delete_1.png)


### Case 2

Case 2, the node to delete has one child. In this case you must point its child's `*parent` at the to-be-deleted node's `*parent`, and the parent node's child pointer at that node's child, then perform the node deletion

For example, if we want to delete Gojo (2500), we must

1. First point Yuta (1250)'s `*parent` at Gojo's parent node Kenjaku (550)
2. Point Kenjaku (550)'s `rightchild` at Yuta (1250); since Yuta was already in Kenjaku's right subtree, doing this still maintains the BST
3. Delete the node Gojo (2500)


![](/img/LeetCode/tree/BST_delete_2.png)


### Case 3

Case 3, the node to delete has two children, affecting more nodes, but there's a good method:

{% note info %}
**Rather than deleting the node directly, free the memory address of its Successor or Predecessor, then replace the to-be-deleted node's data with the original Successor's or Predecessor's value.**
{% endnote %}

For example, if I want to delete Choso (50), I can free the memory address of its Successor Todo (70) (or Predecessor Nanami (48)), then put the Successor's data value Todo (70) (or Predecessor Nanami (48)) back into Choso (50)'s memory address.

![](/img/LeetCode/tree/BST_delete_3.png)


How to realize this can be simplified by a BST property: **"a node with two children, its Successor or Predecessor must be a Leaf Node or a node with only one child".** Here we can give examples to verify this property:

Itadori's Grandpa (13)'s Successor is Nanami (48), Predecessor is Itadori (12)
Toji (500)'s Successor is Kenjaku (550), Predecessor is Itadori's Grandpa (13)

> Successor: find the minimum value in the right subtree
> Predecessor: find the maximum value in the left subtree

**So the problem simplifies to Case 1 and Case 2**

### Implementation

Here we can define a new member function in the earlier BST class

```cpp
void DeleteBST(int key);
```
The flow of implementing DeleteBST is as follows:

1. First confirm via `Search()` whether the node to delete exists in the BST
2. Adjust the pointer whose memory will actually be freed to a node with "at most one child"
3. Point the actually-freed node's child at its new parent
4. Point the actually-freed node's parent at its new child
5. If the actually-freed memory is the "stand-in", put the stand-in's data back into the BST

```cpp
void BST::DeleteBST(int KEY){

    TreeNode *deleteNode = search(KEY);
    if(deleteNode == NULL){
        cout << "Error: no such node in the tree" << endl;
        return;
    }

    TreeNode *actualDeleteNode = 0;
    TreeNode *childOfDeleteNode = 0;
    
    if(deleteNode->leftchild == NULL || deleteNode->leftchild == NULL){
        // If it's Case 1 or 2, the node to be deleted is the node found by search
        actualDeleteNode = deleteNode;
    }
    else{ 
        // If it's Case 3, the node to be deleted is that node's Successor or Predecessor
        actualDeleteNode = Successor(deleteNode);
    }

    // Then point childOfDeleteNode at the left child or right child of the node whose memory will be freed
    if(actualDeleteNode->leftchild!=NULL){
        childOfDeleteNode = actualDeleteNode->leftchild;
    }
    else{
        childOfDeleteNode = actualDeleteNode->rightchild;
    }

    // If the node to delete isn't a leaf, point the child's parent back to the to-be-deleted node's parent
    if(childOfDeleteNode!=NULL){ 
        childOfDeleteNode->parent = actualDeleteNode->parent;
    }

    // Then handle the parent pointing to the child node
    if(actualDeleteNode->parent==NULL){ // consider if the root is the node to be deleted, it has no parent
        this->root = childOfDeleteNode;
    }
    else if(actualDeleteNode == actualDeleteNode->parent->leftchild){
         actualDeleteNode->parent->leftchild = childOfDeleteNode;
    }
    else{
        actualDeleteNode->parent->rightchild = childOfDeleteNode;
    }

    //Case3, the actualDeleteNode might be assigned to successor or predecessor
    if(deleteNode!= actualDeleteNode){
        deleteNode->key = actualDeleteNode->key;
        deleteNode->element = actualDeleteNode->element;
    }

    delete actualDeleteNode;
    actualDeleteNode = 0;
}
```

Then add `T.DeleteBST(50);` (delete Choso) in `main()`, and the output is as follows:

```
Inorder Traversal:
Itadori(12) Itadori's Grandpa(13) Nanami(48) Choso(50) Todo(70) Toji(500) Rika(520) Kenjaku(550) Yuta(1250) Gojo(2500) Sukuna(3000) 
After deletion:
Itadori(12) Itadori's Grandpa(13) Nanami(48) Todo(70) Toji(500) Rika(520) Kenjaku(550) Yuta(1250) Gojo(2500) Sukuna(3000)
```

Delete Toji (500), the root:

```
Inorder Traversal:
Itadori(12) Itadori's Grandpa(13) Nanami(48) Choso(50) Todo(70) Toji(500) Rika(520) Kenjaku(550) Yuta(1250) Gojo(2500) Sukuna(3000) 
After deletion:
Itadori(12) Itadori's Grandpa(13) Nanami(48) Choso(50) Todo(70) Rika(520) Kenjaku(550) Yuta(1250) Gojo(2500) Sukuna(3000)
```

# Conclusion

This time I learned to hand-code a Binary Tree and implement many BST-related operations, referencing a lot of material and completing it step by step. There are surely better or simpler ways to write it; hopefully later I can combine it with the STL and actually use it while grinding LeetCode.


# Reference

[1] https://alrightchiu.github.io/SecondRound/binary-tree-traversalxun-fang.html?source=post_page-----a02fedbc51a8--------------------------------#in

[2] https://alrightchiu.github.io/SecondRound/binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao.html#binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao

[3] https://pjchender.dev/dsa/dsa-bst/
