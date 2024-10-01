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

### 重新建構 Binary Tree

<!-- https://alrightchiu.github.io/SecondRound/binary-tree-jian-li-yi-ke-binary-tree.html -->

前一篇暴力建構Binary Tree 其實是有些存取安全問題的，因為定義的 pointer 都放 `public`，目的是為了能夠讓 main存取，接下來會進行一些改動，也就是把 pointer 放入 `private` 區塊中。 

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

> 上面這張圖用咒術迴戰漫畫角色為例，暫時幫他們設定戰力值 (隨意設定的，勿認真XD)

### 搜尋成功
如果我要搜尋 `KEY(1250)` 流程會像下面一樣：

- 首先進入BST，`*current` 會指向 root，接著將 KEY(1250) 與甚爾的戰鬥力(500) 進行比較，由於 1250 > 500，因此進入 right subTree
- current 移動到羂索(550)，此時進行比較: 1250 > 550，因此current移動到羂索的 right subTree，也就是五條(2500)
- 此時進行比較: 2500 > 1250，因此將current 移動到五條的 left subTree，也就是乙骨(1250)
- 此時再進行比較: 1250 = 1250，發現匹配結果，確認搜尋結果為乙骨，跳出while迴圈，回傳 current 值 

### 搜尋失敗

如果我要搜尋 `KEY(6)` 流程如下:
- 首先進入BST，`*current` 會指向 root，接著將 KEY(6) 與甚爾的戰鬥力(500) 進行比較，由於 500 > 6，因此進入 left subTree
- current 移動虎杖爺爺(13)，此時進行比較: 13 > 6，因此current移動到虎杖爺爺的 right subTree，也就是虎杖(12)
- 此時進行比較: 12 > 6，因此需要將current 移動到虎杖的 left subTree，但虎杖的 left subTree 為 NULL
- current為 NULL 則跳出迴圈，並回傳NULL，代表搜尋失敗


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

接續著 Search，如果想要插入資料的話，**必須要先找到適當的插入位置，再將節點連接到樹上。**

要找到適當的插入位置，需要兩個指標，一個負責找位置，一個指向新插入節點的Parent。

首先找位置的指標就叫 `*current`，而指向parent 的指標就先叫 `*parentInsert`，這兩個指標每次都會同步移動。

- 首先 `*current` 進入 root 節點，此時的 `*parentInsert` 為 root 的 parent，即為NULL
- 此時我們要插入的角色為里香，戰鬥值為 520，所以 KEY(520) 與 `*current` 的 Key(500) 相比， 520 > 500，因此里香應該會是在甚爾的 right subTree
- 因此將 `*current` 往甚爾的 right child 移動 (羂索)，並且 `*parentInsert` 更新為甚爾(500)
- 此時將里香的 Key(520) 與 羂索(550)做比較，520 < 550，因此里香應該要再羂索的 left subTree
- 因此 `*current` 往羂索的 left child (NULL) 移動，並且 `*parentInsert` 更新為羂索(550)
- 由於此時的 `*current` 為 NULL，因此跳出迴圈，因為找到了適當的插入位置，即為當前 `*parentInsert` 的 child 

這時候僅需要判斷要插入在當前parent 的 left 還是 right child 位置，所以比較里香(520) 與 parent 羂索(550)，要插入的位置為羂索的 left child位置，因此這時候將節點新增在該位置上，如圖所示。


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

可以用 `insertBST` 來去建立一顆 BST Tree

