#!/usr/bin/env node
/* 為每篇文章產生 banner.svg（放在該天資料夾），並在 index.md 最上方插入圖片。
 *   node tools/banners.js            產生全部（已存在的 banner.svg 會被覆蓋）
 *   node tools/banners.js 2026-10-18 只產生指定日期
 * 圖案依 MOTIFS 對照表決定；沒列到的文章會依分類使用預設圖案。
 */
const fs = require("fs");
const path = require("path");

const POSTS = path.join(__dirname, "..", "posts");
const W = 1200, H = 400;

/* 每篇文章的圖案；colors = [漸層起, 漸層終] */
const MOTIFS = {
  "2020-01-08": ["git",      ["#1f3a5f", "#0f766e"]],
  "2020-01-11": ["grid",     ["#4c1d95", "#7c3aed"]],
  "2020-01-22": ["laptop",   ["#0f4c5c", "#1d7a8c"]],
  "2020-01-23": ["db",       ["#14532d", "#15803d"]],
  "2020-01-24": ["db",       ["#064e3b", "#0f766e"]],
  "2020-01-27": ["replica",  ["#14532d", "#166534"]],
  "2020-01-28": ["replica",  ["#052e16", "#15803d"]],
  "2020-02-16": ["java",     ["#7c2d12", "#c2410c"]],
  "2020-02-18": ["db",       ["#134e4a", "#115e59"]],
  "2020-02-20": ["webhook",  ["#3b0764", "#6d28d9"]],
  "2020-03-29": ["spring",   ["#14532d", "#4d7c0f"]],
  "2020-04-05": ["git",      ["#7c2d12", "#b45309"]],
  "2020-10-18": ["terminal", ["#1e293b", "#334155"]],
  "2021-04-25": ["k8s",      ["#1e3a8a", "#2563eb"]],
  "2022-05-02": ["search",   ["#0c4a6e", "#0369a1"]],
  "2022-09-10": ["lock",     ["#1e293b", "#475569"]],
  "2022-09-11": ["hex",      ["#7f1d1d", "#b91c1c"]],
  "2026-10-11": ["mountain", ["#0f766e", "#65a30d"]],
  "2026-10-18": ["mountain", ["#7c2d12", "#d97706"]],
  "2026-10-20": ["book",     ["#92400e", "#d97706"]],
  "2026-10-21": ["counter",  ["#0f172a", "#0e7490"]],
  "2026-10-22": ["spark",    ["#9a3412", "#ea580c"]],
};
const DEFAULT_BY_CAT = { 技術: ["terminal", ["#1e293b", "#334155"]], 旅遊: ["mountain", ["#0f766e", "#65a30d"]], 新知: ["book", ["#92400e", "#d97706"]] };

