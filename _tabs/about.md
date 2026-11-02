---
title: 关于
description: 你好！我是 Bobo，欢迎来到我的个人博客。
permalink: /about/
layout: page
order: 4
---

## 关于我

你好！我是 Bobo，欢迎来到我的个人博客。

## 关于这个博客

这个博客是我记录想法、分享知识和生活感悟的地方。主要内容包括：

- 技术文章和教程
- 学习笔记和总结
- 生活感悟和思考
- 项目经验分享

## 技术栈

这个博客使用以下技术构建：

- **Jekyll** - 静态站点生成器
- **自定义布局** - 为本站写的页面和样式
- **GitHub Pages** - 免费托管服务
- **Markdown** - 内容编写

## 联系方式

如果你想和我交流，可以通过以下方式联系我：

- GitHub: [@{{ site.profile.github }}](https://github.com/{{ site.profile.github }})
{%- assign email = site.profile.email | strip -%}
{%- if email != "" and email %}
- 邮箱: [{{ email }}](mailto:{{ email }})
{%- endif %}

感谢你的访问！
