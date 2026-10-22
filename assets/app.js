/* Vik's Notebook — 單頁式 Markdown 部落格 (hash routing)
 *   #/                列表
 *   #/c/技術           依分類
 *   #/t/mongodb        依標籤
 *   #/2020-01-08       單篇文章（對應 posts/2020-01-08/index.md）
 */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const app = $("#app");
  const POSTS_DIR = "posts";
  // GoatCounter 計數器：填入你在 goatcounter.com 註冊的 site code（https://<code>.goatcounter.com）。留空則不啟用。
  const GOATCOUNTER = "vikhunggithub";
  const isLocal = ["localhost", "127.0.0.1", ""].includes(location.hostname);
  const CATS = ["技術", "旅遊", "新知"];
  let posts = [];
  let query = "";

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const THEMES = [
    { id: "light", name: "手札（預設）", sw: "#c8501e" },
    { id: "dark", name: "夜間", sw: "#16181b" },
    { id: "ocean", name: "洋流（橘白）", sw: "#f26a00" },
    { id: "sun", name: "陽光", sw: "#ffd93d" },
    { id: "tech", name: "科技", sw: "#00f5a0" },
  ];
  const DARK_THEMES = ["dark", "tech"];
  const setTheme = (id) => {
    root.dataset.theme = id;
    try { localStorage.setItem("theme", id); } catch (e) {}
    $("#themeMenu").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.id === id));
  };
  try { const t = localStorage.getItem("theme"); if (THEMES.some((x) => x.id === t)) root.dataset.theme = t; } catch (e) {}
  $("#themeMenu").innerHTML = THEMES.map((t) =>
    `<button role="menuitem" data-id="${t.id}"><span class="sw" style="background:${t.sw}"></span>${t.name}</button>`).join("");
  $("#themeMenu").querySelectorAll("button").forEach((b) =>
    b.classList.toggle("on", b.dataset.id === root.dataset.theme));
  $("#themeMenu").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    setTheme(b.dataset.id);
    $("#themeMenu").classList.remove("on");
  });
  $("#palette").addEventListener("click", (e) => { e.stopPropagation(); $("#themeMenu").classList.toggle("on"); });
  document.addEventListener("click", () => $("#themeMenu").classList.remove("on"));
  $("#theme").addEventListener("click", () => {
    const cur = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(DARK_THEMES.includes(cur) ? "light" : "dark");
  });

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const enc = encodeURIComponent;

  function stripFrontMatter(md) {
    return md.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  }
  function readingMinutes(md) {
    const cjk = (md.match(/[一-鿿]/g) || []).length;
    const words = (md.replace(/[一-鿿]/g, " ").match(/\S+/g) || []).length;
    return Math.max(1, Math.round(cjk / 400 + words / 220));
  }
  const catChip = (c) => `<span class="cat ${esc(c)}">${esc(c)}</span>`;
  const tagLinks = (tags) => (tags || []).map((t) => `<a class="tag" href="#/t/${enc(t)}">${esc(t)}</a>`).join("");

  /* ---------- views ---------- */
  function listView(filter) {
    document.title = "Vik 的數位筆記本";
    const years = [...new Set(posts.map((p) => p.date.slice(0, 4)))].sort().reverse();
    const thisYear = String(new Date().getFullYear());
    // 首頁預設只列今年；今年還沒文章就退而列最新有文章的一年
    const year = filter?.year || (!filter?.cat && !filter?.tag ? (years.includes(thisYear) ? thisYear : years[0]) : "all");

    const chips = ["全部", ...CATS].map((c) => {
      const on = (c === "全部" && !filter?.cat) || filter?.cat === c;
      return `<a class="chip ${on ? "on" : ""}" href="#/${c === "全部" ? "" : "c/" + enc(c)}">${c}</a>`;
    }).join("");
    const sel = new Set((filter?.month || "").split(",").filter(Boolean).map((m) => m.padStart(2, "0")));
    const monthPath = (set) => (set.size ? "/" + [...set].sort().map(Number).join(",") : "");
    const yearChips = `<a class="chip ${year === "all" && !filter?.cat && !filter?.tag ? "on" : ""}" href="#/y/all" title="${posts.length} 篇">全部年份</a>` +
      years.map((y) => {
        const n = posts.filter((p) => p.date.startsWith(y)).length;
        return `<a class="chip ${year === y ? "on" : ""}" href="#/y/${y}" title="${n} 篇">${y}</a>`;
      }).join("");

    // 第二排：1～12 月，可多選；所選年份中沒有文章的月份會變淡
    let monthChips = "";
    if (!filter?.cat && !filter?.tag) {
      const inYear = posts.filter((p) => year === "all" || p.date.startsWith(year));
      const base = `#/y/${year}`;
      monthChips = `<div class="toolbar months"><div class="chips">` +
        Array.from({ length: 12 }, (_, i) => {
          const m = String(i + 1).padStart(2, "0");
          const n = inYear.filter((p) => p.date.slice(5, 7) === m).length;
          const next = new Set(sel); next.has(m) ? next.delete(m) : next.add(m);
          const on = sel.has(m);
          return `<a class="chip ${on ? "on" : ""} ${n || on ? "" : "off"}" href="${base}${monthPath(next)}" title="${n} 篇">${i + 1}月</a>`;
        }).join("") +
        (sel.size ? `<a class="chip clear" href="${base}">清除月份</a>` : "") +
        `</div></div>`;
    }

    const hint = filter?.tag ? `<p class="prompt">標籤 <b>#${esc(filter.tag)}</b> · <a href="#/">清除</a></p>` : "";
    app.innerHTML = `
      <section class="hero wrap">
        <p class="prompt"><span class="p">vik@notebook</span>:<span>~/blog</span>$ ls -t --by-day</p>
        <h1>寫給未來的自己，<br>也分享給<em>路過的你</em>。</h1>
        <p class="lead">我是 Vik，這裡記錄我的技術筆記、旅行足跡與新知心得。</p>
      </section>
      <div class="wrap">
        <div class="toolbar">
          <div class="chips">${chips}</div>
          <input class="search" id="q" type="search" placeholder="/ 搜尋文章（搜尋所有年份）" value="${esc(query)}">
        </div>
        <div class="toolbar years"><div class="chips">${yearChips}</div></div>
        ${monthChips}
        ${hint}
        <p class="count" id="count"></p>
        <div id="list"></div>
      </div>`;

    // 只重繪列表，不重建輸入框，才不會打斷中文輸入法（IME）
    const renderList = () => {
      const q = query.trim().toLowerCase();
      const items = posts.filter((p) => {
        if (filter?.cat && p.category !== filter.cat) return false;
        if (filter?.tag && !(p.tags || []).includes(filter.tag)) return false;
        if (q) return (p.title + p.summary + (p.tags || []).join(" ")).toLowerCase().includes(q);
        if (year !== "all" && !p.date.startsWith(year)) return false;
        return !sel.size || sel.has(p.date.slice(5, 7));
      });
      let body = "";
      let lastKey = "";
      for (const p of items) {
        const key = p.date.slice(0, 7);
        if (key !== lastKey) { body += `<div class="year">${key.slice(0, 4)} · ${Number(key.slice(5))} 月</div>`; lastKey = key; }
        const [, m, d] = p.date.split("-");
        body += `
        <a class="post-item" href="#/${p.id}">
          <div class="post-date">${m}月<b>${d}</b></div>
          <div>
            <h2 class="post-title">${esc(p.title)}</h2>
            ${p.summary ? `<p class="post-sum">${esc(p.summary)}</p>` : ""}
            <div class="meta">${catChip(p.category)}${(p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
          </div>
          ${p.cover ? `<img class="thumb" loading="lazy" src="${POSTS_DIR}/${p.id}/${esc(p.cover)}" alt="">` : ""}
        </a>`;
      }
      $("#count").textContent = items.length ? `共 ${items.length} 篇` : "";
      $("#list").innerHTML = body || `<div class="empty">$ ls: 找不到符合的文章 ¯\_(ツ)_/¯</div>`;
    };
    renderList();

    const input = $("#q");
    let composing = false;
    input.addEventListener("compositionstart", () => (composing = true));
    input.addEventListener("compositionend", () => { composing = false; query = input.value; renderList(); });
    input.addEventListener("input", () => { if (composing) return; query = input.value; renderList(); });
  }

  async function postView(id) {
    const meta = posts.find((p) => p.id === id);
    if (!meta) { app.innerHTML = `<div class="wrap empty">404 — 找不到 ${esc(id)}<br><a href="#/">回首頁</a></div>`; return; }
    document.title = `${meta.title} · Vik 的數位筆記本`;
    app.innerHTML = `<div class="wrap article"><div class="empty">載入中…</div></div>`;

    let md;
    try {
      const res = await fetch(`${POSTS_DIR}/${id}/index.md`);
      if (!res.ok) throw new Error(res.status);
      md = stripFrontMatter(await res.text());
    } catch (e) {
      app.innerHTML = `<div class="wrap empty">讀取失敗：${esc(e.message)}<br><a href="#/">回首頁</a></div>`;
      return;
    }

    // 相對路徑的圖片 / 連結 → 指向當天資料夾
    const base = `${POSTS_DIR}/${id}/`;
    const renderer = new marked.Renderer();
    const isRel = (u) => u && !/^([a-z]+:|\/|#|data:)/i.test(u);
    renderer.image = (a, b, c) => {
      const href = typeof a === "object" ? a.href : a;
      const title = typeof a === "object" ? a.title : b;
      const text = typeof a === "object" ? a.text : c;
      return `<img src="${esc(isRel(href) ? base + href : href)}" alt="${esc(text || "")}" loading="lazy"${title ? ` title="${esc(title)}"` : ""}>`;
    };
    marked.setOptions({ gfm: true, breaks: true });
    const html = DOMPurify.sanitize(marked.parse(md, { renderer }), { ADD_ATTR: ["loading"] });

    const idx = posts.findIndex((p) => p.id === id);
    const newer = posts[idx - 1], older = posts[idx + 1];
    app.innerHTML = `
      <article class="wrap article">
        <div class="crumb"><a href="#/">~/blog</a> / ${esc(id)} / index.md</div>
        <h1 class="title">${esc(meta.title)}</h1>
        <div class="meta">
          <span>${esc(meta.date)}</span>${catChip(meta.category)}${tagLinks(meta.tags)}
          <span>· 約 ${readingMinutes(md)} 分鐘</span>
          <span class="views" id="views">👁 統計中…</span>
        </div>
        <div class="md">${html}</div>
        <nav class="pager">
          ${older ? `<a href="#/${older.id}"><small>← 較舊</small>${esc(older.title)}</a>` : "<span></span>"}
          ${newer ? `<a class="next" href="#/${newer.id}"><small>較新 →</small>${esc(newer.title)}</a>` : "<span></span>"}
        </nav>
      </article>`;

    const mdEl = $(".md");
    mdEl.querySelectorAll("pre").forEach((pre) => {
      const code = pre.querySelector("code");
      const m = (code?.className || "").match(/language-(\w+)/);
      if (m) pre.dataset.lang = m[1];
      if (window.hljs && code) hljs.highlightElement(code);
      const btn = document.createElement("button");
      btn.className = "copy"; btn.textContent = "copy";
      btn.onclick = async () => {
        try { await navigator.clipboard.writeText(code.innerText); btn.textContent = "copied ✓"; }
        catch (e) { btn.textContent = "failed"; }
        setTimeout(() => (btn.textContent = "copy"), 1400);
      };
      pre.appendChild(btn);
    });
    mdEl.querySelectorAll("a[href^='http']").forEach((a) => { a.target = "_blank"; a.rel = "noopener"; });
    mdEl.querySelectorAll("img").forEach((img) => img.addEventListener("click", () => {
      const lb = $("#lightbox"); lb.querySelector("img").src = img.src; lb.classList.add("on");
    }));
  }

  /* ---------- 計數器 (GoatCounter) ---------- */
  if (GOATCOUNTER && !isLocal) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${GOATCOUNTER}.goatcounter.com/count`;
    s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true }); // 單頁式網站，由 route() 手動計數
    document.head.appendChild(s);
  }
  function countView(path, title) {
    if (!GOATCOUNTER || isLocal) return;
    const t = setInterval(() => {
      if (!window.goatcounter?.count) return;
      clearInterval(t);
      window.goatcounter.count({ path, title });
    }, 200);
    setTimeout(() => clearInterval(t), 5000);
  }
  // 顯示單篇瀏覽次數（需在 GoatCounter 設定開啟 "Allow adding visitor counts on your website"）
  async function showViews(id) {
    await new Promise((r) => setTimeout(r, 1500)); // 等文章畫面與本次計數寫入
    const el = $("#views");
    if (!el || !location.hash.includes(id)) return;
    if (!GOATCOUNTER || isLocal) { el.textContent = "👁 本機不計數"; return; }
    try {
      // GoatCounter 對「尚無紀錄」的頁面回 404 + {"count":"0"}，且計數會延遲寫入，所以 404 視為有效並稍後重試一次
      const get = async () => {
        const res = await fetch(`https://${GOATCOUNTER}.goatcounter.com/counter/${enc("/" + id)}.json`);
        if (!res.ok && res.status !== 404) throw new Error(res.status);
        return Number((await res.json()).count.replace(/\D/g, "")) || 0;
      };
      let count = await get();
      el.textContent = `👁 ${count} 次瀏覽`;
      if (count === 0) {
        await new Promise((r) => setTimeout(r, 6000));
        count = await get();
        if (location.hash.includes(id)) el.textContent = `👁 ${count} 次瀏覽`;
      }
    } catch (e) {
      el.textContent = "👁 無法取得次數";
      el.title = "請到 GoatCounter 後台 Settings → Site 勾選 Allow adding visitor counts on your website";
    }
  }

  /* ---------- router ---------- */
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    window.scrollTo(0, 0);
    const isPost = /^\d{4}-\d{2}-\d{2}/.test(h);
    countView("/" + h, h || "home");
    if (isPost) { showViews(h); return postView(h); }
    if (h.startsWith("y/")) { const [, y, m] = h.split("/"); return listView({ year: y, month: m }); }
    if (h.startsWith("c/")) return listView({ cat: h.slice(2) });
    if (h.startsWith("t/")) return listView({ tag: h.slice(2) });
    listView();
  }

  const lb = $("#lightbox");
  lb.addEventListener("click", () => lb.classList.remove("on"));
  addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("on"); });

  fetch(`${POSTS_DIR}/posts.json`)
    .then((r) => r.json())
    .then((data) => {
      posts = data.sort((a, b) => (a.id < b.id ? 1 : -1));
      addEventListener("hashchange", route);
      route();
    })
    .catch((e) => {
      app.innerHTML = `<div class="wrap empty">無法載入文章索引 posts/posts.json<br>${esc(e.message)}<br>（本機請用 <code>node tools/blog.js serve</code> 預覽，不要直接雙擊開檔）</div>`;
    });
})();
