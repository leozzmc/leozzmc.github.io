---
title: 使用 SatNOGS 架設衛星地面站的實作與分析
tags:
  - Satellites
  - SatNOGS
  - Software Defined Radio
categories: 衛星
aside: true
abbrlink: a43171ae
date: 2025-12-11 15:57:18
cover: /img/satnogs/cover.png
---

# Introduction

過去我對一直衛星是如何與地面站通訊這件事充滿興趣，包含，衛星如何被追蹤、地面站如何取得軌道資料(Ex. TLE 還有就是 SDR 接收到的訊號) 如何轉換成可解碼的 IF Frequency等等。

> 因此我決定以 **SatNOGS（Satellite Networked Open Ground Station** 作為切入點，架設一個可以自動排程、追蹤、接收衛星信號的完整 ground station

實作過程讓我對衛星任務運作與Ground Segment有具體的理解

## SatNOGS 介紹

{% note success %}
SatNOGS 是一個全球性的衛星地面站網路，使用者可以： 
**(1)架設自己的 Ground Station** , **(2)加入 SatNOGS 全球 Network** , **(3)接收並上傳衛星觀測資料**
{% endnote %}

其架構包含：
- **SatNOGS Network：** 排程、任務分配、收集結果
- **SatNOGS Client：** 在本地端控制 SDR、rotator、recording
- **SatNOGS DB：** 衛星資料庫（頻率、modulation、TLE 等）

