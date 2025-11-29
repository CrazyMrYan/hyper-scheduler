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
  debug: true,      // 开启调试日志
  maxHistory: 100   // 保留最近 100 条执行记录
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

// Cron 任务：每 3 秒
scheduler.createTask({
  id: 'cron-task',
  schedule: '*/3 * * * * *',
  handler: () => console.log('Cron task executed')
});

// 间隔任务：每 5 秒
scheduler.createTask({
  id: 'interval-task',
  schedule: '5s',
  handler: () => console.log('Interval task executed')
});

// 启动调度器
scheduler.start();
```

## 浏览器环境

在浏览器中可以启用可视化调试工具，通过在 Scheduler 构造函数中传入 DevTools 插件实现：

```typescript
import { Scheduler, DevTools } from 'hyper-scheduler';

const scheduler = new Scheduler({
  debug: true,
  plugins: [
    new DevTools({
      theme: 'auto',
      dockPosition: 'right',
      language: 'zh',
      defaultZoom: 1,
      trigger: {
        backgroundColor: '#3b82f6',
        textColor: '#ffffff',
        position: 'bottom-right'
      }
    })
  ]
});

// 注册任务...

scheduler.start();
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
