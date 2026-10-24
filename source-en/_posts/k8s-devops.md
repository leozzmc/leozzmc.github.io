---
title: Kubernetes for DevOps Notes |【DevOps Skill Tree】
description: (not yet finished)
tags:
  - Kubernetes
  - Python
  - DevOps
categories: Study Notes
aside: true
toc: true
abbrlink: "c7f5f41c"
date: 2024-11-07 19:14:09
cover:
---

> 🌐 中文版：[繁體中文](/posts/c7f5f41c.html)

# Basic

***Explain what Kubernetes is***

A platform for **container orchestration and management**, used for automated deployment and scaling of containers.

*What are Kubernetes's main features?*
- Self-Healing: uses health checks to inspect running containers and takes corresponding action, e.g. restarting a container
- Load Balancing: distributes requests across different applications in the cluster
- Operations: applications packaged by Kubernetes can use the cluster's API to update their state and trigger operations based on events and application state changes
- Automated Rollout: gradually updates applications, and can roll back when problems arise
- Scaling: horizontal scaling based on custom conditions
- Secrets: a mechanism to store usernames, passwords, and service endpoints privately, not viewable by every user of the cluster

***What ways can you interact with Kubernetes resources?***

You can interact with a Kubernetes cluster using the kubectl command-line tool.

***When deploying an app to Kubernetes, which Kubernetes objects are used most?***

- Deployment: creates and monitors a group of Pods
- Service: routes traffic to Pods within the cluster
- Ingress: routes external traffic into the cluster

***What are the common Kubernetes objects?***

Pod, Service, ReplicationController, ReplicaSet, DaemonSet, Namespace, ConfigMap, etc.

> A container isn't a Kubernetes object; the smallest object unit in Kubernetes is the Pod, which usually contains one or more containers.

# Cluster and Architecture

![](/img/devops/k8s/cluster.jpeg)

***What is a Kubernetes cluster?***

A collection of nodes running containerized applications, mainly divided into master nodes and worker nodes.

The master node is Kubernetes's control center, containing several key components:
- **API Server**: Kubernetes's API entry point, responsible for receiving API requests like deploying apps and scaling containers. All resource operations go through the API Server.
- **Scheduler**: responsible for scheduling new Pods onto suitable worker nodes, mainly based on resource needs and policy choices
- **Controller Manager**: manages the various controllers that maintain the cluster's desired state, e.g. ensuring a specified number of Pods keep running
- **etcd**: the distributed database in Kubernetes, holding the whole cluster's state and configuration

A worker node runs applications in Kubernetes, mainly running these components:
- **kubelet**: manages the Pods and containers on a node and monitors container state. It interacts with the master node via the API Server.
- **kube-proxy**: handles the node's network configuration, ensuring every Pod in the cluster can communicate, and also handles load balancing
- **container runtime**: the container runtime (Docker, containerd) pulls images and runs containers

***How do I tell whether the current Kubernetes environment is a master node or a worker node?***

```
kubectl get nodes -o wide
```

It may output info like:

```
NAME        STATUS   ROLES           AGE   VERSION
master-1    Ready    control-plane   20d   v1.20.0
worker-1    Ready    <none>          20d   v1.20.0
worker-2    Ready    <none>          20d   v1.20.0
```

***How do you manage multiple Kubernetes clusters? How do you quickly switch between clusters with kubectl?***

`kubectl config use-context [CONTEXT_NAME]`

Each cluster has a context; you can view all available contexts with:

```
kubectl config get-contexts
```

***How do you avoid high memory usage causing a memory leak or OOM (Out Of Memory) in a Kubernetes cluster?***

Method 1
Set **resource requests** and **resource limits** for Pods or containers to ensure containers don't exceed their allowed resource usage, letting the app stop when it consumes too much and preventing node OOM.

Resource requests ensure a Pod's minimum resource requirement, which lets the Scheduler find a suitable node when scheduling the Pod. Conversely, resource limits cap the maximum resources a Pod can use.

