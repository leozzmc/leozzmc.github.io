---
title: "\U0001F5C2️Paper Review: O-RAN and Virtualized 5G Networks"
description: O-RAN paper reading
toc: true
tags:
  - O-RAN
  - 5G
categories:
  - Paper Reading
aside: true
abbrlink: "a1cfeb54"
date: 2021-08-11 01:17:57
---

> 🌐 中文版：[繁體中文](/posts/a1cfeb54.html)

{% note primary no-icon%}
This is a survey paper.
**Title**: "Open, Programmable, and Virtualized 5G Networks: State-of-the-Art and the Road Ahead"
**College**: Institute for the Wireless Internet of Things, Northeastern University
**Authors**: Leonardo Bonati, Michele Polese, Salvatore D'Oro, Stefano Basagni, Tommaso Melodia
**Citation**: 24
{% endnote %}

# Abstract
5G brings many benefits, and software-defined cellular networks bring many changes. There are currently many open-source 5G projects, and this paper introduces many current open-source 5G projects and their internal details, along with their frameworks and corresponding hardware environments and testbeds.

# Introduction

5G applications are diverse: VR, remote surgery, high-resolution streaming video, private cellular networks. But traditional mobile-network architecture is relatively inflexible and inelastic, unable to meet the conditions for realizing 5G applications. Current mobile networks' black-box approach brings many limitations; for example, hardware/software is plug and play but lacks reconfiguration ability and can't control a large amount of available resources, making it hard to achieve real-time traffic control in network operations, hard to manage resources, with unoptimized performance, and hard to realize **Connectivity-as-a-Service (CAAS)** technologies like private cellular networks.

Both industry and academia believe 5G should change this plug-and-play approach, adopting programmable, open, resource-sharing, edge-oriented network solutions, such as SDN, network virtualization, and MEC (Multi-access Edge Computing), which make dynamic network control and agile management possible. Likewise, **network slicing** and **C-RAN (Cloud RAN)** have proven that infrastructure sharing can not only maximize resource utilization but also bring new market opportunities. Traditional closed telecom networks are hard for ordinary people to access, but today software examples defined by GNU Radio Libraries have been incorporated into **OpenAirInterface (OAI)** and **srsLTE**, and can be quickly deployed on commercial SDR devices. Software frameworks like O-RAN run on white-box servers and allow reconfiguration and optimization of network and transceiver functions.

# Architectural enablers of 5G cellular networks
## Architecture

