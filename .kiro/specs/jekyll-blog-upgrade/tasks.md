# Implementation Plan: Jekyll Blog Upgrade

## Overview

本实施计划将现有的静态 HTML 博客升级为基于 Jekyll 框架的现代化博客系统。实施过程分为项目初始化、核心结构搭建、样式系统实现、内容迁移和最终集成五个主要阶段。每个阶段包含具体的编码任务，确保增量式开发和持续验证。

## Tasks

- [x] 1. 初始化 Jekyll 项目结构和配置文件
  - 创建 `_config.yml` 配置文件，包含站点元数据、构建设置和插件配置
  - 创建 `Gemfile` 定义 Ruby 依赖（Jekyll 3.9.x 和必需插件）
  - 创建 `.gitignore` 文件排除生成文件和缓存
  - 创建 `robots.txt` 用于 SEO 爬虫配置
  - 创建项目目录结构（_layouts, _includes, _posts, _sass, assets）
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 10.1, 10.3, 10.6, 13.3_

- [x] 2. 实现 SCSS 样式系统
  - [x] 2.1 创建 SCSS 变量和设计令牌
    - 创建 `_sass/_variables.scss` 定义颜色、排版、间距、圆角、阴影、过渡和断点变量
    - _Requirements: 9.2, 9.3, 15.3, 15.4_
  
  - [x] 2.2 实现基础样式和重置
    - 创建 `_sass/_base.scss` 包含 CSS reset、排版、链接、列表、代码和图片基础样式
    - _Requirements: 9.1, 9.5, 6.2, 6.5_
  
  - [x] 2.3 实现布局样式
    - 创建 `_sass/_layout.scss` 包含 header、footer、导航和响应式布局样式
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 2.4 实现组件样式
    - 创建 `_sass/_components.scss` 包含 Hero 区域、文章卡片、文章页面和动画效果
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 6.1, 6.3, 15.1, 15.2, 15.6_
  
  - [x] 2.5 实现代码语法高亮样式
    - 创建 `_sass/_syntax.scss` 使用 Rouge 的 monokai 主题
    - _Requirements: 6.5, 9.4_
  
  - [x] 2.6 创建主样式文件
    - 创建 `assets/css/main.scss` 导入所有 SCSS 模块
    - _Requirements: 9.1, 9.6_

- [x] 3. 实现可复用组件（_includes）
  - [x] 3.1 创建 head 组件
    - 创建 `_includes/head.html` 包含 meta 标签、SEO 标签、Open Graph 标签和样式表引用
    - _Requirements: 12.1, 12.2, 12.6_
  
  - [x] 3.2 创建 header 组件
    - 创建 `_includes/header.html` 包含站点标题和导航菜单，支持当前页面高亮
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 3.3 创建 footer 组件
    - 创建 `_includes/footer.html` 包含版权信息和技术栈链接
    - _Requirements: 1.1_
  
  - [x] 3.4 创建文章卡片组件
    - 创建 `_includes/post-card.html` 实现可复用的文章卡片，包含标题、日期和摘要
    - _Requirements: 3.6, 7.2, 7.3_

- [x] 4. 实现布局模板（_layouts）
  - [x] 4.1 创建默认布局
    - 创建 `_layouts/default.html` 作为所有页面的基础布局，包含 head、header、main 和 footer
    - _Requirements: 1.2, 12.3_
  
  - [x] 4.2 创建首页布局
    - 创建 `_layouts/home.html` 继承 default 布局，包含 Hero 区域和文章网格
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [x] 4.3 创建文章页布局
    - 创建 `_layouts/post.html` 继承 default 布局，优化阅读体验
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 12.3_
  
  - [x] 4.4 创建普通页面布局
    - 创建 `_layouts/page.html` 继承 default 布局，用于关于和归档页面
    - _Requirements: 1.2_

- [ ] 5. Checkpoint - 验证结构和样式
  - 运行 `bundle exec jekyll build` 验证构建成功
  - 运行 `bundle exec jekyll serve` 启动本地服务器
  - 检查 SCSS 编译无错误，验证样式文件生成
  - 确保所有测试通过，如有问题请询问用户

