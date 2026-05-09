# Design Document

## Introduction

本文档描述了将静态 HTML 博客升级为 Jekyll 框架博客系统的技术设计方案。设计遵循 GitHub Pages 兼容性要求，采用现代化的视觉设计和响应式布局，提供优秀的用户体验和开发体验。

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Pages                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Jekyll Build Process                      │  │
│  │  ┌─────────────┐      ┌──────────────┐               │  │
│  │  │ Source Files│─────▶│ Jekyll Engine│               │  │
│  │  │ (_posts,    │      │              │               │  │
│  │  │  _layouts,  │      │  - Liquid    │               │  │
│  │  │  _includes, │      │  - Markdown  │               │  │
│  │  │  assets)    │      │  - SCSS      │               │  │
│  │  └─────────────┘      └──────┬───────┘               │  │
│  │                              │                         │  │
│  │                              ▼                         │  │
│  │                       ┌──────────────┐                │  │
│  │                       │ Static Site  │                │  │
│  │                       │   (_site/)   │                │  │
│  │                       └──────────────┘                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Web Browser    │
                    │  (User Access)   │
                    └──────────────────┘
```

### Directory Structure


```
bobosenses.github.io/
├── _config.yml              # Jekyll 配置文件
├── Gemfile                  # Ruby 依赖定义
├── .gitignore              # Git 忽略文件
├── README.md               # 项目说明文档
├── index.html              # 首页（使用 home 布局）
├── archive.html            # 归档页面
├── about.md                # 关于页面
├── robots.txt              # SEO 爬虫配置
├── _layouts/               # 布局模板目录
│   ├── default.html        # 基础布局模板
│   ├── home.html           # 首页布局
│   ├── post.html           # 文章页布局
│   └── page.html           # 普通页面布局
├── _includes/              # 可复用组件目录
│   ├── head.html           # HTML head 部分
│   ├── header.html         # 页面头部（导航）
│   ├── footer.html         # 页面底部
│   └── post-card.html      # 文章卡片组件
├── _posts/                 # 博客文章目录
│   ├── 2026-05-09-welcome.md
│   ├── 2026-05-08-github-pages-blog.md
│   └── 2026-05-07-writing-meaning.md
├── _sass/                  # SCSS 模块目录
│   ├── _variables.scss     # 设计变量
│   ├── _base.scss          # 基础样式
│   ├── _layout.scss        # 布局样式
│   ├── _components.scss    # 组件样式
│   └── _syntax.scss        # 代码高亮样式
├── assets/                 # 静态资源目录
│   ├── css/
│   │   └── main.scss       # 主样式文件（导入所有 SCSS）
│   └── images/             # 图片资源
└── _site/                  # 生成的静态站点（被 .gitignore 忽略）
```

## Component Design

### 1. Configuration (_config.yml)


**Purpose**: 定义 Jekyll 站点的全局配置和元数据

**Key Configuration**:
```yaml
# 站点信息
title: "Bobo's Blog"
description: "记录想法，分享生活"
author: "Bobo"
email: ""

# GitHub Pages 配置
baseurl: ""
url: "https://bobosenses.github.io"

# 构建设置
markdown: kramdown
theme: null
plugins:
  - jekyll-feed
  - jekyll-seo-tag
  - jekyll-sitemap

# Kramdown 配置
kramdown:
  input: GFM
  syntax_highlighter: rouge
  syntax_highlighter_opts:
    css_class: 'highlight'

# 排除文件
exclude:
  - Gemfile
  - Gemfile.lock
  - README.md
  - .gitignore

# 分页设置（可选）
paginate: 10
paginate_path: "/page:num/"

# 默认值
defaults:
  - scope:
      path: ""
      type: "posts"
    values:
      layout: "post"
      comments: false
```

**Design Rationale**:
- 使用 kramdown 作为 Markdown 解析器（GitHub Pages 默认）
- 启用 GFM（GitHub Flavored Markdown）支持
- 使用 rouge 进行代码语法高亮
- 仅使用 GitHub Pages 白名单插件

### 2. Layout Templates

#### 2.1 Default Layout (_layouts/default.html)


**Purpose**: 所有页面的基础布局模板，定义 HTML 结构和通用元素

**Structure**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  {% include head.html %}
</head>
<body>
  {% include header.html %}
  
  <main class="main-content">
    {{ content }}
  </main>
  
  {% include footer.html %}
</body>
</html>
```

**Features**:
- 语义化 HTML5 结构
- 包含 head、header、footer 组件
- 使用 Liquid 模板语法插入内容
- 响应式 viewport 设置

#### 2.2 Home Layout (_layouts/home.html)

**Purpose**: 首页专用布局，展示 Hero 区域和文章列表