> 官方參考文件
> 　- [Build SatNOGS](https://wiki.satnogs.org/Build)
>　- [Ground Station Setup](https://wiki.satnogs.org/SatNOGS_Setup)

# System Architecture


![](/img/satnogs/arch.png)


在官方文件中可以看到，要建構 SatNOGS 的地面接收站有多種選擇，可以看到上面的 client 端可以是任何使用 Linux 的裝置，而訊號的接收會是使用軟體定義無線電(Software-Defined Radio) 加上訊號放大器，而天線則是可以是指向性或者是全向天線，另外可以選擇是否要加上 rotator。


```
                 +---------------------------+
                 |     SatNOGS Network      |
                 |  - Scheduling            |
                 |  - Observation database  |
                 +------------+-------------+
                              |
                              | (Observation schedule)
                              v
+---------------------+   SatNOGS Client   +------------------------------+
|   Antenna System    | <----------------> |  SDR (HackRF / RTL-SDR etc.) |
+---------------------+                    +------------------------------+
          |                                      |
          | RF signal                             v
          +-------------------------------> IF samples
                                             + decoding
                                             + doppler correction
                                             + waterfall generation

```

說明：
- SatNOGS Network
依據衛星 TLE 與軌道預測，自動分配可用地面站進行觀測（Observation）
- SatNOGS Client
本地端負責控制 SDR、接收訊號、執行 doppler correction、並輸出觀測結果
- SDR 裝置
將天線接收到的 RF 轉成 baseband / IF（取決於設定）
- 天線
決定接收品質（Gain、方向性、Noise等）

>　這部分最關鍵是：
SatNOGS Client 必須依據 TLE 預測天線方向與 doppler correction，才能成功收到衛星信號

**TLE（Two-Line Element set）**包含衛星的軌道參數與對應的 epoch，用來描述衛星在特定時間點的軌道狀態，並作為預測衛星位置與運動的數學模型。所以 SatNOGS client 會根據 TLE 計算衛星在每一時刻相對於地面站的 **方位角（Azimuth）與仰角（Elevation）。** 若地面站配備 rotator，天線即可依據計算結果即時追蹤衛星；即使沒有 rotator，系統仍可判斷衛星何時進入與離開地面站的可視範圍（AOS/LOS）

而在 **Doppler correction** 方面，SatNOGS client 會利用 TLE 推算衛星相對地面站的徑向速度，並依此計算下行訊號的 Doppler 頻率偏移。由於低軌衛星的相對速度極高，頻率偏移可能達數 kHz 以上，因此系統需動態調整 SDR 的接收中心頻率，以確保窄頻下行訊號能持續落在接收頻寬內~

# System Setup

## Environment

{% note info %}
**Hardware**
- Raspberry Pi 4 (8G RAM)
- SDR Device (HackRF One)
- Antenna
{% endnote %}

{% note success %}
**OS/ Software**
- Raspberry Pi OS Bookworm
- Ansible
- SatNOGS client packages
{% endnote %}

我沒有使用 Rotator，我想先用我手邊現有的材料，先兜出一個雛形，之後再選擇性的擴增架構。

## 安裝 OS

> 安裝跟燒錄 image 可以直接參考這份 [文件](https://wiki.satnogs.org/Raspberry_Pi)

可以用 Raspberry Pi Imager：
- 選 `Raspberry Pi OS (other)` → `Raspberry Pi OS Lite (64-bit)`

設定：

- username/password
- timezone / keyboard
- **Enable SSH** 
- Wi-Fi

> 官方文件上有提到目前支援的 Raspberry Pi OS 版本是 bookworm，並建議用 Lite 省資源

安裝完畢後，可以 ssh 連入樹莓派

```shell
ssh pi@raspberrypi.local
```

進去後，要安裝 SatNOGS 的軟體

```shell
sudo apt update && sudo apt -y upgrade
curl -sfL https://satno.gs/install | sh -s --
```

安裝完畢後應該會跳出設定選單，如果沒有可以手動執行下面指令

```shell
sudo satnogs-setup
```
這個指令會去跑 Ansible Runbook 去跑 satnogs-config 容器

![](/img/satnogs/menu.png)


> 這邊的設定不是一次性的，可隨時重跑重新設定

## Basic Configuration

選擇 **Basic Configuration** 進行設定

![](/img/satnogs/basic.png)

在選單裡至少把下面幾個填好（這些是官方 Basic 欄位說明）：

| 設定 | 描述|
|-----|-----|
| `SATNOGS_API_TOKEN` | 你的 Network API token |
| `SATNOGS_STATION_ID` / `LAT` / `LON` / `ELEV` | 站點資訊 |
| `SATNOGS_SOAPY_RX_DEVICE` | 你用什麼 SDR，RTL-SDR:`driver=rtlsdr`, HackRF: `driver=hackrf` |
| `SATNOGS_ANTENNA` | RTL-SDR： `RX`,  HackRF：`TX/RX`| 
| `SATNOGS_RX_SAMP_RATE` | 取樣率。RTL-SDR 常用：`2.048e6`（官方建議） HackRF：`8e6`|

> 上面的 `SATNOGS_API_TOKEN` 跟其他站點資訊，需要你去 SatNOGS Network 註冊帳號並且建立你的地面接收站，之後才能拿到 API Key

另外，這邊有個小技巧：

{% note info %}
**查可用天線**： `SoapySDRUtil --probe 2>&1 | grep Antennas `
**查支援的 sample rates**： `SoapySDRUtil --probe 2>&1 | grep Sample`
{% endnote %}

## Advance Configuration

![](/img/satnogs/advance.png)

進階設定這邊就看個人，像是你有 rotator  就可以在這邊設定對應的 braud rate 跟 port 等資訊。或者你想要變更最終呈現出的 waterfall 的 MAX/MIN Power 也可在此設定。或者你想要調整 Log Level 也可以在這邊調整。但我們這就都先保持預設狀態。

設定完 Exit，系統會套用變更，可能要等幾分鐘

## HackRF Configuration

我的環境會將 HackRF 以 USB 連接上樹莓派，因此要確保 HackRF 是可用的。在設定過程中有反覆遇到的問題就是
- 容器/系統看不到 SoapyHackRF driver
- 看得到 USB 但 權限不對（udev rules / group）

### 安裝 HackRF Soapy module 
> Ref: https://community.libre.space/t/hackrf-with-satnogs-installation-needed/11105

在 Bookworm 上套件名稱可能是 `soapysdr-module-hackrf` 或帶版本號（例如 0.7/0.8），建議這樣做

```shell
sudo apt update
apt-cache search hackrf | grep -i soapy
sudo apt install -y soapysdr-tools hackrf <你找到的soapy-hackrf套件名>
```

安裝後可以在 host 上面進行驗證

```
SoapySDRUtil --probe="driver=hackrf"
hackrf_info
```

### 建 udev rules + plugdev

> 如果 SoapySDRUtil 看得到但 SatNOGS / container 讀不到，十之八九是 udev 權限出事

可以確認 udev rules 一致
![](/img/satnogs/udev.png)

```shell
sudo udevadm control --reload-rules
sudo udevadm trigger
```

接著需要把 satnogs 使用者加到 plugdev

```shell
sudo usermod -a -G plugdev satnogs
```

最後需要 reboot 套用變更

```shell
reboot
```

### 驗證安裝

重啟後，先檢查網路

```
ping -c 3 network.satnogs.org
curl -I https://network.satnogs.org
```

之後確認 satnogs-client 有在跑

```
kevin@kuangsin:~ $ sudo docker ps -a
CONTAINER ID   IMAGE                             COMMAND                  CREATED         STATUS         PORTS     NAMES
727ef9146ce7   librespace/satnogs-client:2.1.1   "satnogs-client"         4 minutes ago   Up 4 minutes             satnogs_satnogs-client
674cf098dbfc   librespace/hamlib:4.5.4           "/docker-entrypoint.…"   4 minutes ago   Up 4 minutes             satnogs_rigctld
```

確認在容器內可以抓到 HackRF

```
sudo docker exec -it satnogs_satnogs-client SoapySDRUtil --probe="driver=hackrf"
```

如果這行能看到 HackRF，就代表 udev 就已經是正確的了


輸出結果

```
######################################################
##     Soapy SDR -- the SDR abstraction library     ##
######################################################

Probe device driver=hackrf
[INFO] Opening HackRF One #0 46d067dc36692347...

----------------------------------------------------
-- Device identification
----------------------------------------------------
  driver=HackRF
  hardware=HackRF One
  clock source=internal
  part id=a000cb3c004b4356
  serial=000000000000000046d067dc36692347
  version=2018.01.1

----------------------------------------------------
-- Peripheral summary
----------------------------------------------------
  Channels: 1 Rx, 1 Tx
  Timestamps: NO
  Other Settings:
     * Antenna Bias - Antenna port power control.
       [key=bias_tx, default=false, type=bool]

----------------------------------------------------
-- RX Channel 0
----------------------------------------------------
  Full-duplex: NO
  Supports AGC: NO
  Stream formats: CS8, CS16, CF32, CF64
  Native format: CS8 [full-scale=128]
  Stream args:
     * Buffer Count - Number of buffers per read.
       [key=buffers, units=buffers, default=15, type=int]
  Antennas: TX/RX
  Full gain range: [0, 116] dB
    LNA gain range: [0, 40] dB
    AMP gain range: [0, 14] dB
    VGA gain range: [0, 62] dB
  Full freq range: [0, 7250] MHz
    RF freq range: [0, 7250] MHz
  Sample rates: 1, 2, 3, 4, 5, ..., 16, 17, 18, 19, 20 MSps
  Filter bandwidths: 1.75, 2.5, 3.5, 5, 5.5, ..., 14, 15, 20, 24, 28 MHz

----------------------------------------------------
-- TX Channel 0
----------------------------------------------------
  Full-duplex: NO
  Supports AGC: NO
  Stream formats: CS8, CS16, CF32, CF64
  Native format: CS8 [full-scale=128]
  Stream args:
     * Buffer Count - Number of buffers per read.
       [key=buffers, units=buffers, default=15, type=int]
  Antennas: TX/RX
  Full gain range: [0, 61] dB
    VGA gain range: [0, 47] dB
    AMP gain range: [0, 14] dB
  Full freq range: [0, 7250] MHz
    RF freq range: [0, 7250] MHz
  Sample rates: 1, 2, 3, 4, 5, ..., 16, 17, 18, 19, 20 MSps
  Filter bandwidths: 1.75, 2.5, 3.5, 5, 5.5, ..., 14, 15, 20, 24, 28 MHz
```



# Observations

設定地面接受站時，你會需要在  [SatNOGS Network](https://network.satnogs.org/) 註冊帳號並且建立你的地面接收站

![](/img/satnogs/network.jpeg)


建立好帳號登入後，可以去主頁選擇 **Add Ground Station**
![](/img/satnogs/add.jpeg)

- General Information: 填基地台名稱跟描述
- Configuration: 會需要填基地台的經緯度跟海拔高度
- Antenna　需要選擇你的天線類別

![](/img/satnogs/antenna.png)

另外的 setting 跟 image 就看個人要不要設定拉。一旦建立完成後你就會獲得 Grounds Station ID，這些會需要填入透過 `satnogs-setup` 來設定在你的 client 端中。

![](/img/satnogs/API.jpeg)
另外，也需要把 API Key 填入你的 client config 當中

## 排程觀測

![](/img/satnogs/schedule.jpeg)

在 SatNOGS Network 中可以在 **Observations > Schedules** 去排程觀測，可以選定想要觀測的衛星，並且選擇 Transmitter 和要用哪個 Ground Station 進行觀測，這裡就選擇自己的 Ground Station 即可，之後可以選定開始跟結束時間，當按下 calculate 時，下面的 Timeline 就會顯示出可被 schedule 的時間，為了方便我都是先 select all 後直接按 Schedule。

排程完畢後，你的 Ground Station 就會在指定的觀測時間進行觀測，然後結果已經出現在你主頁中的 Recent Observations 中找到觀測結果。

![](/img/satnogs/orb.jpeg)


## 觀測結果

本次觀測對象為臺灣的 **福衛7號 FORMOSAT-7（COSMIC-2）** ，Download Link Frequency 為 400.9000 MH（CW）。從 waterfall 圖中可以清楚觀察到一條連續且平滑彎曲的高能量軌跡，代表衛星在通過地面站上空期間，其下行載波頻率隨時間產生明顯的 **Doppler Shift**
![](/img/satnogs/waterfall-1.png)

{% hideToggle 觀測詳細資訊,bg,color %}

![](/img/satnogs/observation_info_1.jpeg)

{% endhideToggle %}

在 **AOS（Acquisition of Signal）** 初期，衛星以高速朝向地面站接近，相對速度為負，使接收頻率偏移至標稱頻率以下。隨著衛星仰角逐漸升高並接近最高點（ `Max Elevation ≈ 78°` ），相對徑向速度趨近於零，頻率偏移亦逐漸回到中心頻率附近。當衛星開始遠離地面站進入 **LOS（Loss of Signal）**  階段，Doppler Shift 方向反轉，接收頻率逐步偏移至標稱頻率以上。

> 此現象與低軌道衛星約 7–8 km/s 的高速運動完全一致，也驗證了 SatNOGS Client 依據 TLE 進行軌道預測與即時 Doppler correction 的正確性。整體頻率軌跡連續且穩定，顯示地面站時間同步、TLE 新鮮度與 SDR 設定皆在可接受範圍內

**這邊中間的亮線是甚麼?** 其實就是衛星的 CW 載波，由於衛星在高速移動，相對速度在變，所以根據 Doppler Shift 公式： $ \Delta f = \frac{v}{c} f_0​$

- $\Delta f$ 代表偏移頻率，單位是 Hz。代表意義會是 **實際接收頻率跟衛星的 Nominal downlink frequency 之差** 也就是 $f_{\text{received}} - f_0$ 
- $v$ 代表衛星相對於地面接收站的速度分量，並不是衛星的總速度，而是 **沿著地面站 ↔ 衛星視線方向的速度分量**
  - 接近你 → $v < 0$（頻率下降）
  - 遠離你 → $v > 0$（頻率上升）
  - 正上方 → $v ≈ 0$
- $c$ 光速，約等於 $3 × 10^8 \text{m/s}$
- $f_0$ 衛星的標稱下行頻率，對於本次觀測來說 $f_0 = 400.900Mhz$ 這個數值來自於衛星規格

> Nominal downlink frequency 通常是衛星文件所定義在理論上的donwlink frequency 但實際情況會有 doppler effect, 衛星跟地面接收站也不會是相對靜止，因此頻率一定會偏移，也就不太可能只在 400.9Mhz 正中央看到載波

這裡可以把觀測到的數字代入驗證，低軌道衛星速度約等於 $v_{\text{orbital}} \approx 7.5 \text{ km/s}$，也藉是 $7500 m/s$

$ \Delta f = \frac{7500}{3 x 10^8} \cdot 4.0009 \times 10^8$ 結果算出的 $\Delta f$ 會約等於 $10022.5$ Hz 也就是 $10$ kHz 跟圖上觀測到的 shift 範圍一致 ( `-10kHz ~ +10kHz`)


## Audio, Text and Metadata

![](/img/satnogs/audio-1.jpeg)

這次觀測接收到的音訊並非可解碼的數位資料，而是 Doppler 位移後的載波訊號轉換至音訊頻段的結果。 **隨著衛星接近地面站，音調逐漸升高，並且會在最高仰角附近達到峰值；隨後在衛星遠離時逐漸降低。** 這種現象與低軌衛星通過地面站時的 Doppler 效應完全一致，顯示 RF 載波追蹤正常。

![](/img/satnogs/data-1.jpeg)

而收到的資料並非有效的遙測封包，應該是 FORMOSAT-7 在該頻率使用 CW beacon，而不是可解碼的數位調變格式，所以只能呈現零星符號，這也代表RF 接收成功，但調變與解碼設定需與衛星規格一致

> 判斷基準：沒有 sidebands、沒有 symbol pattern、沒有 framing 結構。然後是一條非常細、連續、不分裂的亮線，這會是 CW（Continuous Wave） 或 unmodulated beacon 的典型特徵

{% hideToggle Metadata ,bg,color %}

![](/img/satnogs/metadata-1.jpeg)

{% endhideToggle %}

> 觀測使用 HackRF SDR，取樣率為 8 MHz，中心頻率設定為 400.900 MHz，並依據 Space-Track.org 提供的 TLE 資料啟用 Doppler correction


# Results

透過本次實作與觀測，動手搭建簡單的小型地面接收站，並且嘗試觀測並接受低軌道衛星訊號成功，驗證了地面站在低軌衛星通過期間的整體 RF 接收與追蹤能力。 也從 waterfall 圖中可收獲了一條連續且極窄頻的載波軌跡，並且其頻率隨時間呈現平滑的 Doppler 位移，顯示系統已能依據 TLE 正確進行頻率追蹤與 Doppler correction。

雖然接收到的音訊內容並非可解碼的數位遙測資料，而是 Doppler 位移後的載波訊號轉換至音訊頻段的結果，但成功驗證地面站在軌道預測、Doppler 補償與 RF 接收層級的運作，算是符合預期的結果。為進一步提升地面站的觀測能力，未來希望可以加入 Rotator 使天線即時追蹤衛星位置，提升低仰角通過時的鏈路品質和訊號穩定度，另外應該也可以 進一步確認衛星實際使用的調變方式與 framing 規格，設定對應的 demodulator 與 decoder，嘗試解碼實際遙測資料。

---

