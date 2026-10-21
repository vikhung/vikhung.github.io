---
title: Node.js 基本指令與 Angular 起手式
date: 2022-09-11
category: 技術
tags: [nodejs, npm, angular]
summary: npm 初始化、套件管理，以及從零建立第一個 Angular 專案與四種資料綁定。
---

## Node

**1. `npm init`**

新目錄第一次使用 node 時，先執行 `npm init`，可以產生預設的 `package.json`。

**2. `npm install`**

如果要調整已下載的套件，可以手動調整 `package.json`，再把 `node_modules` 刪除，此時再執行 `npm install`，就可以下載最新的套件。

**3. 常用指令**

```bash
node -v              # 檢查版本（PS. Windows 要更新 node，只能重新下載）
npm -v               # 檢查版本
npm install -g npm   # 更新 npm
```

---

## Angular

### 1. 安裝 Angular 必要工具

1. 安裝 Node.js
2. `npm install -g typescript`
3. `npm install -g typings`
4. `npm install -g @angular/cli`（安裝 Angular CLI 工具）。用 `ng v` 或 `ng version` 檢查是否安裝成功
5. VS Code 安裝 *Angular Extension Pack*（保哥的套件）
6. Chrome 線上應用程式商店安裝 *Angular DevTools*

### 2. Create new project

```bash
ng new HelloAngular      # 使用 ng 指令建立 Angular 專案
cd HelloAngular
ng serve                 # 完成後輸入 http://localhost:4200
ng serve --open          # 自動開啟 Browser
```

### 3. 開始使用

- 參數檔：`HelloAngular\src\app\app.component.ts`
  可以調整 `title` 參數，Angular 後續會使用 `{{ }}` 來動態繫結此參數
- 首頁：`HelloAngular\src\app\app.component.html`

### 4. Angular 四種綁定機制

（MyMessageBoard 中有範例）

| 語法 | 說明 |
| --- | --- |
| `{{ value }}` | 插值（Interpolation） |
| `[property] = "value"` | 屬性繫結 |
| `(event) = "handler"` | 事件繫結 |
| `[(ngModel)] = "property"` | 雙向繫結 |

### 5. Angular CLI 說明

https://ithelp.ithome.com.tw/articles/10205484
