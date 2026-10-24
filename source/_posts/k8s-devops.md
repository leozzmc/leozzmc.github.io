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

> 🌐 English version: [English](/en/posts/c7f5f41c.html)


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


***如何知道一個Pod是否是 Static Pod?***

```
kubectl describe pod <POD_NAME> -n <NAMESPACE>
```
檢查結果的 `annotations` 或者 `nodeName` 中有沒有有 "mirror pod" 註解。如果在 `metadata.annotations` 欄位中找到 `kubernetes.io/config.mirror`， **這表示該 Pod 是一個由 Static Pod 所產生的 Mirror Pod。**

```
NAMESPACE     NAME                               READY   STATUS    RESTARTS        AGE
default       web                                1/1     Running   0               5h14m
kube-system   coredns-6f6b679f8f-s8l6l           1/1     Running   0               5h18m
kube-system   etcd-minikube                      1/1     Running   0               5h18m
kube-system   kube-apiserver-minikube            1/1     Running   0               5h18m
kube-system   kube-controller-manager-minikube   1/1     Running   0               5h18m
kube-system   kube-proxy-9c8vm                   1/1     Running   0               5h18m
kube-system   kube-scheduler-minikube            1/1     Running   0               5h18m
kube-system   storage-provisioner                1/1     Running   1 (5h18m ago)   5h18m
~                                                                                                                                                 ○ minikube 04:28:02 下午
❯ kdp etcd-minikube  -n kube-system
```

輸出結果：

```yaml
Name:                 etcd-minikube
Namespace:            kube-system
Priority:             2000001000
Priority Class Name:  system-node-critical
Node:                 minikube/192.168.58.2
Start Time:           Fri, 08 Nov 2024 11:09:17 +0800
Labels:               component=etcd
                      tier=control-plane
Annotations:          kubeadm.kubernetes.io/etcd.advertise-client-urls: https://192.168.58.2:2379
                      kubernetes.io/config.hash: 0f576c7626af2d96b08f13e09b83eb08
                      kubernetes.io/config.mirror: 0f576c7626af2d96b08f13e09b83eb08
                      kubernetes.io/config.seen: 2024-11-08T03:09:16.930402512Z
                      kubernetes.io/config.source: file
Status:               Running
SeccompProfile:       RuntimeDefault
IP:                   192.168.58.2
IPs:
  IP:           192.168.58.2
Controlled By:  Node/minikube
Containers:
.....

```

可以發現到確實有 mirror pod 的註解在

***Static Pod 的 manifest檔案通常在哪？***

通常會在 `/etc/kubernetes/manifests`，如果要刪除 static pod 也通常是直接刪除相關的 manifest 檔案

```
❯ minikube ssh
docker@minikube:~$ ls /etc/kubernetes/manifests/
etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml
docker@minikube:~$
```

## Pods Commands

***要如何確認一個 Pod 是被調度到哪個 Worker Node 上面？***

```
kubectl get pods -o wide
```

刪除Pod

```
kubectl delete pod <POD_NAME>
```

列出所有 namespace 底下的所有 pod

```
kubectl get pods --all-namespaces
```

## Pods Troubleshooting and Debugging

***當你運行一個 Pod，但他都處在 Pending 狀態，可能會是什麼原因?***

有一種可能會是，負責調度 Pod 的 Scheduler 沒有在運行。可以透過 `kubectl get pod -A | grep scheduler` 來確認

***指令 `kubectl describe pod` 可以幹嘛？ ***

可以秀出Pod 的各種詳細資訊，有時候還會包含錯誤原因。


***建立一個使用 python image 的 static pod，並且要執行命令 sleep 20***


```
kubectl run some-pod --image=python --command sleep 20 --restart=Never --dry-run=client -o yaml > statuc-pod.yaml
```

# Labels and Selectors

***什麼是 Label?***

