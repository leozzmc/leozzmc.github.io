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

***如何部署一個使用 nginx:alpine 的image 並且叫做 my-pod  的 pod?***

```
kubectl run my-pod --image=nginx:alpine
```

這通常並不是常見用來運行 Pod 的方法，通常會透過 Deployment 去跑 Pod

***通常 Pod 中會有多少個 Containers?***

Pod 可以包含多個 Container，但大多情況下會是一個。另外也可以部署 sidecar container 到 pod 當中，通常是為了蒐集Log

***Pod 可能會有哪些phase? 請簡要說明 Pod 的 LifeCycle***

Pod 在的生命週期中可能會出現以下的階段

|Value|Description|
|---|-------|
| Pending | Pod 已被 Cluster 接受，但是當中的 container 可能還沒運行，這個階段中可能會從等待被 schedule或者是等待下載 container image|
| Running |所有容器都被建立，並且至少有一個容器運行中|
| Succeeded |所有Pod中容器都成功執行完畢，但並未重啟|
| Failed |所有Pod中容器都被終止，並且至少有一個容器是由於失敗而被終止，並且沒有 restart|
| Unkown | 由於某種原因無法獲取 Pod 的狀態，通常是由於與Pod 與節點之間的通訊錯誤所導致的|



***當你透過 Kubectl 運行 Pod 會發生什麼是？請講解一下流程***

1. Kubectl 會將請求發送給 API Server 去建立Pod
   - API Server 會去驗證請求
   - etcd 會被更新
2. Control Plane 中的 Scheduler 會去透過監控API Server來去知道目前有個 unassigned Pod
3. Scheduler 會去選擇一個node來去assign pod
   -  etcd 會被更新這個資訊
4. Scheduler 會去告訴 API Server 他選的 Pod是哪個
5. Kubelet 注意到有Pod被 assigned 到他的節點，但是Pod並未運行
6. Kubelet 會去發送請求給 container engine (ex. Docker) 來去建立跟運行容器
7. 當 Pod running 後 kubelet 會去將狀態更新給 API Server 
  - etcd 會再度被 API Server 通知，以更新資訊

> Ref: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/


***要怎麼知道pod中容器是有在運行的？***

`kubectl describe pod <POD_NAME>` 去檢查 container 狀態是否是 `Running`

或者是可以用 `kubectl exec ` 執行命令到容器內


***當你發現 Pod 狀態是 CrashLoopBackOff，請問可能的錯誤會是什麼？ 要怎麼檢查錯誤？***


這通常代表 Pod 反覆啟動然後崩潰，啟動、崩潰。而通常有很多種不同的錯誤原因，像是：
- 應用程式錯誤，導致容器必須退出
- 設定錯誤，像是錯誤的環境變數、遺失設定檔等等
- 資源限制，容器並沒有足夠的記憶體或是 CPU 分配給容器
- Health Check 失敗，若應用沒有在預期時間內運行也會發生錯誤
- Container liveness probes/ startup probe 回傳錯誤

這種時候若要詳細的 Troubleshooting 則需要透過 `kubectl describe pod <POD_NAME>` 查看詳細原因 或者透過 `kubectl logs <POD_NAME>` 來去看 Pod 中容器內的日誌

![](/img/devops/k8s/container.png)

***下方的 config 代表什麼?***

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /appStatus
  initialDelaySeconds: 10
  periodSeconds: 5
```

這裡要先提到什麼是 **liveness Probe** 他的用途是當容器並未達到想要的狀態時，會去重啟容器。

在這行 YAML 中代表的是， **如果 `cat /appStatus` 這個指令失敗，Kubernetes 會砍掉容器接著會採取重啟策略。**  `initialDelaySeconds` 代表 Kubelet 會在初次執行 probe command （`cat /appStatus`）之前先等待 10秒，從此刻起，他每５秒就會重新執行一次 (定義在 `periodSeconds`中)

***下方的 config 代表什麼?***

```yaml
readinessProbe:
      tcpSocket:
        port: 2017
      initialDelaySeconds: 15
      periodSeconds: 20
```

**Readiness probe** 通常決定了一個 container 是否 Ready 可以接受流量。所以這裡定義的是，若 Pod 尚未能夠連接到容器的port 2017前，都不會被標註 `Ready`，第一次的 Probe 會在容器運行後得 15後進行，並且每隔 20秒會持續進行檢查直到能夠連接到定義的port為止。

***刪除 Pod 會發生什麼事情?***

1. Kubernetes 會向 Pod 中容器發送一個 SIGTERM 訊號，用來終止容器中的主要Process
2. 這時容器會有一段時間來完成當前任務並釋放資源 (這個時間可以被定義在 `terminationGracePeriodSeconds` 中)，若沒有在時間內關閉，則會發送 SIGKILL 訊號強制終止 

***為何通常一個 Pod 只會有一個容器？***

如果每個 Pod 只有一個容器，Kubernetes 可以簡單地調整 Pod 的數量來增減服務的處理能力。而多容器的 Pod 在擴展上會更困難，因為必須同時複製多個容器

## Static Pods

> Ref
> 1. https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
> 2. https://yuminlee2.medium.com/kubernetes-static-pods-734dc0684f31

***什麼是 Static Pods ?***

由 Kubelet daemon 在節點上直接管理的一種Pod，而不是讓 Control Plane 管理。**並且 Static Pod 通常直接定義在節點的指定目錄中。** kubelet 會自動檢測該目錄中的配置文件並啟動相應的 Pod。

由於 Static Pod 由 kubelet 直接控制， **因此沒辦法直接由 ReplicaSet 或者是 Deployment 進行副本管理** ，也因此 Static Pod 只能在定義文件所在的 Node 上運行，並且不會自動調度到其他 Node 上

***可以講一下 Static Pod 的使用情境嗎？***

如果要跑 Control Plane 的控制元件，就會使用 Static Pod， **通常在 Control Plane 中的控制元件，像是 API Server, kube-scheduler, etcd , kube-controller-manager 都會作為 Static Pod 存在於 Master Node 中**


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


> https://sean22492249.medium.com/networking-in-kubernetes-pod-%E8%88%87-pod-%E7%9A%84%E7%B6%B2%E8%B7%AF%E9%80%A3%E9%80%9A-216cfe6de471

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