**Structure**:
```html
---
layout: default
---

<div class="hero-section">
  <div class="hero-content">
    <h1 class="hero-title">{{ site.title }}</h1>
    <p class="hero-description">{{ site.description }}</p>
  </div>
</div>

<div class="posts-container">
  <div class="posts-grid">
    {% for post in site.posts limit:6 %}
      {% include post-card.html %}
    {% endfor %}
  </div>
</div>
```

**Features**:
- Hero 区域：大标题 + 描述 + 渐变背景
- 文章网格：使用 CSS Grid 布局
- 限制显示最新 6 篇文章
- 响应式卡片布局

#### 2.3 Post Layout (_layouts/post.html)


**Purpose**: 单篇文章页面布局，优化阅读体验

**Structure**:
```html
---
layout: default
---

<article class="post">
  <header class="post-header">
    <h1 class="post-title">{{ page.title }}</h1>
    <time class="post-date" datetime="{{ page.date | date_to_xmlschema }}">
      {{ page.date | date: "%Y年%m月%d日" }}
    </time>
  </header>
  
  <div class="post-content">
    {{ content }}
  </div>
  
  <footer class="post-footer">
    <a href="/" class="back-link">← 返回首页</a>
    <a href="/archive.html" class="archive-link">查看更多文章 →</a>
  </footer>
</article>
```

**Features**:
- 语义化 article 标签
- 标准化日期格式
- 限制内容宽度（600-800px）
- 底部导航链接

#### 2.4 Page Layout (_layouts/page.html)

**Purpose**: 普通页面布局（关于、归档等）

**Structure**:
```html
---
layout: default
---

<div class="page">
  <header class="page-header">
    <h1 class="page-title">{{ page.title }}</h1>
  </header>
  
  <div class="page-content">
    {{ content }}
  </div>
</div>
```

### 3. Include Components

#### 3.1 Head Component (_includes/head.html)


**Purpose**: HTML head 部分，包含元数据和资源引用

**Content**:
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- SEO Meta Tags -->
<title>{% if page.title %}{{ page.title }} | {% endif %}{{ site.title }}</title>
<meta name="description" content="{% if page.excerpt %}{{ page.excerpt | strip_html | strip_newlines | truncate: 160 }}{% else %}{{ site.description }}{% endif %}">
<meta name="author" content="{{ site.author }}">

<!-- Open Graph Tags -->
<meta property="og:title" content="{% if page.title %}{{ page.title }}{% else %}{{ site.title }}{% endif %}">
<meta property="og:description" content="{% if page.excerpt %}{{ page.excerpt | strip_html | strip_newlines | truncate: 160 }}{% else %}{{ site.description }}{% endif %}">
<meta property="og:type" content="{% if page.date %}article{% else %}website{% endif %}">
<meta property="og:url" content="{{ page.url | absolute_url }}">

<!-- Stylesheets -->
<link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">

<!-- Favicon (optional) -->
<link rel="icon" type="image/png" href="{{ '/assets/images/favicon.png' | relative_url }}">
```

**Features**:
- 响应式 viewport 设置
- 动态 title 和 description
- Open Graph 社交媒体标签
- 条件渲染（文章 vs 页面）

#### 3.2 Header Component (_includes/header.html)


**Purpose**: 网站头部导航组件

**Content**:
```html
<header class="site-header">
  <div class="header-container">
    <a href="/" class="site-title">{{ site.title }}</a>
    
    <nav class="site-nav">
      <a href="/" class="nav-link {% if page.url == '/' %}active{% endif %}">首页</a>
      <a href="/archive.html" class="nav-link {% if page.url == '/archive.html' %}active{% endif %}">归档</a>
      <a href="/about.html" class="nav-link {% if page.url == '/about.html' %}active{% endif %}">关于</a>
    </nav>
  </div>
</header>
```

**Features**:
- 固定或粘性定位（可选）
- 当前页面高亮显示
- 响应式导航（移动端简化）
- 平滑过渡动画

#### 3.3 Footer Component (_includes/footer.html)

**Purpose**: 网站底部组件

**Content**:
```html
<footer class="site-footer">
  <div class="footer-container">
    <p class="footer-text">
      &copy; {{ 'now' | date: "%Y" }} {{ site.title }} &middot; 
      Powered by <a href="https://jekyllrb.com/" target="_blank" rel="noopener">Jekyll</a> & 
      <a href="https://pages.github.com/" target="_blank" rel="noopener">GitHub Pages</a>
    </p>
  </div>
</footer>
```

#### 3.4 Post Card Component (_includes/post-card.html)


**Purpose**: 可复用的文章卡片组件

**Content**:
```html
<article class="post-card">
  <a href="{{ post.url | relative_url }}" class="post-card-link">
    <h2 class="post-card-title">{{ post.title }}</h2>
    <time class="post-card-date" datetime="{{ post.date | date_to_xmlschema }}">
      {{ post.date | date: "%Y-%m-%d" }}
    </time>
    <p class="post-card-excerpt">
      {{ post.excerpt | strip_html | truncate: 120 }}
    </p>
  </a>
