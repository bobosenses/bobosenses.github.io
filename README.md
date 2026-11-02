# Bobo's Blog

Bobo 的个人站点。用 Jekyll 生成静态页面，由 GitHub Actions 部署到 GitHub Pages。

首页是个人介绍和精选文章，不是主题自带的博客列表。文章仍放在 `_posts`，地址保持 `/posts/文章-slug/`。

## 本地预览

需要 Ruby 3.2 或更新版本。

```bash
bundle install
bundle exec jekyll serve
```

浏览器打开 http://127.0.0.1:4000 。

生产构建和链接检查：

```bash
bash tools/test.sh
```

## 发布后建议改的配置

都在 `_config.yml`：

| 字段 | 作用 |
| --- | --- |
| `title` / `tagline` / `description` | 站点标题、首页导语、搜索引擎描述 |
| `profile.name` | 页头和首页上的名字 |
| `profile.intro` | 首页「关于」那段短句 |
| `profile.github` | GitHub 用户名。改它时请同时改 `social.links` |
| `profile.email` / `profile.role` / `profile.location` | 选填。留空则不显示 |
| `featured_posts` | 首页精选。填写 `_posts` 文件名中日期后面的 slug |
| `default_theme` | `system`、`light` 或 `dark` |
| `url` | 站点完整地址，不要以 `/` 结尾 |

关于页正文在 `_tabs/about.md`。新文章放在 `_posts`，文件名用 `YYYY-MM-DD-slug.md`。

## 页面

- `/` 首页
- `/archives/` 全部文章
- `/categories/` 与 `/tags/` 分类和标签
- `/about/` 关于
- `/feed.xml` 订阅

## 许可

MIT License
