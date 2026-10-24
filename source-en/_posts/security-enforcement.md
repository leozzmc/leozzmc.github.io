---
title: >-
  Security policies definition and enforcement utilizing policy control function
  framework in 5G
description: "Paper reading: how to realize security-policy definition and enforcement via 5G's PCF network-function framework"
toc: true
tags:
  - 5G
  - Security Policy
  - 3GPP
categories:
  - Paper Reading
top_img: 'https://i.imgur.com/FXfawHh.jpg'
aside: true
abbrlink: "de3933f9"
date: 2021-09-01 05:02:34
featuredVideo:
---

> 🌐 中文版：[繁體中文](/posts/de3933f9.html)

<style>
    :root{
    --maincolor: #50fa7b;
    }
   .info{
    padding: 15px;
    margin-bottom: 20px;
    color: #ffffff;
    border: 1px solid transparent;
    border-radius: 10px;
    background-color: #343232;
    border-color: #b8bdb4;
   }
   .special{
        border-bottom: 3px solid var(--maincolor);
        color: inherit;
        text-decoration:none;
   }
   .newbold{
        color: #ffffff;
        font-weight: bold;
        text-decoration:none;
   }
   a{
    color: #337ab7;
    text-decoration: none;
   }
</style>


## 1. Introduction
This paper discusses network-security issues within the scope of the 3GPP-defined 5G System (5GS).

### 5G standardization
Many organizations and bodies have made outstanding contributions to developing the 5G architecture, especially on the security side:

```
- ITU
- ETSI
- IETF
- NGMN
- 5G-PPP
- NIST
- GSMA, etc.
```

Some are responsible for specific infrastructure like critical infrastructure, and others develop security standards for specific use cases.
> S3A Working Group → defines the end-to-end security aspects of 5G networks

### 5GS
5G System = Access Network + Core Network + UE
System Architecture → Service-Based Architecture → is composed of multiple NFs
In the SBA architecture, the interaction between different NFs can be represented by a point-to-point reference point between two NFs.
The **SBI (Service-based Interface)** represents how a given NF provides or exposes a set of services.

The **Policy Control Function (PCF)** is a network function providing a unified, consistent framework to define any type of policy. In previous mobile-network generations, PCF was only used for QoS or charging policy formulation.

The 5G architecture adds a service for network data analytics, via a new NF, NWDAF (Network Data Analytics Function), used for
```
1. Load Level information
2. Service experience
3. Network performance
4. Abnormal behavior
```

<span class="special">PCF can subscribe to network-analytics notifications related to such information and use it to compute or update policies, but this isn't yet standardized.</span>
There's no clear link established between the new unified policy-control framework, the 5G system, and the enhanced data-analytics entity, and this paper's results can help make these three areas more tightly connected.

The main goal is to find an effective security-enforcement schema to flexibly create new security policies and dynamically respond to the continuously changing security environment across the 5G end-to-end architecture.

Security enforcement across the 5G system should be discussed at the **TSG-SA** level.

In the 5GS architecture, user-plane security enforcement is based on whether the confidentiality and integrity algorithms over the air interface between the UE and base station are enabled.

The UP integrity-protection algorithm can be enabled selectively (e.g. per slice).

### Network slicing
<span class="special">Individual network slices providing different services may have different security requirements and use different security protocols and methods; so providing different levels of security protection for different network slices is key.</span>

The use of security-encryption algorithms is also optional (e.g. 128-bit vs 256-bit key length), as the security requirements of critical infrastructure differ from those of enhanced Mobile Broadband's high-usage scenarios.

Applying QoS principles to security, the goal should be to use the unified policy-control framework and the new data-analytics function as a knowledge base about the network and UE, to realize effective security-policy definition and enforcement in the 5G end-to-end architecture.

Current protection strategies for telecom networks are nothing more than firewalls, IDS, DDoS protection systems, etc., managed by vendors' specific management tools. These security functions are for protecting the whole network or based on their positioning in the network, without considering individual UEs.

