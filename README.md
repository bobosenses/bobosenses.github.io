# yichuan's Blog

yichuan 的个人空间。以 [Chánh Đại](https://chanhdai.com/) 的窄幅网格、黑白线框和紧凑排版为设计参考，使用 Astro + TypeScript 重构。

## 本地运行

需要 Node.js 22.23.4+，建议使用 Node.js 24 LTS。

```bash
npm ci
npm run dev
```

打开 http://127.0.0.1:4321 。

```bash
npm run build  # 类型检查和静态构建，输出 dist/
npm test       # 检查文章迁移、内部链接、资源、RSS 和搜索数据
npm run preview
```

也可以运行 `bash tools/test.sh` 一次完成构建与检查。

## 内容和配置

- `src/site.config.ts`：名字、简介、头像、社交账号、首页精选文章。职位、位置和邮箱留空时隐藏。
- `_posts/YYYY-MM-DD-slug.md`：文章。保留原有 Markdown 文件，日期前缀不会进入文章链接。
- `src/styles/global.css`：颜色、网格、排版和响应式样式。
- `src/components/Blueprint.astro`：原创线框封面，支持轻微鼠标跟随，尊重减少动态效果的系统设置。
- `src/pages/about.astro`：关于页正文。
- `public/assets/avatar.png`：已下载的 GitHub 头像，运行时无需请求头像服务。

新文章示例：

```yaml
---
title: 一篇新笔记
date: 2026-11-02T10:00:00+08:00
excerpt: 可选的文章简介。
categories: [技术]
tags: [Astro]
draft: false
---
```

在 frontmatter 后面直接写 Markdown 正文。`draft: true` 和未来日期的文章不会公开。

## 页面与交互

首页、文章归档、分类、标签、关于、404、RSS 和 Sitemap 均为静态输出。原有 `/posts/slug/`、`/categories/分类/` 和 `/tags/标签/` 地址保持可用。

- `⌘K` / `Ctrl+K` / `/` 打开本地全文搜索；方向键选择，Enter 打开，Escape 关闭。
- 深浅色模式默认跟随系统，手动选择保存在本机。
- 手机导航、文章目录、代码复制、文章链接复制和返回顶部。
- 字体、头像均随站点提供，不依赖外部字体或搜索服务。

## 部署

这版不依赖 Ruby 或 Jekyll。任何静态托管服务均可部署 `dist/`。仓库的 GitHub Actions 已改成 Node.js 构建并部署到 GitHub Pages；仓库 Settings → Pages 的 Source 应为 GitHub Actions。

修改域名时，同时更新 `astro.config.mjs` 中的 `site`、`src/site.config.ts` 中的 `url` 和 `public/robots.txt` 中的 Sitemap 地址。

## 许可与致谢

MIT License。页面设计灵感来自 [Chánh Đại](https://chanhdai.com/)，使用自有内容、GitHub 头像和原创 SVG 图形；页脚保留设计参考链接。Geist 字体通过 Fontsource 随依赖安装，其许可证位于对应依赖包内。
