---
title: "STARPWN 2026 Writeup Index: My First Aerospace CTF"
tags:
  - STARPWN
  - CTF
  - Space Security
  - Drone Security
categories:
  - CTF Writeup
aside: true
toc: true
abbrlink: "5439deff"
date: 2026-09-21 15:25:00
top_img:
cover:
---

> 🌐 中文版：[繁體中文](/posts/5439deff.html)
>
> This post records the overall experience of competing in STARPWN 2026; I'll write up the individual challenges separately.
> It's more of an overview: what this competition is actually about, which challenges I found interesting, and what it left me with afterward.

<!-- more -->

## What is STARPWN 2026?

STARPWN is an aerospace security CTF run by the DEF CON Aerospace Village. Unlike a typical CTF that splits challenges into Web, Pwn, Crypto, Reverse categories, it leans into aerospace-domain scenarios, such as:

- MAVLink
- ArduPilot
- EEPROM / firmware data
- GPS and coordinate data
- PCAP / telemetry
- Orbital mechanics
- Image processing

So by the end it felt like a crash course in space systems and drone security on the side.

> Competition site: `https://starpwn.ctfd.io/`

## Why did I play this one?

My reason for joining STARPWN was actually pretty simple.

I've been wanting to explore the Space Systems / Space Security direction for a while, but "space security" feels incredibly vague (there don't seem to be many people working on it in Taiwan), and satellites, ground stations, comms protocols, flight control, navigation, embedded systems, orbital mechanics could each become an entire field on their own.

So I wanted to know: **if someone actually turned Space Security into a CTF, what kinds of challenges would they write?** And after playing, the answer was far more interesting than I'd expected, because it isn't just ordinary security challenges wearing a satellite skin. At least this time, quite a few challenges genuinely required domain knowledge: you might reverse a binary but not know MAVLink signing; you might write Python but not know the Hohmann transfer; you might read GPS coordinates fine but never have thought to geometrically back out a jammer's location from a few jammed drones' positions. From a learning standpoint, I found this competition very worthwhile.

## A CTF where you study as you go

I ran into plenty of things I was completely unfamiliar with: how MAVLink message signing actually works, how ArduPilot stores certain data, how GPS interference can be localized, and those orbital-intercept formulas I'd only ever seen in textbooks or articles. I learned a lot while solving, which is why I wanted to organize it into writeups.

## About AI

This edition had something very 2026 about it: the organizers allowed using AI / LLMs, but required there still be a human who genuinely understands the challenge behind it. Late in the competition, a few teams were actually disqualified for AI usage that violated the rules (I saw it on the official Discord, which was scary).

After that announcement, I reconsidered how I'd used AI this time. For simpler challenges, or ones already within my comfort zone, I was actually much faster than the AI. The first few MISC challenges felt like AI was just burning tokens, so I solved them myself. But for binaries, protocols, or unfamiliar domains, I'd let Claude help analyze, write a parser or solver, and then decide the next step from the results.

There were also challenges completely beyond my knowledge, like image processing or certain orbital-mechanics calculations, where I did lean heavily on AI to try different approaches, but if the goal is learning, I learned a lot, which is another reason I wanted to revisit and organize these writeups afterward.

## Final result

I competed as a **solo team** named `Normal_Team`.

Final ranking: **18th place**.

The scoreboard had 339 ranked teams, so roughly the top 5%.

I was around 18th midway through, then dropped into the mid-20s due to getting stuck and sleeping; after the competition, the organizers cleaned up some teams that violated the AI policy, and my ranking landed back at 18.

![](final_score.png)

For my first time fully playing an Aerospace CTF like this, I think it's a pretty fun result.

But more important than the ranking: I now at least know what a "Space Security CTF" actually looks like.

## Writeup index

Below are the challenges I found more interesting and worth keeping.

A note on grouping: these challenges are **not one continuous storyline**, and each one lists its actual category for reference. Roughly four groups: the first three revolve around the same fictional **Prismantir drone swarm**, wrapped in a similar story as flavour (scored independently, with no solve-order dependency), all in **Forensics / drone telemetry**; the next two are **interactive-TCP orbital-mechanics calculation challenges**, same style but with no story connection to the swarm; then two are the same set of **visual-cipher (Forensics)** challenges, same setting but different writing systems to crack; and the last is a completely independent **Web / Supply Chain** challenge, linked to the space/drone theme only by flavour.

