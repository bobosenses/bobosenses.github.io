# Bobo's Blog

个人博客，使用 Jekyll + Chirpy 主题构建，托管在 GitHub Pages。

## 特性

- 🌓 深色/浅色模式切换
- 🔍 全站搜索功能
- 📑 文章目录（TOC）
- 🏷️ 标签和分类系统
- 📱 完全响应式设计
- ⚡ 快速加载和 PWA 支持

## 技术栈

- **Jekyll** - 静态站点生成器
- **Chirpy** - 现代化 Jekyll 主题
- **GitHub Pages** - 免费托管
- **GitHub Actions** - 自动部署

## 本地开发

如果需要本地预览（可选）：

```bash
# 安装依赖
bundle install

# 启动本地服务器
bundle exec jekyll serve

# 访问 http://localhost:4000
```

## 添加新文章

在 `_posts` 目录创建新文件，格式：`YYYY-MM-DD-title.md`

```markdown
---
layout: post
title: "文章标题"
date: YYYY-MM-DD HH:MM:SS +0800
categories: [分类1, 分类2]
tags: [标签1, 标签2]
---

文章内容...
```

## 部署

推送到 GitHub 后，GitHub Actions 会自动构建和部署。

## 访问

https://bobosenses.github.io/

## 许可

MIT License
