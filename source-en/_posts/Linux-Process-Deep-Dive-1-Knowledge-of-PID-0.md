---
title: 'Linux Process Deep Dive-1: Knowledge of PID 0 '
toc: true
tags:
  - AWS
  - IoT
  - OTA
  - Firmware
categories: 學習筆記
abbrlink: 752506ab
date: 2023-12-14 07:01:50
cover: /img/PID0.jpeg
---


## PID 0

- An Idle Process used to swap all pages of processs to/from memory/backing store.
- "Swap Process"
- It was there, so Linux always have CPU to execute something
- If you try to execute `ps` command on the clean Ubuntu Linux, you'll find there was no process with "PID0" 
- Idle systemcall not supported since kernal 2.3.13

> **Then how can we prove that PID0 really exist?**

### Demo

- Using `bpftrace` for tracking the kernel function **hrtimer_wakeup**
- **hrtimer_wakeup** mean to:
    - Waking up processes
    - Move them into runnable process (==Maybe changing state to Running==)

*hrtimer_wakeup source code*

```cpp
##Refer to https://elixir.bootlin.com/linux/latest/source/kernel/time/hrtimer.c#L2000

static enum hrtimer_restart hrtimer_wakeup(struct hrtimer *timer)
{
	struct hrtimer_sleeper *t =
		container_of(timer, struct hrtimer_sleeper, timer);
	struct task_struct *task = t->task;

	t->task = NULL;
	if (task)
		wake_up_process(task);

	return HRTIMER_NORESTART;
}
```



I open a new Amazon EC2 Instance with Ubuntu 22 LTS AMI for testing.

*Command*
```
sudo bpftrace -e 'kfunc:hrtimer_wakeup {printf("%s:%d\n",curtask->comm,curtask->pid); }'
```
![image](https://hackmd.io/_uploads/HJbjzQd8p.png)

It shows there are only 1 instance of swapper: `swapper/0` with PID0.

If you open a new VM with 3~4 vCPU, then you execute the command again, You will find that there are 3~4 swapper instances with PID0, so there may have `swapper/0`, `swapper/1`, `swapper/2` appears.

## PPID

![image](https://hackmd.io/_uploads/Bkp5NXuLT.png)

If you try to execute the command `ps -eaf` on your local system, you may find there are a column named **PPID**, It means the **Parrent Process ID**.

In Linux systems, A PPID is always assigned to every process ID. **It tells us which process started a particular process.** Therefore, the PPID value of 0 for the init process indicates that **the init process has no parent.**


## Reference

[1] Refer to **"The Linux Process Journey"** by Dr. Shlommi Bountnaru
[2] https://www.baeldung.com/linux/process-pid-0