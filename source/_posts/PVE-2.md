---
title: 基於 CPU 功耗來進行 PVE 虛擬機的 Live Migrations | PVE 系列-2 
abbrlink: 8efb2cec
date: 2024-09-13 20:17:34
tags:
  - Proxmox VE
  - Virtual Machine
  - Infrastructure
categories: 實作紀錄
aside: true
cover: /img/PVE/cover.jpg
---

# 前言

[上一篇文章](https://leozzmc.github.io/posts/c5581068.html)中我們介紹了如何在 Proxmox VE 中對虛擬機進行 Live Migrations，現在我們要加入條件來去對虛擬機進行 Migrations，由於我目前需求會是功耗，因此會需要知道在如何獲取  CPU 功耗的資訊。

# 獲取 CPU 功耗資訊 

通常可以透過幾種方式來獲取 CPU 或者是其他硬體的功耗，最簡單的方式就是透過 `powerstat` 來在 Linux/Unix 環境中查看 CPU 的功耗。 另外如果主機有 BMC和支援IPMI 的話，那就可以透過 `ipmitool` 去獲取主機的電力消耗資訊。

> 題外話: 其實 Proxmox VE 本身是有支援 [**IPMI watchdog**](https://blog.jason.tools/2019/02/pve-ipmi-watchdog.html) 的，可以在 `/etc/default/pve-ha-manager` 裡面去取消註解，改成使用 IPMI watchdog，因為默認是使用作業系統層級的 softdog，但如果主機板沒有支援的話那就還是用默認的就好。

{% note info %}

這邊提供幾行指令檢測你的主機有沒有支援 IPMI
`sudo apt-get install ipmitool`
檢查 BMC (Board Management Controller) 是否存在並正常運行，如果未返回資訊或顯示錯誤信息，則可能表示該伺服器不支持 IPMI
`sudo ipmitool mc info `
或者可以透過 dmidecode 來檢查 
`sudo dmidecode | grep -i ipmi`  
如果伺服器不返回任何 IPMI/BMC 相關資訊，則可能是硬體不支援

{% endnote %}

這裡嘗試透過 `powerstat` 指令獲取資訊:

```
sudo powerstat -R
```

![](/img/PVE/cpu.png)

這個command 最小會去取樣60個 sample，1秒鐘取一次  CPU 消耗功耗值，最後會輸出平均消耗功耗，可以先簡易從這個結果來去寫進腳本裡去作為 migration 用的判斷條件。

# Migrations 場景

可以先簡單獲取 CPU 功耗後，接下來就是要介紹一下 migration 情境。這裡延續上一篇的雙節點架構，在節點A判斷消耗功耗大於閥值的時候，就會去進行 migration，但如果節點處於關機狀態時，會將其喚醒進行 migration。 這一點我們可以先寫個 bash 腳本來實現。

*Before*

![](/img/PVE/wakup.png)

*After*

![](/img/PVE/migration.png)


```bash
#!/bin/bash
POWER_THRESHOLD=6.0
NODE="pve2"
VM_ID="100"
BACKUP_NODE="pve"
BACKUP_NODE_IP="172.25.166.68"
BACKUP_NODE_MAC="0c:9d:92:86:bb:63"
POWER_CONSUMPTION=$(powerstat -R 1 60 | grep -oP 'CPU:\s+\K[0-9.]+')

if (( $(echo "$POWER_CONSUMPTION > $POWER_THRESHOLD" | bc -l) )); then
    echo "Power consumption too high ($POWER_CONSUMPTION W) on $NODE. Migrating VM $VM_ID to $BACKUP_NODE..."    
    wakeonlan $BACKUP_NODE_MAC  
     # VM Live Migration
    qm migrate $VM_ID $BACKUP_NODE --online
    echo "Complete VM $VM_ID migrated to  backup node $BACKUP_NODE ($BACKUP_NODE_IP) | ($BACKUP_NODE_MAC)..."
else
    echo "Power consumption is normal ($POWER_CONSUMPTION W) on $NODE."
fi
```

上面簡易的 bash 腳本，首先設定了一個較低的閥值為 6 瓦特，這是為了實驗方便，基本上就是讓節點一定會進行 migration，但我這裡其實是讓節點 `pve2`上的VM 去 migrate 到節點 `pve`。後面的 `POWER_CONSUMPTION=$(powerstat -R 1 60 | grep -oP 'CPU:\s+\K[0-9.]+')` 基本上就是去透過 `powerstat` 命令獲取60個取樣值下的平均CPU功耗，會花一分鐘 (這個命令的限制)，之後就是透過 `wakeonlan` 這個命令實現遠端主機的喚醒。 之後透過 `qm` 命令去進行 pve 節點的migration。 

# QM

```
qm migrate
```

**qm** 是 **QEMU/KVM Virtual Machine Manager** ，它也是 PVE 提供的實用指令工具，其中 `migrate` 選項可以讓我們將指定 VM ID 的虛擬機轉移到其他節點上，而如果 VM 正在運行，則需要添加 `--online` 參數進行動態 migration。如果對 `qm` 命令感興趣，可以參考它的 [manual](https://pve.proxmox.com/pve-docs/qm.1.html)


![](/img/PVE/qm.png)


# Wake On LAN (WOL)

>**Wake On LAN (WOL)** 又稱「網路喚醒」，可以讓相同區域網路下的電腦對關機或者休眠狀態的主機發送命令使其開機，恢復成運作狀態。想要實現這功能必須先確認主機板是否支援WOL，如果支援那就需要在 UEFI/BIOS 當中去啟用 **PCI/PCIe 喚醒功能**


## 原理介紹

在查詢到 WOL 的當下其實也很好奇為甚麼關機的電腦還能夠去收到封包去將主機喚醒? **而它的祕密就在於電腦關機或休眠時還是會有微弱電力，來讓網卡或主機有最低的運作能力**，這樣就可以去監聽區域網路中的其他封包，持續的去接受並檢查來自相同區域網路下的廣播資訊。

而負責喚醒節點的主機，會在區域網路中去廣播 **Magic Packet**，這個 Magic Packet 中通常會先出現 **連續6個FF**: `FF FF FF FF FF FF` 在這之後會帶出 Mac Address，有時候也包含 4 到 6 bytes的密碼。 

那這個 Magic Packet 會在 LAN 中被廣播，**一旦處於休眠關機狀態的主機透過具有最低限度運作能力的網卡去解析內容後，發現 Magic Packet 中攜帶的資訊與本地主機匹配，就會啟動開機程式。**  這也是為甚麼上面的 bash 腳本中，在　`wakeonlan` 後面要加上 MAC Address 了


## 前往 BIOS 啟用 WOL

這裡個別在兩個節點分別進入 BIOS 來去啟用，啟用後就保存變更然後重啟。

![](/img/PVE/wol1.jpg)

![](/img/PVE/wol2.jpg)


## 指令測試

我這裡先把 nodeB 關機，想從nodeA去喚醒看看

```
wakeonlan 04:42:1a:e7:5a:a0
```

![](/img/PVE/wol3.png)

也從 history 當中看到節點二從關機狀態成功開機。

![](/img/PVE/wol4.png)


# 實驗過程

> 但從剛才的指令測試也發現其實等待開機時間也需要納入考量，因此我們可以將腳本改成下面這樣

```bash
#!/bin/bash
POWER_THRESHOLD=6.0
NODE="pve2"
VM_ID="100"
BACKUP_NODE="pve"
BACKUP_NODE_IP="172.25.166.68"
BACKUP_NODE_MAC="0c:9d:92:86:bb:63"
MAX_RETRIES=12 
SLEEP_INTERVAL=10

POWER_CONSUMPTION=$(powerstat -R 1 60 | grep -oP 'CPU:\s+\K[0-9.]+')

if (( $(echo "$POWER_CONSUMPTION > $POWER_THRESHOLD" | bc -l) )); then
    echo "Power consumption too high ($POWER_CONSUMPTION W) on $NODE. Migrating VM $VM_ID to $BACKUP_NODE..."

    wakeonlan $BACKUP_NODE_MAC
    echo "Waiting for $BACKUP_NODE ($BACKUP_NODE_IP) to be reachable..."
    RETRY_COUNT=0
    while ! ping -c 1 $BACKUP_NODE_IP &> /dev/null; do
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
            echo "Error: $BACKUP_NODE did not respond after $((MAX_RETRIES * SLEEP_INTERVAL)) seconds. Exiting."
            exit 1
        fi
        echo "Waiting for $BACKUP_NODE to come online... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep $SLEEP_INTERVAL
    done

    echo "Backup node $BACKUP_NODE is online. Starting migration..."
    qm migrate $VM_ID $BACKUP_NODE --online
    echo "VM $VM_ID successfully migrated to backup node $BACKUP_NODE ($BACKUP_NODE_IP)."

else
    echo "Power consumption is normal ($POWER_CONSUMPTION W) on $NODE."
fi
```

這裡新增了 retry 機制，在透過命令發送 Magic Packet後，會嘗試去 ping 主機，看是否存活，那當然我確定我沒有檔ICMP packet，所以開機後按理來說一定ping 的到，最大重試次數為12次，每次 retry 中間等10秒，因此最久會等2分鐘。

> 這裡的數字設定只是為了實驗方便，實際運作看是否要改成 backoff retry 都是看個人決定~

這裡實驗想反過來，先把節點1 `PVE` 關機

![](/img/PVE/exp1.png)


後續在節點2 `PVE2` 執行上面的腳本，一如預期， **首先會先去檢查1分鐘內的CPU平均功耗是否大於閥值(6瓦特)** ，這裡一定會大於，因此之後會去喚醒 `pve` 節點，之後會持續去 ping 節點1，在 retry 了兩次後，節點 `pve` 可用，開始進行 migration，後續也成功完成 migrations。

![](/img/PVE/exp2.png)


>如果觀察 Ubuntu VM 的 Memory 指標可以發現會出現斷層，這就是移轉過程中預期會出現的 downtime 。 以前在 AWS 處理 MQ 問題的時候也會發現在 maintenance windows 期間某些實例的記憶體或CPU 指標也會有這樣的斷層，這通常代表底層實例替換或重啟，其原因可能是要做 maintenance 或者security patch

# 結語

這篇文章做了簡單的小實驗，**從PVE Cluster 中的一個節點喚醒了相同LAN的其他PVE節點並且進行動態 migration，那如果後續有多一台主機可用**，我會介紹 PVE 中的 HA(High Availability) Cluster 的使用。

# Reference

IPMI watchdog
https://blog.jason.tools/2019/02/pve-ipmi-watchdog.html

qm
https://pve.proxmox.com/pve-docs/qm.1.html