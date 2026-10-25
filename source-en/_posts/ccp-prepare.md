---
title: "\U0001F50B AWS Certified Cloud Practitioner Study Notes"
description: Notes I made before taking the AWS Certified Cloud Practitioner exam
toc: true
tags:
  - AWS
  - Certificate
categories:
  - Study Notes
aside: true
abbrlink: "e8acb5ee"
date: 2022-10-03 01:59:08
---

> 🌐 中文版：[繁體中文](/posts/e8acb5ee.html)

![](https://i.imgur.com/x1Sq6so.png)

# CCP preparation

- **Exam guide**: https://d1.awsstatic.com/zh_TW/training-and-certification/docs-cloud-practitioner/AWS-Certified-Cloud-Practitioner_Exam-Guide.pdf
- **Exam domain weightings**
![](https://i.imgur.com/xv5xcGu.png)

- **Related resources**
    - https://terahake.in/post/aws-ccp-certified-exp/
    - https://awslc.medium.com/aws-cloud-practitioner%E8%AD%89%E7%85%A7%E6%BA%96%E5%82%99-6b8bacc6a490
    - https://jayendrapatil.com/aws-certified-cloud-practitioner-exam-learning-path/?fbclid=IwAR3eiyroyZ_jTn2pA5ut_ophP8JNCzgspERnug_luC_HGltA-OkLwRwrhAU
    - https://d1.awsstatic.com/whitepapers/AWS_Cloud_Best_Practices.pdf?fbclid=IwAR1xXOBkWwESyy_9Srngna7rAbP_g1ddYMl2KO3moKJbzz1YDgrNOrv_z08
    - https://d0.awsstatic.com/whitepapers/aws_pricing_overview.pdf?fbclid=IwAR2mDUgA-IDHrqrQFGn3XL1kA0O1XojD6d6rdxwLWmvuL4D4mi4DKeDNonQ
    - http://yhhuang1966.blogspot.com/2020/03/aws-aws-certified-cloud-practitioner.html
- **Practice exams**
    - https://www.examtopics.com/exams/amazon/aws-certified-cloud-practitioner/




## The five pillars of Well-Architected
- Operational Excellence
    - The ability to run and monitor systems to deliver business value, and to continually improve supporting processes and procedures.
- Security
    - The ability to protect information, systems, and assets while delivering business value through risk assessments and mitigation strategies.
- Reliability
    - Recover from infrastructure or service disruptions
    - Dynamically acquire computing resources to meet demand
    - Reduce disruptions such as misconfigurations or transient network issues
- Performance Efficiency
    - The ability to use computing resources to meet system requirements, and to maintain that efficiency as demand changes and technologies evolve
- Cost Optimization
    - The ability to run systems to deliver business value at the lowest price point.

## Analytics
### Amazon Athena
- Analyze data in S3 with interactive standard-SQL queries
- Serverless
- You can define a schema and analyze data in S3 with SQL
### Amazon Kinesis
- Makes it easy to collect, process, and analyze real-time streaming data
- Things like video/audio streams, application logs, web clickstream analytics, IoT telemetry, and so on
    - Amazon Kinesis Data Firehose
    - Amazon Kinesis Data Analytics
    - Amazon Kinesis Data Streams
    - Amazon Kinesis Video Streams
### Amazon QuickSight
- A powerful BI (Business Intelligence) service
- You can build interactive dashboards
## Application integration
### Amazon Simple Notification Service (Amazon SNS)
- A publish/subscribe service. With an Amazon SNS topic, publishers can push messages to subscribers. It works like a coffee shop, where the cashier passes coffee orders to the barista making the drinks.
- In Amazon SNS, a subscriber can be a web server, an email address, an AWS Lambda function, or several other options
### Amazon Simple Queue Service (Amazon SQS)
- Amazon Simple Queue Service (Amazon SQS) is a message queue service
- In Amazon SQS, an application sends messages into a queue. A user or service retrieves a message from the queue, processes it, and then deletes it from the queue

## Compute and serverless
### AWS Batch
### Amazon EC2
- Instance types
    - General purpose
        - Compute, memory, and networking resource needs are roughly balanced across the application
    - Compute optimized
        - For compute-intensive applications
        - Also useful when you need to handle batch workloads that process many transactions in a single group
    - Memory optimized
        - Deliver fast performance for workloads that process large datasets in memory. In computing, memory is temporary storage. It holds all the data and instructions the CPU needs to complete its work.
        - Workloads that need to preload a large amount of data before running the application. This could be a high-performance database, or a workload that performs real-time processing of a large amount of unstructured data
    - Accelerated computing
        - Use hardware accelerators or coprocessors to perform certain functions more efficiently than is feasible running software on a CPU
        - Use hardware accelerators or coprocessors to perform certain functions more efficiently than is feasible running software on a CPU
    - Storage optimized
        - Designed for workloads that require high sequential read and write access to very large datasets on local storage. Good fits include distributed file systems, data warehousing applications, and high-frequency online transaction processing (OLTP) systems
        - Designed to deliver tens of thousands of low-latency random I/O operations per second (IOPS) to applications
        - For applications with high IOPS requirements
- EC2 pricing
    - On-Demand
        - Suitable for non-interruptible short-term workloads
        - No contract required
    - Savings Plan
        - Commit to a certain amount of compute usage over one or three years
        - Cheaper than On-Demand
    - Reserved Instances
        - Purchase instances for a one-year or three-year term
        - Usage can be matched against the On-Demand instances in the account
    - Spot Instances
        - Good for applications that can tolerate interruptions
        - Such as batch jobs
    - Dedicated Hosts
        - Physical EC2 servers
### AWS Elastic Beanstalk
- After you provide your code and configuration settings, Elastic Beanstalk takes care of deploying the resources needed to perform the following
    - Adjusting capacity
    - Load balancing
    - Automatic scaling
    - Application health monitoring

### AWS Lambda
![](https://i.imgur.com/iOCFQm5.png)

### Amazon Lightsail
- Amazon Lightsail provides easy-to-use virtual private server (VPS) instances, containers, storage, databases, and more at a cost-effective monthly price.
### Amazon WorkSpaces
- Amazon WorkSpaces is a fully managed desktop virtualization service for Windows and Linux that lets you access resources from any supported device.
## Containers
### Amazon Elastic Container Service (Amazon ECS)
- A highly scalable, high-performance container management system that makes it easy to run and scale containerized applications on AWS
- Supports Docker
### Amazon Elastic Kubernetes Service (Amazon EKS)
- Lets you run Kubernetes on AWS

### AWS Fargate
- A serverless compute engine for containers, usable with both Amazon ECS and Amazon EKS.
## Databases
### Amazon Aurora
- An enterprise-grade relational database, up to 5x faster than standard MySQL and 3x faster than standard PostgreSQL
- Supports two database options: MySQL, PostgreSQL
- Very low cost
- Data is replicated across facilities (six copies at any time, up to 15 read replicas)
- Continuous backup to Amazon S3
- Point-in-time recovery
### Amazon DynamoDB
- A serverless database with no underlying instances or infrastructure to manage
- You create **tables** to store and look up data
- Data is divided into items, and items have attributes
- Attributes represent different features of the data
- Stores disk mirrors across multiple availability zones to improve availability
- High performance and highly scalable, with millisecond response times
- A NoSQL database
- Can't be queried with SQL; queried by key attributes, which is highly flexible
- Use case: Amazon Prime Day handling a huge volume of user order requests

### Amazon ElastiCache
- Provides a caching layer for databases to increase read/write speed
    - Memcached
    - Redis
### Amazon DAX (DynamoDB Accelerator)
- Provides a native caching layer for DynamoDB, improving NoSQL read times
### Amazon Relational Database Service (RDS)
- A `relational database management service` (data is stored in a way that establishes relationships with other data)
- Supports most database engines
    - Amazon Aurora
    - MySQL
    - PostgreSQL
    - MariaDB
    - Oracle
    - Microsoft SQL Server

- Advantages
    -  Automatic vulnerability patching
    -  Backups
    -  Redundancy
    -  Failover
    -  Disaster recovery
- They can also be deployed further to Amazon Aurora
### Amazon Redshift
- A database purpose-built for high-speed, real-time ingestion and querying, for data-analytics workloads
- Most relational databases have a capacity ceiling, so they aren't suited to historical data analysis
- And the data types are varied, which a typical relational database struggles with, so this is where a **Data Warehouse** comes in
- A data warehouse handles big data and is suited to historical analysis rather than operational analysis
- For example, "what were our sales an hour ago?" is a number that won't change anymore
- Operational analysis, by contrast, is like "how much coffee inventory do we have right now?", data that is constantly changing
- Redshift can achieve 10x the performance of a traditional database

### AWS Database Migration Service (Amazon DMS)
- Migrate customer databases to AWS
- The database stays fully operational during the migration
- Downtime for applications that rely on the database is kept to a minimum
- The source and target databases don't have to be the same type
    - Oracle -> RDS for Oracle
    - MySQL -> RDS for MySQL
- Heterogeneous migration
    - When the source and target databases differ in **schema structure**, **data types**, and **database code**, you need a heterogeneous migration
    - It takes two steps
        - 1. Convert with the AWS Schema Conversion Tool
        - 2. Use DMS to migrate the database
- Development and test database migrations
    -  You can use the DMS service to migrate a copy of a database to a production or test environment
- Database consolidation
- Continuous database replication
    - Can be used for disaster recovery
### AWS DocumentDB
- Used for full document storage
- Good for content management, catalogs, and user profiles
### Amazon Neptune
- A graph database used for designing social networks and recommendation engines
- Also good for fraud detection
- Or supply-chain tracking and management
### Amazon QLDB (Quantum Ledger Database)
- An immutable system of record
- Entries can't be deleted from the audit trail
### AWS Auto Scaling
![](https://i.imgur.com/6uOa7tx.png)
- Dynamic scaling
- Predictive scaling
![](https://i.imgur.com/oPepLm4.png)

### AWS CloudFormation
- You can treat infrastructure as code (IaC). That is, you can build environments by writing lines of code instead of provisioning resources individually through the AWS Management Console.
- It lets you create infrastructure and applications repeatedly without performing manual actions or writing custom scripts. It determines the correct operations to perform when managing a stack, and automatically rolls back changes when it detects errors.
### AWS CloudTrail
- A comprehensive API auditing tool
- Every API request made to AWS is logged in CloudTrail
- It records who made the request, when it was made, the source IP, the response, and so on
- You can store these logs indefinitely in an S3 bucket
- CloudTrail events are typically updated within 15 minutes of the API call
### Amazon CloudWatch
- CloudWatch lets customers monitor their AWS infrastructure and the applications running on it
- It works by tracking and monitoring **metrics (resource-related variables)**
    - CPU utilization
    - RAM usage
- CloudWatch alarms
    - When a metric crosses a threshold, it can trigger an alarm
    - Integrated with SNS, it can send alert text messages
- CloudWatch dashboards
    - List metrics in near real time
- Advantages of CloudWatch:
    - Access all metrics from one central place for system-wide visibility
    - View applications, infrastructure, and services
    - Reduce **MTTR (mean time to resolution)** and improve total cost of ownership (TCO)
    - Analyze applications in depth and help optimize customer applications
### AWS Trusted Advisor
- An automated advisor
- It evaluates resources against the **five pillars**
    - Cost optimization
    - Performance
    - Security
    - Fault tolerance
    - Service Limits
-  It runs a series of checks for each pillar and compiles categorized items for review
-  Some checks are free
-  Example check: whether MFA is enabled
## Networking and content delivery
### AWS Elastic Load Balancing
- An AWS service that automatically distributes incoming application traffic across multiple resources (such as Amazon EC2 instances)

![](https://i.imgur.com/sJyERPV.png)
- ELB acts as the single point of contact for all web traffic coming into an Auto Scaling group. That is, when you add or remove Amazon EC2 instances in response to incoming traffic, the requests are first routed to the load balancer and then spread across the multiple resources that will handle them.

## Security, identity, and compliance
Shared Responsibility Model
![](https://i.imgur.com/wMSpH1U.png)
![](https://i.imgur.com/HOmBArE.png)
- Customers remember to patch their own OS
- The relationship between AWS and the customer is like that between a homeowner and the builder
### AWS Artifact
- Provides access to compliance reports, which are themselves verified by third parties
- AWS Artifact Agreements
    - A company may need to sign agreements with AWS regarding your use of certain types of information across AWS services
    - You can review, accept, and manage agreements for an individual account and for all accounts in AWS Organizations. Different types of agreements are available
- AWS Artifact Reports
    - You can review, accept, and manage agreements for an individual account and for all accounts in AWS Organizations. Different types of agreements are available, and this information can be accessed in AWS Artifact Reports
    - Access this information in AWS Artifact Reports
### Amazon GuardDuty
- An AWS threat-detection service
- Analyzes a continuous stream of metadata generated by your account, such as data from CloudTrail, VPC Flow Logs, and DNS logs
- Runs separately from your existing AWS services and won't affect the performance of your existing infrastructure
### AWS Identity and Access Management (IAM)
- IAM lets you control permissions in a fine-grained way
- You can create IAM users in IAM
- When first created, an IAM user has no permissions by default (can't create EC2, S3, etc.)
- Principle of least privilege
- IAM policies
    - JSON documents describing which API operations a user can and can't perform
    - You can attach policies to users or groups
    - Effect: `Allow` `Deny`
    - Action: which actions can be taken on a resource
    - Resource: which AWS resource the API call applies to
- IAM groups
- ![](https://i.imgur.com/u29juKI.png)
- Roles
    - Roles are switched between for different jobs
    - You can also create roles in AWS
    - A role has associated permissions that can allow or deny specific actions
    - A user can temporarily assume a role, with no username or password
    - They only get temporary permissions
- ![](https://i.imgur.com/Ds4cHxv.png)

### Amazon Inspector
- Runs automated security assessments against infrastructure to improve the security and compliance of applications deployed on AWS
- Can be used to spot deviations from best practice
- Vulnerability checks
- The service has three parts:
    - Network configuration reachability
    - The Amazon agent
    - The security assessment service
### AWS Shield
- A service that protects applications against DDoS attacks
- AWS Shield Standard
    - Protects all AWS customers automatically, for free
    - Uses analytics to detect in real time and automatically mitigate malicious traffic
- AWS Shield Advanced
    - Provides detailed attack diagnostics and detection/mitigation of sophisticated DDoS attacks.
### AWS WAF
- Use a Web Application Firewall (WAF) to filter incoming traffic
- Machine learning helps identify new threats
- Proactive defense
- You can set up a Web ACL
### AWS Organizations
- A central place to manage multiple AWS accounts
- Manage billing, control access, compliance, and security
- Lets all AWS accounts share resources
- Features:
    - Centralized management of AWS accounts
    - All accounts can consolidate billing (with discounts)
    - Implement hierarchical grouping of accounts (e.g. BU (business unit), OU (organizational unit))
    - Control which AWS services each account can access and which API actions it can perform
        - Service Control Policies (SCPs) can be used to specify the maximum permissions for member accounts
- ![](https://i.imgur.com/qwvjWXE.png)

### Amazon Elastic Block Store (Amazon EBS)
- If you don't want your database deleted every time you finish using an EC2 instance, you can use the EBS service
- You can create a virtual disk (an EBS volume) and attach it to an EC2 instance
- EBS isn't directly bound to EC2, so it can persist data independently of EC2's lifecycle
- You need to define: size, type, configuration
- Use case: persistent storage that EC2 writes to, so backing up the data is important
- EBS allows incremental backups of data (called **snapshots**)
- Take snapshots of EBS regularly to back up important data
- **Instance store**: the temporary block storage provided within EC2; when the EC2 instance terminates, the data in the store is also lost
- ![](https://i.imgur.com/8AVNGzr.png)
- ![](https://i.imgur.com/1kkfeOT.png)
- ![](https://i.imgur.com/QNVkgdB.png)
- EBS snapshots: the first backup copies all the data in the volume, and subsequent ones only store the data blocks that changed since the most recent snapshot, which is an **incremental backup**
### Amazon S3
- Data is stored as **objects**, not in a file directory but in a **bucket**
- Maximum upload object size: **5TB**
- You can enable **Object Versioning** to prevent accidental deletion
- You can create multiple buckets to hold different data categories or storage tiers
- You can set permissions to restrict who can access an object
- `Amazon S3 Standard`: 99.999999999% durability, meaning the probability that a file stays intact after a year
    - `How data is stored`: data is stored in at least three facilities, with copies in different locations
    - `Static website hosting`: host HTML files or other static file assets on S3
- `Amazon S3 Standard-Infrequent Access (IA)`: for data accessed infrequently but that must be retrieved quickly when needed
    -  Good for backups, disaster recovery, and long-term data storage
    -  `Amazon S3 Glacier`: can be used for long-term storage of audit data
    -  You can create a vault and use a **Vault Lock policy** to meet local regulatory requirements for how long audit data must be retained
    -  You can use a control in the Vault Lock policy: a **Write Once Read Many (WORM)** model to prevent future writes
- Lifecycle policies: automatically move data between different tiers
    - For example, you need to keep an object in S3 Standard for 90 days, then move it to S3-IA for 30 days, then move it to S3 Glacier after 120 days. In cases like this you can create a lifecycle policy to automate these actions
- `Amazon S3 One Zone-IA`
    - Data is stored in a single zone
    - Cheaper than S3 Standard-IA
    - Choose this storage class if you want to save on storage costs
- `Amazon S3 Intelligent-Tiering`
    - Good for data with unknown or changing access patterns
    - A small monthly monitoring and automation fee per object
- Objects:
- ![](https://i.imgur.com/fNAXd5H.png)
### Amazon S3 Glacier
- Designed specifically for data archiving
- Can retrieve data in minutes or hours
- Can be used to store archived customer data or old photo/video files
### Amazon S3 Glacier Deep Archive
- The lowest-cost object storage class, suited to archiving
- Can retrieve objects within 12 hours
### Amazon Elastic File System (Amazon EFS)
- Allows multiple instances to access the data in EFS at the same time
- Can scale up or down on demand

## EBS vs S3
||EBS|S3|
|---|---|---|
|Storage capacity|16TB|Unlimited, individual objects up to 5TB|
|Feature|Survives when the EC2 instance terminates|Write Once Read Many (WORM)|
|Storage type|Solid-state||
|Durability||99.999999999%|
|Use case|An 80GB video file being edited: you can enable object versioning and don't have to re-upload a whole new object each time; uses block storage|Static website hosting, geographically distributed storage, data backups, serverless|
|Summary|Complex write/read/modify functionality|Complete objects, occasionally-modified data|

## EBS vs EFS
- An EBS volume attaches to an EC2 instance, and EBS is an **availability-zone-level resource**. To attach EC2 to EBS, both must be in the same availability zone
- EBS is a disk that can hold file data, databases, or applications. Once the disk is full it won't automatically expand
- EFS isn't a blank disk, it's a real Linux file system
- EFS is a **regional resource**, so any EC2 in the region can write to the EFS file system
- As more data is written, EFS expands automatically

## RDS vs DynamoDB
|RDS|DynamoDB|
|---|--------|
|Automatic high availability, provides recovery|Key-value pairs, no schema required|
|Customer owns the data|Massive throughput capacity|
|Customer owns the schema|PB-scale expansion potential|
|Customer has control over the network|Fine-grained API access control|

Use cases:
- A sales/supply-chain management system: if you need business analytics with complex relational joins, RDS is a good fit
- For cases other than the above, DynamoDB works almost everywhere. Most cases don't need complex relational joins, like an employee contact table, which a single table can handle. DynamoDB eliminates the complex features and management overhead of RDS while letting you build a fast, high-performance database

## Pricing
- Free tier:
    - Always free
        - AWS Lambda allows one million free calls per month
    - Free for 12 months
        - S3 offers up to 5GB of free storage for 12 months
    - Some services offer short-term trials
        - Lightsail offers a one-month trial, with up to 750 hours during the trial period
- Pricing models
    - Pay-as-you-go: pay for what you use, no long-term contracts
    - Reserved capacity
    - Volume-based discounts: some services offer tiered pricing, where the per-unit cost decreases as usage increases
        - E.g. the more S3 storage you use, the less you pay per GB
- Pricing calculator
- Billing dashboard
    - Access Cost Explorer and create budgets
    - Compare your month-to-date balance with the previous month and get a forecast for next month based on current usage
    - View free-tier usage for each service
    - Publish AWS Cost and Usage Reports
- Consolidated billing
    - One of the features of AWS Organizations
    - You can consolidate the bills of individual AWS accounts, but still view line items per account
    - You can aggregate AWS resource usage at the organization level
    - Even if an individual account's bill is small, consolidating bills across the organization may qualify for volume discounts
    - Simplifies the billing process
    - A free feature
    - The default limit on the number of accounts allowed in an organization is 4
- Budgets service
    - You can set budget amount thresholds and send alert reminders to an email address
    - Information in Budgets updates three times a day
- Cost Explorer
    - A console-based service that lets you view and analyze your AWS spending visually
    - Shows which service you spent the most money on
    - Provides 12 months of historical data so you can track cost over time
    - Provides powerful reports, and you can also customize report content

## Support plans
- Basic Support (free)
    - 24-hour customer service
    - Documentation, whitepapers, forums
    - AWS Trusted Advisor
    - AWS Personal Health Dashboard
- Developer plan
    - Basic Support
    - Customer support via email (12-hour response)
- Business Support
    - Basic and Developer support
    - AWS Trusted Advisor full best-practice checks
    - Direct phone contact with cloud support engineers (4-hour response SLA)
    - 1-hour SLA for impaired production systems
    - Infrastructure Event Management (e.g. large events, global launches, etc.)
- Enterprise Support (for companies running mission-critical workloads)
    -  Basic, Developer, and Business support (plus a 15-minute SLA for business-critical workloads)
    -  Access to a Technical Account Manager (TAM)
        -  The TAM reviews your enterprise architecture with you against the Well-Architected Framework

![](https://i.imgur.com/r20KK1m.png)


## AWS Marketplace
- A digital catalog containing thousands of software products from independent software vendors, simplifying the steps to find, deploy, and manage third-party software running in your AWS architecture
- You can use AWS Marketplace to find, test, and buy software that runs on AWS
- When a customer uses a third-party application from Marketplace, there's no need to build, install, or maintain the infrastructure those programs require
- One-click deployment
- Also pay-as-you-go
- Many vendors offer free trials
- Enterprise-focused features
    - Custom terms and pricing, and management of custom license agreements
    - Private marketplace, where you can build a catalog of pre-approved software solutions that meet local regulatory or security requirements
    - Integrated procurement systems
    - AWS cost-management tools

## AWS Cloud Adoption Framework (AWS CAF)
- Provides recommendations to a customer company, offering guidance to help manage the process of migrating to the cloud
- AWS CAF perspectives (different people bring different perspectives and will have different migration strategies)
    -  Business: focuses on business capabilities
    -  People: focuses on business capabilities
    -  Governance: focuses on business capabilities
    -  Platform: technical capabilities
    -  Security: technical capabilities
    -  Operations: technical capabilities
## Migration strategies
- The 6 R's
    - Rehosting
        - Pick an application and move it almost as-is to AWS
        - Rehosting alone can save up to 30% of the total cost
    - Replatforming / lift-tinker-and-shift
        - Some cloud optimizations are made, but no changes to the core code are needed
    - Retiring
        - Some enterprises have applications in their IT portfolio that are no longer used
    - Retaining
        - Some applications need to be replaced, but the timing isn't right and they may keep running for several more months
        - These applications can be migrated to AWS
    - Repurchasing
        - Drop legacy licensed software and move to cloud-native products, etc.
        - High upfront cost, but large potential benefits
    - Refactoring
        -  Rewrite the code
        -  Some features may not have been possible on-premises before

## AWS Snow Family
All are tamper-resistant and all encrypt data with the customer's own 256-bit key
![](https://i.imgur.com/2lh2GeS.png)
### AWS Snowcone
- Holds up to 8TB of data and includes **edge computing (with EC2 and AWS IoT Greengrass)**
- You can order the device through the AWS console
- The customer installs the device, copies data onto it, then ships it back to AWS
- AWS then copies the data to an S3 bucket in the customer's AWS account
- 8TB, 4G RAM, 2 CPU
### AWS Snowball Edge
- Two options
    - Compute Optimized:
        - Good for large-scale data migrations and periodic transfer jobs
        - 80TB
    - Storage Optimized:
        - Good for machine learning, full-motion video analysis, and a local compute stack
        - 80TB
- Fits into an existing server rack
- You can use EC2 or IoT Greengrass for compute
- Use cases
    - IoT device streaming
    - Video transcoding
    - Industrial signal processing
### AWS Snowmobile
- The device sits in a giant 45-foot container
- Shipped by truck
- Holds 100PB (100,000TB) of data
- The device is tamper-resistant, waterproof, fire-suppressing, and temperature-controlled
- A security team monitors the escort team via video

## Availability Zone
![](https://i.imgur.com/l3j0kFf.png)
An AZ is a data center, or a group of data centers, within a region. Availability zones each sit tens of miles apart from one another. This distance is close enough to maintain low latency (the time between a request for content and its receipt) between availability zones. Yet if a disaster strikes one part of the region, they are also far enough apart to reduce the chance of multiple availability zones being affected.

## Edge locations
These use CloudFront to store cached copies of your content at sites closer to the customer's location, in order to speed up delivery
![](https://i.imgur.com/LEbdL9B.png)
