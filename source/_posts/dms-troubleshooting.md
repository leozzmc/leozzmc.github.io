---
title: "\U0001F4D1 DMS_Troubleshooting 筆記"
description: 2021年在面試AWS時做的筆記，主要是整理各種Troubleshooting知識以及原理
toc: true
tags:
  - Linux
  - Network
  - Web
categories:
  - 學習筆記
  - Troubleshooting
top_img: 'https://i.imgur.com/b3n6aNl.jpg'
aside: true
abbrlink: 5728fae1
date: 2021-11-13 10:12:17
---

## Network Debug
- 若你SSH不到Server，你會怎麼做?
	- 先Ping Server看通不通
	- 若還是錯誤則是根據SSH連線出現的錯誤訊息來做故障排除
	- **Unable to open connection to example.com Host does not exist**
		- 檢查是否可透過 `ping` 來去解析目標server域名
		- 若使用hostname則改用ip試試看(交替試試看)
	- **Connection timed out**: client試圖與SSH Server建立network socket，但server在時間內沒能回應
		- 檢查是否正在使用Port 22，或自定義的port口來進行連接
			- `$ netstat -all`
		- 檢查firewall規則是否有阻擋來自特定ip或port 22的進入流量
			- `$ iptables --list`
			- 看是不是有設定**Drop** method
			- 或是port 22 沒有被加進allow connection內
	- **Connection Refused**: 請求正在路由到host，但host沒能接收到請求
		- 檢查是否正在使用Port 22，或自定義的port口來進行連接
		- 檢查firewall規則是否有阻擋來自特定ip或port 22的進入流量
			- 看是不是有設定**Drop** method
			- 或是port 22 沒有被加進allow connection內
			- 檢查服務當前是否正在運行並綁定到預期port上
	- 如何檢查防火牆?
		- `iptable -nL`
		- `ufw status`
	- 檢查SSH狀態
		- 舊版本的OS可以使用 `service`
			- `service ssh status`
			- 若結果有正確顯示process id則代表正確運行
			- 若沒有運行則會顯示，ssh stop/waiting 之類的訊息
			- 可透過 `service ssh start` 開啟服務
		- 新版本的OS可以使用 `systemctl`
			- `systemctl status sshd`
			- 若正確運行，則會顯示active或running
			- 若沒再運行則會顯示inactive
			- 可透過 `systemctl start sshd`來開啟服務
	- 檢查SSH Service Port
		- 有兩種方式檢查SSH是跑在哪個port上
			- 第一個是去查看 ssh 設定檔
				- `grep Port /etc/ssh/sshd_config`
			- 若你知道ssh服務正在運行，則可透過 `ss`指令查看是否跑在預期的port上
				-  `ss -plnt` //是從kernel中query出socket資訊
				-  `netstat -plnt` 