Label 是附加在 Kubernetes 物件上的 key-value 標籤，用來標示物件的特性（例如 `app=nginx`、`env=prod`）。Label 本身不影響物件運作，但可以讓 **Selector** 根據這些標籤來篩選物件。

```bash
kubectl get pods -l app=nginx          # 列出帶有 app=nginx 的 pod
kubectl label pod my-pod tier=frontend # 為 pod 加上 label
```

***Label 跟 Annotation 有什麼差別?***

兩者都是 key-value，但用途不同：
- **Label** 用於「篩選與分組」，會被 selector 查詢，值有長度與字元限制
- **Annotation** 用於存放「非識別性的 metadata」（例如建置資訊、提示訊息），不會被 selector 使用，可以存放較長、較複雜的資料

***什麼是 Selector?***

Selector 用來根據 label 選出一組物件，常見於 Service 要找出要路由的 Pod、Deployment 要管理哪些 Pod。分成：
- **Equality-based**: `app=nginx`、`env!=prod`
- **Set-based**: `env in (prod, staging)`、`tier notin (frontend)`

# Deployment

***什麼是 Deployment?***

Deployment 是用來宣告式管理一組無狀態 Pod 的物件。你描述「期望狀態」（像是要幾個副本、用哪個 image），Deployment 底層會透過 ReplicaSet 來確保實際狀態符合期望，並支援滾動更新與回滾。

```bash
kubectl create deployment nginx --image=nginx --replicas=3
kubectl scale deployment nginx --replicas=5
kubectl set image deployment/nginx nginx=nginx:1.25   # 滾動更新
kubectl rollout status deployment/nginx
kubectl rollout undo deployment/nginx                 # 回滾
```

***Deployment、ReplicaSet、Pod 之間的關係？***

Deployment 管理 ReplicaSet，ReplicaSet 管理 Pod。每次更新 image，Deployment 會建立一個新的 ReplicaSet，逐步把舊 ReplicaSet 的 Pod 換成新的，這就是滾動更新。

***滾動更新時如何控制一次換多少?***

透過 `strategy.rollingUpdate` 的 `maxSurge`（最多可以多出幾個 Pod）與 `maxUnavailable`（最多可以有幾個 Pod 不可用）。

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

# Services

***什麼是 Service? 為什麼需要它?***

Pod 的 IP 會隨著重建而改變，Service 提供一個穩定的虛擬 IP（ClusterIP）與 DNS 名稱，並透過 label selector 把流量負載平衡到一組 Pod 上。

***有哪些 Service 類型?***

| 類型 | 用途 |
| --- | --- |
| **ClusterIP** | 預設，只在叢集內部可存取 |
| **NodePort** | 在每個節點開一個固定 port（30000-32767），叢集外可透過 `<NodeIP>:<NodePort>` 存取 |
| **LoadBalancer** | 向雲端供應商申請一個外部負載平衡器 |
| **ExternalName** | 把 Service 映射到一個外部 DNS 名稱（CNAME） |

```bash
kubectl expose deployment nginx --port=80 --target-port=80 --type=ClusterIP
```

***Service 怎麼知道要把流量送到哪些 Pod?***

透過 selector 比對 Pod 的 label，符合的 Pod IP 會被記錄在對應的 **Endpoints**（或 EndpointSlice）物件中，kube-proxy 再據此設定 iptables/IPVS 規則做負載平衡。

# Ingress

***Service 的 LoadBalancer 已經可以對外，為什麼還需要 Ingress?***

如果每個服務都開一個 LoadBalancer 會很貴且難管理。Ingress 提供一個「七層（HTTP/HTTPS）的入口」，可以用同一個進入點、依照 host 或 path 把流量路由到不同的 Service，並且能統一處理 TLS 終止。

***Ingress 自己會運作嗎?***

不會。Ingress 物件只是「路由規則的宣告」，真正執行的是 **Ingress Controller**（例如 nginx-ingress、Traefik、AWS ALB Controller），必須先部署一個 Controller 規則才會生效。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-svc
            port:
              number: 80
