---
title: Problem-Solving Notes | Graphs-3
tags:
  - Graph
  - DAG
  - Cycle
  - LeetCode
  - C++
categories: LeetCode Notes
aside: true
cover: /img/LeetCode/graph/cover.png
abbrlink: "597eaffb"
date: 2025-02-20 11:32:23
---

> 🌐 中文版：[繁體中文](/posts/597eaffb.html)

# Intro

To guarantee things like "you must take Calculus before you can take Engineering Mathematics", this kind of **graph problem with ordering dependencies** is usually handled with **Topological Sort.**

![](/img/LeetCode/graph/course.png)


# Using DFS to find Strongly Connected Components (SCC)

## Strongly Connected Components (SCC)

> When vertices are connected by edges in both directions, for example going from vertex(A) to vertex(B) while vertex(B) also has an edge back to vertex(A), we say these two vertices are strongly connected.

**You can usually determine which Strongly Connected Components exist in a directed graph through multiple DFS runs.** The reason for multiple DFS runs is that a single DFS may not identify all the connected components, and depending on the search start point the result can differ. Each time you look for connected components you get a separate Depth-First Search Tree, and depending on the choice of search start point, a large Depth-First Search Tree may form.


{% hideToggle Using vertex(I), vertex(F), vertex(B) as search start points,bg,color %}
![](/img/LeetCode/graph/SCC.png)
![](/img/LeetCode/graph/SCC-1.png)
{% endhideToggle %}

{% hideToggle Using vertex(A) as the search start point,bg,color %}
![](/img/LeetCode/graph/SCC-4.png)
![](/img/LeetCode/graph/SCC-3.png)
{% endhideToggle %}

From the figures above you can observe that using vertex(I), vertex(F), vertex(B) as start points finds three SCCs, each with its own Depth-First Search Tree. But using vertex(A) as the start point gives just one large SCC, and the true three SCCs aren't separated.

## Component Graph

Here, if a directed graph has multiple SCCs, you can treat each SCC as a larger vertex $V^{\text{SCC}}$, and the edges connecting the SCCs become the edges $E^{\text{SCC}}$ in the component graph, where

{% note info %}
$C_1 = {A,B,C,D}$
$C_2 = {E, F}$
$C_3 = {G, H , I}$
$V^{\text{SCC}} = \[C_1, C_2, C_3 \]$
$E^{\text{SCC}} = \[ (C,E),(D,F),(E,G),(F,G),(F,H) \]$
{% endnote %}


![](/img/LeetCode/graph/SCC-5.png)

> Properties:
> 1. **For any directed graph, treating its SCCs as vertices forms a component graph.**
> 2. **A component graph is always a directed acyclic graph (DAG):** this is because if a cycle existed between C1 and C2, then they wouldn't be separate SCCs and would merge into a larger SCC, **so there is never a cycle between different SCCs.**

So this comes back to the earlier problem: a single DFS with different start points can't correctly distinguish the SCCs. **How do we choose the start point so that the corresponding SCCs can be distinguished?**

![](/img/LeetCode/graph/DAG.png)

{% hideToggle Different start points form different DFS trees,bg,color %}

Starting from C3, all SCCs are identified successfully
![](/img/LeetCode/graph/DAG-1.png)

Starting from C2, only two SCCs are identified
![](/img/LeetCode/graph/DAG-2.png)

Starting from C1, the three SCCs can't be identified successfully
![](/img/LeetCode/graph/DAG-3.png)

{% endhideToggle %}

From the above we get a property: **if DFS(), each time it looks for a "new search start point", can follow the vertex order "from the tail to the head along a path", then the predecessor subgraph can grow into a Depth-First Forest that distinguishes the SCCs.**

> So the next question is: how do we ensure that every time we can find "the vertex order from the tail to the head along a path"?

If you observe the recursion call (DFS tree) figures above, you'll find that no matter how the search start point is chosen, in terms of the final finish time (the red dashed line) it's always $C_1 > C_2 > C_3$. This isn't actually any special principle, it's super intuitive: if in a directed graph there exist vertex(A) and vertex(B) with edge(A, B), then vertex(A)'s finish time must be larger than vertex(B)'s. Either you pick vertex(A) as the start point, in which case you'll reach vertex(B) first and vertex(A) finishes only after vertex(B); or you pick vertex(B) as the start, but vertex(B) doesn't point to other nodes, so once it's done you pick vertex(A) as the start, and its finish time is still the largest.

Therefore

> **If edge(X,Y) exists in a directed graph, then the "maximum finish" of all vertices in set C1 must be larger than the "maximum finish" of all vertices in set C2.**

So for the component graph above, `finish[C1] > finish[C2] > finish[C3]`. If we look at the earlier figure from the finish-time angle

![](/img/LeetCode/graph/SCC-1.png)


```
C1=[A,B,C,D]
finish[C1]= finish[B]=18

C2=[E,F]
finish[C2]=finish[F]=10

C3=[G,H,I]
finish[C3]=finish[I]=6

```

Here you can notice one thing: **as long as you pick the vertices of the SCCs as DFS() start points in order of "finish time from small to large", you can distinguish all the SCCs as a Depth-First Forest in the predecessor subgraph.** So we can summarize three steps:

