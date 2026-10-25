---
title: "\U0001F4D1 DMS Troubleshooting Notes"
description: Notes I made in 2021 while interviewing at AWS, mostly organizing various troubleshooting knowledge and the principles behind it
toc: true
tags:
  - Linux
  - Network
  - Web
categories:
  - Study Notes
  - Troubleshooting
top_img: 'https://i.imgur.com/b3n6aNl.jpg'
aside: true
abbrlink: "5728fae1"
date: 2021-11-13 10:12:17
---

> 🌐 中文版：[繁體中文](/posts/5728fae1.html)

## Network Debug
- If you can't SSH to a server, what would you do?
	- First ping the server to see if it's reachable
	- If it's still failing, troubleshoot based on the error message the SSH connection prints
	- **Unable to open connection to example.com Host does not exist**
		- Check whether the target server's domain name can be resolved via `ping`
		- If you used the hostname, try the IP instead (alternate between the two)
	- **Connection timed out**: the client tried to establish a network socket with the SSH server, but the server didn't respond in time
		- Check whether you're connecting on port 22, or on a custom port
			- `$ netstat -all`
		- Check whether firewall rules are blocking inbound traffic from a specific IP or on port 22
			- `$ iptables --list`
			- See whether a **Drop** method is configured
			- Or whether port 22 hasn't been added to the allowed connections
	- **Connection Refused**: the request is being routed to the host, but the host didn't receive it
		- Check whether you're connecting on port 22, or on a custom port
		- Check whether firewall rules are blocking inbound traffic from a specific IP or on port 22
			- See whether a **Drop** method is configured
			- Or whether port 22 hasn't been added to the allowed connections
			- Check whether the service is currently running and bound to the expected port
	- How do you check the firewall?
		- `iptable -nL`
		- `ufw status`
	- Check SSH status
		- Older OS versions can use `service`
			- `service ssh status`
			- If the result correctly shows a process id, it's running correctly
			- If it isn't running it'll show a message like ssh stop/waiting
			- You can start the service with `service ssh start`
		- Newer OS versions can use `systemctl`
			- `systemctl status sshd`
			- If it's running correctly it'll show active or running
			- If it isn't running it'll show inactive
			- You can start the service with `systemctl start sshd`
	- Check the SSH service port
		- There are two ways to check which port SSH is running on
			- First, look at the ssh config file
				- `grep Port /etc/ssh/sshd_config`
			- If you know the ssh service is running, you can use `ss` to check whether it's on the expected port
				-  `ss -plnt` // queries socket info from the kernel
				-  `netstat -plnt`