```

# ReplicaSets

***什麼是 ReplicaSet?***

ReplicaSet 確保指定數量的 Pod 副本「隨時都在運行」。如果有 Pod 掛掉，它會自動補一個新的；如果多了，它會刪掉多的。

***那我該直接用 ReplicaSet 嗎?***

通常不會。ReplicaSet 幾乎總是由 Deployment 來建立與管理，因為 Deployment 多了滾動更新與回滾的能力，直接操作 ReplicaSet 的情況很少。

# DaemonSets

***什麼是 DaemonSet? 什麼時候用?***

DaemonSet 確保「每個（或符合條件的）節點上都剛好跑一個 Pod」。常用於節點層級的系統服務，例如：
- 日誌收集 agent（Fluent Bit、Filebeat）
- 監控 agent（node-exporter）
- 網路外掛（CNI）、kube-proxy

當有新節點加入叢集，DaemonSet 會自動在新節點上建立對應的 Pod。

# StatefulSet

***StatefulSet 跟 Deployment 有什麼不同?***

Deployment 適合「無狀態」應用（每個 Pod 可互換）。StatefulSet 則適合「有狀態」應用，提供：
- **穩定且固定的網路身分**：Pod 名稱是 `<name>-0`、`<name>-1`，不會變
- **穩定的持久化儲存**：每個 Pod 會綁定自己專屬的 PVC，重建後仍掛回同一份資料
- **有序的部署與擴縮**：依序建立（0→1→2）、依序刪除

***什麼情境會用 StatefulSet?***

資料庫（MySQL、PostgreSQL）、分散式系統（Kafka、Zookeeper、Elasticsearch）這類每個節點身分不同、需要保留自己資料的應用。

# Storage

***什麼是 PV 跟 PVC?***

- **PersistentVolume (PV)**：叢集中一塊實際的儲存資源（NFS、雲端磁碟、Ceph 等），由管理員或 StorageClass 提供
- **PersistentVolumeClaim (PVC)**：使用者對儲存的「請求」，描述需要多大、什麼存取模式，Kubernetes 會把 PVC 綁定到合適的 PV

這種設計把「儲存的供給」跟「儲存的使用」解耦。

***什麼是 StorageClass?***

StorageClass 定義了「動態供給」的方式。當 PVC 指定某個 StorageClass，Kubernetes 會自動建立對應的 PV（例如自動開一顆 EBS 磁碟），不需要管理員手動預先建立。

***存取模式 (Access Mode) 有哪些?***

- **ReadWriteOnce (RWO)**: 只能被單一節點掛載讀寫
- **ReadOnlyMany (ROX)**: 可被多個節點唯讀掛載
- **ReadWriteMany (RWX)**: 可被多個節點讀寫掛載（需底層儲存支援，如 NFS）

# Networking

***Kubernetes 網路的基本原則是什麼?***

Kubernetes 要求：
1. 每個 Pod 有自己的 IP
2. 所有 Pod 之間可以不經 NAT 直接互通
3. 節點上的 agent（如 kubelet）可以跟該節點上的 Pod 溝通

這些由 **CNI（Container Network Interface）外掛**（Calico、Flannel、Cilium 等）實作。

***叢集內的 DNS 怎麼運作?***

CoreDNS 提供叢集內部 DNS。Service 會有一個 DNS 名稱 `<service>.<namespace>.svc.cluster.local`，Pod 之間就能用名稱而不是 IP 互相存取。

> https://sean22492249.medium.com/networking-in-kubernetes-pod-%E8%88%87-pod-%E7%9A%84%E7%B6%B2%E8%B7%AF%E9%80%A3%E9%80%9A-216cfe6de471

# Policies

***什麼是 NetworkPolicy?***

預設情況下所有 Pod 之間都可以互通。NetworkPolicy 讓你用 label selector 定義「哪些 Pod 可以跟哪些 Pod（或 namespace、IP 區段）通訊」，相當於 Pod 層級的防火牆。注意：NetworkPolicy 需要 CNI 外掛支援（例如 Calico、Cilium）才會生效。

***什麼是 ResourceQuota 跟 LimitRange?***

- **ResourceQuota**: 限制一個 namespace 內可用的資源總量（例如總 CPU、記憶體、Pod 數量）
- **LimitRange**: 為 namespace 內的個別 Pod/容器設定預設與上下限的資源值

# Etcd

***etcd 在 Kubernetes 中扮演什麼角色?***

etcd 是一個分散式的 key-value 資料庫，是整個叢集的「唯一真實來源（single source of truth）」。所有物件狀態（Pod、Service、ConfigMap、Secret…）都存在 etcd 裡，而 API Server 是唯一直接跟 etcd 溝通的元件。

***為什麼 etcd 的備份很重要?***

如果 etcd 資料遺失，等於整個叢集的狀態都不見了，所以正式環境通常會定期備份 etcd 快照。

```bash
ETCDCTL_API=3 etcdctl snapshot save snapshot.db \
  --endpoints=https://127.0.0.1:2379 \
  --cacert=... --cert=... --key=...
