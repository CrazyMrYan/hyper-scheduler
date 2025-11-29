# 文档迁移指南

本指南说明新旧文档结构的对应关系。

## 文档对照表

### 旧结构

```
docs/
├── api/
│   └── scheduler.md    # 所有 API 都在一个文件
└── guide/
    ├── getting-started.md
    └── core-concepts.md
```

### 新结构

```
docs/
├── api/
│   ├── index.md        # API 总览（新增）
│   ├── scheduler.md    # Scheduler API（拆分）
│   ├── task.md         # Task API（新增）
│   ├── devtools.md     # DevTools API（新增）
│   └── types.md        # 类型定义（新增）
└── guide/
    ├── getting-started.md
    ├── core-concepts.md
    └── best-practices.md   # 最佳实践（新增）
```

## 主要变化

### 1. API 文档拆分

**旧版**：所有 API 都在 `api/scheduler.md` 一个文件中

**新版**：按功能模块拆分为多个文件

- `api/scheduler.md` - 仅包含 Scheduler 类的方法
- `api/task.md` - 任务相关的接口和配置
- `api/devtools.md` - DevTools 插件配置
- `api/types.md` - 所有类型定义

### 2. 新增文档

#### API 总览 (`api/index.md`)

- 快速查找所有 API
- 按功能分类索引
- 常用示例

#### 最佳实践 (`guide/best-practices.md`)

- 任务设计建议
- 错误处理模式
- 性能优化技巧
- 常见使用模式

### 3. 内容优化

#### Scheduler API

**改进**：
- 更清晰的方法分组
- 每个方法独立章节
- 更详细的参数说明
- 更多使用示例

#### Task API

**新增内容**：
- 完整的属性说明
- 详细的配置选项
- 运行时状态说明
- 实用示例

#### DevTools API

**新增内容**：
- 完整的配置选项
- 主题和语言设置
- 悬浮按钮自定义
- 使用注意事项

#### 类型定义

**新增内容**：
- 所有类型的集中说明
- 类型关系图
- 使用示例
- 类型守卫示例

## 内容迁移

### 从旧 `api/scheduler.md` 迁移

| 旧位置 | 新位置 |
|--------|--------|
| Scheduler 构造函数 | `api/scheduler.md#构造函数` |
| createTask 方法 | `api/scheduler.md#createtask` |
| TaskDefinition 接口 | `api/task.md#taskdefinition` |
| TaskOptions 接口 | `api/task.md#taskoptions` |
| Task 接口 | `api/task.md#task` |
| DevToolsOptions 接口 | `api/devtools.md#构造函数` |
| 所有类型定义 | `api/types.md` |

### 链接更新

如果你的代码或其他文档中引用了旧的文档链接，需要更新：

```markdown
<!-- 旧链接 -->
[API 文档](./api/scheduler.md)

<!-- 新链接 -->
[Scheduler API](./api/scheduler.md)
[Task API](./api/task.md)
[DevTools API](./api/devtools.md)
[类型定义](./api/types.md)
```

## 优势

### 1. 更好的可维护性

- 每个文件职责单一
- 修改不影响其他部分
- 便于版本控制

### 2. 更好的可读性

- 文档结构清晰
- 内容分类明确
- 便于快速查找

### 3. 更好的扩展性

- 新增 API 时只需添加新文件
- 不会让单个文件过于庞大
- 便于添加更多示例

### 4. 更好的用户体验

- 快速定位所需信息
- 减少滚动查找
- 提供多种导航方式

## 下一步

1. **熟悉新结构** - 浏览新的文档目录
2. **更新书签** - 更新常用文档的书签
3. **反馈问题** - 发现问题及时反馈
4. **贡献文档** - 按新规范贡献文档

## 相关资源

- [文档结构说明](./README.md)
- [API 总览](./api/)
- [快速开始](./guide/getting-started.md)
