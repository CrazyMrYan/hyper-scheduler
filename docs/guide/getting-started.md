# 快速开始

## 安装

```bash
npm install hyper-scheduler
# 或
pnpm add hyper-scheduler
# 或
yarn add hyper-scheduler
```

## 基础用法

### 1. 创建调度器

```typescript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler({
  debug: true // 开启调试日志
});
```

### 2. 注册任务

支持两种调度规则：Cron 表达式和时间间隔。

```typescript
// Cron 表达式：每分钟执行
scheduler.createTask({
  id: 'cron-task',
  schedule: '0 * * * * *',
  handler: () => {
    console.log('Cron task executed');
  }
});

// 时间间隔：每 5 秒执行
scheduler.createTask({
  id: 'interval-task',
  schedule: '5s',
  handler: () => {
    console.log('Interval task executed');
  }
});
```

### 3. 启动调度器

```typescript
scheduler.start();
```

## 完整示例

```typescript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler({ debug: true });

// 心跳检测：每 10 秒
scheduler.createTask({
  id: 'heartbeat',
  schedule: '10s',
  handler: () => console.log('Heartbeat'),
  tags: ['monitor']
});

// 数据同步：每 5 分钟
scheduler.createTask({
  id: 'data-sync',
  schedule: '5m',
  handler: async () => {
    await syncData();
  },
  tags: ['sync'],
  options: {
    retry: {
      maxAttempts: 3,
      initialDelay: 1000
    }
  }
});

// 事件监听
scheduler.on('task_completed', ({ taskId, duration }) => {
  console.log(`${taskId} completed in ${duration}ms`);
});

scheduler.on('task_failed', ({ taskId, error }) => {
  console.error(`${taskId} failed: ${error}`);
});

// 启动
scheduler.start();
```

## 浏览器环境

在浏览器中可以启用可视化调试工具：

```typescript
const scheduler = new Scheduler();

// 注册任务...

scheduler.start();

// 启动 DevTools
await scheduler.attachDevTools({
  theme: 'auto',
  dockPosition: 'right'
});
```

## 调度规则

### Cron 表达式

```
秒 分 时 日 月 周
```

| 示例 | 说明 |
|------|------|
| `0 * * * * *` | 每分钟 |
| `*/5 * * * * *` | 每 5 秒 |
| `0 0 * * * *` | 每小时 |
| `0 0 2 * * *` | 每天凌晨 2:00 |
| `0 0 9 * * 1` | 每周一 9:00 |

### 时间间隔

| 格式 | 说明 |
|------|------|
| `30s` | 每 30 秒 |
| `5m` | 每 5 分钟 |
| `2h` | 每 2 小时 |
| `1d` | 每天 |

## 下一步

- [核心概念](./core-concepts.md) - 深入理解调度机制
- [API 文档](../api/scheduler.md) - 完整 API 参考
