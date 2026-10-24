---
title: 開箱+基本設定 | 入坑 Meshtastic 開源專案 | Meshtastic 系列
tags:
  - Meshtastic
categories: 實作紀錄
aside: true
abbrlink: '34e84285'
date: 2025-07-13 14:52:52
cover: /img/mesh/cover.jpg
---

> 🌐 English version: [English](/en/posts/34e84285.html)


![](/img/mesh/banner.png)

{% note info %}
🔋 **基本介紹：** https://hackmd.io/@BASHCAT/S1m_x-AOA/%2FUAmGpkIzQy-Fc5xKmcyBtQ
🔋 **Official Web Page:** https://meshtastic.org/docs/about/
🔋 **Useful Videos:** 
- https://youtu.be/6hW40yaj3x4?si=rGFPADhNIWfiZnL8
- https://youtu.be/x99R78fkSg0?si=cU1XbtR8HUWploHr

🔋 **FB- 臺灣鏈網**  https://www.facebook.com/groups/meshtastictw/about
🔋 **Reddit 討論串**  https://www.reddit.com/r/meshtastic/
{% endnote %}


# 什麼是 Meshtastic?

基於 **[LoRa](https://zh.wikipedia.org/zh-tw/LoRa)** 的無線通訊技術的開源專案，可以透過LoRa相關設備透過 LoRa 協定進行低功耗遠距離的無線訊號傳輸，並且不仰賴現有的行動通訊架構，適合類似 **緊急備援用的通訊系統，或是山區救援通訊。**

藉由 Meshtastic 節點，訊息由設備發送出，只要抵達其他節點，消息就可以轉送到其他節點上。


另外，台灣目前 (2025/07/13) 已經有許多節點由民間自行建立，低成本並且門檻並不高，還不需要像手持無線電一樣考取證照

![](/img/mesh/nodes.png)

# 設備購買

我觀察不論是台灣鏈網或是Redit上大多都是以 Heltic 的 v3 作為入門選擇，但好像功耗也是常被人詬病的一點，後來我選擇購買了「貌似」較為節省功耗的 Heltic T1114v2 作為初始入門的版子 (還不確定這選擇正不正確)，我是直接從 Heltic 官方賣場買的，順便附上 [賣場連結](https://heltec.cashier.ecpay.com.tw/product/000000000781598) 但也是有人選擇從掏寶購買，這就看個人選擇了~。

> https://www.reddit.com/r/meshtastic/comments/1ewbtgy/heltec_mesh_node_t114_first_look/


# 開箱 Heltic T114

我是一次就買了板子+天線以及轉接線材 (但後來爬文看普遍大家都會換更好的天線跟SMA轉接線)，並且還有GPS模組 (但聽說掏寶上的真的沒那麼貴?)

![](/img/mesh/heltec.jpg)

欣賞完畢後，在正式燒錄韌體之前，養成好習慣，務必要先把天線插在板子上，射頻設備在沒有天線的時候開機或運作有機會損壞元件。將 Heltec T1114 插上轉接線以及原廠附贈的天線後，就可以插上電源進行韌體燒錄了。

# 燒錄韌體
{% note warning %}
請選擇具有資料傳輸功能的USB Type C 線，而不要使用僅有充電功能的傳輸線
{% endnote %}

每個板子的韌體不一樣，這裡可以透過 Meshtastic Web Flasher 根據板子型號提供不同版本的韌體

> Web Flasher: https://flasher.meshtastic.org/

當你插上 T114後，進入Flasher頁面後，首先你需要選擇你的板子，我這裡就選擇 **Heltec Mesh Node T114**
![](/img/mesh/flash.png)

韌體選擇方面，建議選擇穩定版本 (Beta) 中的最新 release，Aplha 版本的韌體大多應該還在開發測試。之後就可以點擊 **Flash**
![](/img/mesh/flash-2.png)

這裡會跳出一個畫面，會要你點選 **Enter DFU mode** 這個行為會讓你的Heltec T114 進入燒寫模式，或者也可以手動連續按兩下 T114 的 RST button，另外在你的本地端電腦也會有新的drive
![](/img/mesh/flash-3.png)

進入DFU mode 的T114 會像下圖一樣
![](/img/mesh/heltec-2.jpg)

此時點選 Web Flasher 中的 **Download UF2** 這時候韌體的檔案會被下載到本機的下載(Download) 目錄，此時只需要簡單將韌體檔案直接複製到 Heltec Drive目錄就好，可以用手動拖曳或者是用linux command `cp` 過去都行，**但是不論哪個平台我嘗試，複製到快到結束時 Drive 會度彈出，然後 Windows/Linux 可能會跳錯誤訊息，這時候還不用急著troubleshooting，先去確認韌體是否成功燒錄！**

![](/img/mesh/heltec-3.jpg)

此時用 Meshtastic 的app 去連接 heltec t114 結果是成功的，因此韌體其實是有成功燒錄的，只不過可能燒錄結束的handling 沒做好。

# 基本設定

這裡我是選擇下載Android 版本的 [Meshtastic App](https://meshtastic.org/docs/software/android/installation/)，後面app的設定基本上是參照這兩份資源：

> https://hackmd.io/@BASHCAT/S1m_x-AOA/%2F5Vy7EE6dQL2v_XHPkbSKtw
> https://youtu.be/6hW40yaj3x4?si=-UTeOGxNK6JHDrnQ

初次連結藍芽時，會需要在手機上輸入Heltec T114 面板上面顯示的pin碼進行配對，後續就等配對成功就可以透過App遠端設定板子

剛入坑的朋友應該不用調整太多東西，首先根據國家去設定你的 Region，這裡就設定成「TW」，而臺灣能夠使用的頻率範圍會是 ，可以在最底下頻率指定 配置時選擇區域為 **923.875Mhz**

接著，可以開始去掃描台灣鏈網社群的 QR Code 就可以加入 channel 在社群的 SignalTest 頻道來去測試是否能夠收發訊號。但在那之前，如果訊息都收度不到也發佈出去！先檢查天線跟轉接線，這裡建議不要使用原廠提供的轉接線跟天線，可以自己去買好一點的轉接線跟天線。這裡爬文社群好像幾乎都推使用 TX915 天線，這裡也可以參考官網的天線支援列表
https://meshtastic.org/zh-TW/docs/hardware/antennas/

{% note info %}
另外如果有測試其他天線，也可以貢獻到這個GitHub Repo: https://github.com/meshtastic/antenna-reports
{% endnote %}

轉接線的部分可以去今華電子購買: **[IPEX-SMA 母頭母針連接線](https://jin-hua.com.tw/page/product/show.aspx?num=31134&lang=TW)**

> 下一篇會詳細講 App 設定 !!

一旦設定完成就可以像這樣在channel發送訊息

{% hideToggle Meshtastic App 截圖 ,bg,color %}
![](/img/mesh/heltec-6.jpg) 
![](/img/mesh/heltec-7.jpg)

{% endhideToggle %}