```

# Namespaces

***什麼是 Namespace?***

Namespace 讓你在同一個實體叢集中切出多個「虛擬叢集」，用來隔離不同團隊、環境或專案的資源。配合 ResourceQuota 與 RBAC 可以做到資源與權限的隔離。

```bash
kubectl create namespace dev
kubectl get pods -n dev
```

***哪些資源是叢集層級（cluster-scoped）、不屬於任何 namespace 的?***

大部分資源（Pod、Service、Deployment）屬於某個 namespace，但有些是叢集層級、不屬於任何 namespace，例如 **Node、PersistentVolume、Namespace 本身、ClusterRole**。

# Operators

***什麼是 Operator?***

Operator 是一種把「維運某個應用的專業知識」寫成程式碼的模式。它用 **自定義資源（CRD, Custom Resource Definition）** 擴充 Kubernetes API，再搭配一個 **Controller** 持續監控這些自定義資源、把實際狀態調整到期望狀態。

***舉個例子?***

例如你想在 K8s 上跑一套 PostgreSQL 叢集，裝一個 PostgreSQL Operator 後，你只要建立一個 `kind: PostgresCluster` 的自定義資源，Operator 就會自動幫你處理建立、備份、故障轉移、版本升級等維運工作。

# Secrets

***Secret 跟 ConfigMap 有什麼不同?***

兩者都用來把設定從 image 中抽離，差別在：
- **ConfigMap**: 存放一般的、非敏感的設定（設定檔、環境變數）
- **Secret**: 存放敏感資料（密碼、token、憑證）

***Secret 真的安全嗎?***

要注意：**預設的 Secret 只是用 base64 編碼，不是加密**，任何能讀取 Secret 的人都能解出內容。要真正保護，需要額外啟用 **etcd encryption at rest**，並用 RBAC 嚴格限制誰能讀 Secret。

```bash
kubectl create secret generic db-cred \
  --from-literal=username=admin --from-literal=password=p@ss
