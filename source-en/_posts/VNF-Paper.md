---
title: VNF Deployment and Flow Scheduling in Geo-distributed Data Centers
description: "Paper reading: understanding VNF deployment and network-traffic problems across geographically distributed data centers"
toc: true
tags:
  - VNF
  - Network
categories:
  - Paper Reading
top_img: 'https://i.imgur.com/YfR1XMZ.jpg'
aside: true
abbrlink: "85fe9be3"
date: 2021-06-25 08:51:54
---

> 🌐 中文版：[繁體中文](/posts/85fe9be3.html)

## Abstract
NFV can reduce the equipment procurement and maintenance costs of network operations. Through NFV, network functions can be decoupled from the physical infrastructure and run as virtual network functions (VNFs) on commodity hardware. NFV makes networks more flexible and controllable, but various technical challenges remain, such as how to effectively deploy VNFs across different geographic locations and how to schedule network traffic among geo-distributed data centers.

This paper studies this topic and tries to minimize deployment and communication costs. The problem is converted into a mixed-integer linear programming (MILP) problem, and the paper proposes a relaxation-based algorithm to handle its computational complexity. Finally, experimental results show the algorithm effectively reduces deployment and communication costs.

## Ch1-Introduction
Traditional data-center or cloud-computing network architectures rely on specific hardware to provide specific network services, such as firewalls and intrusion detection systems. These make hardware costs too high. NFV's emergence replaces this hardware-dependent network architecture.

