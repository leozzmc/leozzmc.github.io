---
title: 2019 Communications Dept. Graduation Project
description: A record of making my department's graduation project in 2019
toc: true
tags:
  - Arduino
  - IOT
  - NodeMCU
categories:
  - Hands-On Practices
aside: true
abbrlink: "4b76a41f"
date: 2019-07-05 14:50:33
---

> 🌐 中文版：[繁體中文](/posts/4b76a41f.html)

![](https://i.imgur.com/O3Xs5VC.jpg)

## Preface:
Honestly, when first choosing an advisor I didn't think much about it; I just wanted a relaxed one. I remember my thinking was "for our school, prepping for grad school to transfer to a better school ASAP matters more," so I didn't pick a harder topic/advisor, lol. So in the end I found the most relaxed advisor in the whole department, whose project topic was Arduino every year (probably to save money and time, and because it barely needs teaching). 6 project students split into 3 groups of 2.

**"Arduino + App remote control"**, with other topics you package yourself.
Since the tech is simple and the architecture clear, it seemed the competition was about creativity and ideas. One afternoon, my teammate and I were going to buy drinks, and I suddenly had a flash of inspiration: wouldn't it be cool if the bubble-tea cups and drinks on the market could be auto-mixed and wirelessly controlled!!!
So our project, the "Smart Drinks machine," was born.

## Concept
We split the goal into a few parts and solved them one by one:
App + Wifi connection + a method to move the drink + the machine body
Since the method of moving and mixing drinks is key and affects the whole body design, we first designed the drink-mixing method (how to do it, how to design it).

### Dispensing and mixing method:
We planned to use a container to hold the drink ingredients, with a hole in the container's bottom, and a cardboard glued below the bottom, also with a hole, but the container hole and cardboard hole are initially misaligned. A servo motor controls the rotation angle to align the cardboard hole with the container hole, and the contents fall out naturally.

![](https://i.imgur.com/BdtsD1G.jpg)

So with this dispensing method, the container must have a certain height, so the body design must consider this. Predictably, the drink cup must move along the bottom to dispense, and finally add water.

### Movement method:
Design an X/Y axis slide (like the moving bar on top of a claw machine) to let the drink cup move back/forth and left/right.
After roughly planning how to dispense and move, we started designing the body.

### Body design:
We cut and assembled using cheap, eco-friendly pine boards.

![](https://i.imgur.com/7CoF2dM.jpg)

Since we had no woodworking experience, we spent a long time on the woodwork (woodworking has been added to the handyman skill set), lol. Then we built the top dispensing can and servo motor:
- Dispensing can: any can (with a lid), with a hole in the bottom and a hole in the red lid (you can design the hole shape yourself)

![](https://i.imgur.com/gWqliC7.jpg)

Then cut a fan-shaped hole slightly larger than the red lid's hole in a cardboard or foam board, and pass a small screw through the cardboard and container board (for easy rotation)
- Servo motor: fixed on the side of the upper board, glued to the cardboard

![](https://i.imgur.com/Xze3y4W.jpg)

To prevent the container from rotating when the servo motor turns, use hot glue to fix the wire and the dispensing can to the board.

![](https://i.imgur.com/RGGwRKY.jpg)

With that, the dispensing-can structure is basically done; then repeat it 3 times, since we set up 3 dispensing cans.
We started building the most troublesome part, the X/Y axis slide:
Materials: stepper motor x 2, screw shaft x 2 (or just order lead screws online), bearing seat x 4, cable ties, bearings x2, iron rod x 2
Cut suitable wood, drill holes, insert the iron rod and the screw shaft + stepper motor (*before inserting the screw shaft you must insert a bearing to avoid the screw shaft spinning the board out when it turns), and finally insert the bearing seats to carry the X axis; the X axis is done the same way.

<iframe width="820" height="500" src="https://www.youtube.com/embed/atkGcfnsK3A" title="How to Make Homework Writing Machine at home" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

The biggest problem we hit was: the X axis was too heavy to support, so the whole bearing seat would jam and couldn't turn. We later temporarily solved it with a small toy car for support.

![](https://i.imgur.com/gPWebQS.jpg)

> With that, the drink-machine body was also done!!

### Hardware wiring:

![](https://i.imgur.com/KmXl0AO.png)

Components used:

```
- NodeMCU
- Arduino Mega board
- L298N x 2
- 4-channel relay
- 1-channel relay
- servo x4
- stepper motor x2
- submersible pump x2
- power supply (can use multiple battery boxes instead)
```

Idea: the NodeMCU receives commands to control 4 relay switches, each relay connects to an Arduino board's power, each Arduino board corresponds to one drink, with pre-flashed code inside the Arduino; when powered on it automatically runs the dispensing and drink-mixing program.

ps. The figure above only implements one Arduino board.
ps. Each Arduino board must connect to a relay controlling a submersible pump.

![](https://i.imgur.com/u38OXhA.jpg)

The water-pipe position is the drink's start and end point (dispense ingredients, return to position, add water).

![](https://i.imgur.com/hJ1RbRy.jpg)

NodeMCU wiring:
```
- 4-channel relay
- connected to 4 Arduino power jacks respectively
- the 4 Arduino boards each route out the L298N control pins to control the slide's XY axes
- the 4 Arduinos route out other pins to control 4 servo motors
- a certain pin of each of the 4 Arduinos routes out to the submersible pump's signal line.
```
> Watch the voltage distribution

Arduino code:

```c
Arduino code:
#include <Stepper.h>
#include <Servo.h>
#define STEPS 200 //define the stepper motor's steps per revolution
#define WATER 24 //pump motor pin
//steps: how many steps the motor needs for one revolution. If the motor labels the degrees per step,
//divide 360 by that angle to get the needed steps (e.g. 360/3.6=100).
Stepper Y(STEPS, 8, 9, 10, 11);
Stepper X(STEPS, 4, 5, 6, 7);
Servo goal;
int pos;
void setup()
{
 goal.attach(12);
 goal.write(0);
 X.setSpeed(160); // set the motor speed to 140RPM, max 150~160
 Y.setSpeed(160); // voltage 7.5V
 pinMode(WATER,OUTPUT);
}
void loop()
{
 
 // Y.step(17000);//+ inward - outward //cocoa:17000 //milk tea: 17000 //tea: none
 delay(500);
 X.step(-24000);//inward //cocoa:-7500 //milk tea:-20000 //tea: -20000
 delay(1000);
 for (pos = 0; pos <= 120; pos += 1) { //cocoa:140 //milk tea: 40 //tea:120
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

To dispense a drink from the back row, you must first move the Y axis to the back row, then move the X axis to a fixed point, then the servo motor turns to dispense, then move the X axis back to position, move the Y axis to the start position to add water, and finally start the pump to finish.

> The program must adjust the delay times based on the container positions, ingredient-dispensing time, and water amount, and the front row doesn't need to move the Y axis.

NodeMCU code:

```c
#define RELAY1 D7 //CHOCOLATE
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
//chocolate
void relay1(){
 delay(1000);
 digitalWrite(RELAY1,HIGH);
 delay(180000);
 digitalWrite(RELAY1,LOW);
 delay(5000);
 }
//milk tea or coffee
void relay2(){
 delay(1000);
 digitalWrite(RELAY2,HIGH);
 delay(180000);
 digitalWrite(RELAY2,LOW);
 delay(5000);
 }
//tea
void relay3(){
 delay(1000);
 digitalWrite(RELAY3,HIGH);
 delay(145000);
 digitalWrite(RELAY3,LOW);
 delay(5000);
 }
void loop() {
 server.handleClient();
 
 command = server.arg("State"); //command below only changes when the phone changes state
 
 if (command == "L") {
 relay1(); /*chocolate*/
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

Phone side
> I didn't know how to write a mobile app back then :(, so I used the simple MIT App Inventor to make it.

![](https://i.imgur.com/3QvP8RH.png)
![](https://i.imgur.com/qefwDHP.png)
![](https://i.imgur.com/sZfOMW0.png)

## Actual operation
1. Fill the containers with ingredients
2. Fill the water container with water
3. Turn the power supply on
4. Connect the phone to the Wifi AP
5. Open the app and choose the drink you want
6. Wait for the machine to finish

*Overall view*
![](https://i.imgur.com/UOlH6Vp.jpg)

*There's also an LED marquee*
![](https://i.imgur.com/a51d2x3.jpg)

## Closing

This project has many things that could be improved, from equipment selection to motor stability.
Although Arduino really is simple, with enough ideas the possibilities are endless.

## Future development
- The top ingredient cans could be designed to be detachable
- A stirring module could be designed (a DC motor with a popsicle stick or something, lol)
- Waterproofing design
- Redesign the app with Android Studio, for more flexibility
- Directly buy a module combining ESP8266 and a relay (I only found out later this exists)
- Voice recognition, no app needed
- Heater: to brew with both cold and hot water
