---
title: Mongo 常用語法與 Linux / Eclipse 連 GitHub
date: 2020-02-18
category: 技術
tags: [mongodb, git, eclipse, linux]
summary: MongoDB shell 常用查詢（含 Like 查詢），以及在 Linux 與 Eclipse 連接 GitHub 的步驟。
---
![Mongo 常用語法與 Linux / Eclipse 連 GitHub](banner.svg)


## Mongo 常用語法

```js
show dbs                      // List 所有 Database
show collections              // List 所有 Collection
db                            // 列出目前在哪個 DB
db.kocha.count()              // 找出筆數
db.kocha.drop()               // 砍掉 Collection
db.kocha.find({hospName:"遵龍藥局"})
```

### Like 查詢方法

```js
db.kocha.find({hospTel:{'$regex': '(04)'}})
db.kocha.find({createDate:{'$regex': '20200218095'}})
db.kocha.find({"createDate":/2020/})
db.kocha.find({"hospTel":/255/})
```

---

## Linux 環境連結 GitHub

參考：https://www.liquidweb.com/kb/create-clone-repo-github-ubuntu-18-04/

```bash
git config --global user.name "vikhung"
git config --global user.email "vikhung@gmail.com"
mkdir VikGitHub
cd VikGitHub
git clone https://github.com/username/want-some-java.git   # 將 GitHub URL 下載
```

輸入帳號密碼，自動下載到對應目錄。

## Eclipse With GitHub

1. 開啟 Eclipse
2. Import 專案，選用已存在的 Eclipse 專案
3. 如果該專案目錄是從 GitHub 下載，Eclipse 會自動支援
