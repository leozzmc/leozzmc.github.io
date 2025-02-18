---
title: 刷題知識整理 | 圖(Graph)-3
tags:
  - Graph
  - DAG
  - Cycle
  - LeetCode
  - C++
categories: LeetCode筆記
aside: true
cover: /img/LeetCode/graph/cover.png
abbrlink: 597eaffb
date: 2025-02-20 11:32:23
---

# 前言

要能夠確保像是有先修微積分，才能修工程數學，這種 **有前後關係的圖論問題**，通常會用 **拓樸排序(Topological Sort)** 

![](/img/LeetCode/graph/course.png)


# 利用 DFS 尋找 Strong Connected Components(SCC)

## Strong Connected Components (SCC)

> Vertex 之間有雙向的 Edge 相連，例如 從 vertex(A) 走到 vertex(B) 同時 vertex(B) 也要有 edge 連到 vertex(A)，就會說這兩個vertex 是 strongly connected 的。

**通常可以透過多次的 DFS 來確定 Directed Graph 中有哪些 Strongly Connected Components** ， 要進行多次DFS的原因在於，只有一次DFS 可能沒辦法識別出全部的 COnnected Components，根據搜尋起點的不同，有可能也會將不同。每次在查找 Connected Components 的時候都會各自有 Depth-First Search Tree，根據不同的搜尋起點選擇，可能會形成一個大棵的Depth-First Search Tree。


{% hideToggle 以 vertex(I) vertex(F) vertex(B) 為搜尋起點 ,bg,color %}
![](/img/LeetCode/graph/SCC.png)
![](/img/LeetCode/graph/SCC-1.png)
{% endhideToggle %}

{% hideToggle 以 vertex(A) 為搜尋起點 ,bg,color %}
![](/img/LeetCode/graph/SCC-4.png)
![](/img/LeetCode/graph/SCC-3.png)
{% endhideToggle %}

透過上面圖片可以觀察到，如果以 vertex(I), vertex(F), vertex(B) 為搜尋起點可以找到三個 SCC，並且各自有各自的 Depth-First Search Tree，但如果以 Vertex(A) 為搜尋起點，只會有一個大的 SCC，真正的三個SCC並沒有被分隔開。 

## Component Graph

這裡如果Directed Graph 中有多個SCC，可以將SCC視為一個更大的Vertex $V^{\text{SCC}}$，而 SCC 彼此相連的 Edge 則會是 Component Graph 中的 Edge $E^{\text{SCC}}$ 其中

{% note info %}
$C_1 = {A,B,C,D}$
$C_2 = {E, F}$
$C_3 = {G, H , I}$
$V^{\text{SCC}} = \[C_1, C_2, C_3 \]$
$E^{\text{SCC}} = \[ (C,E),(D,F),(E,G),(F,G),(F,H) \]$
{% endnote %}


![](/img/LeetCode/graph/SCC-5.png)

> 特性:
> 1. **對於任意 Directed Graph，將其SCC視為 Vertex，就能夠構成 Component Graph**
> 2. **Component graph一定是directed acyclic graph(DAG)**: 這是因為如果C1,C2之間存在Cycle，則他們彼此之間就不會是 SCC，而會合併成一個更大的SCC， **所以不同的SCC之間一定不存在 Cycle**

所以這裡就回到剛剛的問題，透過一次DFS 根據不同搜尋起點，沒辦法正確分辨出SCC，**如何選搜尋起點才能夠分辨出對應的SCC呢？**

![](/img/LeetCode/graph/DAG.png)

{% hideToggle 不同起點形成不同DFS Tree ,bg,color %}

以 C3當起點，可以順利識別出所有SCC
![](/img/LeetCode/graph/DAG-1.png)

以 C2當起點，僅能識別出兩個SCC
![](/img/LeetCode/graph/DAG-2.png)

以 C1當起點，無法順利識別出三個SCC
![](/img/LeetCode/graph/DAG-3.png)

{% endhideToggle %}

上面可以得到一個特性，就是 **若DFS()在每次尋找「新的搜尋起點時」，能夠按照「一條path上，從尾端至開頭」的vertex順序，那麼Predecessor Subgraph就能長成「能夠分辨出SCC」的Depth-First Forest。** 

