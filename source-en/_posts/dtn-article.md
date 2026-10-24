---
title: "Why Space Networking Needs DTN: From TCP/IP's Limits to Deep-Space Networks"
tags:
  - Space Networking
  - DTN
  - Bundle Protocol
  - NASA
  - Distributed Systems
categories:
  - Space Infrastructure
description: >-
  An introduction to the core concepts of Delay/Disruption-Tolerant Networking,
  explaining why space networks can't directly apply the terrestrial Internet's
  TCP/IP assumptions, and understanding future space-network architecture through
  the lens of NASA LunaNet, the Bundle Protocol, and Contact Graph Routing.
toc: true
aside: true
cover: /img/DTN/cover.png
abbrlink: "7d41a775"
date: 2026-05-05 18:56:21
---

> 🌐 中文版：[繁體中文](/posts/7d41a775.html)

# Preface: can we still get online smoothly in space?

> I recently watched the [livestream of NASA's Artemis II lunar flyby mission](https://youtu.be/_eeZQw9PBc0). Watching the rocket lift off, I felt I'd witnessed another milestone for humanity.
> In recent years, progress from NASA, the Commercial Lunar Payload Services (CLPS), SpaceX's Starship, and various countries' investment in lunar and deep-space missions has made **space infrastructure** no longer just a sci-fi concept but increasingly a matter of engineering practice. But as an engineer, a very practical question came to mind: "If we want to develop technology in space, or even build bases, can we take our existing terrestrial network architecture and use it directly in space?" To answer this, I dug into some related papers and technical documents. This post is my study notes and summary.

Intuitively, we might think: "Just make the antennas bigger, push up the signal power, and launch a few more relay satellites, and we can extend the Earth's Internet into space, right?" But in reality, the challenges space networks face are absolutely not simply **insufficient bandwidth** or **weak signals**.

**The most fundamental problem is that the basic assumptions of the entire network environment completely change in space.**

The Internet on Earth usually assumes that an end-to-end path is clear most of the time, and packets reach their destination in a very short time. A disconnection is usually treated as an "abnormal condition." But in space networks, extremely long delays, intermittent connectivity, and communication interruptions are the norm. NASA's introduction to **DTN (Delay/Disruption-Tolerant Networking)** also notes that DTN aims to provide a more reliable, standardized way of transferring data in long-delay, interruption-prone environments like space communications ([NASA][1]).

{% note info %}
DTN's core isn't to find a way to make the speed of light faster, but to frankly accept that "delay and interruption are unavoidable," and redesign network transport as a system that can store, wait, hand off, and recover.
{% endnote %}

---

# Why isn't the Earth's Internet suitable for the space environment?

Every day we scroll our phones, call APIs, and log into remote servers, all of which silently rely on a set of TCP/IP assumptions we take for granted:

* There's definitely a connected path between source and destination at this moment
* Round-trip latency (RTT) is extremely low, usually milliseconds to a few hundred milliseconds
* If a packet is lost, it usually means congestion, equipment failure, or transient interference
* A disconnection is an exception, not the norm
* The routing topology changes, but never dramatically at the scale and speed of celestial motion

On Earth these assumptions are very reasonable. Even for intercontinental connections, latency usually stays within what TCP can tolerate; and even if some router in the middle fails, the underlying routing protocols quickly find an alternate route.

**But the space environment is an entirely different story.**

In space, the Earth, Moon, Mars, satellites, probes, and ground stations are all in relative motion. The **contact window** between communication nodes may only appear at specific times. On top of that, different antenna angles, individual equipment energy limits, different orbital positions, and even celestial occlusion all directly determine whether a given link is up at that moment.

NASA's **ION-DTN** teaching materials also note: extreme distances, extremely high data loss rates, topology changes from orbital motion, and spacecraft operating discontinuously to save power all make space communication several dimensions more complex than terrestrial networks ([ion-dtn.readthedocs.io][2]).

We can use a table to quickly contrast the two:

| Dimension | Terrestrial network assumption | Space network reality |
| :--- | :--- | :--- |
| **Path connectivity** | An end-to-end path usually exists | An end-to-end path may temporarily not exist |
| **Network latency (RTT)** | Usually extremely short (milliseconds) | Can be seconds, minutes, or even longer |
| **View of disconnection** | An anomaly or error | A normal state |
| **Topology stability** | Relatively stable | Constantly changing with orbits and contact windows |
| **Retransmission cost** | Relatively cheap | Very expensive, and can miss the contact window |
| **Node state** | Equipment mostly online 24/7 | Spacecraft often in low-power, offline, or occluded states |

{% note warning %}
On terrestrial networks, a disconnection usually means something is broken, but in space networks, a disconnection is very likely just an everyday part of the network topology.
{% endnote %}

# Three fatal flaws of TCP/IP in the space environment

## 1. The scale of delay: from milliseconds to "minutes"

If you took intro to computer science in college, you know TCP's design relies heavily on ACKs, timeouts, retransmission, and congestion control. These mechanisms work great on Earth because RTT is short. But in space, distance amplifies delay mercilessly:

* Between low-orbit satellites and ground stations, it might barely stay in the milliseconds-to-tens-of-milliseconds range
* Earth-to-Moon one-way light travel is about 1.3 seconds, so RTT reaches 2.6 seconds
* For Earth-to-Mars, delay varies with the two bodies' orbital positions and can reach from several minutes to over twenty minutes

This means that if we insist on establishing a traditional TCP session between Earth and Mars, the connection might time out just during the handshake and waiting for a single ACK. Worse, TCP would misinterpret this **physically long delay or occlusion-based disconnection** as **network congestion**, triggering rate reduction and retransmission that utterly cripple throughput.

## 2. Intermittent connectivity: the other side isn't always there

Space nodes aren't always mutually visible. Imagine these scenarios:

* A lunar rover drives into a crater and may not have line of sight to Earth
* A probe on the far side of the Moon must wait for a relay satellite to fly over before it can send data to Earth
* A satellite may temporarily shut off its comms module to save its energy budget
* The rotation and revolution of the Sun, planets, and satellites themselves constantly cause signal occlusion

> The space version of the networking problem may not be "is there a complete path to take right now?"
> but rather: **since there's no path right now, when is the next available communication opportunity? Until then, who should hold onto this piece of data?**

## 3. Treating interruption as the norm: disruption as topology

As mentioned, a disconnection on Earth means a fault or anomaly, but an interruption in space is often just because **a satellite flew out of visible range** or **an antenna is slewing**. So space networks need not a simple, aggressive retry mechanism, but a network architecture that incorporates "interruption" itself into its normal operating model. And that's exactly the impetus for DTN's birth.

---

# DTN: Store-Carry-Forward

DTN stands for **Delay/Disruption-Tolerant Networking**.

It's a network architecture designed specifically to handle long delays, intermittent connectivity, unstable links, and high error rates. `IETF RFC 9171` explicitly states that DTN is an architecture suited to **highly stressed environments** ([IETF Datatracker][3]).

Traditional networking's logic is straightforward:
```text
Send -> Route -> Deliver immediately
```

DTN's logic is:
```text
Store -> Carry (while disconnected) -> Forward (when a connection opportunity arises)
```

The aerospace industry usually calls this pattern **Store-Carry-Forward**. When a DTN node receives data, it doesn't need to forward it immediately. If the next hop isn't currently in visible range, it can safely "store" the data on local disk or memory, and then "forward" it when the next contact window appears.

{% note success %}
DTN's mindset is no longer about finding a path that's connected right now, but about planning how data should traverse a series of "future" communication opportunities to finally relay to its destination.
{% endnote %}

# A real-world analogy for DTN

Here's an analogy: if TCP/IP is like a real-time phone call, then DTN is more like an international logistics system. When you ship a package, the sender and recipient don't need to be online at the same time, and the trucks, planes, and logistics centers don't need to be connected into one line at the same second. Your package first reaches a consolidation center (`Store`), flies across the Pacific with a plane (`Carry`), and once it reaches the destination country's sorting center, is handed to a local driver for delivery (`Forward`).

That's also how DTN works:

| Property | Traditional Internet | Space DTN |
| :--- | :--- | :--- |
| **Analogy** | Real-time phone call | Postal / logistics system |
| **Data unit** | Packet (forwarded immediately) | Bundle (can be held) |
| **Path dependency** | Needs a continuous end-to-end path | Relies on a series of future communication opportunities (contacts) |
| **Time tolerance** | Extremely sensitive to timeouts | Can tolerate long waits |
| **Communication model** | Session-oriented | Message/object-oriented |
| **View of disconnection** | A failure | A normal state |
| **Routing consideration** | Based on the current topology state | Based on a dynamic topology with a "time axis" |

> In other words: **in space, waiting itself is part of what the network protocol must handle.**

# Bundle Protocol

In the DTN world, the most central protocol is the **Bundle Protocol (BP)**.

If the basic data unit of a traditional IP network is the **packet**, then DTN's basic data unit is the **bundle**.
You can think of a bundle as a **standard shipping container** in the DTN world: it doesn't just carry data, but also includes the source, destination, creation time, lifetime, and the metadata needed for subsequent routing, security, and status tracking.

This is also the biggest difference between a bundle and an ordinary packet. A packet usually assumes it will be forwarded immediately by the network; a bundle is designed to be held by a node, sent later, handed off across nodes, and continue waiting for the next transmission opportunity after an interruption.

The most modern Bundle Protocol version is **BPv7**, defined in IETF RFC 9171. CCSDS (the Consultative Committee for Space Data Systems) also published a BPv7-based experimental space-communication specification in 2025. This means BPv7 is no longer just an academic concept, but is increasingly being incorporated into the standardization foundation for future space data systems and mission interoperability ([ccsds.org][4]).

{% note info %}
The point of the Bundle Protocol isn't to slice data smaller, but to turn data into mission-level message units that can be "stored, waited on, handed off, and tracked."
{% endnote %}

## What's actually inside a bundle?

To aid understanding, we can simplify a bundle into this structure:

```text
Bundle
├── Primary Block
│   ├── Source Endpoint
│   ├── Destination Endpoint
│   ├── Creation Timestamp
│   └── Lifetime
├── Extension Blocks
│   ├── Routing Metadata
│   ├── Security Metadata, e.g. BPSec
│   └── Other mission- or protocol-related info
└── Payload Block
    └── The actual mission data, e.g. science data or telemetry
```

The most important are the `Primary Block` and the `Payload Block`.

The Primary Block provides the basic information needed for this bundle to be identified and processed in the DTN network, such as source, destination, and lifetime. The Payload Block carries the actual mission data to be sent. Extension Blocks provide extra capabilities such as security, routing-assist info, or other metadata.

In other words, a bundle isn't just the data itself, but a data container with context. It knows where it came from, where it's going, and how long it can live, and it can carry extra information so relay nodes can still make forwarding decisions without an end-to-end connection.

### The internal structure of a Bundle Node

Having understood bundles, the next question is: **who's responsible for handling these bundles?**

In the BPv7 architecture, the conceptual node responsible for sending, receiving, and processing bundles is called a Bundle Node, a DTN node composed of several functional components. The `CCSDS BPv7 Experimental Specification` describes a Bundle Node as any entity that can send and/or receive bundles. Architecturally, it mainly consists of three conceptual components:

- Application Agent (AA)
- Bundle Protocol Agent (BPA)
- Convergence Layer Adapter (CLA)

![Graphical Representation of a Bundle Node](/img/DTN/bundle-node-ccsds.png)
> Ref: Graphical Representation of a Bundle Node. Source: CCSDS 734.20-O-1, "Bundle Protocol Specification, Experimental Specification," Figure 1-1 [4]

This figure can be understood as follows:

| Component | Function |
| :--- | :--- |
| **Application Agent (AA)** | Interacts with upper-layer applications, including handling application data and administrative records |
| **Administrative Element (AE)** | Generates and processes administrative records, e.g. bundle status reports |
| **Application-Specific Element (ASE)** | Handles the actual application data, e.g. science data, telemetry, or mission payload |
| **Bundle Protocol Agent (BPA)** | Executes the Bundle Protocol's own procedures: receiving, processing, storing, and forwarding bundles |
| **Convergence Layer Adapter (CLA)** | Sends bundles over different underlying networks, e.g. TCP, UDP, LTP, or CCSDS link protocols |

> In short, the AA handles application-layer data, the BPA handles the Bundle Protocol's core logic, and the CLA handles actually sending the bundle over some underlying network segment.

This layered design suits space networks well, because the same Bundle Node may face several different links at once. For example, it interacts with ground systems over TCP/UDP on one side, and communicates with spacecraft over LTP or a CCSDS space link on the other. The upper-layer application only needs to hand data to BP; whether a given segment goes over the terrestrial IP network, a lunar-surface local network, or a deep-space link is handled by different CLAs.

## Convergence Layer

So BP isn't meant to replace TCP, UDP, RF, optical comms, or the CCSDS link layer. More precisely, BP is an **overlay layer** responsible for DTN-level data-delivery semantics, not the actual transport details of each underlying link segment.

BP uses the so-called **Convergence Layer (CLA)** to decide how this container should be transported *over the current segment*. On Earth it might go over TCP/UDP; in space it switches to **LTP (Licklider Transmission Protocol)** or the **CCSDS link layer**.

What actually sends a bundle over a given link is the CLA, which you can think of as the different modes of transport in a logistics system:

| DTN architecture | Logistics analogy |
| :----- | :---------- |
| Bundle | Standard shipping container |
| BPA    | Logistics dispatch center |
| CLA    | Truck, ship, plane, or rail |
| Underlying network | Actual roads, routes, or rail network |

In the ground segment, a bundle might be transported over a TCP/UDP convergence layer, while over long-distance or interruption-prone space links it might switch to LTP or CCSDS-related link protocols.

{% note info %}
In short: BP coordinates the long-term strategy from departure to arrival, while the Convergence Layer only handles the short haul from this stop to the next.
{% endnote %}

Having understood bundles, Bundle Nodes, and the Convergence Layer, DTN's basic operating logic becomes clear: data is first encapsulated into a bundle, stored and processed by Bundle Nodes, and handed off stop by stop across various underlying networks via different CLAs.

But the next question arises:

> If nodes in space aren't always connected to each other, how does a Bundle Node know when it can hand off data? And which next hop should it choose?

This brings us to a crucial concept in DTN routing: the **Contact Plan**.

# Contact Plan

Having understood the Bundle Protocol, the next question is: **how does a space network do routing?**

On terrestrial networks, routers usually decide a packet's next hop based on the current network topology. But in a space network, a link being down now doesn't mean it's down forever; it may just be waiting for the next orbital position, the next ground-station contact window, or the next time a satellite enters comms range. So in DTN, we first need an important concept: the **contact**, a **communication opportunity**.

In DTN, a contact means: **"an opportunity for two nodes to send data to each other during a specific time window."** It's not just a connection; it carries `time` and `capacity` attributes, for example:

```yaml
contact:
  from: LunarRelay-1
  to: EarthGroundStation-Madrid
  start: 2026-05-05T10:00:00Z
  end: 2026-05-05T10:12:00Z
  data_rate: 50Mbps
  latency: 1.3s
```

> Collect all known future contacts and you get a **Contact Plan**.

If a terrestrial network's routing table is a flat map of the current network, then a space network's Contact Plan is a three-dimensional timetable with a fourth dimension (time). It's a bit sci-fi, and the following helps illustrate it:

![](/img/DTN/contact-plan.png)

> So you can think of a Contact Plan as a space topology map with its own time axis.

# Contact Graph Routing (CGR)

With a timetable, we need an algorithm to plan the route. Traditional network AS protocols like OSPF or BGP only care about where a path exists right now, but in space the decision logic must become:

* When does this path become available?
* How long is the contact window? Is it enough to transfer all the data?
* Is the next relay node's disk full yet?
* Is there a route that departs later but arrives earlier?

To solve this, **Contact Graph Routing (CGR)** was born.

CGR doesn't find a path on ordinary network nodes, but on a graph built from **future communication opportunities (contacts)**, **using a modified Dijkstra algorithm to find the optimal solution** ([NASA technical report][6]).

![](/img/DTN/cgr.png)

> So compared to a traditional graph problem, in the CGR world, **spatial distance isn't the only consideration; the timing opportunity is the key that decides whether data can arrive.**

# NASA LunaNet

DTN is absolutely not a concept that only lives in papers or simulators; it's already core to NASA's plans for the future lunar network architecture.

To support future lunar missions, NASA proposed **LunaNet**. It isn't a single satellite, but a standardized network framework. The goal is to let different countries' probes, different vendors' relay satellites, and even lunar-surface bases all interconnect, forming a **Lunar Network of Networks** ([NASA][5]).

In this architecture, DTN is the cornerstone of LunaNet's reliable data transport.

![](/img/DTN/datastream.png)

Even if a probe can never talk directly to Earth, as long as there's a solid Contact Plan and the DTN protocol, scientific data can still be sent back to Earth steadily, relay by relay, like a relay race.

# An extreme distributed system!?

If you're like me, an engineer with more of a cloud-infra background, you can actually think of DTN as a **distributed system operating in an extreme environment**.

Because space networking isn't just an underlying comms protocol; it actually covers a large and complex set of systems-engineering topics:

| Distributed systems concept | Space DTN's corresponding implementation |
| :--- | :--- |
| **Queueing** | Bundle queue / priority scheduling |
| **Scheduling** | Contact-aware forwarding |
| **Replication** | Custody transfer (handing off custody and backup) |
| **Fault Tolerance** | Disruption-tolerant delivery |
| **Resource Allocation** | Allocating node storage (buffer) and energy |
| **Observability** | Bundle status reports / trajectory tracing |
| **Security** | BPSec / node identity authentication |

In ground systems, we mostly pursue speed, that millisecond-level real-time consistency, but in space networks we can only rely on **eventual delivery**, because in space, reliability isn't defined as delivering immediately, but as the data never being lost no matter how many disconnections and waits it goes through. These data may be key metrics from exploration equipment or expensive spacecraft, or scientific observation data; either way, they're worth waiting for.

# Advanced topics and future challenges

Although DTN standards are gradually maturing, in practice there are many hardcore pits left to fill:

## 1. Capacity-aware Routing
CGR is great at finding paths, but what if a relay node's buffer is about to overflow? What if multiple high-priority science missions are all competing for the same contact window? Perfectly integrating a node's storage capacity and link bandwidth into routing decisions is a major hot area right now.

## 2. ML-assisted vs Deterministic Routing
Some propose bringing machine learning into DTN to predict the best route. But in expensive space missions, explainability and determinism are often preferred over black-box AI. That is, how to make a routing algorithm both adapt to dynamic changes and let the ground control center precisely track and override decisions is, I think, one of the directions for deeper research into future space networks.

## 3. Security-aware Routing
When a space network becomes a multi-national, multi-institution shared network, security becomes paramount. How do you prevent malicious nodes from attacking, jamming or tampering with the Contact Plan, or even paralyzing other nodes' buffers by sending junk bundles? These all need tighter trust mechanisms to guard against, and security is an issue in every field.

# A simple Space DTN lab

This sounds like tech only NASA is qualified to play with, but we can actually set up a minimal proof-of-concept (PoC) environment with an ordinary computer and Docker, because it's essentially a distributed system with extreme properties.

We only need to carve out three nodes:

```text
Node A (lunar rover) -> Node B (orbital relay satellite) -> Node C (Earth ground station)
```

You can deliberately set the connection between A and B to only 60 seconds, and observe how Node B buffers the data, waits for the contact window with Node C to arrive, and finally forwards the data.

![](/img/DTN/experiment.png)

You can use `tc netem` to simulate tens of seconds of extreme delay, or use the open-source **ION-DTN** or **HDTN** to test a BPv7 implementation. Going a bit further, you can hook up Prometheus and Grafana to observe DTN's core behavior under disconnection, delay, and contact-window constraints. Without actually launching a rocket, you can experience the design logic of deep-space communication architecture right on your laptop.

# Closing

The Earth's Internet is so great probably because it's built on a stable, low-latency environment where everyone is almost always online. Fixed servers, data centers, networking equipment, and undersea cables weave all of this together. But in space, distance itself brings unavoidable delay, and orbital motion brings relentless disconnection. None of this can obviously be brute-forced away by adding bandwidth.

The fascinating thing about DTN is that it completely breaks our craving for real-time connectivity: data hitches rides through the universe, relaying step by step toward its destination.

---

# References

1. NASA, **Delay/Disruption Tolerant Networking**. ([Link][1])
2. ION-DTN Documentation, **Introduction to Delay/Disruption Tolerant Networking**. ([Link][2])
3. IETF, **RFC 9171: Bundle Protocol Version 7**. ([Link][3])
4. CCSDS, **Bundle Protocol Version 7 (BPv7) Experimental Specification**, 2025. ([Link][4])
5. NASA, **LunaNet Interoperability Specification Document Version 5**, 2025. ([Link][5])
6. NASA NTRS, **Multigraph-based Routing in Delay Tolerant Networks**, 2023. ([Link][6])
7. T. Alhajj and V. Corlay, **Improved Contact Graph Routing in Delay Tolerant Networks with Capacity and Buffer Constraints**, arXiv, 2024/2025. ([Link][7])
8. NASA NTRS, **Delay Tolerant Network Routing as a Machine Learning Classification Problem**, 2018. ([Link][8])
9. NASA, **DTN Resources for Mission Developers**. ([Link][9])
10. NASA, **Delay/Disruption Tolerant Networking Overview**. ([Link][10])
11. NASA NTRS, **Contact Multigraph Routing: Overview and Implementation**, 2023. ([Link][11])
12. NASA NTRS, **Dynamic Routing for Delay-Tolerant Networking in Space Flight Operations**, 2008. ([Link][12])

[1]: https://www.nasa.gov/communicating-with-missions/delay-disruption-tolerant-networking/
[2]: https://ion-dtn.readthedocs.io/en/ion-open-source-4.1.4-b.1/ion-tutorials/Day%201%20morning%20-%20DTN%20overview.pdf
[3]: https://datatracker.ietf.org/doc/rfc9171/
[4]: https://ccsds.org/wp-content/uploads/gravity_forms/5-448e85c647331d9cbaf66c096458bdd5/2025/06/734x20o1.pdf
[5]: https://www.nasa.gov/wp-content/uploads/2025/02/lunanet-interoperability-specification-v5-baseline.pdf
[6]: https://ntrs.nasa.gov/api/citations/20230007392/downloads/Multigraph_CGR_for_ICCCN.pdf
[7]: https://arxiv.org/html/2410.15546v2
[8]: https://ntrs.nasa.gov/api/citations/20190000830/downloads/20190000830.pdf
[9]: https://www.nasa.gov/technology/space-comms/delay-disruption-tolerant-networking-mission-resources/
[10]: https://www.nasa.gov/reference/delay-disruption-tolerant-networking-overview/
[11]: https://ntrs.nasa.gov/api/citations/20230002637/downloads/AeroConf_2023___Contact_Multigraph_Routing-20230221.pdf
[12]: https://ntrs.nasa.gov/citations/20150014822
