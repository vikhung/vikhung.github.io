---
title: MongoDB Replica Set 實驗：用三個 Port 模擬三台主機
date: 2020-01-28
category: 技術
tags: [mongodb, replication, linux]
summary: 在同一台 Linux 上開三個 mongod，建立 Replica Set，並用關機/開機實驗驗證選舉與同步。附 Linux 背景服務常用指令。
---

## 一、準備三台環境，並各自驗證成功

### 1. 準備相關設定

用同一台 Linux 主機、三個 Port 模擬 Replica Set 三台，並準備相關的設定檔、資料庫檔、log 檔：

| 主機 | Port | 設定檔 | DB 目錄 | log |
| --- | --- | --- | --- | --- |
| 192.168.0.34 | 27111 | `/etc/mongod-rs1-p1.conf` | `/var/lib/mongodb-rs1-p1` | `/var/log/mongodb` |
| 192.168.0.34 | 27112 | `/etc/mongod-rs1-s1.conf` | `/var/lib/mongodb-rs1-s1` | `/var/log/mongodb` |
| 192.168.0.34 | 27113 | `/etc/mongod-rs1-s2.conf` | `/var/lib/mongodb-rs1-s2` | `/var/log/mongodb` |

### 2. 修改設定檔（先備份）

將三個設定檔分別調整相關環境參數：

- `storage.dbPath: /var/lib/mongodb-rs1-p1`
- `net.port: 27111`
- `net.bindIp`：將實體 IP 加入，方便等會跨主機發動 Insert（如果沒有跨主機，不用加）

### 3. 主機驗證

```bash
# 啟動服務（& 表示放入背景）
sudo mongod --config /etc/mongod-rs1-p1.conf &

# 確認是否真的登入該主機
sudo tail -f /var/log/mongodb

# 新增一筆
sudo mongo --host 192.168.0.34 --port 27111
db.collection.insert({"x":1})
```

## 二、設定 Replica Set

我參考下面這一篇，但官網的應該比較新：

- 民間版 3.x：https://blog.toright.com/posts/4508/mongodb-replica-set-%E9%AB%98%E5%8F%AF%E7%94%A8%E6%80%A7%E6%9E%B6%E6%A7%8B%E6%90%AD%E5%BB%BA.html
- 官網 4.x：https://docs.mongodb.com/manual/tutorial/deploy-replica-set/

1. 開啟三個服務的設定檔，將 `replication.replSetName` 均設定為 `rs1`

   ```yaml
   replication:
     replSetName: "rs1"
   ```

2. 重新啟動三組服務

   ```bash
   sudo mongod --config /etc/mongod-rs1-p1.conf &
   sudo mongod --config /etc/mongod-rs1-s1.conf &
   sudo mongod --config /etc/mongod-rs1-s2.conf &
   ```

3. 登入第一台：`sudo mongo --host 192.168.0.34 --port 27111`
4. 試著查詢先前新增的資料，出現錯誤 `"errmsg" : "not master and slaveOk=false"`。看來是設定檔已設為 rs1，但尚未初始化。
5. 正式設定：

   ```js
   use admin
   rs.initiate()   // 看到 OK，提示符號變成 rs1:SECONDARY>
   rs.conf()       // 看到成功訊息，提示符號再度變成 rs1:PRIMARY>
   rs.add("192.168.0.34:27112")
   rs.add("192.168.0.34:27113")
   rs.status()     // 確認 members 共三台：Primary、Secondary、Secondary
   ```

   > PS. 我多打 `rs.conf()` 沒發生啥事。

## 三、做實驗

1. 登入第一台 `sudo mongo --host 192.168.0.34 --port 27111`（提示符號已是 `rs1:PRIMARY>`）
2. 新增三筆資料：

   ```js
   db.collection.insert({"x":1})
   db.collection.insert({"x":2})
   db.collection.insert({"x":3})
   ```

