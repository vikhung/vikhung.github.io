---
title: Git 常用指令小抄
date: 2020-04-05
category: 技術
tags: [git, cheatsheet]
summary: status / add / commit / push 的基本流程與幾個實用參數。
---

```bash
git status

git add -A            # 將全部檔案加入 local staging
git add -A -f         # 強制加入（避免被 ignore 擋掉）

git commit -a         # 將全部異動加入 local repo
git commit -s         # 加上簽名
git commit --allow-empty   # 空 commit（加個 log 用）

git push -u origin master  # Push 到 remote
```