```yaml
resources:
    requests:
        memory: "256Mi"
        cpu: "500m"
    limits:
        memory: "512Mi"
        cpu: "1000m"
```

Method 2
Use other monitoring tools, e.g. Prometheus and Grafana, to monitor Pod memory usage.

Method 3
Enable the **HPA (Horizontal Pod Autoscaler)**, which automatically adds or removes replicas based on CPU or memory usage.

```
kubectl autoscale deployment [deployment_name] --cpu-percent=80 --min=2 --max=10
```

***How do you list all API object types?***

```
kubectl api-resources
```

## Kubelet

***If you disable the kubelet on a worker node, what happens to the running Pods?***

Since the kubelet communicates with the API Server, disabling it means the worker node can't interact with the API Server. The node's status is marked **Not Ready**, and the Pods on it become **Unknown**. Once the control plane detects a worker node has been Not Ready for too long (reaching the threshold time, usually 5 minutes), it evicts the Pods on that node and reschedules them onto other available nodes.

# Pods

A Pod is the smallest object unit in Kubernetes, usually composed of one or more containers. A Pod shares network resources, storage, and the specification defining how containers run.

![](/img/devops/k8s/pod.png)

***How do you deploy a Pod named my-pod using the nginx:alpine image?***

```
kubectl run my-pod --image=nginx:alpine
```

This isn't the common way to run a Pod; you usually run Pods via a Deployment.

***How many containers are usually in a Pod?***

A Pod can contain multiple containers, but in most cases there's one. You can also deploy a sidecar container into a Pod, usually for collecting logs.

***What phases can a Pod have? Briefly explain the Pod lifecycle***

A Pod may go through these phases in its lifecycle:

|Value|Description|
|---|-------|
| Pending | The Pod has been accepted by the cluster, but its containers may not be running yet; it may be waiting to be scheduled or waiting to download a container image |
| Running | All containers have been created and at least one is running |
| Succeeded | All containers in the Pod completed successfully and won't restart |
| Failed | All containers in the Pod were terminated, and at least one was terminated due to failure, with no restart |
| Unknown | The Pod's state can't be obtained for some reason, usually due to a communication error between the Pod and the node |

***What happens when you run a Pod via kubectl? Explain the flow***

1. Kubectl sends a request to the API Server to create the Pod
   - The API Server validates the request
   - etcd is updated
2. The Scheduler in the control plane learns there's an unassigned Pod by watching the API Server
3. The Scheduler chooses a node to assign the Pod to
   - etcd is updated with this info
4. The Scheduler tells the API Server which Pod it chose
5. The kubelet notices a Pod was assigned to its node but isn't running
6. The kubelet sends a request to the container engine (e.g. Docker) to create and run the container
7. Once the Pod is running, the kubelet updates the status to the API Server
  - etcd is again notified by the API Server to update the info

> Ref: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/

***How do you know whether a container in a Pod is running?***

`kubectl describe pod <POD_NAME>` to check whether the container status is `Running`.

Or use `kubectl exec` to run a command inside the container.

***When you find a Pod in CrashLoopBackOff, what could the error be? How do you check it?***

This usually means the Pod repeatedly starts then crashes, over and over. There are many possible causes, such as:
- An application error forcing the container to exit
- A configuration error, like wrong environment variables or a missing config file
- Resource limits: the container doesn't have enough memory or CPU allocated
- A health check failure: if the app doesn't come up within the expected time, this error occurs too
- A container liveness probe / startup probe returning an error

For detailed troubleshooting, use `kubectl describe pod <POD_NAME>` to see the detailed cause, or `kubectl logs <POD_NAME>` to see the container's logs.

![](/img/devops/k8s/container.png)

***What does the config below mean?***

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /appStatus
  initialDelaySeconds: 10
  periodSeconds: 5
