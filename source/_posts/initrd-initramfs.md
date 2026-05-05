---
title: initrd 與 initramfs 差異介紹 | Linux Kernel
tags:
  - Linux
  - Kernel
  - Embedded
categories: Kernel學習
aside: true
abbrlink: ad71f05
date: 2025-11-19 14:32:14
cover: /img/linux/boot/cover.png
---

# Introduction

在開機早期，會需要一個暫時的檔案系統，來在開機初期進行初始化跟組態設定，有兩種機制來去使用暫時的檔案系統，分別是 **Initrd (Initial RAM Disk)** 以及 **Initramfs (Initial RAM Filesystem)** 。 其中 initrd 會是比較早期的作法，現今大多開機流程都使用 initramfs 居多。
 
# Initrd 

> Initrd（Initial RAM Disk）是一個早期 Linux 開機使用的暫時性 root filesystem。 它的形式是 一個被 gzip 壓縮的 block image，開機時會被放進一個虛擬 RAM Disk（例如 `/dev/ram0` ）中，再由 kernel 掛載成初始 root。

它通常包含：

= 掛載真正 rootfs 所需的驅動
- 一個 `linuxrc`（類似 init 的 early user-space script）
- 掛載 `/proc`、`/sys` 之類的初始化腳本

## 用 Initrd 開機

想要透過 initrd 開機，會需要在 bootloader 階段就被 bootloader 載入記憶體，並且bootloader 會需要將 initrd 的記憶體位址 告知給 kernel。但要如何知道 initrd 位址? 

早期非常舊的bootloader會透過 kernel commandline 的方式以參數告知 kernel initrd 的起始位址跟大小；但在較新的 bootloader（GRUB）中，initrd 是透過 boot protocol 結構傳給 kernel，而不是透過 command line

```shell
console=tty0, 115200 root=/dev/nfs \
    nfsroot=192.168.1.10:/home/testuser/sandbox/nfs-target \
    initrd=0x10800000, 0x14af47
```

上面的 kernel commandline 代表的意義就是，指定主控談在 tty0， braue rate 為 115200 並且以 NFS 掛載 roofs (然後指定去從某個 private IP 去抓 NFS rootfs)，最後指定從實體記憶體位址 `0x10800000` 的地方載入並且掛載 RAMDisk 大小為 `0x14af47`。

而 bootloader 當中可以設定 kernel image 以及 initrd 的起始記憶體位址，以下是以 U-Boot 為例:

```shell
=> setenv kernel_addr_r 0x80000
=> setenv initrd_addr_r 0x1000000
=> setenv initrd_size 0x800000

# 讀取 kernel 與 initrd 映像檔(這裡假設是從 mmc 裝置透過 FAT 讀取)
=> fatload mmc 0:1 ${kernel_addr_r} /boot/uImage
=> fatload mmc 0:1 ${initrd_addr_r} /boot/initrd.img

# 設定 kernel command line，告訴 kernel rootfs 與 initrd 資訊
=> setenv bootargs "console=ttyS0,115200 root=/dev/mmcblk0p2 rw initrd=${initrd_addr_r},${initrd_size}"

# 載入並啟動 kernel，並傳入 initrd 映像地址與大小
=> bootm ${kernel_addr_r} ${initrd_addr_r}:${initrd_size}
```
> U-BOOT 也可以透過網路去載入 Kernel image 跟 initrd image，可以節省都燒進 flash ROM 的開發時間

## 整體流程:

1. Bootloader 將 kernel image 與 initrd image 載入到 RAM
2. Bootloader 透過 boot protocol（或 command line）傳遞 initrd 的位址與大小
3. Kernel 啟動後，從 RAM 取得 initrd image
4. 將 initrd .gz 解壓縮到 `/dev/ram0`
5. 將 `/dev/ram0` 掛載成暫時 root filesystem
6. Kernel 產生一個 early process 執行 linuxrc
7. linuxrc 掛載 `/proc`、`/sys`，載入驅動，並掛載真正的 rootfs
8. linuxrc 呼叫 `pivot_root` 或 `switch_root` 切換到真正的 rootfs
9. Initrd RAM Disk 被卸載並釋放記憶體

> 這個 linuxrc 就是一個腳本，包含了掛載真正的根檔案系統前的命令，像是 `mount -t proc /proc /proc` 或者 `busybx sh`


linuxrc 執行完畢後，initrd 初期流程結束，這時候會透過 pivot_root / switch_root 切到真正 rootfs，這之後 initrd 的 RAM disk 才會被釋放


在 kernel 的 原始碼中 `..init/do_mounts.c` 裡面的 `prepare_namespace()` 函式，會決定 rootfs 在哪，和掛載點在哪
其中：
- `initrd_load()` 會檢查是否有 initrd，若有則解壓並掛載
- `mount_root()` 則是掛載真正的 rootfs
- 最後透過 `init_chroot("/")` 完成切換

