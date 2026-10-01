---
title: When Throughput Numbers Lie：在 650ms 延遲下重新校準 HDTN/STCP 的量測方法
tags:
  - HDTN
  - DTN
  - Bundle Protocol
  - Networking
  - Debugging
  - Space Networking
categories:
  - Space Infrastructure
aside: true
toc: true
abbrlink: 3ddce457
date: 2026-06-30 14:25:13
top_img:
cover:
---


> 這篇不是一篇「我跑出了延遲對 throughput 的影響曲線」的實驗報告。這篇是一份「我跑出了一個看起來很精確的數字，然後花了一整輪排查才搞懂這個數字到底有沒有意義」的工程筆記

<!-- more -->

## 起點：一個太精確的數字

延續上一篇 [HDTN Lunar Throughput Lab](#) 的實驗，在做 Phase 1 的延遲矩陣測試時，我跑了一組 650ms 模擬延遲的測試，姑且稱它 **B2**。這不是完整的地月單程光行時間（地月 one-way light time 約 1.3 秒），而是先用半個地月單程尺度的高延遲條件，作為 Phase 1 delay matrix 的中間測試點

設定很單純：

```text
delay = 650ms（套在 loopback `lo`）
convergence layer = STCP
bundle size = 1MiB
bundle-rate = 0（盡可能快）
pipeline window = 800（maxNumberOfBundlesInPipeline）
```

跑完之後，bpsink 的 log 裡反覆出現這一行：

```text
Payload Only Rate: 1.6777 Mbits/sec, Total Rate: 1.6777 Mbits/sec, Bundles/sec: 0.2000
```

**幾乎每一筆都是 1.6777**，連續看了幾十行，數字精確到小數點後四位都不太變。

> 📸 *[截圖建議：bpsink log 裡這一串重複的 `1.6777 Mbits/sec` 畫面，
> 用紅框標出至少 10 行以上重複的部分，視覺上呈現「太規律」的感覺]*

這時候我的第一直覺就是：這個數字怎麼這麼穩定？穩定到不像是真實網路環境下該有的樣子。

稍微算一下：

```text
1 MiB × 8 bits / 5 sec ≈ 1.6777 Mbit/s
```

這裡的意思是，這個速率剛好對應「每 5 秒送達 1 個 1MiB bundle。這不是巧合範圍內的數字，這是一個**精確到看起來像是被什麼東西卡住節奏**的數字

這邊也去另一邊查證，結果更詭異：

```text
bpgen 端：totalBundlesSent = 811，totalBundlesAcked = 811
bpsink 端：Rx Count = 88
```

bpgen 說它送出並且被確認了 811 個 bundle，但 bpsink 只收到 88 個， **這中間差了將近 10 倍**

> 所以這篇文章記錄接下來的排查過程——包括幾次我自己下錯結論、又被推翻的轉折。


## 第一輪懷疑：是不是我的測量工具本身有問題

遇到異常數字，第一件事不是急著解釋「為什麼會這樣」，而是先確認「我量到的東西本身可不可信」

> 這邊還是保持先假設再驗證的態度來推論

### 懷疑 1：這只是平均值的數學假象？

`Total Rate` 這個欄位會不會其實是「從程式開始累積到現在」的平均值，而不是「這一個取樣窗口」的瞬時值？如果是 cumulative average，長時間運行下數字趨於平緩，那 1.6777這種穩定性就不奇怪了～

這邊直接去翻 HDTN 的原始碼：

```cpp
void BpSinkPattern::TransferRate_TimerExpired(const boost::system::error_code& e) {
    if (e != boost::asio::error::operation_aborted) {
        boost::posix_time::ptime finishedTime = boost::posix_time::microsec_clock::universal_time();
        const uint64_t totalPayloadBytesRx = m_totalPayloadBytesRx;
        boost::posix_time::time_duration diff = finishedTime - m_lastPtime;
        const uint64_t diffTotalPayloadBytesRx = totalPayloadBytesRx - m_lastPayloadBytesRx;
        // ...
        double payloadRateMbps = (diffTotalPayloadBytesRx * 8.0) / (diff.total_microseconds());
        // ...
        m_timerTransferRateStats.expires_from_now(boost::posix_time::seconds(5));
    }
}
```

答案很明確，可以看 `payloadRateMbps` 那行，這是 **「這次跟上次 timer 觸發之間的差值」除以「真實時間差」** ，也就是說這是 interval rate，不是 cumulative average，並且Timer 固定每 5 秒觸發一次， 因此 **懷疑 1： 不成立**

> 📸 *[截圖建議：上面這段 HDTN 原始碼，可以截 GitHub 上 `BpSinkPattern.cpp`
> 的畫面，框出 `expires_from_now(boost::posix_time::seconds(5))` 那行]*

### 懷疑 2：是不是網路層的 `tc netem` 把封包搞丟了

```bash
$ tc -s qdisc show dev lo
 qdisc netem 8003: root refcnt 2 limit 1000 delay 650ms
 Sent 945059262 bytes 21560 pkt (dropped 0, overlimits 0 requeues 0)
 backlog 0b 0p requeues 0
```

`dropped=0`，`overlimits=0`，`backlog=0`，看起來很乾淨，因此 **懷疑 2 不成立**

### 懷疑 3：是不是 Security Group 擋住了什麼

這個猜測一度浮現，但其實一秒就能排除——bpgen、HDTN、bpsink 三個 process 全部在
同一台 EC2 上，彼此用 `127.0.0.1` 互相溝通，根本不會經過任何網卡，Security Group
只管制進出 instance 邊界的流量，對 loopback 完全不起作用，所以**懷疑 3 不成立**

### 懷疑 4：contact plan 裡 `rateBitsPerSec: 0` 是不是代表「速率為 0」

HDTN 的 log 裡有一行很可疑：

```text
[ egress ][ info ]: setting rate to 0 bps for new contact
```

`0 bps` 聽起來就像是「不允許任何流量」。但如果這是真因，那為什麼我之前 0ms 延遲的
baseline 測試（代號 C1，成功傳輸了 56,979 個 bundle、近 60GB 資料）也是用一模一樣
的 `rateBitsPerSec: 0` 設定卻可以傳成功？

回頭查 C1 的 log：

```bash
$ grep "setting rate" C1_hdtn.log
[ egress ][ info ]: setting rate to 0 bps for new contact
```

C1 也有同一行，而且 C1 傳輸完全正常，因此**懷疑 4 不成立**，代表在這個 `0` 在這個語境下
應該是代表「無限速率」的語義，並不是「停止傳輸」

> 這個排查順序本身值得記下來：差點因為一行看起來可疑的 log，就直接動手改設定，
> 幸好先跟成功案例對照，才沒有改錯方向～

## 第二輪：問題其實出在我的測量腳本

連續排除四個假說之後，就開始懷疑是不是我自己寫的測試腳本有問題

### `bundle-rate=0` 跟 `--duration` 差異

bpgen 的 `--duration` 參數，我原本以為它控制的是 **整個測試跑多久**，但實際上它只控制**產生新 bundle 的時間窗口** ， `--bundle-rate=0` 代表 **盡可能快地發送** ，所以在 duration 還沒到之前，bpgen 會立刻把整個 pipeline window（這次設定是 800）塞滿

而 duration 一到，bpgen 並不會立刻退出——它要進入 `StcpBundleSource` 的 ddestructor，逐一等待這 800 個還在飛行中的 bundle 被 TCP 確認：

```text
StcpBundleSource destructor waiting on 800 unacked bundles
StcpBundleSource destructor waiting on 799 unacked bundles
StcpBundleSource destructor waiting on 798 unacked bundles
...（在 650ms 延遲下，這個過程實測超過 5 分鐘）
```

> 📸 *[截圖建議：終端機裡這串 `destructor waiting on N unacked bundles`
> 持續滾動的畫面，可以截一段顯示數字緩慢遞減、配合終端機左上角時間戳記，
> 呈現「這個過程真的很久」的感覺]*

而我原本的測試腳本，是用 **前景（沒有背景 `&`）執行 bpgen**，也就是說，整個腳本會卡在這一行，直到 bpgen 完全退出才會往下執行（停止 bpsink、停止 HDTN。 這代表：bpsink 在這整段 **bpgen 已經停止生成新資料，但還在排空舊資料** 的期間，完全沒有被關閉，持續記錄著它陸續收到的稀疏資料

當時比較合理的懷疑是：這些 `1.6777 Mbit/s` 樣本可能主要來自 bpgen 停止生成新 bundle 之後的 STCP drain phase，而不是單純的 60 秒 generation window 內的 穩定 throughput。 

這個判斷後來被 B2-r2 修正：`fixed positive-interval cadence` 並不能只用 **舊 harness 被 drain phase 污染** 來解釋。即使用修正後的 harness 乾淨重跑這個現象仍然會重現（後面會詳述）

### 第二個語義陷阱：acked不是真的收到了

`bpgen totalBundlesAcked = 811`，這個數字一度讓我以為811 個 bundle 都已經確認送達，但回頭查 STCP 的原始碼：

```cpp
void StcpBundleSource::HandleTcpSend(const boost::system::error_code& error,
                                      std::size_t bytes_transferred,
                                      TcpAsyncSenderElement* elPtr) {
    if (error) {
        // ...
    }
    else {
        // ...
        m_totalBundlesAcked.fetch_add(1, std::memory_order_relaxed);
        // ...
    }
}
```

`m_totalBundlesAcked` 是在 STCP source 端的 **TCP async write completioncallback** 裡遞增的。也就是說，它比較接近**source 端認定這次 TCP writeoperation 已完成** ，而不是 **接收端 bpsink 應用層已經解析並處理完這個 bundle**


所以更保守、也更正確的說法是：

{% note info %}
bpgen / HDTN egress 的 `totalBundlesAcked`不能直接當作 application-layer delivery confirmation，真正的 delivered bundle 數量，應該以 BPSink 的 `Rx Count` 和 `Total bytes Rx` 為準
{% endnote %}

而且，811 跟 88 從一開始就不應該被假設相等，因為這邊衡量的是兩個不同的協定層

> 📸 *[截圖建議：這段 `StcpBundleSource.cpp` 的程式碼截圖，框出
> `m_totalBundlesAcked.fetch_add` 那一行]*


## 重寫測量工具：給 bpgen 一個明確的時間邊界

找到root cause之後，下一步不是再跑一次看看，而是先把測試腳本本身修正，否則同樣的問題會在後面每一組延遲測試裡重複發生

修正後的腳本（內部稱為 `v4 harness`）做了這幾件事：

```bash
timeout --kill-after="${KILL_GRACE_SEC}s" "${BPGEN_WALL_TIMEOUT_SEC}s" \
  "${BPGEN_BIN}" \
    --bundle-size="${BUNDLE_SIZE_BYTES}" \
    --bundle-rate="${BUNDLE_RATE}" \
    --duration="${DURATION}" \
    # ...
```

- 用 GNU `timeout --kill-after` 給 bpgen 一個明確的 wall-clock 執行上限，不再讓它無限期卡在排空階段
- 加上 `timeline.tsv`，記錄每個關鍵階段（HDTN 啟動、bpsink 啟動、bpgen 開始 / 結束、drain 開始/結束）的精確時間戳
- 加上 `metadata.json`，記錄這次測試的真實參數與結束狀態（包括 bpgen 是正常結束還是被強制 timeout）
- 加上 `trap cleanup`，確保任何中斷（Ctrl-C、timeout、錯誤）都不會留下背景orphan process
- 新增 `BUNDLE_RATE`、`PAYLOAD_BYTES` 兩個可調參數，讓 **驗證腳本本身有沒有bug** 跟 **測試 HDTN 在高壓環境下的真實行為**這兩件事可以分開

### Smoke Test 也踩了一輪坑

修好腳本之後，第一件事是先驗證腳本本身能不能正常運作，而不是直接衝回 650ms延遲的高壓測試，但過程中， **第一版 smoke test 本身就設計錯了** ——沿用了主實驗的高壓參數 （`bundle-rate=0`、1MiB payload、window=800），結果即使只跑 5 秒，也立刻把 pipeline 塞滿、卡進跟 B2 一模一樣的排空地獄

> 這是這輪排查裡我自己犯的一個方法論錯誤：smoke test 的目的是驗證「工具本身正不正常，不該把「待驗證系統在高壓下的真實行為」這個複雜變數也捲進來

調整成低壓參數（`BUNDLE_RATE=1`、payload 降到 64KiB）之後，才真正拿到一組乾淨的 smoke baseline：

```text
SMOKE-light       (0ms 延遲)：bundle_count=6=Rx Count=6，exited_normally，28.9 秒
SMOKE-light-delay650 (650ms 延遲)：bundle_count=6=Rx Count=6，exited_normally，79.1 秒
```

> 📸 *[截圖建議：`SMOKE-light` 跟 `SMOKE-light-delay650` 兩組 `metadata.json`
> 並排截圖，或做成一張簡單對照表的截圖，凸顯兩者都是 `exited_normally`
> 且數字完全對帳]*

兩組都在合理時間內乾淨完成，證實 harness 機制本身沒有問題——前面所有的失敗，都是 **smoke test 的 workload 設計不合理**，不是腳本邏輯的 bug


## B2-r2：用乾淨的工具重新面對同一個異常

工具確認沒問題之後，終於可以回去面對最初的問題：用修正後的 harness，重跑一次跟 B2 完全相同的設定（650ms delay、STCP、window=800、1MiB bundle），這次代號**B2-r2**

並且這次給了足夠的緩衝時間（`BPGEN_GRACE_SEC=300`），讓 bpgen 有機會真正自然結束，而不是被強制砍斷

結果：

```text
bpgen_exit_status = exited_normally    ← 沒有被 timeout 打斷
HDTN egress totalBundlesSent  = 25
HDTN egress totalBundlesAcked = 25
bpsink Rx Count                = 25
bpsink Total bytes Rx          = 26214400
```

bpgen 也以 `exited_normally` 收尾，整個過程沒有被 timeout 強制打斷。

**25 = 25 = 25，HDTN 與 bpsink 端完全對的起來！** 這是這一整輪排查以來，第一次在「有延遲」的條件下拿到完整、未被中斷的數據～

> 📸 *[截圖建議：B2-r2 的完整對帳結果，可以做成一張簡單的流程圖或表格截圖：
> bpgen → HDTN → bpsink，每個節點標上對應的數字，視覺化呈現「全部一致」]*

然後，那個熟悉的數字又出現了——這次 bpsink 記錄了 25 筆 positive rate 樣本，**幾乎全部都是約 1.6777 Mbit/s**（其中一筆因計時精度顯示為 `1.6776`），都對應到約 1 個 1MiB bundle / 5 秒 reporting interval

這次的意義不一樣了，原本的 B2 可能被質疑 **是不是被 timeout 提前打斷才看起來怪**， 但 B2-r2 是一次完整、乾淨、未受干擾的測試,**這個固定速率，是真實存在、可重複出現的現象**，不是某種測量假象

### 但我自己又差點把結論講得太滿

第一次看到 B2-r2 的結果時，我寫下的結論是 **整個測試從頭到尾、每 5 秒精確交付 1 個 bundle**，這句話被我自己的 timeline 資料打臉

```text
bpgen 階段時長：約 195.4 秒（理論上對應約 39 個 5 秒窗口）
整場 wall-clock：264.6 秒（理論上對應約 53 個 5 秒窗口）
實際記錄到的 positive 樣本：25 筆
```

53 個理論窗口，只有 25 筆有記錄。回頭查 `TransferRate_TimerExpired()` 的程式碼，這個 timer **只在「跟上次相比有任何位元組變化」時才會印出 log**，沒有任何新資料抵達的窗口會被直接跳過、什麼都不留。

也就是說，整場測試裡有相當數量的 **完全沒有任何 bundle 送達** 的這種靜默窗口被我忽略了，比較精確的描述應該是：

> 在這次 650ms 延遲的 STCP 測試中，**每一個有記錄到的 positive deliveryinterval，恰好都送達 1 個 1MiB bundle**；同時測試期間存在數量相當的靜默窗口，這代表傳輸呈現某種**間歇性**模式，不是穩定連續的「每 5 秒 1 個」

> 📸 *[截圖建議：可以做一張簡單的時間軸示意圖（不一定要截圖，用 Visualizer
> 畫一張），橫軸是時間，標出 25 個有資料的窗口跟中間的靜默窗口，視覺化呈現
> 「間歇性」這個概念]*

機制本身到現在還沒有答案。可能跟 STCP 的 send/receive buffer 行為、TCP 在loopback netem 延遲下的反應，或 HDTN 內部 event loop 的某種交互有關，總之本文章目前不知道答案，先留個懸念好了

### 阿 B2-r2 到底證明了什麼，又沒有證明什麼

B2-r2 證明了幾件事：

- 1.6777 Mbit/s 的 fixed positive-interval cadence 可以在 clean harness 下重現
- 這不是原始 B2 被 timeout 打斷才產生的假象
- 這也不是 `tc netem` drop 或 Security Group 造成的現象
- HDTN egress 與 BPSink 的 final accounting 是可以對起來的

但 B2-r2 沒有證明：

- STCP 的理論吞吐量就是 1.6777 Mbit/s
- 整場測試每 5 秒都送達 1 個 bundle
- 這是 HDTN 設計上的預期行為
- 機制已經被完全解釋

嚴格來說，B2-r2 可以確認的是現象真實存在、可重複，但不是說現象的成因已知


## 一個數字不該只是一個數字：拆開三種 Goodput

排查到這裡，還有最後一個陷阱：`1.6777 Mbit/s` 這個數字，原本被我直接塞進 `summary.csv` 的 `hdtn_goodput_mbps` 欄位裡，當成這組實驗的代表性吞吐量，但這其實混淆了三種完全不同的東西：

| 指標 | 算法 | B2-r2 數值 | 代表的意義 |
|---|---|---|---|
| Positive interval rate | bpsink positive 樣本平均 | 1.68 Mbit/s | 有 bundle 抵達的 5 秒 reporting windows 中，平均每個 window 的 payload rate |
| Generation-window delivered goodput | 送達 bytes ÷ 設定的 generation duration（60s） | 3.50 Mbit/s | 以測試設定的 generation window 作為比較分母，**不代表 bundle 都在這 60 秒內完成 delivery** |
| Wall-clock delivered goodput | 送達 bytes ÷ 真實總耗時（264.6s） | 0.79 Mbit/s | 以使用者實際等待的整場 wall-clock 作為分母 |

三個數字差了超過 4 倍，如果之後要拿這組數據去跟其他延遲設定比較，用錯任何一個都會讓整個對比失真

> 📸 *[截圖建議：上面這個表格直接截圖，或做成一張簡單的長條圖比較三個數字
> 的差距，視覺上強調「同一筆數據能講出三種不同的故事」]*

`parse_results.py` 後來也照這個邏輯重寫，把單一欄位拆成三個獨立的指標，並且自動標記任何被 timeout 打斷的測試結果為 `INCOMPLETE_LOWER_BOUND`，不會再被誤用成乾淨的測量值


## 這輪排查留下的東西

回過頭看，這篇文章記錄的不是一組漂亮的延遲對 throughput 影響曲線，這邊目前還沒有因為實驗還沒結束，但文章留下來的是，可能幾個之後每一組延遲測試都要記住的規則：

- **`--duration` 不等於整場測試的時長**：如果 outduct 排空時間很長，腳本的
  真實執行時間可能遠超預期，必須給測試工具一個明確的 wall-clock 上限
- **不同協議層級的「已確認」計數器不能假設相等**：STCP 的 `totalBundlesAcked`
  只代表 TCP 層確認，不代表應用層真正處理完成
- **被中斷的測試結果只能當下限參考**：任何 `timeout_killed` 的結果都該被明確
  標記，不能混進正式的對比數據裡
- **同一份原始數據可以算出好幾種語義不同的速率**：要先想清楚自己真正想回答
  的問題是什麼，再決定用哪一個分母

下一篇會回到 Phase 1 矩陣本身，用這次修正後的工具，重新挑戰 1300ms 延遲與更高
丟包率的測試組合，之後至少不會再被一個看起來太精確的數字騙過去

---

*完整的排查記錄與原始碼比對細節，可以在
[hdtn-lunar-throughput-lab](https://github.com/leozzmc/hdtn-lunar-throughput-lab)
repo 的 `docs/limitations.md` 第 9、10 節與
`docs/analysis/b2-r2-debugging-case-study.md` 找到。*

<!-- TODO: 確認上面 repo 連結網址正確，並把開頭「上一篇」連結換成實際 URL -->