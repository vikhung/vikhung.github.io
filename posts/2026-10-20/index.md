---
title: 新家落成：我的數位筆記本改版了
date: 2026-10-20
category: 新知
tags: [blog, markdown, 公告]
summary: 網站改成「一天一個資料夾、一篇 Markdown」的格式，舊的技術筆記也全部搬過來了。
cover: cover.svg
---

這個網站從 2020 年開始，一直是一張很長很長的 Bootstrap 表格——能用，但越寫越難找。
今天起改版：**一天一個資料夾，一篇 Markdown**，要放照片就丟進同一個資料夾。

![這是範例圖片，放在 posts/2026-10-20/cover.svg](cover.svg)

## 以後會寫什麼

- **技術**：開發筆記、踩坑紀錄、指令小抄（舊文章都在這裡）
- **旅遊**：去過的地方、拍到的照片
- **新知**：讀到、看到、學到的有趣東西

## 目錄結構

```text
posts/
├── posts.json            ← 文章索引（由工具自動產生）
├── 2026-10-20/
│   ├── index.md          ← 當天文章
│   └── cover.svg         ← 當天用到的照片
└── 2026-10-21/
    ├── index.md
    ├── DSC_0001.jpg
    └── DSC_0002.jpg
```

## 怎麼發新文章

```bash
node tools/blog.js new 2026-10-21 "今天去了哪裡"   # 建立資料夾與範本
# 編輯 posts/2026-10-21/index.md，照片放同資料夾
node tools/blog.js serve                          # 本機預覽 http://localhost:8080
git add -A && git commit -m "new post" && git push
```

在文章裡引用照片只要寫相對路徑，網站會自動指到當天的資料夾：

```markdown
![富士山下的清晨](DSC_0001.jpg)
```

> 舊的 `index.html` 內容已按 git 記錄的日期，拆成 2020～2022 的每日文章。
