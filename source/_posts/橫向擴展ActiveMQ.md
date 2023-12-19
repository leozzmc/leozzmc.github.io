---
title: 橫向擴展ActiveMQ
tags:
  - AWS
  - ActiveMQ
  - MQ
  - Scaling
toc: true
aside: true
abbrlink: b509904
date: 2023-12-19 04:04:20
cover:
---

## Amazon MQ

Amzon MQ 上有託管 Active MQ 這個訊息佇列的服務，近期有碰到問題是問說，**要怎麼樣在 Amazon MQ 上做 Horizontal Scaling**，

首先簡單解釋一下 Vertical Scaling 跟 Horizontal Scaling 的差異。

Scaling意味著擴展，Vertical Scaling著重於單一實體的運算能力增強，所以Vertical Scaling可能會是更好的 CPU/GPU,更大的記憶體容量等等，

以 AWS 服務來說，可能會是更換實例，MQ的話就會是從 `t3.Micro` 換成 `m5.large`

> [+] 執行個體類型 - https://docs.aws.amazon.com/zh_tw/amazon-mq/latest/developer-guide/broker-instance-types.html

而若要水平擴展，通常代表架構會接收到更多消息，所以會需要根據流量/訊息量來去擴展並且分擔單一實例的負擔。

## ActiveMQ Proxy Network


## Steps

![](/img/ActiveMQ/ActiveMQ1.png)


![](/img/ActiveMQ/ActiveMQ2.png)

![](/img/ActiveMQ/ActiveMQ3.png)

![](/img/ActiveMQ/ActiveMQ4.png)

選擇 **Next**

![](/img/ActiveMQ/ActiveMQ5.png)

這時可以下載 CloudFormation 模板，未來可以方便修改配置重新部署

預估部署所需時間： **25 minutes**

![](/img/ActiveMQ/ActiveMQ6.png)

可以發現三個 Broker 都正在部署中

![](/img/ActiveMQ/ActiveMQ7.png)

可以點進去 broker 查看詳細的設定配置

![](/img/ActiveMQ/ActiveMQ8.png)

在設定檔當中可以透過編輯 `<networkConnector></networkConnector>` 當中的屬性進行 MQ 拓墣上的設計

以下是目前建立的 Broker的設定

- Broker1 上面的 <networkConnectors> 設置

```
<networkConnectors>
    <networkConnector conduitSubscriptions="false" consumerTTL="1" messageTTL="-1" name="QueueConnectorConnectingToBroker2" uri="masterslave:(ssl://b-88e0e40a-d67a-4476-ac04-9015b4a491e5-1.mq.us-east-1.amazonaws.com:61617,ssl://b-88e0e40a-d67a-4476-ac04-9015b4a491e5-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <topic physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="true" consumerTTL="1" messageTTL="-1" name="TopicConnectorConnectingToBroker2" uri="masterslave:(ssl://b-88e0e40a-d67a-4476-ac04-9015b4a491e5-1.mq.us-east-1.amazonaws.com:61617,ssl://b-88e0e40a-d67a-4476-ac04-9015b4a491e5-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <queue physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="false" consumerTTL="1" messageTTL="-1" name="QueueConnectorConnectingToBroker3" uri="masterslave:(ssl://b-52af7fc7-4bb2-4c0d-b427-11a1c965434f-1.mq.us-east-1.amazonaws.com:61617,ssl://b-52af7fc7-4bb2-4c0d-b427-11a1c965434f-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <topic physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="true" consumerTTL="1" messageTTL="-1" name="TopicConnectorConnectingToBroker3" uri="masterslave:(ssl://b-52af7fc7-4bb2-4c0d-b427-11a1c965434f-1.mq.us-east-1.amazonaws.com:61617,ssl://b-52af7fc7-4bb2-4c0d-b427-11a1c965434f-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <queue physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
  </networkConnectors>
```

- Broker2 上面的 <networkConnectors> 設置

```
<networkConnectors>
    <networkConnector conduitSubscriptions="false" consumerTTL="1" messageTTL="-1" name="QueueConnectorConnectingToBroker1" uri="masterslave:(ssl://b-853601ab-b005-4305-b511-283b560a6ddb-1.mq.us-east-1.amazonaws.com:61617,ssl://b-853601ab-b005-4305-b511-283b560a6ddb-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <topic physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="true" consumerTTL="1" messageTTL="-1" name="TopicConnectorConnectingToBroker1" uri="masterslave:(ssl://b-853601ab-b005-4305-b511-283b560a6ddb-1.mq.us-east-1.amazonaws.com:61617,ssl://b-853601ab-b005-4305-b511-283b560a6ddb-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <queue physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="false" consumerTTL="1" messageTTL="-1" name="QueueConnectorConnectingToBroker3" uri="masterslave:(ssl://b-52af7fc7-4bb2-4c0d-b427-11a1c965434f-1.mq.us-east-1.amazonaws.com:61617,ssl://b-52af7fc7-4bb2-4c0d-b427-11a1c965434f-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <topic physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="true" consumerTTL="1" messageTTL="-1" name="TopicConnectorConnectingToBroker3" uri="masterslave:(ssl://b-52af7fc7-4bb2-4c0d-b427-11a1c965434f-1.mq.us-east-1.amazonaws.com:61617,ssl://b-52af7fc7-4bb2-4c0d-b427-11a1c965434f-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <queue physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
  </networkConnectors>
```

