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
| `config.plugins` | `HyperSchedulerPlugin[]` | `-` | 要在初始化时加载的插件实例数组 |

**示例**

```typescript
import { Scheduler, DevTools } from 'hyper-scheduler';

const scheduler = new Scheduler({
  debug: true,
  timezone: 'Asia/Shanghai',
  maxHistory: 100,
  plugins: [
    new DevTools({ theme: 'dark' })
  ]
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
| `definition.options` | `TaskOptions` | - | 任务选项 |

**TaskOptions**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `retry` | `RetryConfig` | - | 重试配置 |
| `timezone` | `string` | - | 任务专属时区，覆盖全局设置 |
| `onError` | `(error: Error, taskId: string) => void` | - | 错误处理回调函数 |

**RetryConfig**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxAttempts` | `number` | - | 最大重试次数 |
| `initialDelay` | `number` | - | 首次重试延迟（毫秒） |
| `factor` | `number` | `2` | 延迟递增因子（指数退避） |

**示例**

```typescript
// 基础任务
scheduler.createTask({
  id: 'daily-backup',
  schedule: '0 0 2 * * *', // 每天凌晨 2:00
  handler: async () => {
    await backupDatabase();
  },
  tags: ['backup', 'critical']
});

// 带重试和错误处理的任务
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
      factor: 2  // 重试延迟: 1s, 2s, 4s
    },
    onError: (error, taskId) => {
      console.error(`Task ${taskId} failed:`, error.message);
      // 发送告警通知
      sendAlert(taskId, error);
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

手动触发任务立即执行一次，不影响正常调度。执行完成后恢复到之前的状态。

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
  onError?: (error: Error, taskId: string) => void;
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
| `stopped` | 已停止，不参与调度 |
| `idle` | 等待调度 |
| `running` | 正在执行 |
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
  language?: 'en' | 'zh';
  defaultZoom?: number;
  trigger?: {
    backgroundColor?: string;
    textColor?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  };
}
```

### HyperSchedulerPlugin

调度器插件接口。

```typescript
interface HyperSchedulerPlugin {
  name: string;
  init(scheduler: Scheduler, options?: any): void;
}
```

### DevTools

DevTools 插件类，实现了 `HyperSchedulerPlugin` 接口。

```typescript
class DevTools implements HyperSchedulerPlugin {
  name: 'DevTools';
  constructor(options?: DevToolsOptions);
  init(scheduler: Scheduler): void;
}
```
