---
title: "Other Ways to Do Manual Migration | PVE Series 3"
tags:
  - Proxmox VE
  - Virtual Machine
  - Infrastructure
categories: Hands-On Practices
aside: true
cover: /img/PVE/cover.jpg
abbrlink: "bd2c9140"
date: 2024-09-22 14:24:48
---

> 🌐 中文版：[繁體中文](/posts/bd2c9140.html)

# Preface

In the [first post of the PVE series](/en/posts/c5581068.html), I demonstrated migration from the PVE console. Here I record another way to do migration.

# Manual migration

You can first enter a node's shell, then go to the `/etc/pve/nodes` directory, where you'll find all the nodes in the same cluster.

```
root@pve:/etc/pve/nodes# ls -l
total 0
drwxr-xr-x 2 root www-data 0 Sep 10 11:06 pve
drwxr-xr-x 2 root www-data 0 Sep 10 14:21 pve2
```
Then enter the target node `pve2`, where you'll find many directories. The ones related to migration are `lxc` and `qemu-server`, depending on whether you're migrating a container or a VM. To migrate a container, move the config file under `lxc` to the same path on the target node, e.g. `/etc/pve/nodes/pve/lxc/`. Likewise for a VM: **move the config file under `qemu-server` to `/etc/pve/nodes/pve/qemu-server/`.**

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

Since we're migrating a VM, enter `qemu-server/`, where you'll find two VMs.

```
root@pve2:/etc/pve/nodes/pve2/qemu-server# ls -l
total 1
-rw-r----- 1 root www-data 451 Sep 22 14:47 101.conf
-rw-r----- 1 root www-data 456 Sep 22 14:11 102.conf
```

We choose to migrate `VM 101`, so move `101.conf` to the corresponding directory on the other node `pve`.

```
mv 101.conf ../../pve/qemu-server/
```

Then check on the `pve` node.

```
root@pve:/etc/pve/nodes/pve/qemu-server# ls -l
total 1
-rw-r----- 1 root www-data 452 Sep 22 14:11 100.conf
-rw-r----- 1 root www-data 451 Sep 22 14:51 101.conf
```

After confirming the move is done, check the VM's status.

```
qm list
```
You'll find `VM 101` is stopped; then start it with a command.

```
qm start 101
```

![](/img/PVE/qemu.png)

The VM has moved and started successfully, running smoothly.

# Migration with local storage

In PVE, you can also use a ready-made command to online-migrate a VM with a local disk:

```
qm migrate <vmid> <targetnode> --with-local-disks --online
```
But actual measurement showed it took nearly 40 minutes to migrate, and that's just a 256GB Ubuntu VM.

![](/img/PVE/local.png)

# Closing

> This post just records that migration can be done by moving the config file.
