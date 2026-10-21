---
title: Minikube 安裝程序
date: 2021-04-25
category: 技術
tags: [kubernetes, minikube, docker]
summary: 在 Ubuntu 上安裝 kubectl 與 minikube，並用 docker driver 啟動。
---

## 1. 安裝 kubectl 工具

```bash
sudo apt-get install -y kubectl
```

## 2. 安裝 minikube

```bash
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube
sudo cp minikube /usr/local/bin/
rm minikube
```

## 3. 啟動 minikube

```bash
minikube start --driver=docker
```