</article>
```

**Features**:
- 卡片式设计（阴影、圆角）
- 悬停动画效果
- 自动截取摘要
- 响应式布局

## Style System Design

### 4. SCSS Architecture

#### 4.1 Variables (_sass/_variables.scss)


**Purpose**: 定义设计令牌和主题变量

**Content**:
```scss
// 颜色系统
$color-primary: #2d7d9a;
$color-primary-dark: #1e5a6f;
$color-text: #333;
$color-text-light: #555;
$color-text-muted: #888;
$color-border: #eee;
$color-background: #fafafa;
$color-white: #fff;

// 渐变色
$gradient-hero: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$gradient-card: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

// 排版
$font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif;
$font-family-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;

$font-size-base: 16px;
$font-size-large: 18px;
$font-size-small: 14px;
$font-size-h1: 2.5rem;
$font-size-h2: 2rem;
$font-size-h3: 1.5rem;

$line-height-base: 1.7;
$line-height-heading: 1.3;

// 间距
$spacing-xs: 8px;
$spacing-sm: 16px;
$spacing-md: 24px;
$spacing-lg: 40px;
$spacing-xl: 64px;

// 布局
$max-width-content: 720px;
$max-width-post: 800px;
$max-width-wide: 1200px;

// 圆角
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;

// 阴影
$shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
$shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.2);

// 过渡
$transition-fast: 200ms ease;
$transition-base: 300ms ease;

// 断点
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1024px;
```

#### 4.2 Base Styles (_sass/_base.scss)


**Purpose**: 基础样式和重置

**Content**:
```scss
// CSS Reset
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

// Body
body {
  font-family: $font-family-base;
  font-size: $font-size-base;
  line-height: $line-height-base;
  color: $color-text;
  background: $color-background;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// Typography
h1, h2, h3, h4, h5, h6 {
  line-height: $line-height-heading;
  font-weight: 600;
  margin-bottom: $spacing-sm;
}

h1 { font-size: $font-size-h1; }
h2 { font-size: $font-size-h2; }
h3 { font-size: $font-size-h3; }

p {
  margin-bottom: $spacing-sm;
}

// Links
a {
  color: $color-primary;
  text-decoration: none;
  transition: color $transition-fast;
  
  &:hover {
    color: $color-primary-dark;
  }
}

// Lists
ul, ol {
  margin-left: $spacing-md;
  margin-bottom: $spacing-sm;
}

// Code
code {
  font-family: $font-family-mono;
  font-size: 0.9em;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: $border-radius-sm;
}

pre {
  background: #282c34;
  color: #abb2bf;
  padding: $spacing-sm;
  border-radius: $border-radius-md;
  overflow-x: auto;
  margin-bottom: $spacing-sm;
  
  code {
    background: none;
    padding: 0;
  }
}

// Images
img {
  max-width: 100%;
  height: auto;
  display: block;
}
```

#### 4.3 Layout Styles (_sass/_layout.scss)


**Purpose**: 页面布局样式

**Content**:
```scss
// Main Content
.main-content {
  flex: 1;
  width: 100%;
}

// Header
.site-header {
  background: $color-white;
  border-bottom: 1px solid $color-border;
  padding: $spacing-md $spacing-sm;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: $shadow-sm;
}

.header-container {
  max-width: $max-width-wide;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: $color-text;
  
  &:hover {
    color: $color-primary;
  }
}

.site-nav {
  display: flex;
  gap: $spacing-md;
}

.nav-link {
  color: $color-text-light;
  font-size: 0.95rem;
  transition: color $transition-fast;
  
  &:hover,
  &.active {
    color: $color-primary;
  }
}

// Footer
.site-footer {
  background: $color-white;
  border-top: 1px solid $color-border;
  padding: $spacing-md $spacing-sm;
  text-align: center;
  margin-top: auto;
}

.footer-text {
  font-size: $font-size-small;
  color: $color-text-muted;
  
  a {
    color: $color-text-muted;
    
    &:hover {
      color: $color-primary;
    }
  }
}

// Responsive
@media (max-width: $breakpoint-mobile) {
  .site-header {
    padding: $spacing-sm;
  }
  
  .site-title {
    font-size: 1.25rem;
  }
  
  .site-nav {
    gap: $spacing-sm;
  }
  
  .nav-link {
    font-size: 0.85rem;
  }
}
```

#### 4.4 Component Styles (_sass/_components.scss)


**Purpose**: 组件样式（Hero、卡片、文章等）

**Content**:
```scss
// Hero Section
.hero-section {
  background: $gradient-hero;
  color: $color-white;
  padding: $spacing-xl $spacing-sm;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,...') repeat;
    opacity: 0.1;
  }
}

