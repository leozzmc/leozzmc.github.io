---
title: 2019通訊系畢業專題
description:  紀錄2019年度製作系上畢業專題的過程
toc: true
tags: ['Arduino','IOT','NodeMCU']
categories: [實作紀錄]
date: 2019-07-05T22:50:33+08:00
---
![](https://i.imgur.com/O3Xs5VC.jpg)

## 前言：
老實說一開始選擇教授時，並沒有想太多，只想找涼的教授，我記得當時的考量是 「對我們學校來說還是考研趕快換學校重要」因此沒有挑戰硬一點的主題/教授 XD。所以最後我找了全系最涼的教授，專題主題每年都只定Arduino(原因應該是省錢又省時，也不太需要教)，6個專題生分成3組，每組2人。

**「Arduino + APP 遠端遙控」**，其他主題包裝自己想。
既然技術簡單、架構清楚，看來要比的是創意和想法了~~~。在某一天的午後，我和組員要去買飲料，突然靈機一動，要是市面上手搖杯和飲料都能自動調配和無線操控，應該蠻不錯的喔！！！
因此我們的專題 「Smart Drinks 智慧飲料機」誕生了。

## 概念
我們將想達成的目標簡單分成幾個 part，來一一解決
APP + Wifi連接 + 移動飲料的方法 + 飲料機身
由於移動、調配飲料的方法是關鍵，會影響到整題機身設計
所以我們先設計調飲料方法(怎麼做，怎麼設計)。

### 取料、調配方法:
我們打算透過一個容器來裝載飲料原料，讓容器底部開孔，而底部之下黏一個紙板，紙板也開孔，但容器孔和紙板孔先不對齊，由servo motor來控制旋轉角度，進而使紙板孔和容器孔對齊，內容物則會自然落下。

![](https://i.imgur.com/BdtsD1G.jpg)

所以這種取料方式，容器必須有一定高度，因此機身設計必須考慮這點。那可想而知，飲料杯必須在底部移動，進行取料，最後還要加水。

### 移動方式：
設計 X、Y軸滑台(類似夾娃娃機上方的移動橫桿)，來讓飲料杯進行前後，左右的移動。
在大致規劃好要怎麼取料移動後，著手進行機身的設計

### 機身設計：
透過便宜又環保的松木層板來進行裁切和組裝

![](https://i.imgur.com/7CoF2dM.jpg)

由於沒有過木工經驗，耗費許久時間在木工上(木工已加入工具人skill set內)XD。 接著實作上方的取料罐和伺服馬達：
- 取料罐：隨便一個罐子(有蓋)，將底部開洞，紅色蓋子處也開洞(洞口可自行設計形狀)

![](https://i.imgur.com/gWqliC7.jpg)

接著將紙板或珍珠板開略大於紅色蓋子孔的扇形洞，並透過小螺絲穿過紙板和容器板(以方便轉動)
- 伺服馬達: 固定於上層層版側面，並與紙板相黏

![](https://i.imgur.com/Xze3y4W.jpg)

為了防止servo motor轉動時容器跟著轉動，用熱溶膠固定鐵絲和取料罐在層板上

![](https://i.imgur.com/RGGwRKY.jpg)

這樣取料罐架構基本上就完成了，接著就重複3次，因為我們設了3個取料罐
開始實作最麻煩的X、Y軸滑台：
材料：步進馬達 x 2、螺旋軸 x 2(或直接去網購 絲軸)、軸承座 x 4、束帶、培林 x2、鐵桿 x 2
裁好合適的木頭並鑽孔放入鐵桿和 螺旋軸+ 步進馬達(*放入螺旋軸前須放入培林，避免螺旋軸轉動時將木板轉出來)，最後放入軸承座來乘載X軸，x軸做法同上。

<iframe width="820" height="500" src="https://www.youtube.com/embed/atkGcfnsK3A" title="How to Make Homework Writing Machine at home" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>


我們碰到最大的問題是：X軸太重，難以支撐，因此整個軸承座會卡住，南以轉動，後臨時透過小型玩具車來支撐解決這個問題

![](https://i.imgur.com/gPWebQS.jpg)

> 這樣飲料機身部分也完成了！！

### 硬體接線部分：

![](https://i.imgur.com/KmXl0AO.png)

所用元件： 

```
- NodeMCU
- Arduino Mega板
- L298N x 2
- 4-channel relay
- 1-channel relay
- servo x4
- stepper motor x2
- 沉水馬達 x2
- power supply(可改用多個電池盒)
```

想法：透過NodMCU接收指令來操控4個繼電器開關，每個繼電器又分別接到Arduino板電源，每個Arduino板對應一種飲料，預先燒好的code在Arduino內，電源開啟時則會自動執行取料和飲料調配程式。

ps. 上圖有只有實作一個Arduino板
ps.每個Arduino板必須在連到一個控制沉水馬達的繼電器上

![](https://i.imgur.com/u38OXhA.jpg)

水管的位置會是飲料放置的起始點和終點(取原料回原位加水)

![](https://i.imgur.com/hJ1RbRy.jpg)


NodeMCU 接線:
```
- 4路繼電器
- 分別接到4個Arduino電源孔
- 4個Arduino 板分別將L298N 控制接腳接出來，分別控制滑台XY軸
- 4個Arduino 其他pin 腳接出來控制4個 servo motor
- 4個Arduino 某pin腳出來 接出來到沉水馬達訊號線。
```
> 注意電壓分配

Arduino程式部分:

```c
Arduino程式部分：
#include <Stepper.h>
#include <Servo.h>
#define STEPS 200 //定義步進馬達每圈的步數
#define WATER 24 //抽水馬達腳位
//steps:代表馬達轉完一圈需要多少步數。如果馬達上有標示每步的度數，
//將360除以這個角度，就可以得到所需要的步數(例如：360/3.6=100)。
Stepper Y(STEPS, 8, 9, 10, 11);
Stepper X(STEPS, 4, 5, 6, 7);
Servo goal;
int pos;
void setup()
{
 goal.attach(12);
 goal.write(0);
 X.setSpeed(160); // 將馬達的速度設定成140RPM 最大 150~160
 Y.setSpeed(160); // 電壓7.5V
 pinMode(WATER,OUTPUT);
}
void loop()
{
 
 // Y.step(17000);//+向內 - 向外 //可可:17000 //奶茶: 17000 //茶:無
 delay(500);
 X.step(-24000);//向內 //可可:-7500 //奶茶:-20000 //茶: -20000
 delay(1000);
 for (pos = 0; pos <= 120; pos += 1) { //可可:140 //奶茶: 40 //茶:120
 goal.write(pos); 
 delay(15); 
 }
 for (pos = 120; pos >= 0; pos -= 1) { 
 goal.write(pos); 
 delay(15); 
 }
 delay(1000);
 X.step(22000); 
 // delay(500);
 // Y.step(-17000);
 delay(1000);
 digitalWrite(WATER, HIGH);
 delay(5000);
 digitalWrite(WATER, LOW);
 delay(5000);
//while(1) { }
}
```

如果想要取後排的飲料，就必須，先移動Y軸到後排再移動X軸到定點，接著servo motor轉動取料，再移動X軸至原位，Y軸移至起始位置加水，最後啟動抽水馬達則完畢。

> 程式必須根據容器擺放位置，和原料出料時間，抽水量多寡來調整delay時間，且前排不需要移動Y軸。

NodeMCU 程式碼:

```c
#define RELAY1 D7 //CHOOCLATE
#define RELAY2 D8 // COFFEE
#define RELAY3 D5 // Tea
#include <ESP8266WiFi.h>
#include <WiFiClient.h> 
#include <ESP8266WebServer.h>
String command; //String to store app command state.
const char* ssid = "專題";
ESP8266WebServer server(80);
int counter = 0;
void setup() {
pinMode(RELAY1, OUTPUT);
 pinMode(RELAY2, OUTPUT);
 pinMode(RELAY3, OUTPUT);
Serial.begin(115200);
 
// Connecting WiFi
WiFi.mode(WIFI_AP);
 WiFi.softAP(ssid);
IPAddress myIP = WiFi.softAPIP();
 Serial.print("AP IP address: ");
 Serial.println(myIP);
 
 // Starting WEB-server 
 server.on ( "/", HTTP_handleRoot );
 server.onNotFound ( HTTP_handleRoot );
 server.begin(); 
}
//巧克力
void relay1(){
 delay(1000);
 digitalWrite(RELAY1,HIGH);
 delay(180000);
 digitalWrite(RELAY1,LOW);
 delay(5000);
 }
//奶茶或咖啡
void relay2(){
 delay(1000);
 digitalWrite(RELAY2,HIGH);
 delay(180000);
 digitalWrite(RELAY2,LOW);
 delay(5000);
 }
//茶
void relay3(){
 delay(1000);
 digitalWrite(RELAY3,HIGH);
 delay(145000);
 digitalWrite(RELAY3,LOW);
 delay(5000);
 }
void loop() {
 server.handleClient();
 
 command = server.arg("State"); //只有手機改變state，下面command才會變
 
 if (command == "L") {
 relay1(); /*chocoltae*/
 }
 else if (command == "R") {
 relay2(); /*milk tea */
 }
 else if (command == "I"){
 relay3(); /*tea*/ 
 }
 else if (command == "F"){
 counter ++;
 Serial.println(counter);
 }
}
void HTTP_handleRoot(void) {
if( server.hasArg("State") ){
 Serial.println(server.arg("State"));
 }
 server.send ( 200, "text/html", "" );
 delay(1);
}
```

手機端
> 當時不會寫手機App :(，因此用簡單的MIT AppInventor 來製作

![](https://i.imgur.com/3QvP8RH.png)
![](https://i.imgur.com/qefwDHP.png)
![](https://i.imgur.com/sZfOMW0.png)

## 實際操作
1. 容器填料
2. 裝水容器加水
3. power supply on
4. 手機連到Wifi AP
5. 開啟 APP選擇想喝的飲料
6. 等待機器完成


*整體圖*
![](https://i.imgur.com/UOlH6Vp.jpg)

*還有LED跑馬燈*
![](https://i.imgur.com/a51d2x3.jpg)

## 結語

此專題有很多可以改進的地方，不論是器材的選購以及馬達的穩定度
雖然Arduino真的很簡單，但只要點子夠多還是發展無窮。

## 未來發展
- 上方原料罐可設計成可拆卸式
- 可以設計攪拌模組(直流馬達配冰棒棍之類的XD)
- 防水設計
- APP 改用 Android Studio 設計，比較多彈性
- 直接選購結合 ESP8266和繼電器的模組(後來才知道有這東西)
- 語音辨識，不用APP
- 加熱器：可同時冷、熱水沖泡