1. First run DFS on any vertex to obtain the finish information
2. Based on the order obtained, decide the start-point order for the second DFS
3. Run the second DFS to obtain the predecessor subgraph and thus the SCCs

> There's still a problem with point one: when picking the vertex in point one we have no prior knowledge of the SCCs, so the generated finish order doesn't necessarily reflect the correct topological structure of the SCCs. If the first DFS fails to traverse the strongly connected components in some "global order", the finish order may be unrelated to the true structure of the SCCs, which could cause a later SCC to go back to an earlier SCC via some edge.

We can solve this with the transpose. A later SCC might go back to an earlier SCC, which makes it hard to correctly distinguish SCCs purely by finish order from small to large. Through the transpose, in $G^T$ **the directional dependency between SCCs is reversed, guaranteeing DFS can correctly separate the SCCs layer by layer in order of finish from large to small.**

Here you can see that $G$ and $G^T$ have the same components, but the finish order is completely reversed. So the finish times obtained after the first DFS are from large to small, and after transposing they become small to large.
![](/img/LeetCode/graph/transpose.png)

Therefore, picking start points by the **"finish from large to small" order obtained from the first DFS()** and running the second DFS on $G^T$, we first pick C1. Since we can't walk from C1 back to C2, after DFS finishes searching all vertices in C1 it forms its own Depth-First Tree. Then we pick C2 and C3 in turn as start points and build each SCC's Depth-First Tree. This finds all the SCCs in the directed graph.

## Algorithm
- Run DFS on $G$
- Transpose $G$ to get $G^T$
- Run DFS on $G^T$'s nodes in order of the first DFS's finish "from large to small"; each DFS traverses one SCC
- Find the predecessor subgraph from the second DFS's predecessors (if the directed graph has multiple SCCs, the predecessor subgraph is a Depth-First Forest where each Depth-First Tree is an SCC)

## Code


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

Execution result
```
Strongly Connected Components: 
0 2 1 3 
5 4 
6 8 7 
```


# Using DFS to find a DAG - Topological Sort

Back to what was mentioned earlier: if you have a problem like a school's prerequisite/follow-up course schedule that needs to guarantee the ordering of vertices, you use Topological Sort.

{% note info %}
The basic theorem of Topological Sort:
- In a DAG (Directed Acyclic Graph), if edge(X,Y) exists then vertex(X) must appear after vertex(Y)

> It sounds like stating the obvious: in a directed graph, of course if an edge from X to Y exists, then during traversal X must appear after Y.
{% endnote %}


Topological Sort is only meaningful in a DAG. If a cycle appears it violates the rule mentioned above. For example,

![](/img/LeetCode/graph/cycle2.png)

If `edge(YouTube, Dinner)` exists, it means `YouTube` comes before `Dinner`: watch YouTube before eating. The overall sequence would be `YouTube Dinner LeetCode Exercises`, while the existence of `edge(Dinner, LeetCode)` would produce the sequence `Dinner LeetCode Exercises Youtube`, which violates the principle of watching YouTube before eating.

> So if a cycle exists in a directed graph, Topological Sort is meaningless.


Back to our goal: we want to guarantee the order during traversal. Based on the conclusion of the previous section, if a path goes from vertex(X) to vertex(Y) then vertex(X)'s finish time must be larger than vertex(Y)'s (`finish[X] > finish[Y]`). **So you only need to run one DFS and print in order of `finish` time from large to small, and that's the Topological Sort.**

![](/img/LeetCode/graph/topo.png)

### Code

> Actually you only need to change part of the `FindSCCs()` logic, because the core idea of topological sort is to push a node onto a stack when DFS completes it, so we just output the contents of `finishStack` without running a second DFS.


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

Output
```
Topological Sort Order:
5 4 2 3 1 0 
```

## Corresponding LeetCode problems

- [207. Course Schedule / Medium](https://leetcode.com/problems/course-schedule/description/?envType=study-plan-v2&envId=top-interview-150)
- [210. Course Schedule II / Medium](https://leetcode.com/problems/course-schedule-ii/description/?envType=study-plan-v2&envId=top-interview-150)
- [310. Minimum Height Trees](https://leetcode.com/problems/minimum-height-trees/description/?envType=problem-list-v2&envId=topological-sort)
- [269. Alien Dictionary / Hard / Premium](https://leetcode.com/problems/alien-dictionary/description/?envType=problem-list-v2&envId=topological-sort)
- [444. Sequence Reconstruction / Medium / Premium](https://leetcode.com/problems/sequence-reconstruction/description/?envType=company&envId=google&favoriteSlug=google-thirty-days)
- [1462. Course Schedule IV](https://leetcode.com/problems/course-schedule-iv/description/?envType=company&envId=google&favoriteSlug=google-thirty-days)

# References
https://alrightchiu.github.io/SecondRound/graph-li-yong-dfsxun-zhao-dagde-topological-sorttuo-pu-pai-xu.html
https://hackmd.io/@bangyewu/BknWuaVlT#Topological-sort%E7%AF%84%E4%BE%8B
https://bclin.tw/2022/01/18/leetcode-207/