3. 嘗試從第二台觀察：`sudo mongo --host 192.168.0.34 --port 27112`（`rs1:SECONDARY>`）。查詢失敗 `"errmsg" : "not master and slaveOk=false"`，看來只允許從 PRIMARY 處理，但或許調整 `slaveOk=true` 後可以從其他台查詢。
4. 關閉第一台主機：

   ```bash
   jobs      # 找出剛才背景執行的服務
   fg %n     # 拉回前景
   # Ctrl+C 終止服務
   ```

5. 再從第二台觀察（提示符號已變成 `rs1:PRIMARY>`），執行 `db.collection.find()`：

   ```
   { "_id" : ObjectId("5e2efa048dd017fe08c02dfe"), "x" : 1 }
   { "_id" : ObjectId("5e303cc92834a7c5afa3881f"), "x" : 2 }
   { "_id" : ObjectId("5e303cd02834a7c5afa38820"), "x" : 3 }
   ```

   ✅ 證明資料有確實 Replicate 到第二台。

6. 再關閉第二台主機（同上指令）
7. 改從第三台觀察（`rs1:SECONDARY>`）執行 `db.collection.find()` ==> 失敗。表示 3 台掛 2 台就無法運作，而且選不出 PRIMARY。
8. 重新啟動第一台，再登入第三台（目前狀態 P1、S2-PRIMARY）：第三台提示符號變成 `rs1:PRIMARY>`，表示起一台後可以重新投票了。
9. 重新啟動第二台，關閉第三台（P1-PRIMARY、S1）：PRIMARY 又變回第一台。
10. 目前只有兩台的情況下，從第一台再新增一筆：`db.collection.insert({"x":4})`
11. 因為 SECONDARY 無法查資料，想辦法讓第三台變 Primary 再查詢：
    - 開啟第三台（P1-PRIMARY、S1、S2）
    - 關閉第一台（S1-PRIMARY、S2）
    - 關閉第二台（S2）
    - 開啟第三台（P1、S2-PRIMARY）
12. 執行 `db.collection.find()`，發現剛才新增的第四筆資料。

✅ 證明當其中一台主機停機後再開機，其他主機也會將資料同步過去（全自動）。

### 待實驗

1. 只能從 PRIMARY 新增，但如果第一台掛了，前端怎麼知道改連第二台？要有 NLB 提供 VIP？抑或 MongoDB 有 VIP 機制（尚未參透）？抑或連線字串可以設定多組（JDBC，尚未測試）？
2. 怎樣讓第二台只做查詢（讀寫分離之類，應該可以調整參數，待測試）
3. 掛兩台、只剩一台，為何不能選自己當 PRIMARY？可否設定？
4. 用 AP 打交易、新增
5. 認證機制

---

## 附：Linux 常用指令或問題

- 放入背景：指令後面加 `&`，例：`sudo mongod /etc/mongod-rs1-p1.conf &`
- `jobs`：觀察有哪些背景服務
- `fg %5`：將第 5 個背景服務放到前景
- `Ctrl+Z`：暫停進入背景
- `bg %5`：重新執行背景服務
- `kill %5`：刪除背景服務（PS. Ubuntu 試驗無效）
- `nohup`：強制背景服務
- 如果要讓 Windows 可以遠端登入 Ubuntu，需要先安裝 openssh-server：http://blog.udn.com/nigerchen/2262865
- 如果 `apt-get` 要透過 SSL 下載軟體，得先安裝 `apt-transport-https`

### 開啟 Syslog

1. 檢查 `/etc/rsyslog.conf` 是否開啟相關 Port（udp/tcp 打開）
2. 檢查：`sudo service rsyslog status`
3. 啟動：`sudo service rsyslog start`

### cron

1. 啟動：`sudo service cron start`
2. 新增 job：`crontab -e`

```cron
*/1 * * * * /bin/sh /home/vik/VikGitHub/VikCode/linux/a01-1.sh >> myLog.txt
```

重點：`*/1` 每 1 分鐘；`/bin/sh` 用這個命令來執行 shell。
