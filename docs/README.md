# Hyper Scheduler 文档

## 文档结构

```
docs/
├── index.md                    # 首页
├── guide/                      # 指南
│   ├── getting-started.md      # 快速开始
│   ├── core-concepts.md        # 核心概念
│   └── best-practices.md       # 最佳实践
└── api/                        # API 参考
    ├── index.md                # API 总览
    ├── scheduler.md            # Scheduler API
    ├── task.md                 # Task API
    ├── devtools.md             # DevTools API
    └── types.md                # 类型定义
```

## 文档说明

### 指南 (Guide)

面向用户的教程和概念说明：

- **快速开始** - 安装、基础用法、完整示例
- **核心概念** - 调度器、任务、状态、事件系统等核心概念
- **最佳实践** - 任务设计、错误处理、性能优化等实践建议

### API 参考 (API Reference)

详细的 API 文档：

- **API 总览** - 快速查找和索引
- **Scheduler** - 调度器类的所有方法和配置
- **Task** - 任务定义、选项和运行时状态
- **DevTools** - 调试工具配置和使用
- **类型定义** - 完整的 TypeScript 类型

## 文档特点

### 1. 模块化组织

- 按功能模块拆分文档
- 每个 API 独立成页
- 便于维护和查找

### 2. 清晰的层次结构

- 指南：从简单到复杂
- API：按类和功能分组
- 类型：集中管理类型定义

### 3. 丰富的示例

- 每个 API 都有使用示例
- 包含常见模式和最佳实践
- 提供完整的代码片段

### 4. 交叉引用

- 相关文档之间互相链接
- 便于深入学习和查找

## 本地预览

```bash
# 启动文档开发服务器
npm run docs:dev

# 构建文档
npm run docs:build
```

## 贡献指南

### 添加新文档

1. 在相应目录创建 Markdown 文件
2. 在 `.vitepress/config.ts` 中添加导航/侧边栏配置
3. 添加交叉引用链接

### 文档规范

- 使用清晰的标题层次
- 提供代码示例
- 添加参数说明表格
- 包含相关链接

### 示例格式

```markdown
# API 名称

简短描述。

## 方法名

详细说明。

\`\`\`typescript
// 代码示例
\`\`\`

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| ... | ... | ... |

### 示例

\`\`\`typescript
// 使用示例
\`\`\`

## 相关链接

- [相关文档](https://crazymryan.github.io/hyper-scheduler)
```
