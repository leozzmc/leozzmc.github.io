---
title: "Leveling Up Linux Admin Skills: Mastering SUDO Permissions and Account Settings"
description: Learning and recording how to configure SUDO permissions
toc: true
tags:
  - Linux
  - Security
categories: Study Notes
aside: true
cover: /img/sudo.jpg
abbrlink: "555098e9"
date: 2020-02-10 21:54:03
---

> 🌐 中文版：[繁體中文](/posts/555098e9.html)

When running an ordinary user account on a Linux system, you sometimes need to run commands that require superuser privileges, such as updating packages or downloading files. But if the ordinary user hasn't been granted sudo privileges, those commands won't run. **To let an ordinary user use sudo, we need to configure the sudoers file.**

This post covers how to configure sudo permissions along with some other interesting account-access settings.

# The sudoers config file

On a Linux system, the sudoers config file specifies the sudo privileges for users, groups, or aliases. It's usually located at `/etc/sudoers`.

![](https://i.imgur.com/EcE7ix5.png)

To avoid making a bad change to the sudoers file, we should edit it with the `visudo` command.

`visudo` checks for configuration errors when saving, such as bad permissions or syntax problems. Note that the sudoers file should only be edited with `visudo`; editing it directly with something like vim may hit read-only or write-failure issues, and you'll see **read-only, cannot override.**

Open the sudoers file for editing with:

```bash
sudo visudo
```

![](https://i.imgur.com/rqL2ZNl.png)

Once it's open, add new configuration lines below the root line, specifying what privileges to grant which user or group.

```bash
root  ALL=(ALL:ALL) ALL
[user account] [user's source host]=([identities to switch to])[runnable commands]
```

# Other interesting account-access settings

### passwd with the -l flag

![](https://i.imgur.com/NUH03vf.png)

The `passwd` command's `-l` flag locks an account's password. **When we lock an account's password, the system changes the password hash (stored in `/etc/shadow`) to a value not yet used in the system.** A locked password shows a leading exclamation mark (!) in front of the password hash in `/etc/passwd`. So after locking an account's password with:

```bash
passwd -l
```

other users won't be able to switch to the root user via `sudo su` and similar commands.

We can also change an account's shell with the `chsh` command.

```bash
sudo chsh root
chsh [user/root]
```

![](https://i.imgur.com/DHCIuI0.png)

The screenshot above shows the output of the passwd command, where the root user's default shell is `/bin/bash`. Notice that many others are `/usr/sbin/nologin`, which means that account cannot log in locally or remotely. So if you change root's shell to `/usr/sbin/nologin`, nobody can access the root account.

```bash
sudo chsh root
/usr/sbin/nologin
```

Those are a few tricks for configuring sudo permissions and changing an account's shell. With these settings, we can better manage user privileges and security on a Linux system.
