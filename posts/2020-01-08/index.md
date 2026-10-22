---
title: 建立 GitHub Blog 與版控流程
date: 2020-01-08
category: 技術
tags: [github, git, vscode]
summary: 從建立 vikhung.github.io Repository，到 GitHub Desktop 與 Visual Studio Code 的版控操作。
---
![建立 GitHub Blog 與版控流程](banner.svg)


## 1. 建立 Blog 步驟

1. 登入 GitHub，建立新 Repository，名稱為 `vikhung.github.io`
2. 新增 `index.html`
3. 測試：https://vikhung.github.io

## 2. PC 端版控

1. 下載 GitHub Desktop
2. 於 GitHub 上將 `vikhung.github.io` Repository Clone 至 PC
3. 此時可於 GitHub Desktop 進行版控
4. 測試：開啟編輯器修改 `index.html`，並於 GitHub Desktop 先 Commit，再 Fetch Origin
5. 於 GitHub Server 確認版本是否已更新至 Server 端

## 3. Visual Studio Code 編輯及版控

1. 於 GitHub Desktop 中開啟 "Open in Visual Studio Code"，系統會開啟 VS Code
2. 在 "Explorer" 中修改 `index.html`
3. 在 "Source Control" 會出現檔案異動符號
4. 將檔案先 stage change（點選 + 號）
   > 還不太會用，這有點像是先少量儲存？
5. 每次少少異動後，可以陸續 stage change
6. 在 "Source Control" 執行 Commit 並輸入註解（點選打勾符號）——此時尚未 Push 到 Server
7. 在 "Source Control" 執行 Push（開啟 `...`，並點選 Push）
8. 測試：於 GitHub Server 確認版本是否已更新至 Server 端
