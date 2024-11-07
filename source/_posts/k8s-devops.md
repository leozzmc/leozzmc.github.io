---
title: Kubernetes for DevOps 筆記 |【DevOps技能樹】
description: (尚未完成)
tags:
  - Kubernetes
  - Python
  - DevOps
categories: 學習筆記
aside: true
toc: true
abbrlink: c7f5f41c
date: 2024-11-07 19:14:09
cover:
---

# Basic

***解釋一下什麼是 Kubernetes***

用於進行 **容器編排和管理**的平台，可用於容器的自動化部署和擴展

*Kubernetes 的主要功能有哪些?*
- Self-Healing: 使用 Health check 來檢查運行中的容器，並且做出對應行為 Ex.重啟容器
- Load Balancing: 將請求分散給 cluster中不同的應用
- Operations: Kubernetes 打包的應用程式可以使用Cluster的 API 來更新其狀態並根據 Event 和應用程式狀態變更觸發操作
- Automated Rollout: 逐步對應用更新，並且在出現問題時可以Rollout
- Scaling: 基於自定義的條件進行水平擴展
- Secrets：可用一種以私有方式儲存使用者名稱、密碼和服務端點的機制，而且並非每個使用Cluster的使用者都可以查看

***可以用哪些方式來去跟 Kubernetes 的資源互動***

可以用 kubectl 命令列工具去與 Kubernetes Cluster 進行互動。


***在部署應用到 Kubernetes的時候，哪些 Kubernetes 物件最常使用到***

- Deployment: 建立一群Pods 並監控
- Service: 在叢集內部將流量路由到 Pod 中
- Ingress: 將外部將流量路由到叢集

***Kubernetes 有哪些常見的 Objects?***

Pod, Service, ReplicationController, ReplicatSet, DaemonSet, Namespace, ConfigMap...etc

> Container 並非 Kubernetes 物件，Kubernetes中最小的物件單元會是 Pod，而Pod中通常可以有一個或多個容器

# Cluster and Architecture

![](/img/devops/k8s/cluster.jpeg)

***什麼是 Kubernetes Cluster?***

為一群跑著容器化應用的節點(Nodes)集合，主要分成主節點(Master Node) 以及工作節點(Worker Node)

Master Node 為 Kubernetes 的控制中心，包含多個關鍵元件：
- **API Server**: Kubernetes的API入口，負責接收API請求，像是部署應用、擴展容器等。反正所有對資源的操作情球都會經過API Server
- **Scheduler**: 負責將新的 Pod 調度到適合的工作節點，主要依據資源需求以及策略選擇
- **Controller Manager**: 負責管理不同的 Controller，這些控制器會負責維護 cluster 的期望狀態 Ex. 確保指定數量的Pod一直都運行中
- **etcd**： Kubernetes中的分散式資料庫，保存了整個 cluster 的狀態和設定

Worker Node 會是在 kubernetes 中負責跑應用的節點，主要會負責跑下面這些元件：
- **kubelet**: 負責管理節點上的 Pod 和容器，並且會監控容器狀態。 會透過 API Server 與主節點互動
- **kube-proxy**: 負責節點的網路設定，確保cluster內的每個Pod之間可以相互通訊，也負責 load balacing 功能。
- **container runtime**: 容器運行時(Docker, containerd) 會負責拉取 image 並運行容器。

***我要如何確定當前的 Kubernetes 環境會是 Master Node 還是 Worker Node?***

```
kubectl get nodes -o wide
```

可能會輸出以下資訊

```
NAME        STATUS   ROLES           AGE   VERSION
master-1    Ready    control-plane   20d   v1.20.0
worker-1    Ready    <none>          20d   v1.20.0
worker-2    Ready    <none>          20d   v1.20.0
```

***要如何管理多個 Kubernetes clusters? 要如何透過 kubectl 快速切換不同 clusters***

`kubectl config use-context [CONTEXT_NAME]`

每個 Cluster 中會有一個 Context，可以透過命令查看所有可用的 Context

```
kubectl config get-contexts
```

***要如何避免高記憶體用量，導致 Kubernetes cluster 發生 memory leak 或者 OOM(Out Of Memory)?***

方法一
可以為Pod 或容器設定 **resource requests** 和 **resource limits** 可以確保容器不會超出允許的資源使用範圍，讓應用在資源消耗過大的時候就停止，防止節點OOM。

透過 resource requests 可以確保Pod 所需要的最小資源要求，這點就會讓 Scheduler 在
調度節點的時候找到適合的節點安排Pod。相反， resource limits 限制了 Pod 可以用的最大資源量

```yaml
resources:
    requests:
        memory: "256Mi"
        cpu: "500m"
    limits:
        memory: "512Mi"
        cpu: "1000m"
```

方法二
透過其他監控工具，Ex. Promethus, Grafana 監控 Pod 的記憶體使用

方法三
啟用 **HPA(Horizontal Pod Autoscaler)** ，可根據CPU 或Memory用量來自動增加或減少副本

```
kubectl autoscale deployment [deployment_name] --cpu-percent=80 --min=2 --max=10
```

***如何列出所有 API 物件種類***

```
kubectl api-resources
```

## Kubelet

***如果你將 worker node 上的 kubelet 停用，那正在運作的Pod 會發生什麼事？***

由於 Kubelet 負責與 API Server 溝通，若停用就代表 Worker Node 會無法與 API Server 互動，這時 Worker Node的狀態會被標注成 **Not Ready**，而上面跑的Pod 狀態會變成 **Unknown**，一旦control plane 檢測到 worker node 處於 Not Ready 太久(達到閥值時間，通常會是5分鐘)，則會驅逐在 worker node 上的pod，並且會去將Pod 重新 schedule 到其他可用的節點上


# Pods

Pods 會是 Kubernetes 中的最小物件單元，通常由一個或多個容器組成，在 Pod 中會共享網路資源, Storage 以及用於定義容器運行的 specification

![](/img/devops/k8s/pod.png)


> https://sean22492249.medium.com/networking-in-kubernetes-pod-%E8%88%87-pod-%E7%9A%84%E7%B6%B2%E8%B7%AF%E9%80%A3%E9%80%9A-216cfe6de471

## Static Pods

## Pods Commands

## Pods Troubleshooting and Debugging

# Labels and Selectors

# Deployment

# Services

# Ingress

# ReplicaSets

# DaemonSets

# StatefulSet

# Storage

# Networking

# Policies

# Etcd

# Namespaces

# Operators

# Secrets

# Volumes

# Access Control

# CronJob

# Helm

# Security

# Misc

