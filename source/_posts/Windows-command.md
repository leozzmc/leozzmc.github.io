---
title: 💻 Windows 常見指令
description: 整理Windows命令列(cmd or powershell)常見指令
toc: true
tags: ['Windows','PowerShell']
categories: [指令/工具用法整理]
date: 2022-12-01T17:47:26+08:00
top_img: https://i.imgur.com/rtjtBNB.jpg
aside: true
---

## 蒐集本機資訊
- 網路設定資訊
```
ipconfig/all
```
- 作業系統以及版本資訊
    - 中文版
    ```
    systeminfo | findstr /B /C:"作業系統名稱" /C:"作業系統版本"
    ```
    - 英文版
    ```
    systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
    ```
- 系統結構
```
echo %PROCESSOR_ARCHITECTURE%
```
- 查看安裝的軟體版本
```
wmic product get name,version
```
```
powershell "Get-WmiObject -class Win32_Product |Select-Object -Property name,version"
```
- 查詢本機服務
```
wmic service list brief
```
- 查詢處理程序列表
```
tasklist
```
```
wmic process list brief
```
- 查看啟動程式
```
wmic startup get command,caption
```
- 查看任務計畫
```
schtasks /query /fo LIST /v
```
- 查看主機開機時間
```
net statistics workstation
```
- 查看使用者列表
```
net user
```
- 獲取本機管理員資訊
```
net localgroup administrators
```
- 查看當前線上使用者
```
query user || qwinsta
```
- 列出本機電腦以及所連接的用戶端之間的Session
```
net session //通常需要admin 權限才能執行
```
- 查詢通訊埠列表
```
netstat -ano
```
- 查路由表以及可用的ARP Cache表
```
route print
arp -a
```
- 關閉防火牆
    - Windows Server 2003及以前的版本
    ```
    netsh firewall set opmode disable
    ```
    - Windows Server 2003之後的版本
    ```
    netsh advfirewall set allprofiles state off
    ```
- 查看防火牆設定
```
netsh firewall show config
```
- 修改防火牆設定
    - Windows Server 2003及以前的版本
    ```
    netsh firewall add allowedprogram C:\nc.exe "allow nc" enable
    ```
    - Windows Server 2003之後的版本
    ```
    netsh advfirewall add rule name="pass nc" dir=in action=allow program="C:\nc.exe"
    ```
    - 允許指定程式退出
    ```
    netsh advfirewall add rule name="Allow nc" dir=out action=allow program="C:\nc.exe"
    ```
    - 允許3389 Port通行
    ```
    netsh advfirewall add rule name="Remote Desktop" protocol=TCP dir=in localport=3389 action=allow
    ```
- 自訂防火牆紀錄檔的儲存位置
```
netsh advfirewall set currentprofile logging filename "C:\windows\temp\fw.log"
```

