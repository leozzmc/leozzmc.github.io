---
title: 提升Linux系統管理技能：掌握SUDO權限配置和帳戶設定
description: 學習並紀錄如何設定SUDO權限
toc: true
tags:
  - Linux
  - Security
categories: 學習筆記
aside: true
cover: /img/sudo.jpg
abbrlink: '555098e9'
date: 2020-02-10 21:54:03
---

# 前言

當我們在Linux系統中運行一般使用者帳戶時，有時會需要執行需要超級用戶權限的指令，例如更新軟體包或下載檔案等。然而，如果一般使用者沒有被授予sudo權限，就無法執行這些指令。**為了讓一般使用者能夠使用sudo指令，我們需要進行sudoers設定**。

這裡將介紹如何配置sudo權限以及相關的設定。

# sudoers設定檔

在Linux系統中，可以使用sudoers設定檔來指定使用者、群組或別名的sudo權限。該設定檔通常位於`/etc/sudoers`。

![](https://i.imgur.com/EcE7ix5.png)


然而，為了避免對sudoers設定檔進行錯誤的更改，我們應該使用 `visudo` 指令來編輯設定檔。

`visudo` 在保存設定時會檢查是否存在錯誤的配置，例如錯誤的權限或語法問題。請注意，sudoers設定檔只能使用 `visudo` 指令來編輯，如果直接使用vim等編輯器，可能會遇到唯讀或無法覆寫的問題，會跳出 **read-only，cannot override.**


可以使用以下命令來打開sudoers設定檔進行編輯：

```=bash
sudo visudo
```
![](https://i.imgur.com/rqL2ZNl.png)

一旦打開了設定檔，可以在root行下方添加新的配置，指定要授予哪個使用者或群組什麼樣的權限。

```=bash
root  ALL=(ALL:ALL) ALL
[user 帳號] [user的來源主機]=([可切換的身份])[可執行的指令]
```

# passwd 參數 -l
![](https://i.imgur.com/NUH03vf.png)

`passwd`  命令的-l參數用於鎖定帳戶密碼。**當我們鎖定帳戶密碼時，系統會將密碼的雜湊值(放在 /etc/shadow )更改為系統中尚未使用的值。** 鎖定的密碼在 `/etc/passwd` 檔案中的密碼雜湊值前面顯示一個驚嘆號(!)。因此，當我們使用以下命令鎖定帳戶密碼時：

```=bash
passwd -l
```

其他使用者使用sudo su等指令時，將無法切換為root用戶。
此外，我們可以使用chsh命令來更改帳戶的shell。


```=bash
sudo chsh root
chsh [user/root]
```

![](https://i.imgur.com/DHCIuI0.png)

上面的截圖顯示了passwd命令的輸出，其中root用戶的預設shell是 `/bin/bash`。
另外，而可以觀察到其他很多都是 `/usr/sbin/nologin`，這表示在本地或遠端都無法使用這個帳戶登錄。因此，如果將root的shell更改為 `/usr/sbin/nologin`，則沒有人可以訪問root帳戶。


```=bash
sudo chsh root
/usr/sbin/nologin
```

以上是有關配置sudo權限和更改帳戶shell的一些技巧。
透過這些設定，我們可以更好地管理Linux系統上的使用者權限和安全性。

