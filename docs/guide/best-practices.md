# 最佳实践

本指南提供使用 Hyper Scheduler 的最佳实践和常见模式。

## 任务设计

### 保持任务简洁

任务处理函数应该专注于单一职责，避免过于复杂的逻辑。

```typescript
// ❌ 不推荐：任务过于复杂
scheduler.createTask({
  id: 'complex-task',
  schedule: '1m',
  handler: async () => {
    await fetchData();
    await processData();
    await saveToDatabase();
    await sendNotification();
    await cleanupOldData();
  }
});

// ✅ 推荐：拆分为多个任务
scheduler.createTask({
  id: 'fetch-data',
  schedule: '1m',
  handler: async () => {
    await fetchData();
  }
});

scheduler.createTask({
  id: 'process-data',
  schedule: '2m',
  handler: async () => {
    await processData();
  }
});
```

### 使用有意义的任务 ID

任务 ID 应该清晰描述任务的用途。

```typescript
// ❌ 不推荐
scheduler.createTask({
  id: 'task1',
  // ...
});

// ✅ 推荐
scheduler.createTask({
  id: 'daily-user-report',
  // ...
});
```

### 合理使用标签

使用标签对任务进行分类，便于管理和过滤。

```typescript
scheduler.createTask({
  id: 'sync-orders',
  schedule: '5m',
  tags: ['sync', 'orders', 'high-priority'],
  handler: async () => {
    await syncOrders();
  }
});

scheduler.createTask({
  id: 'cleanup-logs',
  schedule: '0 0 2 * * *',
  tags: ['maintenance', 'low-priority'],
  handler: async () => {
    await cleanupLogs();
  }
});
```

## 错误处理

### 始终添加错误处理

为关键任务添加 `onError` 回调，确保错误被正确处理。

```typescript
scheduler.createTask({
  id: 'critical-sync',
  schedule: '1m',
  handler: async () => {
    await criticalOperation();
  },
  options: {
    onError: (error, taskId) => {
      // 记录错误
      logger.error(`Task ${taskId} failed:`, error);
      
      // 发送告警
      alertService.send({
        title: 'Critical Task Failed',
        message: error.message,
        taskId
      });
    }
  }
});
```

### 配置重试策略

对于可能因网络等临时问题失败的任务，配置合理的重试策略。

```typescript
scheduler.createTask({
  id: 'api-call',
  schedule: '5m',
  handler: async () => {
    await callExternalAPI();
  },
  options: {
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      factor: 2  // 指数退避：1s, 2s, 4s
    }
  }
});
```

## 调度规则

### 选择合适的调度方式

根据需求选择 Cron 表达式或时间间隔。

```typescript
// 固定时间点执行 - 使用 Cron
scheduler.createTask({
  id: 'daily-report',
  schedule: '0 0 9 * * *',  // 每天 9:00
  handler: async () => {
    await generateDailyReport();
  }
});

// 固定间隔执行 - 使用时间间隔
scheduler.createTask({
  id: 'health-check',
  schedule: '30s',  // 每 30 秒
  handler: async () => {
    await checkHealth();
  }
});
```

### 避免过于频繁的任务

```typescript
// ❌ 不推荐：过于频繁
scheduler.createTask({
  id: 'check',
  schedule: '*/1 * * * * *',  // 每秒执行
  handler: async () => {
    await heavyOperation();
  }
});

// ✅ 推荐：合理的频率
scheduler.createTask({
  id: 'check',
  schedule: '30s',  // 每 30 秒
  handler: async () => {
    await heavyOperation();
  }
});
```

## 时区处理

### 全局时区配置

为整个调度器设置统一时区。

```typescript
const scheduler = new Scheduler({
  timezone: 'Asia/Shanghai'
});
```

### 任务级时区覆盖

为特定任务设置不同时区。

```typescript
// 东京时间每天 9:00
scheduler.createTask({
  id: 'tokyo-report',
  schedule: '0 0 9 * * *',
  handler: () => generateReport('Tokyo'),
  options: {
    timezone: 'Asia/Tokyo'
  }
});

// 纽约时间每天 9:00
scheduler.createTask({
  id: 'ny-report',
  schedule: '0 0 9 * * *',
  handler: () => generateReport('New York'),
  options: {
    timezone: 'America/New_York'
  }
});
```

## 性能优化

### 控制历史记录数量

根据需求调整历史记录保留数量。

