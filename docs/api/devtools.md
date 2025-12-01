# DevTools

浏览器环境下的可视化调试工具插件，提供任务监控、时间线视图和实时日志等功能。

## 构造函数

```typescript
new DevTools(options?: DevToolsOptions)
```

### 参数

- **options** `DevToolsOptions` - 可选配置对象

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | 主题模式 |
| `dockPosition` | `'right' \| 'bottom'` | `'right'` | 面板停靠位置 |
| `language` | `'en' \| 'zh'` | `'en'` | 界面语言 |
| `defaultZoom` | `number` | `1` | 时间线默认缩放级别 (0.5-5) |
| `trigger` | `TriggerOptions` | - | 悬浮按钮配置 |

### TriggerOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `backgroundColor` | `string` | `'#3b82f6'` | 背景色 |
| `textColor` | `string` | `'#ffffff'` | 文字/图标颜色 |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | 位置 |

## 使用方法

### 基础用法

```typescript
import { Scheduler, DevTools } from 'hyper-scheduler';

const scheduler = new Scheduler({
  plugins: [
    new DevTools()
  ]
});
```

### 自定义配置

```typescript
import { Scheduler, DevTools } from 'hyper-scheduler';

const scheduler = new Scheduler({
  plugins: [
    new DevTools({
      theme: 'dark',
      dockPosition: 'bottom',
      language: 'zh',
      defaultZoom: 2,
      trigger: {
        backgroundColor: '#10b981',
        textColor: '#ffffff',
        position: 'bottom-left'
      }
    })
  ]
});
```

## 功能特性

### 任务列表

- 查看所有已注册任务
- 实时显示任务状态（idle、running、stopped、error）
- 显示上次执行时间和下次执行时间
- 按标签过滤任务
- 搜索任务
- **任务驱动 (Task Driver)**
    - 在任务列表中，任务 ID 旁会显示一个标记：
        - **`M`**: 表示该任务在 **主线程 (Main Thread)** 中运行。
        - **`W`**: 表示该任务在 **Web Worker 线程** 中运行。
    - 这允许你快速识别任务的执行上下文，特别是对于需要避免阻塞 UI 的繁重任务。
    - **注意**：`driver` 是 `Scheduler` 或 `Task` 的配置选项，而不是 `DevTools` 本身的配置。`DevTools` 仅负责可视化其状态。

### 任务控制

- 手动触发任务执行
- 暂停/恢复任务
- 删除任务
- 查看任务详情

### 时间线视图

- 可视化任务执行时间线
- 缩放时间轴（0.5x - 5x）
- 显示任务执行时长
- 区分成功/失败状态

### 执行历史

- 查看任务执行历史记录
- 显示执行时间、耗时、状态
- 查看错误信息
- 统计成功率

### 实时日志

- 实时显示调度器事件
- 任务注册、启动、完成、失败等事件
- 可过滤日志级别

## 主题配置

### auto（自动）

根据系统主题自动切换：

```typescript
new DevTools({
  theme: 'auto'
})
```

### light（浅色）

```typescript
new DevTools({
  theme: 'light'
})
```

### dark（深色）

```typescript
new DevTools({
  theme: 'dark'
})
```

## 停靠位置

### right（右侧）

面板停靠在浏览器窗口右侧：

```typescript
new DevTools({
  dockPosition: 'right'
})
```

### bottom（底部）

面板停靠在浏览器窗口底部：

```typescript
new DevTools({
  dockPosition: 'bottom'
})
```

## 语言设置

### 中文

```typescript
new DevTools({
  language: 'zh'
})
```

### 英文

```typescript
new DevTools({
  language: 'en'
})
```

## 时间线缩放

控制时间线视图的默认缩放级别，范围 0.5 - 5：

```typescript
new DevTools({
  defaultZoom: 2  // 2倍缩放
})
```

- `0.5` - 显示更长时间范围
- `1` - 默认缩放
- `2` - 显示更多细节
- `5` - 最大缩放

## 悬浮按钮自定义

### 位置

```typescript
new DevTools({
  trigger: {
    position: 'bottom-right'  // 右下角
  }
})
```

可选值：
- `'bottom-right'` - 右下角（默认）
- `'bottom-left'` - 左下角
- `'top-right'` - 右上角
- `'top-left'` - 左上角

### 颜色

```typescript
new DevTools({
  trigger: {
    backgroundColor: '#10b981',  // 绿色背景
    textColor: '#ffffff'         // 白色文字
  }
})
```

支持任何有效的 CSS 颜色值：
- 十六进制：`'#3b82f6'`
- RGB：`'rgb(59, 130, 246)'`
- RGBA：`'rgba(59, 130, 246, 0.8)'`
- 颜色名：`'blue'`

## 相关链接

- [Scheduler API](./scheduler.md) - 调度器 API
- [快速开始](../guide/getting-started.md) - 使用指南
- [类型定义](./types.md) - 完整类型定义