- What are some causes of a failed SSH connection?
	- **The SSH public key hasn't been injected onto the server**
		- We generate an ssh key pair locally, and may protect the private key with a passphrase
		- Inject the ssh public key onto the remote server at **~/.ssh/authorized_keys**
		- Sometimes you'll often get the error **Permission denied (publickey)**
			- Cause 1: that private key doesn't have permission to log in
			- Cause 2: the public key wasn't placed in the path correctly, or the public key is lost
			- Cause 3: the local ssh public and private keys aren't correctly paired
			- Before connecting, ssh checks whether our public and private keys pair correctly
		- Default paths
			- `$ ssh-keygen`
			- The public key goes by default to `/home/username/.ssh/id_rsa.pub`
			- The private key goes by default to `/home/username/.ssh/id_rsa`
		- How do you inject the public key into the server's path?
			- `ssh-copy-id USER@HOST`
			- By default it goes to **~/.ssh/authorized_keys**
	- **The firewall is blocking the connection**
		- Check the policy
	- **Host Key Check Fails**
	![](https://i.imgur.com/XSDQF9V.png)
	You get an error message like this.
	Every server has a fingerprint; a different server, or a reconfigured server, has a different fingerprint.
	On a successful login, your computer saves the fingerprint to compare against the next connection. If the fingerprint doesn't match, you get this kind of warning.
		- If you're certain you reconfigured the server, you can ignore this warning
		- You can delete the entry in **~/.ssh/known_hosts**, or empty the file, which turns off all key checking
	- **Your SSH Key File Mode Issues**
		- To protect the SSH key file, its permissions should be 0600 (owner R+W) or 0400 (owner R)
		![](https://i.imgur.com/F9O86LG.png)
- How do you enable passwordless authentication in SSH?
	- Edit the settings in `/etc/ssh/sshd_config`
	```=
	PasswordAuthentication no
	PubkeyAuthentication yes
	```
- Explain how the Ping and Tracert commands work.
	![](https://i.imgur.com/Kog8FV8.png)
	- Ping: sends an ICMP Echo Request to a specific target to confirm the communication status with the destination
		- From the TTL value in the ping reply you can infer the OS the other side is using and the number of routers the packet passed through
	- Tracert: makes clever use of timeout errors to discover the path to the destination
- [How do you change the MTU value under Linux?](https://www.361way.com/linux-mtu-jumbo-frames/4055.html)
- What is a Jumbo Frame?
	- A frame larger than the standard Ethernet frame, bigger than 1518/1522 bits
	- Can only run on full-duplex Ethernet
	- The standard Ethernet IP message size is 1500 bits, or 1518 bits including the Ethernet header and FCS (6+6+2+4)
	- A jumbo frame refers to a Layer-2-encapsulated, Layer-3 IP message whose value is larger than 9000 bits
	- If you use normal 1500-bit frames, the smaller the frame, the larger the number of transmitted packets and the more computation, so:
		- It increases the host's computation and consumes CPU resources
		- It affects network throughput
		- So enlarging the frame can reduce CPU computation and speed up transmission
- How do you change the frame size (how do you create a jumbo frame)?
	- Change the MTU (Maximum Transmission Unit) value
	- 1. `ifconfig ${Interface} mtu ${SIZE} up`
	- e.g. `ifconfig eth1 mtu 9000 up`
	- But this needs to be reset after a reboot
	- 2. Edit the config file
	- On Ubuntu/Debian it's under /etc/network/interfaces
	- Add `mtu 9000`
	- Restart the service `/etc/init.d/network-manager restart`
	- **When going through a switched network, changing the MTU value on the host alone isn't enough; you still need to check whether the network devices have jumbo frames enabled**
- Testing MTU
	- `ping -l 9000 -f <domain>`
	- The -f flag tells the OS it can't change the packet size on its own
- Explain how email communication works.
	- When you type an email address, the part after "@" is the domain name
	> http://linux.vbird.org/linux_server/0380mail.php#whatmail_dns
	> https://weils.net/blog/2017/04/19/how-email-works-dkim-all-in-one/
> https://docs.digitalocean.com/support/how-to-troubleshoot-ssh-connectivity-issues/
> https://www.linux.com/topic/networking/4-reasons-why-ssh-connection-fails/
> https://help.skysilk.com/support/solutions/articles/9000150151-how-to-troubleshoot-ssh-connection-issues-using-vnc-console
- How would you resolve a DNS configuration failure?
> https://www.digitalocean.com/community/tutorial_series/an-introduction-to-managing-dns
- Can you explain how the HTTP protocol works?
    ![](https://i.imgur.com/kwU3Ay7.png)
	- Usually a user makes a request to the server via a browser or a crawler
	- We call this client a User Agent, a proxy program
	- The requested server may also have resources like HTML files or images
	- When the HTTP client makes a request, it establishes a TCP connection to the server's designated port (80 by default)
	- The HTTP server then listens for the client's request on that port
	- Once it receives the request, the server returns a status to the client, e.g. "HTTP/1.1 200 OK", along with the returned content or an error message
	- HTTP 1.1 added a keep-alive mechanism, so one connection can be reused across multiple request/response exchanges
	- This can reduce waiting time
- And HTTPS?
	- It just performs a TLS/SSL handshake before the HTTP connection
- What HTTP status codes do you know?
	- 2xx
	![](https://i.imgur.com/KWTpmAh.png)
	- 3xx
	![](https://i.imgur.com/zShTVKk.png)
	- 400 - Bad Request: the syntax of the HTTP request sent to the server is wrong or invalid
		- Check:
		- 1. An error in the URL
		- 2. Cookies for the site may be corrupted; clear the browser's cookies and cache
		- 3. Try opening the same page in a different web browser
	- 401 - Unauthorized: the user tried to access a resource without being authenticated; the user must provide credentials to view the protected resource
		- Check:
		- 1. Check the URL for errors; if the URL is valid, go to the homepage and log in, enter your info, then retry
		- 2. The browser may have cached invalid info, so clear the cache
	- 403 - Forbidden: happens when the user makes a valid request but the server refuses service because it lacks permission to access the resource
		- Check:
		- 1. Make sure the access permissions for the /www data on the server are correct
		- 2. Check the .htaccess settings (the .htaccess file controls access to resources)
		- 3. This can also happen if the site has no index file, in which case you need to rename the homepage to index.html/index.php
		- 3. Contact the site administrator to get access (permissions should be set to read)
		- 4. If other users can access it, you need to contact your ISP to resolve the issue
	- 404 - Not Found: the user can communicate with the server but can't locate the requested resource
		- Check:
		- 1. Again, check whether the URL is wrong
		- 2. Press F5 to refresh the page
		- 3. Clear the browser cache
		- 4. Change the DNS server settings
	- 500 - Internal Server Error: this means something is wrong on the website server; the server can't detect the exact problem, but the client can still try the following
		- Check:
		- 1. High network traffic: press F5 to reload the page
		- 2. Clear the web browser's cache and cookies
		- 3. Check that the site's .htaccess file was created correctly
		- 4. Check whether any files and folders have incorrect permissions
	- 502 - Bad Gateway: the server, acting as a gateway or proxy, couldn't get a valid response from the upstream server; this can also be caused by a DNS issue
		- Check:
		- 1. Press F5 to reload the page
		- 2. Close all open browsers and start a new browser session
		- 3. Clear the browser cache
		- 4. Temporarily disable the CDN (Content Delivery Network)
		- 5. Restart network devices (modem, router, etc.)
	- 503 - Service Unavailable: the server is overloaded or under maintenance
		- Check:
		- 1. Press F5 to reload the page
		- 2. Restart network devices (modem, router, etc.)
	- 504 - Gateway Timeout: the server, acting as a gateway or proxy, couldn't get a response from the backend server within the allowed time
		- Check:
		- 1. Press F5 to reload the page
		- 2. Restart network devices (modem, router, etc.)
		- 3. Change the DNS server (if all devices on your network get the same error)
		- 4. If there's still an error, you may need to contact your network admin or ISP
- Can you explain how SMTP works?
- Can you explain how DNS works?
	- There are two kinds: authoritative DNS, and recursive servers
	- Authoritative servers receive and respond to DNS queries, finding their way layer by layer up to the root DNS server
	- A recursive server doesn't have DNS records itself, but passes the request along to authoritative DNS servers to get the IP address
	- How it works:
		- When you type www.ntust.edu.tw, the DNS server receives a request to look up the IP address
		- The DNS server begins resolving the IP address for www.example.com
		- And checks whether a DNS record is in the local DNS server's cache
			- It looks in `/etc/resolv.conf` and turns the domain into an FQDN
		- If not, it goes to the root DNS server to look it up
		- The root DNS server tells the DNS server the IP address of "the DNS server that manages tw"
		- Once the local DNS server gets that IP, it sends a DNS request
			- `dig tw ns +short`
		- The DNS server managing tw tells the local DNS server the IP address of "the DNS server that manages edu.tw"
			- `dig @nameserver edu.tw ns`
			- `dig @a.dns.tw edu.tw ns +short`
		- Once the local DNS server gets that IP, it sends a DNS request
		- The DNS server managing edu.tw tells the local DNS server the IP address of "the DNS server that manages ntust.edu.tw"
			- `dig @nameserver ntust.edu.tw ns +short`
		- Then the local DNS server makes a request to that IP address
			- `dig @RealAuthorieServer ntust.edu.tw a +short`
		- The DNS server managing ntust.edu.tw returns the IP address of www.ntust.edu.tw
- Can you walk through the TLS/SSL handshake process?
    https://www.cloudflare.com/zh-tw/learning/ssl/what-happens-in-a-tls-handshake/
    ![](https://i.imgur.com/4EOqjes.png)
    It runs at the Session layer, mainly exchanging information between the two parties and authenticating each other, and through the encryption algorithms they use, producing a consistent working key
    - When does the TLS handshake happen?
        - When a user navigates to a site that uses HTTPS, the browser first begins querying the site's origin server, and that's when the TLS handshake happens.
        - It also happens whenever other communication uses HTTPS (including API calls and DNS over HTTPS queries).
        - After opening a TCP connection via the TCP handshake, the TLS handshake takes place
    - What happens during the TLS handshake?
    	- The following takes place between client and server:
			- Specify the TLS version (TLS 1.0, 1.2, 1.3)
			- Decide which cipher suite to use
			- Verify the server's identity via the server's public key and the SSL certificate authority's digital signature
			- Generate a session key to use symmetric encryption after the handshake completes
	- What are the steps of the TLS handshake?
		- The specific steps vary depending on the key-exchange algorithm used
		- The most commonly used is the **RSA** key-exchange algorithm
			- **Client Hello:**
				- The client sends a hello message to the server to begin the handshake, including the TLS versions the client supports, the cipher suites it supports, and a client random number
			- **Server Hello:**
				- Replying to the client hello, the server returns a message containing:
				- An SSL certificate `where does this come from? how is it generated?`
				- The server's chosen cipher suite
				- A server random number
			- **Authentication**
				- The client verifies the server's SSL certificate with the certificate authority that issued it
				- This confirms the server is who it claims to be, and that the client is interacting with the actual owner of the domain
			- **premaster secret**
				- The client then sends another string of random bytes, the premaster secret
				- The premaster secret is encrypted with the public key (the client takes the public key from the SSL certificate to encrypt it)
				- It can only be decrypted with the server's secret key
			- **The secret key is used**
				- The server decrypts the premaster secret with its private key
			- **Generate the session key**
				- Both client and server use the client random, the server random, and the premaster secret to generate the session key
			- **Client ready**
				- The client sends a **finished** message
			- **Server ready**
				- The server sends a **finished** message
		- All TLS handshakes use asymmetric encryption (public and private keys), but not all TLS handshakes use the private key in the process of generating the session key. For example, an ephemeral **Diffie-Hellman** handshake has the following steps:
			- **Client Hello**
				- Contains the protocol version, client random, and a list of cipher suites
			- **Server Hello**
				- Contains the SSL certificate, the selected cipher suite, and the server random
			- **The server's digital signature**
				- The server encrypts the client random, the server random, and the DH parameters with its private key
				- The encrypted data serves as the server's digital signature
				- This confirms the server has the private key matching the public key in the SSL certificate
			- **Server and client compute the premaster secret**
				- Client and server each use the exchanged DH parameters to compute a matching premaster secret
				- Unlike the RSA handshake, where the client generates the premaster secret and sends it to the server
			- **Establish the session key**
				- Client and server compute the session key from the premaster secret, the client random, and the server random
			- **Client ready**
				- The client sends a **finished** message
			- **Server ready**
				- The server sends a **finished** message
- [What might cause a TLS handshake to fail?](https://segmentfault.com/a/1190000021778053)
    - Common error message: `SSL Handshake Failed error`
    - Common causes:
    	- Protocol mismatch `server-side error`
    	- Cipher suite mismatch `server-side error` → the server doesn't support the cipher suite the client requested
    	- Inaccurate system clock (but the process just now didn't use any time info :| )
    	- Misconfigured browser
    	- Certificate error `server-side error`
			- The domain name in the certificate doesn't match the domain name in the URL
			- The certificate expired
			- Or the certificate chain is broken
    		- Using a self-signed certificate
    	- The server is SNI-Enabled `server-side error`
    - **Protocol mismatch**
    	- Collect info on the client or server with `tcpdump -i any -s 0 host IP address -w File name`
    	- Analyze the collected packets with Wireshark
    	- Find the TLS version used in the **client hello**
    	- Look at the error info in the server's subsequent processing
    	- https://docs.apigee.com/api-platform/troubleshoot/runtime/ssl-handshake-failures
- What do you do if a site's certificate expires?
	- Renew the certificate
- Can you explain what SSL is?
	- Its full name is Secure Sockets Layer, used to ensure the sensitive data passed between two systems isn't tampered with or read
	- TLS is a more secure version of SSL
## Linux Admin
> This feels more about command usage or how to configure things
- How do you manage users and groups in Linux? And how would you do it in Windows?
	- View users with `cat /etc/passwd`
	- Add a user with `useradd`
	- Add a group with `groupadd`
	- Then use `gpasswd` to add or remove a user from the root (sudo) permission group
- Can you explain how the `curl` command works?
	- A command-line tool that can send data to a server
- How would you use the `curl` command for troubleshooting?
	- `$ curl protocol://IP/host:port`
	- Troubleshooting web servers
		- `curl http://example.com -I` uses the -I flag to return the header
	- Troubleshooting SMTP servers
		- `curl smtp://example.com` uses port 25 as the SMTP port by default
		- But some ISPs block the standard SMTP port to prevent spam
		- You can also use port 2525 or 587
	- Troubleshooting FTP
		-  `curl ftp://example.com` uses port 21 by default
- How do you use the `curl` command to connect through a proxy?
	- `curl --proxy yourproxy:port https://yoururl.com`
- How do you use `curl` to skip validating a self-signed SSL certificate?
	- `curl -k https://localhost/`
	- `curl --insecure https://localhost/`
- Various curl usages:
```=
$ curl [protocol://domain:port/]
$ curl -o <filename to save as> [protocol://domain:port/] download a specific file
$ curl -O [protocol://domain:port/file]  directly download the file in the URL
$ curl -C - -O [protocol://domain:port/file] resume downloading from where it was interrupted
$ curl -L [protocol://domain:port/] follow the URL's 301/302 redirect
$ curl --trace-ascii debugdump.txt [protocol://domain:port/] trace the whole curl process and save the result to debugdump.txt
```
- curl making HTTP requests
```=
-X/--request [GET|POST|PUT|DELETE|PATCH]  use the specified http method to make the http request
-H/--header                           set the headers carried in the request
-i/--include                          show the response headers in the output
-d/--data                             carry HTTP POST data
-v/--verbose                          output more info for easier debugging
-u/--user                             carry a username and password
-b/--cookie                           carry a cookie (either as an argument or a file path)
```
- POST data to an HTML form with curl
	- Suppose the form's HTML looks like this
	```
	<form method="POST" action="form.php">
    	<input type=text name="email">
    	<input type=submit name=press value=" OK ">
 	</form>
	```
	- `curl -X POST --data "email=test@example.com&press=%20OK%20" http://www.example.com/form.php`
- Upload a file with curl
	- Suppose the form's HTML is
	```
	<form method="POST" enctype='multipart/form-data' action="upload.php">
 		<input type=file name=upload>
 		<input type=submit name=press value="OK">
	</form>
	```
	- `curl -X POST -F 'file=@./upload.txt' http://www.example.com/upload.php`
- Common RESTful CRUD commands with curl:
	- GET a single or all resources
	```
	$ curl -X GET "http://www.example.com/api/resources"
	$ curl -X GET "http://www.example.com/api/resources/1"
	```
	- POST JSON data
	```
	$ curl -X POST -H "Content-Type: application/json" -d '{"status":false,"name":"Jack"}' "http://www.example.com/api/resources"
 	```
	- PUT JSON data
	```
	$ curl -X PUT -H "Content-Type: application/json" -d '{"status":false}' "http://www.example.com/api/resources"
	```
	- DELETE a resource
	```
	$ curl -X DELETE "http://www.example.com/api/resources/1"
	```
- **Carry a cookie with curl**
	- Pass the cookie in the command
	```
	$ curl --cookie "name=Jack" http://www.example.com
	```
	- Read the cookie from a file
	```
	$ curl --cookie stored_cookies_file_path http://www.example.com
	```
- **Specify a User Agent with curl**
	```
	$ curl --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" 		http://www.example.com
	```
	- **Basic Authentication:** if the page uses basic authentication, you can carry `--user username:password` to pass it
	```
	$ curl -i --user secret:vary_secret http://www.example.com/api/resources
	```
- Use a proxy to connect with the curl command
```
$ curl --proxy yourproxy:port https://youurl.com
```
- Limit the download speed with curl
```
$ curl --limit-rate 2000B [URL]
```
- **Inject a specific Content-Type into the request to handle a particular issue**
```
$ curl --header 'Content-Type: application/json' http://yoururl.com
```
- Show only the headers in the response
```
$ curl --head http://yoururl.com
```
- **Connect to an HTTPS/SSL URL and ignore any SSL certificate errors**
	- When trying to access a secure URL with an SSL/TLS certificate, if there's a certificate error or a CN mismatch, you'll get the following error
	`curl: (51) Unable to communicate securely with peer: requested domain name does not match the server's certificate.`
```
$ curl --insecure https://yoururl.com
```
- Connect using a specific protocol (SSL/TLS)
```
$ curl --sslv3 https://yoururl.com
$ curl --tlsv1 https://example.com
$ curl --tlsv1.0 https://example.com
$ curl --tlsv1.1 https://example.com
$ curl --tlsv1.2 https://example.com
$ curl --tlsv1.3 https://example.com
```
- Download a file from an FTP server
```
$ curl -u user:password -O ftp://ftpurl/style.css
```
- Can you explain how to use the MTR command?
	- [**MTR**](https://blog.gtwang.org/linux/mtr-linux-network-diagnostic-tool/)
		- How it works: MTR first uses traceroute against the specified host to find each network node along the way (gateways, routers, bridges, etc.), then uses ping to check the connection status of each node, updating the output report in real time so the administrator can see everything at a glance.
		```=
		mtr www.google.com.tw   
		mtr -n www.google.com.tw // show everything by IP address
		mtr -b www.google.com.tw // show both IP address and domain name
		mtr -c 5 www.google.com.tw // specify the ping limit (ICMP ECHO limit)
		mtr -c 5 -r www.google.com.tw > output.txt // output the report
		
		```
		![](https://i.imgur.com/BSFP2pP.png)
		- L (Loss): packet loss rate
		- S (Snt, Sent Packet): number of packets sent
		- Avg (Average RTT):
		- Best (Best RTT):
		- Worst (Worst RTT):
	 - So what can you discover with this tool?????
- Can you explain how to use the `iperf` command?
	- `iperf3` is a network bandwidth testing tool that can test a client's upload speed
	- It uses TCP to measure bandwidth, determine link quality and latency, plus jitter and packet loss
	- To test bandwidth, you need to run an iperf3 process on both the server and the client so they can send data to each other for the test
	```
	# server side   
	iperf3 -s   // open a listening socket, default port 5201, start a server thread
	```
	```
	# client side
	iperf3 -c SERVER_IP/HOSTNAME
	```
	- iperf3 also supports use on Android and iOS (there's an app)
	- Specify the test duration
	```
	iperf3 -c SERVER_IP -t 20 -i 4 // test for 20 seconds, output data every 4 seconds
	```
	- Save the test results
	```
	iperf3 -c SERVER_IP --logfile output.txt
	```
	- Specify a port
	```
	# server side
	iperf3 -s -p 12345
	
	# client side
	iperf3 -c SERVER_IP -p 12345
	```
	- Multiple connections
	```
	# test with two connections at once
	iperf3 -c SERVER_IP -P 2
	```
	- To test UDP performance, use the `-u` flag
	```
	iperf3 -c SERVER_IP -u
	```
	- Reverse transfer: test download speed (server sends, client receives)
		- Default data flow: client $\rightarrow$ server
	```
	iperf3 -c SERVER_IP -R
	```
	- IPv4, IPv6
	```
	iperf3 -c SERVER_IP -f
	iperf3 -c SERVER_IP -6
	```
	- Send a custom file
	```
	iperf3 -c SERVER_ip -F YOUR_FILE
	```
- Can you explain how to use the `tracert` command? In what situations would you use it?
  It's mainly used for real-time network troubleshooting, to find the routing path a packet takes as it travels through the network to its destination address.
  It achieves traceroute mainly by sending ICMP packets and setting the TTL field in the IP header.
  Each time it sends three 40-byte packets, including the source address, destination address, and the timestamp the packet was sent, to the destination. The first is a probe, then it uses UDP; since we don't want the destination host to process them, the destination port is set to an unlikely value.
```
$ tracert -d -h maximum_hops -j host_list -w timeout target_host
-w specifies the number of milliseconds to wait for a timeout
```
- What does an asterisk in the `tracert` output mean?
	- If tracert shows an asterisk (\*), it means that node may have some defensive measure causing our packets to be dropped
		- Possibly iptables set to Drop, or similar
- Can you explain how the `tracert` command works?
	- Property 1: it achieves its function mainly through the TTL (Time To Live) value; every time a packet passes a node, the router decrements the TTL by 1
	- Property 2: the caller sends a packet with TTL=1; the first router decrements the TTL by 1 to get 0 and stops forwarding the packet
	- It then returns an ICMP Time Exceeded response, and the computer extracts the address of the first gateway the packet passed through from that response
	- Next it sends an ICMP packet with TTL=2 to get the second gateway's address
	- So by incrementing the TTL value step by step, it obtains all the gateway addresses along the way
- If the `tracert` response isn't an ICMP Time Exceeded, what does that mean?
	- Most firewalls, or routers with firewall features enabled, won't return various ICMP packets by default
	- Other routers or switches can be set by the admin not to return ICMP responses
	- **So the traceroute program can't necessarily get all the gateway addresses along the way**
		- When a packet with a certain TTL gets no reply, this doesn't stop the trace; the program still increments the TTL and sends the next packet, up to the preset **trace limit (maximum_hops)** specified by a parameter
- If it can't get an ICMP response, how does it know the packet arrived?
	- When traceroute sends UDP datagrams to the destination, it chooses a port number that a normal application wouldn't use (**above 30000**)
	- So when the UDP datagram reaches the destination, that host sends back an "**ICMP port unreachable**" message, and when traceroute receives it, it knows the destination has been reached.
- Why does traceroute use ports above 30000?
	- It's related to the UDP convention that port numbers must be below 30000
	- With UDP, the host might simply drop the packet because it doesn't offer a UDP service, and not return any info
	- So using a port above 30000, the most the destination host can do is return a **port unreachable** response
- [What is an FQDN (fully qualified domain name)?](https://haway.30cm.gg/dns-1-basic/)
	- In /etc/resolv.conf, any hostname that doesn't end with "." has a domain name automatically appended by the system
	- The **search** entry in the file tells the system what domain names it can append
	```
	domain rsync.tw
	nameserver 168.95.1.1 (cache server)
	nameserver 8.8.8.8  (cache server)
	search hdns.com.tw example.com
	```
	- In the example above, just type blog and the system automatically turns it into blog.rsync.tw and sends it to 168.95.1.1 for DNS resolution. If that fails it tries blog.hdns.com.tw instead, and so on
	- If the DNS service at 168.95.1.1 can't be reached, the system automatically falls to the second entry, the 8.8.8.8 server
- How do you set up a DNS cache server?
	- Change the nameserver in /etc/resolv.conf
- **What's the difference between an authoritative DNS server and a DNS cache server?**
	- DNS Authoritative Server: takes DNS records from its own database and responds to requests
	- A cache server asks other hosts for DNS data
- What is an NS (nameserver) record in DNS?
	![](https://i.imgur.com/YMAcJ1x.png)
	-  The root server records the location of each subdomain's authoritative host via NS records
	-  NS records have two uses: downward delegation, and parallel delegation
	-  Downward delegation: create a subdomain (e.g. create a .tw subdomain with the server) and delegate it to TWNIC's hosts
	-  Parallel delegation: all nameservers for the same domain name must have identical NS records
	![](https://i.imgur.com/9mo0lwG.png)
	- Above, ntpu.edu.tw has been delegated to six nameservers, and the ntpu.edu.tw NS records on all six must be exactly the same
- How do you find out which hosts your DNS is currently officially delegated to?
	- The nameservers you filled in when you bought the domain; the registrar, based on the registered domain name
	- sends your nameservers to the registry, and once the registry confirms, it puts your host data into their records
	- which produces a set of NS data
	```
	$ dig [domain] ns
	```
	- Use the command above to confirm whether the current nameserver data matches what you filled in at registration
- What is an SOA record?
	- An SOA record is the **system administration record for a domain name**
	- If you use managed DNS you don't need to handle it (CloudFlare, Gandi LiveDNS)
	- A self-hosted DNS server needs it configured
	- It mainly represents the domain's administrator, the admin host, the zone file serial number, and the global TTL data
- What are A/AAAA records?
	- When you need to map a domain name to a server's IP address, you use an A record
	- An A record points to an IPv4 address
	- An AAAA record points to an IPv6 address
	```
	$ dig +short blog.rsync.tw a
	$ dig +short blog.rsync.tw aaaa
	```
- What is an MX record?
	- The mail server record for the domain
	- If someone emails you, the mail host first checks whether the domain has an MX record
	- If it does, it connects to that mail host; if no MX record is specifically configured
	- the sending host tries to resolve the domain's A record
	- and if there's an A record, it tries to connect to that host's mail server.
	![](https://i.imgur.com/eQNw7LE.png)
	- When the domain has an MX record, the mail host tries to connect to mg.ntust.edu.tw
	- You can set mail server priority in MX records; the smaller the number, the higher the priority
	- So mail to ntust.edu.tw is delivered first to mg.ntust.edu.tw
	- If there's no MX record, it's delivered to the domain name's A record, i.e. 140.118.31.99
	![](https://i.imgur.com/rO5idoQ.png)
- What is a CNAME record?
	- **A kind of alias for a hostname**, used when your destination address is a hostname rather than an IP address
	- In that case you need to use a CNAME to map it
	- Limitation: if a CNAME record is set under a given record, you can't set other records
		- Why?
	- E.g. **if you set a CNAME for a domain, you can't set A, MX, TXT, etc. records for it**
- If someone sets a CNAME for a domain name: say I register HelloWorld.tw and want to point web visitors to the same site as blog.HelloWorld.tw, so I set
	```
	HelloWorld.tw  CNAME  blog.HelloWorld.tw
	```
	- But HelloWorld.tw must carry SOA and NS records, which conflict with the CNAME and cause the domain to operate unstably. So to achieve the same effect, you can use a web redirect
- Can you explain how to use the `dig` command? In what situations would you use it?
	- It's a DNS debugging tool that can simulate ordinary computer queries, recursive queries, non-recursive queries, DNS cache server queries, DNSSEC queries, TCP queries, and so on.
	- The sections of a `dig` response
		![](https://i.imgur.com/kHAra1e.png)
		- Header
		![](https://i.imgur.com/nr5u3aS.png)
			- ID: a plain number, the identifier for the DNS query
			- QR: 0 query, 1 response
			- Opcode: 0 QUERY, 1 IQUERY, 2 STATUS
			- AA: authoritative server response
			- TC: truncated
			- RD: whether the client requested a recursive query
			- RA: whether the server's response supports recursive queries
			- Z: reserved
			- RCODE: 0 no error, 1-5 error codes
			- QDCOUNT: number of entries in the Question section
			- ANCOUNT: number of entries in the Answer section
			- NSCOUNT: number of entries in the Authority section
			- ARCOUNT: number of entries in the Additional section
		- Question
		- Answer
		- Authority
		- Additional
	- `dig` options
		- `@server` specify the server: **which server to send the DNS query to; if unspecified, use the system default**
		- `+short` brief output, showing only the ANSWER section, or blank if there's no response
		- `-4` use only an IPv4 address to connect to the server
		- `-6` use only an IPv6 address to connect to the server
		- `+tcp` connect to the DNS server over TCP
			- **DNS natively uses UDP/53**, and if someone forgot to open the firewall on the host or router
			- you can use `+tcp` to switch the DNS query to a TCP connection
			- if the normal query gets no response but `+tcp` goes through, it means the firewall isn't open
		- `cdflag` used to turn off DNSSEC in the query
			- DNSSEC is an extended security protocol for DNS that ensures DNS records can't be forged (via digital signatures)
			- If DNSSEC is managed poorly it causes DNSSEC validation to fail
			- leading to unstable DNS resolution
			- In that case you can turn it off with this flag
			- if the normal query gets no response but adding +cdflag gives a correct response, it means DNSSEC is broken
	- Command examples
	```
	# query a cache server's A record
	$ dig @8.8.8.8 blog.rsync.tw. a
	# query the domain's MX
	$ dig rsync.tw mx
	# query the domain's owner
	$ dig rsync.tw soa
	# trace mode
	$ dig +trace blog.rsync.tw a
	# tcp query mode
	$ dig +tcp blog.rsync.tw a
	# reverse IP lookup  = nslookup <IP>
	$ dig -x 8.8.8.8 ptr
	# turn off DNSSEC in the query
	$ dig +cdflag @8.8.8.8 blog.rsync.tw a
	```
- DNS Troubleshooting
	- Step 1: query the NS address
		- Before you start debugging with dig, first confirm the domain's nameserver address, because every response must come from a nameserver. If you use a domain registry or a service like Cloudflare, the nameservers belong to those providers; they can also be whatever you filled into the nameserver field at registration
		```
		$ dig +short rsync.tw ns
		```
		- You can see which nameservers there are (which servers are responsible for the DNS records)
		- Or work from the top down, from a higher-level DNS server
		```
		$ dig +short tw ns
		```
		![](https://i.imgur.com/4t141yp.png)
		```
		$ dig +short @a.dns.tw edu.tw ns
		```
		![](https://i.imgur.com/EZmwnTT.png)
		```
		$ dig +short  @moestar.edu.tw [target domain name] ns
		```
		- Why not just dig +short ntust.edu.tw?
			![](https://i.imgur.com/6miPWp1.png)
			- Because that would query the DNS NS record via the system's cache server
	- Possible situations:
		-  Empty, no response
			- If you get an error when querying NS, or you get a response but no data
			- Possible situation 1: the nameserver was filled in wrong; ask the domain registry to check
			- Possible situation 2: the domain expired and wasn't paid for, or something is wrong with its status (check with the `whois` command)
		-  The nameserver is a public DNS
			-  Some people mistake a public DNS for a nameserver and fill 8.8.8.8 into the nameserver field, but that's wrong
		-  Different from what you filled in
			-  The domain registry didn't update your name to the domain authority, or you just happened to change nameservers
	- Step 2: query the nameserver's data directly
		- After confirming the NS address, send a query to the nameserver
		- Query the domain you want to resolve. The nameserver's response should be the newest and most complete, so whether you want to know if a record has been updated or whether the resolution is correct, you get your answers by querying the nameserver directly.
		![](https://i.imgur.com/MHvHAb6.png)
	- Possible problems (2):
		- Nameservers out of sync
			- Make sure every nameserver's response data is correct
		- Nameserver not responding
			- Means there's a problem with the nameserver's DNS service
			- The DNS service may not be running, or the machine has a problem
			- You can ping the nameserver; if it responds, it's a DNS service problem
			- Then you can use `dig +tcp` to check whether it's a firewall problem
			- If it responds, work toward solving the firewall problem
			```
			# query the nameserver's response; you can query SOA because that record must exist
			$ dig @(NS IP) (domain) soa
			# if there's no response, ping to see whether it's a host or network problem
			$ ping (NS IP)
			# if ping responds, use +tcp to check whether it's a firewall problem
			$ dig +tcp @(NS IP) (domain) soa
			```
	- Step 3: check the authoritative server's answer
		- Nameservers are usually delegated from the top down
			- e.g. rsync.tw's nameserver is delegated from .tw down to the ns[1-3].gandi.net nameservers
		- Delegation isn't necessarily correct (the user fills it in themselves and may fill it in wrong); the upper level directly becomes the nameserver based on the user's input
		- Correct delegation:
			- 1. Correct top-down delegation
			- 2. The server gives an authoritative-server answer
		```
		$ dig @ns1.gandi.net rsync
		
		# response
		; <<>> DiG 9.10.3-P4-Ubuntu <<>> @ns1.gandi.net rsync.tw a
		; (2 servers found)
		;; global options: +cmd
		;; Got answer:
		;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 45858
		;; flags: qr aa rd; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1
		;; WARNING: recursion requested but not available
		...omit...
		```
		- Without the +short flag, you can see the header section, and you can look at the **AA flag** in it
		- In the response there's "flags: qr aa rd;", and aa = AA means an authoritative-server answer
		- It means this server knows it manages this domain, so it responds from its zone-file data
		- A query to a public DNS won't have this AA flag
		- And if a query to a nameserver has no AA, it means the admin didn't configure the server correctly
	- Step 4: query the cache server (public DNS)
		- The last step is to query the cache server's response and see whether it's correct. Normally all user computers get DNS data through a cache server (such as 8.8.8.8, 168.95.1.1), so we test whether it's correct:
		```
		$ dig @8.8.8.8 www.rsync.tw a
		```
	- Possible problems (4)
		- Getting stale data
			- DNS has a TTL caching time
			- Within the caching time, data is kept until the TTL (seconds) elapses
			- Here you need to confirm whether every authoritative server's query returns the newest data
		- Resolution fails with NXDOMAIN
			- If everything in the query process above is fine, but these public DNS cache servers don't respond
			- DNSSEC may be broken
			- In that case you need to ask your domain's registrar to cancel your DNSKEY
- [What happens when DNSSEC breaks? How do you fix it?](https://haway.30cm.gg/dnssec-broken/)
	- Symptoms:
		- Possibly only the authoritative DNS server delegated to your domain can look up your A record
		- But if you query your domain's A record from a public DNS server (e.g. 8.8.8.8) it may return an error
	- Check:
		- You can add the `+cdflag` option to make the DNS cache server turn off DNSSEC validation
		- `cdflag` tells 8.8.8.8 that this DNS query doesn't need DNSSEC validation
	- Possible cause:
		- If you used a domain managed-DNS service and enabled DNSSEC
		- but then changed the nameserver, this causes the DNSSEC chain validation to fail
		- because the DNSKEY wasn't migrated (the new nameserver doesn't have the DNSKEY), which causes validation to fail
	- Fixes:
		-  Either use the interface the domain registrar provides and turn off DNSSEC
		-  Or re-sign DNSSEC on the new nameserver, then update the DNSKEY
- How do you enable DNSSEC in Linux?
	- You can edit the DNSSEC setting value in /etc/systemd/resolv.conf
- What do you do if the nameserver set in /etc/resolv.conf keeps getting reset?
	- Point it with a symbolic link to /etc/systemd/resolv.conf
	```
	$ cd /etc
	$ rm resolv.conf
	$ ln -s /run/systemd/resolve/resolv.conf resolv.conf
	```
	- Or directly edit the DNS address in /etc/systemd/resolv.conf
- How would you handle an OOM problem with a Linux process?
- What is the **OOM Killer**?
	- In Linux, it's responsible for watching processes that use too much memory, especially ones that consume a lot of memory very quickly
	- To prevent memory from being exhausted, the kernel kills that process
	- Sometimes you can't SSH to a machine but can ping it, meaning it's not a network failure; often the reason is that the sshd process was killed by the OOM killer
	- The kernel uses a specific algorithm to compute a score for each process to decide which one to kill
	- Each process's OOM score can be found in "**/proc/PID/oom_score**"
	- After rebooting the machine, checking the system log "**/var/log/messages**" you'll find an error like "Out of Memory: Kill process 1865 (sshd)"
	- `echo -17 /proc/PID/oom_adj` resolves this issue
	    - Adjustable range: 15 to -16
	    - -17 disables it
	- Or change kernel parameters:
	```
	sysctl -w vm.panic_on_oom=1 (default is 0)
	sysctl -p
	```
- What's the difference between `kill -9` and `kill -15`? What signal does each send?
	```
	$ kill PID
	# signal: SIGKILL
	$ kill -9 PID // immediately force the program to stop
	# signal: SIGTERM
	$ kill -15 PID // notify the program to stop normally, the default signal
	$ kill -l lists all available signals
	
	```
	![](https://i.imgur.com/1INBiak.png)
- How do you find which signal corresponds to which number in the kill command?
	- `$ kill -l <number>`
- Can you explain when to use the `ss` command?
	- It can output all established TCP connections
	- The ss command lets you specify your own filter to filter out the socket info you need:
	```
	# list all connections from this machine to host 192.168.0.1:
	$ ss -o state established dst 192.168.0.1
	# list all connections from this machine to port 80 on host 192.168.0.1
	$ ss -o state established dst 192.168.0.1:80
	# list all connections from host 192.168.0.2:
	$ ss -o state established src 192.168.0.2
	# list all ssh connections, including outbound ssh from this machine and inbound ssh from outside:
	$ ss -o state established '( dport = :ssh or sport = :ssh )'
	```
- How do you list services in Linux?
	- Look in /etc/init.d
	- Or `systemctl list-units --type service -all`
	- `sudo systemctl | grep running`
	- `service --status-all`
- How do you view established sockets?
	- `systemctl list-sockets`
	- `netstat`
	- `ss`
## App testing
https://www.mas.org.tw/spaw2/uploads/files/20190916/AppV3.1.pdf

## Windows Admin
- Security settings
	- To configure settings using the Local Security Policy console:
		- win+R
		- `secpol.msc`
		- Under the console settings, do one of the following:
			- Click \[Account Policies] to edit **Password Policy** or **Account Lockout Policy**
			- Click \[Local Policies] to edit **Audit Policy**, **User Rights Assignment**, or **Security Options**
	-  To configure security policy settings using the Local Group Policy Editor console
		- win+R
		- `gpedit.msc`
		- In the console tree, click \[Computer Configuration > Windows Settings], then click \[Security Settings].
		- Do one of the following:
			- Click \[Account Policies] to edit Password Policy or Account Lockout Policy.
			- Click \[Local Policies] to edit Audit Policy, User Rights Assignment, or Security Options.


## Web testing
- Have you done web unit testing?
	I mainly set up a small Flask web server
	then built a small test service of my own
	*test_api.py*
	```=
	import flask
	import json
	from flask import request

	server = flask.Flask(__name__)
	@server.route('/login', methods=['get', 'post'])
	def login():
		username = request.values.get('name')
		pwd = request.values.get('pwd')
		if username and pwd:
			if username == 'xiaoming' and pwd == '111':
				resu = {'code': 200, 'message': 'Login Success'}
				return json.dumps(resu, ensure_ascii=False) 
			else:
				resu = {'code': -1, 'message': 'Login Failed'}
				return json.dumps(resu, ensure_ascii=False)
		else:
			resu = {'code': 10001, 'message': 'Parameter cannot be empty'}
			return json.dumps(resu, ensure_ascii=False)

	if __name__ == '__main__':
		server.run(debug=True, port=8888, host='127.0.0.1')
	```
	![](https://i.imgur.com/3UFNrTT.png)
	*config.ini*
	```=
	# -*- coding: utf-8 -*-
	[HTTP]
	scheme = http
	baseurl = 127.0.0.1
	port = 8888
	timeout = 10.0


	[EMAIL]
	on_off = on;
	subject = Auto testing Report
	app = Outlook
	addressee = M10909302@gmail.com
	```
	*getpathInfo.py*
	```=
	import os
	def get_Path():
		path = os.path.split(os.path.realpath(__file__))[0]
		return path

	if __name__ == '__main__':
		print('Testing whether the path is OK, the path is: ', get_Path())
	```
	Output
	![](https://i.imgur.com/SOJEwRf.png)
	
	*readConfig.py*
	```=
	import os
	import configparser
	import getpathInfo 

	path = getpathInfo.get_Path()
	config_path = os.path.join(path, 'config.ini')
	config = configparser.ConfigParser()
	config.read(config_path, encoding='utf-8')

	class ReadConfig():

		def get_http(self, name):
			value = config.get('HTTP', name)
			return value
		def get_email(self, name):
			value = config.get('EMAIL', name)
			return value

	if __name__ == '__main__':
		print('The Baseurl Value in HTTP is：', ReadConfig().get_http('baseurl'))
		print('The on_off value in EMAIL is: ', ReadConfig().get_email('on_off'
	```
	![](https://i.imgur.com/KyVjXZL.png)
	> https://itpcb.com/a/1297735
## RESTful API
- What's your understanding of RESTful web services?
	- A RESTful web service is a web service architecture that follows the REST style
	- REST (Representational State Transfer), implemented using HTTP
- What is a REST resource?
	- Everything under the REST architecture counts as a kind of resource, somewhat like an object in OOP
	- A resource can be a text file, an HTML page, an image, or other dynamic resources
	- A REST server provides access to these resources and lets clients use them
	- Each resource is identified by a URI
- What is a URI?
	- A Uniform Resource Identifier, used to identify a resource in the REST architecture
	- `<protocol>://<service-name>/<ResourceType>/<ResourceID>`
	- Two kinds of URI: `URN`, `URL`
	- **URN**: Uniform Resource Name
		- Identifies a resource by a unique, persistent name
	- **URL**: Uniform Resource Locator
		- Carries information about the resource's location
- What's your understanding of JAX-RS?
	- JAX-RS = Java API for RESTful Web Services
- Can you name some common HTTP status codes you know?
	- 1xx - informational response (what's this?)
	- 2xx - success response
	- 3xx - redirection
	- 4xx - client error
	- 5xx - server error
	- 200 OK
	- 201 - CREATED, used with PUT or POST
	- 304 - NOT MODIFIED, used for conditional GET requests to reduce bandwidth use; this response's body should be empty
	- 400 - BAD REQUEST, validation error or missing data
	- 401 - UNAUTHORIZED, the request doesn't contain valid authentication info
	- 403 - FORBIDDEN, no permission to access the resource, or access is forbidden
	- 404 - NOT FOUND, the resource method is unavailable
	- 500 - INTERNAL SERVER ERROR, some exception thrown while the server was running
	- 502 - BAD GATEWAY, the server couldn't get a response from another server
- Can you name some common HTTP methods you know?
	![](https://i.imgur.com/PBaFMYj.png)
	- GET: retrieve information from the server, a read-only operation
	- POST: used to create a resource on the server
	- PUT: used to update or replace an existing resource on the server
	- DELETE: used to delete a resource on the server
	- OPTIONS: get the list of supported options for an existing resource on the server
	- HEAD: same as GET, but sends only the status line and the header section
- What's the difference between SOAP and REST?

|SOAP|REST|
|----|----|
|Simple Object Access Protocol|Representational State Transfer|
|A protocol for implementing web services|An architectural design style for the web|
|SOAP can't use REST|REST can use SOAP as part of its implementation|
|Has strict standards|No strict compliance required|
|Client and server are more tightly coupled|REST clients are flexible and don't depend on how the server is developed|
|Supports only XML|Supports XML, JSON, MIME, text, etc.|
|SOAP exposes resources through service interfaces|Uses URIs to expose resources|
|As a protocol, it defines its own security measures|Inherits security measures only from the protocol it's implemented over|
- What are the best practices for developing RESTful web services?
	- Develop the REST API using the JSON data format as much as possible for receiving and returning data, because most clients and servers have built-in ways to easily read and parse JSON objects
		- An application responding in JSON should set Content-Type to application/json
		- Some HTTP clients look at the value of the response's Content-Type header to parse it
		- The request header's Content-Type should also be set to application/json
	- **When naming resource endpoints, use plural nouns rather than verbs; API endpoints should be short and easy to understand**
		- Verbs aren't used because the HTTP method already describes the request's action
		- Common HTTP verbs/methods: GET, POST, PUT, DELETE
	- Use nesting to represent the hierarchy of resources
		- e.g. GET for URI: /authors/:id/address
		- Don't nest too deeply
	- Error handling should return the application's appropriate error code; REST also defines appropriate HTTP status codes that can be sent along for different scenarios
		- Error codes should come with appropriate error messages to help developers take corrective action, but not too detailed, to keep attackers from learning too much
		- 400 - Bad Request
		- 401 - Unauthorized
		- 403 - Forbidden
		- 404 - Not Found
		- 500 - Internal Server Error
		- 502 - Bad Gateway
		- 503 - Service Unavailable
- What distributed system architectures do you know?
	- I know of a technology used to maintain and run distributed systems, namely Kubernetes
- [So what is a Software Stack?](https://searchapparchitecture.techtarget.com/definition/software-stack)
	![](https://i.imgur.com/NOpfrAK.png)
	- It's a collection of independent components that work together to run an application
	- These components may include: OS, protocols, runtime environment, libraries, DB, and function calls
	- Depending on the application you need to run, at minimum it's the OS, DB, programming support tools, and the application
- And what is a Solution Stack?
	- To develop a web application, you need to define the target OS, web server, DB, and language
	- Or define the OS, middleware, DB, and application, and sometimes hardware is included too
	- Examples:
		- BCHS
			- OpenBSD
			- C
			- httpd
			- SQLite
		- ELK
			- Elasticsearch
			- Logstash
			- Kibana
		- Ganeti
			- Xen or KVM
			- Linux with LVM
			- DRBD
			- Ganeti
			- Ganeti Web Manager
		- LAMP
			- Linux
			- Apache
			- MySQL/MariaDB
			- Perl, PHP, Python
		- LAPP
			- Linux
			- Apache
			- PostgreSQL
			- Perl, PHP, Python
		- LLMP
			- Linux
			- Lighttpd
			- MySQL/MariaDB
			- Perl, PHP, Python
		- MEAN
			- MongoDB
			- Express.js
			- Angular.js
			- Node.js
		- MERN
			- MongoDB
			- Express.js
			- React.js
			- Node.js
		- MEVN
			- MongoDB
			- Express.js
			- Vue.js
			- Node.js
## [Apache Troubleshooting](https://www.acunetix.com/websitesecurity/troubleshooting-tips-for-apache/)
### httpd.conf misconfiguration
- Syntax Error
	- On Linux, use `apachectl -configtest` to detect syntax errors
	- On Windows, go to Apache's bin directory first, then run `httpd.exe -t`
	- After fixing the problem, restart Apache and recheck with the command above
### Vulnerabilities
- Use the latest version of Apache
- Use a vulnerability scanner to check
- Keep an eye on the latest CVEs and apply patches
### Apache HTTP Server Logs
You should analyze the **error logs** in Apache HTTP Server. **They provide detailed information about any errors occurring on the web server.** Paths: `/var/log/apache2/error.log`, `/etc/apache2/apache2.conf`, `/etc/httpd/conf/httpd.conf`

By default they go into the **error_log** file in the log directory within the Apache install directory.
You can also set in httpd.conf which types of errors to log; httpd.conf has 8 log levels of information.
Besides the error log, there's also an access log that records all requests the server has processed.
These logs can also offer additional explanation of what might be causing a problem, and can supplement the information in the error log.

### Using the Mod_log_forensic module
The `mod_log_forensic` module is used to provide a **forensic log** of client requests.
This includes the request before and after processing, and uses the same ID to reference the same request, so you can easily identify any problem triggered by a specific request.
**It can be used to analyze which requests cause the web server to crash.**
To enable this module, configure the following in the `Apache httpd.conf` file:
```=
LoadModule log_forensic_module_forensic.so
LoadModule uniques_id_module modules/mod_unique_id.so
ForensicLog logs/forensic_log
```
You can also use the **check_forensic** bash script together with the mod_log_forensic module to list any incomplete requests found in the forensic log
`check_forensic <log_file>`

### Using the mod_whatkilledus module
When things go really wrong and the Apache server crashes, the `mod_whatkilledus` module can be used to log detailed technical information about the crash, along with the original client request that caused it.

Also, if the `mod_backtrace` module is enabled, this will include a backtrace showing the point of failure, which is useful for annotating the error log with a backtrace once certain conditions are met

On Unix systems, these modules only work if the `--enable-exception-hook` flag was enabled in the httpd build. On Windows there's no special requirement
- Documentation for `mod_whatkilledus` and `mod_backtrace`: https://emptyhammock.com/projects/httpd/diag/quick-start.html
### Using third-party modules
Using third-party modules can cause problems when installing Apache HTTP Server
So you should disable third-party modules and check whether the problem can be reproduced; if disabling the modules resolves it, re-enable each module one by one to identify which one is the cause

### Running Apache HTTP Server as a single process and using a debugging tool
A typical Apache HTTP Server install runs multiple processes
But for troubleshooting it's best to run as a single process
You can use the X option when starting Apache
`$ httpd -X` makes Apache start in single-process mode, meaning Apache won't fork new children or detach from the terminal
This way all traffic and communication go through a single process, so you can run apache httpd under a debugger (e.g. gdb), get the backtrace from the crash, and force the server to dump a core
```
$ gdb httpd
```
Then with gdb you first set breakpoints, then single-step through to see line by line where the error might be
### Script execution problems
Dynamic content is usually served by scripts that Apache HTTP Server runs via the `mod_cgi` module
This module has its own logging mechanism to record any errors that occur during script execution

Once the **ScriptLog** directive is enabled, mod_cgi logs the output of any script that doesn't run as expected, including
the server response code, the request received, and any response made to the client

To enable this, edit the httpd.conf file and specify the ScriptLog directive and the location to save the log
`ScriptLog logs/cgi_log`



## [IIS Troubleshooting](https://docs.microsoft.com/en-us/previous-versions/iis/6.0-sdk/ms524996(v=vs.90))


## Server-side security
- What security recommendations are there for the server side?
	- Remove unnecessary services
		- A default install sometimes installs many unnecessary features, e.g. remote registry, print server, etc.
		- The more services, the more open ports, so more risk is exposed
		- Turn off non-essential services on the server
	- Ensure protection for remote access
		- If a web admin needs to log in to the web server remotely, use tunneling and encryption protocols to ensure the remote connection is properly protected
		- Use a security token on the device or software
		- Remote access should be limited to a specific number of IPs and accounts
	- Separate development/test/production environments
		- Because it's easier and faster for developers to develop newer versions of a web app on the production server, it's common for web app development and testing to be done directly on the production server itself.
		- You might find an updated version of a specific site on the web, or find content under /test/, /new/, or other similar subdirectories that shouldn't be known to the public
		- So if you develop, test, and run production on the same server, and permissions aren't set well and security is easily overlooked in early development, the site is easy to break into
	- Web app content and server script security
		- Web app or site files should sit on a separate partition or drive from the OS system files and log files
		- because if an attacker gains access to the web directory, they might use other vulnerabilities to escalate privileges and access data across the whole disk
	- Ensure proper permissions and privileges
		- Always assign the least privilege needed to run a particular network service
	- Install all patches on time
	- Monitor or audit the server
		- You should regularly monitor and review all network service logs, website access logs, DB server logs (e.g. Microsoft SQL Server, MySQL, Oracle), and OS logs
		- If you find strange activity in the logs, resolve it immediately
	- User account management
		- Disable unused default accounts
		    - the `userdel` command
		- Set the correct permissions for each account
	- Remove unused modules and applications
		- Apache installs many predefined modules by default
		- A typical web server won't use these modules, so you need to turn them off to prevent attacks targeting such modules
	- Use the security tools provided by the network server software
		- Microsoft publishes many tools to help admins secure their IIS web server install
		- Apache also provides the **mod_security** module
	- Use an external scanner
		- nessus
		- nikto
		- or other vulnerability scanners
## Log files
System error information - `/var/logs/syslog` or `/var/logs/messages`
Logs related to login credentials - `/var/logs/secure` or `/var/logs/auth.log` (Debian)
Which service's logs go where? - `/etc/rsyslog.conf`, placed under `/etc/rsyslog.d`
### Syslog levels
![](https://i.imgur.com/GxaNR3I.png)

### Syscall

## C/C++
- What happens if a program uses malloc but doesn't free?
	- The heap memory stays occupied until the program ends; it isn't released automatically
