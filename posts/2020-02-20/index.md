---
title: Slack Web Hook：用 curl 丟訊息到頻道
date: 2020-02-20
category: 技術
tags: [slack, webhook, curl]
summary: 申請 Slack App、建立 Incoming Web Hook，一行 curl 就能推播訊息。
---

> 其實還有另一種複雜版，請搜尋 Slack API。

## 步驟

1. 申請 Slack App：https://slack.com/signin?redir=/apps
2. 輸入 Workspace
3. Create App：https://api.slack.com/apps（例：`VikSlackApp`）
4. 點進 App 圖示，進入 *Basic Information*
5. 新增 Web Hook：
   - 點選 *Add features and functionality*
   - 點選 *Incoming Web Hooks*
   - 新增 Web Hook
6. 這時候 Slack 會針對 `#channel` 給一串 URL：`https://hooks.slack.com/services/T000/B000/XXXXXXXX`

只要依據下列格式，即可將訊息拋送給 Slack：

```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Hello, World!"}' \
  https://hooks.slack.com/services/T000/B000/XXXXXXXX
```

> ⚠️ 提醒：Web Hook URL 等同密碼，任何人拿到都能發訊息到你的頻道，請不要貼到公開網站。（本文的 URL 已改為假值。）
