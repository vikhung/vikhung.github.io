# Vik 的數位筆記本

GitHub Pages 個人網誌：技術 / 旅遊 / 新知。純靜態，無需建置套件，只要有 Node.js 就能用小工具。

## 結構

```
index.html            網站外殼（單頁式，hash routing）
assets/               style.css、app.js
posts/
  posts.json          文章索引（npm run build 自動產生）
  YYYY-MM-DD/         一天一個資料夾
    index.md          當天文章（Markdown + front matter）
    *.jpg / *.png     當天的照片，文章內用相對路徑引用
tools/blog.js         new / del / touch / build / serve
package.json          npm 指令捷徑（不需 npm install）
```

## 發文流程

```bash
npm run new 2026-10-21 "標題"   # 建資料夾 + 範本 + 更新索引（省略日期 = 今天）
# 編輯 posts/2026-10-21/index.md，照片放進同資料夾
npm start                        # 預覽 http://localhost:8080（換 port：npm start -- 3000）
git add -A && git commit -m "post: 2026-10-21" && git push
```

若手動新增/修改文章的標題、分類，記得執行 `npm run build` 更新 `posts.json`。

修改舊文章時，執行 `npm run touch 2020-01-22` 會在 front matter 寫入 `updated: 今天日期` 並重建索引；首頁的「最近更新」區塊會列出 60 天內更新過的文章，列表與文章頁也會顯示「更新於」標記。

## npm 指令

| 指令 | 用途 |
|---|---|
| `npm start` | 本機預覽 http://localhost:8080 |
| `npm run new [日期] [標題]` | 新增文章；省略日期則使用今天 |
| `npm run del <日期>` | 刪除整個當天資料夾（文章、照片、banner），會先列出檔案並詢問確認；最後加上 `yes` 可略過詢問 |
| `npm run touch <日期>` | 標記該篇文章「今天更新」，會出現在首頁「最近更新」 |
| `npm run build` | 重建 `posts/posts.json` |
| `npm run banner [日期]` | 產生該篇的 banner 圖；省略日期則全部重新產生 |

> 符號說明：`<日期>` 為**必填**，`[日期]`、`[標題]` 為**選填**（可省略）；輸入時不用打括號。日期格式一律為 `YYYY-MM-DD`，例如 `npm run del 2026-11-21`。

## Front matter

```yaml
---
title: 文章標題
date: 2026-10-21
updated: 2026-11-20  # 選填，最後更新日期（用 touch 指令自動寫入）
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
