# 快速开始

欢迎使用 Hyper Scheduler！本文档将引导你在项目中快速集成并运行第一个定时任务。

## 安装

使用你喜欢的包管理器安装：

```bash
npm install hyper-scheduler
# 或者
pnpm add hyper-scheduler
# 或者
yarn add hyper-scheduler
```

## 基础用法

### 1. 引入调度器

在你的项目中引入 `Scheduler` 类。

```typescript
import { Scheduler } from 'hyper-scheduler';
```

### 2. 创建实例

```typescript
const scheduler = new Scheduler({
  // 可选配置
  debug: true, // 开启调试日志
});
```

### 3. 注册任务

Hyper Scheduler 支持两种调度模式：**Cron 表达式** 和 **时间间隔字符串**。

#### 使用 Cron 表达式 (每分钟执行)

```typescript
scheduler.addTask({
  id: 'cron-task-01',
  schedule: '* * * * *', // 每分钟
  handler: () => {
    console.log('Cron 任务执行:', new Date().toLocaleTimeString());
  },
});
```

#### 使用时间间隔 (每 5 秒执行)

这是 v1.1 新增的特性，更加直观。

```typescript
scheduler.addTask({
  id: 'interval-task-01',
  schedule: '5s', // 支持 s(秒), m(分), h(时), d(天)
  handler: () => {
    console.log('Interval 任务执行:', new Date().toLocaleTimeString());
  },
});
```

### 4. 启动调度器

注册完任务后，别忘了启动调度器。

```typescript
scheduler.start();
```

## 完整示例

```typescript
import { Scheduler } from 'hyper-scheduler';

// 初始化
const scheduler = new Scheduler({ debug: true });

// 任务 1: 每 10 秒打印一次
scheduler.addTask({
  id: 'heartbeat',
  schedule: '10s',
  handler: () => console.log('💓 心跳检测'),
});

// 任务 2: 每小时整点报时
scheduler.addTask({
  id: 'hourly-chime',
  schedule: '0 * * * *', 
  handler: () => console.log('🔔 整点报时'),
});

// 启动
console.log('调度器已启动...');
scheduler.start();
```

## 下一步

- 了解 [核心概念](./core-concepts.md) 深入理解调度机制。
- 查看 [API 文档](../api/scheduler.md) 获取完整参数说明。