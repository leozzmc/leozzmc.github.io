---
title: Deploying Prometheus and Grafana on a Proxmox VE Cluster
tags:
  - Prometheus
  - Proxmox VE
  - Infrastructure
categories: Hands-On Practices
aside: true
abbrlink: "a6822388"
date: 2025-02-11 10:33:03
cover: /img/Prometheus/cover.png
---

> 🌐 中文版：[繁體中文](/posts/a6822388.html)

# Preface

On the Proxmox VE cluster I built earlier, I needed to periodically collect GPU power-consumption info as the basis for a script's decisions, so I needed Prometheus to collect the info.

# Node background info

{% note info %}
IP CIDR: `172.25.166.139/24`
CPU(s) 4 x Intel(R) Core(TM) i3-8100 CPU @ 3.60GHz (1 Socket)
Kernel Version Linux 6.8.4-2-pve (2024-04-10T17:36Z)
{% endnote %}

# Installing Prometheus

Create the Prometheus user

```
sudo groupadd --system prometheus
sudo useradd -s /sbin/nologin --system -g prometheus prometheus
```

Create the directories Prometheus needs

```
mkdir /var/lib/prometheus
for i in rules rules.d files_sd; do mkdir -p /etc/prometheus/${i}; done
```

Create a temporary `prometheus` directory under `tmp` for downloading, and download the latest Prometheus

```
mkdir -p /tmp/prometheus && cd /tmp/prometheus
curl -s https://api.github.com/repos/prometheus/prometheus/releases/latest \
  | grep browser_download_url \
  | grep linux-amd64 \
  | cut -d '"' -f 4 \
  | wget -qi -
```

Extract the file, move the config files, and delete the temporary directory when done

```
tar xvf prometheus*.tar.gz
cd prometheus*/
mv prometheus promtool /usr/local/bin/
mv prometheus.yml  /etc/prometheus/prometheus.yml
mv consoles/ console_libraries/ /etc/prometheus/

cd ~/
rm -rf /tmp/prometheus
```

Create the systemd config file

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

Use `chown` to set the owner of all the directories just created to prometheus

```
for i in rules rules.d files_sd; do sudo chown -R prometheus:prometheus /etc/prometheus/${i}; done
for i in rules rules.d files_sd; do sudo chmod -R 775 /etc/prometheus/${i}; done
sudo chown -R prometheus:prometheus /var/lib/prometheus/
```

Then load the Prometheus config and start the Prometheus service plus the boot-time service

```
sudo systemctl daemon-reload
sudo systemctl start prometheus
sudo systemctl enable prometheus
```

> At this point, accessing the node's port 9090 via a browser should reach the Prometheus page.

![](/img/Prometheus/prometheus-1.jpeg)

# Installing the Prometheus Exporter

> A Prometheus Exporter mainly runs on a node to actively export the node's info to a specific service for Prometheus to access. So the need here is to install it on every node in the cluster.

```
apt install python3 python3-pip
pip3 install prometheus-pve-exporter --break-system-packages
```

The reason for `--break-system-packages` is that PVE enables `PEP 668` by default, which restricts installing Python packages with `pip3` in the global environment, since it means this Python environment is system-managed. This parameter bypasses that restriction.

Next create an auth file so prometheus-pve-exporter can log into PVE. The auth method here uses a Proxmox VE API Token; create one in advance if you haven't.

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

You can visit `http://<Service IP>:9221/pve` to confirm you can retrieve system info, and also check target health on Prometheus's dashboard.

![](/img/Prometheus/pro-2.png)

{% hideToggle  Creating an API Token ,bg,color %}

In the Proxmox web interface, create an API Token.

1. Go to user management (`Datacenter` → `Permissions` → `API Token`).
2. Create a token for a user and assign appropriate permissions (e.g. Read-Only)
3. Record the `Token-ID` and `Token-Secret`.

![](/img/Prometheus/apiToken.png)

{% endhideToggle %}

Then create the systemd config file for easy service management

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

Enable the `prometheus-pve-exporter` service
```
systemctl daemon-reload
systemctl start prometheus-pve-exporter
systemctl enable prometheus-pve-exporter
```

> Once all the exporters in the cluster are installed, be sure to go to `/etc/prometheus/prometheus.yml` on the control node (the one with Prometheus) and add the worker nodes' `ip addr` to targets.

```
...
- job_name: 'proxmox'
  metrics_path: /pve
  static_configs:
  - targets: 
     - <WorkerNode IP Address>:9221
```

![](/img/Prometheus/pro-config.png)

# Installing Grafana

Add the official repo

```
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
```

Install Grafana

```
sudo apt-get update
sudo apt-get install grafana -y
```

Enable Grafana

```
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
```

Open `http://<Controller Node IP>:3000` in a browser; the credentials are admin/admin (you'll be prompted to change them on first login).

![](/img/Prometheus/gr.jpeg)

Next, to connect Grafana to Prometheus, go to **/home/connections/data sources/** and choose **Add Data Source**, then choose Prometheus, and on the page specify the service name and Prometheus URL.

![](/img/Prometheus/gr-2.jpeg)

Then find a good dashboard. Based on my needs I found a few nice ones:

> NVIDIA GPU: https://grafana.com/grafana/dashboards/6387-gpus/
> https://www.leadergpu.com/articles/524-collecting-gpu-metrics-with-grafana
> Power Monitoring: https://grafana.com/grafana/dashboards/20173-poweropen/

I chose the NVIDIA GPU Metrics dashboard and clicked **Download JSON**.

![](/img/Prometheus/gr-3.jpeg)

Then in Grafana's Dashboard, choose **New**, then **Import Dashboard**, specify the source, and finally click **import**.

![](/img/Prometheus/gr-4.jpeg)

At this point the dashboard still shows **No Data**, because we haven't installed an important component yet: the **Nvidia GPU Exporter**.

# Installing the NVIDIA GPU Exporter

```
wget https://github.com/utkuozdemir/nvidia_gpu_exporter/releases/download/v1.2.1/nvidia-gpu-exporter_1.2.1_linux_amd64.deb
sudo dpkg -i nvidia-gpu-exporter_1.2.1_linux_amd64.deb
```

Then modify `/etc/prometheus/prometheus.yml`

```
...
    - job_name: 'nvidia'
    scrape_interval: 5s
    static_configs:
    - targets: 
      - 'WORKERNODE_1_IP:9835'
      - ....
```

Then restart the prometheus service

```
systemctl restart prometheus
```

Checking Prometheus, you'll find all the nodes with the NVIDIA GPU Exporter installed are now visible from Prometheus.

![](/img/Prometheus/ex-1.jpeg)

And you'll find Grafana successfully pulling GPU data.

![](/img/Prometheus/ex-2.jpeg)

> Note: each node must have the graphics-card driver installed first to correctly pull data.

> The next issue to solve is GPU passthrough, letting VMs on PVE access the graphics card.

# References
https://codychen.me/2021/38/proxmox-%E9%80%8F%E9%81%8E-prometheus-%E5%91%88%E7%8F%BE%E5%9C%A8-grafana/
https://samynitsche.de/3-monitoring-proxmox-with-prometheus-and-grafana

---