> 接下來問題就會是，如何確保每一次都能找到「一條path上，從尾端至開頭的vertex順序」？

如果觀察上面 Recursion Call (DFS Tree) 的圖片可以發現，不管搜尋起點怎麼選，如果以最終結束時間 (Finish Time, 紅色虛線) 來看，一定會是 $C_1 > C_2 > C_3$，其實這並不是什麼特別的原理，這超直覺，如果今天在一個 Directed Graph 中存在 Vertex(A) 跟 Vertex(B)，並且存在 edge(A, B) 那 Vertex(A) 的結束時間一定比 Vertex(B) 大，要嘛你選Vertex(A) 當搜尋起點，那你一定會先走到Vertex(B)，Vertex(B) 結束後才輪到 Vertex(A) 結束，今天如果選擇 Vertex(B) 當搜尋起點，但是 vertex(B) 沒有指向其他節點，因此它做完後，選擇 Vertex(A) 當搜尋起點，一樣他的結束時間會是最大。

因此

> **若directed graph中存在edge(X,Y)，那麼，C1集合中所有vertex的「最大finish」一定比C2集合中所有vertex的「最大finish」還要大。**

所以以上面 Component Graph 而言， `finish[C1] > finish[C2] > finish[C3]` ，如果回頭以 Finish Time 角度來看前面這張圖

![](/img/LeetCode/graph/SCC-1.png)


```
C1=[A,B,C,D]
finish[C1]= finish[B]=18

C2=[E,F]
finish[C2]=finish[F]=10

C3=[G,H,I]
finish[C3]=finish[I]=6

```

這裡可以發現一件事，**只要按照「finish小到大」的順序選取SCC中的vertex作為DFS()的起點，就能夠在Predecessor Subgraph中以Depth-First Forest分辨出所有SCC。** 因此這裡可以先歸納出三個步驟：

1. 先對任意 Vertex進行 DFS 取的 Finish 資訊
2. 根據所獲取的順序，來判斷第二次DFS的起點順序
3. 進行第二次 DFS 來獲得 Predecessor Subgraph 來獲取 SCC

> 不過第一點還是會有問題，因此第一點再選擇 Vertex 並沒有對SCC的先備知識，因此生成的 finish 順序不一定能夠反映 SCC 的正確拓撲結構。如果第一次 DFS 未能按某種「全局順序」遍歷強連通分量，則 finish 順序可能與 SCC 的真實結構無關，這可能會導致從後序的 SCC透過某些Edge 回到前序的 SCC

這裡可以透過轉置(Transpose) 來解決這個問題，從後序的 SCC 可能回到前序的 SCC，這會使得單純按照 finish 小到大的順序難以正確區分 SCC。透過轉置，在 $G^T$中， **SCC 之間的方向依賴性被逆轉，保證 DFS 能按照 finish 大到小的順序正確地一層一層分離 SCC。**

這裡可以發現 $G 和 $G^T$ 的 Component 一樣，但是 finish 的順序完全相反，所以第一次進行DFS後得到的finish 時間會是由大而小，轉置後就會是由小而大。
![](/img/LeetCode/graph/transpose.png)

因此，以 **第一次DFS()所得到的finish之由大到小順序** 選取起點，在 $G^T$ 上進行第二次DFS，就可以先選到 C1，由於無法從C1走回C2，因此 DFS 在搜尋完C1內的所有vertex後，便形成自己的Depth-First Tree。接著再依序挑選C2、C3為起點進行搜尋，並且建立起各自SCC的Depth-First Tree。這樣就找到了directed graph中的所有的SCC

## 演算法
- 對 $G$ 進行 DFS
- 對 $G$ 轉置，獲得 $G^T$
- 按照第一次 DFS 的 finish 順序「由大到小」依次對 $G^T$ 的節點執行 DFS，每次 DFS 會遍歷一個 SCC，
- 從第二次DFS 的predecessor找到Predecessor Subgraph (若directed graph有多個SCC，那麼Predecessor Subgraph就會是Depth-First Forest，其中的每一棵Depth-First Tree都是一個SCC)

## 程式碼


