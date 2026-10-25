---
title: From Parallel Computing to Federated Learning | Study Notes
tags:
  - Federated Learning
  - Machine Learning
categories: Study Notes
aside: true
toc: true
abbrlink: "federation-learning"
date: 2024-07-30 16:01:57
cover: /img/Fed/cover.jpg
---

> 🌐 中文版：[繁體中文](/posts/federation-learning.html)

# What is parallel computing?

Today's deep neural network models have a huge number of parameters, and a big model also means more computation.

> Big Model + Big Data -> Huge computation cost !

A year's worth of computation on a single GPU can be done at once on 20 GPUs in parallel, reducing the time cost.

# Linear Predictor

To be continued

# Federated learning

{% note info %}
It's best to first have a foundation in parallel computing and distributed machine learning. You can refer to this video series: https://www.youtube.com/watch?v=gVcnOe6_c6Q&t=124s
{% endnote %}

## Background

> **Problem background:** Google wants to train a model using data on users' mobile devices.

> **A possible solution:** collect user data, upload it to a centralized learning platform, and train the model there.

> **The challenge faced:** users refuse to upload data, especially sensitive data, to Google's servers.

This kind of problem scenario also occurs at European/American enterprises with strict personal-privacy protection, or in medical environments.

## Distributed learning and federated learning

![](/img/Fed/ds2.png)

The process of one iteration:

- The worker node requests parameters from the parameter server
- The server returns the parameters
- The worker node computes the gradient locally based on the returned parameters
- The worker node returns the gradient to the parameter server
- The parameter server updates the parameters via the gradient

In this process, the worker's data never leaves the node, and the server can't see user data. This architecture solves the problem scenario above.

> Federated learning is a kind of distributed learning, but it still differs from traditional distributed learning in several ways:

- Users have control over their devices and data, whereas in traditional distributed learning the workers are controlled by the server
- Worker nodes are unstable, since worker nodes are usually mobile devices (e.g. phones) with varying computing power, some fast and some slow
- Federated learning has a high communication cost, usually due to low communication bandwidth or a large distance between the worker node and server
- The data stored on a worker node isn't [IID (independent and identically distributed)](https://zh.wikipedia.org/zh-tw/%E7%8B%AC%E7%AB%8B%E5%90%8C%E5%88%86%E5%B8%83)
- Federated learning's node load is unbalanced: user A's phone takes photos every day, user B's phone takes a photo once every 10 days

> **Do more computation, less communication.** Since communication is costly, a common research direction is to reduce the number of communication rounds.

# Gradient descent

## What the worker does

1. Receive the model parameters $w$ from the server
2. Compute the gradient $g_{i}$ from the model parameters $w$ and local data
3. Send $g_{i}$ to the server

## What the server does

1. Receive the gradients **$g_{1},...,g_{m}$** from different worker nodes
2. Compute **$g=g_{1}+...+g_{m}$**
3. Update the model parameters: **$w \leftarrow w - \alpha \cdot g $ (this is gradient descent)**

{% note info %}
$\alpha$ is the learning rate
{%  endnote %}

After the server finishes, the next iteration can proceed, until the algorithm converges.

# Federated Averaging Algorithm (FedAvg)

![](/img/Fed/ds3.png)

Unlike the gradient-descent algorithm above, this is a communication-efficient algorithm. The first step is the same: the parameter server sends parameters to the worker nodes. But the subsequent steps start to differ.

## What the worker does
Suppose this is the $i$-th worker node
1. Receive the model parameters $w$ from the server
2. Repeat the following:
   a. Compute the gradient $g$ from the model parameters $w$ and local data
   b. Do gradient descent locally: **$w \leftarrow w - \alpha \cdot g$**

> a. and b. repeat for several epochs; **one epoch processes the local data once**, so repeating a, b N times is N epochs.

3. Send $\widetilde{w_{i}} = W$ back to the server (here $\widetilde{w_{i}}$ is the $w$ after local gradient descent)

With that, the node has finished computing.

## What the server does

1. The server receives $\widetilde{w_{i}}$ ~ $\widetilde{w_{m}}$ from $m$ workers
2. Average or weighted-average: **$w \leftarrow \cfrac{1}{m}(\widetilde{w_{i}} + ... +\widetilde{w_{m}} ) $**

The new model parameters are $m$.

