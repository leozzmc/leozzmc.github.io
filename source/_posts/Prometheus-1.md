---
title: Proxmox VE 叢集部署 Promethues 以及 Grafana
tags:
  - Promethues
  - Proxmox VE
  - Infrastructure
categories: 實作紀錄
aside: true
abbrlink: a6822388
date: 2025-02-11 10:33:03
cover: /img/Prometheus/cover.png
---


# 前言

在以前建立的 Proxmox VE 從集中，需要定期搜集GPU 功耗資訊作為腳本的判斷依據，因此需要 Promethues 進行資訊搜集。


# 節點背景資訊

{% note info %}
IP CIDR: `172.25.166.139/24`
CPU(s) 4 x Intel(R) Core(TM) i3-8100 CPU @ 3.60GHz (1 Socket)
Kernel Version Linux 6.8.4-2-pve (2024-04-10T17:36Z)
{% endnote %}

# 安裝 Promethues


建立 Promethues 使用者

```
sudo groupadd --system prometheus
sudo useradd -s /sbin/nologin --system -g prometheus prometheus
```

建立 Promethues 必要目錄

```
mkdir /var/lib/prometheus
for i in rules rules.d files_sd; do mkdir -p /etc/prometheus/${i}; done
```


在 `tmp` 建立暫時用的目錄 `prometheus` 用於下載檔案，並下載最新版本的 Prometheus

```
mkdir -p /tmp/prometheus && cd /tmp/prometheus
curl -s https://api.github.com/repos/prometheus/prometheus/releases/latest \
  | grep browser_download_url \
  | grep linux-amd64 \
  | cut -d '"' -f 4 \
  | wget -qi -
```

解壓縮檔案、移動設定檔、操作完後刪除暫時用的目錄

```
tar xvf prometheus*.tar.gz
cd prometheus*/
mv prometheus promtool /usr/local/bin/
mv prometheus.yml  /etc/prometheus/prometheus.yml
mv consoles/ console_libraries/ /etc/prometheus/

cd ~/
rm -rf /tmp/prometheus
```

建立 systemd 設定檔

```
sudo tee /etc/systemd/system/prometheus.service<<EOF

[Unit]
Description=Prometheus
Documentation=https://prometheus.io/docs/introduction/overview/
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecReload=/bin/kill -HUP $MAINPID
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=0.0.0.0:9090 \
  --web.external-url=

SyslogIdentifier=prometheus
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

透過 `chown` 將剛才建立所有目錄的 owner 設定成 Prometheus

```
for i in rules rules.d files_sd; do sudo chown -R prometheus:prometheus /etc/prometheus/${i}; done
for i in rules rules.d files_sd; do sudo chmod -R 775 /etc/prometheus/${i}; done
sudo chown -R prometheus:prometheus /var/lib/prometheus/
```

接著就能載入 Prometheus 設定檔，並啟動Prometheus 服務以及開機服務

```
sudo systemctl daemon-reload
sudo systemctl start prometheus
sudo systemctl enable prometheus
```

> 做到這步驟，透過瀏覽器存取節點得 9090 port 應該就可以存取到 Promethues 的頁面


![](/img/Prometheus/prometheus-1.jpeg)


# 安裝 Prometheus Exporter

> Prometheus Exporter 主要用於在節點上主動將節點資訊導出到特定的 Service 上來讓 Prometheus進行存取。因此這邊需求是在叢集中每個節點都需要安裝


```
apt install python3 python3-pip
pip3 install prometheus-pve-exporter --break-system-packages
```

這裡使用 `--break-system-packages` 的原因在於，PVE預設啟用了 `PEP 668`，這會限制你在全域環境中使用 `pip3` 安裝 Python 套件，因為這表示這個 Python 環境是由系統管理的。透過這個參數可以繞過這項限制。


之後要建立認證檔，讓 prometheus-pve-exporter 可以登入 PVE，這裡的認證方式是使用 Proxmox VE 中的 API Token，還沒建立的話需要事先建立

```
sudo tee /etc/prometheus/pve.yml<<EOF

default:
  user: "root@pam"
  token_name: "<YOUR TOKEN NAME>"
  token_value: "<YOUR TOKEN VALUE>"
  verify_ssl: false
  port: 8006

EOF
```

可以前往 `http://<Service IP>:9221/pve` 確認是否可以取得系統資訊，並且也可以前往 Prometheus 的 dashboard 查看 target health

![](/img/Prometheus/pro-2.png)



