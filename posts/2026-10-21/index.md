---
title: 在 GitHub Pages 加上 GoatCounter 瀏覽計數器
date: 2026-10-21
category: 技術
tags: [goatcounter, github-pages, javascript, 計數器]
summary: 純靜態的單頁式網誌如何加上瀏覽次數：註冊 GoatCounter、手動計數、顯示次數，以及我踩到的幾個坑。
---

GitHub Pages 只能放靜態檔案，沒有後端可以存資料，所以計數器要靠第三方服務。
我選 [GoatCounter](https://www.goatcounter.com)：個人非商業使用免費、不用 cookie（網站不需要加 cookie 提示）、後台可以看每一頁的瀏覽量。

## 一、註冊與後台設定

1. 到 https://www.goatcounter.com 註冊，填入的 site code 會變成網址 `https://<code>.goatcounter.com`
2. 登入後進入 **Settings → Site**，勾選 **Allow adding visitor counts on your website**（沒勾的話，文章頁讀不到次數）
3. 同一頁的 **Domain** 建議填成實際網站網域，例如 `vikhung.github.io`

## 二、程式怎麼接

這個網站是單頁式（hash routing），換文章時瀏覽器並不會重新載入頁面，所以官方預設的「載入時自動計一次」不夠用，要改成**每次換頁手動計數**。做法有三件事：

### 1. 載入 `count.js`，並關閉自動計數

```js
const GOATCOUNTER = "你的code";

const s = document.createElement("script");
s.async = true;
s.src = "https://gc.zgo.at/count.js";
s.dataset.goatcounter = `https://${GOATCOUNTER}.goatcounter.com/count`;
s.dataset.goatcounterSettings = JSON.stringify({ no_onload: true });
document.head.appendChild(s);
```

### 2. 每次換頁呼叫 `goatcounter.count()`

```js
function countView(path, title) {
  const t = setInterval(() => {
    if (!window.goatcounter?.count) return;   // 等 count.js 載入完成
    clearInterval(t);
    window.goatcounter.count({ path, title });
  }, 200);
}
// 路由切換時：countView("/2020-01-28", "2020-01-28");
```

### 3. 在文章頁顯示次數

GoatCounter 提供讀取單頁次數的網址：

```
https://<code>.goatcounter.com/counter/<編碼過的路徑>.json
```

```js
const res = await fetch(`https://${GOATCOUNTER}.goatcounter.com/counter/${encodeURIComponent("/" + id)}.json`);
const { count } = await res.json();
```

## 三、避免本機測試灌水

本機預覽時不要計數，不然自己的測試都會算進統計：

```js
const isLocal = ["localhost", "127.0.0.1", ""].includes(location.hostname);
if (GOATCOUNTER && !isLocal) { /* 才載入 count.js 與計數 */ }
```

> `count.js` 本身對 localhost 也預設不送出計數。如果真的想在本機驗證，要在設定加 `allow_local: true`，驗證完記得拿掉。

## 四、踩到的坑

1. **後台沒勾 "Allow adding visitor counts"**：計數雖然有記，但文章頁讀不到次數。
2. **沒有紀錄的頁面會回 404**：GoatCounter 對「還沒有任何瀏覽紀錄」的頁面，回的是 HTTP 404 加上 `{"count":"0"}`。我一開始把非 200 都當成失敗，結果頁面一直顯示「無法取得次數」。**404 要當成 0 處理**。
3. **計數是延遲寫入的**：送出計數後要等幾秒才查得到，所以顯示次數前先等一下，次數是 0 時再重試一次。
4. **顯示元素不要預設隱藏**：我最初把次數藏起來、成功才顯示，結果出問題時完全看不出來。後來改成固定顯示一個徽章，並區分「統計中…」「N 次瀏覽」「無法取得次數」等狀態，除錯容易很多。
5. **本機測不出最終結果**：最後仍要上線到 `https://<帳號>.github.io` 實測，才能確認整條路徑（後台設定、網域、計數寫入）都正常。

## 五、上線後驗證清單

- [ ] 打開任一篇文章，標題下方的徽章顯示「👁 N 次瀏覽」
- [ ] 等約 10 秒後，到 GoatCounter 後台 Dashboard 看到該頁的紀錄
- [ ] 確認 `isLocal` 已恢復為判斷 localhost 的版本，且沒有殘留 `allow_local`