With NFV, network functions can be virtualized into software-based VNFs running on ordinary COTS servers.
![](https://i.imgur.com/9GcTBYs.png)

And to provide a network service, a network flow needs to pass through a set of ordered network functions.
![](https://i.imgur.com/fBK2DgN.png)

However, to actually apply NFV technology, you must consider how VNFs are chained into service chains to reduce costs. Past research in this area focused only on deployment cost, aiming to reduce data-center resource consumption like CPU, memory, and storage, or focused solely on communication cost, like minimizing point-to-point latency. But it rarely considered the communication cost of VNF deployment.

On a service chain, the network functions on each link are ordered, each link has its own flow rate, and deploying different VNFs across geo-distributed data centers leads to different communication costs. This means the relationship between deployment cost and communication cost can't be ignored. Furthermore, prior work rarely considered the traffic-balancing problem in NFV services; prior research usually assumed a VNF flow couldn't be distributed to multiple VNF instances of the same type, or that its distributed flow rate was predefined, which is unrealistic and inefficient for private NFV services in large-scale networks. This paper argues that the number of VNF instances and the corresponding network traffic should be adjusted according to the current network state.

This paper considers the trade-off between deployment cost and communication cost for ordered service chains across geo-distributed data centers, and allows one network function to have multiple VNF instances.

Main contributions:
- This paper jointly considers network topology, the number and deployment of VNFs, and flow scheduling, converting the VNF deployment and flow scheduling problem into a mixed-integer linear programming (MILP) problem, to reduce deployment cost and communication cost.
- Based on this MILP formulation, it designs a low-complexity relaxation-based algorithm and runs extensive experiments to illustrate the algorithm's advantages over existing ones; the results show the proposed algorithm effectively reduces deployment and communication costs.

## Ch2-System Model
### A. DCs Topology

Since data centers are distributed worldwide, the network traffic transmitted between different data centers has different costs. Here an undirected graph represents the data centers' network topology $G_{d}=(D,E_{d})$.
$D$ is the data centers and $E_{d}$ is the network edges.
$H_{dp}$ is the weight of edge $e_{dp} \in E_{d}$ where $d,p \in D$.
(This means D and P are data centers, and H is the weight of the network link between D and P, representing the transmission cost between these two data centers.)
Note that there's no transmission cost from a data center to itself, $H_{dd}=0$.
### B. Chain Set
A set of chains $C={c1,c2,...}$ is deployed to the data centers. For a service chain $c_{i} \in C$, the source node and destination node are denoted $o_{i}$ and $t_{i}$ respectively.
Each service chain $c_{i}$ has a set of ordered network functions $c_{i}={s_{i,1},s_{i,2},....s_{i,j},...}$ processing traffic at rate $R_{i}$.
We define $|c_{i}|$ as the length of service chain $c_{i}$, and define $n(s_{i,j})$ to denote the network-function type of $s_{i,j}$.
For example, as in the figure
![](https://i.imgur.com/y39ct1S.png)
The three service chains have lengths 2, 3, 3 (note: different service chains may need one network function). For example, $c1$, $c2$, $c3$ may all commonly contain network function $f1$, i.e. $n(s_{1,1})=n(s_{2,2})=n(s_{3,2})=f_{1}$.

### C. NFs Graph
Based on the chain set above, we can construct the network-function graph $G_{n}$.
This graph is a directed acyclic graph (DAG).
$G_{n}=(V_{n},E_{n})$, and $V_{n}$ can be categorized into three kinds:
- sources $O$
- network function $N$
- destinations $T$
Each edge $e_{m,n} \in E_{n}$ represents the network traffic between network functions $m$ and $n$.
For each service pair $(s_{i,j},s_{i,j+1})$ in chain $c_{i}$, there's a network function pair $(m,n)$ in $G_{n}$ with a directed link from $m$ to $n$, where $n(s_{i,j})=m$, $n(s_{i,j+1})=n$.

As mentioned, different network functions may be shared by different service chains at different flow rates.
For each edge $e_{m,n} \in E_{n}$, we define a set $U_{m,n} = \{ i : c_{i} \in C, n(s_{i,j})=m,n(s_{i,j+1})=n\}$ to record the service chains with the network-function pair ($m$,$n$).

Different network flows with different flow requirements are transmitted on edge $e_{m,n}$, denoted $R_{i}$, $\forall i \in U_{m,n}$.
For example, the network flows from service chains $c1$ and $c2$ are transmitted on edge $e_{f_{1},f_{2}}$, as shown below.
![](https://i.imgur.com/Ba0onF6.png)
The rates are 2 and 1 respectively.

### D. VNFs Graph
Our goal is to deploy all network functions in graph $G_{n}$ in the form of VNF instances.
Each network function $n$ in $G_{n}$ may have multiple VNF instances in different data centers.
For example, as shown below
![](https://i.imgur.com/nZQBKNl.png)
Network function $f1$ may have two VNF instances located in data centers $d1$ and $d2$.

Note that each network function $n$ may have at most $|D|$ possible instances across all $|D|$ data centers, and each pair $(m,n)$ in $G_{n}$ may correspondingly have at most $|D|^{2}$ links between them.

So in the VNF graph $G_{v}=(V_{v},E_{v})$, the node set $V_{v}$ includes $|V_{n}| \cdot |D|$ instances denoted as set $V$, the sources set $O$, and the destination set $T$, and $E_{v}$ denotes the links between them.
For each edge $e_{u,v} \in E_{v}$, let $f^{i}_{uv}$ denote the flow rate between instances $u$, $v$ in service chain $C_{i}$.

For example, consider two network functions $(f1,f2)$ in graph $G_{n}$ and edge $e_{f_{1},f_{2}}$; the corresponding $G_{v}$ is shown below, with 2 data centers.

![](https://i.imgur.com/YhG7xQY.png)

The instances of $f1,f2$ are $v1$ $v2$ and $v3$ $v4$, and we can observe that network functions $f1$, $f2$ have 4 edges total, and the network traffic between $f1$ and $f2$ can be freely distributed among these four edges.

For any instance $v \in V$, we use $d(v)$ and $n(v)$ to denote its data-center location and network-function type respectively. For example, $d(v_{1})=d1$, $n(v_{1})=f1$.

Let $N(n)$ denote the set of VNFs providing network function $n$; for example, in the figure above, $v1$ and $v2$ provide network function $f1$, i.e. $N(f1)=\{ v1,v2 \}$. For each VNF instance pair $(u,v)$, the flow rate through the edge can be denoted $f_{uv}^{i}$, where for chain $c_{i}$ the edge satisfies $e_{u,v}\in E_{v}$ and in graph $G_{v}$, $\forall i\in U_{n(u),n(v)}$.

![](https://i.imgur.com/heLrZ8U.png)

## Ch3-Problem Formulation
Based on the system model in the previous chapter, we can formulate the VNF deployment and flow scheduling problem as a mixed-integer linear programming (MILP) problem, with the objective of minimizing the total deployment and communication cost between all VNF pairs.

### VNF Instance Placement
As shown in $G_{v}$, each network function can be hosted by all data centers, and each data center can host all types of network functions. So we define a binary variable $x_{v}$ to denote **whether the VNF instance providing network function $n(v)$ in data center $d(v)$ is actually deployed**.

![](https://i.imgur.com/LW9uzOu.png)

### Flow requirement constraints
The traffic needed for each service chain $c_{i}$ can be distributed to all its VNF instances.
For example, the flow rate $R_{i}$ between network-function pair $m$, $n$ in chain $c_{i}$ is distributed to all edges between instances $v$, $u$ in $G_{v}$, where $n(u)=m$, $n(v)=n$.

![](https://i.imgur.com/IdjsfTH.png)

For the source node and destination node, the following equations can be listed.
![](https://i.imgur.com/iattDHR.png)

### VNF flow constraint
For each VNF instance, the input traffic originates from the input instance $i(v)$ to be processed, then distributed to the output instance $o(v)$.

![](https://i.imgur.com/4EfnGB6.png)

where $\alpha_{n(v)}$ is a scaling factor determined by the network function.

### The relationship between $x_{v}$ and $f^{i}_{uv}$ 

As long as there's traffic through VNF instance $v$, the binary variable should be set to 1 to provide network function $n(v)$, and this VNF instance should be deployed in $d(v)$. This can be described as

![](https://i.imgur.com/kNT4fbV.png)

`A Joint MILP Formulation`

Summarizing the above, we get the following **Cost-min** problem.

### Cost-Min
![](https://i.imgur.com/g756xNt.png)

The coefficients $\gamma$ and $\delta$ are user-defined to balance deployment cost and communication cost, and can be adjusted for different QoS requirements.
## Ch4-Relaxation-Based Algorithm
![](https://i.imgur.com/X5V2paB.png)
Because of the integer variable $x_{v}$, solving the Cost-Min problem computationally is prohibitive, especially in large-scale networks. In this chapter we propose a relaxation-based approach to solve the Cost-min problem.

First we relax $x_{v}$ to a real number in the range [0,1] to reduce computational complexity. After relaxation, our model is simplified to a linear programming (LP) problem, as in line 1 of the algorithm, which can be easily solved with Matlab.

![](https://i.imgur.com/cW2iRuY.png)

We sort $x_{v}$ in ascending order, as in line 2 of the algorithm table,

and set each non-zero $x_{v}$ value to 1, as in line 5 of the algorithm table.

In this case, we obtain a new VNF deployment solution in the form of integer $x_{v}^{*}$,

and record the number of VNF instances per network function as $count_{n(v)}$, as in line 6 of the algorithm table. We take the integer solution $ x_{v}^{*} $ as input and compute the flow scheduling solution $ f_{uv}^{*j} $ and the total cost $cost'$.

We take the integer solution $x_{v}^{*}$ as input and compute the flow scheduling solution $f_{uv}^{*j}$ and total cost $cost'$ by solving the Cost-Min-LP problem again in line 11.

Note that relaxation may lead to more VNF instances, so our next step tries to further reduce the number of instances and the deployment cost, while keeping the communication cost close to optimal, from line 12 to line 22. We start from instance $v$ within the minimum value of non-zero $x_{v}$.
Note that if $v$ is the only VNF instance providing network function $n(v)$ in the network, i.e. $count_{n(v)}$ == 1, then $v$ must be deployed, and we skip to the next instance.
Otherwise, if there's a VNF instance providing the same network function $n(v)$ in the network (see line 14), we set $x_{v}^{*}$ to 0 and recompute the flow scheduling solution $f_{uv}^{*i}$ and the new total cost $cost'$.

Only when the new cost is lower than the current $minCost$ do we update the NFV deployment solution $x_{v}^{*}$, the flow scheduling solution $f_{uv}^{*j}$, and the total cost $minCost$, then update the instance count of network function $n(v)$ (see lines 18, 19).

On the other hand, if the total cost doesn't decrease, we set $x_{v}^{*}$ back to 1 and move to the next instance, until we traverse all VNF instances in $V$ (line 25).

Finally we return the NFV deployment solution $x_{v}^{*}$, the flow scheduling solution $f_{uv}^{*j}$, and the total cost $minCost$ as the algorithm's output.

## Ch5-Performance Evaluation
In this section, we evaluate the relaxation-based algorithm ("RLX") by comparing it with Cost-Min's optimal result ("OPT") and a shortest-path algorithm ("SP").
Experiment setup:
- The network has $|D|$ = 20 data centers. $H_{dp}$ is randomly set in the range [1,20], representing the hop count between DCs
- There are 20 service chains in total, with multiple chains sharing 15 different types of network functions
- The service chains' traffic is set in the range [1, 10]
- The coefficient $\gamma$ is set to 10 and $\delta$ to 1
- We use the commercial solver Gurobi to solve our Cost-Min and Cost-Min-LP problems
This study provides extensive experiments by varying parameters in different scenarios.

### The value of 𝛾 
![](https://i.imgur.com/Et8CiI7.png)
First, we investigate the effect of 𝛾 and 𝛿. We set 𝛿 = 1 and vary 𝛾 from 5 to 50. The results are in Figure 4.
The results in Figure 4 show that all three algorithms' costs grow as 𝛾 increases. The reason is that increasing 𝛾 leads to higher VNF deployment cost.
Notably, SP's growth rate is much larger than the other two, because SP mainly focuses on communication cost by reducing each network flow's path length, ignoring deployment cost.
So when deployment cost becomes the dominant part, SP shows less advantage.
For example, when 𝛾 = 10, the deployment cost's share of the total cost is 57% for RLX, 35% for OPT, and 82% for SP.

### The effect of number of hops
![](https://i.imgur.com/ctY1hjZ.png)
We study the total cost of OPT, RLX, and SP for different network topologies by varying the hop upper bound from 2 to 20.
As Figure 5 shows, OPT's and RLX's costs grow slightly as the hop count increases, since more hops may increase communication cost.

However, SP shows a downward trend. The main reason is that when the hop count between different data centers is small, SP can find many shortest paths and deploy VNF instances on them, and some network functions may have multiple instances, leading to higher deployment cost.
When the hop count increases, SP finds fewer shortest paths, resulting in fewer VNF instances and lower deployment cost. So the total cost decreases.

### The effect of rate
![](https://i.imgur.com/KaJ7KXI.png)
Similarly, we change the rate-requirement upper bound of the 20 chains from 3 to 30 to show the effect of flow requirements.
Figure 6 shows that as the rate upper bound increases, all three algorithms' total costs increase too.
This is because more traffic leads to higher communication cost and total cost.

### The effect of the number of chains
![](https://i.imgur.com/AKitxrs.png)
In this part, we discuss the effect of the chain count from 5 to 50 and compare the three algorithms' results.
An upward trend for all three can be observed in Figure 7.
The reason is that more service chains bring more network functions deployed in data centers and more network flows distributed to VNF instances.
This leads to higher deployment and communication cost, so all three algorithms' total costs rise.

### The effect of the number of NFs
![](https://i.imgur.com/CqLQxDV.png)
Finally, Figure 8 shows all three algorithms' results with the network-function count ranging from 10 to 55.
We can conclude the cost also rises. This is because all algorithms need to place more VNF instances in data centers, leading to higher deployment cost. Meanwhile, more network traffic between network functions in different data centers also leads to higher communication cost. So the total cost trends upward.
Nonetheless, our RLX's advantage can always be observed under any setting, since it outperforms SP and approaches OPT.

## Conclusion
In this paper, we studied the VNF deployment and network-flow scheduling problem in geo-distributed data centers. We further formulated this problem as mixed-integer linear programming, with the objective of minimizing total deployment and communication cost. We then proposed a low-complexity relaxation-based algorithm to handle the computational complexity. Extensive simulation-based performance-evaluation results show our algorithm has better performance and effectively reduces total cost in various scenarios.

## Source
https://ieeexplore.ieee.org/document/8422334
