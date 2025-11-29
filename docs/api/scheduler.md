# Scheduler API

## Scheduler

核心调度器类，负责任务的注册、调度和生命周期管理。

### 构造函数

```typescript
new Scheduler(config?: SchedulerConfig)
```

**参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `config.debug` | `boolean` | `false` | 启用调试日志输出 |
| `config.timezone` | `string` | 系统时区 | 全局时区设置，如 `'Asia/Shanghai'` |
| `config.maxHistory` | `number` | `50` | 每个任务保留的最大执行历史记录数 |

**示例**

```typescript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler({
  debug: true,
  timezone: 'Asia/Shanghai',
  maxHistory: 100
});
```

---

### 方法

#### createTask

注册新任务。

```typescript
createTask(definition: TaskDefinition): void
```

**参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `definition.id` | `string` | ✓ | 任务唯一标识符 |
| `definition.schedule` | `string` | ✓ | 调度规则（Cron 表达式或时间间隔） |
| `definition.handler` | `() => void \| Promise<void>` | ✓ | 任务执行函数 |
| `definition.tags` | `string[]` | - | 任务标签，用于分类过滤 |
| `definition.options.retry` | `RetryConfig` | - | 重试配置 |
| `definition.options.timezone` | `string` | - | 任务专属时区 |

**RetryConfig**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxAttempts` | `number` | - | 最大重试次数 |
| `initialDelay` | `number` | - | 首次重试延迟（毫秒） |
| `factor` | `number` | `2` | 延迟递增因子 |

**示例**

```typescript
// Cron 表达式
scheduler.createTask({
  id: 'daily-backup',
  schedule: '0 0 2 * * *', // 每天凌晨 2:00
  handler: async () => {
    await backupDatabase();
  },
  tags: ['backup', 'critical']
});

// 时间间隔
scheduler.createTask({
  id: 'heartbeat',
  schedule: '30s', // 每 30 秒
  handler: () => {
    sendHeartbeat();
  },
  options: {
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      factor: 2
    }
  }
});
```

---

#### deleteTask

删除指定任务。

```typescript
deleteTask(taskId: string): boolean
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `taskId` | `string` | 任务 ID |

**返回值**: `boolean` - 删除成功返回 `true`

---

#### start

启动调度器，开始执行所有已注册的任务。

```typescript
start(): void
```

---

#### stop

停止调度器，暂停所有任务的调度。

```typescript
stop(): void
```

---

#### startTask

启动指定任务（从 stopped 状态恢复）。

```typescript
startTask(taskId: string): void
```

---

#### stopTask

停止指定任务。

```typescript
stopTask(taskId: string): void
```

---

#### triggerTask

手动触发任务立即执行一次，不影响正常调度。

```typescript
triggerTask(taskId: string): Promise<void>
```

---

#### getTask

获取任务详情。

```typescript
getTask(taskId: string): Task | undefined
```

**返回值**: `Task` 对象或 `undefined`

---

#### getAllTasks

获取所有任务列表。

```typescript
getAllTasks(): Task[]
```

---

#### on

订阅事件。

```typescript
on(event: string, handler: (payload: any) => void): () => void
```

**事件类型**

| 事件 | 触发时机 | payload |
|------|----------|---------|
| `task_registered` | 任务注册 | `{ taskId, task }` |
| `task_started` | 任务开始执行 | `{ taskId, task }` |
| `task_completed` | 任务执行成功 | `{ taskId, task, duration }` |
| `task_failed` | 任务执行失败 | `{ taskId, task, error, duration }` |
| `task_stopped` | 任务停止 | `{ taskId, task }` |
| `task_removed` | 任务删除 | `{ taskId }` |

**返回值**: 取消订阅函数

**示例**

```typescript
const unsubscribe = scheduler.on('task_completed', ({ taskId, duration }) => {
  console.log(`Task ${taskId} completed in ${duration}ms`);
});

// 取消订阅
unsubscribe();
```

---

#### attachDevTools

启动可视化调试工具（仅浏览器环境）。

```typescript
attachDevTools(options?: DevToolsOptions): Promise<void>
```

**参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options.theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | 主题模式 |
| `options.dockPosition` | `'right' \| 'bottom'` | `'right'` | 面板停靠位置 |

---

## 类型定义

### SchedulerConfig

```typescript
interface SchedulerConfig {
  debug?: boolean;
  timezone?: string;
  maxHistory?: number;
}
```

### TaskDefinition

```typescript
interface TaskDefinition {
  id: string;
  schedule: string;
  handler: () => void | Promise<void>;
  tags?: string[];
  options?: TaskOptions;
}
```

### TaskOptions

```typescript
interface TaskOptions {
  retry?: {
    maxAttempts: number;
    initialDelay: number;
    factor?: number;
  };
  timezone?: string;
}
```

### Task

```typescript
interface Task extends TaskDefinition {
  status: TaskStatus;
  lastRun?: number;
  nextRun?: number;
  executionCount?: number;
  history: ExecutionRecord[];
}
```

### TaskStatus

```typescript
type TaskStatus = 'idle' | 'running' | 'stopped' | 'error';
```

| 状态 | 说明 |
|------|------|
| `idle` | 等待调度 |
| `running` | 正在执行 |
| `stopped` | 已停止 |
| `error` | 执行出错 |

### ExecutionRecord

```typescript
interface ExecutionRecord {
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}
```

### DevToolsOptions

```typescript
interface DevToolsOptions {
  theme?: 'light' | 'dark' | 'auto';
  dockPosition?: 'right' | 'bottom';
}
```