Mobile networks have changed their overall architecture, from the old black-box hardware with dedicated firmware to an architecture based on open software running on SDRs or other hardware, but this has actually been discussed continuously since the 4G era. 5G, from its spec, has great agility and flexibility for deployment, and in the early stages software-ized services were also being built. This **flexibility-by-design** made 5G cooler from the start. This chapter introduces the network architecture from 4G to 5G, RAN, core network, deployment examples, SDN, NFV, network slicing, MEC, and intelligent networks.
![](https://i.imgur.com/5fc7spi.png)

From this figure, 4G and 5G deployments seem no different, but the internal composition and configuration of the core network differ a lot.
|Composition|4G|5G|
|---|---|---|
|RAN|LTE|NR|
|Core|EPC|5GC|

In the 4G EPC, many components used to run on proprietary hardware and only recently started being deployed in software.
5GC, on the other hand, was designed from the start based on a service-based approach: the EPC server is split into many **virtual network functions** providing specific functions, communicating with each other through open standard interfaces; 5G RAN has a similar split principle (CU/RU), etc.
### NR
- wider range of carrier frequencies (mmWave Spectrum)
- frame structure: OFDM-based, more flexible, with a variable number of symbols delivered in each sub-frame, and able to use larger bandwidths than LTE (400MHz per carrier)
- integration of signals and procedures to manage mmWave directional transmission
- **5G RAN can connect to a 4G EPC (non-standalone config) and a 5G 5GC (standalone config)**
- NR base stations = gNodeBs allow distributed deployment: different parts of the protocol stack can be distributed across different hardware components
- In NR's protocol stack, an **SDAP (Service Data Adaptation Protocol) layer** is stacked on top of PDCP, managing QoS for point-to-point traffic and mapping it to local resources on the gNodeB-UE link; other layers are updated to achieve NR functionality

### CU/DU split and the virtualized RAN architecture
The most innovative thing in NR is splitting the higher layers of the 3GPP stack (PDCP, SDAP, RRC) from the lower layers (RLC, MAC, PHY) into two different logical units, the CU (Control Unit) and DU (Distributed Unit), which can be deployed in different places. The lower part of the physical layer can be separated from the DU into an independent RU (Radio Unit); the CU, DU, and RU can communicate with each other at different data rates and latencies via well-defined interfaces.
This architecture appears in 3GPP and makes a virtualized RAN (vRAN) possible:
`antenna elements` $\longrightarrow$ `RU`
`baseband, signal processing units` $\longrightarrow$ `CU, DU`
All of the above can run on general-purpose or multi-vendor platforms or hardware components, and if the interfaces between different RAN components are open, deployment follows the O-RAN model.

### The 5G Core
With the service-based approach, control- and user-plane core functions are split into multiple network functions, and 3GPP defines APIs for these, enabling flexible network deployment and network slicing.
- **UPF (User Plane Function)**: the gateway between the user and the network, acting as the mobility anchor and the **QoS classifier**
- **CPF (Control Plane Function)**: the 4G MME is mostly distributed into the **AMF (Access and Mobility Management Function)**; the **SMF (Session Management Function)** allocates IP addresses to UEs and orchestrates user-plane services (e.g. which UPF the UE should use)

## Enabling technologies for softwarized 5G cellular networks
5G integrates different functional components, and the architecture will be very large, with management being a challenge. 5G networks reference the broad and complete processes and architectures of the cloud-computing ecosystem, integrating virtualization and softwarization to abstract services and functions from the original hardware.

### `Softwarization and software-defined networking`
To integrate functions and configuration parameters across different vendors' hardware components, 5G systems rely on **softwarization**:
1. SDN 
2. OpenFlow protocol

> SDN: decouples network control from the data plane, separating routing and controlling procedures from the original hardware-based forwarding operations. In 5G, it separates RAN and edge hardware components from their network and service functions.

In the RAN architecture, only the RU retains basic transmit/receive functions; the rest of the control and processing is controlled by software via open interfaces and APIs.

### `Network function virtualization (NFV)`
Each network function is implemented in software via a VNF (Virtual Network Function) running on a VM (built on general-purpose hardware). One advantage of NFV is that each VNF provides atomic-level functionality, **so multiple VNFs can be combined** to create more complex, specific network functions.

![](https://i.imgur.com/H0J0R7K.png)
1. The Network Orchestrator: manages the VMs on the object infrastructure and the services they run
2. VNF: runs on a VM and performs a network function
3. NFVI (Network Function Virtualization Infrastructure): composed of various general-purpose hardware

> open-source network virtualization project: **Open Platform for NFV (OPNFV)**
> provides testing tools and validation programs to accelerate enterprises' and service providers' network transformation to NFV

## RAN and Core Network slicing
Network slicing is a multi-tenancy virtualization technology in which network functions are abstracted from hardware and software and provided as slices to so-called `tenants`. The physical infrastructure (base stations, fiber) is shared among multiple tenants, and a tenant may receive one or more slices. Each slice is allocated specific physical resources, and an independent virtual network is [**instantiated**](https://www.ibm.com/docs/zh-tw/spss-modeler/SaaS?topic=node-what-is-instantiation) on those physical resources. Although tenants have resource control over their own slices, they can't interact with other slices, which is called **slice isolation/orthogonality**.

Each slice covers specific network functions of the RAN and core parts, and a tenant can provide CaaS (for private cellular networking) to mobile users via RAN slice instantiation on selected base stations. RAN slices can also be allocated to specific services, users, and applications, e.g. allocating a slice to a resource-demanding application (AR/VR).
![](https://i.imgur.com/EguDz3w.png)

This figure shows how slicing lets infrastructure resources be shared and supports instantiating multiple slices embedded in infrastructure components, and lists the related open-source software projects and which parts of this architecture each controls, configures, and instantiates.

### Advantages of network slicing:
1. Each slice can be reserved to handle a specific traffic class with different security requirements and allocated a different amount of resources, achieving infrastructure-level **service differentiation**
2. Slices are software-controlled, enabling real-time, on-demand instantiation, reconfiguration, and revocation of network slices to adapt to time-varying traffic demands and meet **SLAs (Service Level Agreements)**
3. Underutilized resources can be rented out as network slices to `MVNOs (Mobile Virtual Network Operators)` to maximize resource utilization and give infrastructure providers new monetization opportunities

Network slices need to be dynamically orchestrated, instantiated, and revoked, meet SLAs, and have strong tolerance for faults or interruptions.

**OSSs (Operations Support Systems)**
OSS can serve as a tool to guarantee service fulfillment through closed-loop control and management of network slices.
Meanwhile, operators and infrastructure owners providing slice services to vertical industries must generate diverse offerings through slices dedicated to reflecting vertical-industry needs.
**BSSs (Business Support Systems)**
BSS will need to control this diverse environment and implement dynamic billing and pricing mechanisms for each slice.

## Multi-access edge computing
5G's high-performance signal processing, transmission mechanisms, and data rates still can't meet its throughput and low-latency requirements, such as handling real-time applications like VR/AR, and **MEC** can solve this.

MEC moves the architecture's basic components closer to the user; built on edge computing, content caching, NFV, and SDN, MEC provides an effective solution for 5G applications' latency and throughput needs.

1. Since content and data are processed at the edge, data only needs to be transmitted to the CN occasionally, reducing transmission latency and the CN's burden.
2. It supports localized service provisioning, providing cellular private networks for health, environmental monitoring, edge IoT computing, etc.

## Intelligence in the network
`ML/AI`
Data-driven, automated 5G networks become possible, and different use cases can be used to train and optimize the RAN. Use cases range from predicting traffic demand to scale CN resources, to reducing latency in ultra-reliable low-latency communication (URLLC).

The framework realizing this is O-RAN, which monitors data, learns, and executes closed-loop control via a RIC that interacts with the gNB and eNB.

# The radio access network
> This chapter describes the open-source libraries and frameworks for deploying 4G/5G; the details can be found on the projects' official sites, so they aren't elaborated here.

### OpenAirInterface
https://openairinterface.org/
### srsLTE
https://www.srslte.com/
### Radisys open source RAN contributions
https://www.radisys.com/solutions/openran
# Core Network
This chapter describes the mainstream open-source solutions for 4G/5G, i.e. EPC and 5G Core.
## Evolved Packet Core (EPC)
The 4G EPC implementation was discussed in section 2.1 and usually includes

```[]
- MME(Mobile Management Entity)
- Home Subscription Server(HSS)
- Service Gateway(SGW)
- Packet Gateway(PGW)
```

**MME (Mobility Management Entity)**
- control messages for establishing a connection with the UE
- paging and mobility procedures
- NAS signaling
- security functions like tracking-area-list management
- PGW/SGW selection
- UE authentication
- reachability procedures
- bearer management
i.e. the tunnel between UE and PGW in the EPC case, and between UE and UPF in the 5GC case
- supports the control-plane signaling protocol between EPC and E-UTRAN
- reliable message-delivery service
- supports tunneling protocols for UDP control messages
- supports protocols for authenticating, authorizing, and accounting the UE

**HSS (Home Subscription Server)**
- User Database: stores subscriber data (id and key)
- User Authentication
- provides the interface between the user and the MME

The SGW and PGW components deliver data for the user and control planes via **[GTP](https://zh.wikipedia.org/zh-tw/GPRS%E9%9A%A7%E9%81%93%E5%8D%8F%E8%AE%AE)**,
i.e. GPRS Tunneling Protocol User Plane (GTP-U) and GPRS Tunneling Protocol Control Plane (GTP-C), using UDP as the transport-layer protocol.

{% note info %}
    GTP is also implemented in 5G, and a vulnerability was disclosed last year.
　https://www.ithome.com.tw/news/138340
　https://itw01.com/8JS4VEH.html
{% endnote %}

It supports packet routing and forwarding, allocating IP addresses to UEs, and paging. Open-source projects supporting the LTE EPC are:
```
- OpenAirInterface(with OAI-CN)
- srsLTE(with srsEPC)
- Open5GS
- Open Mobile Evolved Core(OMEC)
```

Each open-source project's implementation status for the EPC interfaces
![](https://i.imgur.com/671qK43.png)

## 5G Core
![](https://i.imgur.com/pZoXlQI.png)

The current open-source project implementing the 5G core is **Free5GC**, implemented based on NextEPC (now Open5GS), providing:
- user access, mobility, session (AMF and SMF) management
- service discovery provided by other NFs (NRF)
- NFs to select the slice allocated to the UE (Network Slice Selection Function)
- managing, storing, retrieving user data (UDM, UDR)
- UE authentication (AUSF)
- core-network operations and management (Operations, Administration and Maintenance (OAM))
- network orchestration, etc.

3GPP interfaces implemented by free5gc:
- **N1/N2**: connect the AMF to the UE and RAN respectively, for session and mobility management
- **N3/N4/N6**: connect the UPF to the RAN, SMF, and data network respectively
- **N8**: connects the UDM and AMF, for user-authentication procedures
- **N10/N11**: connect the SMF to the UDM and AMF respectively, handling subscription and session-management requests
- **N12/N13**: connect the AUSF to the AMF and UDM respectively, enabling authentication services

# RAN and core frameworks

This chapter describes several **open frameworks** used in the RAN and core network.
Although the software in chapters 3 and 4 can perform specific functions, the frameworks introduced below are more general and broader in scope, used with the RAN and CN for management, control, and coordination.

*Open frameworks and architectures summary*
![](https://i.imgur.com/qE16Kyt.png)

## O-RAN
The open-standard definition for vRAN championed by the O-RAN Alliance, with two major goals.
The first is integrating ML and AI technologies via intelligent controllers deployed at the edge.
The second is the definition of openness and agility, achieved by defining clear interfaces between the RAN's different components.
**Since O-RAN must expose the same APIs, it's easy to replace a component with another of the same function**, which lets 5G O-RAN integrate components from different vendors.

![](https://i.imgur.com/LP2jmRl.png)

### O-RAN architecture
At the very top, the SMO runs a non-RT RIC, which makes **control decisions** at a granularity above 1 second. It can provide O-RAN's various functions, for example training different algorithms on the data the RAN provides.

The near-RT RIC, however, runs a **control loop** with a tighter time interval (decision < 10 ms), varying depending on the RAN's different start, stop, override, or control types, e.g. radio resource management.

**These APIs can be used by applications installed on the near-RT RIC (called xApps).**
These xApps can be developed by third-party entities and obtained from a public marketplace.
For example, via the near-RT RIC and its xApps, operators can control user mobility processes (i.e. handovers), allocate network resources based on predicted paths of connected vehicles and drones, perform load balancing and traffic steering, and optimize scheduling policies. The near-RT RIC can also use algorithms trained in the non-RT RIC to do things.

O-RAN's other components like CU/DU/RU: like the 5G gNB being split into CU/DU/RU and the 4G eNB. The CU is further split into a control-plane CU and a user-plane CU. Per 3GPP's definitions of different splits, O-RAN chooses **split 7-2x** for the DU/RU split; so encoding, modulation, and resource mapping are done by the DU; while demodulation, cyclic prefix addition, and digital-to-analog are implemented in the RU, and precoding can be done in both.

### O-RAN interfaces
The interface between the two RICs is the A1 interface, and the non-RT RIC uses the O1 interface to interact with the RIC and 4G eNB.

- The A1 interface lets the non-RT RIC provide:
    - policy-based guidance to the near-RT RIC (in case it detects that its operations don't achieve the RAN's performance targets)
    - ML Model management
    - rich information to the near-RT RIC, e.g. from sources external to the RAN, to further refine RAN optimization

- The O1 interface has operations and management functions, striving to be compatible with existing standards for perfect integration with existing frameworks, e.g. relying on NETCONF or other 3GPP-defined APIs.

- The non-RT RIC uses the O1 interface for:
    - provision management
    - fault supervision
    - performance assurance services
    - starting, registering, and updating physical equipment
    - managing communication-monitoring equipment

- The near-RT RIC also exposes the E2 interface to various other components (CU, DU, eNB); this interface focuses only on deploying
    1. the near-RT RIC's control operations on E2-interface endpoints
    2. managing the interaction behavior between the RIC and these nodes

- The E1 and F1 interfaces conform to 3GPP specifications.

The E1 interface runs between the control-plane and user-plane CUs; its main function is UE-specific trace collection and bearer setup and management.
The F1 interface runs between the CU and DU; it has two different versions, one connecting to the control-plane CU and the other to the user-plane CU; F1 is responsible for transmitting signaling and data between the CU and DU to perform **RPC procedures** and **PDCP-RLC exchange**.

Finally, the interface with the RU is defined by O-RAN's internal Open Fronthaul working group; this interface carries **compressed IQ samples** for the data plane and control messages for beamforming and other physical-layer procedures.

### O-RAN Deployment Options
O-RAN envisions different deployment strategies: in the regional or edge cloud, or at operator-owned cellular base stations. Each facility can run an O-Cloud (i.e. containers and VMs) that uses open interfaces to execute O-RAN programs, or a dedicated site can use O-RAN's open APIs but run closed-source code. Both cases are described in the figure, which describes 6 different O-RAN deployment combinations.

![](https://i.imgur.com/dxigwNb.png)

In Scenario A, all components except the RU are deployed at the network edge, co-located in the same data center **connected by fronthaul fiber**.

Other deployment strategies have the RIC and CU co-deployed in regional cloud facilities, with the DU and RU at the network edge or cellular base stations, and the preferred strategy is **Scenario B**.

```
RIC in the regional cloud
CUs, DUs at the edge
Only the RU at the operator's cellular base station
```

### The O-RAN Software Community
Besides standardization activities, O-RAN also has a software community (OSC) that collaborates with the Linux Foundation to contribute 5G software conforming to O-RAN specifications.

The first release was the 2019 Amber release.
The second was the 2020 Bronze release.

These releases include Docker containers and open-source software for multiple O-RAN components:
- non-RT RIC: with an A1 interface controller and the ability to manage AI models
- near-RT RIC platform: with multiple applications, such as:
    - admission control
    - UE manager
    - performance and measurement monitor 
    able to communicate with the DU via the E2 interface
- DU:
    - an initial version of the fronthaul library
- a framework for operations, management, maintenance, and virtualized architecture
- simulator:
    - for testing various interfaces

The cherry release attempts to complete the integration between different RAN components via the RIC.

> The current latest release is the [F-Release](https://wiki.o-ran-sc.org/display/REL/F+Release).

The **SD-RAN** project is also leading and developing an effort to realize an open-source, 3GPP-compliant RAN integrated with the O-RAN RIC interfaces.
## Open Networking Foundation frameworks
A consortium of multiple telecom operators who provide open-source programs and frameworks for deploying their networks, including: OMEC, SD-RAN, ONOS.
Component Projects are frameworks and software for specific purposes, while an Exemplar contains many Component Projects.

## Other frameworks and projects
Besides O-RAN and ONF solutions, many open-source communities have released frameworks and projects for connectivity, slicing, and core.

### 5G-EmPOWER
An operating system for **heterogeneous** RAN architectures, consisting of an open-source, reprogrammable software platform that abstracts the physical infrastructure and provides high-level APIs to manipulate RAN functions.

5G-EmPOWER also separates the control plane from the user plane, a separation actually composed of two main components: a central controller and a set of agents.
**Central controller:**
1. acts as the OS and has full knowledge of the physical infrastructure's functions
2. sends control commands via the OpenEmpower protocol to orchestrate the agents' behavior

**Agents:**
1. run on each network unit
2. abstract the underlying RAN-specific protocol (LTE, Wifi) implementation to the controller
3. modify underlying protocol parameters per the controller's commands

5G-EmPOWER currently supports multiple Radio Access Technologies (RATs), including LTE, Wifi, LoRa (5G NR not yet supported).

There are also these projects:
- FlexRAN
- Magma
- LL-MEC
- LightEdge
- OpenRAN (not equal to O-RAN Projects)
- Akraino REC
- NVIDIA Aerial

## Open virtualization and management frameworks
Besides RAN and CN software, virtualization and management frameworks also play an important role.
> ETSI defines the common features an NFV MANO (Management and Orchestration) framework should have, mainly for orchestrating network functions (NFs).

![](https://i.imgur.com/IjG4wat.png)
*The figure above shows which part of the 5G ecosystem these NFV pieces correspond to*

**NFV Orchestrators** are responsible for providing network services, i.e. combining physical and virtual network functions (PNF/VNF) connected through a specific topology, to manage their lifecycle.

Per the ETSI architecture, an NFV Orchestrator consists of:
1. a subsystem managing the virtualization infrastructure (e.g. a VIM (Virtualization Infrastructure Manager) framework like OpenStack, Kubernetes, Docker) and its connection to physical hardware
2. an actual MANO framework
3. the set of VNFs it manages
These frameworks have northbound and southbound APIs to interact with other cellular-network components.
This chapter discusses virtualization techniques, VIMs, and popular MANO frameworks like ONAP, OSM, and Open Baton.

## Virtualization techniques
NFV separates the services deployed in the network from the hardware infrastructure they run on, and applications are packaged into VMs separated from the hardware. NFV removes the need for each NF to require specific hardware, enabling network scalability.

![](https://i.imgur.com/QBfrv68.png)
*This is a high-level NFV architecture, showing multiple implementation approaches*

## Traditional Virtual Machine
Hardware-level virtualization, providing machine-level isolation, emulating a computer system via a guest OS and kernel.
Since VNFs have many hardware-virtualization requirements, traditional VMs are considered resource-intensive.
## Bare-metal hypervisors
The bare-metal hypervisor VM approach is similar to the traditional VM approach, but here the hypervisor runs directly on the host's hardware without a host OS, and can also be used to manage and run containers or unikernels rather than entire VMs.
## Containers
Package a specific program and its dependencies, running applications and services in a virtualized environment.
Containers are isolated from each other and share the host OS and access to the kernel; compared to a VM, they don't need to virtualize the underlying hardware and are much lighter. Containers can be maintained via a **container manager** connected to the host OS, or run directly on a bare-metal host machine via a hypervisor.

Open-source container systems:
- **LXC**: the main implementation of modern containers, isolating via cgroups and namespaces to create a virtual environment with independent network and process spaces
- **Docker**: allows creating containers, using OS-level virtualization to deploy them on a machine; unlike LXC, it decomposes services, applications, and dependencies into modular units and layers within each container, and these layers can be shared across multiple containers, increasing container-image efficiency.
### Unikernels
Unikernels are tiny, lightweight, specialized images whose sole purpose is to run a specific application. They compile the application service and its dependencies into an executable virtual image, without including unnecessary components, so unikernels can achieve better performance than traditional containers and VMs; because a unikernel only includes the software components necessary to run the target application, it exposes fewer features that could be maliciously attacked, improving system security.

Known unikernel systems: **ClickOS**, **IncludeOS**, **OSv**, **MirageOS**, **Unik**

Cellular-network-related unikernel applications (papers):
- integrating Android libraries into OSv to reduce the mobile-computing burden of MCC (Mobile Cloud Computing) and MFC (Mobile Fog Computing)
- unikernel-based 5G network CDNs, like ClickOS, OSv, MirageOS
- one paper compares the performance of instantiating a 5G application as a VNF with the IncludeOS unikernel vs Docker

## Hypervisors
A set of software for running virtual machines (guest machines) on a physical machine (host machine).
The hypervisor's key tasks are:
1. providing virtualization between host and guest machines
2. managing the allocation and reallocation of guest-machine resources (CPU, memory, storage)
3. scheduling resources between host and guest machines

There are two types of hypervisor: Type 1, Type 2.
**Type 1:** the hypervisor runs directly on the bare-metal host machine, acting as the OS on the host.
Example: Xen, VMware ESXi
**Type 2:** runs as a software layer on the host OS.
Example: Linux Kernel-based VM (KVM), BSD bhyve, Oracle VirtualBox

### Virtualization infrastructure managers (VIM)
A VIM controls and manages the NFV infrastructure and its resources, like storage, compute, and network resources, and coordinates the instantiation of guest machines on the host hardware. **A VIM is part of the MANO framework**, discussed earlier.

Examples of VIMs: **OpenStack**, **Kubernetes**
- **OpenStack**: a cloud-computing platform able to control a large amount of heterogeneous resources like compute, storage, and network. Among its many functions, it can act like a VIM, managing network infrastructure, VMs, containers, unikernels, VNF services, and applications
- **Kubernetes**: provides automated deployment, scaling, and management of VMs, containers, unikernels, and their applications; it abstracts and expresses system state through a series of objects, persistent entities describing the VNFs and applications running on a K8s-managed cluster, their available resources, and policies about their intended behavior.
    Over the years, several projects have interacted with k8s to handle complex Layer 2/Layer 3 protocol problems, like **Istio** and **NSM (Network Service Mesh)**
    - Istio mesh service: implements traffic management, policy enforcement, and telemetry collection
    - NSM: supports advanced use cases via the Kubernetes API and promotes adoption of new cloud-native solutions, and also lets network admins seamlessly perform tasks like requesting network interfaces and adding radio services

## The Open Network Automation Platform 
An NFV framework mainly developed by the Linux Foundation, with many supporting operators.
ONAP is deployed in multiple commercial cellular networks, with vendors like Ericsson, Nokia, Huawei, and ZTE providing ONAP support and integrating it into their products.

ONAP is the best software-based solution for commercial cellular networks.
ONAP handles the design, creation, and lifecycle management of a large number of network services.

Network operators can use ONAP to orchestrate the PNFs and VNFs deployed in their networks. Besides the functions common to NFV orchestrators (automated, policy-based management of virtual infrastructure or network services), ONAP also provides a **design framework** to model network applications and services, and a **data-analytics framework** to monitor service healing and scaling.

ONAP also provides many reference designs (i.e. blueprints) that can be used to deploy the ONAP architecture for specific scenarios (5G Networks, VoLTE, etc.).

![](https://i.imgur.com/gaDoMDa.png)

Main components of the ONAP architecture:
- **Management Framework:** also called **OOM** (ONAP Operations Manager), responsible for orchestrating and monitoring the lifecycle of ONAP components. OOM uses K8s and **Consul** to support service control, discovery, configuration, and segmentation. Among its notable functions:
    - Component deployment, dependency management, and configuration
    - real-time health monitoring
    - service clustering and scaling
    - component upgrade, restart, and deletion
- **Design Framework**: 
    - allows creating network services using a declarative **modeling language**, enabling specification of each service's requirements and functions.
    - allows **modeling** resources, services, products, and their management and control functions through a set of common specifications and policies.
    - also includes service-design and creation modules for defining, simulating, and certifying system assets, processes, and policies.
    - modules also provide a database of existing services and APIs for validating network functions
- **Run-time Framework**
    - composed of many software frameworks for most management and orchestration functions
    - at run-time, the Microservices Bus allows messaging and data communication and routing between the different network functions (NFs) managed by ONAP
    - the run-time framework uses an automated control loop to schedule and terminate microservices, and collects and analyzes data from the platform
    - run-time components have public APIs, a dashboard, and command-line tools to control the network infrastructure through a unified interface

Underneath these frameworks can be integrated with external controllers, operating systems, and cloud environments; northbound APIs are provided to OSS/BSS, big data, and related services.

## Integration with 5G networks
Besides general mobile-network orchestration and management frameworks, ONAP provides important functions related to 5G deployment.
Operators' main requirement is usually supporting a hybrid infrastructure:
- must include software and hardware equipment
- edge automation, with the cloud distributed across geographically different edge locations
- real-time analytics (must use an automated control loop)

The Frankfurt release (June 2020) integrated with O-RAN.

## Open Source NFV Management and Orchestration
Open Source NFV Management and Orchestration (OSM) is a MANO framework developed by a group of network operators.
Similar to ONAP, it's also developed and deployed in cellular networks.

![](https://i.imgur.com/rPRGyRL.png)
*OSM's architecture*
- **The information model**:
    models NFs and slices as templates called packages, enabled by the well-defined information model provided by the ETSI MANO framework. Similar to ONAP's design components, it lets telecom operators analyze network requirements and model the resources that need to be deployed for functions, services, and slices.
- **The OSM Automation Framework**:
    automates the NF lifecycle, from initialization to scaling to deletion, by applying the information model to the actual deployed infrastructure (see figure above), exposing a northbound interface to the different modeling components via the automation framework

Like ONAP, OSM's southbound and northbound APIs can be exposed to external services, like other orchestrators and OSS/BSS.
# Software-defined radio support for open source radio units 
SDR devices
USRP, BladeRF, LimeSDR, Iris
# Testbeds
Introduces testbeds that use open-source applications, frameworks, and hardware components to instantiate and softwarize 5G networks.

![](https://i.imgur.com/QvOZnqY.png)

# Softwarized 5G: Limitations and road ahead
- Keep pace with the standards
- Latency and scalability issues.
- Limited contributions for RAN open source software

{% note info %}
Paper link: https://ece.northeastern.edu/wineslab/papers/bonati2020open.pdf
{% endnote %}
