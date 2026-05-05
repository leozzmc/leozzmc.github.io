---
title: 從並行計算到聯邦式學習 | 學習筆記
tags:
  - Federated Learning
  - Machine Learning
categories: 學習筆記
aside: true
toc: true
abbrlink: federation-learning
date: 2024-07-30 16:01:57
cover: /img/Fed/cover.jpg
---

# 甚麼是並行計算?

現在的深度神經網路模型具有大量的參數，模型大也意味著計算量變大

> Big Model + Big Data -> Huge computation cost !

單一GPU進行一年的計算量，可以透過20 個 GPU 一次進行計算來實現，來減少花費的時間成本

# Linear Predictor

未完待續

# 聯邦式學習

{% note info %}
最好先具備並行計算和分散式機器學習的基礎。可以參考下面這系列影片:https://www.youtube.com/watch?v=gVcnOe6_c6Q&t=124s
{% endnote %}


## 背景

> **問題背景:**  Google 想要透過使用者行動裝置上的資料來訓練模型。

> **可能的解決辦法:** 蒐集使用者資料，上傳到某個集中式學習平台去訓練模型

> **面臨的挑戰:** 使用者拒絕上傳資料，尤其是機敏資料到 Google 的伺服器 

這樣的問題情境也發生在個人隱私保護很嚴格的歐美企業或是醫療環境中


## 分散式學習 以及 聯邦學習

![](/img/Fed/ds2.png)

一次迭代的過程:

- worker node 向 parameter 索取parameter
- server 回傳 parameter
- worker node 根據回傳的參數，本地計算梯度(gradient)
- workde node 回傳梯度給 parameter server
- parameter server 透過梯度更新參數

這個過程中，worker的資料沒有離開節點，Server也無法看到用戶資料。這個架構就能夠解決上面的問題情境

> 聯邦式學習就是一種分散式學習，但與傳統分散式學習還是有幾項差異