{% hideToggle  建立 API Token ,bg,color %}

在 Proxmox 網頁界面中，創建一個 API Token。

1. 進入用戶管理 (`Datacenter` → `Permissions` → `API Token`)。
2. 為某個用戶創建 Token，並分配適當的權限（例如 Read-Only）
3. 記錄 `Token-ID` 和 `Token-Secret`。

![](/img/Prometheus/apiToken.png)


{% endhideToggle %}

接著建立  systemd 的設定檔，方便操作該服務

```
sudo tee /etc/systemd/system/prometheus-pve-exporter.service<<EOF
[Unit]
Description=Prometheus exporter for Proxmox VE
Documentation=https://github.com/znerol/prometheus-pve-exporter

[Service]
Restart=always
User=prometheus
ExecStart=/usr/local/bin/pve_exporter --config.file=/etc/prometheus/pve.yml

[Install]
WantedBy=multi-user.target
EOF
```

啟用 `prometheus-pve-exporter` 服務
```
systemctl daemon-reload
systemctl start prometheus-pve-exporter
systemctl enable prometheus-pve-exporter
```

> 當叢集所有的 exporter 都安裝完畢後，一定要去控制節點(裝有 Promethus 的節點)當中的 `/etc/prometheus/prometheus.yml` 中在 targets 中加入 worker nodes 的 `ip addr` 

```
...
- job_name: 'proxmox'
  metrics_path: /pve
  static_configs:
  - targets: 
     - <WorkerNode IP Address>:9221
```

![](/img/Prometheus/pro-config.png)

# 安裝 Grafana


添加官方 Repo

```
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
```

安裝 Grafana

```
sudo apt-get update
sudo apt-get install grafana -y
```

啟用 Grafana

```
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

瀏覽器打開 `http://<Controller Node IP>:3000`  帳密會是： admin/ admin (首次登入好後會提示更改帳密)

![](/img/Prometheus/gr.jpeg)

接著要將 Grafana 連接到 Prometheus，需要從 **/home/connections/data sources/** 選擇 **Add Data Source** 接著選擇 Prometheus，在頁面中需要指定Service Name 跟 Prometheus 的URL 

![](/img/Prometheus/gr-2.jpeg)

接著就是需要尋找好用的 Dashboard，根據我的需求有查到下面幾個不錯的

> NVIDIA GPU: https://grafana.com/grafana/dashboards/6387-gpus/
> https://www.leadergpu.com/articles/524-collecting-gpu-metrics-with-grafana
> Power Monitoring: https://grafana.com/grafana/dashboards/20173-poweropen/

我選擇 NVIDIA GPU Metrics 這個 Dashboard，選擇 **Download JSON**

![](/img/Prometheus/gr-3.jpeg)

接著在 Grafana 中的 Dashboard 選擇 **New** 然後 **Import Dashboard** 並指定來源，最後按下 **import**

![](/img/Prometheus/gr-4.jpeg)

這時顯示得儀表板都還會是 **No Data**，這是因為還沒有安裝一個重要的元件 **Nvidia GPU Exporter**

# 安裝 NVIDIA GPU Exporter

```
wget https://github.com/utkuozdemir/nvidia_gpu_exporter/releases/download/v1.2.1/nvidia-gpu-exporter_1.2.1_linux_amd64.deb
sudo dpkg -i nvidia-gpu-exporter_1.2.1_linux_amd64.deb
```

接著修改 `/etc/prometheus/prometheus.yml`

```
...
    - job_name: 'nvidia'
    scrape_interval: 5s
    static_configs:
    - targets: 
      - 'WORKERNODE_1_IP:9835'
      - ....
```

接著重新啟動 prometheus 服務

```
systemctl restart prometheus
```

查看 Prometheus 可以發現所有安裝 NVIDIA GPU Exporter 的節點，都能夠從 Prometheus 查看到了

![](/img/Prometheus/ex-1.jpeg)

接著就可以發現到 Grafana 成功抓到 GPU 資料了

![](/img/Prometheus/ex-2.jpeg)

> 注意：每台節點都必須先有縣卡驅動才有辦法正確抓到資料

> 接著需要解決的議題就是顯卡直通，需要讓PVE上的VM能夠存取到顯示卡


# References
https://codychen.me/2021/38/proxmox-%E9%80%8F%E9%81%8E-prometheus-%E5%91%88%E7%8F%BE%E5%9C%A8-grafana/
https://samynitsche.de/3-monitoring-proxmox-with-prometheus-and-grafana

---
