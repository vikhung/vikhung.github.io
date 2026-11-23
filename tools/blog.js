#!/usr/bin/env node
/* 部落格小工具（只需 Node.js，無需安裝套件）
 *   node tools/blog.js new [YYYY-MM-DD] [標題]   建立當天資料夾與 index.md（預設今天）
 *   node tools/blog.js touch YYYY-MM-DD         把該篇文章標記為「今天更新」（寫入 updated 欄位）
 *   node tools/blog.js del YYYY-MM-DD [--yes]   刪除整個當天資料夾（文章、照片、banner），預設會先詢問確認
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
      ...(fm.updated && fm.updated !== (fm.date || dir) ? { updated: fm.updated } : {}),
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

function touch(id) {
  const file = path.join(POSTS, id || "", "index.md");
  if (!DAY.test(id || "") || !fs.existsSync(file)) return console.error("用法：npm run touch <日期>，日期格式 YYYY-MM-DD（該天須已有文章）");
  const today = new Date().toLocaleDateString("sv-SE");
  const text = fs.readFileSync(file, "utf8");
  const m = text.match(/^(﻿?---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!m) return console.error("找不到 front matter：" + file);
  const eol = m[1].endsWith("\r\n") ? "\r\n" : "\n";
  const body = /^updated\s*:.*$/m.test(m[2])
    ? m[2].replace(/^updated\s*:.*$/m, `updated: ${today}`)
    : m[2].replace(/^(date\s*:.*)$/m, `$1${eol}updated: ${today}`);
  fs.writeFileSync(file, m[1] + body + text.slice(m[1].length + m[2].length));
  console.log(`${id} 已標記更新日期 ${today}`);
  build();
}

function del(id, yes) {
  const dir = path.join(POSTS, id || "");
  if (!DAY.test(id || "") || !fs.existsSync(dir)) return console.error("用法：npm run del <日期>，日期格式 YYYY-MM-DD（該天資料夾須存在）");
  const files = fs.readdirSync(dir, { recursive: true }).map(String);
  const title = (parseFrontMatter(fs.existsSync(path.join(dir, "index.md")) ? fs.readFileSync(path.join(dir, "index.md"), "utf8") : "").title) || "(無標題)";
  console.log(`即將刪除 ${path.relative(ROOT, dir)}/ 「${title}」，共 ${files.length} 個檔案：`);
  files.slice(0, 20).forEach((f) => console.log("  - " + f));
  if (files.length > 20) console.log(`  …另外 ${files.length - 20} 個`);
  const go = () => {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`已刪除 ${path.relative(ROOT, dir)}/（若已 commit 過，可用 git checkout HEAD -- posts/${id} 救回）`);
    build();
  };
  if (yes) return go();
  if (!process.stdin.isTTY) return console.error("非互動環境，請加上 yes 確認刪除：npm run del " + id + " yes");
  const rl = require("readline").createInterface({ input: process.stdin, output: process.stdout });
  rl.question("確定要刪除嗎？輸入 y 確認（其他鍵取消）：", (ans) => {
    rl.close();
    /^y(es)?$/i.test(ans.trim()) ? go() : console.log("已取消，沒有刪除任何檔案。");
  });
}

function serve(port) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".md": "text/markdown", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime" };
  http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("404"); }
    const type = (types[path.extname(f).toLowerCase()] || "application/octet-stream") + "; charset=utf-8";
    const size = fs.statSync(f).size;
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");   // 影片拖曳進度需要 Range
    if (range) {
      const start = range[1] ? +range[1] : 0;
      const end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
      res.writeHead(206, { "Content-Type": type, "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
      return fs.createReadStream(f, { start, end }).pipe(res);
    }
    res.writeHead(200, { "Content-Type": type, "Accept-Ranges": "bytes", "Content-Length": size });
    fs.createReadStream(f).pipe(res);
  }).listen(port, () => console.log(`預覽中：http://localhost:${port}`));
}

const [cmd, a, ...rest] = process.argv.slice(2);
if (cmd === "build") build();
else if (cmd === "new") DAY.test(a || "") ? create(a, rest.join(" ")) : create(null, [a, ...rest].filter(Boolean).join(" "));
else if (cmd === "touch") touch(a);
else if (cmd === "del") del(a, rest.some((x) => /^(--yes|-y|y|yes)$/i.test(x)));
else if (cmd === "serve") serve(Number(a) || 8080);
else console.log("用法：npm start | npm run new [日期] [標題] | npm run del <日期> | npm run touch <日期> | npm run build（<> 必填、[] 選填，日期格式 YYYY-MM-DD）");
