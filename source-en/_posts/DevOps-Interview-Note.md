---
title: DevOps Skill Tree Knowledge Roundup |【Notes Index】
tags:
  - DevOps
  - Linux
  - Networking
  - AWS
categories: Study Notes
aside: true
toc: true
cover: /img/devops/cover3.jpg
abbrlink: "dce71546"
date: 2024-11-05 21:45:50
---

> 🌐 中文版：[繁體中文](/posts/dce71546.html)


# Preface

This records the common knowledge points for DevOps interviews, mainly notes organized from this [GitHub repository: DevOps Exercises](https://github.com/bregman-arie/devops-exercises) and [ByteByteGo's GitHub repo](https://github.com/ByteByteGoHq/system-design-101).

> It may take a long time to finish organizing everything.

# DevOps General

***What is DevOps?***

DevOps is a culture and set of practices combining Development (Dev) and Operations (Ops), aiming to shorten the software delivery cycle and increase release frequency while keeping systems stable. Its core spirit is **automation**, **continuous feedback**, and **cross-team collaboration**.

***What are some core DevOps practices?***

- **CI/CD**: continuous integration and continuous delivery/deployment
- **IaC (Infrastructure as Code)**: manage infrastructure with code (Terraform, CloudFormation)
- **Monitoring and observability**: metrics, logs, traces
- **Automated testing**
- **Version control** (everything goes into Git, including config and infrastructure)

***What is CALMS?***

A framework for measuring an organization's DevOps maturity: **C**ulture, **A**utomation, **L**ean, **M**easurement, **S**haring.

***How does SRE relate to DevOps?***

SRE (Site Reliability Engineering) can be seen as a concrete implementation of DevOps, using software-engineering methods to solve operations problems. Core concepts include **SLI/SLO/SLA**, **error budget**, and **eliminating toil**.

# Python
- Basic Data Types
- OOP / Class
- Raise Exceptions
- Regex
- Async
- File Manipulation
- OS
- lambda
- decorator
- Flask

> Article: [Python for DevOps |【DevOps Skill Tree】](/en/posts/70fcdd32.html) (this section has its own article, see the link)

# Networking

***What are the seven OSI layers?***

Physical → Data Link → Network → Transport → Session → Presentation → Application. A common mapping bottom-up: "cable → MAC/switch → IP/router → TCP/UDP → …". In practice the TCP/IP four-layer model (Link, Internet, Transport, Application) is used more.

***What's the difference between TCP and UDP?***

- **TCP**: connection-oriented, reliable (three-way handshake, ACK, retransmission, flow control, congestion control), ordered. Used by HTTP, SSH, file transfer.
- **UDP**: connectionless, no delivery or order guarantee, but low latency and low overhead. Used by DNS, streaming, games, VoIP.

***What is CIDR?***

Classless Inter-Domain Routing, representing a network with `IP/prefix length`, e.g. `10.0.0.0/16` means the first 16 bits are the network address, holding `2^(32-16)-2` host addresses. `/24` = 256 addresses (254 usable).

***What does ARP do?***

Address Resolution Protocol, resolving an **IP address to a MAC address**. Within a LAN, to send a packet to an IP, a host broadcasts ARP asking "who has this IP?", and the owner replies with its MAC. `arp -a` shows the ARP cache.

***What is NAT?***

Network Address Translation, translating private IPs to public IPs (and vice versa), letting many internal machines share one public IP to reach the internet. Common in home routers and cloud NAT Gateways.

***What's the DNS resolution flow?***

Browser → local cache → recursive DNS (e.g. 8.8.8.8) → Root → TLD (.tw) → authoritative DNS, resolving the IP level by level. The recursive server doesn't store records itself but queries all the way to the authoritative server for you. Common records: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (name server), TXT.

***What's ICMP for?***

A network-layer control and error-reporting protocol; both `ping` (Echo Request/Reply) and `traceroute` are based on ICMP.

***What's the DHCP flow (DORA)?***

**D**iscover → **O**ffer → **R**equest → **A**ck; the client broadcasts to find a DHCP server, and the server offers an IP lease.

***VLAN vs SDN?***

- **VLAN**: logically isolated broadcast domains carved out on the same physical switch.
- **SDN (Software-Defined Networking)**: separates the network's control plane (decisions) from the data plane (forwarding), controlled centrally by software; OpenFlow is a representative protocol.

# Linux

***A few key directories in the Filesystem Hierarchy Standard (FHS)?***

`/etc` (config files), `/var` (variable data like logs), `/usr` (user programs), `/home` (user home directories), `/bin` `/sbin` (executables), `/proc` `/sys` (kernel virtual filesystems), `/dev` (device files), `/tmp` (temporary).

***What do Linux permissions 755 / 644 mean?***

Each digit is octal rwx: r=4, w=2, x=1. `755` = owner rwx, group r-x, other r-x (common for directories or executables); `644` = owner rw-, others read-only (common for regular files). Special permissions: SUID, SGID, sticky bit.

***Common I/O redirection usage?***

```bash
cmd > file      # stdout overwrite
cmd >> file     # stdout append
cmd 2> file     # stderr
cmd > file 2>&1 # both stdout+stderr to file
cmd1 | cmd2     # pipe, cmd1's stdout as cmd2's stdin
```

***Common systemd commands?***

```bash
systemctl status/start/stop/restart/enable <service>
systemctl list-units --type=service
journalctl -u <service> -f   # view service logs
```
systemd is the modern Linux init system (PID 1), managing services, mounts, and the boot process.

***The boot process (roughly)?***

BIOS/UEFI → Bootloader (GRUB) → load Kernel → mount initramfs/initrd → run init (systemd, PID 1) → start the various targets/services → login. (See also: [initrd vs initramfs](/en/posts/ad71f05.html))

***Common performance-analysis tools?***

- CPU/overall: `top`, `htop`, `vmstat`, `mpstat`
- Memory: `free -m`, `/proc/meminfo`
- Disk I/O: `iostat`, `iotop`
- Network: `ss`, `netstat`, `iftop`, `tcpdump`
- Combined: `dstat`, `sar`

***What is the OOM Killer?***

When system memory is exhausted, the kernel picks a process to kill by `oom_score` to free memory. Logs are in `/var/log/messages` or `dmesg`. You can adjust a process's likelihood of being picked via `/proc/<pid>/oom_score_adj`.

# Shell Scripting

***What is a shebang?***

The script's first line `#!/bin/bash`, telling the system which interpreter to run it with.

***What are `$?`, `$#`, `$@`, `$0`?***

`$?` the previous command's exit code (0=success), `$#` number of arguments, `$@` all arguments, `$0` the script name, `$1..$n` the n-th argument.

***Difference between `[ ]` and `[[ ]]`?***

`[ ]` is POSIX test, `[[ ]]` is a bash extension supporting `&&`, `||`, regex `=~`, and is safer without needing to quote variables.

***A common example?***

```bash
#!/bin/bash
set -euo pipefail   # stop on error, error on undefined vars, fail if any pipe fails

for f in *.log; do
  [ -f "$f" ] || continue
  echo "processing $f"
done

if grep -q "ERROR" app.log; then
  echo "found error"
fi
```

***What do `set -e`, `set -u`, `set -o pipefail` do?***

The three safety switches: `-e` aborts on command failure, `-u` errors on using an undefined variable, `pipefail` makes a pipeline fail if any command in it fails. Strongly recommended for production scripts.

# Security

***The principle of least privilege?***

Grant each user/service/program only the minimum privileges needed for its task, to limit the blast radius after a compromise.

***Symmetric vs asymmetric encryption?***

- **Symmetric**: same key for encrypt/decrypt (AES), fast, but key exchange is the challenge.
- **Asymmetric**: public key encrypts, private key decrypts (RSA, ECC), solving key exchange but slow. In practice they're combined: use asymmetric to exchange a symmetric key, then use symmetric to transfer data (that's how TLS works).

