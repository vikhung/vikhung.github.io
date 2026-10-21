---
title: MongoDB (Ubuntu) 學習：安裝後的目錄與設定
date: 2020-01-24
category: 技術
tags: [mongodb, ubuntu]
summary: 安裝完成後兩個重要位置、設定檔，以及常用服務指令。
---

## 1. Directories

安裝完後有兩個重要位置：

| 路徑 | 用途 |
| --- | --- |
| `/var/lib/mongodb` | 放置資料 |
| `/var/log/mongodb` | 放置 log |

如果有新增使用者帳號，也要調整這兩個目錄的權限。

> By default, MongoDB runs using the `mongodb` user account. If you change the user that runs the MongoDB process, you must also modify the permission to the data and log directories to give this user access to these directories.

## 2. Configuration File

The official MongoDB package includes a configuration file (`/etc/mongod.conf`). These settings (such as the data directory and log directory specifications) take effect upon startup. That is, if you change the configuration file while the MongoDB instance is running, you must restart the instance for the changes to take effect.

## 3. Procedure

```bash
sudo service mongod start
sudo service mongod status
sudo service mongod stop
sudo service mongod restart
mongo
```