.hero-content {
  max-width: $max-width-content;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: $spacing-sm;
  animation: fadeInUp 0.8s ease;
}

.hero-description {
  font-size: 1.25rem;
  opacity: 0.95;
  animation: fadeInUp 1s ease;
}

// Posts Container
.posts-container {
  max-width: $max-width-wide;
  margin: 0 auto;
  padding: $spacing-lg $spacing-sm;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-md;
}

// Post Card
.post-card {
  background: $color-white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  transition: transform $transition-base, box-shadow $transition-base;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }
}

.post-card-link {
  display: block;
  padding: $spacing-md;
  color: $color-text;
  
  &:hover {
    color: $color-text;
  }
}

.post-card-title {
  font-size: 1.35rem;
  margin-bottom: $spacing-xs;
  color: $color-text;
  transition: color $transition-fast;
  
  .post-card:hover & {
    color: $color-primary;
  }
}

.post-card-date {
  display: block;
  font-size: $font-size-small;
  color: $color-text-muted;
  margin-bottom: $spacing-sm;
}

.post-card-excerpt {
  color: $color-text-light;
  line-height: 1.6;
}

// Post Page
.post {
  max-width: $max-width-post;
  margin: 0 auto;
  padding: $spacing-lg $spacing-sm;
  background: $color-white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  margin-top: $spacing-lg;
  margin-bottom: $spacing-lg;
}

.post-header {
  margin-bottom: $spacing-lg;
  padding-bottom: $spacing-md;
  border-bottom: 2px solid $color-border;
}

.post-title {
  font-size: 2.5rem;
  margin-bottom: $spacing-sm;
}

.post-date {
  display: block;
  color: $color-text-muted;
  font-size: $font-size-small;
}

.post-content {
  font-size: $font-size-large;
  line-height: 1.8;
  
  h2, h3, h4 {
    margin-top: $spacing-lg;
    margin-bottom: $spacing-sm;
  }
}

.post-footer {
  margin-top: $spacing-lg;
  padding-top: $spacing-md;
  border-top: 1px solid $color-border;
  display: flex;
  justify-content: space-between;
  gap: $spacing-sm;
}

// Page
.page {
  max-width: $max-width-content;
  margin: 0 auto;
  padding: $spacing-lg $spacing-sm;
}

.page-header {
  margin-bottom: $spacing-lg;
}

.page-title {
  font-size: 2.5rem;
}