/* ---------- 圖案（畫在 400x400 的區塊，置於右側） ---------- */
const S = 'fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"';
const SOFT = 'fill="#fff" fill-opacity=".16"';
const M = {
  git: () => `<g ${S}><path d="M120 330V110M120 220c0-60 160-30 160-110" /></g>
    ${[[120,110],[120,220],[120,330],[280,110]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="24" fill="#fff"/>`).join("")}
    <circle cx="280" cy="110" r="24" fill="#fde68a"/>`,
  grid: () => [0,1,2].map((r) => [0,1,2,3].map((c) =>
    `<rect x="${70+c*72}" y="${100+r*72}" width="60" height="60" rx="10" ${r===1&&c===1?'fill="#fff"':SOFT} stroke="#fff" stroke-width="3"/>`).join("")).join(""),
  laptop: () => `<rect x="90" y="110" width="220" height="150" rx="12" ${SOFT} stroke="#fff" stroke-width="6"/>
    <path d="M60 280h280l-20 24H80z" fill="#fff"/><circle cx="200" cy="185" r="38" ${S}/><circle cx="200" cy="185" r="14" fill="#fff"/>`,
  db: () => [0,1,2].map((i) => `<ellipse cx="200" cy="${120+i*70}" rx="100" ry="28" ${SOFT} stroke="#fff" stroke-width="5"/>
    <path d="M100 ${120+i*70}v70M300 ${120+i*70}v70" stroke="#fff" stroke-width="5"/>`).join("") +
    `<ellipse cx="200" cy="120" rx="100" ry="28" fill="#fff" fill-opacity=".35" stroke="#fff" stroke-width="5"/>`,
  replica: () => `<g ${S}><path d="M200 110L110 270H290Z"/></g>` +
    [[200,110,"#fde68a"],[110,270,"#fff"],[290,270,"#fff"]].map(([x,y,f]) =>
      `<circle cx="${x}" cy="${y}" r="42" fill="${f}"/><circle cx="${x}" cy="${y}" r="42" fill="none" stroke="#0004" stroke-width="3"/>`).join(""),
  java: () => `<path d="M110 190h180v70a60 60 0 01-60 60h-60a60 60 0 01-60-60z" fill="#fff"/>
    <path d="M290 205h22a32 32 0 010 64h-24" ${S}/>
    <g ${S}><path d="M160 160c-15-20 15-30 0-55M210 160c-15-20 15-30 0-55M260 160c-15-20 15-30 0-55"/></g>`,
  webhook: () => `<path d="M80 110h200a20 20 0 0120 20v100a20 20 0 01-20 20H170l-50 40v-40H80a20 20 0 01-20-20V130a20 20 0 0120-20z" fill="#fff"/>
    <g fill="#6d28d9"><circle cx="130" cy="180" r="12"/><circle cx="180" cy="180" r="12"/><circle cx="230" cy="180" r="12"/></g>
    <g ${S}><path d="M240 320h110M320 295l30 25-30 25"/></g>`,
  spring: () => `<path d="M90 300C70 160 170 80 320 90c10 140-70 230-200 220" fill="#fff" fill-opacity=".9"/>
    <path d="M100 300C150 220 220 160 300 110" stroke="#4d7c0f" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  terminal: () => `<rect x="50" y="90" width="300" height="220" rx="16" ${SOFT} stroke="#fff" stroke-width="5"/>
    <path d="M50 134h300" stroke="#fff" stroke-width="4"/>
    <g fill="#fff"><circle cx="78" cy="112" r="6"/><circle cx="100" cy="112" r="6"/><circle cx="122" cy="112" r="6"/></g>
    <g ${S}><path d="M85 185l32 28-32 28M140 245h70"/></g>`,
  k8s: () => `<polygon points="200,90 290,133 312,230 250,308 150,308 88,230 110,133" ${SOFT} stroke="#fff" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="200" cy="215" r="26" fill="#fff"/>
    <g ${S}>${[0,1,2,3,4,5,6].map((i) => { const a = i*2*Math.PI/7 - Math.PI/2; return `<path d="M${200+Math.cos(a)*30} ${215+Math.sin(a)*30}L${200+Math.cos(a)*85} ${215+Math.sin(a)*85}"/>`; }).join("")}</g>`,
  search: () => `<circle cx="170" cy="180" r="85" ${SOFT} stroke="#fff" stroke-width="12"/>
    <path d="M232 242l80 80" stroke="#fff" stroke-width="18" stroke-linecap="round"/>
    <g fill="#fff"><rect x="120" y="150" width="100" height="12" rx="6"/><rect x="120" y="180" width="70" height="12" rx="6"/><rect x="120" y="210" width="85" height="12" rx="6"/></g>`,
  lock: () => `<rect x="105" y="190" width="190" height="130" rx="20" fill="#fff"/>
    <path d="M140 190v-30a60 60 0 01120 0v30" ${S} stroke-width="14"/>
    <g fill="#475569" font-family="monospace" font-weight="700" font-size="40" text-anchor="middle"><text x="140" y="270">4</text><text x="200" y="270">8</text><text x="260" y="270">1</text></g>`,
  hex: () => `<polygon points="200,80 300,140 300,260 200,320 100,260 100,140" fill="#fff" fill-opacity=".92"/>
    <text x="200" y="232" font-family="monospace" font-weight="900" font-size="90" text-anchor="middle" fill="#b91c1c">JS</text>`,
  mountain: () => `<circle cx="290" cy="120" r="46" fill="#fde68a"/>
    <path d="M30 330L170 120l70 100 40-60 100 170z" fill="#fff" fill-opacity=".9"/>
    <path d="M170 120l-35 52 28-14 22 20 18-18 20 14z" fill="#e2e8f0"/>
    <path d="M30 330h340" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    <path d="M110 330c30-40 60-40 70-70" ${S} stroke-dasharray="2 14"/>`,
  book: () => `<path d="M200 120c-40-25-100-25-140-10v200c40-15 100-15 140 10z" fill="#fff"/>
    <path d="M200 120c40-25 100-25 140-10v200c-40-15-100-15-140 10z" fill="#fff" fill-opacity=".8"/>
    <g stroke="#b45309" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M85 170h85M85 205h85M85 240h85M230 170h85M230 205h85M230 240h85"/></g>`,
  counter: () => `<path d="M40 210c50-70 120-100 160-100s110 30 160 100c-50 70-120 100-160 100S90 280 40 210z" ${SOFT} stroke="#fff" stroke-width="6"/>
    <circle cx="200" cy="210" r="52" fill="#fff"/><circle cx="200" cy="210" r="22" fill="#0e7490"/>
    <g fill="#fde68a"><rect x="110" y="330" width="26" height="40" rx="5"/><rect x="152" y="315" width="26" height="55" rx="5"/><rect x="194" y="295" width="26" height="75" rx="5"/><rect x="236" y="270" width="26" height="100" rx="5"/></g>`,
  spark: () => `<rect x="50" y="110" width="300" height="200" rx="16" ${SOFT} stroke="#fff" stroke-width="5"/>
    <g ${S}><path d="M85 175l30 26-30 26"/></g><rect x="135" y="215" width="60" height="10" rx="5" fill="#fff"/>
    <path d="M300 60c8 40 20 52 60 60-40 8-52 20-60 60-8-40-20-52-60-60 40-8 52-20 60-60z" fill="#fde68a"/>
    <path d="M245 255c4 20 10 26 30 30-20 4-26 10-30 30-4-20-10-26-30-30 20-4 26-10 30-30z" fill="#fff"/>`,
};