```

First, what is a **liveness probe**: its purpose is to restart a container when it isn't in the desired state.

This YAML means: **if the `cat /appStatus` command fails, Kubernetes kills the container and then applies the restart policy.** `initialDelaySeconds` means the kubelet waits 10 seconds before first running the probe command (`cat /appStatus`), and from then on reruns it every 5 seconds (defined in `periodSeconds`).

***What does the config below mean?***

```yaml
readinessProbe:
      tcpSocket:
        port: 2017
      initialDelaySeconds: 15
      periodSeconds: 20
```

A **readiness probe** usually determines whether a container is ready to accept traffic. So this defines that until the Pod can connect to the container's port 2017, it won't be marked `Ready`. The first probe runs 15 seconds after the container starts, and it keeps checking every 20 seconds until it can connect to the defined port.

***What happens when you delete a Pod?***

1. Kubernetes sends a SIGTERM signal to the container in the Pod to terminate the container's main process
2. The container then has some time to finish its current task and release resources (this time can be defined in `terminationGracePeriodSeconds`); if it doesn't shut down in time, a SIGKILL signal is sent to force termination

***Why is there usually only one container per Pod?***

If each Pod has one container, Kubernetes can simply adjust the number of Pods to scale the service's capacity. Multi-container Pods are harder to scale, since multiple containers must be replicated together.

## Static Pods

> Ref
> 1. https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
> 2. https://yuminlee2.medium.com/kubernetes-static-pods-734dc0684f31

***What are static Pods?***

A kind of Pod managed directly by the kubelet daemon on a node, rather than by the control plane. **A static Pod is usually defined directly in a designated directory on the node.** The kubelet automatically detects the config files in that directory and starts the corresponding Pods.

Since a static Pod is controlled directly by the kubelet, **it can't be replica-managed directly by a ReplicaSet or Deployment**, and therefore a static Pod can only run on the node where its definition file resides, and won't be automatically scheduled onto other nodes.

***Can you give a use case for static Pods?***

Static Pods are used to run control-plane components. **Usually the control-plane components like the API Server, kube-scheduler, etcd, and kube-controller-manager all exist as static Pods on the master node.**

***How do you know whether a Pod is a static Pod?***

```
kubectl describe pod <POD_NAME> -n <NAMESPACE>
```
Check whether the result's `annotations` or `nodeName` has a "mirror pod" annotation. If you find `kubernetes.io/config.mirror` in the `metadata.annotations` field, **it means this Pod is a mirror Pod generated by a static Pod.**

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
~                                                                                                                                                 ○ minikube 04:28:02 PM
❯ kdp etcd-minikube  -n kube-system
```

Output:

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

You can see the mirror pod annotation is indeed there.

***Where is a static Pod's manifest file usually?***

Usually in `/etc/kubernetes/manifests`; to delete a static Pod you usually just delete the related manifest file.

```
❯ minikube ssh
docker@minikube:~$ ls /etc/kubernetes/manifests/
etcd.yaml  kube-apiserver.yaml  kube-controller-manager.yaml  kube-scheduler.yaml
docker@minikube:~$
```

## Pods Commands

***How do you confirm which worker node a Pod was scheduled onto?***

```
kubectl get pods -o wide
```

Delete a Pod

```
kubectl delete pod <POD_NAME>
```

List all Pods across all namespaces

```
kubectl get pods --all-namespaces
```

## Pods Troubleshooting and Debugging

***When you run a Pod but it stays Pending, what could the cause be?***

One possibility is that the Scheduler responsible for scheduling Pods isn't running. You can confirm with `kubectl get pod -A | grep scheduler`.

***What can the `kubectl describe pod` command do?***

It shows various detailed info about the Pod, sometimes including the error cause.

***Create a static Pod using the python image, running the command sleep 20***

```
kubectl run some-pod --image=python --command sleep 20 --restart=Never --dry-run=client -o yaml > statuc-pod.yaml
```

# Labels and Selectors

***What is a label?***

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
