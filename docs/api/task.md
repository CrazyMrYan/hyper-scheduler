# Task

任务是调度器的基本执行单元，包含调度规则、执行逻辑和配置选项。

## TaskDefinition

任务定义接口，用于创建新任务。

```typescript
interface TaskDefinition {
  id: string;
  schedule: string;
  handler: () => void | Promise<void>;
  tags?: string[];
  options?: TaskOptions;
}
```

### 属性

#### id

- **类型**: `string`
- **必填**: ✓

任务的唯一标识符，用于查询、触发、停止等操作。

```typescript
scheduler.createTask({
  id: 'daily-report',
  // ...
});
```

#### schedule

- **类型**: `string`
- **必填**: ✓

任务的调度规则，支持两种格式：

**1. Cron 表达式**

标准的 6 位 Cron 表达式：`秒 分 时 日 月 周`

```typescript
// 每分钟执行
schedule: '0 * * * * *'

// 每 5 秒执行
schedule: '*/5 * * * * *'

// 每天凌晨 2:00 执行
schedule: '0 0 2 * * *'

// 每周一 9:00 执行
schedule: '0 0 9 * * 1'
```

**2. 时间间隔**

人性化的时间间隔字符串：

```typescript
// 每 30 秒
schedule: '30s'

// 每 5 分钟
schedule: '5m'

// 每 2 小时
schedule: '2h'

// 每天
schedule: '1d'
```

#### handler

- **类型**: `() => void | Promise<void>`
- **必填**: ✓

任务执行函数，支持同步和异步。

```typescript
// 同步函数
handler: () => {
  console.log('Task executed');
}

// 异步函数
handler: async () => {
  const data = await fetchData();
  await processData(data);
}
```

#### tags

- **类型**: `string[]`
- **可选**

任务标签，用于分类和过滤。

```typescript
scheduler.createTask({
  id: 'sync-orders',
  schedule: '1m',
  tags: ['sync', 'orders', 'critical'],
  handler: async () => {
    await syncOrders();
  }
});
```

#### options

- **类型**: `TaskOptions`
- **可选**