{% hideToggle initrd flow,bg,color %}
*可以切成 light mode 看，右下角按鈕*
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

這裡可以追蹤一下 `initrd_load` 因為他會嘗試載入 initrd，觀察程式碼可以發現： 如果 kernel  啟用了 `CONFIG_BLK_DEV_INITRD`（也就是支援 initrd，在 kernel config editor可以檢查能不能設定），則會嘗試從 bootloader 傳入的 initrd image 中載入早期的 root filesystem。若成功，回傳 `true`，這等於是告訴 kernel： **「我已經掛載了 initrd，你不用再嘗試掛載其它 rootfs」** 。若失敗或沒有啟用，回傳 `false` kernel 就會往後執行 `mount_root()` 掛載真正的 rootfs

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

# Initramfs


Initramfs 的目的其實跟 initrd 類似：
都是在真正的 root filesystem 掛載之前，先提供一個暫時的 root，讓我們可以：

- 載入必要的驅動程式
- 做一些 early userspace 的初始化
- 最後再切換到真正的 rootfs

差別在於實作方式完全不一樣：

- **initrd** ：是一顆傳統的 filesystem image（例如 ext2）再 gzip 壓縮，
kernel 解壓之後，會把它放到 `/dev/ram0` 這種 RAM Disk 上掛載
- **initramfs** ：是一個 cpio 檔案庫（通常也會再 gzip 一層），
kernel 會直接把 cpio 解開到 rootfs（ramfs 或 tmpfs）裡，
不再透過 block 裝置，也沒有 `/dev/ram0` 這種中間層

對於 **內建進 kernel 的 initramfs」（built-in initramfs）**，它的解壓流程大致發生在：
- `start_kernel()` 呼叫一連串初始化後
- 進入 `rest_init()` → `kernel_init()` → `kernel_init_freeable()`
- 裡面會呼叫 `populate_rootfs()`，把編譯時打包好的 initramfs cpio 解開成 rootfs

之後在 `do_basic_setup()` 裡面則會呼叫 `do_initcalls()` 去初始化各種 driver 與 subsystem。所以可以粗略地說：initramfs 會在 do_basic_setup() 之前就被解開並掛載好

{% hideToggle kernel_init_freeable,bg,color %}
*可以切成 light mode 看，右下角按鈕*
![](/img/linux/boot/kernel_init_freeable.png)
{% endhideToggle %}

{% hideToggle do_initcalls flow,bg,color %}
*可以切成 light mode 看，右下角按鈕*
![](/img/linux/boot/do_initcalls.png)
{% endhideToggle %}


{% hideToggle overall flow,bg,color %}
*可以切成 light mode 看，右下角按鈕*
![](/img/linux/boot/overall.png)
{% endhideToggle %}


在 Linux kernel 原始碼樹的 `usr/` 目錄，可以看到跟 initramfs 相關的檔案：

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

流程大致是：

- 你在 kernel config 裡設定 `INITRAMFS_SOURCE`，可以是 一個目錄，也可以是一個 cpio file list
- build system 會呼叫 `gen_initramfs.sh` 去讀你的 INITRAMFS_SOURCE
- 再透過 `gen_init_cpio` 產生一個 cpio 檔案庫 `initramfs_data.cpio`
- 之後這個 cpio 會被轉成 C/ASM 資料 (initramfs_inc_data, initramfs_data.S)
- 最終被連結進 kernel image 裡

換句話說：

**你可以在編譯 kernel 的時候就把一個「迷你 rootfs」打包進去，不需要額外準備一顆獨立的 initrd image**

*BusyBox 範例 - 最小化 initramfs*

假設我們想做一個超精簡的 initramfs，只需要：一個 `busybox` 二進位檔、一個 `/init` 或 `/bin/sh` 可以當 init，以及一個 `/dev/console` 裝置節點，它的檔案樹可能長成這樣:

```linux
/
├── init -> /bin/busybox
├── bin
│   ├── busybox
│   └── sh -> busybox
└── dev
    └── console

```


這裡講一下為何要有 init 到 /bin/busybox 的 symbolic link ，當 kernel 使用 initramfs 時，會優先在 rootfs 裡找 `/init` 這個執行檔。如果找到，就會把它當成 init process（PID 1）來執行；若找不到，又沒有指定 `rdinit=` 或 `init=`，才會進入後續的 root 掛載流程，去掛真正的 rootfs

在 `init/main.c` 裡可以看到這個預設值：

```c=163
static char *ramdisk_execute_command = "/init";
```

可以看到 `ramdisk_execute_command`  的字元指標會是指向這個執行檔

> 如果你在 kernel command line 裡加上
`rdinit=/bin/sh` 或 `rdinit=/bin/busybox` 就可以覆寫這個行為，直接指定 initramfs 上要跑的第一個程式。這也是常見用法：用 `rdinit=/bin/sh` 搭配 busybox，直接在 early userspace 掉進 shell 裡 debug boot 流程。