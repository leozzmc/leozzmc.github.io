---
title: 手動 migration 的其他方式 | PVE 系列-3
tags:
  - Proxmox VE
  - Virtual Machine
  - Infrastructure
categories: 實作紀錄
aside: true
cover: /img/PVE/cover.jpg
abbrlink: bd2c9140
date: 2024-09-22 14:24:48
---

# 前言

在 [**PVE 系列文章的第一篇**](https://leozzmc.github.io/posts/c5581068.html) 有示範在PVE的控制台上面進行 migration，而這裡紀錄另一種可以進行 Migration 的方式

# 手動 Migration

可以選擇先進入節點的 shell，接著進入 `/etc/pve/nodes` 目錄中，可以發現底下有相同cluster的所有節點

```
root@pve:/etc/pve/nodes# ls -l
total 0
drwxr-xr-x 2 root www-data 0 Sep 10 11:06 pve
drwxr-xr-x 2 root www-data 0 Sep 10 14:21 pve2
```
接著進入目標節點 `pve2`，會發現裏頭有許多目錄，這裡跟 migration 有關的目錄會是 `lxc` 以及 `qemu-server` 這取決與你要 migrate 的是容器還是VM，如果要mirgate 容器就將 `lxc` 底下的設定檔移到目標節點的相同路徑底下，例如 `/etc/pve/nodes/pve/lxc/`。同理要移植 VM 也是，**將 `qemu-server` 底下的設定檔移動到 `/etc/pve/nodes/pve/qemu-server/` 底下。**

```
root@pve:/etc/pve/nodes/pve2# ls -l
total 2
-rw-r----- 1 root www-data  102 Sep 11 14:09 config
-rw-r----- 1 root www-data   83 Sep 22 14:40 lrm_status
drwxr-xr-x 2 root www-data    0 Sep 10 11:06 lxc
drwxr-xr-x 2 root www-data    0 Sep 10 11:06 openvz
drwx------ 2 root www-data    0 Sep 10 11:06 priv
-rw-r----- 1 root www-data 1675 Sep 10 11:06 pve-ssl.key
-rw-r----- 1 root www-data 1688 Sep 10 11:06 pve-ssl.pem
drwxr-xr-x 2 root www-data    0 Sep 10 11:06 qemu-server
```

由於我們要移植的是VM，因此進入 `qemu-server/` 底下，可以發現有兩台 VM

```
root@pve2:/etc/pve/nodes/pve2/qemu-server# ls -l
total 1
-rw-r----- 1 root www-data 451 Sep 22 14:47 101.conf
-rw-r----- 1 root www-data 456 Sep 22 14:11 102.conf
```

我們選擇移植 `VM 101`，那就把 `101.conf` 移動到另一個節點 `pve` 的對應目錄當中

```
mv 101.conf ../../pve/qemu-server/
```

接著我們可以去 `pve` 節點中查看

```
root@pve:/etc/pve/nodes/pve/qemu-server# ls -l
total 1
-rw-r----- 1 root www-data 452 Sep 22 14:11 100.conf
-rw-r----- 1 root www-data 451 Sep 22 14:51 101.conf
```

確定移動完成後，接著查看一下 VM 的狀態

```
qm list
```
會發現 `VM 101` 狀態是停止的，之後可以指令啟用VM


```
qm start 101
```

![](/img/PVE/qemu.png)

VM 移動完成，並啟用成功，順利運行~

# Migration with local storage

在 PVE 中，其實也可以透過現成命令來讓具有Local Disk的 VM 進行線上移轉:

```
qm migrate <vmid> <targetnode> --with-local-disks --online
```
但實際測量後發現會耗費將近40分鐘時間進行移轉，並且僅僅只是一個 256GB Ubuntu VM

![](/img/PVE/local.png)


# 結語

> 這篇只是用來記錄可以用移動設定檔的方式來進行 migration