```c++
#include <iostream>
#include <vector>
#include <list>
#include <stack>
#include <algorithm>
using namespace std;

class Graph {
    private:
        int num_vertex;
        vector<list<int>> AdjList;
        void DFSVisit(int v, vector<bool> &visited, stack<int> &finishStack);
        void DFSVisitSCC(int v, vector<bool> &visited, vector<int> &component);

    public:
        Graph(int N): num_vertex(N) {
            AdjList.resize(num_vertex);
        }
        void AddEdgeList(int from, int to);
        Graph GraphTranspose();
        void FindSCCs();

};

void Graph::AddEdgeList(int from, int to){
    AdjList[from].push_back(to);
}

void Graph::DFSVisit(int v, vector<bool> &visited, stack<int> &finishStack){
    visited[v] = true;
    for(int neighbor: AdjList[v]){
        if(!visited[neighbor]){
            DFSVisit(neighbor, visited, finishStack);
        }
    }
    finishStack.push(v);
}

void Graph::DFSVisitSCC(int v, vector<bool> &visited, vector<int> &component){
    visited[v] = true;
    component.push_back(v);
    for(int neighbor: AdjList[v]){
        if(!visited[neighbor]){
            DFSVisitSCC(neighbor, visited, component);
        }
    }
}

Graph Graph::GraphTranspose(){
    Graph gT(num_vertex);
    for(int i=0; i<num_vertex; i++){
        for(int neighbor: AdjList[i]){
            gT.AddEdgeList(neighbor, i);
        }
    }
    return gT;
}

// Kosaraju's Algorithm to find SCCs
void Graph::FindSCCs(){
    stack<int> finishStack;
    vector<bool> visited(num_vertex, false);

    // First DFS to get the finish order
    for(int i=0; i< num_vertex;i++){
        if(!visited[i]){
            DFSVisit(i, visited, finishStack);
        }
    }


    // Get transposed graph
    Graph gT = GraphTranspose();

    //Second DFS to find SCCs in finishStack order
    // reinit visited array
    fill(visited.begin(), visited.end(), false);

    cout << "Strongly Connected Components: \n";
    while(!finishStack.empty()){
        int v = finishStack.top();
        finishStack.pop();

        if(!visited[v]){
            vector<int> components;
            gT.DFSVisitSCC(v, visited, components);
            for(int node: components){
                cout << node << " ";
            }
            cout << endl;
        }
    }
}

int main(){

    //Test 
    Graph g(9);
    g.AddEdgeList(0, 1);
    g.AddEdgeList(1, 2);
    g.AddEdgeList(1, 4);
    g.AddEdgeList(2, 0);
    g.AddEdgeList(2, 3);
    g.AddEdgeList(2, 5);
    g.AddEdgeList(3, 2);
    g.AddEdgeList(4, 5);
    g.AddEdgeList(4, 6);
    g.AddEdgeList(5, 4);
    g.AddEdgeList(5, 6);
    g.AddEdgeList(5, 7);
    g.AddEdgeList(6, 7);
    g.AddEdgeList(7, 8);
    g.AddEdgeList(8, 6);

    g.FindSCCs();

    return 0;
}
```

執行結果
```
Strongly Connected Components: 
0 2 1 3 
5 4 
6 8 7 
```


# 利用 DFS 尋找DAG -  Topological Sort 

回到前面提到的，如果有像是學校課表先修後修這種需要保證vertex先後順序的問題，會用 Topological Sort

{% note info %}
Topological 的基本定理:
- 在DAG(Directed Acyclic Graph)中如果存在 edge(X,Y) 則 vertex(X) 一定出現在 vertex(Y) 後面

> 看起來像廢話，有向圖中當然如果存在X接到Y的邊，那走訪過程中 X 一定會出現在Y後面
{% endnote %}


Topological Sort 只有在DAG 的狀況下才有意義，如果出現Cycle 則會違反上面提到的規定，舉例來說

![](/img/LeetCode/graph/cycle2.png)

若存在 `edge(YouTube, Dinner)` 則帶表 `YouTube` 存在於 `Dinner` 之前，要先看YouTube 再吃飯，整體序列會是 `YouTube Dinner LeetCode Exercises` 而 `edge(Dinner, LeetCode)` 的存在會出現這樣的序列 `Dinner LeetCode Exercises Youtube` 這就違反了要先看YouTUbe 再吃飯的原則。

