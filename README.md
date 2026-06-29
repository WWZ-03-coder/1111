# 个人博客网站

这是一个现代化的个人博客网站，采用纯HTML/CSS/JavaScript技术栈构建，支持Markdown渲染、响应式设计和丰富的交互功能。

## 功能特性

### 🌟 核心功能
- **文章列表**：展示所有博客文章，支持分类筛选和排序
- **文章详情**：完整的Markdown渲染，支持代码高亮
- **标签分类**：标签云和按标签浏览文章
- **关于页面**：博主个人信息和技术栈展示
- **响应式设计**：适配各种屏幕尺寸

### 🎨 设计亮点
- 现代化UI设计，美观大方
- 深浅配色方案，阅读舒适
- 动画效果流畅自然
- 代码高亮支持多种语言
- 移动端友好体验

### ⚡ 技术特点
- 纯前端实现，无需后端
- 基于Marked.js的Markdown渲染
- Prism.js代码高亮
- 原生JavaScript实现交互
- 响应式CSS布局

## 项目结构

```
个人博客/
├── index.html          # 首页
├── articles.html       # 文章列表页
├── tags.html          # 标签分类页
├── about.html         # 关于页面
├── article.html       # 文章详情页
├── css/
│   ├── style.css      # 主样式文件
│   └── prism.css      # 代码高亮样式
├── js/
│   ├── main.js        # 主JavaScript文件
│   └── prism.js       # 代码高亮库
├── articles/
│   ├── article1.md    # 示例文章1
│   └── article2.md    # 示例文章2
├── images/            # 图片资源
├── README.md          # 项目说明
└── .codebuddy/        # 开发环境配置
```

## 快速开始

### 1. 本地运行
直接将项目文件复制到Web服务器目录，或在本地使用以下方式运行：

```bash
# 使用Python启动本地服务器
python -m http.server 8000

# 或使用Node.js
npx serve .
```

### 2. 访问网站
打开浏览器访问：`http://localhost:8000`

## 使用说明

### 添加新文章
1. 在`articles`目录创建新的Markdown文件
2. 按照以下格式编写文章：

```markdown
---
title: "文章标题"
date: "2024-01-01"
category: "分类"
tags: ["标签1", "标签2"]
excerpt: "文章摘要"
image: "文章封面图URL"
---

# 文章内容
你的Markdown内容...
```

3. 在`js/main.js`的`blogPosts`数组中添加文章数据

### 自定义样式
- 修改`css/style.css`调整网站样式
- 修改`css/prism.css`调整代码高亮主题
- 在`:root`中修改CSS变量调整配色方案

### 功能扩展
- 在`js/main.js`中扩展JavaScript功能
- 添加新的页面模板
- 集成第三方服务（如评论系统）

## 技术细节

### Markdown渲染
网站使用Marked.js渲染Markdown内容，支持：
- 标题、段落、列表
- 代码块和行内代码
- 链接、图片、引用
- 表格、分割线

### 代码高亮
使用Prism.js支持以下语言：
- JavaScript/TypeScript
- HTML/CSS
- Python/Java
- SQL/JSON
- Bash/Shell

### 响应式设计
采用移动优先的设计原则：
- 576px以下：移动设备
- 576px-768px：小屏幕平板
- 768px-992px：平板
- 992px-1200px：桌面
- 1200px以上：大屏幕

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- iOS Safari 11+
- Android Chrome 60+

## 性能优化

- 图片懒加载
- 代码分割
- 缓存策略
- 资源压缩
- 按需加载

## 部署建议

### 静态托管
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- 阿里云/腾讯云对象存储

### 自定义域名
1. 购买域名并配置DNS
2. 在托管平台绑定域名
3. 配置HTTPS证书

## 开发指南

### 本地开发
1. 克隆项目到本地
2. 使用VS Code或其他编辑器打开
3. 安装Live Server扩展
4. 启动开发服务器

### 代码规范
- 使用语义化HTML标签
- CSS采用BEM命名规范
- JavaScript遵循ES6+标准
- 注释清晰，文档完整

## 常见问题

### Q: 如何添加新的页面？
A: 复制现有页面模板，修改内容和链接即可。

### Q: 如何修改网站配色？
A: 编辑`css/style.css`中的CSS变量。

### Q: 如何添加评论功能？
A: 可以集成第三方服务如Disqus、Gitalk等。

### Q: 如何优化SEO？
A: 确保页面有正确的meta标签，使用语义化HTML，提供站点地图。

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完成所有核心功能
- 实现响应式设计
- 支持Markdown渲染

## 许可证

本项目采用MIT许可证。详见LICENSE文件。

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目。

## 联系作者

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- 邮箱: contact@example.com

---

感谢使用这个个人博客模板！希望它能帮助你快速搭建自己的技术博客。😊