- 用戶對於它們的設備和資料有控制權，而傳統分散式學習中，worker 受到 server 控制
- worker node 並不穩定(unstable )，因為workder node 通常會是行動設備 (Ex. 手機)，計算能力也不盡相同，節點計算效能有快有慢
- 聯邦學習通訊代價大，通常是通訊頻寬低，或者workder node 與 server 距離遠
- 儲存在 workder node 的資料並非[IID分布(獨立同分布)](https://zh.wikipedia.org/zh-tw/%E7%8B%AC%E7%AB%8B%E5%90%8C%E5%88%86%E5%B8%83)
- 聯邦學習的節點負載不平衡，手機A的使用者每天拍照，手機B的使用者10天拍一次照片


> **多做計算，少做通訊**， 由於通訊代價高，因此研究方向上，通常能夠降低通訊次數就很好了

# 梯度下降

## Worker 要做的事情

1. 接收來自 Server 的模型參數 $w$
2. 透過模型參數 $w$ 和本地資料計算 gradient $g_{i}$
3. 將  $g_{i}$ 發送給 Server


## Server 會做的事情

1. 接收來自不同 workder node 的 gradient **$g_{1},...,g_{m}$**
2. 計算 **$g=g_{1}+...+g_{m}$**
3. 更新模型參數: **$w \leftarrow w - \alpha \cdot g $ (這邊是在進行梯度下降)**


{% note info %}
$\alpha$ 為 learning rate
{%  endnote %}

Server的事情做完後，就可以進行下一次的迭代，直到演算法收斂。


# Federated Averaging Algorithm (FedAvg)

![](/img/Fed/ds3.png)

與剛才的梯度下降演算法不同的是，這是一種 Communication-Efficient 的演算法。第一步一樣會是 Parameter Server 將 parameter發送給 worker node，但後續步驟就開始有差異了

## Worker 要做的事
假設現在是第 $i$ 個 worker node
1. 接收來自 Server 的模型參數 $w$
2. 重複以下操作:
   a.  透過模型參數 $w$ 和本地資料計算 gradient $g$
   b.   在本地做梯度下降: **$w \leftarrow w - \alpha \cdot g$**

> a. 與 b. 會重複好機個 epoch, **一個 epoch 會是處理一遍本地資料**，所以a,b重複 N 遍就是有 N 的 epoch

3. 將 $\widetilde{w_{i}} = W$ 發送回 Sever， ( 這裡的 $\widetilde{w_{i}}$ 就是在本地進行梯度下降後的 $w$ )

這樣節點就完成計算

## Server 要做的事

1. Server 接收來自 $m$ 個 worker 的:  $\widetilde{w_{i}}$ ~ $\widetilde{w_{m}}$
2. 做平均或加權平均: **$w \leftarrow \cfrac{1}{m}(\widetilde{w_{i}} + ... +\widetilde{w_{m}} ) $**

新的模型參數即為 $m$


>  所以梯度下降會是 worker回傳梯度給server去計算模型參數，而FedAvg 會是worker先計算完本地的模型參數直接上傳，Server去做平均

![](/img/Fed/graph1.png)

對於相同通訊量來說，FedAvg 的收斂比較快，**FedAvg就是犧牲worker node的計算量換取更少的通訊次數**


![](/img/Fed/graph2.png)

對於相同epoch (worker掃完一次資料，用以衡量計算量)來說，FedAvg 的收斂比較慢

### Communication-Efficient Alogrithms
- Apporximate Newton's algorithms
- Primal-dual algorithms
- One-shot averaging

通訊會是分散式機器學習很大的問題，有許多演算法就是旨在解決通訊次數，但基本上都是用大量的計算換取較少的通訊次數

# 隱私保護

分散式學習或者聯邦學習在架構上僅從本地端上傳了梯度到Server端，而用戶資料留存在本地端，這樣是否就代表用戶隱私式安全的? 其實不然，梯度本身就是用用戶資料透過一個函數計算出來的：

這裡可以看一下 **Stochastic gradient** 是如何求出來的，首先要知道一個 **Least squares regression** 為:

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


最上面的 $l(w,x_{i},y_{i})$ 是Least squares regression 的 loss function，其定義為資料與模型參數的內積扣掉標籤 $y_{i}$ 然後求平方。而求梯度是對於 $w$ 求導數，得到的會是一個向量，這個向量前面的 

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
</math>  會是一個實數， 因此可以看成是對原本的用戶資料 $X_{i}$ 進行伸縮。 所以梯度也只是把原本的資料做了些變換而已，並沒有資料保護的效果。 透過梯度是可以反推出原始資料的，因此會有隱私風險存在。


而聯邦學習中，Server 或是 Worker 都能看到每一輪迭代後的模型參數，所以聯邦學習洩漏的隱私更多了。

![](/img/Fed/privacy.jpeg)

## 要如何防禦?

這裡就會提到 **差分隱私(differential privacy)** ，其概念就是加入 **noise**，可以在梯度或模型參數加入noise，但如果 noise 不夠強，還是有可能被逆向出原本資料，但 noise 太強也可能導致 loss function 無法繼續收斂，這樣模型也學不好。

##　抵禦拜占庭錯誤和惡意攻擊

拜占庭錯誤與 **拜占庭問題(Byzantine General Problem)** 有關係，這是一個分散式系統的問題，也就是在分散式系統中如果有一個節點發生錯誤，並且沒有掛掉，那他就會連帶拖累整個系統中的其他節點，可以理解成我們之中出了一個叛徒，如果有一個節點為惡意的，對自己的資料跟標籤進行修改，那他就有機會傳送有問題的梯度到 Server，訓練出有問題的模型。這種攻擊就叫 **[Data Poison Attack](https://ieeexplore.ieee.org/document/9900151)**，在傳統神經網路中就能做到，而專門針對分散式機器學習的攻擊為 **Model poisoning attack**，這通常把本地標籤換成錯的，這樣計算出來當然會是錯誤的模型。

其中一種防禦方法就是 Sever  會拿某個 Worker 上傳的梯度，來更新模型參數，並在Server或測試機上計算準確率，若某個worker傳錯誤的梯度，必然會造成測試準確率下降，但這種防禦方式不太適合聯邦學習。因為 Server無法知道用戶資料，並且worker之間統計分布不太一樣，即便worker不是惡意的也有可能導致準確率下降，並且Server 又會去將模型參數去做平均。

目前現有防禦方式都是基於用戶資料會是IID (獨立同分布)，但聯邦學習的實際狀況式用戶資料並不是獨立同分布，個別worker統計分布並不一樣，因此現有的防禦方式都並不太實際。

## 總結
- 聯邦學習是一種分散式學習
- 目的是用來讓多個用戶合作訓練出模型，但不共享資料，用戶資料不離開本地端。(重點是要保護用戶隱私)
- 聯邦式學習的獨特挑戰:
  - non-IID Data
  - 緩慢的通訊

所以很重要的方向會是:
1. 建立 Commuincation-Effecient 的演算法
2. 抵禦資料洩漏 (攻擊容易防禦困難)
3. 建立機制防止拜占庭錯誤

# Reference

[1] https://www.youtube.com/watch?v=STxtRucv_zo&t=6s
[2] https://zh.wikipedia.org/zh-tw/%E7%8B%AC%E7%AB%8B%E5%90%8C%E5%88%86%E5%B8%83