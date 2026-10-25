---
title: Reflections on a Year and a Half as an AWS Cloud Support Engineer
toc: true
tags:
  - AWS
  - Amazon
  - Cloud Support
categories: LeetCode Notes
aside: true
abbrlink: "c0ef3a5f"
date: 2024-07-03 12:26:11
cover: /img/AWS/CSE/aws3.jpg
---

> 🌐 中文版：[繁體中文](/posts/c0ef3a5f.html)

# Background

> I currently work as a **Cloud Support Engineer** at Amazon Web Services in Taiwan, but in two days I'm leaving. So before I go, I wanted to write down and look back on the work and life of the past year and a half.

I applied for the AWS Cloud Support campus recruitment position in the first semester of my second year of grad school (October 2021). At the time I was originally looking for the R&D alternative military service, but once I heard AWS had an opening, I sent in my resume just to see what would happen. I got the Online Assessment notice about a day later. The OA was really just basic computer knowledge, probably just used to filter CS vs non-CS majors (?). Then came the phone interview. Back then the campus recruitment let you rank your preferences. What I originally wanted was the Security or Deployment profile, but during the interviews I found most of the questions were troubleshooting-related, so Security was a fail, and in the Deployment final loop I got grilled in the last technical round too. Later I switched to interviewing for **DMS (Developer and Mobile Services)**. Even though it was a field I wasn't familiar with at all, thankfully I passed the interview in the end.

After finishing my master's degree and my military service, I finally started at the end of March 2023. This was the first full-time job of my life.

# Onboarding

The first few months are employee training plus learning the services your team needs to know. This stage really demands absorbing all kinds of knowledge quickly. Every day there was something new to learn, very full-on, and you had to pick up a technology or tool fast. These months might have been the happiest: learning things and getting paid for it. But the foundation really does get laid during this time, so in those first few months I spent a while deploying and wiring up services in our internal lab environment. For example, implementing API Gateway Private Integration, experimenting with Lambda Provisioned Concurrency, that sort of thing.

Life back then was pretty relaxed. I'd bring my MacBook Pro to the office, grab any seat (Agile Desk, Shared Desk), open the AWS Console, jump into `us-east-1`, and start practicing and operating resources. The nice thing about a cloud company is that the local employees' hardware doesn't have to be great, since you just connect to some Region to get your work done. When I got tired I'd go make some tea or coffee, look out the window at Taipei 101 or the Tao Zhu Yin Yuan building, and take it in.

# Day-to-day work

![](/img/AWS/CSE/aws2.jpg)

During onboarding you also learn how to resolve cases. This job is a lot like being a disaster-relief worker: the person opening a case is often already facing a damaged production environment, so at that point you might need to hop on a call with the customer, pin down the problem, and try to solve it. If it's something we can't solve, the problem can be escalated to a stronger internal team to investigate (they have permission to use certain investigation tools), and sometimes you also need to talk to internal service teams to understand the details. Different cases also have different levels of urgency, so you have to stay alert at all times. You might be taking it easy one moment and suddenly an urgent case comes in (and of course there are also customers who open a non-urgent case as urgent). A single sentence might mean a call, and then you're watching the customer's screen as they operate, investigating.

I also feel really lucky I got to work alongside a group of absolute experts here. Some of my questions were probably dumb to them, but they'd answer enthusiastically, so you could learn all kinds of things without worry, and there was room to make mistakes. It was a team you could feel at ease being part of.

Cloud Support is shift-based, so weekends need people on duty too. After all, AWS Support's whole pitch is **24/7, 365 days, uninterrupted service**. So as the Taipei timezone is wrapping up for the day, Dublin in Ireland takes over and keeps handling incoming cases, then it's Seattle's turn, and the next day it comes back to Taipei. So cross-country collaboration is pretty frequent here too.

> You might randomly get pinged by someone in India with a question lol

For larger customers, you'd usually need to meet and collaborate with the Technical Account Manager (TAM) or Solutions Architect (SA) responsible for that customer. There's bound to be friction in that, and how you digest it is up to the individual (hard to say, lol).

# Daily life

In the morning, after everyone finished their cases, we'd go to Yongji Road for a cheap lunch, chatting over the meal about who ran into which customer again. Thursday afternoons we'd enjoy the afternoon tea the company ordered. Then it was back to work until the end of your shift. I also feel like there was quite a lot of leave, plus comp time, so I actually took time off to travel fairly often. And you don't have to worry while you're off: if a customer comes back, someone will always pick it up for you.