> 因此如果在 Directed Graph 中存在 Cycle 則 Topolocal Sort 將會無意義。


回到我們的目標，想要保證走訪時的順序，根據上一章節的結論，如果一條路徑從 vertex(X) 走到 vertex(Y) 則vertex(X)的結束時間一定比vertex(Y) 來得久 (`finish[X] > finish[Y]`)  **因此只需要進行一次 DFS 並且按照 `finish` 時間由大到小印出，就是 Topological Sort**

![](/img/LeetCode/graph/topo.png)

### 程式碼

> 其實只需要改動 `FindSCCs()` 的部分邏輯，因為拓撲排序的核心概念是 DFS 完成時將節點加入 Stack，所以我們只需輸出 `finishStack` 的內容，而不用執行第二次 DFS。


```c++
#include <iostream>
#include <vector>
#include <list>
#include <stack>
#include <algorithm>
using namespace std;

class Graph {
private:
    int num_vertex;
    vector<list<int>> AdjList;
    void DFSVisit(int v, vector<bool> &visited, stack<int> &finishStack);

public:
    Graph(int N) : num_vertex(N) {
        AdjList.resize(num_vertex);
    }
    void AddEdgeList(int from, int to);
    void FindTopologicalSort(); 
};

void Graph::AddEdgeList(int from, int to) {
    AdjList[from].push_back(to);
}

void Graph::DFSVisit(int v, vector<bool> &visited, stack<int> &finishStack) {
    visited[v] = true;
    for (int neighbor : AdjList[v]) {
        if (!visited[neighbor]) {
            DFSVisit(neighbor, visited, finishStack);
        }
    }
    finishStack.push(v); //Push to stack after DFS

// Topological sort
void Graph::FindTopologicalSort() {
    stack<int> finishStack;
    vector<bool> visited(num_vertex, false);

    // Perform DFS, push the finished node to the stack
    for (int i = 0; i < num_vertex; i++) {
        if (!visited[i]) {
            DFSVisit(i, visited, finishStack);
        }
    }

    // Output Result
    cout << "Topological Sort Order:\n";
    while (!finishStack.empty()) {
        cout << finishStack.top() << " ";
        finishStack.pop();
    }
    cout << endl;
}

int main() {
    Graph g(6);
    g.AddEdgeList(5, 2);
    g.AddEdgeList(5, 0);
    g.AddEdgeList(4, 0);
    g.AddEdgeList(4, 1);
    g.AddEdgeList(2, 3);
    g.AddEdgeList(3, 1);

    g.FindTopologicalSort(); // Topological Sort

    return 0;
}
```

輸出結果
```
Topological Sort Order:
5 4 2 3 1 0 
```

## 對應的 LeetCode 題目

- [207. Course Schedule / Medium](https://leetcode.com/problems/course-schedule/description/?envType=study-plan-v2&envId=top-interview-150)
- [210. Course Schedule II / Medium](https://leetcode.com/problems/course-schedule-ii/description/?envType=study-plan-v2&envId=top-interview-150)
- [310. Minimum Height Trees](https://leetcode.com/problems/minimum-height-trees/description/?envType=problem-list-v2&envId=topological-sort)
- [269. Alien Dictionary / Hard / Premium](https://leetcode.com/problems/alien-dictionary/description/?envType=problem-list-v2&envId=topological-sort)
- [444. Sequence Reconstruction / Medium / Premium](https://leetcode.com/problems/sequence-reconstruction/description/?envType=company&envId=google&favoriteSlug=google-thirty-days)
- [1462. Course Schedule IV](https://leetcode.com/problems/course-schedule-iv/description/?envType=company&envId=google&favoriteSlug=google-thirty-days)

# 參考
https://alrightchiu.github.io/SecondRound/graph-li-yong-dfsxun-zhao-dagde-topological-sorttuo-pu-pai-xu.html
https://hackmd.io/@bangyewu/BknWuaVlT#Topological-sort%E7%AF%84%E4%BE%8B
https://bclin.tw/2022/01/18/leetcode-207/