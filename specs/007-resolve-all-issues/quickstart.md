# 快速入门：解决问题和新功能

**功能**: 007-解决所有问题

## 1. 使用命名空间

将任务隔离到逻辑组中。

```typescript
const scheduler = new Scheduler();

// 在不同命名空间中创建任务
scheduler.createTask({
  id: 'cleanup-logs',
  schedule: '0 0 * * *',
  handler: cleanupLogs,
  options: { namespace: 'system' }
});

scheduler.createTask({
  id: 'send-email',
  schedule: '*/5 * * * *',
  handler: sendEmails,
  options: { namespace: 'user' }
});

// 仅启动系统任务
scheduler.start('system');

// 启动所有任务
scheduler.start();
```

## 2. 立即执行

无需等待第一个调度间隔，立即运行任务。

```typescript
scheduler.createTask({
  id: 'init-check',
  schedule: '0 * * * *', // 每小时
  handler: checkStatus,
  options: { runImmediately: true }
});
// 'init-check' 在 start() 后立即运行，然后每小时运行一次。
```

## 3. DevTools 配置

自定义时间线视图。

```typescript
const devTools = new DevTools({
  zoomStep: 1000 * 60 // 1 分钟步长
});
```