# Vik 的數位筆記本

GitHub Pages 個人網誌：技術 / 旅遊 / 新知。純靜態，無需建置套件，只要有 Node.js 就能用小工具。

## 結構

```
index.html            網站外殼（單頁式，hash routing）
assets/               style.css、app.js
posts/
  posts.json          文章索引（node tools/blog.js build 自動產生）
  YYYY-MM-DD/         一天一個資料夾
    index.md          當天文章（Markdown + front matter）
    *.jpg / *.png     當天的照片，文章內用相對路徑引用
tools/blog.js         new / build / serve
```

## 發文流程

```bash
node tools/blog.js new 2026-10-21 "標題"   # 建資料夾 + 範本 + 更新索引
# 編輯 posts/2026-10-21/index.md，照片放進同資料夾
node tools/blog.js serve                    # 預覽 http://localhost:8080
git add -A && git commit -m "post: 2026-10-21" && git push
```

若手動新增/修改文章的標題、分類，記得執行 `node tools/blog.js build` 更新 `posts.json`。

## Front matter

```yaml
---
title: 文章標題
date: 2026-10-21
category: 旅遊        # 技術 | 旅遊 | 新知
tags: [日本, 攝影]
summary: 列表上顯示的一句話摘要
cover: cover.jpg      # 選填，列表縮圖
---
```

## 插入照片

```markdown
![說明文字](DSC_0001.jpg)
```

點擊照片可放大。
