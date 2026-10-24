---
title: initrd vs initramfs | Linux Kernel
tags:
  - Linux
  - Kernel
  - Embedded
categories: Kernel Study
aside: true
abbrlink: "ad71f05"
date: 2025-11-19 14:32:14
cover: /img/linux/boot/cover.png
---

> 🌐 中文版：[繁體中文](/posts/ad71f05.html)

# Introduction

Early in boot, a temporary filesystem is needed to perform initialization and configuration during the early boot stage. There are two mechanisms for using a temporary filesystem: **initrd (Initial RAM Disk)** and **initramfs (Initial RAM Filesystem)**. initrd is the earlier approach, and most boot flows today use initramfs.

# initrd

> initrd (Initial RAM Disk) is a temporary root filesystem used in early Linux boot. It takes the form of a gzip-compressed block image, loaded at boot into a virtual RAM disk (e.g. `/dev/ram0`) and then mounted by the kernel as the initial root.

It usually contains:

- The drivers needed to mount the real rootfs
- A `linuxrc` (an init-like early user-space script)
- Initialization scripts to mount `/proc`, `/sys`, and so on

## Booting with initrd

To boot via initrd, it must be loaded into memory at the bootloader stage, and the bootloader must tell the kernel the initrd's memory address. But how does it know the initrd address?

Very old bootloaders told the kernel the initrd's start address and size as parameters via the kernel command line; but in newer bootloaders (GRUB), the initrd is passed to the kernel through the boot protocol structure rather than the command line.

```shell
console=tty0, 115200 root=/dev/nfs \
    nfsroot=192.168.1.10:/home/testuser/sandbox/nfs-target \
    initrd=0x10800000, 0x14af47
```

The kernel command line above means: set the console to tty0 at baud rate 115200, mount the rootfs over NFS (fetching the NFS rootfs from a private IP), and finally load and mount a RAM disk from physical memory address `0x10800000` with size `0x14af47`.

In the bootloader you can set the start memory addresses for the kernel image and initrd. Here's an example with U-Boot:

```shell
=> setenv kernel_addr_r 0x80000
=> setenv initrd_addr_r 0x1000000
=> setenv initrd_size 0x800000

# Read the kernel and initrd images (assuming FAT read from an mmc device)
=> fatload mmc 0:1 ${kernel_addr_r} /boot/uImage
=> fatload mmc 0:1 ${initrd_addr_r} /boot/initrd.img

# Set the kernel command line, telling the kernel the rootfs and initrd info
=> setenv bootargs "console=ttyS0,115200 root=/dev/mmcblk0p2 rw initrd=${initrd_addr_r},${initrd_size}"

# Load and boot the kernel, passing the initrd image address and size
=> bootm ${kernel_addr_r} ${initrd_addr_r}:${initrd_size}
```
> U-Boot can also load the kernel image and initrd image over the network, saving the development time of flashing everything to flash ROM.

## Overall flow:

1. The bootloader loads the kernel image and initrd image into RAM
2. The bootloader passes the initrd's address and size via the boot protocol (or command line)
3. After the kernel starts, it gets the initrd image from RAM
4. It decompresses the initrd .gz into `/dev/ram0`
5. It mounts `/dev/ram0` as the temporary root filesystem
6. The kernel spawns an early process to run linuxrc
7. linuxrc mounts `/proc` and `/sys`, loads drivers, and mounts the real rootfs
8. linuxrc calls `pivot_root` or `switch_root` to switch to the real rootfs
9. The initrd RAM disk is unmounted and its memory freed

> This linuxrc is a script containing the commands needed before mounting the real root filesystem, such as `mount -t proc /proc /proc` or `busybox sh`.

After linuxrc finishes, the initrd early stage ends, at which point `pivot_root` / `switch_root` switches to the real rootfs, and only then is the initrd RAM disk freed.

In the kernel source, the `prepare_namespace()` function in `init/do_mounts.c` decides where the rootfs is and where the mount point is. Within it:
- `initrd_load()` checks whether an initrd exists, and if so decompresses and mounts it
- `mount_root()` mounts the real rootfs
- Finally `init_chroot("/")` completes the switch

{% hideToggle initrd flow,bg,color %}
*Switch to light mode to view, button at bottom right*
![](/img/linux/boot/initrd.png)
{% endhideToggle %}

```c
/*
 * Prepare the namespace - decide what/where to mount, load ramdisks, etc.
 */
void __init prepare_namespace(void)
{
	if (root_delay) {
		printk(KERN_INFO "Waiting %d sec before mounting root device...\n",
		       root_delay);
		ssleep(root_delay);
	}

	/*
	 * wait for the known devices to complete their probing
	 *
	 * Note: this is a potential source of long boot delays.
	 * For example, it is not atypical to wait 5 seconds here
	 * for the touchpad of a laptop to initialize.
	 */
	wait_for_device_probe();

	md_run_setup();

	if (saved_root_name[0])
		ROOT_DEV = parse_root_device(saved_root_name);

	if (initrd_load(saved_root_name))
		goto out;

	if (root_wait)
		wait_for_root(saved_root_name);
	mount_root(saved_root_name);
out:
	devtmpfs_mount();
	init_mount(".", "/", NULL, MS_MOVE, NULL);
	init_chroot(".");
}
```