***Difference between hashing and encryption?***

Hashing is **one-way** and irreversible (SHA-256), used to verify integrity or store passwords (with salt); encryption is **reversible**, used for confidentiality.

***Common web attacks?***

SQL Injection, XSS (cross-site scripting), CSRF (cross-site request forgery), SSRF, path traversal, command injection. Defenses: parameterized queries, input validation, output encoding, CSP, least privilege.

***How should secrets be managed?***

Don't hardcode them in code or commit them to Git. Use a dedicated secrets-management service (AWS Secrets Manager, HashiCorp Vault, K8s Secret with encryption at rest), restrict access with RBAC, and rotate regularly.

***What is defense in depth?***

Don't rely on a single line of defense, but layer protections (network ACL, firewall, WAF, host hardening, app-layer validation, encryption), so if one layer is breached there's another behind it.

# Certificates

***What is a TLS certificate?***

A digital document issued by a Certificate Authority (CA) binding "public key ↔ domain," used to verify a server's identity and establish an encrypted connection. Browsers trust root CAs and verify down through the **certificate chain**.

***The TLS handshake flow, roughly?***

ClientHello (supported TLS versions, cipher suites, random) → ServerHello (chosen suite, certificate, random) → verify the certificate → exchange/negotiate a session key → then transfer data with symmetric encryption. (See also: this skill tree's DMS Troubleshooting notes have a more detailed handshake explanation)

***Difference between a self-signed and a CA-signed certificate?***

A self-signed certificate has no trusted CA backing, so browsers warn; it suits internal/testing. Production services should use a trusted CA (the free Let's Encrypt works).

***What to do when a certificate expires?***

Reissue/renew it. In production, use **cert-manager** (K8s) or **certbot** (Let's Encrypt) to auto-renew so you don't forget.

# Git
- git commands 
- branch
- merge
- rebase
- git internal principles
- troubleshooting

> Article: [Git for DevOps Notes |【DevOps Skill Tree】](/en/posts/22911275.html) (this section has its own article, see the link)

# CI/CD

***Difference between CI and CD?***

- **CI (Continuous Integration)**: developers frequently merge code into the mainline, with automatic build and test on each merge, to catch integration problems early.
- **CD**: either Continuous **Delivery** (automated to an "always deployable" state, with deployment being a button press) or Continuous **Deployment** (even the button is gone; anything passing tests goes to production automatically).

***Stages of a typical pipeline?***

`checkout → build → unit test → static analysis/scan → package image → push registry → deploy to staging → integration/E2E tests → deploy to production`.

***Blue-green vs canary deployment?***

- **Blue-Green**: maintain two environments at once, switch all traffic at once, and instantly switch back if something breaks.
- **Canary**: route a small portion of traffic to the new version first, watch the metrics, then gradually ramp up.

***Common CI/CD tools?***

Jenkins, GitHub Actions, GitLab CI, CircleCI, Drone, Argo CD (GitOps-style continuous deployment for K8s).

***What is GitOps?***

Declare the "desired system state" in Git and use a tool (Argo CD, Flux) to continuously reconcile the actual state to the declaration in Git. Git becomes the single source of truth, and deploying = changing Git.

# Container

***Difference between a container and a VM?***

A VM virtualizes the whole hardware and runs its own OS kernel, offering strong isolation but heavy; a container shares the host's kernel and only packages the app and its dependencies, so it starts fast, is lightweight, and achieves high density.

***Relationship between an image and a container?***

An image is a read-only template (layered); a container is a running instance of an image (a writable layer stacked on top of the image).

***What's the benefit of Docker's layers?***

Each Dockerfile instruction is a layer, layers can be cached and shared across images, so changing one line only requires rebuilding the later layers, also saving storage and transfer.

***What container states are there?***

created, running, paused, stopped/exited, removed.

***Docker network modes?***

- `bridge` (default, a built-in virtual bridge within a single host)
- `host` (uses the host network directly, no isolation)
- `none` (no network)
- `overlay` (across hosts, for Swarm/K8s)

***What is OCI?***

Open Container Initiative, which defines open standards for containers (image spec, runtime spec) so Docker, containerd, Podman, etc. can interoperate.

***A few Dockerfile optimization points?***

Multi-stage builds to shrink the image, use layer cache well, put frequently-changing instructions later, use a small base image (alpine/distroless), `.dockerignore` to exclude unnecessary files, and don't run as root.

# Kubernetes

This section has its own complete article, covering cluster architecture, Pod, Deployment, Service, Ingress, StatefulSet, Storage, Networking, RBAC, Helm, Security, etc.:

> Article: [Kubernetes for DevOps Notes |【DevOps Skill Tree】](/en/posts/c7f5f41c.html)

# Cloud General

***Difference between IaaS / PaaS / SaaS?***

The responsibility boundary from most to least: **IaaS** (rent hardware/VMs, like EC2, you manage the OS and up) → **PaaS** (rent a platform, like App Engine or RDS, you only manage code and data) → **SaaS** (use software directly, like Gmail).

***The public cloud's shared responsibility model?***

The cloud provider is responsible for "security of the cloud" (physical data center, underlying hardware, virtualization layer), and the customer for "security in the cloud" (OS updates, applications, data, IAM configuration, network rules).

***Horizontal vs vertical scaling?***

- **Vertical (Scale Up)**: make a single machine bigger (more CPU/RAM), with an upper limit and single-point risk.
- **Horizontal (Scale Out)**: add more machines to share the load, the mainstream cloud approach, paired with a load balancer.

***Region vs AZ?***

A Region is a geographic area (like us-east-1); within a Region are multiple mutually-isolated AZs (Availability Zones) with independent power/networking, and deploying across AZs achieves high availability.

# Virtualization

***Hypervisor Type 1 vs Type 2?***

- **Type 1 (bare-metal)**: runs directly on hardware (VMware ESXi, Xen; KVM is strictly a hybrid), good performance, used in data centers.
- **Type 2 (hosted)**: runs on top of a host OS (VirtualBox, VMware Workstation), convenient, used on desktops.

***What is KVM?***

Kernel-based Virtual Machine, a virtualization technology that turns the Linux kernel into a hypervisor, usually paired with QEMU for hardware emulation. (See also: the [Proxmox VE series](/en/posts/c5581068.html) uses KVM + LXC)

***Can VMs and containers be used together?***

Yes, and it's common: run K8s nodes inside cloud VMs, then run containers on the nodes, combining strong isolation (VM layer) with lightweight deployment (container layer).

# AWS
- Regions & AZs
- IAM / VPC / EC2 / ELB / Auto-Scaling / S3 / Route53 / Lambda / API Gateway / SNS / SQS / MQ / CloudFormation / ECS / EKS / Fargate ...

> Article: [AWS for DevOps Notes |【DevOps Skill Tree】](/en/posts/100cc6b6.html) (this section has its own article, see the link)

# Terraform

***What is Terraform? How is it different from CloudFormation?***

Terraform is HashiCorp's **IaC (Infrastructure as Code)** tool, describing infrastructure declaratively in HCL and supporting multi-cloud (AWS/GCP/Azure…); CloudFormation is AWS-only.

***Terraform's core flow?***

```bash
terraform init      # initialize, download providers
terraform plan      # preview the changes it will make
terraform apply     # actually apply
terraform destroy   # tear down
```

***What is the state file? Why does it matter?***

`terraform.tfstate` records the actual state of the resources Terraform manages, used to diff desired vs actual. For team collaboration you must use **remote state** (S3 + DynamoDB lock, Terraform Cloud) to avoid conflicts or overwrites from concurrent changes.

***What's a module for?***

Package a reusable set of resources into a module, parameterize it, and reuse it across environments (dev/staging/prod), essentially a function for IaC.

***Difference between `plan` and `apply`?***

`plan` only computes and shows the diff (read-only, safe); `apply` actually creates/modifies/deletes resources. In a proper flow, CI runs plan first for human review, and only applies after approval.

# System Design

***What aspects do you consider when designing a system?***

Scalability, availability, reliability, latency, consistency, cost, operability. Usually you estimate from the requirements (QPS, data volume, read/write ratio), then decide the architecture.

***Common components for horizontal scaling?***

Load balancer (LB), a stateless application layer (easy to scale out), caching (Redis/CDN), database read/write splitting and sharding, and message queues (peak shaving, decoupling).

***Common caching strategies and problems?***

Cache-Aside, Write-Through, Write-Back. Watch out for cache penetration, cache avalanche, and cache breakdown, plus eviction strategies (TTL, LRU).

***How do you improve availability?***

Eliminate single points (SPOF), redundancy across AZs/Regions, health checks + automatic failover, retries and circuit breakers, rate limiting and graceful degradation.

***What does a CDN do?***

Caches static content to edge nodes near users, reducing latency and origin load.

# Distributed System

***The CAP theorem?***

A distributed system can only have two of three among **Consistency (C)**, **Availability (A)**, and **Partition tolerance (P)** when a network partition occurs. Since partitions are unavoidable (P is mandatory), in practice it's a trade-off between C and A (CP or AP).

***What is eventual consistency?***

It doesn't guarantee reading the latest value each time, but after no new writes, all replicas eventually converge to a consistent state. Many high-availability systems (DynamoDB, DNS) use it.

***Consensus algorithms?***

Let multiple nodes agree on a value even with node failures. Representatives: **Paxos**, **Raft** (easier to understand, used by etcd/Consul).

***Why does idempotency matter?***

The same request produces the same result whether run once or many times. Distributed systems have retry mechanisms, and a non-idempotent interface (like a duplicate charge) causes big problems, usually deduplicated with a unique request ID.

***Byzantine fault tolerance (BFT)?***

A fault-tolerance mechanism that tolerates nodes not just "going down" but also "lying / sending malicious messages," which is what blockchains need. Most internal systems only need to tolerate crashes (non-Byzantine).

# MLOps

***What is MLOps?***

Applying DevOps practices to the machine-learning lifecycle: automating and versioning data processing, training, evaluation, deployment, and monitoring, so models can go live reliably and reproducibly and keep iterating.

***What does an ML pipeline add over ordinary CI/CD?***

Two more changing artifacts: **data and models**. You need data version control (DVC), feature engineering, model training and evaluation, a Model Registry, and **model monitoring** after deployment.

***What is model drift / data drift?***

Online data distribution diverges over time from the training distribution (data drift), degrading model performance (model/concept drift). You need to monitor metrics and retrain when drift occurs.

***Common ways to deploy a model?***

Wrap it as a REST/gRPC service (FastAPI, TF Serving, TorchServe), batch inference, or edge deployment. Pair with A/B testing or shadow deployment to validate a new model.

# Hardware

***A few key CPU concepts?***

Core count, threads (hyperthreading), clock speed (GHz), cache (L1/L2/L3), architecture (x86 / ARM). More cores suit parallel work, higher clock suits single-threaded work.

***Difference between BIOS and UEFI?***

Both are boot firmware. UEFI is the modern replacement for BIOS: it supports >2TB disks (GPT), boots faster, and has a graphical interface and Secure Boot.

***Common RAID levels?***

- **RAID 0**: striping, fast but no fault tolerance (one dies, all lost)
- **RAID 1**: mirroring, fault-tolerant but halves capacity
- **RAID 5**: distributed parity, at least 3 disks, tolerates 1 failure
- **RAID 10**: 1+0, balancing performance and fault tolerance

***SSD vs HDD?***

SSD has no mechanical parts, fast random access, shock-resistant; HDD is cheaper with a lower cost per unit capacity. Put databases/caches on SSD, cold data/backups on HDD.

# Misc

***Which HTTP methods are idempotent?***

GET, PUT, DELETE are idempotent (repeated calls give the same result); POST is non-idempotent (creates duplicates). Keep this in mind when designing APIs and retry mechanisms.

***The three pillars of observability?***

**Metrics** (numeric indicators, Prometheus), **Logs** (event logs, ELK/Loki), **Traces** (distributed tracing, Jaeger/OpenTelemetry). (See also: [Prometheus + Grafana on Proxmox](/en/posts/a6822388.html))

***Difference between an L4 and an L7 load balancer?***

- **L4** (transport layer): forwards based on IP/Port, fast, unaware of application content.
- **L7** (application layer): routes intelligently based on HTTP header/path/cookie (e.g. path-based routing, TLS termination).

***Blue-green / rolling / canary deployment in one line each?***

Blue-green = switch the whole batch, rolling = replace batch by batch, canary = route a small portion of traffic first to test the waters.