// Animations
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: $breakpoint-mobile) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .post-title {
    font-size: 2rem;
  }
  
  .post-footer {
    flex-direction: column;
  }
}
```

#### 4.5 Syntax Highlighting (_sass/_syntax.scss)


**Purpose**: 代码语法高亮样式（基于 Rouge）

**Content**:
```scss
// 使用 Rouge 的 monokai 主题
.highlight {
  background: #282c34;
  color: #abb2bf;
  border-radius: $border-radius-md;
  padding: $spacing-sm;
  overflow-x: auto;
  
  .c { color: #5c6370; font-style: italic; } // Comment
  .k { color: #c678dd; } // Keyword
  .o { color: #56b6c2; } // Operator
  .cm { color: #5c6370; font-style: italic; } // Comment.Multiline
  .cp { color: #5c6370; } // Comment.Preproc
  .c1 { color: #5c6370; font-style: italic; } // Comment.Single
  .cs { color: #5c6370; font-style: italic; } // Comment.Special
  .gd { color: #e06c75; } // Generic.Deleted
  .ge { font-style: italic; } // Generic.Emph
  .gh { color: #abb2bf; font-weight: bold; } // Generic.Heading
  .gi { color: #98c379; } // Generic.Inserted
  .gp { color: #5c6370; font-weight: bold; } // Generic.Prompt
  .gs { font-weight: bold; } // Generic.Strong
  .gu { color: #56b6c2; font-weight: bold; } // Generic.Subheading
  .kc { color: #c678dd; } // Keyword.Constant
  .kd { color: #c678dd; } // Keyword.Declaration
  .kn { color: #c678dd; } // Keyword.Namespace
  .kp { color: #c678dd; } // Keyword.Pseudo
  .kr { color: #c678dd; } // Keyword.Reserved
  .kt { color: #e5c07b; } // Keyword.Type
  .m { color: #d19a66; } // Literal.Number
  .s { color: #98c379; } // Literal.String
  .na { color: #61afef; } // Name.Attribute
  .nb { color: #e5c07b; } // Name.Builtin
  .nc { color: #e5c07b; } // Name.Class
  .no { color: #e06c75; } // Name.Constant
  .nd { color: #61afef; } // Name.Decorator
  .ni { color: #abb2bf; } // Name.Entity
  .ne { color: #e06c75; } // Name.Exception
  .nf { color: #61afef; } // Name.Function
  .nl { color: #abb2bf; } // Name.Label
  .nn { color: #abb2bf; } // Name.Namespace
  .nt { color: #e06c75; } // Name.Tag
  .nv { color: #e06c75; } // Name.Variable
  .ow { color: #56b6c2; } // Operator.Word
  .w { color: #abb2bf; } // Text.Whitespace
  .mf { color: #d19a66; } // Literal.Number.Float
  .mh { color: #d19a66; } // Literal.Number.Hex
  .mi { color: #d19a66; } // Literal.Number.Integer
  .mo { color: #d19a66; } // Literal.Number.Oct
  .sb { color: #98c379; } // Literal.String.Backtick
  .sc { color: #abb2bf; } // Literal.String.Char
  .sd { color: #5c6370; font-style: italic; } // Literal.String.Doc
  .s2 { color: #98c379; } // Literal.String.Double
  .se { color: #d19a66; } // Literal.String.Escape
  .sh { color: #98c379; } // Literal.String.Heredoc
  .si { color: #d19a66; } // Literal.String.Interpol
  .sx { color: #98c379; } // Literal.String.Other
  .sr { color: #56b6c2; } // Literal.String.Regex
  .s1 { color: #98c379; } // Literal.String.Single
  .ss { color: #56b6c2; } // Literal.String.Symbol
  .bp { color: #e5c07b; } // Name.Builtin.Pseudo
  .vc { color: #e06c75; } // Name.Variable.Class
  .vg { color: #e06c75; } // Name.Variable.Global
  .vi { color: #e06c75; } // Name.Variable.Instance
  .il { color: #d19a66; } // Literal.Number.Integer.Long
}
```

#### 4.6 Main SCSS (assets/css/main.scss)


**Purpose**: 主样式文件，导入所有 SCSS 模块

**Content**:
```scss
---
---

// Import all SCSS modules
@import "variables";
@import "base";
@import "layout";
@import "components";
@import "syntax";
```

**Note**: 前置的 `---` 是必需的，告诉 Jekyll 处理这个 SCSS 文件

## Content Design

### 5. Post Migration

#### 5.1 Post File Structure

**File Naming**: `YYYY-MM-DD-title.md`

**Example**: `2026-05-09-welcome.md`

**Front Matter Template**:
```yaml
---
layout: post
title: "欢迎来到我的博客"
date: 2026-05-09 10:00:00 +0800
categories: [blog, welcome]
tags: [introduction]
excerpt: "这是博客的第一篇文章。这里将记录技术探索、生活感悟和一切值得分享的内容。"
---
```

#### 5.2 Migrated Posts

**Post 1**: `_posts/2026-05-09-welcome.md`
```markdown
---
layout: post
title: "欢迎来到我的博客"
date: 2026-05-09 10:00:00 +0800
excerpt: "这是博客的第一篇文章。这里将记录技术探索、生活感悟和一切值得分享的内容。"
---

这是博客的第一篇文章。这里将记录技术探索、生活感悟和一切值得分享的内容。

感谢你的到来，希望这里能给你带来一些有用的东西。

## 关于这个博客

这个博客使用 Jekyll 构建，托管在 GitHub Pages 上。它是一个简洁、快速、现代化的个人博客平台。

## 未来计划

- 分享技术文章
- 记录学习笔记
- 分享生活感悟
- 探索新技术

欢迎常来看看！
```

**Post 2**: `_posts/2026-05-08-github-pages-blog.md`
```markdown
---
layout: post
title: "用 GitHub Pages 搭建个人博客"
date: 2026-05-08 15:30:00 +0800
excerpt: "从零开始，用最简单的方式在 GitHub Pages 上搭建一个属于自己的博客站点。"
---

从零开始，用最简单的方式在 GitHub Pages 上搭建一个属于自己的博客站点。

## 为什么选择 GitHub Pages

- 完全免费
- 自动部署
- 支持自定义域名
- 使用 Git 管理内容

## 使用 Jekyll

Jekyll 是一个静态站点生成器，非常适合博客：

- 使用 Markdown 写作
- 支持模板和布局
- 丰富的插件生态
- GitHub Pages 原生支持

## 开始搭建

1. 创建 GitHub 仓库
2. 配置 Jekyll
3. 编写内容
4. 推送到 GitHub

就是这么简单！
```

**Post 3**: `_posts/2026-05-07-writing-meaning.md`
```markdown
---
layout: post
title: "开始写作的意义"
date: 2026-05-07 20:00:00 +0800
excerpt: "写作不仅是输出，更是一种思考方式。把想法写下来，才能看清它们的脉络。"
---

写作不仅是输出，更是一种思考方式。

## 为什么写作

把想法写下来，才能看清它们的脉络。这个博客就是这样一个让思考沉淀的地方。

## 写作的好处

- **整理思路**：写作迫使你把模糊的想法具体化
- **加深理解**：教是最好的学
- **记录成长**：回顾过去的文章，看到自己的进步
- **分享交流**：与他人分享知识和经验

## 开始行动

不要追求完美，先开始写。每一篇文章都是进步。
```

### 6. Page Design

#### 6.1 Home Page (index.html)


**Content**:
```html
---
layout: home
title: 首页
---
```

**Note**: 内容由 home 布局模板生成

#### 6.2 Archive Page (archive.html)

**Content**:
```html
---
layout: page
title: 归档
permalink: /archive.html
---

<div class="archive-list">
  {% for post in site.posts %}
    {% assign current_year = post.date | date: "%Y" %}
    {% assign previous_year = post.previous.date | date: "%Y" %}
    
    {% if current_year != previous_year %}
      <h2 class="archive-year">{{ current_year }}</h2>
    {% endif %}
    
    <article class="archive-item">
      <time class="archive-date" datetime="{{ post.date | date_to_xmlschema }}">
        {{ post.date | date: "%m-%d" }}
      </time>
      <a href="{{ post.url | relative_url }}" class="archive-link">
        {{ post.title }}
      </a>
    </article>
  {% endfor %}
</div>

<style>
.archive-list {
  max-width: 720px;
  margin: 0 auto;
}

.archive-year {
  font-size: 1.75rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
}

.archive-item {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.archive-item:hover {
  background: #f5f5f5;
}

.archive-date {
  font-size: 0.9rem;
  color: #888;
  min-width: 60px;
  margin-right: 1rem;
}

.archive-link {
  color: #333;
  font-size: 1rem;
}

.archive-link:hover {
  color: #2d7d9a;
}
</style>
```

#### 6.3 About Page (about.md)

**Content**:
```markdown
---
layout: page
title: 关于
permalink: /about.html
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
- **GitHub Pages** - 免费托管服务
- **Markdown** - 内容编写
- **SCSS** - 样式管理

## 联系方式

如果你想和我交流，可以通过以下方式联系我：

- GitHub: [@bobosenses](https://github.com/bobosenses)
- Email: your-email@example.com

感谢你的访问！
```

## Development Setup

### 7. Gemfile


**Purpose**: 定义 Ruby 依赖

**Content**:
```ruby
source "https://rubygems.org"

gem "jekyll", "~> 3.9.0"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-seo-tag", "~> 2.6"
  gem "jekyll-sitemap", "~> 1.4"
end

# Windows and JRuby does not include zoneinfo files
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
```

### 8. .gitignore

**Purpose**: 排除不需要版本控制的文件

**Content**:
```
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
Gemfile.lock
.DS_Store
```

### 9. robots.txt

**Purpose**: SEO 爬虫配置

**Content**:
```
User-agent: *
Allow: /

Sitemap: https://bobosenses.github.io/sitemap.xml
```

### 10. README.md


**Purpose**: 项目文档和使用说明

**Content**:
```markdown
# Bobo's Blog

个人博客网站，使用 Jekyll 构建，托管在 GitHub Pages。

## 特性

- 🎨 现代化设计，响应式布局
- ⚡ 快速加载，性能优化
- 📝 Markdown 写作
- 🔍 SEO 友好
- 💻 代码语法高亮

## 本地开发

### 前置要求

- Ruby 2.5.0 或更高版本
- Bundler

### 安装

```bash
# 克隆仓库
git clone https://github.com/bobosenses/bobosenses.github.io.git
cd bobosenses.github.io

# 安装依赖
bundle install
```

### 运行

```bash
# 启动本地服务器
bundle exec jekyll serve

# 访问 http://localhost:4000
```

### 创建新文章

1. 在 `_posts` 目录创建新文件，命名格式：`YYYY-MM-DD-title.md`
2. 添加 Front Matter：

```yaml
---
layout: post
title: "文章标题"
date: YYYY-MM-DD HH:MM:SS +0800
excerpt: "文章摘要"
---
```

3. 使用 Markdown 编写内容
4. 保存后自动重新生成

## 部署

推送到 GitHub 仓库的 `main` 分支，GitHub Pages 会自动构建和部署。

## 技术栈

- Jekyll 3.9.x
- SCSS
- Liquid 模板
- GitHub Pages
- Rouge 语法高亮

## 许可

MIT License
```

## Data Flow

### 11. Build Process


```
┌─────────────────────────────────────────────────────────────┐
│                    Jekyll Build Flow                         │
└─────────────────────────────────────────────────────────────┘

1. Read Configuration
   _config.yml ──▶ Jekyll Engine

2. Process Content
   _posts/*.md ──▶ Markdown Parser ──▶ HTML
   
3. Apply Layouts
   HTML + _layouts/*.html ──▶ Liquid Engine ──▶ Final HTML

4. Process Styles
   assets/css/main.scss ──▶ SCSS Compiler ──▶ CSS

5. Copy Assets
   assets/images/* ──▶ _site/assets/images/*

6. Generate Sitemap & Feed
   Jekyll Plugins ──▶ sitemap.xml, feed.xml

7. Output
   All processed files ──▶ _site/

┌─────────────────────────────────────────────────────────────┐
│                    Page Rendering Flow                       │
└─────────────────────────────────────────────────────────────┘

User Request ──▶ GitHub Pages Server
                      │
                      ▼
                 _site/index.html
                      │
                      ▼
              ┌───────────────┐
              │ default.html  │
              │  ├─ head.html │
              │  ├─ header    │
              │  ├─ content   │
              │  └─ footer    │
              └───────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  home.html    │
              │  ├─ hero      │
              │  └─ posts     │
              └───────────────┘
                      │
                      ▼
                Browser Render
```

## Performance Considerations

### 12. Optimization Strategies


#### CSS Optimization
- 使用 SCSS 变量减少重复
- 模块化组织样式文件
- 避免深层嵌套（最多 3 层）
- 使用 CSS Grid 和 Flexbox 替代复杂布局
- Jekyll 自动压缩 CSS（生产环境）

#### HTML Optimization
- 语义化标签减少 DOM 深度
- 避免内联样式
- 使用 include 组件复用代码
- 最小化 Liquid 模板逻辑

#### Asset Optimization
- 使用 SVG 图标（可缩放，体积小）
- 图片使用 WebP 格式（可选）
- 延迟加载非关键资源
- 使用 CDN（GitHub Pages 自带）

#### JavaScript Optimization
- 避免使用大型库（jQuery 等）
- 使用原生 JavaScript
- 仅在必要时加载脚本
- 异步加载非关键脚本

#### Build Optimization
- 排除不必要的文件（.gitignore）
- 使用增量构建（本地开发）
- 限制文章数量（首页）

## Security Considerations

### 13. Security Measures


#### External Links
- 为外部链接添加 `rel="noopener noreferrer"`
- 使用 `target="_blank"` 时添加安全属性
- 验证用户输入的链接（如果有评论功能）

#### Content Security
- 静态站点，无服务器端代码
- 无数据库，无 SQL 注入风险
- 无用户认证，无会话管理
- Markdown 内容自动转义 HTML

#### HTTPS
- GitHub Pages 自动提供 HTTPS
- 强制使用 HTTPS（GitHub Pages 设置）

#### Dependencies
- 仅使用 GitHub Pages 白名单插件
- 定期更新 Jekyll 和插件版本
- 检查 Gemfile.lock 的安全漏洞

## Accessibility

### 14. Accessibility Features


#### Semantic HTML
- 使用 `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>` 等语义标签
- 使用 `<time>` 标签标记日期
- 正确的标题层级（h1 → h2 → h3）

#### ARIA Attributes
- 为导航添加 `role="navigation"`
- 为主内容添加 `role="main"`
- 为链接添加描述性文本

#### Keyboard Navigation
- 所有交互元素可通过键盘访问
- 清晰的焦点样式（:focus）
- 逻辑的 Tab 顺序

#### Color Contrast
- 文本与背景对比度 ≥ 4.5:1（WCAG AA）
- 链接颜色与周围文本有足够对比
- 不仅依赖颜色传达信息

#### Responsive Design
- 支持文本缩放（200%）
- 触摸目标最小 44x44px
- 移动设备友好的导航

#### Alternative Text
- 为所有图片提供 alt 属性
- 装饰性图片使用空 alt=""

## Testing Strategy

### 15. Testing Approach


#### Build Testing
- 本地运行 `bundle exec jekyll build` 验证构建成功
- 检查 `_site` 目录生成的文件
- 验证 SCSS 编译无错误
- 检查 Liquid 模板语法错误

#### Visual Testing
- 在不同浏览器测试（Chrome, Firefox, Safari, Edge）
- 在不同设备测试（桌面、平板、手机）
- 验证响应式断点（768px, 1024px）
- 检查动画和过渡效果

#### Content Testing
- 验证 Markdown 渲染正确
- 检查代码高亮显示
- 验证中英文混排显示
- 测试特殊字符和符号

#### Link Testing
- 验证所有内部链接有效
- 检查外部链接可访问
- 测试导航菜单功能
- 验证文章链接正确

#### SEO Testing
- 验证 meta 标签存在
- 检查 sitemap.xml 生成
- 验证 robots.txt 配置
- 测试 Open Graph 标签

#### Performance Testing
- 使用 Lighthouse 测试性能分数
- 检查页面加载时间
- 验证资源大小合理
- 测试移动端性能

#### Accessibility Testing
- 使用 WAVE 或 axe 工具检查
- 验证键盘导航
- 测试屏幕阅读器兼容性
- 检查颜色对比度

## Deployment

### 16. GitHub Pages Deployment


#### Deployment Process

```
┌─────────────────────────────────────────────────────────────┐
│                  Deployment Workflow                         │
└─────────────────────────────────────────────────────────────┘

1. Local Development
   ├─ 编写内容
   ├─ 本地测试
   └─ Git commit

2. Push to GitHub
   git push origin main

3. GitHub Pages Build
   ├─ 检测到推送
   ├─ 自动运行 Jekyll build
   ├─ 生成静态文件
   └─ 部署到 CDN

4. Live Site
   https://bobosenses.github.io
```

#### Configuration Steps

1. **仓库设置**
   - 仓库名：`bobosenses.github.io`
   - 分支：`main`
   - 目录：`/ (root)`

2. **GitHub Pages 设置**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - 启用 HTTPS

3. **自定义域名（可选）**
   - 添加 CNAME 文件
   - 配置 DNS 记录
   - 启用 HTTPS

#### Deployment Checklist

- [ ] _config.yml 配置正确的 url 和 baseurl
- [ ] .gitignore 排除 _site 目录
- [ ] Gemfile 仅使用白名单插件
- [ ] 所有链接使用相对路径或 Liquid 过滤器
- [ ] 本地构建成功
- [ ] 推送到 main 分支
- [ ] GitHub Pages 构建成功
- [ ] 访问网站验证功能

## Maintenance

### 17. Ongoing Maintenance


#### Regular Tasks

**每周**
- 检查 GitHub Pages 构建状态
- 验证网站可访问性
- 检查外部链接有效性

**每月**
- 更新 Jekyll 和插件版本
- 检查安全漏洞（bundle audit）
- 审查网站性能（Lighthouse）
- 备份内容

**按需**
- 添加新文章
- 更新关于页面
- 调整样式和布局
- 修复 bug

#### Content Workflow

```
1. 创建新文章
   ├─ 在 _posts 创建 YYYY-MM-DD-title.md
   ├─ 添加 Front Matter
   └─ 编写 Markdown 内容

2. 本地预览
   bundle exec jekyll serve

3. 审查和编辑
   ├─ 检查格式
   ├─ 验证链接
   └─ 校对内容

4. 提交和部署
   ├─ git add _posts/YYYY-MM-DD-title.md
   ├─ git commit -m "Add new post: title"
   └─ git push origin main

5. 验证发布
   访问网站确认文章显示
```

## Design Decisions

### 18. Key Design Choices


#### Why Jekyll?
- GitHub Pages 原生支持
- 成熟稳定的生态系统
- 简单的 Markdown 工作流
- 无需数据库和服务器
- 丰富的插件和主题

#### Why SCSS?
- 变量和嵌套提高可维护性
- 模块化组织样式
- Jekyll 原生支持编译
- 无需额外构建工具

#### Why No JavaScript Framework?
- 静态博客不需要复杂交互
- 减少依赖和构建复杂度
- 提高性能和加载速度
- 更好的 SEO 和可访问性

#### Why Card Layout?
- 现代化视觉设计
- 清晰的内容层次
- 良好的响应式适配
- 易于扫描和浏览

#### Why Gradient Background?
- 视觉吸引力
- 现代化设计趋势
- 区分不同区域
- 增强品牌识别

#### Why Minimal Plugins?
- GitHub Pages 白名单限制
- 减少构建时间
- 提高稳定性
- 简化维护

## Future Enhancements

### 19. Potential Improvements


#### Phase 2 Features
- 标签和分类系统
- 搜索功能
- 评论系统（Disqus/Utterances）
- RSS 订阅优化
- 深色模式切换

#### Phase 3 Features
- 文章阅读时间估算
- 相关文章推荐
- 目录导航（TOC）
- 图片画廊
- 多语言支持

#### Performance Enhancements
- 图片懒加载
- Service Worker 缓存
- WebP 图片格式
- 字体子集化
- Critical CSS 内联

#### Analytics
- Google Analytics 集成
- 访问统计
- 热门文章追踪
- 用户行为分析

## Conclusion

本设计文档提供了将静态 HTML 博客升级为 Jekyll 框架博客的完整技术方案。设计遵循以下原则：

1. **简洁性**：避免过度设计，专注核心功能
2. **可维护性**：模块化结构，清晰的代码组织
3. **性能**：优化加载速度，减少资源大小
4. **兼容性**：GitHub Pages 完全兼容
5. **可扩展性**：为未来功能预留空间
6. **用户体验**：现代化设计，响应式布局
7. **开发体验**：简单的工作流，清晰的文档

通过实施本设计，将创建一个功能完善、视觉现代、性能优秀的个人博客系统。
