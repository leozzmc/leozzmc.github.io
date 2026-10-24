---
title: "Dissecting NASA's HDTN Architecture: How Does Space DTN Actually Work?"
tags:
  - Space Networking
  - DTN
  - Bundle Protocol
  - NASA
  - Distributed Systems
categories:
  - Space Infrastructure
description: >-
  DTN is more than the Store-Carry-Forward concept. This post breaks down the
  modular architecture of NASA's High-rate Delay Tolerant Networking (HDTN),
  explaining how Ingress, Storage, Router, Scheduler, Egress, and the Convergence
  Layer together handle disconnection, waiting, and re-forwarding in the space
  environment.
toc: true
aside: true
abbrlink: "25763fe7"
date: 2026-06-07 20:51:10
cover: /img/DTN/cover-2.png
---

> 🌐 中文版：[繁體中文](/posts/25763fe7.html)

# Preface: from the concept of DTN to a space network that actually works

In the previous post, [Why Space Networking Needs DTN: From TCP/IP's Limits to Deep-Space Networks](/en/posts/7d41a775.html), I laid out the most fundamental differences between space networks and the terrestrial Internet. On Earth, we usually expect a complete, immediately-usable path between source and destination. Even if a packet is occasionally lost along the way, TCP can handle it through a whole set of mechanisms like ACK, timeout, and retransmission.

But in space, a disconnection doesn't necessarily mean a fault. For example, the situation might be: a satellite flying out of a ground station's visible range, a lunar rover entering a crater, or a spacecraft temporarily shutting off its comms module to save energy. Connections between nodes can also be affected by orbital position, celestial occlusion, antenna direction, and communication schedules.

So a space network can't only look at **is there a path to the destination right now?** It must further consider: **when is the next opportunity to forward data?**, **until then, which node should hold the data?**, and **if the contact window suddenly vanishes, how is transmission resumed?**

These are the problems **Delay/Disruption-Tolerant Networking (DTN)** tries to solve.

My previous post already introduced DTN's most core operating model:

```text
Store → Carry → Forward
```

But that's still a relatively abstract concept. Because if we really want to deploy DTN on the ISS, satellites, lunar relay stations, or even future deep-space networks, what software components are needed behind the scenes? And there are many questions:

> After data enters a node, how does the system decide whether to send immediately or temporarily write to disk?
> When a contact window appears, who's responsible for telling the system to release the data again?
> When a path suddenly drops, how does the system recompute the next hop?

**High-rate Delay Tolerant Networking (HDTN)**, developed by **NASA Glenn Research Center**, is exactly an implementation that turns DTN from an old abstract concept into an engineering system. Let's keep reading. [1][2]

# What is HDTN?

HDTN stands for **High-rate Delay Tolerant Networking**. It isn't a new protocol unrelated to DTN, but a DTN implementation designed for high-bandwidth needs. Recall that DTN solves the reliable-transport problem in space networks:

* Nodes aren't always connected
* Communication delays can be very long
* The network topology changes over time
* Data may have to stay at a relay node for a while
* The communication path may suddenly drop mid-transfer

But as laser comms, high-resolution imagery, scientific instrument data, and large file transfers increase, the system faces another problem:

> Even if DTN can tolerate disconnection, can it transfer large amounts of data quickly when a contact window appears?

Early DTN implementations mostly ran in resource-constrained environments, prioritizing stability and mission needs over extremely high throughput. However, **future space missions need not just the ability to transmit, but to transmit as much data as possible within a limited contact window.** So NASA developed HDTN to improve DTN's processing efficiency through modern hardware, parallel processing, and a modular architecture. [1][2]

# Why does NASA need High-rate DTN?

In a Technical Memorandum released in 2022, NASA Glenn Research Center used the International Space Station (ISS) as the test and integration scenario for HDTN. The ISS does have computers, but not just computers; it's a complex environment with many subsystems (an onboard computer usually has a great many subsystems), science payloads, radio equipment, and ground networks. [1]

When science data is sent from the ISS back to a research team, it may pass through multiple nodes:

```text
  Science instrument on the ISS
        ↓
Joint Station LAN (JSL)
        ↓
     Comms equipment
        ↓
Tracking and Data Relay Satellite (TDRS)
        ↓
    Ground station
        ↓
     Ground network
        ↓
     Research team
```

The above is just one possible delivery path. Also, different data has different needs. Some may be software updates, some telemetry, some large science files, and some may include imagery and streaming content. Each kind of data differs in size, priority, and bandwidth need. And the ISS keeps moving in orbit, so the comms links won't stay permanently stable. Some links may be temporarily available, and may suddenly drop.

This means the ISS network needs to simultaneously have:

* High throughput
* Local storage capability
* Routing management
* Disconnection recovery
* Interoperability between different DTN implementations
* Support for different underlying transports

HDTN's goal is to build a high-speed DTN system that can **automatically manage data flow** in such environments. [1][2]

# Understanding HDTN through a logistics system

Let's return to the logistics analogy from the previous post, which compared DTN to an international logistics system (like DHL).

The traditional Internet is more like a real-time phone call:

```text
Dial → Establish connection → Real-time call
```

DTN is more like logistics delivery:

```text
Ship → Consolidate → Store → Transport → Transfer → Final delivery
```

When shipping a package, the sender and recipient don't need to be online at the same time. The trucks, planes, ports, and distribution centers don't need to form a complete transport line at the same second; the package can stay at a logistics center and wait for the next truck or plane. HDTN can be understood as the **automated warehousing and dispatch platform** behind this logistics system:

| Logistics system | HDTN |
| ------------- | ------------------ |
| Package | Bundle |
| Consolidation center entrance | Ingress |
| Warehouse | Storage |
| Flight and truck schedule | Contact Plan |
| Dispatch and route planning | Scheduler / Router |
| Shipping dock | Egress |
| Next logistics center | Next Hop |
| The actual truck, plane, or ship used | Convergence Layer |

This analogy should resonate, and you can probably see that HDTN doesn't just send data out. What it really does is **decide, based on future usable communication opportunities, whether data should be forwarded immediately now, held temporarily, or rerouted another way.**

# HDTN's core architecture

I personally feel that text descriptions alone aren't as clear as looking directly at Fig. 1 in the original paper. The figure below is the HDTN modules interaction, an overview of how all the internal modules interact. [1]

![HDTN modules interaction (Fig. 1 in [1])](/img/DTN/HDTN.png)

> Fig. 1. HDTN modules interaction. Source: [1]

From this figure you can intuitively see that HDTN's core components roughly include Ingress, Storage, Scheduler, Router, and Egress, with BPGen, BPSink, a Web Interface, the Contact Plan, and a CGR Client coordinating externally. [1] This separation of responsibilities is quite similar to the mainstream microservices or event-driven architecture in modern cloud systems, where each component focuses on a specific task and exchanges state through events.

## Bundle

In an ordinary IP network, we often use the packet as the basic data unit. But in DTN, the main data unit is the **bundle**. A bundle can be understood as a standard shipping container in the DTN world. It contains not just application data, but also the source, destination, creation time, lifetime, and other metadata.

```text
Bundle
├── Source Endpoint
├── Destination Endpoint
├── Creation Timestamp
├── Lifetime
├── Payload
└── Additional Metadata
```

In a traditional network, a packet is usually expected to be forwarded immediately, but a bundle is different. From the start, it's designed to be held at a node, wait, re-forward, and even cross multiple non-continuous contact windows. It's also specifically noted that a bundle's size isn't fixed. **Besides measuring how many bits can be transferred per second, you must also consider how many bundles the system can process per second.** [1] In other words, the challenge of achieving high-speed DTN isn't just network-card speed, because even with sufficient bandwidth, if every bundle requires heavy parsing, memory allocation, and state management, the CPU can still become the bottleneck.

## Ingress

`Ingress` is the first stop after a bundle enters an HDTN node. It receives the bundle, parses the header, confirms the data's source and destination, and decides the next step based on the current link state. The simplest logic is:

```text
Receive Bundle
    │
    ▼
Parse source and destination
    │
    ▼
Is the next hop usable right now?
    │
    ├── Yes ──▶ Hand directly to Egress
    │
    └── No  ──▶ Send to Storage to hold
```

If the link is currently usable, Ingress can use a **cut-through forwarding** style, handing the bundle directly to Egress, reducing unnecessary disk I/O and I/O wait. If the link is currently unusable, the bundle first enters Storage. This is the first key decision in `Store-Carry-Forward`:

> Can I forward now, or must I store first?

## Storage

In an ordinary network, a router usually doesn't hold packets for long; ideally a packet is forwarded immediately after reaching the router. If the queue fills up, packets may simply be dropped and left for the upper-layer protocol to handle again.

But in DTN, waiting may be a normal state. Suppose a lunar probe needs to send data via a relay satellite, but the next contact window won't appear for two hours. In that case, the system can't simply drop the data, nor retry infinitely. `Storage`'s job is to let the bundle safely stay on the node, waiting for the next transmission opportunity.

```text
Bundle arrives at node
      │
      ▼
No usable link right now
      │
      ▼
Write to Storage
      │
      ▼
Wait for LinkUp event
      │
      ▼
Release Bundle from Storage
      │
      ▼
Send to Egress
```

HDTN's Storage uses a **multi-threaded implementation** and can spread data across multiple disks. [1] The reason is intuitive: when large amounts of data enter a node at once, disk I/O and data management itself can become a performance bottleneck, so the Storage module is quite important. Unlike a backup component on terrestrial networks that can always be scaled out, it's a core part of the space DTN architecture.

## Contact Plan

On an ordinary terrestrial network, a router usually chooses a path based on the current network state (SDN), but a space network adds a very special dimension: **time**. The position changes of satellites, space stations, lunar relay stations, and ground stations are often predictable. A given link may not exist now, but appear ten minutes later, and disappear again five minutes after that. So DTN needs to handle a special piece of data: the **Contact Plan**.

The Contact Plan can be understood as a timetable of future contact windows.

```json
[
  {
    "source": 1,
    "destination": 2,
    "startTime": 100,
    "endTime": 300,
    "dataRate": 1000000
  }
]
```

This means:

```text
Node 1 → Node 2
can transfer data between times 100 and 300
with a usable rate of 1 Mbps
```

In a real mission, the Contact Plan may contain more nodes, more windows, and different link rates. The biggest difference from terrestrial networks is: **space routing isn't judged only by "spatial topology," but must also consider temporal topology.**

## Scheduler and Router

With a Contact Plan, the system also needs components to manage data flow according to the schedule. In this HDTN architecture, the `Scheduler` reads the Contact Plan and emits events based on link state: [1]

```text
linkUp
linkDown
```

When Ingress receives a `linkUp` event, it knows a destination is currently usable and can hand the bundle directly to Egress. When Storage receives a `linkUp` event, it can also start releasing previously-held bundles to Egress.

Conversely, if a link drops, the system stops transmitting and reevaluates subsequent paths. On the other hand, the `Router`'s job is to compute the next hop. The Router decides which node a bundle should go to next based on the Contact Plan and destination, then notifies Egress to update the Outduct.

```text
Contact Plan
      │
      ▼
Compute feasible paths
      │
      ▼
Choose Next Hop
      │
      ▼
Emit RouteUpdate
      │
      ▼
Egress updates Outduct
```

HDTN's routing mindset isn't quite the same as ordinary shortest-path algorithms. An ordinary BFS or Dijkstra might only ask:

> Which path is shortest right now?

But space DTN must also ask:

> Which path will appear at the right time?
> How long can this window last?
> Is the usable bandwidth enough for this batch of bundles?
> If this window is missed, how long until the next opportunity?

This is also the core concept of Contact Graph Routing (CGR); see the [previous post](/en/posts/7d41a775.html) too.

## Version differences: the division of responsibilities between Scheduler and Router

A version difference should be added here. The Technical Memorandum describes `Scheduler` and `Router` separately: [1]

* The Scheduler reads the Contact Plan
* The Scheduler emits `linkUp` and `linkDown`
* The Router communicates with the CGR Client
* The Router passes `RouteUpdate` to Egress

But in NASA's currently-public HDTN GitHub README, the Router's responsibilities have been adjusted. The README currently mentions: [3]

* The Router manages link-availability state based on the Contact Plan
* The Router uses Dijkstra's algorithm to compute the next hop
* The Router recomputes paths after a link suddenly drops or the Contact Plan updates
* The Router passes `RouteUpdate` to Egress

So when reading the HDTN architecture, note the paper's publication time and the code version. But regardless of how the module boundaries shift, the overall design spirit hasn't changed:

> Manage link state based on the Contact Plan, and recompute a bundle's next hop when network events occur.

## Egress

`Egress` is a bundle's last stop before leaving an HDTN node. It receives bundles from Ingress or Storage, and sends them to the appropriate Outduct and next hop based on the Router's computed result.

```text
Ingress ─────┐
             │
             ▼
          Egress ─────▶ Outduct ─────▶ Next Hop
             ▲
             │
Storage ─────┘
```

In HDTN, two terms describe the direction of data in and out:

| Name | Purpose |
| ------- | ----------- |
| Induct | Entry point for receiving external data |
| Outduct | Exit for sending data to the next hop |

You can think of the Induct as a logistics center's unloading dock and the Outduct as its shipping dock. The same node may have multiple Outducts, each leading to a different next hop. The Router's job is to tell Egress which exit to use now.

# Event-Driven Architecture: what to do when a link suddenly drops?

Space networks don't always run according to the ideal schedule; there are too many influencing factors. Even if the Contact Plan predicts a link should be usable, the real environment can still have:

* Sudden signal-quality degradation
* Antenna-tracking failure
* Temporary comms-equipment anomaly
* A link dropping early
* A Contact Plan update
* A next-hop node not responding

So HDTN can't rely only on static scheduling; it also needs an event-driven architecture to notify other modules when state changes. HDTN uses **ZeroMQ pub-sub sockets** to pass events. [1] What's that? For example, when Egress finds a link has suddenly vanished, it can emit a `LinkStatus` change notification:

```text
Egress detects link drop
        │
        ▼
Emit LinkStatus Change
        │
        ▼
Scheduler updates link state
        │
        ├──▶ Send linkDown to Ingress
        │
        ├──▶ Send linkDown to Storage
        │
        └──▶ Notify Router to recompute path
```

After the Router recomputes the next hop, it notifies Egress to update the Outduct.

Notice this flow is a lot like the event-driven architecture in modern distributed systems:

```text
Event occurs
   ↓
Publish state change
   ↓
Subscribers receive notification
   ↓
Each module updates its behavior
```

This design means HDTN doesn't have to cram all logic into one large program, and lets different modules keep relatively clear responsibility boundaries.

# Convergence Layer

As the previous post said, the Bundle Protocol isn't meant to completely replace TCP, UDP, or other underlying protocols; it's more like an overlay network, handling cross-node, cross-time data-forwarding logic.

But when a bundle actually has to move from one node to another, it still needs to ride on some actual transport. That's the purpose of the **Convergence Layer**.

```text
Application Data
        ↓
Bundle Protocol
        ↓
Convergence Layer
        ↓
Underlying Transport / Link
```

Using the logistics system again:

| Network concept | Logistics analogy |
| ----------------- | ------------- |
| Bundle | Standard shipping container |
| Bundle Protocol | International logistics rules |
| Convergence Layer | The actual truck, plane, or ship used |
| Physical Link | Roads, air routes, or shipping routes |

HDTN supports several Convergence Layers, including: [1][3]

* UDP Convergence Layer
* Simplified TCP (STCP)
* TCP Convergence Layer Version 3 (TCPCLv3)
* TCP Convergence Layer Version 4 (TCPCLv4)
* Licklider Transmission Protocol (LTP)

Each Convergence Layer suits different scenarios:

| Convergence Layer | Characteristic |
| ----------------- | ----------------------------------- |
| UDP | Simple structure, but doesn't guarantee reliable transport on its own |
| STCP | Relatively lean, suited to efficient data sending |
| TCPCL | Sends bundles over TCP, supporting fuller DTN node connection management |
| LTP | Designed for high-delay and intermittent links, suited to space comms |

# LTP

Among the Convergence Layers HDTN supports, LTP is particularly worth noting. LTP stands for **Licklider Transmission Protocol**, a transport protocol designed for long-delay environments, especially suited to scenarios like deep-space comms where ordinary low-delay assumptions don't hold. [6]

Suppose a link's one-way delay is two seconds, so the round-trip time (RTT) can reach four seconds. In that case, if the system stops and waits for a response after every small chunk, overall throughput will be terrible. So HDTN's LTP implementation needs to maintain many sessions simultaneously to keep the link continuously transmitting.

```text
Session 1  ─────▶ Wait for ACK
Session 2      ─────▶ Wait for ACK
Session 3          ─────▶ Wait for ACK
Session 4              ─────▶ Wait for ACK
...
```

While an earlier session is still waiting for a response, later sessions can keep sending data. Test results indicate that once link delay exceeds one second, increasing the number of concurrent LTP sessions is an important factor in achieving gigabit-level data rates. [1]

This is a lot like the pipeline concept in ordinary high-bandwidth networks: **don't let the whole link sit idle waiting for a single response.**

# How is HDTN different from an ordinary message queue?

If you've used Amazon SQS, RabbitMQ, Kafka, or other message queues, HDTN's architecture may feel somewhat familiar.

They do share some things in common:

| Message Queue | HDTN |
| --------------- | --------------------- |
| Message | Bundle |
| Queue | Storage |
| Producer | Bundle Source |
| Consumer | Destination Node |
| Broker | DTN Node |
| Retry | Retransmission |
| Routing Rule | Contact Plan / Router |
| Durable Storage | Bundle Storage |

But the problems HDTN faces are more special. An ordinary message queue usually assumes the underlying network is roughly available. Even with a brief disconnection, the service is expected to recover in a relatively short time.

HDTN, however, must accept:

* The network may not exist for a long time
* The next connection may be minutes or hours away
* Nodes keep moving
* Contact windows are predictable but very limited
* Bandwidth, delay, and error rate are highly asymmetric
* A relay node itself may also be temporarily offline

So HDTN isn't just moving a message queue into space; it redesigns how data is stored, routed, scheduled, and transmitted in an extreme network environment.

# HDTN's complete data flow

Stringing the earlier components together, a bundle's lifecycle in an HDTN node is roughly as follows.

## Scenario 1: the link is currently usable

```text
Bundle arrives at Induct
        │
        ▼
Ingress parses header
        │
        ▼
Confirm next-hop link usable
        │
        ▼
Hand directly to Egress
        │
        ▼
Egress chooses Outduct
        │
        ▼
Bundle sent to Next Hop
```

This reduces unnecessary Storage I/O and suits data that can be forwarded immediately.

## Scenario 2: the link is currently unusable

```text
Bundle arrives at Induct
        │
        ▼
Ingress parses header
        │
        ▼
Confirm next-hop link unusable
        │
        ▼
Write to Storage
        │
        ▼
Wait for linkUp event
        │
        ▼
Storage releases Bundle
        │
        ▼
Egress sends to Next Hop
```

This is the most typical Store-Carry-Forward flow in DTN.

## Scenario 3: a sudden drop mid-transfer

```text
Egress detects link drop
        │
        ▼
Publish LinkStatus Change
        │
        ▼
Update link state
        │
        ▼
Stop releasing Bundle
        │
        ▼
Router recomputes path
        │
        ▼
Egress updates Outduct
        │
        ▼
Wait for the next usable transmission opportunity
```

For HDTN, a disconnection isn't a system crash, but another event to handle.

# Viewing it through a distributed-systems lens

From a software-engineering standpoint, the most interesting thing about HDTN isn't just space comms, but that it's essentially an event-driven distributed system. It needs to handle:

* Asynchronous events
* Durable storage
* Pipelining
* Route updates
* Backpressure
* Retry
* State synchronization
* Fault recovery
* Multiple underlying transports
* Interoperability between different DTN implementations

These problems aren't rare in existing cloud architectures, but space networks push the conditions to a more extreme direction. A ground system might treat a few seconds of timeout as a service anomaly, while a space system may have to incorporate several minutes of waiting into its normal flow. Another difference is that a ground system may require a service to recover connectivity as fast as possible, but a space system must accept that **no usable path exists at all right now**. One last observation: time in terrestrial networks is usually just a performance metric, while in space DTN, time itself is part of the routing topology.

# ISS testing: HDTN is more than a theoretical architecture

The Technical Memorandum also compiles interoperability and performance tests between HDTN and other DTN implementations, including: [1]

* Interoperability tests between HDTN and DTN Marshall Enterprise (DTNME)
* Bundle Protocol Version 6 (BPv6) and Version 7 (BPv7) tests
* Transmission tests of different Convergence Layers
* Simulated delay and packet loss
* Using HDTN as a gateway node
* Simulations with the ISS network topology
* LTP long-delay link tests

One point worth mentioning is that, to find the cause of the low data rate in the SDIL tests, they later ran a series of "4-box" tests locally at GRC to simulate the data flow between ISS payload, ISS onboard gateway, ground gateway, and ground node. [1] These tests compared not only protocols but also different deployment environments: including **a fully KVM-based virtual machine**, an **LXC container**, **native hardware (bare metal)**, and a **ZBook + KVM image combination** close to the actual ISS onboard gateway. [1]

The result is interesting: although `iperf3` showed these environments all theoretically had decent baseline bandwidth, when actually running end-to-end DTN tests, **the KVM VM environment showed significant performance loss**; in contrast, LXC performed closer to native hardware, and native hardware could reach near line rate. [1] Also, once they included the ZBook + KVM gateway image the ISS actually uses, performance dropped noticeably again; even after trying to adjust the VM's core and memory configuration, the improvement was slight. [1]

In other words, an important takeaway from this experiment isn't just that **HDTN can run**, but that **the virtualization layer itself can become a bottleneck**. The authors explicitly note at the end that these local tests made them suspect the low data rate in the earlier SDIL tests might not have been solely a VPN or DTNME-version issue, and that **KVM itself may also affect performance more significantly than originally expected**. [1]

Another notable test simulated a link with about two seconds of one-way delay and four seconds of RTT. The results show that simply increasing bandwidth isn't enough. The system also needs to tune LTP sessions, pipeline limit, buffer, and other parameters to maintain higher throughput under high-delay conditions. [1]

This illustrates one thing:

> Space network performance isn't a single-NIC or single-protocol problem, but a systems-engineering problem for the whole data-processing pipeline.

# HDTN project status

NASA has made the HDTN source code public on GitHub: [3]

[GitHub: nasa/HDTN](https://github.com/nasa/HDTN)

The currently-public project is written in C++ and built with CMake. It appears to support multiple operating systems and hardware platforms, including Linux, Windows, macOS, FreeBSD, OpenBSD, Raspbian, and ARM64. [3]

Main dependencies include:

```text
CMake
Boost
ZeroMQ
OpenSSL
C++ Compiler
```

The main modules currently in the code include:

```text
Ingress
Storage
Router
Egress
Telemetry Command Interface
```

A test method is also provided; you can observe HDTN's data flow with `tcpdump` and Wireshark:

```bash
sudo tcpdump -i lo -vv -s0 port 4558 -w hdtn-traffic.pcap
```

# Next Hop: does HDTN have to run on a large server?

Having understood HDTN's basic architecture, a natural question arises:

> Since HDTN is already split into Ingress, Storage, Router, and Egress modules, does it have to run fully on a high-end x86 server?

This doubt is reasonable; deep-space exploration intuitively seems to pair with high-end servers. But future space missions can't rely only on large servers. Future lunar bases, satellites, probes, ground stations, and edge nodes may have different:

* CPU architectures
* Memory capacities
* Storage space
* Energy constraints
* Thermal conditions
* Bandwidth needs
* Mission roles

So the paper's future work mentions some directions worth researching:

* Can HDTN be ported to the ARM platform?
* Can it run on a Raspberry Pi?
* Can different modules be split across multiple devices?
* Can an edge device become a space DTN node?
* How much does performance drop under limited hardware resources?

NASA has since also researched the Raspberry Pi and ARM platforms. [3]

I'll leave this for the next post to explore:

> How to run NASA HDTN on a Raspberry Pi?
> From ARM porting and CMake build modifications to distributed deployment

# Closing

The previous post introduced why DTN suits the space environment.

This one further breaks down NASA HDTN's software architecture, explaining that Store-Carry-Forward isn't an abstract term but an engineering flow completed by multiple components together.

HDTN's core components include:

| Component | Function |
| ------------------ | ---------------------- |
| Bundle | A data unit that can be passed across time and nodes |
| Ingress | Receives bundles and decides whether to forward immediately |
| Storage | Holds bundles when a link is down |
| Contact Plan | Describes future usable contact windows |
| Scheduler / Router | Manages link state and computes the next hop |
| Egress | Hands bundles to the correct Outduct |
| Convergence Layer | Lets bundles ride on actual transport protocols |
| ZeroMQ Events | Synchronizes state when a link fails or the schedule changes |

To summarize HDTN's design spirit in one sentence:

> HDTN doesn't assume the network always exists; it lets data wait safely when the network doesn't exist, and keep moving forward when the next communication opportunity appears.

This architecture isn't only applicable to the ISS; it may also become an important underlying capability for future lunar, Mars, and deep-space infrastructure.

---

# References

1. Daniel Raible, Rachel Dudukovich, Brian Tomko, Nadia Kortas, Blake LaFuente, Dennis Iannicca, et al., **Developing High Performance Space Networking Capabilities for the International Space Station and Beyond**, NASA/TM-20220011407, 2022.
   [NASA Technical Reports Server](https://ntrs.nasa.gov/api/citations/20220011407/downloads/TM-20220011407.pdf)

2. NASA Glenn Research Center, **High-Rate Delay Tolerant Networking (HDTN)**.
   [NASA Official Website](https://www.nasa.gov/glenn/glenn-expertise-space-exploration/scan/high-rate-delay-tolerant-networking/)

3. NASA, **High-rate Delay Tolerant Network (HDTN) Software**.
   [GitHub: nasa/HDTN](https://github.com/nasa/HDTN)

4. IETF, **RFC 9171: Bundle Protocol Version 7**.
   [RFC 9171](https://datatracker.ietf.org/doc/html/rfc9171)

5. IETF, **RFC 9174: Delay-Tolerant Networking TCP Convergence-Layer Protocol Version 4**.
   [RFC 9174](https://datatracker.ietf.org/doc/html/rfc9174)

6. IETF, **RFC 5326: Licklider Transmission Protocol, Specification**.
   [RFC 5326](https://datatracker.ietf.org/doc/html/rfc5326)