```

# Volumes

***Volume 跟 PersistentVolume 有什麼不同?***

- 一般 **Volume** 的生命週期跟 Pod 綁在一起，Pod 一刪，像 `emptyDir` 這種 volume 的資料就沒了
- **PersistentVolume** 的生命週期獨立於 Pod，Pod 刪了資料還在

***常見的 Volume 類型?***

- `emptyDir`: Pod 生命週期內的暫存空間，常用於同一 Pod 內容器間共享資料
- `hostPath`: 掛載節點上的某個路徑（要小心，會跟節點耦合）
- `configMap` / `secret`: 把 ConfigMap/Secret 以檔案形式掛進容器
- `persistentVolumeClaim`: 掛載一個 PVC（真正的持久化儲存）

# Access Control

***Kubernetes 怎麼做權限控制?***

主要透過 **RBAC（Role-Based Access Control）**。核心四個物件：
- **Role / ClusterRole**: 定義「可以對哪些資源做哪些動作」（Role 限 namespace，ClusterRole 跨叢集）
- **RoleBinding / ClusterRoleBinding**: 把 Role 綁定給某個 User、Group 或 ServiceAccount

```bash
kubectl create role pod-reader --verb=get,list,watch --resource=pods
kubectl create rolebinding read-pods --role=pod-reader --user=kevin
```

***什麼是 ServiceAccount?***

ServiceAccount 是給「Pod 內的程式」用的身分（相對於給人用的 User）。Pod 可以用 ServiceAccount 的 token 去呼叫 API Server，並受 RBAC 控制。

***一個請求到 API Server 會經過哪些檢查?***

Authentication（你是誰）→ Authorization（RBAC，你能不能做）→ Admission Control（額外的准入控制，例如驗證或修改請求）。

# CronJob

***Job 跟 CronJob 有什麼不同?***

- **Job**: 跑一個「會結束」的一次性任務（例如資料遷移、批次運算），確保它成功完成指定次數
- **CronJob**: 在 Job 之上加排程，依照 cron 語法「定時」建立 Job（例如每天凌晨備份）

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup
spec:
  schedule: "0 2 * * *"   # 每天 02:00
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: backup-tool:latest
          restartPolicy: OnFailure
```

# Helm

***什麼是 Helm?***

Helm 是 Kubernetes 的「套件管理器」，類似 apt/yum。它把一組 K8s manifest 打包成 **Chart**，支援用 `values.yaml` 做參數化、版本管理與一鍵安裝/升級/回滾。

```bash
helm install my-release bitnami/nginx
helm upgrade my-release bitnami/nginx --set replicaCount=3
helm rollback my-release 1
helm uninstall my-release
```

***為什麼要用 Helm 而不是直接 kubectl apply?***

當應用由很多 manifest 組成、又要部署到多個環境（dev/staging/prod 參數不同）時，Helm 的樣板化與版本管理比手動維護一堆 YAML 方便很多。

# Security

***有哪些常見的 Kubernetes 安全實務?***

- **最小權限原則**: 用 RBAC 嚴格限制 ServiceAccount 與使用者的權限
- **不要用 root 跑容器**: 設定 `securityContext.runAsNonRoot: true`
- **Secret 加密**: 啟用 etcd encryption at rest，限制 Secret 的存取
- **NetworkPolicy**: 預設拒絕，只開必要的 Pod 間通訊
- **Image 掃描**: 掃描 image 漏洞，只用可信來源
- **Pod Security Admission**: 用內建的 Pod Security Standards（privileged / baseline / restricted）限制 Pod 的權限

***什麼是 securityContext?***

securityContext 可以為 Pod 或容器設定安全相關的屬性，例如以哪個 UID 執行、是否允許特權模式、是否唯讀根檔案系統等。

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
```

# Misc

***kubectl 有哪些好用的除錯指令?***

```bash
kubectl describe <resource> <name>   # 看詳細狀態與事件
kubectl logs <pod> [-c container]    # 看容器日誌
kubectl logs <pod> --previous        # 看上一個崩潰容器的日誌
kubectl exec -it <pod> -- sh         # 進入容器
kubectl get events --sort-by=.lastTimestamp
kubectl top pod / kubectl top node   # 看資源用量（需 metrics-server）
```

***什麼是 kubectl 的 imperative 跟 declarative?***

- **Imperative（命令式）**: 直接下指令改變狀態，例如 `kubectl create`、`kubectl run`
- **Declarative（宣告式）**: 把期望狀態寫成 YAML，用 `kubectl apply -f` 讓 Kubernetes 自己去達成。正式環境通常用宣告式搭配 GitOps（版本控管所有 manifest）。