```typescript
// 生产环境：减少内存占用
const scheduler = new Scheduler({
  maxHistory: 20
});

// 开发环境：保留更多历史用于调试
const scheduler = new Scheduler({
  maxHistory: 100
});
```

### 避免任务重叠

确保任务执行时间小于调度间隔。

```typescript
// ❌ 不推荐：任务可能重叠
scheduler.createTask({
  id: 'slow-task',
  schedule: '10s',  // 每 10 秒
  handler: async () => {
    await slowOperation();  // 可能需要 15 秒
  }
});

// ✅ 推荐：增加间隔或优化任务
scheduler.createTask({
  id: 'slow-task',
  schedule: '30s',  // 增加到 30 秒
  handler: async () => {
    await optimizedOperation();  // 优化后 5 秒完成
  }
});
```

## 调试与监控

### 开发环境启用调试

```typescript
const isDev = process.env.NODE_ENV === 'development';

const scheduler = new Scheduler({
  debug: isDev,
  maxHistory: isDev ? 100 : 20
});
```

### 浏览器环境使用 DevTools

```typescript
import { Scheduler, DevTools } from 'hyper-scheduler';

const scheduler = new Scheduler({
  debug: true,
  plugins: [
    new DevTools({
      theme: 'auto',
      language: 'zh'
    })
  ]
});
```

### 监听关键事件

```typescript
// 监控任务失败
scheduler.on('task_failed', ({ taskId, error }) => {
  metrics.increment('task_failed', { taskId });
  logger.error(`Task ${taskId} failed:`, error);
});

// 监控任务执行时间
scheduler.on('task_completed', ({ taskId, duration }) => {
  metrics.timing('task_duration', duration, { taskId });
  
  if (duration > 5000) {
    logger.warn(`Task ${taskId} took ${duration}ms`);
  }
});
```

## 生命周期管理

### 优雅关闭

```typescript
// Node.js 环境
process.on('SIGTERM', () => {
  scheduler.stop();
  process.exit(0);
});

// 浏览器环境
window.addEventListener('beforeunload', () => {
  scheduler.stop();
});
```

### 动态任务管理

```typescript
// 根据配置动态创建任务
function setupTasks(config) {
  config.tasks.forEach(taskConfig => {
    scheduler.createTask({
      id: taskConfig.id,
      schedule: taskConfig.schedule,
      handler: taskConfig.handler,
      tags: taskConfig.tags
    });
  });
}

// 运行时更新任务
function updateTask(taskId, newSchedule) {
  scheduler.deleteTask(taskId);
  scheduler.createTask({
    id: taskId,
    schedule: newSchedule,
    handler: originalHandler
  });
}
```

## 常见模式

### 数据同步

```typescript
scheduler.createTask({
  id: 'sync-users',
  schedule: '5m',
  tags: ['sync', 'users'],
  handler: async () => {
    const users = await fetchRemoteUsers();
    await saveToLocal(users);
  },
  options: {
    retry: {
      maxAttempts: 3,
      initialDelay: 2000
    },
    onError: (error, taskId) => {
      logger.error(`Sync failed: ${error.message}`);
    }
  }
});
```

### 定时报告

```typescript
scheduler.createTask({
  id: 'daily-report',
  schedule: '0 0 9 * * *',  // 每天 9:00
  tags: ['report', 'daily'],
  handler: async () => {
    const report = await generateReport();
    await sendEmail(report);
  },
  options: {
    timezone: 'Asia/Shanghai',
    onError: (error, taskId) => {
      alertService.send({
        title: 'Report Generation Failed',
        message: error.message
      });
    }
  }
});
```

### 健康检查

```typescript
scheduler.createTask({
  id: 'health-check',
  schedule: '30s',
  tags: ['monitoring', 'health'],
  handler: async () => {
    const isHealthy = await checkSystemHealth();
    if (!isHealthy) {
      await sendAlert('System unhealthy');
    }
  }
});
```

### 数据清理

```typescript
scheduler.createTask({
  id: 'cleanup-old-logs',
  schedule: '0 0 2 * * *',  // 每天凌晨 2:00
  tags: ['maintenance', 'cleanup'],
  handler: async () => {
    const cutoffDate = Date.now() - 30 * 24 * 60 * 60 * 1000;  // 30 天前
    await deleteLogsOlderThan(cutoffDate);
  }
});
```

## 相关链接

- [核心概念](./core-concepts.md) - 深入理解调度机制
- [Scheduler API](../api/scheduler.md) - 完整 API 参考
- [Task API](../api/task.md) - 任务配置详解