任务配置选项，详见 [TaskOptions](#taskoptions)。

## TaskOptions

任务配置选项接口。

```typescript
interface TaskOptions {
  retry?: RetryConfig;
  timezone?: string;
  onError?: (error: Error, taskId: string) => void;
}
```

### retry

- **类型**: `RetryConfig`
- **可选**

任务失败时的重试配置。

```typescript
interface RetryConfig {
  maxAttempts: number;    // 最大重试次数
  initialDelay: number;   // 首次重试延迟（毫秒）
  factor?: number;        // 延迟递增因子，默认 2
}
```

重试延迟计算公式：`initialDelay * (factor ^ attempt)`

#### 示例

```typescript
scheduler.createTask({
  id: 'api-call',
  schedule: '1m',
  handler: async () => {
    await callAPI();
  },
  options: {
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      factor: 2
    }
  }
});

// 重试延迟序列：
// 第 1 次重试：1000ms (1s)
// 第 2 次重试：2000ms (2s)
// 第 3 次重试：4000ms (4s)
```

### timezone

- **类型**: `string`
- **可选**

任务专属时区，覆盖全局时区设置。使用 IANA 时区标识符。

#### 示例

```typescript
scheduler.createTask({
  id: 'tokyo-report',
  schedule: '0 0 9 * * *', // 每天 9:00
  handler: () => generateReport(),
  options: {
    timezone: 'Asia/Tokyo'
  }
});

scheduler.createTask({
  id: 'ny-report',
  schedule: '0 0 9 * * *', // 每天 9:00
  handler: () => generateReport(),
  options: {
    timezone: 'America/New_York'
  }
});
```

### onError

- **类型**: `(error: Error, taskId: string) => void`
- **可选**

任务执行失败时的错误处理回调函数。

#### 示例

```typescript
scheduler.createTask({
  id: 'critical-task',
  schedule: '30s',
  handler: async () => {
    await criticalOperation();
  },
  options: {
    onError: (error, taskId) => {
      // 记录错误日志
      logger.error(`Task ${taskId} failed:`, error);
      
      // 发送告警通知
      alertService.send({
        title: 'Task Failed',
        message: error.message,
        taskId
      });
    }
  }
});
```

## Task

任务运行时对象，继承自 `TaskDefinition` 并包含运行时状态。

```typescript
interface Task extends TaskDefinition {
  status: TaskStatus;
  lastRun?: number;
  nextRun?: number;
  executionCount?: number;
  history: ExecutionRecord[];
}
```

### 属性

#### status

- **类型**: `TaskStatus`

任务当前状态。

```typescript
type TaskStatus = 'idle' | 'running' | 'stopped' | 'error';
```

| 状态 | 说明 |
|------|------|
| `idle` | 等待调度，将在下次触发时间执行 |
| `running` | 正在执行 |
| `stopped` | 已停止，不参与调度 |
| `error` | 执行出错 |

#### lastRun

- **类型**: `number | undefined`

上次执行时间戳（毫秒）。

```typescript
const task = scheduler.getTask('my-task');
if (task.lastRun) {
  console.log('Last run:', new Date(task.lastRun));
}
```

#### nextRun

- **类型**: `number | undefined`

下次执行时间戳（毫秒）。

```typescript
const task = scheduler.getTask('my-task');
if (task.nextRun) {
  console.log('Next run:', new Date(task.nextRun));
  console.log('Time until next run:', task.nextRun - Date.now(), 'ms');
}
```

#### executionCount

- **类型**: `number | undefined`

任务累计执行次数。

```typescript
const task = scheduler.getTask('my-task');
console.log(`Executed ${task.executionCount} times`);
```

#### history

- **类型**: `ExecutionRecord[]`

任务执行历史记录数组，最多保留 `maxHistory` 条（默认 50）。

```typescript
interface ExecutionRecord {
  timestamp: number;  // 执行时间戳
  duration: number;   // 执行耗时（毫秒）
  success: boolean;   // 是否成功
  error?: string;     // 错误信息（失败时）
}
```

#### 示例

```typescript
const task = scheduler.getTask('my-task');

// 查看最近 5 次执行
task.history.slice(-5).forEach(record => {
  const time = new Date(record.timestamp).toLocaleString();
  const status = record.success ? '✓' : '✗';
  console.log(`${status} ${time} - ${record.duration}ms`);
  if (record.error) {
    console.log(`  Error: ${record.error}`);
  }
});

// 计算成功率
const successCount = task.history.filter(r => r.success).length;
const successRate = (successCount / task.history.length * 100).toFixed(2);
console.log(`Success rate: ${successRate}%`);

// 计算平均执行时间
const avgDuration = task.history.reduce((sum, r) => sum + r.duration, 0) / task.history.length;
console.log(`Average duration: ${avgDuration.toFixed(2)}ms`);
```

## 完整示例

```typescript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler({
  debug: true,
  maxHistory: 100
});

// 创建带完整配置的任务
scheduler.createTask({
  id: 'data-sync',
  schedule: '*/30 * * * * *', // 每 30 秒
  tags: ['sync', 'data', 'high-priority'],
  handler: async () => {
    const data = await fetchRemoteData();
    await saveToDatabase(data);
  },
  options: {
    timezone: 'Asia/Shanghai',
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      factor: 2
    },
    onError: (error, taskId) => {
      console.error(`[${taskId}] Error:`, error.message);
      // 发送告警
      sendAlert({
        taskId,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }
});

scheduler.start();

// 查询任务状态
setTimeout(() => {
  const task = scheduler.getTask('data-sync');
  console.log('Task status:', task.status);
  console.log('Execution count:', task.executionCount);
  console.log('Last 3 executions:', task.history.slice(-3));
}, 60000);
```

## 相关链接

- [Scheduler API](./scheduler.md) - 调度器 API
- [核心概念](../guide/core-concepts.md) - 任务状态流转
- [类型定义](./types.md) - 完整类型定义
