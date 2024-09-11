---
title:  實作 Proxmox VE VM 的 Live Migrations | PVE 系列-1 
tags:
  - Proxmox VE
  - Virtual Machine
  - Infrastructure
categories: 實作紀錄
aside: true
abbrlink: c5581068
date: 2024-09-11 16:16:15
cover: /img/PVE/cover.jpg
---

<!-- # Proxmox VE 介紹

# 檢查 Wake On Lan (WOL) 設定

# 腳本測試 Migration

---
Part3

# High Availability (HA)

# 設定 HA Group -->


# Proxmox VE 介紹

**Proxmox VE(PVE) 是一個開源的虛擬化環境**，能夠同時支援基於 LXC (Linux Container) 的容器，抑或是基於Kernel 的VM，即為 [**KVM**](https://zh.wikipedia.org/wiki/%E5%9F%BA%E4%BA%8E%E5%86%85%E6%A0%B8%E7%9A%84%E8%99%9A%E6%8B%9F%E6%9C%BA)，也就是將 Linux Kernel 作為 Hypervisor 的虛擬化技術。

![](/img/PVE/Single_PVE.png)

而 Proxmox 也透過介於 Host 與 Guest 的 [QEMU](https://zh.wikipedia.org/wiki/QEMU) 去處理 Guest 的硬體請求，將其轉譯給真正的硬體，搭配KVM 一起運作可帶來指令處理效能上的提升。因此可以以近乎本地環境的速度來去進行虛擬化。


# 實體節點設定

## Proxmox VE images 燒錄

![](/img/PVE/image.png)

這裡準備好 USB　將 Proxmox VE 的 iso image 放置其中，我選擇  **Proxmox VE 7.4 ISO Installer**


> PVE Image [官網下載處](https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso)

接著就是要準備節點，並且在個別主機上調整開機順序，進到 BIOS 後將 USB 調整成第一順位，**接著可以順便檢查一下BIOS 中的 KVM 有沒有 Enable，一定要先去 Enable**。我的環境下，可在 BIOS 設定中的 Advanced 中找到 **Intel Virtualization Technology** ，接著就 Enable


![](/img/PVE/bios.jpeg)

之後正常開機後就會跳安裝導覽，就依序進行安裝就好。安裝完畢後透過網頁登入架設的節點後。就可以來建立 Cluster 了~

# 建立 Clusters

## 確認節點資訊
目前有兩個節點，在建立 Cluster 之前會需要確認一下 **/etc/hosts**

```
節點 1
172.25.166.68 pve.oplab.io pve
節點 2
172.25.166.42 pve2.oplab.io pve2
```

## 開始建立

首先進到節點1 **Datacenter** 的找到 **Cluster** 後就選擇 Create Cluster

![](/img/PVE/cluster1.png)

接著幫 Cluster 取名，這裡叫做 `LabCluster`，並且選擇你的 Cluster Network，接著按下 Create。

![](/img/PVE/cluster2.png)

建立完成後的畫面會是這樣，可以看到節點 1 `pve` 被加入 cluster 當中。

![](/img/PVE/cluster3.png)

接著我們必須將其他節點 Join 到這個 Cluster 當中。可以在 **Cluster** 當中找到 **Join Information** 可以先將這 show 出來的資訊複製起來。

![](/img/PVE/join.png)

![](/img/PVE/join2.png)

接著就會需要到第二個節點 `pve2` (我這裡是另一台主機) 來去加入 Cluster，這裡一樣在 **Cluster** 中找到 **Join Information**，接著填入剛才複製的 join 資訊。 **加入完畢後，就可以在兩台節點都看見彼此了。**

![](/img/PVE/view1.png)

![](/img/PVE/view2.png)

接著如果這時候心急去建立一個VM 然後就以為能 migrate 那就錯了，這時候你的 backup 節點就會因為找不到你VM 的 Config file 而報錯，像下面這樣

![](/img/PVE/fail.png)

沒錯，要能夠進行 Migration 還有兩個條件：
-  VM Config file 要在節點間 Shared 或者是更完整一點， **VM Disk 要能夠 Shared**
-  **另外還有一點，用於建立VM 的 iso image 也要是 shared 的**

> 為了實現這兩項目的，就必須要能夠有 shared storage 的 solution

# Ceph 介紹

> Ceph的儲存叢集（Ceph Storage Cluster），又稱為`RADOS`（**R**eliable, **A**utonomic **D**istributed **O**bject **S**tore）它提供了一個可靠、能自我管理的分散式物件儲存區。採C++開發，這個叢集是居於Ceph架構底層的軟體儲存系統，整個環境的資料都放在這裡，具有自我修復與管理的能力，並且是以自動運作的OSD儲存節點，以及輕量的Monitor監控程式組成。

## Ceph 的元件
- Ceph OSDs
    - Ceph 的daemon (`ceph-osd`)
    - 用於儲存資料，處理資料複製、恢復等
    - 通過檢查 ceph-osd 的 heartbeat 來向 Ceph Monitor 提供監控資訊
    - **對於高可用性(High Availiablity, HA)  以及 冗餘(Redundancy) 目的:  至少需要 3 個 Ceph OSDs**
- Monitors
    - `ceph-mon`
    - 維護展示集群狀態的圖表，包含監視圖、OSD圖
    - 負責管理 daemon 和 client 之間的身份驗證
    - **對於高可用性(High Availiablity, HA)  以及 冗餘(Redundancy) 目的:  至少需要 3 個 Ceph Monitors**
- Managers
    - `ceph-mgr`
    - 負責跟蹤 runtime 指標和 Ceph Cluster 當前狀態 Ex. 儲存利用率、當前系統負載
    -  **對於高可用性(High Availiablity, HA)  以及 冗餘(Redundancy) 目的:  至少需要 2 個 Ceph Managers**
- MDSs:
    - Ceph Metadata Server (Ceph MDS) 為Ceph 檔案系統儲存 metadata
        - 也就是說 如果是Ceph block device, Ceph object storage 則不使用 MDS
    -  **如果要建立 Ceph Filesystem (Cephfs)，也需要事先建立 MSD**
    - Ceph MDS 使 POSIX 文件系統使用者可在不對 Ceph 儲存 cluster 造成負擔的狀況下執行像是 `ls` 或者 `find` 命令

>  Ceph 會是一種分散式儲存系統，它的底層由多臺伺服器組成的叢集環境支撐 (也就是我們剛才架設的 PVE Cluster)。如果你需要擴充儲存空間或提升系統規模，只要再加入更多的伺服器到叢集中即可，這讓擴展變得非常簡單。在這種架構下，Ceph 有很高的可靠性，系統會自動進行修復和管理。當資料寫入時，會自動複製到多個節點上，**這樣即使某個節點出現故障，整個系統依然能正常運作，資料也不會損壞。** 這樣的設計讓 Ceph 能夠提供穩定且安全的儲存解決方案。

## 安裝 Ceph

先在每個節點中都安裝 Ceph，這裡有兩個節點，那就兩個節點都要安裝

![](/img/PVE/ceph1.png)

點選 **Start quincy installatio**  (這裡沒特別指定版本，就用它給的)

![](/img/PVE/ceph2.png)

下載過程，會提示是否繼續，就 `Y`

![](/img/PVE/ceph3.png)

完成後會接續要你指定網路介面

![](/img/PVE/ceph4.png)

安裝成功後，會提示你接下來的步驟，而我們也會照這個步驟做:

- 在每個節點都要安裝 Ceph
- 添加額外的  Ceph Monitor
- 為每個節點建立 Ceph OSD
- 建立 Ceph Pool 

![](/img/PVE/ceph5.png)

> 在其他節點重複上面的安裝流程， 一旦每個節點都安裝好後，這時候去看 Health 應該會是 warning `OSD count 0 < osd_pool_default_size 3` 這是正常的，因為還沒建立 OSD
![](/img/PVE/warn.png)

## 建立 Ceph OSD

為了建立 Ceph OSD，勢必先要有閒置的硬碟空間。所以這裡，要先在每個節點中找到硬碟進行設定。首先進入 `pve` 節點中的 **Disk**，將閒置硬碟格式化，如果沒有閒置硬碟也可以用USB外接。

![](/img/PVE/osd1.png)

接著去 **PVE** > **Ceph** > **OSD** 底下點選 **Create: OSD** 然後選擇剛剛格式化的硬碟，接著就點選 **Create**

![](/img/PVE/osd2.png)

我們在其他節點也進行一樣的步驟來安裝OSD

![](/img/PVE/osd3.png)

安裝好後，可以在兩個節點的 **OSD** 中都看到 osd 的種類跟狀態

![](/img/PVE/osd4.png)

> 另外，為了冗餘和高可用性，可以額外建立兩個 Ceph Manager (Active-Standy)

{% note info %}
根據 [這篇](https://kawsing.gitbook.io/opensystem/andoid-shou-ji/pomoxve/ceph-object-storage/ceph-xu-yao-da-liang-ji-yi-ti) 的建議:
- `ceph-osd` Process 在執行過程中會消耗CPU資源，所以一般會為每一個 `ceph-osd` 程序繫結一個CPU核上。
- `ceph-mon` Process 並不十分消耗CPU資源，所以不必為 `ceph-mon` Process預留過多的CPU資源。
- `ceph-msd` 也是非常消耗CPU資源的，所以需要提供更多的CPU資源。
- `ceph-mon` 和 `ceph-mds` 需要2G記憶體，每個 `ceph-osd` Process 需要1G記憶體，2G更好。
{% endnote %}

## 建立 Ceph Pool

Ceph Pool 會用來 Combined 不同節點之間的 OSD，這也會是我們後續 VM Disk 存放的地方。在 `pve` 節點中，我們進入 **Ceph** > **Pools**，選擇 **Create: Ceph Pool**，這裡要給定pool名稱，這裡叫它 `syncbricks-ceph`。 另外也需要指定 Pool Size，正常來說 Min.Size 最低就是2，而 Size 預設會是 3，但由於我目前只有兩台主機，因此 size 先用2。讓兩個OSD加入倒Ceph Pool。

![](/img/PVE/pool1.png)

建立好後應該會跳 warning，因為PVE預設會希望有 3個 OSD 但目前只有兩個

![](/img/PVE/pool2.png)
![](/img/PVE/pool3.png)

可以目前 online 的 OSD 有兩個，那目前為止就是正常。另外， Ceph Pool 建立好後，可以發現兩個節點底下多出了 `syncbricks-ceph`。這樣之後兩個節點就可以共享 VM Disk，以利後續的 VM Migration

![](/img/PVE/pool4.png)

![](/img/PVE/pool5.png)

## 建立 Ceph File System

![](/img/PVE/cephfs.svg)


> **Ceph File System (CephFS)** 是一個符合 POSIX 標準的檔案系統，構建在 **Ceph 分散式物件存儲系統 RADOS** 之上。CephFS 的目標是為各種應用提供高可用且具高效能的檔案儲存 Solution，可用於高效能計算 (HPC) 暫存區，以及分散式工作流程的共享存儲

> CephFS 的架構上，檔案的 metadata 被儲存在獨立於檔案資料的 RADOS 資料池中，並透過可彈性擴展的 MDS Cluster 提供服務，這樣就可以支援更高吞吐量的 workload。client **可以直接存取 RADOS 讀寫檔案資料區塊**，從而使 workload 能夠隨著底層 RADOS 物件存儲的規模來進行線性擴展，這個過程也不需要任何 gateway 或 agent 來中介資料 I/O

> 資料的存取由 MDS Cluster 負責協調，這些 MDS 管理分散式的 metadata cache，client端會和 MDS 會一起維護metadata的狀態。MDS 將metadata變更整合後，高效寫入 RADOS 的日誌中，不會在本地儲存任何metadata。這種設計讓客戶端在 POSIX 檔案系統下能快速且一致地協作

介紹結束後就開始繼續實作，到目前為止，已經處理好共享 VM 硬碟的方式，接著要進行 VM ISO Image 的共享，如果沒有進行共享，後續再進行 migration 就會跳出下面的錯誤訊息， `Can't migrate VM with local CD/DVD` 這就代表需要用 shared 的方式進行

![](/img/PVE/warn2.png)


> 根據[這篇](https://forum.proxmox.com/threads/ceph-mount-a-pg-pool-for-images-isos.134367/) 要能夠共享 iso image 至少需要進行下面步驟:
1. **Create Ceph File System**：
    - 確保已經創建了Ceph FS，並且有至少兩個 MDS 待命
2. **Add Ceph FS**：
    - 在節點上掛載Ceph FS，這樣所有節點都可以共享相同的ISO image

### 建立 MDS
因此我們分別為兩個節點都建立 MDS

![](/img/PVE/meta1.png)

![](/img/PVE/meta2.png)

接著我們在節點1 當中 **Create: Ceph FS**，取名為 `cephfs`。

![](/img/PVE/fs1.png)

建立好後，兩邊節點就會出現 `cephdfs` ，接著就可以上傳 iso image 到 shared file system，我這裡上傳的是 Ubuntu 22.04 Desktop 的映像檔

![](/img/PVE/fs2.png)

# 建立 VM 進行測試

這次選在 `pve` 節點中建立 Ubuntu VM，在建立過程中，在設定 **OS** 的時候，選擇 **Use CD/DVD disc image file(iso)**，然後 **Storage** 選擇剛剛建立的 Ceph 檔案系統 `cephfs`，接著 Filesystem 中想要用的 image

![](/img/PVE/vm1.png)

當建立流程進行到 **Disks** 的部分，記得要將 **Storage** 設定為剛剛建立的 `syncbricks-ceph` 

![](/img/PVE/vm2.png)

接著就是建立 VM

![](/img/PVE/vm3.png)

> 建立好後，就需要進入 VM 當中去安裝 Ubuntu，這部分就不贅述了~

# 手動測試 Migration

我們可以在 VM 建立好後，在 `pve` 底下選擇我們剛才建立的 VM，點右鍵應該可以出現 **Migration** 的選項，我們就可以手動進行 migration 了

![](/img/PVE/mi1.png)

=我們將 `VM 100` 從節點 `pve1` migrate 到節點 `pve2`，完成後可以觀察到左側的VM位置已經出現在 `pve2` 底下了，這就代表 Migration 進行成功。
 
![](/img/PVE/mi2.png)

> 到這裡都還很okay，下一步，我會想根據條件像是 CPU 使用率或者是 CPU 功耗作為條件，用腳本進行自動 migration，這個過程中也會需要從節點1 去開啟關機的節點2，這個過程中就會用到 Wake On Lan(WOL) 這個有趣的功能，這裡就留到下一篇在紀錄。

# Reference

Proxmox VE
https://ithelp.ithome.com.tw/articles/10338613
https://kawsing.gitbook.io/opensystem/andoid-shou-ji/pomoxve/jian-li-cong-ji
https://www.linuxyes.com/blog/linuxyes-3/post/proxmox-ve-replication-ha-9
https://blog.tenyi.com/2020/01/proxmox-ve-two-nodes-ha-cluster.html
https://medium.com/彼得潘的-swift-ios-app-開發教室/工控機安裝proxmox-ve-pve-94a09647d95f


Ceph
https://www.linuxtek.ca/2023/01/27/ceph-clustering-with-proxmox/
https://kawsing.gitbook.io/opensystem/andoid-shou-ji/pomoxve/ceph-object-storage
https://kawsing.gitbook.io/opensystem/andoid-shou-ji/pomoxve/ceph-object-storage/ceph-xu-yao-da-liang-ji-yi-ti
https://www.youtube.com/watch?v=7BcSnUz_2zQ
https://forum.proxmox.com/threads/ceph-mount-a-pg-pool-for-images-isos.134367/