- Broker3 上面的 <networkConnectors> 設置

```
<networkConnectors>
    <networkConnector conduitSubscriptions="false" consumerTTL="1" messageTTL="-1" name="QueueConnectorConnectingToBroker1" uri="masterslave:(ssl://b-853601ab-b005-4305-b511-283b560a6ddb-1.mq.us-east-1.amazonaws.com:61617,ssl://b-853601ab-b005-4305-b511-283b560a6ddb-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <topic physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="true" consumerTTL="1" messageTTL="-1" name="TopicConnectorConnectingToBroker1" uri="masterslave:(ssl://b-853601ab-b005-4305-b511-283b560a6ddb-1.mq.us-east-1.amazonaws.com:61617,ssl://b-853601ab-b005-4305-b511-283b560a6ddb-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <queue physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="false" consumerTTL="1" messageTTL="-1" name="QueueConnectorConnectingToBroker2" uri="masterslave:(ssl://b-88e0e40a-d67a-4476-ac04-9015b4a491e5-1.mq.us-east-1.amazonaws.com:61617,ssl://b-88e0e40a-d67a-4476-ac04-9015b4a491e5-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <topic physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
    <networkConnector conduitSubscriptions="true" consumerTTL="1" messageTTL="-1" name="TopicConnectorConnectingToBroker2" uri="masterslave:(ssl://b-88e0e40a-d67a-4476-ac04-9015b4a491e5-1.mq.us-east-1.amazonaws.com:61617,ssl://b-88e0e40a-d67a-4476-ac04-9015b4a491e5-2.mq.us-east-1.amazonaws.com:61617)" userName="Kevin">
      <excludedDestinations>
        <queue physicalName="&gt;"/>
      </excludedDestinations>
    </networkConnector>
  </networkConnectors>
```

### conduitSubscriptions 屬性

根據 ActiveMQ 官方文件 
> https://activemq.apache.org/networks-of-brokers

![](/img/ActiveMQ/ActiveMQ9.png)

訂閱相同目的地的多位消費者被網路視為一個消費者，這是為了避免有收到相同消息的狀況

ActiveMQ 會依賴有關活動消費者（訂閱者）的資訊來在網絡中傳遞訊息，**使用 Conduit Subscription時，如果有多個遠端訂閱，遠程代理將每個消息的副本視為有效，這可能導致訊息重復的狀況產生**。

因此，預設的 Conduit 行為會去**整合所有匹配的訂閱訊息，以防止在網絡中傳播重複**。

這樣，遠程代理上的 `N` 個訂閱看起來對於網絡代理來說就像是一個單一的訂閱。

> 然而，如果只使用 Queue，重複的訂閱是一個有用的功能，因為負載平衡算法將嘗試均勻分配消息負載，僅當 `conduitSubscriptions=false` 時，跨網絡的消費者才會均勻分享消息負載。

舉例來說，有兩個代理，A 和 B，它們通過一個 proxy bridge 相互連接。

連接到代理 A 的消費者訂閱一個名為 `Q.TEST` 的Queue，連接到代理 B 的兩個消費者也訂閱 `Q.TEST`，所以這裡有三個消費者，並且假設所有消費者具有相等的優先級。

然後，在代理 A 上啟動一個生產者，將 30 條消息寫入 `Q.TEST`。默認情況下（`conduitSubscriptions=true`），將有 15 條消息發送到代理 A 上的消費者，其餘的 15 條消息將發送到代理 B 上的兩個消費者。

**但也由於預設狀況下，代理 A 將代理 B 上的兩個訂閱視為一個，消息負載並未均勻分佈在所有三個消費者之間。**

但如果你將 `conduitSubscriptions` 設置為 `false`，那麼三個消費者中的每個將分配到 10 條消息。

## 參考

[+] 執行個體類型 - https://docs.aws.amazon.com/zh_tw/amazon-mq/latest/developer-guide/broker-instance-types.html
[+] Amazon MQ 代理网络 - 代理网络的工作原理是什么？ - https://docs.aws.amazon.com/zh_cn/amazon-mq/latest/developer-guide/network-of-brokers.html#how-does-it-work
[+]ActiveMQ - NetworkConnectors - https://activemq.apache.org/networks-of-brokers