> So gradient descent has the worker return the gradient for the server to compute the model parameters, while FedAvg has the worker compute the local model parameters first and upload them directly, with the server averaging.

![](/img/Fed/graph1.png)

For the same amount of communication, FedAvg converges faster. **FedAvg sacrifices the worker nodes' computation for fewer communication rounds.**

![](/img/Fed/graph2.png)

For the same number of epochs (one pass over the data by the worker, used to measure computation), FedAvg converges more slowly.

### Communication-Efficient Algorithms
- Approximate Newton's algorithms
- Primal-dual algorithms
- One-shot averaging

Communication is a big problem in distributed machine learning, and many algorithms aim to reduce the number of communication rounds, basically trading lots of computation for fewer communication rounds.

# Privacy protection

In distributed learning or federated learning, architecturally only the gradient is uploaded from local to the server, and user data stays local. Does this mean user privacy is safe? Actually not, since the gradient itself is computed from user data via a function:

Let's look at how the **stochastic gradient** is derived. First, a **least squares regression** is:

<math xmlns="http://www.w3.org/1998/Math/MathML">
  <munder>
    <mrow data-mjx-texclass="OP">
      <mi>m</mi>
      <mi>i</mi>
      <mi>n</mi>
    </mrow>
    <mrow data-mjx-texclass="ORD">
      <mi>w</mi>
    </mrow>
  </munder>
  <mo data-mjx-texclass="NONE">&#x2061;</mo>
  <munderover>
    <mo data-mjx-texclass="OP">&#x2211;</mo>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
      <mo>=</mo>
      <mn>1</mn>
    </mrow>
    <mrow data-mjx-texclass="ORD">
      <mi>n</mi>
    </mrow>
  </munderover>
  <mi>l</mi>
  <mo stretchy="false">(</mo>
  <mi>w</mi>
  <mo>,</mo>
  <msub>
    <mi>x</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
  <mo>,</mo>
  <msub>
    <mi>y</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
  <mo stretchy="false">)</mo>
</math>

 where 

<html>
<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mi>l</mi>
  <mo stretchy="false">(</mo>
  <mi>w</mi>
  <mo>,</mo>
  <msub>
    <mi>x</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
  <mo>,</mo>
  <msub>
    <mi>y</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
  <mo stretchy="false">)</mo>
  <mo>=</mo>
  <mfrac>
    <mrow>
      <mpadded height="8.6pt" depth="3pt" width="0">
        <mrow></mrow>
      </mpadded>
      <mstyle displaystyle="false" scriptlevel="0">
        <mrow data-mjx-texclass="ORD">
          <mn>1</mn>
        </mrow>
      </mstyle>
    </mrow>
    <mrow>
      <mpadded height="8.6pt" depth="3pt" width="0">
        <mrow></mrow>
      </mpadded>
      <mstyle displaystyle="false" scriptlevel="0">
        <mrow data-mjx-texclass="ORD">
          <mn>2</mn>
        </mrow>
      </mstyle>
    </mrow>
  </mfrac>
  <mo stretchy="false">(</mo>
  <msubsup>
    <mi>x</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
    <mrow data-mjx-texclass="ORD">
      <mi>T</mi>
    </mrow>
  </msubsup>
  <mi>w</mi>
  <mo>&#x2212;</mo>
  <msub>
    <mi>y</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
  <msup>
    <mo stretchy="false">)</mo>
    <mrow data-mjx-texclass="ORD">
      <mn>2</mn>
    </mrow>
  </msup>
</math>
</html>

, 