/* ---------- 工具 ---------- */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const width = (s) => [...s].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? 1 : 0.56), 0);

function wrap(title, maxEm) {
  const lines = []; let cur = "";
  for (const ch of title) {
    if (width(cur + ch) > maxEm && cur) { lines.push(cur); cur = ""; }
    cur += ch;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

function front(md) {
  const m = md.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const get = (k) => ((m && m[1].match(new RegExp("^" + k + ":\\s*(.*)$", "m"))) || [])[1] || "";
  return { len: m ? m[0].length : 0, title: get("title"), category: get("category") || "其他", tags: get("tags").replace(/[\[\]]/g, "").split(",").map((t) => t.trim()).filter(Boolean) };
}

function svg(id, f) {
  const [motif, [c1, c2]] = MOTIFS[id] || DEFAULT_BY_CAT[f.category] || DEFAULT_BY_CAT.技術;
  const size = width(f.title) > 26 ? 44 : 54;
  const lines = wrap(f.title, 640 / size);
  const y0 = 200 - (lines.length - 1) * size * 0.6;
  const tspans = lines.map((l, i) => `<text x="64" y="${y0 + i * size * 1.25}" font-size="${size}" font-weight="900" fill="#fff">${esc(l)}</text>`).join("");
  const tags = f.tags.slice(0, 4).map((t) => "#" + t).join("  ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(f.title)}">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
  <pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" fill="#fff" fill-opacity=".14"/></pattern>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#p)"/>
<circle cx="1010" cy="200" r="190" fill="#fff" fill-opacity=".07"/>
<g transform="translate(760 0)">${M[motif]()}</g>
<g font-family="'Noto Sans TC','Microsoft JhengHei','PingFang TC',system-ui,sans-serif">
  <text x="64" y="76" font-size="20" font-weight="700" fill="#fff" fill-opacity=".85" font-family="Consolas,'Courier New',monospace">~/vik · ${esc(id)} · ${esc(f.category)}</text>
  ${tspans}
  <text x="64" y="${H - 40}" font-size="20" fill="#fff" fill-opacity=".8" font-family="Consolas,'Courier New',monospace">${esc(tags)}</text>
</g>
</svg>
`;
}

/* ---------- 主程式 ---------- */
const only = process.argv[2];
const dirs = fs.readdirSync(POSTS).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && (!only || d === only));
for (const id of dirs) {
  const file = path.join(POSTS, id, "index.md");
  if (!fs.existsSync(file)) continue;
  let md = fs.readFileSync(file, "utf8");
  const f = front(md);
  fs.writeFileSync(path.join(POSTS, id, "banner.svg"), svg(id, f));
  if (!md.includes("](banner.svg)")) {
    md = md.slice(0, f.len) + `![${f.title}](banner.svg)\n\n` + md.slice(f.len);
    fs.writeFileSync(file, md);
  }
  console.log("✔", id, f.title);
}
