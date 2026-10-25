---
title: "\U0001F4BB Common Windows Commands"
description: A roundup of common Windows command-line (cmd or powershell) commands
toc: true
tags:
  - Windows
  - PowerShell
categories:
  - Commands / Tool Usage
top_img: 'https://i.imgur.com/rtjtBNB.jpg'
aside: true
abbrlink: "5b6eeeb3"
date: 2022-12-01 09:47:26
---

> 🌐 中文版：[繁體中文](/posts/5b6eeeb3.html)

## Gathering local machine info
- Network configuration info
```
ipconfig/all
```
- OS and version info
    - Chinese version
    ```
    systeminfo | findstr /B /C:"作業系統名稱" /C:"作業系統版本"
    ```
    - English version
    ```
    systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
    ```
- System architecture
```
echo %PROCESSOR_ARCHITECTURE%
```
- Check installed software versions
```
wmic product get name,version
```
```
powershell "Get-WmiObject -class Win32_Product |Select-Object -Property name,version"
```
- Query local services
```
wmic service list brief
```
- Query the process list
```
tasklist
```
```
wmic process list brief
```
- Check startup programs
```
wmic startup get command,caption
```
- Check scheduled tasks
```
schtasks /query /fo LIST /v
```
- Check the host's boot time
```
net statistics workstation
```
- Check the user list
```
net user
```
- Get local administrator info
```
net localgroup administrators
```
- Check currently logged-in users
```
query user || qwinsta
```
- List sessions between the local computer and connected clients
```
net session //usually needs admin privileges to run
```
- Query the port list
```
netstat -ano
```
- Check the routing table and the available ARP cache table
```
route print
arp -a
```
- Disable the firewall
    - Windows Server 2003 and earlier
    ```
    netsh firewall set opmode disable
    ```
    - After Windows Server 2003
    ```
    netsh advfirewall set allprofiles state off
    ```
- Check firewall settings
```
netsh firewall show config
```
- Modify firewall settings
    - Windows Server 2003 and earlier
    ```
    netsh firewall add allowedprogram C:\nc.exe "allow nc" enable
    ```
    - After Windows Server 2003
    ```
    netsh advfirewall add rule name="pass nc" dir=in action=allow program="C:\nc.exe"
    ```
    - Allow a specific program to exit
    ```
    netsh advfirewall add rule name="Allow nc" dir=out action=allow program="C:\nc.exe"
    ```
    - Allow port 3389 through
    ```
    netsh advfirewall add rule name="Remote Desktop" protocol=TCP dir=in localport=3389 action=allow
    ```
- Customize the firewall log file's storage location
```
netsh advfirewall set currentprofile logging filename "C:\windows\temp\fw.log"
```