### [One to Rule Them All: from one flight-control chip into a whole drone swarm](/en/posts/77798b75.html)

**Category:** Forensics / drone telemetry (MAVLink protocol)

Find the MAVLink signing key in a drone EEPROM dump.

> Hit a classic C struct padding problem along the way, then used the found key to connect into a live drone system.

And the flag's hiding spot is wonderfully plain: **just list the filesystem properly and you'll see it**.

### [Deadly Parade: three drones lose GPS at once, and geometry finds the jammer](/en/posts/9f8dacd3.html)

**Category:** Forensics / drone telemetry / geolocation

Extract the drones' telemetry from a PCAP and find the ones simultaneously under GPS interference.

> I first used two seemingly reasonable average positions in a row, and both guesses were wrong. Only later did I realize what was really needed was a very basic geometric idea: **the circumcenter of a triangle.**

This one took the scenic route to the answer.

### [Connect the Dots: a stray drone writing in the sky with its trajectory](/en/posts/66ec2728.html)

**Category:** Forensics / drone telemetry

Here you get a roughly 150 MB raw MAVLink stream. After unpacking it, you can see ten drones' individual flight paths.

One of them clearly broke off from the formation, and plotting its path alone reveals it wasn't flying randomly:

**it's writing letters in the sky!!**

> Probably one of my favourite challenges this time.

### [Time to Intercept: got the formula right, but pasted the old answer wrong four times](/en/posts/114d2ca.html)

**Category:** Misc / orbital mechanics (interactive TCP service)

Unlike the first three, this one is fully standalone with no Prismantir flavour, just a Hohmann-transfer orbital intercept calculation, needing transfer time, mean motion, and phase angle, then deciding when to depart based on the target satellite's position.

The biggest bug up front was getting the phase-angle direction backwards. After finally fixing it and reconnecting, I reflexively pasted in the old answer from the previous round. My head wasn't very clear while playing this one, and I kept reconnecting with stale answers, about four times.

### [Tumbling Through Space: a tumbling satellite, with the answer blocked by floating-point error](/en/posts/7f658d39.html)

**Category:** Misc / orbital mechanics (interactive TCP service)

Same type as Time to Intercept, but here the server practically prints the control law in the hint: `T = -L / t`. The physics itself isn't hard.

> The real sticking point was floating-point precision. The computed torque vector's magnitude should be exactly 1.0 in theory, but after rounding it came out slightly over on re-validation, and my first submission got rejected over it.

### [Strange Holos 1: the graffiti on the wall is an alien script](/en/posts/e9d90ba.html)

**Category:** Misc / Forensics (visual cipher)

Just one cyberpunk-style image, no hints at all. First rule out that the answer is hidden inside the file, then slice the wall graffiti into individual characters.

I first guessed it was the Standard Galactic Alphabet, but grabbing the real mapping table and comparing showed it was completely off.

**The real answer is Star Wars' Aurebesh, decoding to one of the most famous lines in the whole saga.**

### [Strange Holos 2: this time it's Klingon, but the match scores are suspiciously low](/en/posts/a7cc743e.html)

**Category:** Misc / Forensics (visual cipher)

The second stage of the same set, with a completely different writing system.

Comparing the wall characters against a real font gave scores too low to trust, because the image is AI-generated and only stylistically similar. The real approach is to ask a different question: regardless of which alphabet this is, first look at which characters on the wall look the same as each other.

### [Starry Hacks: supply-chain poisoning a satellite's ground-control software](/en/posts/bdb3b555.html)

**Category:** Web / Supply Chain

A completely different type from the rest: you get a leaked flight-control software repo, find the dependency-confusion vulnerability in it, build a malicious package with the same name but a higher version number, and slip it into the normal build process.

> In the end it came down to letting the server's error message exfiltrate data for me: have the malicious code throw an exception, and the flag rides back out with the error message.

## Closing

STARPWN was more like a map for me.

It was the first time I concretely saw what the vague term "space security" contains once you break it apart (though it really does feel like nobody's talking about space security yet, it hasn't caught on). Some of it was stuff I was already fairly comfortable with, like networking, binary, and protocol, but some I'd barely touched before, like flight control systems, navigation systems, orbital mechanics, and some image processing. For a lot of these challenges I still wouldn't claim to fully understand them, so organizing these writeups is itself part of the competition for me.

> At least next time I see MAVLink, ADCS, orbital transfer, or some weird telemetry dump, I hopefully won't be starting completely from zero again.