Let's trace `initrd_load`, since it tries to load the initrd. Reading the code, we find: if the kernel enabled `CONFIG_BLK_DEV_INITRD` (initrd support, which you can check in the kernel config editor), it tries to load the early root filesystem from the initrd image passed in by the bootloader. On success it returns `true`, which tells the kernel: **"I've already mounted the initrd, you don't need to try mounting another rootfs."** On failure, or if not enabled, it returns `false`, and the kernel proceeds to `mount_root()` to mount the real rootfs.

```c
#ifdef CONFIG_BLK_DEV_INITRD
bool __init initrd_load(char *root_device_name);
#else
static inline bool initrd_load(char *root_device_name)
{
	return false;
}
#endif
```

# initramfs

initramfs's purpose is actually similar to initrd:
both provide a temporary root before the real root filesystem is mounted, letting us:

- Load necessary drivers
- Do some early-userspace initialization
- Finally switch to the real rootfs

The difference is entirely in implementation:

- **initrd**: a traditional filesystem image (e.g. ext2) that's gzip-compressed. After the kernel decompresses it, it's placed on a RAM disk like `/dev/ram0` and mounted.
- **initramfs**: a cpio archive (usually gzipped too). The kernel unpacks the cpio directly into rootfs (ramfs or tmpfs), with no block device and no intermediate `/dev/ram0` layer.

For a **built-in initramfs** (compiled into the kernel), its unpacking roughly happens at:
- After `start_kernel()` calls a sequence of initializations
- Entering `rest_init()` → `kernel_init()` → `kernel_init_freeable()`
- which calls `populate_rootfs()` to unpack the compile-time initramfs cpio into rootfs

Later, `do_basic_setup()` calls `do_initcalls()` to initialize various drivers and subsystems. So roughly speaking: initramfs is unpacked and mounted before do_basic_setup().

{% hideToggle kernel_init_freeable,bg,color %}
*Switch to light mode to view, button at bottom right*
![](/img/linux/boot/kernel_init_freeable.png)
{% endhideToggle %}

{% hideToggle do_initcalls flow,bg,color %}
*Switch to light mode to view, button at bottom right*
![](/img/linux/boot/do_initcalls.png)
{% endhideToggle %}

{% hideToggle overall flow,bg,color %}
*Switch to light mode to view, button at bottom right*
![](/img/linux/boot/overall.png)
{% endhideToggle %}

In the kernel source tree's `usr/` directory, you can see the initramfs-related files:

```shell
kevin@MSI:~/linux-6.17.7$ ls -l usr/
total 96
-rw-rw-r-- 1 kevin kevin  7902 Nov  2 21:18 Kconfig
-rw-rw-r-- 1 kevin kevin  2756 Nov  2 21:18 Makefile
-rw-rw-r-- 1 kevin kevin   146 Nov  4 16:44 built-in.a
-rw-rw-r-- 1 kevin kevin   153 Nov  2 21:18 default_cpio_list
drwxrwxr-x 2 kevin kevin  4096 Nov  2 21:18 dummy-include
-rwxrwxr-x 1 kevin kevin 27248 Nov  4 16:44 gen_init_cpio
-rw-rw-r-- 1 kevin kevin 15057 Nov  2 21:18 gen_init_cpio.c
-rwxrwxr-x 1 kevin kevin  5888 Nov  2 21:18 gen_initramfs.sh
drwxrwxr-x 2 kevin kevin  4096 Nov  2 21:18 include
-rw-rw-r-- 1 kevin kevin  1243 Nov  2 21:18 initramfs_data.S
-rw-rw-r-- 1 kevin kevin   512 Nov  4 16:44 initramfs_data.cpio
-rw-rw-r-- 1 kevin kevin  1496 Nov  4 16:44 initramfs_data.o
-rw-rw-r-- 1 kevin kevin   512 Nov  4 16:44 initramfs_inc_data
```

The flow is roughly:

- You set `INITRAMFS_SOURCE` in the kernel config, which can be a directory or a cpio file list
- The build system calls `gen_initramfs.sh` to read your INITRAMFS_SOURCE
- Then `gen_init_cpio` produces a cpio archive `initramfs_data.cpio`
- This cpio is then converted to C/ASM data (initramfs_inc_data, initramfs_data.S)
- and finally linked into the kernel image

In other words:

**You can package a "mini rootfs" into the kernel at compile time, without separately preparing a standalone initrd image.**

*BusyBox example, a minimal initramfs*

Suppose we want a super-minimal initramfs needing only: a `busybox` binary, an `/init` or `/bin/sh` to serve as init, and a `/dev/console` device node. Its file tree might look like:

```linux
/
├── init -> /bin/busybox
├── bin
│   ├── busybox
│   └── sh -> busybox
└── dev
    └── console

```

Here's why there's a symbolic link from init to /bin/busybox: when the kernel uses initramfs, it first looks for the `/init` executable in rootfs. If found, it runs it as the init process (PID 1); if not found, and neither `rdinit=` nor `init=` is specified, it proceeds to the subsequent root-mount flow to mount the real rootfs.

You can see this default in `init/main.c`:

```c=163
static char *ramdisk_execute_command = "/init";
```

The `ramdisk_execute_command` char pointer points to this executable.

> If you add `rdinit=/bin/sh` or `rdinit=/bin/busybox` to the kernel command line, you can override this behavior and directly specify the first program to run on the initramfs. This is a common usage: `rdinit=/bin/sh` with busybox drops you straight into a shell in early userspace to debug the boot flow.