![](/img/AWS/CSE/aws4.jpg)
![](/img/AWS/CSE/aws5.jpg)
A couple of afternoon-tea photos from a few weeks back.

The company has quite a few events too, though whether you have time to join is another matter. Even though this job doesn't require overtime, those 8 hours felt pretty intense to me personally. I once had an afternoon with three back-to-back customer meetings, which really makes your head explode.

# CSA to CSE

In campus recruitment I mainly applied for CSA (Cloud Support Associate), because I had no cloud experience at the time, so you start in this position. But actually, a while after training ends you go through the process of converting to CSE. During this period you still need to resolve more cases and get more familiar with the services' characteristics. This change of position really only affects your title and salary; what you actually do is still the same: troubleshooting for customers.

# SME

Outsiders might only know about AWS Certificates, but for people inside AWS, SME (Subject-Matter Expert) is the more important thing. It usually means you're extremely familiar with a service, enough to be an expert in it. It's a kind of proof of your ability, and an effective data point to demonstrate you have certain skills, which can help somewhat with collaboration or promotion.

> Reference: https://aws.amazon.com/tw/certification/certification-sme-program/

# Why leave?

It's hard to explain in a sentence. All I can say is that my personality isn't quite suited to Support, and there was a gap from what I expected coming in. Overall, since it's about serving customers, it felt more like a service industry: dedicated to providing good service and meeting most of the customer's requests. But I'd expected to be solving interesting technical problems, whereas here any problem is possible, and no day is predictable in what you'll hit. Most problems might be ones you've repeatedly seen before, or ones with little technical substance. If you want a stable work life, this job is pretty good, but this was my first job, and I wanted to learn more, not be confined to specific AWS services.

Another thing is how hard it is to change tracks. The longer you do Support, the more the development and research skills you used to have gradually fade. After work I didn't really have the energy to learn new things either; I just wanted to release the negative energy I'd absorbed during those 8 hours (which is why I say it's probably more personality-related: I'm not well suited to the service industry). So the things I once knew gradually faded, and that gave me an inexplicable panic. I could already picture myself failing to switch jobs after 30.

Relocation would be a harder path here, and I probably wouldn't stay until that happened. Promotion is a matter of opinion, so I won't comment... :(



# A fun part: sleeping over at the office

There were still plenty of fun times at the company. A while back I took on the challenge of staying overnight at the office. In the evening I ordered pizza with coworkers and we chatted for ages. That kind of joyful atmosphere is really great. After everyone left, I went back to my seat.

![](/img/AWS/CSE/aws6.jpg)

It was my first time sleeping over at the office. Even though the other AWS building has showers, I figured I'd just take the MRT home at 6 am and shower then. After 8 pm the office emptied out, and I did some LeetCode at my desk. Once I was done, in the middle of the night I watched the launch-day livestream of the Elden Ring DLC. Roughly every hour Security would come by on patrol. I'd heard a rumor before: there was once an employee who slept at the office too, but he was studying there, and once he'd passed every AWS certification he bailed. Sounds like a weirdo like me.

![](/img/AWS/CSE/aws7.jpg)
The Xinyi District night view in the evening is pretty beautiful too.

![](/img/AWS/CSE/aws8.jpg)

Call it leaving as deep a memory as I could at this company.

# What's next

Since I decided to leave, I also stopped seeing the therapist. I can only say that quitting cures all ills. The faded knowledge is gradually returning to my body, my mood has gradually brightened, and I've started getting back into my old regular exercise habits. In my spare time I even submitted a paper to IEEE CNS, and now I'm doing LeetCode. Life is very nourishing.

But overall, I'd still highly recommend using AWS services. The engineers inside all have the spirit of **Customer Obsession** and **Deep Dive**, and being a customer is a very fortunate thing. The friendships, connections, and resources this job brought are all extremely precious, and I learned a lot of cloud-service knowledge I didn't have before, plus many serverless and architectural deployment approaches. It was a very precious year.

Before I leave the day after tomorrow, I'm still a bit emotional about saying goodbye to this place. I hope all my coworkers can find where they belong. Goodbye, Amazon Taiwan.