- [ ] 6. 迁移和创建内容文件
  - [ ] 6.1 创建三篇示例博客文章
    - 创建 `_posts/2026-05-09-welcome.md` - 欢迎文章
    - 创建 `_posts/2026-05-08-github-pages-blog.md` - GitHub Pages 教程
    - 创建 `_posts/2026-05-07-writing-meaning.md` - 写作意义
    - 每篇文章包含有效的 Front Matter（title, date, layout, excerpt）和 Markdown 正文
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 14.1, 14.2, 14.4_
  
  - [ ] 6.2 创建首页
    - 创建 `index.html` 使用 home 布局
    - _Requirements: 3.1, 3.2_
  
  - [ ] 6.3 创建归档页面
    - 创建 `archive.html` 使用 page 布局，按年份分组显示所有文章
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 6.4 创建关于页面
    - 创建 `about.md` 使用 page 布局，包含作者简介和联系方式
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 7. 创建项目文档
  - [ ] 7.1 创建 README.md
    - 编写项目说明、特性列表、本地开发指南、部署说明和技术栈信息
    - _Requirements: 13.4_
  
  - [ ] 7.2 添加示例文章模板
    - 在 README.md 中提供创建新文章的 Front Matter 模板
    - _Requirements: 13.5_

- [ ] 8. SEO 和性能优化
  - [ ] 8.1 配置 SEO 插件
    - 在 `_config.yml` 中启用 jekyll-seo-tag 和 jekyll-sitemap 插件
    - 验证 sitemap.xml 和 feed.xml 自动生成
    - _Requirements: 12.4, 12.5_
  
  - [ ] 8.2 优化外部链接安全性
    - 在布局模板中为外部链接添加 `rel="noopener noreferrer"` 属性
    - _Requirements: 14.5_
  
  - [ ] 8.3 优化性能
    - 验证 CSS 最小化（生产环境）
    - 确保语义化 HTML 减少 DOM 深度
    - 检查响应式图片和资源优化
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 9. 响应式设计验证和调整
  - [ ] 9.1 实现移动端导航优化
    - 在 `_sass/_layout.scss` 中添加移动端导航样式（简化或汉堡菜单）
    - _Requirements: 4.5, 5.5_
  
  - [ ] 9.2 验证触摸目标尺寸
    - 确保所有交互元素在移动设备上最小 44x44px
    - _Requirements: 4.6_
  
  - [ ] 9.3 测试响应式断点
    - 验证桌面（>1024px）、平板（768px-1024px）、移动（<768px）布局
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 10. 最终集成和验证
  - [ ] 10.1 构建完整站点
    - 运行 `bundle exec jekyll build` 生成完整静态站点到 `_site` 目录
    - _Requirements: 1.6_
  
  - [ ] 10.2 本地测试完整功能
    - 运行 `bundle exec jekyll serve` 启动本地服务器
    - 测试所有页面导航、文章链接、响应式布局
    - 验证 Markdown 渲染、代码高亮、中英文混排
    - _Requirements: 13.1, 13.2, 14.1, 14.2, 14.3, 14.4_
  
  - [ ] 10.3 验证 GitHub Pages 兼容性
    - 确认仅使用白名单插件
    - 验证 baseurl 和 url 配置正确
    - 检查 .gitignore 排除 _site 目录
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 11. Final Checkpoint - 完整验证
  - 确保所有文件已创建且结构正确
  - 验证本地构建和服务器运行无错误
  - 检查所有需求覆盖完整
  - 准备推送到 GitHub 进行自动部署
  - 如有任何问题请询问用户

## Notes

- 本项目使用 Jekyll 静态站点生成器，主要涉及 HTML、SCSS、Liquid 模板和 Markdown 内容
- 所有样式使用 SCSS 模块化组织，通过 `assets/css/main.scss` 统一导入
- 布局模板使用 Liquid 语法，支持继承和组件复用
- 内容文件使用 Markdown 格式，通过 Front Matter 定义元数据
- 项目完全兼容 GitHub Pages，仅使用白名单插件
- 响应式设计支持桌面、平板和移动设备
- SEO 优化通过插件自动生成 sitemap 和 meta 标签
- 每个 Checkpoint 任务用于验证阶段性成果，确保增量开发质量

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1"]
    },
    {
      "id": 1,
      "tasks": ["2.1"]
    },
    {
      "id": 2,
      "tasks": ["2.2", "2.3", "2.4", "2.5"]
    },
    {
      "id": 3,
      "tasks": ["2.6"]
    },
    {
      "id": 4,
      "tasks": ["3.1", "3.2", "3.3", "3.4"]
    },
    {
      "id": 5,
      "tasks": ["4.1"]
    },
    {
      "id": 6,
      "tasks": ["4.2", "4.3", "4.4"]
    },
    {
      "id": 7,
      "tasks": ["6.1", "6.2", "6.3", "6.4"]
    },
    {
      "id": 8,
      "tasks": ["7.1", "7.2"]
    },
    {
      "id": 9,
      "tasks": ["8.1", "8.2", "8.3"]
    },
    {
      "id": 10,
      "tasks": ["9.1", "9.2", "9.3"]
    },
    {
      "id": 11,
      "tasks": ["10.1"]
    },
    {
      "id": 12,
      "tasks": ["10.2", "10.3"]
    }
  ]
}
```
