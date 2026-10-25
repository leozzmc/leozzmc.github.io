---
title: DevOps技能樹知識整理 |【筆記目錄】
tags:
  - DevOps
  - Linux
  - Networking
  - AWS
categories: 學習筆記
aside: true
toc: true
cover: /img/devops/cover3.jpg
abbrlink: dce71546
date: 2060-11-05 21:45:50
---

> 🌐 English version: [English](/en/posts/dce71546.html)


# 前言

這裡紀錄 DevOps 面試常見的知識點，主要是參考了這個 [github repository: DevOps Exercises](https://github.com/bregman-arie/devops-exercises) 和 [ByteByteGo 的 GitHub Repo](https://github.com/ByteByteGoHq/system-design-101) 所做的筆記整理

> 可能會花很久時間才能夠全部整理完成~

# DevOps General

***什麼是 DevOps?***

DevOps 是一種結合開發（Dev）與維運（Ops）的文化與實踐，目標是縮短軟體交付週期、提高發布頻率，同時維持系統穩定。核心精神是**自動化**、**持續回饋**與**跨團隊協作**。

***DevOps 的幾個核心實踐?***

- **CI/CD**：持續整合與持續交付／部署
- **IaC（Infrastructure as Code）**：用程式碼管理基礎設施（Terraform、CloudFormation）
- **監控與可觀測性（Observability）**：Metrics、Logs、Traces
- **自動化測試**
- **版本控制**（所有東西都進 Git，包含設定與基礎設施）

***什麼是 CALMS?***

衡量一個組織 DevOps 成熟度的框架：**C**ulture（文化）、**A**utomation（自動化）、**L**ean（精實）、**M**easurement（量測）、**S**haring（分享）。

***SRE 跟 DevOps 有什麼關係?***

SRE（Site Reliability Engineering）可以看成是 DevOps 的一種具體實作，用軟體工程的方法來解決維運問題，核心概念像是 **SLI/SLO/SLA**、**Error Budget**、**消除重複勞動（toil）**。

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

> 文章： [Python for DevOps |【DevOps技能樹】](/posts/70fcdd32.html)（這個章節已獨立成文，詳見連結）

# Networking

***OSI 七層模型是哪七層?***

實體層 → 資料連結層 → 網路層 → 傳輸層 → 會議層 → 表達層 → 應用層。常用記法：由下往上對應到「網路線 → MAC/交換器 → IP/路由器 → TCP/UDP → …」。實務上更常用 TCP/IP 四層模型（Link、Internet、Transport、Application）。

***TCP 跟 UDP 差在哪?***

- **TCP**：連線導向、可靠（三次握手、ACK、重傳、流量控制、壅塞控制），有序。用於 HTTP、SSH、檔案傳輸。
- **UDP**：無連線、不保證送達、不保證順序，但延遲低、負擔小。用於 DNS、影音串流、遊戲、VoIP。

***什麼是 CIDR?***

無類別定址（Classless Inter-Domain Routing），用 `IP/前綴長度` 表示網段，例如 `10.0.0.0/16` 代表前 16 位是網路位址，可容納 `2^(32-16)-2` 個主機位址。`/24` = 256 個位址（254 個可用）。

***ARP 在做什麼?***

Address Resolution Protocol，把**IP 位址解析成 MAC 位址**。同一個區網內，主機要送封包給某個 IP，會先廣播 ARP 問「誰是這個 IP？」，對方回自己的 MAC。`arp -a` 可查看 ARP 快取表。

***NAT 是什麼?***

Network Address Translation，把私有 IP 轉換成公有 IP（反之亦然），讓多台內網機器共用一個公有 IP 出外網。常見於家用路由器、雲端的 NAT Gateway。

***DNS 查詢流程?***

瀏覽器 → 本地快取 → 遞迴 DNS（如 8.8.8.8）→ Root → TLD（.tw）→ 權威 DNS，一層層解析出 IP。遞迴伺服器自己不存紀錄，而是幫你一路問到權威伺服器。常見紀錄：A（IPv4）、AAAA（IPv6）、CNAME（別名）、MX（郵件）、NS（名稱伺服器）、TXT。

***ICMP 的用途?***

網路層的控制與錯誤回報協定，`ping`（Echo Request/Reply）跟 `traceroute` 都是基於 ICMP。

***DHCP 流程（DORA）?***

**D**iscover → **O**ffer → **R**equest → **A**ck，client 廣播尋找 DHCP server，server 提供 IP 租約。

***VLAN 跟 SDN?***

- **VLAN**：在同一台實體交換器上切出邏輯上隔離的廣播網域。
- **SDN（Software-Defined Networking）**：把網路的控制平面（決策）與資料平面（轉發）分離，用軟體集中控制，OpenFlow 是代表協定。

# Linux

***Linux 檔案系統階層標準（FHS）幾個重點目錄?***

`/etc`（設定檔）、`/var`（可變資料，如 log）、`/usr`（使用者程式）、`/home`（使用者家目錄）、`/bin` `/sbin`（執行檔）、`/proc` `/sys`（核心虛擬檔案系統）、`/dev`（裝置檔）、`/tmp`（暫存）。

***Linux 權限 755 / 644 代表什麼?***

每位數是 rwx 的八進位：r=4、w=2、x=1。`755` = owner rwx、group r-x、other r-x（常用於目錄或執行檔）；`644` = owner rw-、其餘唯讀（常用於一般檔案）。特殊權限：SUID、SGID、Sticky bit。

***I/O 重導向常見用法?***

```bash
cmd > file      # stdout 覆寫
cmd >> file     # stdout 附加
cmd 2> file     # stderr
cmd > file 2>&1 # stdout+stderr 都導到 file
cmd1 | cmd2     # pipe，前者 stdout 當後者 stdin
```

***systemd 常用指令?***

```bash
systemctl status/start/stop/restart/enable <service>
systemctl list-units --type=service
journalctl -u <service> -f   # 看服務日誌
```
systemd 是現代 Linux 的 init 系統（PID 1），管理服務、掛載、開機流程。

***開機流程（大致）?***

BIOS/UEFI → Bootloader（GRUB）→ 載入 Kernel → 掛載 initramfs/initrd → 執行 init（systemd, PID 1）→ 啟動各 target/service → 登入。（延伸：[initrd 與 initramfs 差異](/posts/ad71f05.html)）

***效能分析常用工具?***

- CPU/整體：`top`、`htop`、`vmstat`、`mpstat`
- 記憶體：`free -m`、`/proc/meminfo`
- 磁碟 I/O：`iostat`、`iotop`
- 網路：`ss`、`netstat`、`iftop`、`tcpdump`
- 綜合：`dstat`、`sar`

***什麼是 OOM Killer?***

當系統記憶體耗盡，核心會依 `oom_score` 挑一個行程 kill 掉以釋放記憶體。日誌在 `/var/log/messages` 或 `dmesg`。可透過 `/proc/<pid>/oom_score_adj` 調整某行程被挑中的機率。

# Shell Scripting

***Shebang 是什麼?***

腳本第一行 `#!/bin/bash`，告訴系統用哪個直譯器執行。

***`$?`、`$#`、`$@`、`$0` 分別是?***

`$?` 上一個指令的回傳碼（0=成功）、`$#` 參數個數、`$@` 所有參數、`$0` 腳本名稱、`$1..$n` 第 n 個參數。

***`[ ]` 跟 `[[ ]]` 差別?***

`[ ]` 是 POSIX test，`[[ ]]` 是 bash 擴充，支援 `&&`、`||`、正則 `=~`、不需對變數加引號也較安全。

***常見範例?***

```bash
#!/bin/bash
set -euo pipefail   # 遇錯即停、未定義變數報錯、pipe 任一失敗即失敗

for f in *.log; do
  [ -f "$f" ] || continue
  echo "processing $f"
done

if grep -q "ERROR" app.log; then
  echo "found error"
fi
```

***`set -e`、`set -u`、`set -o pipefail` 作用?***

防呆三件套：`-e` 指令失敗就中止、`-u` 用到未定義變數報錯、`pipefail` 讓 pipeline 中任一指令失敗整條就算失敗。寫正式腳本強烈建議開。

# Security

***最小權限原則（Least Privilege）?***

每個使用者／服務／程式只授予完成任務所需的最小權限，降低被攻破後的影響範圍。

***對稱 vs 非對稱加密?***

- **對稱**：加解密用同一把金鑰（AES），快，但金鑰交換是難題。
- **非對稱**：公鑰加密、私鑰解密（RSA、ECC），解決金鑰交換，但慢。實務上常混用：用非對稱交換一把對稱金鑰，之後用對稱加密傳資料（TLS 就是這樣）。

***Hashing 跟加密差在哪?***

Hash 是**單向**、不可逆（SHA-256），用於驗證完整性或存密碼（要加 salt）；加密是**可逆**的，用於保密。

***常見的 Web 攻擊?***

SQL Injection、XSS（跨站腳本）、CSRF（跨站請求偽造）、SSRF、路徑穿越、命令注入。防禦：參數化查詢、輸入驗證、輸出編碼、CSP、最小權限。

***Secrets 要怎麼管理?***

不要寫死在程式碼或 commit 進 Git。用專用的 secrets 管理服務（AWS Secrets Manager、HashiCorp Vault、K8s Secret 搭配 encryption at rest），並用 RBAC 限制存取、定期輪替。

***什麼是縱深防禦（Defense in Depth）?***

不依賴單一防線，而是多層防護（網路 ACL、防火牆、WAF、主機強化、應用層驗證、加密），任何一層被突破還有下一層。

# Certificates

***TLS 憑證是什麼?***

由憑證授權機構（CA）簽發，綁定「公鑰 ↔ 網域」的數位文件，用來驗證伺服器身分並建立加密連線。瀏覽器信任的是根 CA，透過**憑證鏈**往下驗證。

***TLS 握手大致流程?***

ClientHello（支援的 TLS 版本、密碼套件、random）→ ServerHello（選定套件、憑證、random）→ 驗證憑證 → 交換／協商出工作階段金鑰 → 之後用對稱加密傳資料。（延伸：這份筆記的 DMS Troubleshooting 有更細的握手說明）

***自簽憑證跟 CA 簽發差在哪?***

自簽憑證沒有受信任 CA 背書，瀏覽器會警告，適合內網測試；正式服務要用受信任 CA（可用免費的 Let's Encrypt）。

***憑證過期怎麼辦?***

重新簽發／續簽。正式環境建議用 **cert-manager**（K8s）或 **certbot**（Let's Encrypt）自動續簽，避免忘記。

# Git
- git commands 
- branch
- merge
- rebase
- git internal principals
- troubleshooting

> 文章: [Git for DevOps 筆記 |【DevOps技能樹】](/posts/22911275.html)（這個章節已獨立成文，詳見連結）

# CI/CD

***CI 跟 CD 差在哪?***

- **CI（Continuous Integration）**：開發者頻繁把程式碼合併進主線，每次合併都自動建置與測試，盡早發現整合問題。
- **CD**：可指 Continuous **Delivery**（自動化到「可隨時部署」的狀態，部署按一下按鈕）或 Continuous **Deployment**（連按鈕都省了，通過測試就自動上生產）。

***一條典型的 Pipeline 階段?***

`checkout → build → unit test → 靜態分析/掃描 → 打包 image → push registry → 部署到 staging → 整合/E2E 測試 → 部署到 production`。

***藍綠部署 vs 金絲雀部署?***

- **Blue-Green**：同時維護兩套環境，切流量一次全切，出事可瞬間切回。
- **Canary**：先放一小部分流量到新版本，觀察指標沒問題再逐步放大。

***常見 CI/CD 工具?***

Jenkins、GitHub Actions、GitLab CI、CircleCI、Drone、Argo CD（GitOps 式的 K8s 持續部署）。

***什麼是 GitOps?***

把「期望的系統狀態」宣告在 Git 裡，用工具（Argo CD、Flux）持續把實際狀態收斂到 Git 中的宣告。Git 成為單一真實來源，部署＝改 Git。

# Container

***容器跟虛擬機差在哪?***

VM 虛擬化整個硬體、各自跑一套 OS kernel，隔離強但重；容器共享 host 的 kernel，只打包應用與其相依，啟動快、輕量、密度高。

***Image 跟 Container 的關係?***

Image 是唯讀的範本（分層），Container 是 image 執行起來的實例（在 image 上疊一層可寫層）。

***Docker 的分層（layer）有什麼好處?***

每個 Dockerfile 指令是一層，層可被快取與多個 image 共享，所以改一行只需重建後面的層，也省儲存與傳輸。

***Container 的狀態有哪些?***

created、running、paused、stopped/exited、removed。

***Docker 網路模式?***

- `bridge`（預設，單機內建虛擬網橋）
- `host`（直接用主機網路，不隔離）
- `none`（無網路）
- `overlay`（跨主機，用於 Swarm/K8s）

***什麼是 OCI?***

Open Container Initiative，制定容器的開放標準（image spec、runtime spec），讓 Docker、containerd、Podman 等能互通。

***Dockerfile 最佳化幾個重點?***

多階段建置（multi-stage build）縮小 image、善用 layer cache、把變動頻繁的指令放後面、用小的 base image（alpine/distroless）、`.dockerignore` 排除不必要檔案、不要以 root 執行。

# Kubernetes

這個章節已經獨立成一篇完整文章，涵蓋 Cluster 架構、Pod、Deployment、Service、Ingress、StatefulSet、Storage、Networking、RBAC、Helm、Security 等：

> 文章：[Kubernetes for DevOps 筆記 |【DevOps技能樹】](/posts/c7f5f41c.html)

# Cloud General

***IaaS / PaaS / SaaS 差在哪?***

責任分界由多到少：**IaaS**（租硬體/VM，如 EC2，自己管 OS 以上）→ **PaaS**（租平台，如 App Engine、RDS，自己只管程式與資料）→ **SaaS**（直接用軟體，如 Gmail）。

***公有雲的共同責任模型（Shared Responsibility）?***

雲商負責「雲本身的安全」（實體機房、底層硬體、虛擬化層），客戶負責「雲中的安全」（作業系統更新、應用、資料、IAM 設定、網路規則）。

***水平擴展 vs 垂直擴展?***

- **垂直（Scale Up）**：把單台機器加大（更多 CPU/RAM），有上限、有單點風險。
- **水平（Scale Out）**：加更多台機器分擔負載，雲端主流做法，搭配負載平衡器。

***Region 跟 AZ?***

Region 是地理區域（如 us-east-1），一個 Region 內有多個互相隔離、獨立供電/網路的 AZ（可用區），跨 AZ 部署可達高可用。

# Virtualization

***Hypervisor Type 1 跟 Type 2?***

- **Type 1（裸機）**：直接跑在硬體上（VMware ESXi、Xen、KVM 嚴格說是混合型），效能好，用於資料中心。
- **Type 2（寄居）**：跑在主機 OS 之上（VirtualBox、VMware Workstation），方便，用於桌面。

***KVM 是什麼?***

Kernel-based Virtual Machine，把 Linux 核心變成 hypervisor 的虛擬化技術，常搭配 QEMU 處理硬體模擬。（延伸：[Proxmox VE 系列](/posts/c5581068.html) 就是用 KVM + LXC）

***VM 跟容器可以一起用嗎?***

可以也很常見：在雲端 VM 裡跑 K8s 節點，節點上再跑容器，兼顧強隔離（VM 層）與輕量部署（容器層）。

# AWS
- Regions & AZs
- IAM / VPC / EC2 / ELB / Auto-Scaling / S3 / Route53 / Lambda / API Gateway / SNS / SQS / MQ / CloudFormation / ECS / EKS / Fargate ...

> 文章: [AWS for DevOps 筆記 |【DevOps技能樹】](/posts/100cc6b6.html)（這個章節已獨立成文，詳見連結）

# Terraform

***什麼是 Terraform? 跟 CloudFormation 差在哪?***

Terraform 是 HashiCorp 的 **IaC（基礎設施即程式碼）** 工具，用宣告式的 HCL 描述基礎設施，支援多雲（AWS/GCP/Azure…）；CloudFormation 只限 AWS。

***Terraform 的核心流程?***

```bash
terraform init      # 初始化、下載 provider
terraform plan      # 預覽會做哪些變更
terraform apply     # 實際套用
terraform destroy   # 拆掉
```

***什麼是 state 檔? 為什麼重要?***

`terraform.tfstate` 記錄 Terraform 管理的資源實際狀態，用來比對期望與現狀。團隊協作一定要用**遠端 state**（S3 + DynamoDB lock、Terraform Cloud），避免多人同時改造成衝突或覆蓋。

***Module 的用途?***

把一組可重用的資源打包成 module，參數化後在不同環境（dev/staging/prod）重複使用，等同 IaC 的函式。

***`plan` 跟 `apply` 差在哪?***

`plan` 只計算並顯示差異（唯讀、安全）；`apply` 才真的建立/修改/刪除資源。正式流程通常在 CI 先跑 plan 給人審核，核准後才 apply。

# System Design

***設計系統要考量哪些面向?***

可擴展性（Scalability）、可用性（Availability）、可靠性（Reliability）、延遲（Latency）、一致性（Consistency）、成本、可維運性。通常從需求（QPS、資料量、讀寫比）估算，再決定架構。

***水平擴展的常見元件?***

負載平衡器（LB）、無狀態的應用層（方便 scale out）、快取（Redis/CDN）、資料庫讀寫分離與分片（sharding）、訊息佇列（削峰、解耦）。

***快取常見策略與問題?***

Cache-Aside、Write-Through、Write-Back。要注意快取穿透、快取雪崩、快取擊穿，以及失效策略（TTL、LRU）。

***如何提高可用性?***

消除單點（SPOF）、跨 AZ/Region 冗餘、健康檢查 + 自動故障轉移、重試與斷路器（circuit breaker）、限流與降級。

***CDN 的作用?***

把靜態內容快取到離使用者近的邊緣節點，降低延遲與源站負載。

# Distributed System

***CAP 定理?***

分散式系統在**一致性（C）**、**可用性（A）**、**分區容錯（P）** 三者中，網路分區發生時只能三取二。由於分區無法避免（P 必選），實務上是在 C 跟 A 之間取捨（CP 或 AP）。

***什麼是最終一致性（Eventual Consistency）?***

不保證每次讀到最新值，但在沒有新寫入後，最終所有副本會收斂到一致。許多高可用系統（DynamoDB、DNS）採用。

***共識演算法（Consensus）?***

讓多個節點對某個值達成一致，即使有節點故障。代表：**Paxos**、**Raft**（較易懂，etcd/Consul 用它）。

***冪等性（Idempotency）為什麼重要?***

同一個請求執行一次或多次結果相同。分散式系統有重試機制，介面若非冪等（如重複扣款）會出大問題，常用唯一請求 ID 去重。

***拜占庭容錯（BFT）?***

能容忍節點不只「掛掉」還會「說謊／發送惡意訊息」的容錯機制，區塊鏈即屬此類。一般內部系統多半只需容忍 crash（非拜占庭）。

# MLOps

***什麼是 MLOps?***

把 DevOps 的實踐套用到機器學習生命週期：資料處理、訓練、評估、部署、監控的自動化與版本化，讓模型能可靠、可重現地上線並持續迭代。

***ML pipeline 跟一般 CI/CD 多了什麼?***

多了**資料與模型**這兩個會變動的產物：需要資料版本控制（DVC）、特徵工程、模型訓練與評估、模型註冊（Model Registry），以及部署後的**模型監控**。

***什麼是 model drift / data drift?***

線上資料分布隨時間偏離訓練時的分布（data drift），導致模型表現下滑（model/concept drift）。需監控指標並在偏移時重新訓練。

***部署模型的常見方式?***

包成 REST/gRPC 服務（FastAPI、TF Serving、TorchServe）、批次推論、或邊緣部署。可搭配 A/B 測試或影子部署驗證新模型。

# Hardware

***CPU 幾個關鍵概念?***

核心數（core）、執行緒（thread，超執行緒）、時脈（GHz）、快取（L1/L2/L3）、架構（x86 / ARM）。多核適合平行工作，高時脈適合單執行緒。

***BIOS 跟 UEFI 差在哪?***

都是開機韌體。UEFI 是 BIOS 的現代替代：支援 >2TB 磁碟（GPT）、開機更快、有圖形介面與安全開機（Secure Boot）。

***RAID 常見等級?***

- **RAID 0**：條帶化，快但無容錯（一顆壞全毀）
- **RAID 1**：鏡像，容錯但容量減半
- **RAID 5**：分散式同位，至少 3 顆，容忍壞 1 顆
- **RAID 10**：1+0，兼顧效能與容錯

***SSD 跟 HDD?***

SSD 無機械結構、隨機存取快、耐震；HDD 便宜、單位容量成本低。資料庫/快取放 SSD，冷資料/備份放 HDD。

# Misc

***什麼是冪等（Idempotent）的 HTTP 方法?***

GET、PUT、DELETE 是冪等（重複呼叫結果相同）；POST 非冪等（會重複建立）。設計 API 與重試機制時要留意。

***常用的可觀測性三支柱（Observability）?***

**Metrics**（數值指標，Prometheus）、**Logs**（事件日誌，ELK/Loki）、**Traces**（分散式追蹤，Jaeger/OpenTelemetry）。（延伸：[Proxmox 上架 Prometheus + Grafana](/posts/a6822388.html)）

***Load Balancer 的 L4 跟 L7 差在哪?***

- **L4**（傳輸層）：看 IP/Port 做轉發，快、不懂應用內容。
- **L7**（應用層）：看 HTTP header/path/cookie 做智慧路由（如依路徑分流、TLS 終止）。

***藍綠 / 滾動 / 金絲雀部署一句話總結?***

藍綠＝整批切換、滾動＝逐批替換、金絲雀＝先放一小部分流量試水溫。
