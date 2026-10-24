---
title: Supply-Chain Poisoning a Satellite's Ground-Control Software | Starry Hacks | STARPWN 2026
tags:
  - STARPWN
  - CTF
  - Supply Chain
  - Dependency Confusion
  - Web
categories:
  - CTF Writeup
aside: true
toc: true
abbrlink: "bdb3b555"
date: 2026-09-21 21:10:40
top_img:
cover:
---

> 🌐 中文版：[繁體中文](/posts/bdb3b555.html)

Unlike the earlier drone / orbital-mechanics posts, this is a genuine **Web / Supply Chain** challenge, with the scenario swapped to ground-control software. The gameplay is the classic **dependency confusion** [supply-chain attack](https://www.imperva.com/learn/application-security/dependency-confusion/), and in the end it came down to using the server's error message as a data-exfiltration channel to pull the flag out of an environment variable.

<!-- more -->

## What the challenge is about

{% note info %}
One of your daemons found a low-rent orbital control stack talking to its bird in the clear. That's kind of mistake gets people burned, and you just happen to have a lighter and too much time on your hands tonight.

You've already found an archive of the flight software repo, a live target, and a supply chain that looks just soft enough to ruin somebody's night.
{% endnote %}

> In plain terms: you have a leaked flight-software repo, a live online target, and a supply chain soft enough to crush. The task is to get a malicious package update to slip into the normal deployment flow and ultimately extract the satellite's secret.

Two things are given:
- A 566-byte `fligh_repo.tar.gz` (a fragment of the leaked flight-software repo)
- An online Mission Control web backend

## First, the leaked repo: a textbook dependency-confusion flaw

The repo has only three files:

```
mission/
  flight_app/
    __init__.py
    main.py
  requirements.txt
```

`requirements.txt` has a single line:

```
cubesat-upstream-driver>=1.0.0
```

The key snippet in `main.py`:

```python
from cubesat_upstream_driver import handle_command

def process_command(cmd: str) -> str:
    cmd = (cmd or "").strip()
    driver_reply = handle_command(cmd)
    if driver_reply:
        return f"TM|EVENT|COMMAND_ACK|{driver_reply}"
    ...
```

This is a classic **dependency confusion** setup: the flight software imports a third-party package whose name sounds like an internal one (`cubesat_upstream_driver`), and `requirements.txt` only pins a lower-bound version (`>=1.0.0`), with no source index specified and no hash verification.

The risk of writing it this way: if an attacker can make the build process resolve a **same-named package with a higher version number** from a source the attacker controls, that attacker's code gets installed and runs along with the normal flow. Worse, `handle_command()`'s return value gets dropped straight into the telemetry response, which is effectively a built-in data channel back out.

## A look at the online target

The online Mission Control backend has: a command console (buttons for `PING`, `STATUS`, `ORBIT`, `HELP`, `RESET`, `TRIGGER_BUILD`, `DEPLOY_SOLAR_PANEL`, plus a free-text input), a file-upload widget (accepting `.whl` / `.tar.gz`), and a WebSocket pushing live telemetry.

But the UI alone isn't informative; what matters is the protocol underneath. Instead of clicking buttons, I pulled down the front end's bundled JS (`/assets/index-*.js`) to read what the buttons actually say to the backend. That confirmed a few things:

**1. Commands are sent over WebSocket with no authentication at all.** Free-text commands are wrapped as JSON like this and sent over `wss://<host>/ws?sid=<uuid>`:

```json
{"type": "command", "command": "<your text>"}
```

That `sid` is just a UUID the browser makes with `crypto.randomUUID()` and stores in `localStorage`; a fresh one connects just as well, meaning the WebSocket has no session verification and anyone can connect and talk.

**2. `/openapi.json` was left open.** FastAPI mounts this API schema by default, laying the whole REST interface bare:

```
POST /api/upload?submit_to_gateway=true   # upload artifact, can forward to gateway
GET  /api/artifacts/{artifact_id}
POST /api/session/reset
GET  /api/health
```

The upload widget uses `POST /api/upload` (multipart, field name `file`), and that `submit_to_gateway=true` parameter is exactly what makes the dependency confusion possible later.

**3. The command box has a whitelist.** Typing arbitrary text into the command box to test for command injection always returns:

```
400: command not allowed
```

Comparing against the `HELP` command's output, the server-side whitelist is exactly the buttons on screen: `PING,STATUS,ORBIT,HELP,RESET,DEPLOY_SOLAR_PANEL,TRIGGER_BUILD`.

So command injection through the command box is a dead end, and the real path is the dependency-confusion angle spotted in the leaked repo.

## The attack chain

The whole chain looks like this:

```
cubesat-upstream-driver (requirements.txt expects version >=1.0.0)
        ↓ attacker uploads a same-named package with a higher version
POST /api/upload → forwarded to the internal "gateway" (private package index)
        ↓
send TRIGGER_BUILD → the flight software reinstalls dependencies from that index
        ↓
the next call to handle_command() runs the attacker's code
```

I built a pure-Python wheel named `cubesat-upstream-driver`, bumped the version far above `1.0.0` (`9.9.x`), and uploaded it:

```bash
curl -s -X POST https://.../api/upload -F "file=@cubesat_upstream_driver-9.9.x-py3-none-any.whl"
```

The response has two independent fields:

```json
{
  "score": {"ok": true/false, "reason": "marker matched / marker not matched"},
  "gateway_upload": {"ok": true, "status_code": 200, "body": "{\"status\":\"ok\",\"stored\":\"...\"}"}
}
```

The `score` field is actually a **decoy**. You'd naturally assume `score.ok == true` means success, but its `reason` reads `marker matched / marker not matched`, and that word "marker" is suspicious: it sounds less like checking whether the package runs and more like comparing a string.

So I tested it: I uploaded two packages that behave identically on the gateway side, differing only in whether the `__init__.py` source literally contained the line `if cmd == "DEPLOY_SOLAR_PANEL":`. The `score.ok` flipped between `true` / `false` with the presence of that text, while `gateway_upload.ok` never changed.

That proves `score` is just a **static string comparison on the uploaded source**, entirely unrelated to whether the package was installed or imported. It's only there to lure you into chasing the `DEPLOY_SOLAR_PANEL` dead end.

What actually matters is `gateway_upload.ok`, which confirms your package really landed in the index (gateway) the build uses. That field sits quietly next to the eye-catching `score`, easy to overlook.

## A few dead ends along the way

**Dead end 1: `DEPLOY_SOLAR_PANEL` kept failing.** `TRIGGER_BUILD` always returned `BUILD|HTTP_200|{"status":"ok"}`, but `DEPLOY_SOLAR_PANEL` always returned `TM|ERR|FLIGHT_UNREACHABLE`, regardless of the simulated link status shown in the UI.

I eventually realized `DEPLOY_SOLAR_PANEL` is a deliberate misdirection: it's bound to a code path that only succeeds with real hardware, which the challenge environment doesn't have. So no matter how successful the package implant is, that command always returns `FLIGHT_UNREACHABLE`; it was never the path to the flag. The `score` marker that checked for `if cmd == "DEPLOY_SOLAR_PANEL":` is the other half of the same trap: one lures your attention onto this command, the other makes you think you bet right. The command that actually calls the implanted package and succeeds is the unassuming `STATUS` (the next dead end reveals this).

**Dead end 2: `PING`/`STATUS` looked completely unaffected.** Repeating "upload → build → send PING" always returned the standard `TM|HEALTH|OK`, and I briefly thought the package wasn't being picked up at all.

Using Python's `websockets` library to bypass the front end and hit the raw WebSocket revealed the truth: **`PING` and `ORBIT` never call `handle_command()`** and are answered locally by the server, contrary to what the leaked `main.py` implied. Only `STATUS` and `DEPLOY_SOLAR_PANEL` actually call into the implanted package.

**Key finding: the exception message itself is the exfiltration channel.** Sending malformed messages to the WebSocket (e.g. a number or array in the `command` field) makes the server leak the raw Python exception message back, such as `"'list' object has no attribute 'strip'"`.

Applying the same idea inside the implanted package, having `handle_command()` **raise an exception** instead of returning normally confirmed the server wraps the exception content verbatim into the response:

```
TM|ERR|EXCEPTION|<exception message>|SAT_LINK=1|SAT_LAT=...|SAT_LON=...
```

That's the real channel for exfiltration: **whatever string you put in the exception comes straight back to the browser.**

**Dead end 3: the first recon attempt failed silently.** My first attempt had `handle_command()` run a scan that, among other things, recursively searched the whole filesystem via a `subprocess` call. It only returned a bare `FLIGHT_UNREACHABLE`, with no message at all.

I couldn't see the server's internal logs, but I could reason backward from behavior. The key evidence: **the same exfiltration mechanism gave completely different results depending only on how fast the payload ran.**

- I'd just confirmed that raising an exception makes the server return the exception message (`TM|ERR|EXCEPTION|...`). The channel itself works.
- But this version, with the recursive full-filesystem search, returned a bare `FLIGHT_UNREACHABLE`, with no exception message, as if the server were waiting on something that never came back.
- Replacing the payload with a near-instant version (only scanning `os.environ` and reading a few fixed paths, dropping the subprocess and the filesystem-wide search) made the channel work again immediately, returning the exception with the flag.

In other words, the channel works, the fast payload works, and only the **slow payload** returns `FLIGHT_UNREACHABLE`. The one explanation that fits all three: the recursive search was too slow and blew past the server's timeout for simulating the flight-control round trip. The server reported the link down first, so the exception never got a chance to be caught, formatted, and sent.

> When debugging a blind injection like this, always separate "is my code even running" (a fast, simple probe) from "what can my code reach" (the real payload), or an unrelated timeout will make an injection that already succeeded look like a total failure.

## The result

With a fast, environment-only scan (reading `os.environ` and checking a short list of likely flag file paths, no subprocess, no filesystem-wide search), packaged as `cubesat-upstream-driver` v9.9.20, uploaded, triggered with `TRIGGER_BUILD`, and queried once more with `STATUS`:

```
TM|ERR|EXCEPTION|RECON FLAG=STARPWN{7h20u9h_v1c702y_my_ch41n5_423_820k3n}|SAT_LINK=1|SAT_LAT=42.1494|SAT_LON=-121.0978
```

The flag was sitting right in the flight software's `FLAG` environment variable.

## Flag

```
STARPWN{7h20u9h_v1c702y_my_ch41n5_423_820k3n}
```

In leetspeak this reads "Through victory my chains ~ break token," echoing how the secret only leaked once this chain was broken by turning the exception message into an exfiltration channel.

## Takeaways

1. **Dependency confusion is a real and quickly-exploitable flaw.** As long as a same-named, higher-versioned package can be slipped into a source the build process trusts, the attacker's code gets installed and runs. The root cause is pinning only a lower-bound version (`>=1.0.0`) without specifying a source index or hash verification.
2. **Don't trust the field that merely looks like "success" on screen.** `score` looks like a validation result but is just a static string comparison unrelated to whether the package works, there to steer you toward a dead-end command (`DEPLOY_SOLAR_PANEL`). The field that actually matters, `gateway_upload.ok`, is easily overshadowed by the flashier one beside it.
3. **Talk to the underlying protocol directly instead of only through the front end.** The React page only sends fixed-format `{"type":"command",...}`; writing a Python WebSocket client to hit the raw protocol lets you feed malformed messages and catch the interleaving of requests and responses.
4. **Error messages are an exfiltration channel.** Once you confirm the server returns exception content verbatim to the client, a deliberate `raise` is more useful than a normal `return` for probing unknown calling conventions, since you don't need to know the correct response format in advance.
5. **The implanted payload has to be fast enough.** Recon code that's too slow can hit an unrelated timeout / protection first, making the whole attack look like a failure and masking the fact that the injection already succeeded. When debugging, separate "is my code running at all" (a fast, simple probe) from "what can my code reach" (the real payload).

----