<math xmlns="http://www.w3.org/1998/Math/MathML">
  <msub>
    <mi>g</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
  <mo>=</mo>
  <mfrac>
    <mrow>
      <mpadded height="8.6pt" depth="3pt" width="0">
        <mrow></mrow>
      </mpadded>
      <mstyle displaystyle="false" scriptlevel="0">
        <mrow data-mjx-texclass="ORD">
          <mi>&#x2202;</mi>
          <mrow data-mjx-texclass="ORD">
            <mi>l</mi>
            <mo stretchy="false">(</mo>
            <mi>w</mi>
            <mo>,</mo>
            <msub>
              <mi>x</mi>
              <mrow data-mjx-texclass="ORD">
                <mi>i</mi>
              </mrow>
            </msub>
            <mo>,</mo>
            <msub>
              <mi>y</mi>
              <mrow data-mjx-texclass="ORD">
                <mi>i</mi>
              </mrow>
            </msub>
            <mo stretchy="false">)</mo>
          </mrow>
        </mrow>
      </mstyle>
    </mrow>
    <mrow>
      <mpadded height="8.6pt" depth="3pt" width="0">
        <mrow></mrow>
      </mpadded>
      <mstyle displaystyle="false" scriptlevel="0">
        <mrow data-mjx-texclass="ORD">
          <mi>&#x2202;</mi>
          <mrow data-mjx-texclass="ORD">
            <mi>w</mi>
          </mrow>
        </mrow>
      </mstyle>
    </mrow>
  </mfrac>
  <mo>=</mo>
  <mo stretchy="false">(</mo>
  <msubsup>
    <mi>X</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
    <mrow data-mjx-texclass="ORD">
      <mi>T</mi>
    </mrow>
  </msubsup>
  <mi>W</mi>
  <mo>&#x2212;</mo>
  <msub>
    <mi>y</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
  <mo stretchy="false">)</mo>
  <msub>
    <mi>X</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
</math>


The top $l(w,x_{i},y_{i})$ is the least squares regression's loss function, defined as the inner product of the data and model parameters, minus the label $y_{i}$, then squared. Computing the gradient means taking the derivative with respect to $w$, giving a vector, and the term in front of this vector,

<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mo stretchy="false">(</mo>
  <msubsup>
    <mi>X</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
    <mrow data-mjx-texclass="ORD">
      <mi>T</mi>
    </mrow>
  </msubsup>
  <mi>W</mi>
  <mo>&#x2212;</mo>
  <msub>
    <mi>y</mi>
    <mrow data-mjx-texclass="ORD">
      <mi>i</mi>
    </mrow>
  </msub>
  <mo stretchy="false">)</mo>
</math>  is a real number, so it can be seen as scaling the original user data $X_{i}$. So the gradient is just a transformation of the original data, with no data-protection effect. The original data can be reconstructed from the gradient, so a privacy risk exists.

And in federated learning, both the server and workers can see the model parameters after each iteration, so federated learning leaks even more privacy.

![](/img/Fed/privacy.jpeg)

## How to defend?

This brings up **differential privacy**, whose concept is adding **noise** to the gradient or model parameters. But if the noise isn't strong enough, the original data can still possibly be reversed; and if the noise is too strong, the loss function may fail to keep converging, so the model doesn't learn well either.

## Defending against Byzantine faults and malicious attacks

Byzantine faults are related to the **Byzantine Generals Problem**, a distributed-systems problem: if a node in a distributed system fails without going down, it drags down the other nodes in the system. Think of it as one of us being a traitor. If a node is malicious and modifies its own data and labels, it can send problematic gradients to the server, training a problematic model. This attack is called a **[Data Poison Attack](https://ieeexplore.ieee.org/document/9900151)**, doable even in traditional neural networks, while the attack specifically targeting distributed machine learning is a **model poisoning attack**, which usually swaps local labels for wrong ones, naturally producing a wrong model.

One defense is for the server to take a gradient uploaded by a worker, update the model parameters, and compute accuracy on the server or a test machine; if a worker sends a wrong gradient, the test accuracy will necessarily drop. But this defense isn't well-suited to federated learning, because the server can't see user data, and workers' statistical distributions differ, so even a non-malicious worker could cause accuracy to drop, and the server averages the model parameters anyway.

Current defenses are all based on user data being IID (independent and identically distributed), but federated learning's reality is that user data isn't IID, and individual workers' statistical distributions differ, so current defenses aren't very practical.

## Summary
- Federated learning is a kind of distributed learning
- Its purpose is to let multiple users collaboratively train a model without sharing data, with user data never leaving local (the point is protecting user privacy)
- Federated learning's unique challenges:
  - non-IID data
  - slow communication

So important directions are:
1. Building communication-efficient algorithms
2. Defending against data leakage (attacks are easy, defense is hard)
3. Building mechanisms to prevent Byzantine faults

# Reference

[1] https://www.youtube.com/watch?v=STxtRucv_zo&t=6s
[2] https://zh.wikipedia.org/zh-tw/%E7%8B%AC%E7%AB%8B%E5%90%8C%E5%88%86%E5%B8%83
