# API 参考

Hyper Scheduler 的完整 API 文档。

## 核心 API

### [Scheduler](./scheduler.md)

核心调度器类，负责任务的注册、调度和生命周期管理。

**主要方法**：
- `createTask()` - 注册新任务
- `start()` / `stop()` - 启动/停止调度器
- `startTask()` / `stopTask()` - 启动/停止指定任务
- `triggerTask()` - 手动触发任务
- `getTask()` / `getAllTasks()` - 查询任务
- `deleteTask()` - 删除任务
- `on()` - 订阅事件

[查看完整文档 →](./scheduler.md)

---

### [Task](./task.md)

任务配置和运行时状态。

**核心接口**：
- `TaskDefinition` - 任务定义
- `TaskOptions` - 任务选项
- `Task` - 任务运行时对象

**配置选项**：
- 调度规则（Cron / 时间间隔）
- 重试策略
- 时区设置
- 错误处理

[查看完整文档 →](./task.md)

---

### [DevTools](./devtools.md)

浏览器环境下的可视化调试工具。

**功能特性**：
- 任务列表和状态监控
- 时间线视图
- 执行历史
- 实时日志

**配置选项**：
- 主题模式
- 停靠位置
- 界面语言
- 悬浮按钮自定义

[查看完整文档 →](./devtools.md)

---

### [类型定义](./types.md)

完整的 TypeScript 类型定义。

**核心类型**：
- `SchedulerConfig`
- `TaskDefinition`
- `TaskOptions`
- `Task`
- `TaskStatus`
- `ExecutionRecord`

**插件类型**：
- `HyperSchedulerPlugin`
- `DevToolsOptions`

[查看完整文档 →](./types.md)

---

## 快速查找

### 按功能分类

#### 任务管理
- [创建任务](./scheduler.md#createtask) - `scheduler.createTask()`
- [删除任务](./scheduler.md#deletetask) - `scheduler.deleteTask()`
- [查询任务](./scheduler.md#gettask) - `scheduler.getTask()`
- [获取所有任务](./scheduler.md#getalltasks) - `scheduler.getAllTasks()`

#### 任务控制
- [启动调度器](./scheduler.md#start) - `scheduler.start()`
- [停止调度器](./scheduler.md#stop) - `scheduler.stop()`
- [启动任务](./scheduler.md#starttask) - `scheduler.startTask()`
- [停止任务](./scheduler.md#stoptask) - `scheduler.stopTask()`
- [手动触发](./scheduler.md#triggertask) - `scheduler.triggerTask()`

#### 任务配置
- [调度规则](./task.md#schedule) - Cron 表达式 / 时间间隔
- [重试策略](./task.md#retry) - 失败重试配置
- [时区设置](./task.md#timezone) - 任务专属时区
- [错误处理](./task.md#onerror) - 错误回调函数

#### 事件监听
- [订阅事件](./scheduler.md#on) - `scheduler.on()`
- [事件类型](./scheduler.md#支持的事件) - 完整事件列表

#### 调试工具
- [DevTools 配置](./devtools.md#构造函数) - 初始化选项
- [主题设置](./devtools.md#主题配置) - light / dark / auto
- [语言设置](./devtools.md#语言设置) - en / zh

---

## 使用示例

### 基础用法

```typescript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler({ debug: true });

scheduler.createTask({
  id: 'my-task',
  schedule: '*/5 * * * * *',
  handler: () => console.log('Task executed')
});

scheduler.start();
```

### 带重试和错误处理

```typescript
scheduler.createTask({
  id: 'api-sync',
  schedule: '5m',
  handler: async () => {
    await syncWithAPI();
  },
  options: {
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      factor: 2
    },
    onError: (error, taskId) => {
      console.error(`Task ${taskId} failed:`, error);
    }
  }
});
```

### 使用 DevTools

```typescript
import { Scheduler, DevTools } from 'hyper-scheduler';

const scheduler = new Scheduler({
  plugins: [
    new DevTools({
      theme: 'dark',
      language: 'zh'
    })
  ]
});
```

---

## 相关链接

- [快速开始](../guide/getting-started.md) - 入门指南
- [核心概念](../guide/core-concepts.md) - 深入理解
- [最佳实践](../guide/best-practices.md) - 使用建议
