---
title: MongoDB 遠端連線設定與 Replication 觀念
date: 2020-01-27
category: 技術
tags: [mongodb, replication]
summary: 本機正常、遠端失敗？原來要把實際 IP 寫進 bindIp。另外整理 Replica Set 的成員類型與架構。
---

## 連線方式

這幾天稍微玩了一下 MongoDB，本機操作都沒問題，不過只要遠端就會失敗。找了一下資料，發現應該是要將實際 IP 寫入設定檔中。

參考文件：https://docs.mongodb.com/manual/reference/configuration-options/#net.bindIp

### 設定檔位置（記得先備份）

先確認本機 IP：`ifconfig`

- Windows：`(mongo安裝位置)\Server\4.0\bin\mongod.cfg`
- Ubuntu：`/etc/mongod.conf`

### 修改設定檔

```bash
sudo gedit /etc/mongod.conf
```

修改 `bindIp`，存檔離開：

```yaml
# 修改前
bindIp: 127.0.0.1
# 修改後
bindIp: 127.0.0.1,192.168.0.34
```

重新啟動 MongoDB：

```bash
sudo service mongod start
```

### 確認是否有效

可透過 log 看是否有 listen 指定的 IP：

- Windows：`(mongo安裝位置)\Server\4.0\log\mongod.log`
- Ubuntu：`/var/log/mongodb/mongod.log`

### 實際連線測試

開啟 Windows 版的 MongoDB Compass 連線測試工具，確認已可連接。

---

## Replication

參考資料：https://docs.mongodb.com/manual/replication/

Replication 模式中，如果 Secondary Host 沒有接收到 Primary Host 的 heartbeat（預設 10 秒），會重新投票（Elect）選出新的 Primary Host。

### 一、Replica Set Members

https://docs.mongodb.com/manual/core/replica-set-members/

**Replica Set Secondary Members（三種應用方式）**

https://docs.mongodb.com/manual/core/replica-set-secondary/

設定為 priority 0 的 Secondary Host 不能參與投票，也就是不能變為 Primary，有三種應用方式（官方介紹）：

1. **Priority 0 Replica Set Members**：應用於異地備援（Standby）。https://docs.mongodb.com/manual/core/replica-set-priority-0-member/
2. **Hidden Replica Set Members**：應用於提供特定讀取用途。https://docs.mongodb.com/manual/core/replica-set-hidden-member/
3. **Delayed Replica Set Members**：應用於固定備存晚於當前時間的資料。例如故意延後備存 60 分鐘，假設現在是 21:00，該主機只保留 20:00 前的資料，這樣可保護這一小時內的人為錯誤操作。https://docs.mongodb.com/manual/core/replica-set-delayed-member/

**Replica Set Arbiter**

https://docs.mongodb.com/manual/core/replica-set-arbiter/

- 不要讓 Primary 或 Secondary Host 同時兼任仲裁者
- Arbiter 不會留存資料

### 二、Replica Set Deployment Architectures

https://docs.mongodb.com/manual/core/replica-set-architectures/

- Deploy an Odd Number of Members
- A replica set can have up to 7 voting members.
- **In general, avoid deploying more than one arbiter per replica set.**

**Three Member Replica Sets**

https://docs.mongodb.com/manual/core/replica-set-architecture-three-members/

The minimum number of replica set members needed to obtain the benefits of a replica set is three members（最少要三個）。