- 導致SSH連線失敗的原因可能會有哪些?
	- **ssh公鑰沒有被inject到Server上**
		- 我們在本地端產生ssh key pair，並可能透過passphase保護私鑰
		- 將ssh公鑰注入到遠端server上的 **~/.ssh/authorized_keys** 路徑
		- 而有時候常會跳出 **Permission denied (publickey)** 的錯誤訊息
			- 原因一: 該私鑰沒有權限登入
			- 原因二: 公鑰沒有正確被放入路徑或公鑰遺失
			- 原因三: 本地 ssh 公鑰和私鑰未正確配對
			- 在連接之前，ssh 會檢查我們的公鑰和私鑰是否正確配對
		- 預設路徑
			- `$ ssh-keygen`
			- 公鑰預設放在 `/home/username/.ssh/id_rsa.pub`
			- 私鑰預設放在 `/home/username/.ssh/id_rsa`
		- 要如何將公鑰注入至Server路徑中? 
			- `ssh-copy-id USER@HOST`
			- 預設就是放入 **~/.ssh/authorized_keys**
	- **防火牆導致無法連線**
		- 檢查Policy
	- **Host Key Check Fails** 
	![](https://i.imgur.com/XSDQF9V.png)
	出現類似這種錯誤訊息
	每個Server都會有Fingerprint，不同server或server重新配置則fingerprint則不同
	當成功登入，則電腦會保存fingerprint來為下一次連接做比較，若fingerprint不匹配則會跳出這種警告
		- 如果確定有重新設定server則可以忽略這個警告
		- 可以在 **~/.ssh/known_hosts** 刪除entry，或清空文件，這將會關閉所有密鑰檢查
	- **Your SSH Key File Mode Issues**
		- 作為保護 SSH Key檔案的權限應該要是0600(Owner R+W)或0400(Owner R)
		![](https://i.imgur.com/F9O86LG.png)
- SSH中要如何啟用無密碼認證?
	- 至`/etc/ssh/sshd_config` 中修改設定
	```=
	PasswordAuthentication no
	PubkeyAuthentication yes
	```
- 講解一下Ping跟Tracert指令是怎麼運作的?
	![](https://i.imgur.com/Kog8FV8.png)
	- Ping: 向特定目標發送ICMP Echo Request以確認對目的端的通訊狀態
		- 可以根據ping返回的TTL值來判斷對方所使用的操作系統及數據包經過路由器數量
	- Tracert: 善用回應逾時的錯誤以查詢到目的地的路徑
- [Linux底下要怎麼修改MTU值?](https://www.361way.com/linux-mtu-jumbo-frames/4055.html)
- 甚麼是Jumbo Frame?
	- 為比標準Ethernet Frame還大的Frame，比1518/1522 bit大的frame
	- 只能在full-duplex的乙太網路中運行
	- 標準Ethernet IP訊息大小是: 1500Bit，若包含Ethernet Header以及FCS(6+6+2+4)是1518bit
	- Jumbo frame指的是兩層封裝三層IP Message的值大於9000bit的Message
	- 若使用一般1500Bit的frame，frame越小，傳輸封包量越大，計算量越多，則:
		- 增加Host的計算量，消耗CPU資源
		- 影響網路傳輸速度
		- 所以加大frame可以降低CPU計算量並加快傳輸速度
- 如何修改frame大小(如何創造Jumbo Frame?)
	- 修改MTU(Maximum Transmission Unit)值 
	- 1. `ifconfig ${Interface} mtu ${SIZE} up`
	- ex. `ifconfig eth1 mtu 9000 up`
	- 但這樣重啟需要重新設定
	- 2. 修改config檔案
	- Ubuntu/Debian底下是在 /etc/network/interfaces底下
	- 新增 `mtu 9000`
	- 重啟服務 `/etc/init.d/network-manager restart`
	- **經過交換網路設定時，僅修改Host端的MTU值不太行，還續鑰檢查網路設備有無啟用jumbo frames功能**
- 測試MTU
	- `ping -l 9000 -f <domain>`
	- -f 參數告訴作業系統不能私自更改封包大小
- 講解一下Email的通訊原理
	- 當輸入Email時，"@"後面即為Domain Name
	> http://linux.vbird.org/linux_server/0380mail.php#whatmail_dns
	> https://weils.net/blog/2017/04/19/how-email-works-dkim-all-in-one/
> https://docs.digitalocean.com/support/how-to-troubleshoot-ssh-connectivity-issues/
> https://www.linux.com/topic/networking/4-reasons-why-ssh-connection-fails/
> https://help.skysilk.com/support/solutions/articles/9000150151-how-to-troubleshoot-ssh-connection-issues-using-vnc-console
- DNS設定失敗會怎麼解決?
> https://www.digitalocean.com/community/tutorial_series/an-introduction-to-managing-dns 
- 可以講解一下HTTP協定運作原理嗎?
    ![](https://i.imgur.com/kwU3Ay7.png)
	- 通常由使用者透過瀏覽器或爬蟲來對Server端發出請求
	- 那其中我們會稱這個client為User Agent，一個代理程式
	- 而請求的Server上可能也會有一些像是HTML檔案或圖像之類的資源
	- 當HTTP Client發出請求，建立一個到Server端指定port(預設是80)的TCP連線
	- 則HTTP Server則會在那個port監聽client的請求
	- 一旦收到請求，Server會向Client返回一個狀態 ex. "HTTP/1.1 200 OK"，以及返回內容或錯誤訊息等等資訊
	- HTTP在1.1中加入了保持連線的機制，一個連接可以重複在多個請求/回應使用
	- 可以減少等待時間
- 那HTTPS呢?
	- 就是在進行HTTP連線之前會先進行TLS/SSL Handshake
- 你知道的HTTP狀態碼有哪些?
	- 2xx
	![](https://i.imgur.com/KWTpmAh.png)
	- 3xx
	![](https://i.imgur.com/zShTVKk.png)
	- 400 - Bad Request : 代表送到Server的HTTP Request語法有誤或無效
		- 檢查: 
		- 1. URL中的錯誤
		- 2. 與該網站的cookie可能毀損，清除瀏覽器的cookie以及cache
		- 3. 嘗試在不同的web瀏覽器上打開相同的網頁
	- 401 - Unauthorized: 代表使用者在未經身分認證的情況下嘗試存取資源，而用戶必須提供credential才可以查看受保護的資源
		- 檢查:
		- 1. 檢查URL錯誤，若URL有效，則存取主頁並登入，輸入資訊，然後重試
		- 2. 瀏覽器也可能快取到無效資訊，因此可以清除快取
	- 403 - Forbidden: 發生在用戶發出有效請求但Server由於缺乏存取資源的權限而拒絕服務時
		- 檢查: 
		- 1. 確保Server中 /www 資料的存取權限是正確的
		- 2. 檢查 .htaccess 設定(.htaccess 文件控制對資源的存取)
		- 3. 若網站沒有index文件，也有可能發生這種情況，這樣須將主頁重新命名為index.html/index.php
		- 3. 與網站管理員聯繫已取得存取權限 (應將權限設為讀取)
		- 4. 若其他用戶可以存取，則需要聯絡ISP來解決這個問題
	- 404 - Not Found: 代表用戶可與Server通訊，但無法定位所請求的資源
		- 檢查:
		- 1. 一樣URL有沒有錯
		- 2. F5更新網頁
		- 3. 清除瀏覽器快取
		- 4. 修改DNS Server設定
	- 500 - Internal Server Error: 這代表網站Server出現問題，Server無法偵測確切問題，但client端還是能夠嘗試以下步驟
		- 檢查:
		- 1. 網路流量高，按下F5，重新載入網頁
		- 2. 清除網路瀏覽器快取和cookie
		- 3. 檢查網站的 .htaccess文件被正確建立
		- 4. 檢查文件和資料夾是否有任何不正確的權限
	- 502 - Bad Gateway: 代表Server充當gateway或proxy，無法從上游Server獲得有效的Response，這也有可能是由於DNS問題所造成的
		- 檢查:
		- 1. F5鍵，重新載入網頁
		- 2. 關閉所有打開的瀏覽器並啟動新的瀏覽器Session
		- 3. 清空瀏覽器快取
		- 4. 暫時禁用CDN(Content Delivery Network)
		- 5. 重啟網路設備(modem, router etc.)
	- 503 - Service Unavailable: 這代表server負載過大，或正在維護中
		- 檢查:
		- 1. F5鍵，重新載入網頁
		- 2. 重啟網路設備(modem, router etc.)
	- 504 - Gateway Timeout: 代表Server是Gateway或proxy，在允許的時間內無法從後端server獲得response
		- 檢查:
		- 1. F5鍵，重新載入網頁
		- 2. 重啟網路設備(modem, router etc.)
		- 3. 變更DNS Server(若你網路中的所有設備都收到相同錯誤)
		- 4. 仍然有錯誤可能要聯絡網管或ISP
- 可以講解一下SMTP運作原理嗎?
- 可以講解一下DNS的運作原理?
	- 有分成兩種，一種是授權型DNS另一種是遞迴型server
	- 授權型會接收並回應DNS查詢服務，一層一層找到root DNS Server
	- 遞迴型則本身沒有DNS Record，但它會將請求傳遞給授權DNS Server去取得IP位址
	- 運作流程:
		- 當輸入www.ntust,edu.tw 時，DNS Server會接收到查詢IP位址的請求
		- DNS Server會開始查詢www.example.com 的IP位址
		- 並檢查local DNS Server的Cache中有沒有dns record
			- 會去 `/etc/resolv.conf` 查找，將網域變更為FQDN
		- 若沒有則會去root DNS Server去查找
		- root DNS Server會去告知DNS Server 「管理tw的DNS Server」的IP地址
		- 而local DNS Server取得該IP後就會去發出DNS請求
			- `dig tw ns +short`
		- 而管理tw的DNS Server會去告訴local DNS Server 「管理 edu.tw的DNS Server」的IP位址
			- `dig @nameserver edu.tw ns`
			- `dig @a.dns.tw edu.tw ns +short`
		- 而local DNS Server取得該IP後就會去發出DNS請求
		- 管理edu.tw的DNS Server會去告訴local DNS Server 「管理ntust.edu.tw的DNS Server」的IP位址
			- `dig @nameserver ntust.edu.tw ns +short`
		- 接著local DNS Server就會去對該IP位址發出請求
			- `dig @RealAuthorieServer ntust.edu.tw a +short`
		- 則管理ntust.edu.tw的DNS Server會返回www.ntust.edu.tw的IP位址
- 可以講解一下TLS/SSL Handeshake的過程嗎?
    https://www.cloudflare.com/zh-tw/learning/ssl/what-happens-in-a-tls-handshake/
    ![](https://i.imgur.com/4EOqjes.png)
    運作在Session Layer，主要會在通訊雙方交換資訊並互相驗證，並透過他們所使用的通訊加密演算法並產生一致的工作金鑰
    - TLS 握手什麼時候發生？
        - 用戶導航到一個使用 HTTPS 的網站，瀏覽器首先開始查詢網站的原始伺服器，這時就會發生 TLS 握手。
        - 在任何其他通信使用HTTPS時（包括 API 調用和 DNS over HTTPS 查詢），也會發生 TLS 握手。
        - 通過 TCP Handshake 打開 TCP 連接後，將發生 TLS Handshake
    - TLS Handshake過程中發生啥事?
    	- client與server之間會進行以下操作:
			- 指定TLS版本(TLS 1.0、1.2、1.3)
			- 決定所使用的密碼學套件
			- 透過Server的公開密鑰和SSL憑證頒發機構的電子簽章去驗證Server的身分
			- 生成工作階段金鑰，以便在握手完成後使用對稱加密
	- TLS Handshake的步驟是甚麼?
		- 具體步驟會隨著使用的金鑰交換演算法的不同而不同
		- 最常用的是**RSA**金鑰交換演算法
			- **Client Hello:**
				- client對server發出hello消息來進行Handshake，其中包含了用戶端支援的TLS版本，支援的密碼套件、以及一個client隨機亂數
			- **Server Hello:**
				- 回覆client hello，server回傳訊息中包含:
				- SSL憑證 `這是哪來的?怎麼產生的?`
				- 伺服器選擇的密碼套件
				- server隨機亂數
			- **身分認證**
				- client端使用頒發該憑證的憑證授權驗證伺服器的 SSL 憑證
				- 此舉確認Server是其聲稱的身份，且client正在與該domain的實際所有者進行互動
			- **premaster secret**
				- client端再發送一串隨機位元組，即premaster secret
				- premaster secret使用公開金鑰加密(是client從SSL憑證中取得公鑰，來進行加密的)
				- 只能使用server的secret key進行解密
			- **secret key被使用**
				- server透過私鑰對premaster secret進行解密
			- **生成工作階段金鑰**
				- client 與 server端均使用client亂數、server亂數和premaster secret去生成工作階段金鑰
			- **client就緒**
				- client會發送一條**已完成**的消息
			- **server就緒** 
				- server會發送一條**已完成**的消息
		- 所有 TLS 握手都使用非對稱加密（公開金鑰和私密金鑰），但並不是所有的 TLS 握手都會在生成工作階段密鑰的過程中使用私密金鑰。例如，臨時 **Diffie-Hellman** 握手的步驟如下：
			- **Client Hello**
				- 包含協定版本、client亂數、密碼學套件清單
			- **Server Hello**
				- 包含SSL憑證、選定的密碼套件、Server亂數
			- **server的數位簽章**
				- server使用其私鑰對client亂數、server亂數以及DH參數進行加密
				- 加密後的資料用作伺服器的數位簽章
				- 已確定Server中具有與SSL憑證中的公鑰匹配的私鑰
			- **Server與Client計算premaster secret**
				- client與server使用交換的DH參數分別計算匹配的premaster secret
				- 而不像RSA Handshake那樣由用戶端生成premaster secret並將其發送到server
			- **建立工作階段金鑰**
				- client與server從premaster secret、client亂數、server亂數中計算工作階段金鑰
			- **client就緒**
				- client會發送一條**已完成**的消息
			- **server就緒** 
				- server會發送一條**已完成**的消息
- [TLS Handshake失敗可能原因會是甚麼?](https://segmentfault.com/a/1190000021778053)
    - 常見錯誤訊息:`SSL Handshake Failed error`
    - 常見錯誤原因:
    	- 協定不匹配  `server端出錯`
    	- 加密套件不匹配 `server端出錯` → Server端不支援client請求使用的加密套件
    	- 系統時間不準確 (可是剛剛過程沒用到時間資訊阿:|)
    	- 瀏覽器設定錯誤
    	- 憑證錯誤 `server端出錯`
			- 憑證中的domain name與URL中的domain name不符
			- 憑證過期
			- 或憑證鏈出錯
    		- 使用自簽名的憑證
    	- Server啟用了SNI-Enabled `server端出錯`
    - **協定不匹配**
    	- 透過 `tcpdump -i any -s 0 host IP address -w File name` 在client或server上蒐集資訊
    	- 透過wireshark去分析蒐集的packet
    	- 去找**client hello**所使用的TLS版本
    	- 去看Sever端之後後續處理的錯誤資訊
    	- https://docs.apigee.com/api-platform/troubleshoot/runtime/ssl-handshake-failures
- 網站憑證過期該怎麼辦?
	- 去更新憑證
- 可以講解一下甚麼是SSL嗎?
	- 全名是Secure Soekcts Layers，用來確保兩個系統之間所傳遞的敏感資料被竄改或讀取
	- TLS就是更安全的SSL版本
## Linux Admin
> 感覺偏向指令使用或config如何設定
- 在Linux中你會怎麼管理User跟Group?那在Windows中你又會怎麼做管理?
	- 看user`cat /etc/passwd`
	- 新增user `useradd`
	- 新增group `groupadd`
	- 再透過 `gpasswd` 將使用者加入或移除 root (sudo) 權限群組
- 可以講解一下`curl` 指令的原理嗎?
	- 一個command line工具可以傳遞資料到server中
- 你會怎麼使用 `curl` 這個指令來做Troubleshooting?
	- `$ curl protocol://IP/host:port`
	- Troubleshooting Web Servers
		- `curl http://example.com -I` 透過-I參數來返回Header
	- Troubleshooting SMTP Servers 
		- `curl smtp://example.com` 預設使用 port 25 作為SMTP Port
		- 但某些ISP會阻擋標準SMTP port來防止SPAM
		- 亦可使用 2525 或 587 port
	- Troubleshooting FTP
		-  `curl ftp://example.com` 預設使用21 port
- 如何使用 `curl` 指令並透過proxy來連接?
	- `curl --proxy yourproxy:port https://yoururl.com`
- 如何透過 `curl` 略過檢查自簽SSL憑證的有效性?
	- `curl -k https://localhost/`
	- `curl --insecure https://localhost/`
- curl 各種用法:
```=
$ curl [protocol://domain:port/]
$ curl -o <欲下載的檔名> [protocol://domain:port/] 下載特定檔案
$ curl -O [protocol://domain:port/file]  直接下載網址中的檔案
$ curl -C - -O [protocol://domain:port/file] 從剛剛被中斷的地方繼續下載
$ curl -L [protocol://domain:port/] 跟隨網址的301/302 redirect
$ curl --trace-ascii debugdump.txt [protocol://domain:port/] 追蹤整個curl過程，並將結果存入debugdump.txt檔案
```
- curl 進行HTTP Request
```=
-X/--request [GET|POST|PUT|DELETE|PATCH]  使用指定的 http method 來發出 http request
-H/--header                           設定 request 裡所攜帶的 header
-i/--include                          在 output 顯示 response 的 header
-d/--data                             攜帶 HTTP POST Data 
-v/--verbose                          輸出更多的訊息方便 debug
-u/--user                             攜帶使用者帳號、密碼
-b/--cookie                           攜帶 cookie（可以是參數或是檔案位置）
```
- 透過 curl去POST資料到 HTML Form
	- 假設收到的Form表單的HTML長這樣
	```
	<form method="POST" action="form.php">
    	<input type=text name="email">
    	<input type=submit name=press value=" OK ">
 	</form>
	```
	- `curl -X POST --data "email=test@example.com&press=%20OK%20" http://www.example.com/form.php`
- 透過 curl去進行檔案上傳
	- 假設收到的Form表單的HTML是
	```
	<form method="POST" enctype='multipart/form-data' action="upload.php">
 		<input type=file name=upload>
 		<input type=submit name=press value="OK">
	</form>
	```
	- `curl -X POST -F 'file=@./upload.txt' http://www.example.com/upload.php`
- 透過curl常見的RESTFul CRUD指令:
	- GET單一或全部資源
	```
	$ curl -X GET "http://www.example.com/api/resources"
	$ curl -X GET "http://www.example.com/api/resources/1"
	```
	- POST JSON資料
	```
	$ curl -X POST -H "Content-Type: application/json" -d '{"status":false,"name":"Jack"}' "http://www.example.com/api/resources"
 	```
	- PUT JSON資料
	```
	$ curl -X PUT -H "Content-Type: application/json" -d '{"status":false}' "http://www.example.com/api/resources"
	```
	- DELETE 資源 
	```
	$ curl -X DELETE "http://www.example.com/api/resources/1"
	```
- **透過curl攜帶cookie**
	- 在指令中輸入cookie
	```
	$ curl --cookie "name=Jack" http://www.example.com
	```
	- 從檔案中讀取cookie
	```
	$ curl --cookie stored_cookies_file_path http://www.example.com
	```
- **curl指定攜帶User Agent**
	```
	$ curl --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" 		http://www.example.com
	```
	- **Basic Authentication:** 若網頁有使用基本的Authentication則可攜帶`--user username:password` 來通過驗證
	```
	$ curl -i --user secret:vary_secret http://www.example.com/api/resources
	```
- 透過curl指令使用proxy做連接
```
$ curl --proxy yourproxy:port https://youurl.com
```
- curl限定下載速度
```
$ curl --limit-rate 2000B [URL]
```
- **在請求中注入特定Content-Type來處理特定問題**
```
$ curl --header 'Content-Type: application/json' http://yoururl.com
```
- 僅在回應中呈現header
```
$ curl --head http://yoururl.com
```
- **連接 HTTPS/SSL URL 並忽略任何 SSL 憑證錯誤**
	- 當試圖存取SSL/TLS憑證的安全URL時候，若出現憑證錯誤或CN不匹配，則會出現以下錯誤
	`curl: (51) Unable to communicate securely with peer: requested domain name does not match the server's certificate.`
```
$ curl --insecure https://yoururl.com
```
- 使用特定協定(SSL/TLS)連線
```
$ curl --sslv3 https://yoururl.com
$ curl --tlsv1 https://example.com
$ curl --tlsv1.0 https://example.com
$ curl --tlsv1.1 https://example.com
$ curl --tlsv1.2 https://example.com
$ curl --tlsv1.3 https://example.com
```
- 從FTP Server中下載檔案
```
$ curl -u user:password -O ftp://ftpurl/style.css
```
- 可以講解一下MTR指令怎麼用嗎?
	- [**MTR**](https://blog.gtwang.org/linux/mtr-linux-network-diagnostic-tool/)
		- 指令實作: MTR 在一開始會針對指定的主機，以 traceroute 找出中間的每一個網路節點（閘道器、路由器、橋接器等），然後使用 ping 去檢查每一個節點的網路連線狀況，即時更新在輸出的報表中，讓管理者一目了然。
		```=
		mtr www.google.com.tw   
		mtr -n www.google.com.tw //統一以ip位址來呈現
		mtr -b www.google.com.tw //同時呈現ip位址以及網域名稱
		mtr -c 5 www.google.com.tw // 指定ping 上限(ICMP ECHO 上限)
		mtr -c 5 -r www.google.com.tw > output.txt //輸出報表
		
		```
		![](https://i.imgur.com/BSFP2pP.png)
		- L(Loss): 封包遺失率
		- S(Snt,Sent Packet): 封包發送數
		- Avg(Average RTT): 
		- Best(Best RTT):
		- Worst(Worst RTT):
	 - 所以從這個工具中可以發現甚麼????? 
- 可以講解一下 `iperf` 指令怎麼使用嗎?
	- = `iperf3`是一種網路頻寬測試工具，可以測試客戶端上傳資料速度
	- 透過TCP來測量頻寬、確定鏈路品質跟延遲以及抖動和封包遺失
	- 測時頻寬時，需要同時在server與client端都各執行一個iperf3程式，讓他們互相傳送資料進行測試
	```
	# server端   
	iperf3 -s   //打開監聽socket 預設port為5201，開放Server Thread
	```
	```
	# client端
	iperf3 -c SERVER_IP/HOSTNAME
	```
	- iperf3 也支援Android以及IOS的使用(有APP)
	- 指定測試時間
	```
	iperf3 -c SERVER_IP -t 20 -i 4 //測試20秒，每隔4秒輸出一次測試數據
	```
	- 儲存測試結果
	```
	iperf3 -c SERVER_IP --logfile output.txt
	```
	- 指定port
	```
	# Server端
	iperf3 -s -p 12345
	
	# client端
	iperf3 -c SERVER_IP -p 12345
	```
	- 多條連線
	```
	#同時使用兩條連線測試
	iperf3 -c SERVER_IP -P 2
	```
	- 若要測試UDP傳輸協定效能，可以使用 `-u` 參數
	```
	iperf3 -c SERVER_IP -u
	```
	- 反向傳輸:測試下載速度(server傳送，cleint接收)
		- 預設資料流: client $\rightarrow$ Server
	```
	iperf3 -c SERVER_IP -R
	```
	- IPv4、IPv6
	```
	iperf3 -c SERVER_IP -f
	iperf3 -c SERVER_IP -6
	```
	- 自訂傳送檔案
	```
	iperf3 -c SERVER_ip -F YOUR_FILE
	```
- 可以講解一下 `tracert` 指令怎麼使用嗎?甚麼情況下你會用到這個指令?
  主要是用於即時網絡故障排除，以查找封包在通過網路傳輸到其目標地址時所採用的路由路徑
  主要是透過發送ICMP封包，並設定IP Header上的TTL欄位來達成traceroute功能的
  每次送出的為3個40bytes的封包，包括source位址，目的位址和封包發出的timestamp到目的地，第一個會是probe(探測用)，然後是走UDP，由於我們不想目的主機處理它們，因此目的埠設定為一個不可能的值
```
$ tracert -d -h maximum_hops -j host_list -w timeout target_host
-w 要指定等待timeout的毫秒數
```
- 當 `tracert` 指令中出現星號代表甚麼?
	- 若tracert出現星號(\*)，代表該節點可能有某些防禦措施，使我們的封包被丟棄
		- 可能是iptables設定為Drop之類的
- 講解一下 `tracert` 指令的原理是甚麼嗎?
	- 特性1: 主要是透過 TTL(Time_To_Live)值來是現功能的，每經過一個節點，路由器就會幫TTL值減1
	- 特性2: 主要呼叫者會發出 TTL=1的封包，第一個路由器將TTL減1後得到0，不再繼續值轉發此封包
	- 而會返回一個ICMP Time_Out Response，然後電腦就會從Response中提取出封包經過的第一個gateway地址
	- 接著發出一個TTL=2的ICMP封包，可以獲得第二個gateway地址
	- 因此依次遞增TTL值便獲取沿途所有Gatewat位址
- 如果 `tracert` 回傳response並不是ICMP Time_Out，代表甚麼?
	- 大多防火牆或啟用防火牆功能的路由器預設會不返回各種ICMP封包
	- 其餘路由器或交換器可被admin設定成不返回ICMP Response
	- **因此 Traceroute程式不一定能夠拿到所有沿途gateway位址**
		- 當某個TTL值的封包得不到回覆時，並不能停止這一追蹤過程，程式仍然會把TTL遞增然後發出下一個封包，一直到預設會透過參數指定的**追蹤限制(maximum_hops)** 
- 若無法回應ICMP Response，那又是如何知道封包抵達了?
	- Traceroute在送出UDP datagrams到目的地時，它所選擇送達的port number 是一個一般應用程式都不會用的號碼（**30000 以上**）
	- 所以當此UDP datagram 到達目的地後該主機會送回一個「**ICMP port unreachable**」的訊息，而當traceroute 收到這個訊息時，便知道目的地已經到達了。
- 為甚麼traceroute要使用大於30000的port
	- 跟UDP規定port號必須小於30000有關
	- 若使用UDP則可能會因為主機沒有提供 UDP 服務而簡單將封包拋棄，然後不返回任何資訊
	- 所以使用大於30000的port，目標主機能做的是就是返回一個 **port不可達** 的回應
- [甚麼是FQDN(完整網域名稱?)](https://haway.30cm.gg/dns-1-basic/)
	- 在/etc/resolv.conf中，沒有加上"." 結尾的主機名稱，都會被系統自動附加網域名稱
	- 然後檔案中的**search** 就是告訴系統可以附加什麼樣的網域名稱
	```
	domain rsync.tw
	nameserver 168.95.1.1 (cache server)
	nameserver 8.8.8.8  (cache server)
	search hdns.com.tw example.com
	```
	- 上方範例中只要輸入blog，系統就會自動改為blog.rsync.tw並送到168.95.1.1去做DNS解析，但如果不成功就會換成blog.hdns.com.tw再次嘗試，以此類推
	- 若168.95.1.1的DNS服務無法連上，系統就會自動跳到第二筆的8.8.8.8伺服器
- 要怎麼設定DNS Cache Server?
	- 去/etc/resolv.conf更改 nameserver
- **DNS權威Server以及DNS Cache Server差別?**
	- DNS Authoritative Server:會從自己的資料庫取出DNS紀錄並回應請求
	- Cache Server則是去詢問其他主機的DNS資料
- DNS中甚麼是NS(Nameserver)紀錄?
	![](https://i.imgur.com/YMAcJ1x.png)
	-  root server會去記錄每個子網域的授權主機位置就是透過NS Record
	-  NS Record的用途有兩個:一個是向下授權、一個是平行授權
	-  向下授權: 建立一個子網域 (EX. 跟Server建立一個.tw的子網域)，並授權給TWNIC的主機
	-  平行授權: 同個網域名稱的所有NameServer，都必須有相同的NS紀錄
	![](https://i.imgur.com/9mo0lwG.png)
	- 上面就是 ntpu.edu.tw 已經授權給六台nameserver，這六台的ntpu.edu.tw的ns紀錄必須完全一樣
- 要怎麼知道自己的DNS主機目前正式授權到哪些主機上面?
	- 購買網域名稱時後填寫的Nameserver，註冊商會依照所註冊的域名
	- 把你的nameserver送給Registry，Registry確認後就會把你的主機資料放入他們的紀錄中
	- 就會產生一組NS資料
	```
	$ dig [domain] ns
	```
	- 透過上述指令確認目前NameServer資料是否跟註冊時填寫一致
- 甚麼是SOA Record?
	- SOA紀錄是**網域名稱的系統管理紀錄**
	- 若使用代管則不需要處理(CloudFlare, Gandi LiveDNS)
	- 自架的DNS主機則會需要設定
	- 主要代表者會是網域名稱的管理者、管理主機、區域檔序號與全域性的TTL資料
- 甚麼是A/AAAA紀錄
	- 當要將網域名稱對應到Server的IP位址時，就需要用到A紀錄
	- A紀錄指向到IPv4位址
	- AAAA紀錄指向到IPv6位址
	```
	$ dig +short blog.rsync.tw a
	$ dig +short blog.rsync.tw aaaa
	```
- 甚麼是MX紀錄?
	- 這個網域的mail server紀錄
	- 如果有人寄信給你，郵件主機會優先查詢這個網域名稱有沒有 MX 紀錄
	- 如果有，就會連線到郵件主機，如果沒有特別設定 MX 紀錄
	- 寄送郵件的主機會嘗試解析網域名稱的 A 紀錄
	- 如果有 A 紀錄，就會嘗試連線主機的郵件伺服器。
	![](https://i.imgur.com/eQNw7LE.png)
	- 當Domain Name有MX紀錄，mail主機會嘗試連線mg.ntust.edu.tw
	- MX紀錄中可以設定mail server優先順序，數值越小的優先
	- 所以寄給ntust.edu.tw的信，會優先送給 mg.ntust.edu.tw
	- 若沒有mx紀錄，則會送給Domain Name名稱的A紀錄，即140.118.31.99
	![](https://i.imgur.com/rO5idoQ.png)
- 甚麼是CNAME紀錄?
	- **主機名稱的別名的一種**，當你的目的位址是主機名稱時，而不是IP位址
	- 這時則須要使用CNAME進行對應	
	- 限制: 同一筆紀錄底下如果有設定CNAME紀錄，就不能設定其他紀錄
		- 為甚麼?
	- EX. **若設定某個domain的CNAME，則不可設定A、MX、TXT等紀錄**
- 若有人設定某個Domain Name的CNAME，例如我註冊 HelloWorld.tw 然後想要把網頁瀏覽者連到跟blog.HelloWorld.tw一樣的網站，所以設定了
	```
	HelloWorld.tw  CNAME  blog.HelloWorld.tw
	```
	- 但HelloWorld.tw一定帶有SOA與NS紀錄，會跟CNAME產生衝突，會造成網域名稱運作不穩定，所以若要完成一樣的功能可以透過網頁跳轉的方式來完成 
- 可以講解一下 `dig` 指令怎麼使用嗎?甚麼情況下你會用到這個指令?.
	- 是一種DNS除錯工具，能夠模擬一般電腦查詢、遞迴查詢、非遞迴查詢、DNS 快取伺服器查詢、DNSSEC 查詢、TCP 查詢等等。
	- `dig` 的回應區段
		![](https://i.imgur.com/kHAra1e.png)
		- Header
		![](https://i.imgur.com/nr5u3aS.png)
			- ID: 純數字，DNS查詢的識別碼
			- QR:0查詢 1 回應
			- Opcode: 0 QUERY,1 IQUERY, 2 STATUS
			- AA: 權威伺服器回應
			- TC: 截斷
			- RD: 用戶端是否要求遞迴查詢
			- RA: 伺服器回應是支援遞迴查詢
			- Z: 保留
			- RCODE: 0沒有錯誤、1-5 錯誤代碼
			- QDCOUNT: Question區段的資料數量
			- ANCOUNT: Answer區段的資料數量
			- NSCOUNT: Authority區段的資料數量
			- ARCOUNT: Additional區段的資料數量
		- Question
		- Answer
		- Authority
		- Additional
	- `dig`的參數
		- `@server` 指定伺服器，**對哪台Server發出DNS查詢，若不指定則使用系統預設**
		- `+short` 簡略輸出，只顯示ANSWER部分，若沒回應則顯示空白
		- `-4` 只使用 IPv4位址進行與Server的連線
		- `-6` 只使用 IPv6位址進行與Server的連線
		- `+tcp` 使用TCP的方式與DNS Server連線
			- **DNS原生是使用 UDP/53 協定**，若有人忘記開啟主機或IP分享器的防火牆
			- 則會透過 `+tcp` 的方式將DNS查詢改為TCP連線
			- 若一般查詢沒回應，而`+tcp`會過，則代表防火牆沒有開啟
		- `cdflag` 用於關閉DNSSEC查詢
			- DNSSEC是一種DNS的延伸安全協定，可以確保DNS紀錄無法被偽造(透過電子簽章的方式)
			- 若DNSSEC管理不當則會造成DNSSEC驗證失敗
			- 會發生不穩定的DNS解析
			- 此時可以透過此參數將其關閉
			- 若一般查詢沒回應，但+cdflag後有正確回應，則代表DNSSEC壞掉
	- 指令範例
	```
	# 查詢快取Server的A紀錄
	$ dig @8.8.8.8 blog.rsync.tw. a
	# 查詢Domain Name的MX
	$ dig rsync.tw mx
	# 查詢Domain Name負責人
	$ dig rsync.tw soa
	# 追蹤模式
	$ dig +trace blog.rsync.tw a
	# tcp查詢模式
	$ dig +tcp blog.rsync.tw a
	# 查詢IP反解  = nslookup <IP>
	$ dig -x 8.8.8.8 ptr
	# 關閉DNSSEC查詢
	$ dig +cdflag @8.8.8.8 blog.rsync.tw a
	```
- DNS Troubleshooting
	- step 1 : 查詢NS位址
		- 在你作 dig 除錯開始之前，首先你要確認網域名稱的名稱伺服器(NameServer) 位址，因為所有回應都一定從名稱伺服器回應，所有使用Domain Name Registry或是Cloudfare之類的服務則NameServer會是這些業者，也有是註冊時填寫的NameServer欄位資料
		```
		$ dig +short rsync.tw ns
		```
		- 可看出NameServer是哪幾台(DNS紀錄由哪幾台負責)
		- 或是由淺入深從較高層的DNS Server查下來
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
		- 為何不直接 dig +short ntust.edu.tw ?
			![](https://i.imgur.com/6miPWp1.png)
			- 因為這樣會透過系統Cache Server去查詢DNS NS紀錄
	- 可能發生的情況:
		-  空的、沒回應
			- 如果你在查詢 NS 的時候出現錯誤，或是發現有回應，但是沒有資料
			- 可能情況-1: NameServer填錯，請Domain Name Registry檢查
			- 可能情況-2: 網遇到期沒繳錢，或狀況有問題(透過`Whois` 指令來查看)
		-  NameServer是Public DNS
			-  有人會把Public DNS以為是NameServer，就把8.8.8.8填入nameserver那邊，但這樣是不對的
		-  跟你填的資料不同
			-  Domain Name Registry沒有將你的名稱更新到域名管理局或是你剛好更換NameServer中
	- Step 2 : 直接查詢Name Server的資料
		- 確認NS位址後，接下來對Name Server送出查詢
		- 查詢你要解析的域名，稱伺服器回應的資料應該是最新、最完整的，所以你要知道紀錄更新了沒、解析到底正不正確，都是透過直接查詢名稱伺服器來獲得解答。
		![](https://i.imgur.com/MHvHAb6.png)
	- 可能發生的問題-2:
		- NameServer同步不一致
			- 確保每台NameServer回應資料都是正確的
		- NameServer無回應
			- 代表NameServer的DNS服務有問題
			- 可能DNS服務沒啟用或機器有問題
			- 可以ping一下NameServer，如果有回應就是DNS服務的問題
			- 則可透過 `dig +tcp`來檢查是不是防火牆的問題
			- 若有回應則要朝向防火牆的問題去解決
			```
			#查詢Name Server回應，可以查詢SOA，因為一定有這筆紀錄
			$ dig @(NS IP) (domain) soa
			#如果沒回應，ping看看是不是主機或網路問題
			$ ping (NS IP)
			# 如果ping有回應，則改用+tcp 來檢查是不是防火牆問題
			$ dig +tcp @(NS IP) (domain) soa
			```
	- Step 3 : 檢查Authority Server回答
		- nameserver通常是由上往下授權
			- ex. rsync.tw nameserver是由.tw往下授權到 ns[1-3].gandi.net的nameserver的
		- 授權不一定正確(其實是使用者自己填的，可能會填錯)，上層依照使用者輸入的資料直接變成NameServer
		- 正確授權:
			- 1. 由上對下正確授權
			- 2. 伺服器具備權威伺服器的回答
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
		- 不使用 +short 參數，就可以看到Header部分，可以看Header中的**AA Flag** 
		- 回應中，有一個 "flags: qr aa rd;"，aa = AA 就是權威伺服器回答的意思
		- 代表這台Server知道自己管理了此網域，所以從區域檔中的資料回應給查詢端
		- 對Public DNS查詢則不會有這個AA Flag
		- 而若是對Name Server查詢而沒有AA，則代表管理員沒有正確設定Server
	- Step 4 : 查詢Cache Server(Public DNS)
		- 最後一步就是要查詢快取伺服器的回應資料，看看是否正確，一般所有的用戶電腦都會透過快取伺服器 (譬如8.8.8.8、168.95.1.1) 取得 DNS 的資料，所以我們要測試一下是否正確：
		```
		$ dig @8.8.8.8 www.rsync.tw a
		```
	- 可能發生的問題-4
		- 查詢到舊資料
			- DNS 有TTL暫存時間	
			- 暫存時間內，都會保留資料直到TTL(秒)時間過去
			- 這時需要確認每個Authority Server的查詢是否都是最新資料
		- 解析失效NXDOMAIN
			- 若上述查詢過程中都沒問題，但Public DNS這些快取Server卻沒反應
			- 可能是 DNSSEC壞掉了
			- 此時需要找你的Domain Name的註冊商去取消你的DNSKEY金鑰 
- [DNSSEC壞掉會發生甚麼事?該怎麼修復][(https://](https://haway.30cm.gg/dnssec-broken/))?
	- 現象:
		- 可能就只有透過授權給你的domain的權威DNS Server能夠查詢到你的A紀錄
		- 但你如果查詢Public DNS Server(ex. 8.8.8.8)中A的你的domain的A紀錄可能藉會報錯
	- 檢查: 
		- 這時可以透過 加上 `+cdflag` 參數來讓DNS Cache Server關閉DNSSEC驗證
		- `cdflag` 就是告訴8.8.8.8，這個DNS查詢不需要進行DNSSEC驗證
	- 可能原因:
		- 若使用了某個域名代管服務，並開啟了DNSSEC
		- 但後續又將Nameserver變更，這將會導致DNSSEC Chain 驗證失敗
		- 因為DNSKEY沒有被移轉(新的Name Server中沒有DNSKEY)，則會導致驗證失敗
	- 解決方式: 
		-  或是使用域名註冊商提供的介面並關閉DNSSEC的功能
		-  或是在新的NameServer上重新簽署DNSSEC，然後更新DNSKEY
- 在LINUX中如何開啟DNSSEC?
	- 可修改 /etc/systemd/resolv.conf中的DNSSEC設定值  
- 在/etc/resolv.conf中設定的nameserver被重置怎麼辦?
	- 透過 symbolic link指向 /etc/systemd/resolv.conf
	```
	$ cd /etc
	$ rm resolv.conf
	$ ln -s /run/systemd/resolve/resolv.conf resolv.conf
	```
	- 直接修改 /etc/systemd/resolv.conf 中的DNS位址
- 你會去怎麼處理Linux中Process的OOM問題?
- 甚麼是**OOM Killer**?
	- Linux中負責監控那些占用memory過大，尤其是瞬間很快消耗大量memory的process
	- 為了防止memory耗盡而kernel會把該process kill掉
	- 有時候SSH不到機器，但能 ping 通，說明不是網絡的故障，很多原因是 sshd process被 OOM killer 殺掉了
	- Kernel會通過特定的演算法給每個process計算一個分數來決定殺哪個process
	- 每個process的 OOM 分數可以在「**/proc/PID/oom_score**」中找到
	- 重啟機器後查看系統日誌「**/var/log/messages**」會發現「Out of Memory: Kill process 1865（sshd）」類似的錯誤訊息
	- `echo -17 /proc/PID/oom_adj` 來解決這個問題
	    - 可調範圍: 15~ -16
	    - -17是禁用
	- 或是修改Kernel參數:
	```
	sysctl -w vm.panic_on_oom=1 (預設為0)
	sysctl -p
	```
- `kill -9` 與 `kill -15` 差別在哪?送的signal是甚麼?
	```
	$ kill PID
	# 訊號: SIGKILL
	$ kill -9 PID //立即強制停止程式執行
	# 訊號: SIGTERM
	$ kill -15 PID //以正常程序通知程式停止執行，預設的訊號
	$ kill -l 列出所有可用訊號
	
	```
	![](https://i.imgur.com/1INBiak.png)
- 怎麼查詢kill指令中哪個訊號對應甚麼數字
	- `$ kill -l <數字>`
- 可以解釋一下 `ss`指令的使用時機嗎?
	- 可以輸出所有已經建立的 TCP 連線
	- ss 指令可以自己指定篩選器（filter），篩選出自己需要的 sockets 資訊:
	```
	# 列出從本機連線到 192.168.0.1 這台主機的所有連線：
	$ ss -o state established dst 192.168.0.1
	# 列出從本機連線到 192.168.0.1 主機 80 連接埠的所有連線
	$ ss -o state established dst 192.168.0.1:80
	# 列出來自於 192.168.0.2 這台主機的所有連線：
	$ ss -o state established src 192.168.0.2
	# 列出所有 ssh 的連線，包含從本機往外的 ssh 連線，以及從外面連線進來的 ssh 連線：
	$ ss -o state established '( dport = :ssh or sport = :ssh )'
	```
- 在Linux中如何列出服務?
	- 去 /etc/init.d 查看
	- 或 `systemctl list-units --type service -all`
	- `sudo systemctl | grep running`
	- `service --status-all`
- 如何查看已建立的sockets
	- `systemctl list-sockets`
	- `netstat`
	- `ss`
## app 檢測
https://www.mas.org.tw/spaw2/uploads/files/20190916/AppV3.1.pdf

## Windows Admin
- 安全性設定
	- 若要使用 Local 安全性原則主控台設定設定:
		- win+R
		- `secpol.msc`
		- 在主控台設定安全性命令下，執行下列其中一項操作：
			- 按一下 \[帳戶政策 > 以編輯 **密碼政策** 或 **帳戶鎖定政策**
			- 按一下 \[本地原則 以編輯 **稽核原則**、**使用者** **許可權指派**或 **安全性選項**
	-  若要使用本機群組策略編輯器主控台設定安全性原則設定
		- win +R
		- `gpedit.msc`
		- 在主控台樹狀樹中，按一下 \[電腦組Windows 設定 ，然後按一下\[安全性設定。
		- 執行下列其中一項：
			- 按一下 \[帳戶政策 > 以編輯 密碼政策 或 帳戶鎖定政策。
			- 按一下 \[本地原則 以編輯 稽核原則、使用者 許可權指派或 安全性選項。


## 網頁測試
- 有做過網頁單元測試嗎?
	主要架設小型的Flask Web Server
	然後有自己建立小型的測試用的服務
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
		print('测试路径是否OK,路径为：', get_Path())
	```
	執行結果
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
## RESTFUL API
- 請問你對於RESTFul Web服務的理解是甚麼?
	- RESTFul Web Service就是遵循REST風格的Web服務架構
	- REST(Representational State Transfer)並使用HTTP來實踐
- 甚麼是REST Resource?
	- 每個在REST架構底下的內容都算是一種資源，這種資源有點像是OOP內的Object
	- 資源可以是test檔、HTML頁面、圖片或是其他動態資源
	- REST Server提供對於這些資源的存取，並使Client可以使用這些資源
	- 每項資源都透過URI來做標誌
- 甚麼是URI?
	- Uniform Resource Identidier用於在REST架構中標誌資源
	- `<protocol>://<service-name>/<ResourceType>/<ResourceID>`
	- 兩種種類的URI: `URN`、`URL`
	- **URN**: Uniform Resource Name
		- 透過一個獨特且持久的名稱來標示資源
	- **URL**: Uniform Resource Locator
		- 具有有關資源位置的相關資訊
- 你對JAX-RS的理解是甚麼?
	- JAX-RS= Java API for RESRful Web Service
- 可以講一些你知道常見的HTTP Status Code嗎?
	- 1xx - 代表資訊回覆 (這啥?
	- 2xx - 代表成功回應
	- 3xx - 代表重新導向
	- 4xx - 代表client出錯
	- 5xx - 代表server出錯
	- 200 ok
	- 201- CREATED 用在PUT或POST
	- 304-NOT MODIFIED - 用於有條件的GET請求，以減少網路頻寬使用，這個response的body要是空的
	- 400-BAD REQUEST -驗證錯誤或缺少資料
	- 401-UNAUTHORIZED - 請求中沒有包含有效身分認證資訊
	- 403-FORBIDDEN - 無權或禁止存取資源
	- 404-NOT FOUND - 資源方法不可用
	- 500-INTERNAL SERVER ERROR- 當Server在運行時跳出一些異常
	- 502-BAD GATEWAY - Server無法從其他Server中獲得response
- 可以講一些你知道常見的HTTP Methods嗎?
	![](https://i.imgur.com/PBaFMYj.png)
	- GET: 從Server中擷取資訊，一種唯讀的操作
	- POST: 用來在server中建立資源
	- PUT: 用來在server中更新現有資源或取代資源
	- DELETE: 用來在server中刪除資源
	- OPTIONS: 可獲取server上現有資源的支援選項清單
	- HEAD: 與Get相同，但只傳送狀態行以及Header部分
- SOAP以及REST之間的差異是甚麼?

|SOAP|REST|
|----|----|
|Simple Object Access Protocol|Representatioanl State Transfer|
|用來實踐web服務的協定|是一種web的架構設計風格|
|SOAP無法使用REST|REST可使用SOAP作為實踐的一部分|
|有嚴格標準|不須嚴格遵守|
|client server更加耦合|REST Client靈活，不依賴Server開發方式|
|僅支援XML|支援XML,JSON,MIME,Text等|
|SOAP使用服務介面來公開資源|使用URI來開放資源|
|作為一種協定，它定義了自己的安全措施|僅根據它用於實現的協議繼承安全措施|
- 開發RESTful web 服務的Best Practice會是甚麼?
	- 開發REST API並盡可能使用JSON資料格式並進行資料的接收與回覆，因為大多數client與server之間都內置了輕鬆讀取與解析JSON物件的方式
		- 應用程式以JSON格式作為Response應要將Content-Type設為application/json
		- 某些HTTP Client端會去察看Response Header的值來去做解析
		- resquest header中的Content-Type:要設成application/json
	- **在命名資源endpoint的時候應該使用複數名詞，而不是動詞，API Endpoint應要簡短、易於理解**
		- 不用動詞是因為HTTP Method中已經描述了請求行為為何了
		- 常用的HTTP Verb/Methods: GET、POST、PUT、DELETE
	- 使用nesting來表示資源的層次結構
		- ex. GET for URI: /authors/:id/address
		- 別太多層 
	- 錯誤處理應透過返回應用程式適當的error code來處理，REST中也定義了適當的HTTP Status Code可根據不同場景來一起發送
		- error code要搭配適當錯誤訊息，幫助開發人員糾正措施，但別太詳細防止駭客知道太多
		- 400-Bad Request
		- 401-Unauthorized
		- 403-Forbidden
		- 404-Not Found
		- 500-Internal Server Error
		- 502-Bad Gateway
		- 503-Service Unavailable
- 你了解哪些分散式系統架構?
	- 我知道用來maintain以及運行分散是系統的技術，就Kubernetes
- [那甚麼是Software Stack?](https://searchapparchitecture.techtarget.com/definition/software-stack)
	![](https://i.imgur.com/NOpfrAK.png)
	- 是一堆獨立組件的集合，他們協同工作來完成應用程式的執行
	- 這些組件可能包含:OS、協定、runtime環境、Library、DB和Function Call
	- 根據所需運行的應用程式，至少會是OS、DB、支援編寫程式的工具和應用程式
- 那甚麼是Solution Stack?
	- 要開發一款網路應用程式，會需要定義目標OS、網頁server、DB以及語言
	- 或要定義OS、Middleware、DB及應用程式，有時也會將硬體涵蓋在內
	- 舉例:
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
			- Xen或KVM
			- 搭配LVM的Linux
			- DRBD
			- Ganeti
			- Ganeti Web Manager
		- LAMP
			- Linux
			- Apache
			- MySQL/MariaDB
			- Perl、PHP、Python
		- LAPP
			- Linux
			- Apache
			- PostgreSQL
			- Perl、PHP、Python
		- LLMP
			- Linux
			- Lighttpd
			- MySQL/MariaDB
			- Perl、PHP、Python
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
### httpd.conf 設定錯誤
- Syntax Error
	- Linux上需使用 `apachectl -configtest`來檢測Syntax Error
	- Windows系統上的Apache須先到Apache的bin目錄上，然後執行 `httpd.exe -t`
	- 修正問題後重啟Apache並重新透過上述指令做檢查
### Vulenrabilities
- 使用最新版本的Apache
- 使用弱掃工具去檢查
- 隨時查看最新的CVE，並上Patch
### Apache HTTP Server Logs
應分析Apache HTTP Server中的**error logs**，**它提供了有關 Web 服務器上發生的任何錯誤的詳細資訊** 路徑: ` /var/log/apache2/error.log`、`/etc/apache2/apache2.conf`、`/etc/httpd/conf/httpd.conf`

預設會放在Apache安裝目錄中的log目錄中的**error_log**檔案中
也可從httpd.conf中去設定要紀錄哪一類型的錯誤，httpd.conf中有8個log級別的資訊
除了error log以外還提供access log來紀錄Server處理過的所有請求。
這些日誌還可以對可能導致問題的原因提供額外的解釋，還可以補充錯誤日誌中的資訊。

### 使用Mod_log_forensic 模組
`mod_log_forensic`模組用於提供client端請求的**forensic log**
這包含了處理前與處理後的請求，並使用相同ID來引用相同的請求，因此可以輕鬆識別由特定請求引發的任何問題
**可以用來分析哪些請求會導致Web Server崩潰**
若要啟用這個模組，需要在 `Apache httpd.conf`文件中設定:
```=
LoadModule log_forensic_module_forensic.so
LoadModule uniques_id_module modules/mod_unique_id.so
ForensicLog logs/forensic_log
```
也可將 **check_forensic**的bash腳本與 mod_log_forensic模組結合使用，以列出在forensic log中發現任何不完整的請求
`check_forensic <log_file>`

### 使用 mod_whatkilledus module
當事情非常糟糕且Apache Server崩潰時，`mod_whatkilledus`模組可用於紀錄有關崩潰的詳細技術資訊以及導致發生crash的原始client端請求。

此外若啟用了 `mod_backtrace`模組，這將包含顯示故障點的回溯，這對於在滿足某些條件後使用回溯註釋錯誤日誌很有用

對於Unix系統，只有在 httpd建構中啟用了 `--enable-exception-hook` 參數時，這些模組才會起作用。而對於Windows系統則沒有特殊要求
- `mode_whatkilledus` 以及 `mod_backtrace` 的說明文件: https://emptyhammock.com/projects/httpd/diag/quick-start.html
### 使用第三方模組
使用第三方模組可能會導致在安裝Apache HTTP Server時遇到問題
因此應該禁用第三方模組，並檢查問題是否可以重現，若禁用模組可以解決問題則一個一個重起每個模組，以便確定是哪個模組帶來的原因

### 將Apache HTTP Server做為單一process並使用Debug工具
典型的Apache HTTP Server安裝會運行多個process
但如果要troubleshooting最好是以單一process運行
可在啟動apache時候使用X選項
`$ httpd -X` 這可使Apache以單一process模式來啟動，這代表Apache不會去fork出新的chidren或與終端detach
這樣所有流量與通訊都將通過一個單一的process，就能在debugger(ex. gdb)底下運行apache httpd並取得崩潰的bracktace並強制server去行coredump
```
$ gdb httpd
```
接著就是透過gdb先去設breakpoint，然後去做單步追蹤，一行一行看可能錯在哪?
### 腳本執行問題
動態內容通常由 Apache HTTP Server通過 `mod_cgi`模組執行的腳本提供
這個模組包含自己的logging機制用來記錄在腳本執行期間發生的任何錯誤

啟用**ScriptLog**指令後，mod_cgi將記錄任何未按照預期執行的腳本的輸出，包含
Server Response Code，收到的請求以及任何向客戶端發出的任何回應

要啟用此功能需要修改 httpd.conf文件，並指定ScriptLog指令和保存log的位置
`ScriptLog logs/cgi_log`



## [IIS Troubleshooting](https://docs.microsoft.com/en-us/previous-versions/iis/6.0-sdk/ms524996(v=vs.90))


## Server端安全
- Server端有甚麼安全建議?
	- 移除不必要服務
		- 默認安裝有時候會安裝許多不必要的功能ex. 遠端註冊、printer server...etc
		- 服務越多，開放的port就越多，因此會暴露更多風險
		- 關閉server中的非必要服務 
	- 確保遠端存取的保護措施
		- 若web admin需要遠端登入Web server，則需要使用隧道和加密協定來確保遠程連線獲得適當防護 
		- 在設備或軟體上使用安全token 
		- 遠端存取應限制特定數量IP以及帳戶 
	- 分離開發/測試/生產環境
		- 由於開發人員在生產服務器上開發更新版本的 Web 應用程序更容易、更快捷，因此 Web 應用程序的開發和測試直接在生產服務器本身上完成是很常見的。
		- 有可能會在網路上蒐到特定網站的更新版本，或在/test/、/new/或其他類似子目錄底下發現不應該給公眾知道的內容 
		- 所以如果在同台Server上同時開發、測試跟生產，如果權限沒設好而且早期開發階段安全性容易沒做好，容易被打穿網站
	- Web應用內容以及Server Script安全
		- web應用或網站文件應該要位於OS系統文件、log文件以外的獨立分區或driver上
		- 因為如果攻擊者獲得web目錄存取權限，可能就可以透過其他漏洞去做提權並存取整個磁碟上的資料
	- 確保適當權限與特權
		- 始終分配運行特定網路服務所需的最權限
	- 按時安裝所有patch
	- 監控或audit server 
		- 應經常監控和檢查所有網路服務log、網站access log、DB Server log(ex. Microsoft SQL Server、MySQL、Oracle)和OS Log
		- 若log中發現奇怪活動，應該立刻去解決它
	- 用戶帳戶管理
		- 禁用未使用的默認帳戶
		    - `userdel` 指令
		- 每個帳戶要設定它應有的正確權限
	- 刪除未使用的模組和應用程式
		- Apache預設會安裝多預定義的模組 
		- 典型Web Server不會使用這些模組，因此需要關閉，防止針對此類模組的攻擊
	- 使用Network Sever軟體所提供的安全工具
		- Mircosoft 發布許多工具來幫助admin來保護IIS Web Server安裝
		- Apache也有提供 **mod_security**模組
	- 使用外部scanner
		- nessus
		- nikto
		- 或其他弱掃工具
## Log檔案
系統錯誤資訊 - `/var/logs/syslog` 或 `/var/logs/messages`
與登入帳密有關的log - `/var/logs/secure` 或 `/var/logs/auth.loh`(Debian)
紀錄哪個服務的log會被放在哪? - `/etc/rsyslog.conf`，會被放在`/etc/rsyslog.d` 底下
### Syslog等級
![](https://i.imgur.com/GxaNR3I.png)

### Systemcall

## C/C++
- 如果程式中使用malloc但沒有free掉會怎樣?
	- heap memory會一直被占著，直到程式結束，不會自動釋放
