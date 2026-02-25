# 我的工具箱

一个基于 Vue 3 + Vite 的在线工具集合，包含常用的开发工具。

## 功能特性

### 已实现的工具

1. **JSON格式化工具**
   - JSON格式化和美化
   - JSON压缩
   - JSON验证
   - 一键复制

2. **Base64编解码工具**
   - 文本转Base64编码
   - Base64解码为文本
   - 支持中文编解码
   - 一键复制

3. **UUID生成器**
   - 批量生成UUID
   - 支持大小写切换
   - 支持连字符开关
   - 单个或批量复制

4. **翻译工具**
   - 中译英、英译中
   - 支持双向翻译
   - 一键复制结果

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 技术栈

- Vue 3 - 渐进式 JavaScript 框架
- Vue Router - 官方路由管理器
- Vite - 下一代前端构建工具

## 项目结构

```
tools/
├── index.html          # 入口HTML文件
├── package.json        # 项目配置文件
├── vite.config.js      # Vite配置文件
└── src/
    ├── main.js         # 应用入口
    ├── App.vue         # 根组件
    └── views/          # 页面组件
        ├── Home.vue
        ├── JsonFormatter.vue
        ├── Base64Tool.vue
        └── UuidGenerator.vue
```

## 后续扩展

可以继续添加更多实用工具，例如：
- 时间戳转换
- URL编解码
- MD5/SHA加密
- 颜色转换器
- 正则表达式测试
- 二维码生成器
- 图片压缩工具
- 等等...
