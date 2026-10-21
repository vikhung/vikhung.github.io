#!/usr/bin/env node
/* 部落格小工具（只需 Node.js，無需安裝套件）
 *   node tools/blog.js new [YYYY-MM-DD] [標題]   建立當天資料夾與 index.md（預設今天）
 *   node tools/blog.js build                    掃描 posts/*​/index.md，重建 posts/posts.json
 *   node tools/blog.js serve [port]             本機預覽 http://localhost:8080
 */
const fs = require("fs");
const path = require("path");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const POSTS = path.join(ROOT, "posts");
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function parseFrontMatter(text) {
  const m = text.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const data = {};
  if (!m) return data;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (v.startsWith("[") && v.endsWith("]")) {
      v = v.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else v = v.replace(/^["']|["']$/g, "");
    data[kv[1]] = v;
  }
  return data;
}

function build() {
  const list = [];
  for (const dir of fs.readdirSync(POSTS)) {
    const file = path.join(POSTS, dir, "index.md");
    if (!DAY.test(dir) || !fs.existsSync(file)) continue;
    const fm = parseFrontMatter(fs.readFileSync(file, "utf8"));
    list.push({
      id: dir,
      title: fm.title || dir,
      date: fm.date || dir,
      category: fm.category || "其他",
      tags: fm.tags || [],
      summary: fm.summary || "",
      cover: fm.cover || "",
    });
  }
  list.sort((a, b) => (a.id < b.id ? 1 : -1));
  fs.writeFileSync(path.join(POSTS, "posts.json"), JSON.stringify(list, null, 2) + "\n");
  console.log(`posts.json 已更新，共 ${list.length} 篇`);
}

function create(date, title) {
  const d = date || new Date().toLocaleDateString("sv-SE"); // YYYY-MM-DD
  if (!DAY.test(d)) return console.error("日期格式需為 YYYY-MM-DD");
  const dir = path.join(POSTS, d);
  const file = path.join(dir, "index.md");
  if (fs.existsSync(file)) return console.error(`已存在：${file}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, `---
title: ${title || "今天想記錄的事"}
date: ${d}
category: 技術
tags: []
summary: 一句話摘要（會顯示在列表）
# cover: cover.jpg
---

在這裡開始寫 Markdown。把照片放進同一個資料夾，然後這樣引用：

![照片說明](photo.jpg)
`);
  console.log(`已建立 ${path.relative(ROOT, file)}（照片請放在 ${path.relative(ROOT, dir)}/）`);
  build();
}

function serve(port) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".md": "text/markdown", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };
  http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, { "Content-Type": (types[path.extname(f).toLowerCase()] || "application/octet-stream") + "; charset=utf-8" });
    fs.createReadStream(f).pipe(res);
  }).listen(port, () => console.log(`預覽中：http://localhost:${port}`));
}

const [cmd, a, ...rest] = process.argv.slice(2);
if (cmd === "build") build();
else if (cmd === "new") DAY.test(a || "") ? create(a, rest.join(" ")) : create(null, [a, ...rest].filter(Boolean).join(" "));
else if (cmd === "serve") serve(Number(a) || 8080);
else console.log("用法：node tools/blog.js new [日期] [標題] | build | serve [port]");