1. The ability to detect a security issue on a single UE
2. The way to apply remediation to a single UE have so far been problems

This study fills these mechanisms, enriches security from an end-to-end network perspective, and provides appropriate granularity to consider individual UEs' security policies
→ helpful for uRLLC and mMTC deployment scenarios

![](https://i.imgur.com/BOTV0hU.png)

## 2. Challenges to apply end to end security enforcement in 5G 
To realize end-to-end security enforcement, there are four major challenges to solve:
```
- Applying QoS principles to security enforcement
- Session management and user plane
- Policy control
- Network analytics
```

### 2.1 Challenges to apply QoS principles to security enforcement
When applying the fundamental principles of QoS enforcement to security enforcement based on business needs (e.g. generated in vertical markets), one of the main difficulties is being able to measure security characteristics in a way similar to how QoS is quantified in the network.

A QoS profile is well-defined as a set of QoS parameters applied to a QoS flow (a QoS flow is the finest granularity of QoS differentiation in a packet data unit (PDU) session). This parameterization is quantitative, i.e. measurable by numbers. For example, the 5G QoS Identifier is a scalar-represented parameter used as a reference for 5G QoS characteristics (like scheduling, weight, admission threshold, etc.). There are even preconfigured standardized values. But how do you build a security profile in the 5G architecture, how do you establish a quantified security parameterization for aspects like integrity protection, confidentiality protection, access control, or malware detection? Our proposal to solve this is presented in section 3.1.

### 2.2  Challenges at session management level to enforce security controls
The SMF receives requests from the UE to establish a PDU session.
However, current PDU requests don't contain any security parameters.

So it's impossible for a UE to request **specific** 5G UP security services, i.e. a "secure PDU."
Yet things like government critical infrastructure may require special security measures for the PDU session between the UE and the Data Network, for example certain **Data Radio Bearers** supporting strong encryption algorithms or longer encryption keys in certain services.

When establishing a PDU session, the SMF, based on
```
- subscriber info from UDM
- the locally-configured UP security policy per DNN/SMF slice
- the maximum data rate each UE supports
```
provides UP security enforcement in the PDU session to offer integrity protection on each DRB.
The SMF's local configuration is considered a globally-applicable static policy.

The question is whether this static approach is still valid for later use cases, where subscription plans may require different levels of security (e.g. per slice) along with security value-added services and the corresponding tenants (e.g. critical-infrastructure owners), and the ability to react to security events.

These use cases need flexible, scalable, dynamic policy management and configuration.
Furthermore, security enforcement only indicates whether to apply UP integrity and confidentiality protection in the NG-RAN network area, and only applies to 3GPP-type access.

Extending UP security enforcement from NG-RAN to transport and the core network is a challenge
(i.e. the end-to-end security-enforcement method for the overall connectivity the PDU session provides is a challenge).

![](https://i.imgur.com/7xtxVnm.png)
Figure 2 shows current UP security enforcement and considerations.

![](https://i.imgur.com/JwXF00a.png)

Once a PDU session is established,
the current session's characteristics (i.e. PDU session info) are limited to some mainly QoS-related information elements (e.g. QoS Flow ID, Reflective QoS Indicator).
When a PDU-level security event occurs, there are no security attributes to trigger mitigation measures.
For example, when an application processes data classified as confidential, special security measures are needed within the PDU session between the UE and the Data Network, like strong encryption algorithms or longer keys used in the services the DRB supports.

> Section 3.2.5 develops a framework to provide security attributes for PDU-level security events.

### 2.3 Challenges to fine security policies under policy control framework

Although defining a security policy for each subscription is laborious, it doesn't seem much different from doing it for QoS.
It can be expected that security policies and QoS aren't truly independent, and that the same policy can be applied to a large number of subscriptions, e.g. per slice.

A **Policy and Charging Control rule (PCC rule)** contains the information needed to enable user-plane detection, policy control, and appropriate charging for service data flows.

Two kinds of PCC rules exist: dynamic and predefined.
Dynamic rules are provided by the PCF to the SMF, while predefined PCC rules are configured into the SMF.

When a dynamic rule and a predefined PCC rule have the same priority, the dynamic rule takes precedence.
The targets of these policies are:
- PDU sessions
- Service Data Flows (SDF). Set of PDUs (within a PDU session) identified by traffic filters

Whether PCF control applies to a PDU session is defined by SMF policy based on DNN or per slice.
Without PCF control, local policy-based rules are configured in the SMF.

A PCC rule definition includes:
- Service data flow detection mechanism (e.g. filters, application template)
- Charging-related Information Elements (IEs) 
- Policy-control-related IEs (e.g. Gating, QoS, bit rates, etc.)

A service data flow filter contains the user-plane data for matching IP PDU traffic and Ethernet PDU traffic.
The SMF applies the Service data flow template information within the enabled PCC rule to instruct the UPF to identify packets belonging to a specific service flow.

<span class="special">The appropriate definition of security information elements as part of a PCC rule is a key challenge.</span>

Currently the PCC rules defined by **3GPP TS 23.503: Technical Specification Policy and Charging Control Framework for the 5G System** don't explicitly contain such parameters, nor are they part of service-data-flow detection able to identify security events, or part of policy-control operations. Furthermore, the SMF sends PCF information about the PDU session state (e.g. access type, roaming, IP address, etc.), so the PCF can react dynamically based on specific triggers and change policies accordingly. So the definition of security triggers is very important, since it affects not only the network's security state but also the network's overall QoS and SLA (e.g. DDoS attacks). However, creating these security triggers (e.g. recently-discovered vulnerabilities, fraud, attacks, unauthorized access, etc.) is a challenge; configuring part of the detection filters in the UPF or other specific security probes, whose policy goal is to include the security-assurance aspect in the network's overall service assurance.

<span class="special">⚠️The current problem is: how do you make security part of the PCF's PCC decision process?</span>
This paper provides an answer in section 3.3.

### 2.4 Challenges to introduce security use cases under network analytics

The **Network Data Analytics Function (NWDAF)** appeared in the SBA architecture in Release 15.

There can be multiple NWDAFs specialized for different types of analytics, identified by an Analytics ID Information Element (IE). This IE identifies the type of supported analytics an NWDAF can generate. The NWDAF interacts with different entities for different purposes, such as data collection based on subscribing to events provided by different network functions, retrieving information from data repositories and NFs, and providing analytics on demand to different types of consumers. Currently the NWDAF's data-collection function only allows obtaining data for a slice or UE from control-plane sources, but how to collect user-plane security data from the UPF isn't yet standardized, which is actually currently limited to traffic and data rates.

The **OAM (Operation, Administration and Management)** system only measures and traces data, which can be shared with the NWDAF via a Management Service.

For security-analytics purposes, information collected from user-plane traffic analysis about malware, botnets, protocol anomalies, etc., for example via the security probes proposed in [18] (like an IDS embedded in the UPF) or malware sandboxes, would be very useful to enhance network analytics with new security use cases.

This analytics information revolves around a network slice's load level, service experience, network performance, mobility, QoS, UE behavior, etc., providing a valuable knowledge base.

Three fundamental questions are raised within this paper's scope:
```
- How to obtain security-related information based on the analyzed knowledge?
- What specific new security parameters can be monitored and further analyzed in the NWDAF?
- How can the PCF use this information to configure and enforce security policies in the 5G end-to-end architecture?
```

## 3. Proposed approach to security enforcement in 5G
From an implementation perspective, so far the realization of security policies and QoS parameters in mobile networks has varied greatly across the network.

The 5G PCF is a single framework to define any type of policy and deliver it to other NFs on the control plane.

From a near-future perspective, when the subscription plans tenants demand will need to include security clauses, i.e. security as an important part of the SLA like QoS today, we propose a new security-enforcement approach that uses the unified policy-control model.

### 3.1 Application of QoS policies to security use cases

```=
- session-AMBR
- UE-AMBR
```

Our proposal is that these QoS policies can be applied from the PCF into the network in a restricted and dynamic manner upon receiving security events, which can be established in the NWDAF or other security-analytics platforms on the user plane (e.g. SIEM tools placed in the management plane, IDS systems embedded in the UPF, etc.).

Based on predefined security metrics, different policies can be enforced from the PCF, acting as effective mitigation mechanisms in the network:
- Set a new session AMBR
- Set a new UE AMBR, which is a kind of isolation of the UE (e.g. a UE acting as an active bot in a DDoS attack)
- Use stricter security controls within the QoS Profile to set up a new PDU session

QoS profiles can be dynamically established in the 5G AN by the SMF; specific QoS rules can be enforced on the UE via session-management signaling on the N1 interface from the SMF, or directly on the UPF on the N4 interface.

N1 interface: UE $\leftrightarrow$ AMF
N4 interface: SMF $\leftrightarrow$ UPF, to manage data sessions in the user plane
N4 is based on the PFCP protocol (Packet Forwarding Control Protocol)

The SMF does manage QoS flows via rules, associating traffic filters with QoS policies from the PCF.
The traffic-filter set is configured in the UPF and can be used to easily manage security services. For example:
- a security association identified by a specific security-parameter index for a specific set of UEs or slices with special security requirements (e.g. encryption algorithm, key length, etc.)
- detection and dynamic QoS rules like traffic control can be applied dynamically

The flowchart below depicts the concept of applying security rules as part of QoS policies in the network:
![](https://i.imgur.com/3514RyB.png)

The figure below shows the secure-call steps realizing the above concept:
![](https://i.imgur.com/1t07hXz.png)

*1.a* <span class="special">**NWDAF → PCF**</span>
The PCF subscribed to NWDAF notifications.
Due to a network security event (e.g. DDoS), we find a user-data congestion situation, sent to the PCF via the N23 interface.

*1.b* <span class="special">**Security Management → PCF**</span>
The security-management system is integrated with the PCF via a REST API.
The security event is reported to the PCF.

*1.c* <span class="special">**PCF → UDR(optional)**</span>
The PCF requests a set of data from the UDR via the N36 interface.
In this use case, the requested data can be the ID of the security-policy part of the subscription-policy set, to apply when a security event occurs.

*2.* <span class="special">**PCF → SMF**</span>
After the PCF makes a policy decision, it determines the SMF needs updated policy information to mitigate the security issue, and sends an **Npcf_SMPolicyControl_UpdateNotify** request via the N7 interface containing updated policy info about the PDU session, in this case establishing a new Session AMBR.

*3.* <span class="special">**SMF → PCF**</span>
The SMF responds to the PCF with an ACK.

*4.a* <span class="special">**SMF → UPF**</span>
QoS enforcement based on the QoS Enforcement Rule sent by the SMF is a function provided by the UPF, including the Session AMBR over the N4 interface (received in Step 2 from the SMF, which came from the PCF).

*4.b* <span class="special">**SMF → UE**</span>
Exchanging N1 SM signaling with the UE via the AMF to provide the UE QoS rules,
e.g. setting a new UE-AMBR to limit the maximum bit rate expected to be provided for all Non-GBR QoS Flows across all the UE's PDU sessions.

*4.c*  <span class="special">**SMF → 5G AN**</span>
Exchanging N2 SM signaling with the 5G-RAN via the AMF to set the 5G RAN's QoS parameters,
e.g. reserving resources for a specific traffic type.

### 3.2. User plane security enforcement and assurance

The way to enforce security policies on UP traffic is also based on policy control.

It acts directly on control NFs like the AMF and SMF, and the PCF should reach the UE, RAN, and UPF to apply these policies directly on the UP.

#### 3.2.1. Security policies enforcement via AMF

![](https://i.imgur.com/MfoI2Au.png)

Two categories of policies are for **access** and **mobility management**.
They're enforced by the AMF, prescribed by the PCF, and stored in the UDR.
They can support security use cases without major changes to the policy definitions:

- Policies transferred from PCF to AMF:
    - Service area restrictions
    A **Tracking Area** is a logical regional concept in which a user can move without updating the management node; the network allocates one or more TAs to the user.
    Service area restriction includes **allowed areas** and **non-allowed areas**.
    This paper proposes using specific thresholds to establish security levels for different service areas, to decide whether a user is authorized to move to a high-security service area.
    Example: geographically sensitive areas like critical infrastructure may restrict access for users using the **"Null Schema"** to generate SUCI, to prevent effects like a malicious base station; in other words it may allow access for users supporting UP integrity protection.
    ![](https://i.imgur.com/EXWGDgX.png)
    - Priorities of area types the user may use
    Appropriate priority definitions can avoid **downgrade attacks** that force the UE to connect to more vulnerable networks (like 2G), which are more susceptible to attack than 4G/5G networks. An attacker can attempt a downgrade attack by making the UE and network entity each believe the other doesn't support a security feature, even if both actually do support it.
    ![](https://i.imgur.com/8nbzQWr.png)
    The **Anti-Bidding down Architecture** was defined in Release 15 but isn't truly in effect yet, since its purpose is to prevent downgrading from future enhanced security features to current ones.
    ![](https://i.imgur.com/PC8zo8N.png)
    
- Policies transferred from PCF to the UE via AMF
    - User Equipment Route Selection Policy to determine how to route egress traffic (PDU selection policies)
    When a security event occurs, it may trigger a new PDU session (e.g. malware detection in the UE), i.e.
    an **isolated** PDU with a special policy on the data path, or even a PDU terminated in a secure DN with special security services
    
<span class="special">The LADN (Local Area Data Network) concept is used in 5G to support MEC, and supports the practice of the above measures. LADN enforces restrictions only on PDU sessions authorized in a certain set of locations (called **LADN Service Areas**).</span>

<span class="special">LADN Service Areas are configured in the AMF per DNN, and the AMF provides the UE the LADN Service Area information.</span>

#### 3.2.2. Security policies enforcement via SMF
> SMF function intro: the SMF controls the signaling needed for a PDU session (via N4 signaling) and sets up the user-plane handling in this PDU session (selecting the UPF supporting the PDU session).

So the SMF controls the functions the UPF supports, including security-related functions like firewall, traffic saving, DDoS protection, GPRS Tunneling Protocol (GTP), (the new Inter-PLMN UP Security in Release 16), etc.

Furthermore, it controls policy enforcement, i.e. interacting with the PCF to get policies and applying them directly to the UPF (via N4) or to other parts of the NG-RAN network via the AMF.

> Proposal: the proposal is that security controls embedded in the UPF can be managed via security policies in the PCF.

Furthermore, this new concept will make the user-plane security enforcement policies in the air interface (confidentiality and integrity protection) managed in the PCF (rather than locally configured in the SMF as today), coming from the UDR (as the storage of policy-configuration files with predefined security policies).

So these policies should be part of Dynamic PCC rules dedicated to user-plane security, and may extend to other domains or UP interfaces, like:
N6: UPF $\leftrightarrow$ Data Network, based on IP or Ethernet transport
N3: UPF $\leftrightarrow$ 5G-RAN, based on GTPv1-U (GPRS Tunneling Protocol User Plane)
N9: UPF $\leftrightarrow$ UPF, to transport user-plane data, based on GTPv1-U

#### 3.2.3. UP security enforcement use cases
The N6-LAN for the 5G concept should allow the PCF to configure the UPF to realize a security service function chain to the data network.
![](https://i.imgur.com/ZkrVdFk.png)

> N3 interface protection mechanisms: TS33.501 states that data transmission over N3 (UPF $\leftrightarrow$ RAN) should have confidentiality, integrity, and replay-attack protection. The required mechanisms are IPSec ESP and IKEv2 certificate-based authorization, but which cryptographic mechanism protects N3 is up to the operator's decision.

In the near future, these types of solutions can be selectively deployed based on the security level provided to a set of users, slices, and/or tenants, depending on the service's or infrastructure's requirements and importance.

For example:
a dedicated network serving critical infrastructure (e.g. utilities), or a vehicular ad-hoc network (VANET), certainly needs comprehensive protection for communication between the radio base station and the core network.

> Proposal: this paper's proposal is to include the encryption solution for N3 in PCC rules, enforced in the gNB (via AMF) and the security gateway in the UPF system (via SMF); enforcement should establish a new IPSec tunnel or assign the PDU to an existing IPSec tunnel.

The same concept can also apply to the security methods used in some N9 use cases, like interconnection between different operators. In this case GTP inspection and IPSec have been standardized, but not enforced via the PCF as part of a "security SLA." Furthermore, via new analytics functions (like NWDAF) or databases (like UDSF, Unstructured Data Storage Function) to store session data or security events received from the UPF or other specific security-analytics platforms (which can correlate events from multiple sources), the PCF can react to changes in the established Security SLA (SSLA) queried from the UDR, applying new security policies and forcing the establishment of a new, more secure PDU, i.e. mitigating the security issue that triggered the action.

![](https://i.imgur.com/8ZkUC6D.png)

```
Ex:
When a fake base station is detected in a certain regional network,
or simply for a critical area from a security perspective (e.g. airport, critical infrastructure site, etc.),
the PCF will enforce integrity protection for the relevant UE/UE group attached to the base stations in that geographic area. Other constraints can also build effective use cases (e.g. a UE connected to a critical slice). The UE's policy should be updated from "not needed" to "preferred" or "required."
```

The figure below shows the PDU session establishment flow, with the calls this paper proposes shown in bold, to provide the dynamic enforcement of the described security policies from the PCF.

![](https://i.imgur.com/pFT8Zpv.png)
###  3.2.4. Security assurance
Once a PDU session is established with security attributes (e.g. encryption, integrity protection, access-control policy for a specific service flow, etc.), allowing security enforcement in an extended sense in the network, two key aspects remain worth attention, namely security data collection and closed-loop automation. To introduce them, the Charging Function (CHF) is used as an analogy.

![](https://i.imgur.com/SAtlROD.png)

Usage data collection can be used for charging, collecting statistics, and monitoring overall network usage and UE behavior.
When a user exceeds certain thresholds (e.g. a spending limit), the CHF notifies the PCF, which considers this in dynamically applying relevant policies to the user session, e.g. QoS limits on a given PDU session, redirecting to the operator's web page, etc.

> Proposal: use security-related data from the embedded security functions in the UPF to enhance/enrich data collection.

The SMF collects enhanced/enriched data from the UPF and sends it to a **central security-management system** (storing the data and correlating it with security information collected by various security-dedicated platforms in the network), e.g. firewall logs, security telemetry, IDS logs, etc.

The security-management system is responsible for creating security events and triggering operations on the PCF and/or SMF,
e.g. notifying the PCF that some security SLA has been crossed, redirecting user traffic to a scrubbing center or a dedicated secure DN, etc.

In 5G, the UPF takes on the role of the traffic-detection function in the 4G Evolved Packet Core, i.e. packet inspection (e.g. application detection based on service data flows), so it can enforce PCF policies. Indeed, the technologies implementing the UPF integrate more and more security functions, like firewall or carrier-grade network address translation.

The 5G core allows the PCF to coordinate between connection-related policies sent to the UE and policies sent to the network, which can be deployed in the UPF on the user plane, e.g. security policies in an L7 firewall embedded in the UPF, for a specific service for a specific user. The following two use cases illustrate this concept:

### use case1
Per 3GPP TS 23.503, one of the functions the PCF supports for SMF Selection Management of PDU sessions is providing a policy to the AMF to notify the PCF to perform DNN replacement for a specific DNN. The trigger for such a replacement operation may be a DNN compromised by a security event, due to a specific DN or slice overload (e.g. DDoS), reported to the PCF via the NWDAF.

### use case2
When the SMF receives a PCC rule, the SMF can take measures to reconfigure the PDU's UP. One of these actions can be updating the UPF with a new steering rule, e.g. forwarding certain suspicious traffic to a local data center (e.g. MEC), to contain a potential security breach within a small, controlled area of the network.

The MEC concept is to facilitate deploying the UPF at the network edge, closer to the UE, sometimes for critical applications,
e.g. ultra-low-latency use cases, caching, stadiums, etc.

As a response to an event, the Application Function (AF) can make a request to the 5G core (i.e. PCF or via the Network Exposure Function (NEF)) to steer the traffic of a set of UEs or even an entire slice to a UPF located at the edge, where security functions like DDoS protection, scrubbing centers, IDS/IPS, etc. can be deployed as containment mechanisms.

> AF function: AFs interact with the 3GPP core to provide services, like an application's influence on traffic routing, accessing the NEF, interacting with the policy framework (via N5), etc., i.e. it requests dynamic policies.
Today, the AF acts as a MEC orchestration application or IP Multimedia System (IMS).

> Proposal: extend the AF's scope to security applications:

- Influence on traffic routing as a security-mitigation mechanism
Example: BGP injection and route changes when an attack (e.g. DDoS) is detected
- Accessing the 5G core via the NEF
Example: a third-party security company providing a threat-intelligence feed
- Interaction with the policy framework
Example: a policy change providing new SDF filtering rules due to an unpredictable security event or a new threat signature

### 3.3. Establishing security policies as part of PCC rules

A PCC rule connects an **SDF template** (a list of service-data filters or an application ID of an application filter) with possible operations on the traffic (policy enforcement).

Building on 3GPP's current actions focused purely on QoS actions, we propose extending and applying these actions for security purposes, summarized in Table 1.

![](https://i.imgur.com/gXZeTff.png)

Table 6.3.1 of 3GPP TS 23.503 lists the information contained in a PCC rule, like information name, description, and whether the PCC can modify this information within a Dynamic PCC rule in the SMF.

Table 2 shows an excerpt of Table 6.3.1 of TS 23.503.
![](https://i.imgur.com/a7jUM1v.png)
The gray areas in the table show the elements added on top of the original standard.

In the "Security" category, there are two Information Elements, which involve the security policies currently present in the user plane but currently only managed locally in the SMF and limited to the Access Network (AN).
Our contribution is to make them part of the PCC rule structure:

- At the PDU level, the PCF can also control different parameters of the PDU session, including the conditions under which the SMF obtains a new policy from the PDU session (triggers for policy-control requests), and these conditions are very important for defining security use cases, i.e.
if these conditions are security triggers (e.g. unexpected events, overload, exceeding thresholds, etc.), the PCC security rule is conveyed from the PCF to the SMF and enforced in the UPF and/or 5G-RAN.

- The purpose of PDU-session-related policy information is to provide PCC (Policy and Charging Control) applying to a single monitoring key or the whole PDU session respectively; the PCF can provide PDU-session-related policy info to the SMF together with the PCC rules or separately.

Table 6.4-1 of TS 23.503 contains PDU-session-related policy info.
Table 3 shows an excerpt of Table 6.4-1 of TS 23.503, focusing on usage-monitoring-control-related info, where two new monitoring keys are proposed for (D)DoS attack detection.
![](https://i.imgur.com/B6DC660.png)

<span class="special">Finally, the PCF should also instruct the SMF which applications to detect. After receiving a report from the SMF, the PCF can make a policy decision and send an updated or new PCC rule to the SMF. If specific security analytics in the network can define an attack, the same process should apply to security (e.g. communication between a bot and a C&C center) or characterizing a security-event profile (e.g. intending to use an invalid port of a specified protocol in communication to break access-control firewall rules).</span>
So a security signature can be created like any other application signature, and the corresponding PCC rule applied.

### 3.4. Security analytics implemented in NWDAF

![](https://i.imgur.com/pp10sLI.png)

The information the NWDAF provides can significantly contribute to the PCC decision process the PCF executes.

However, the analytics info is currently limited to slice-specific network state, like load-level info. That is, it doesn't need to know the subscribers using the slice, but it works at the network-slice level.

> Proposal: extend the load-level info, adding security-context info (e.g. events, attacks, vulnerabilities, etc.).

It requires security functions implemented separately or as part of standardized network functions (e.g. a UPF with embedded firewall capability) to be provided to the NWDAF or an intermediate dedicated security-analytics platform.

Standard TS 23.288 [11] provides the possibility of different types of NWDAFs, specialized for different types of analytics, identified by the Analytics ID Information Element.

The PCF can use this info via the N23 interface. Some of this info can already provide very useful information for security analytics and further enforcement, as described in the previous sections.

Table 7.1-2 of [11] shows the analytics info the NWDAF service provides. We added a column to this table containing security info that could be extracted to other security-analytics functions for further analysis or directly to the PCF framework to apply specific security PCC rules (see Table 4).

![](https://i.imgur.com/URrNthl.png)

Particularly interesting for security analytics is the network data analytics related to abnormal behavior captured by the NWDAF.

The PCF can use the **Nnwdaf_AnalyticsSubscription_Subscribe** service operation to subscribe to network-analytics notifications related to "abnormal behavior," to predict and detect security issues, trigger new security policies, or update existing security policies for a specific UE or UE group. The subscription includes the Analytics ID ("Abnormal behaviour"), the analytics-report target **SUPI**, **Internal Group ID**, and an analytics filter including a list of anomaly IDs and the possible threshold for each.

The current list of anomaly IDs is specified in [11], e.g. "unexpected UE location," "suspected DDoS attack," "wrong destination address," etc. Table 6.7.5.3-3 of the standard provides examples of risk-mitigation policies and actions, like "extend service-area restriction," "release PDU session," "update packet filters/QoS," etc.

As described in section 2.4 of this document, the challenge is that at the user-plane level, each application's communication description is limited to that communication's traffic and data rate, related to volumetric-type attacks (e.g. flooding, overload, DoS, etc.).

Changes or anomalies in statistics or predictions, like the periodicity of UE communication, communication duration, or certain traffic characteristics (e.g. abnormal ports, suspicious DNNs, other useful info, etc.), upload/download volume (mean and variance), may indicate a security event or incident.

At the user-plane level, the new proposal includes that, besides volume, changes, and anomalies, the NWDAF can collect real security events (facts) directly from the UPF, thanks to user-plane security inspection functions attached to or embedded in it. This security info may be used by active NFs like the PCF to dynamically update PCC rules for a specific UE in a UE group, change the PDU, or even take action at the slice level when needed.

## 4. Future work

Based on the security-enforcement principles this paper proposes, three areas can be further researched:
- specific security analytics supported by machine learning algorithms
- roaming scenarios, including local break out
- applicability to IoT use cases

## 5. Conclusion
![](https://i.imgur.com/VkTuInH.png)

## References
https://www.sciencedirect.com/science/article/pii/S0140366421001262

meeting slides: https://drive.google.com/file/d/1RK6R5yjRuvS-BhdTjZPhOXAg9ghlW2O6/view?usp=sharing