```cpp
int main(){

    BST T;

    T.insertBST(500,"甚爾");
    T.insertBST(550,"羂索");
    T.insertBST(2500,"五條");
    T.insertBST(48,"七海");
    T.insertBST(1250,"乙骨");
    T.insertBST(13,"虎杖爺爺");
    T.insertBST(3000,"宿儺");
    T.insertBST(70,"東堂");
    T.insertBST(520,"里香");
    T.insertBST(50,"帳相");
    T.insertBST(12,"虎杖");


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

上面的 `inorderPrint()` 可以透過本篇前半部分提到的 `leftmost()` 以及 `Successor` 來實現。

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

我們執行程式後的輸出結果如下:

```output
Inorder Traversal:
虎杖(12) 虎杖爺爺(13) 七海(48) 帳相(50) 東堂(70) 甚爾(500) 里香(520) 羂索(550) 乙骨(1250) 五條(2500) 宿儺(3000) 
no element with Key(1000)
no element with Key(73)
```

這樣看起來輸出結果是正確的


## Sort

可以觀察一下前面的圖，其實上面的樹也可以看成對一棵樹進行 Inorder Traversal 後的結果。因為BST的定義  `L subTree <= n < R subTree` 與 Inorder `(L<V<R)` 順序相同。 

因此執行 `inorderPrint()` 就是以 inorder 順序對 BST 中節點依序進行 visiting


## Deletion


由於刪除節點，與該節點連接的所有節點 ( `leftchild`, `rightchild`, `parent` )都會受到影響，以下歸類三種處理情境:

- **情境一: 要刪除的節點是 leaf，沒有 child pointer**
- **情境二: 要刪除的節點只有一個 child (不管是 leftchild 或是 rightchild)**
- **情境三: 要刪除的節點有兩個 child**


### 情境一

解決方法很簡單，就直接把 Leaf node 刪除，原本 parent 的 child pointer 指向 NULL

![](/img/LeetCode/tree/BST_delete_1.png)


### 情境二

情境二，要刪除的node有一個child，這時必須將其child的 `*parent` 指向要刪除node的 `*parent`，而parent node 的 child pointer 要指向該node的child，之後再進行刪除節點的動作

舉例來說，如果我們要把 五條(2500) 刪掉，我們就必須

1. 先把 乙骨(1250) 的 `*parent` 指向五條的 parent node 羂索(550)
2. 把 羂索(550) 的 `rightchild` 指向 乙骨(1250)，由於乙骨本來就再羂索的 rigtht subTree，因此這麼做一樣可以維持BST
3. 刪除 五條(2500) 這個節點


![](/img/LeetCode/tree/BST_delete_2.png)


### 情境三

情境三，要刪除的node有兩個 child，影響到的node較多，但有個好方法:

{% note info %}
**與其直接刪除節點，不如釋放其 Successor 或 Predecessor 的記憶體位置，之後再拿原本 Successor 或 Predecessor 的值將待刪除節點的資料替換掉。**
{% endnote %}

舉例來說，我想要刪除帳相(50)，可以把他的 Successor 東堂(70) (或 Predecessor 七海(48)) 的記憶體位置釋放，再將Successor的資料值 東堂(70) (或 Predecessor 七海(48)) 放回帳相(50) 的記憶體位址。

![](/img/LeetCode/tree/BST_delete_3.png)


如何實現，可以透過一個BST的特性來簡化問題，即 **「具有兩個child的node，其 Successor 或 Predecessor 一定是 Leaf Node 或只有一個child 的 node」**。這裡可以為這個特性舉例子驗證看看:

虎杖爺爺(13) 的 Successor是七海(48), Predecessor 是虎杖(12)
甚爾(500) 的 Successor是羂索(550), Predecessor 是虎杖爺爺(13)

> Successor: 找 right subTree 中的最小值
> Predecessor: 找 left subTree 中最大值

**所以這樣問題就會簡化成情境一與情境二**

### 實作

這裡可以在先前的 BST class 中定義一個新的成員函數

```cpp
void DeleteBST(int key);
```
實作DeleteBST 流程如下:

1. 先透過 `Search()`確認想要刪除的node是否存在BST中
2. 把真正會被釋放記憶體的pointer調整成「至多只有一個child」的node
3. 把真正會被釋放記憶體的node的child指向新的parent
4. 把真正會被釋放記憶體的node的parent指向新的child
5. 若真正會被釋放記憶體是「替身」，再把替身的資料放回BST中

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
        // 如果是情境一或二，那要被刪除的node就是搜尋找到的node
        actualDeleteNode = deleteNode;
    }
    else{ 
        // 如果是情境三，要被刪除的就會是該node的Successor 或 Predecessor
        actualDeleteNode = Successor(deleteNode);
    }

    // 接著將 childOfDeleteNode 指向要被釋放記憶體節點的left child 或 right child節點
    if(actualDeleteNode->leftchild!=NULL){
        childOfDeleteNode = actualDeleteNode->leftchild;
    }
    else{
        childOfDeleteNode = actualDeleteNode->rightchild;
    }

    // 如果要刪除的節點不是leaf，則需要將chuld的parent指回待刪除node的parent
    if(childOfDeleteNode!=NULL){ 
        childOfDeleteNode->parent = actualDeleteNode->parent;
    }

    //接著要分別處理 Parent 指向 child node 的部分
    if(actualDeleteNode->parent==NULL){ // 要考慮如果 root 就是要被刪掉的node，那他就不會有parent
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

接著在 `main()` 加入 `T.DeleteBST(50);` (刪除帳相)，輸出結果如下:

```
Inorder Traversal:
虎杖(12) 虎杖爺爺(13) 七海(48) 帳相(50) 東堂(70) 甚爾(500) 里香(520) 羂索(550) 乙骨(1250) 五條(2500) 宿儺(3000) 
After deletion:
虎杖(12) 虎杖爺爺(13) 七海(48) 東堂(70) 甚爾(500) 里香(520) 羂索(550) 乙骨(1250) 五條(2500) 宿儺(3000)
```

刪掉甚爾(500) root:

```
Inorder Traversal:
虎杖(12) 虎杖爺爺(13) 七海(48) 帳相(50) 東堂(70) 甚爾(500) 里香(520) 羂索(550) 乙骨(1250) 五條(2500) 宿儺(3000) 
After deletion:
虎杖(12) 虎杖爺爺(13) 七海(48) 帳相(50) 東堂(70) 里香(520) 羂索(550) 乙骨(1250) 五條(2500) 宿儺(3000)
```

# 結語

這次學習手刻一個 Binary Tree 以及實現BST Tree 的許多相關操作，也參考了許多資料，逐步完成。而一定會有更好或更加簡易的寫法，希望之後能夠結合 STL 的使用，實際在刷leetcode的過程中用出來。


# Reference

[1] https://alrightchiu.github.io/SecondRound/binary-tree-traversalxun-fang.html?source=post_page-----a02fedbc51a8--------------------------------#in

[2] https://alrightchiu.github.io/SecondRound/binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao.html#binary-search-tree-sortpai-xu-deleteshan-chu-zi-liao

[3] https://pjchender.dev/dsa/dsa-bst/