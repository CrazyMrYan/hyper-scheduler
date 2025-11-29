# Scheduler API

## 类: `Scheduler`

调度器的主类，负责管理和调度所有定时任务。

### 构造函数

```typescript
new Scheduler(config?: SchedulerConfig)
```

创建一个新的调度器实例。

**参数**:
- `config` (可选): 调度器配置对象
  - `debug?: boolean`: 是否开启调试模式，开启后会在控制台输出详细日志。默认 `false`。
  - `timezone?: string`: 指定时区（如 `'Asia/Shanghai'`）。默认使用本地系统时区。
  - `maxHistory?: number`: 每个任务保留的最大历史记录数。默认 `50`。

**示例**:
```typescript
const scheduler = new Scheduler({
  debug: true,
  maxHistory: 100
});
```

---

### 方法

#### `createTask(definition: TaskDefinition): void`

注册一个新的定时任务。如果任务 ID 已存在，会抛出错误。

**参数**:
- `definition`: 任务定义对象
  - `id: string`: 任务唯一标识符，必须唯一
  - `schedule: string`: 调度规则
    - Cron 表达式: `'*/5 * * * * *'` (每 5 秒)
    - 时间间隔: `'30s'`, `'5m'`, `'1h'`, `'1d'`
  - `handler: () => void | Promise<void>`: 任务执行的回调函数，支持异步
  - `tags?: string[]`: 任务标签，用于分类和过滤
  - `options?: TaskOptions`: 任务选项
    - `retry?: { maxAttempts: number; delay: number }`: 重试配置
    - `timezone?: string`: 任务专属时区

**示例**:
```typescript
// Cron 表达式
scheduler.createTask({
  id: 'sync-data',
  schedule: '0 */2 * * *', // 每 2 小时整点
  handler: async () => {
    await syncData();
  },
  tags: ['sync', 'important']
});

// 时间间隔
scheduler.createTask({
  id: 'heartbeat',
  schedule: '30s',
  handler: () => {
    console.log('心跳检测');
  }
});
```

#### `deleteTask(taskId: string): boolean`

根据 ID 删除一个已注册的任务。

**参数**:
- `taskId: string`: 要删除的任务 ID

**返回值**:
- `boolean`: 删除成功返回 `true`，任务不存在返回 `false`

**示例**:
```typescript
const deleted = scheduler.deleteTask('sync-data');
if (deleted) {
  console.log('任务已删除');
}
```

#### `start(): void`

启动调度器。启动后，调度器开始计时并根据规则触发任务。

**示例**:
```typescript
scheduler.start();
console.log('调度器已启动');
```

#### `stop(): void`

停止调度器。停止后，所有任务暂停触发，直到再次调用 `start()`。

**示例**:
```typescript
scheduler.stop();
console.log('调度器已停止');
```

#### `getTask(taskId: string): Task | undefined`

获取指定 ID 的任务详细信息，包括运行时状态。

**参数**:
- `taskId: string`: 任务 ID

**返回值**:
- `Task | undefined`: 任务对象，如果不存在返回 `undefined`

**示例**:
```typescript
const task = scheduler.getTask('sync-data');
if (task) {
  console.log('下次执行时间:', new Date(task.nextRun));
  console.log('执行次数:', task.executionCount);
  console.log('当前状态:', task.status);
}
```

#### `getAllTasks(): Task[]`

获取所有已注册的任务列表。

**返回值**:
- `Task[]`: 任务数组

**示例**:
```typescript
const tasks = scheduler.getAllTasks();
console.log(`共有 ${tasks.length} 个任务`);
tasks.forEach(task => {
  console.log(`- ${task.id}: ${task.status}`);
});
```

#### `triggerTask(taskId: string): Promise<void>`

手动触发指定任务立即执行一次，忽略调度规则。

**参数**:
- `taskId: string`: 任务 ID

**返回值**:
- `Promise<void>`: 异步执行完成

**示例**:
```typescript
// 手动触发任务
await scheduler.triggerTask('sync-data');
console.log('任务已手动执行');
```

#### `startTask(taskId: string): void`

启动一个已停止的任务，使其重新加入调度。

**参数**:
- `taskId: string`: 任务 ID

**示例**:
```typescript
scheduler.startTask('sync-data');
```

#### `stopTask(taskId: string): void`

停止指定任务，使其不再被调度。

**参数**:
- `taskId: string`: 任务 ID

**示例**:
```typescript
scheduler.stopTask('sync-data');
```

#### `attachDevTools(options?: DevToolsOptions): Promise<void>`

在浏览器环境中启动可视化调试工具。

**参数**:
- `options` (可选): DevTools 配置
  - `theme?: 'light' | 'dark' | 'auto'`: 主题模式，默认 `'auto'`
  - `dockPosition?: 'right' | 'bottom'`: 停靠位置，默认 `'right'`

**示例**:
```typescript
// 启动 DevTools
await scheduler.attachDevTools({
  theme: 'dark',
  dockPosition: 'bottom'
});
```

---

## 类型定义

### `SchedulerConfig`

```typescript
interface SchedulerConfig {
  debug?: boolean;
  timezone?: string;
  maxHistory?: number;
}
```

### `TaskDefinition`

```typescript
interface TaskDefinition {
  id: string;
  schedule: string;
  handler: () => void | Promise<void>;
  tags?: string[];
  options?: TaskOptions;
}
```

### `TaskOptions`

```typescript
interface TaskOptions {
  retry?: {
    maxAttempts: number;
    delay: number;
  };
  timezone?: string;
}
```

### `Task`

```typescript
interface Task extends TaskDefinition {
  status: 'idle' | 'running' | 'stopped' | 'error';
  lastRun?: number;
  nextRun?: number;
  executionCount?: number;
  history: ExecutionRecord[];
}
```

### `TaskStatus`

任务的运行状态：

- `'idle'`: 空闲，等待下次调度
- `'running'`: 正在执行
- `'stopped'`: 已停止，不会再被调度
- `'error'`: 执行出错

### `ExecutionRecord`

```typescript
interface ExecutionRecord {
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}
```

---

## 事件系统

调度器支持事件订阅，用于监听任务状态变化。

### `on(event: string, handler: Function): () => void`

订阅事件。

**支持的事件**:
- `'task_registered'`: 任务注册时触发
- `'task_updated'`: 任务更新时触发
- `'task_started'`: 任务开始执行时触发
- `'task_completed'`: 任务执行成功时触发
- `'task_failed'`: 任务执行失败时触发
- `'task_stopped'`: 任务停止时触发
- `'task_removed'`: 任务删除时触发

**返回值**:
- `() => void`: 取消订阅的函数

**示例**:
```typescript
// 订阅任务完成事件
const unsubscribe = scheduler.on('task_completed', (payload) => {
  console.log(`任务 ${payload.taskId} 执行完成，耗时 ${payload.duration}ms`);
});

// 取消订阅
unsubscribe();
```

---

## 完整示例

```typescript
import { Scheduler } from 'hyper-scheduler';

// 创建调度器
const scheduler = new Scheduler({
  debug: true,
  maxHistory: 100
});

// 注册任务
scheduler.createTask({
  id: 'data-sync',
  schedule: '*/30 * * * * *', // 每 30 秒
  handler: async () => {
    console.log('开始同步数据...');
    await syncData();
    console.log('数据同步完成');
  },
  tags: ['sync', 'important'],
  options: {
    retry: {
      maxAttempts: 3,
      delay: 5000
    }
  }
});

// 监听事件
scheduler.on('task_failed', (payload) => {
  console.error(`任务失败: ${payload.error}`);
});

// 启动调度器
scheduler.start();

// 启动 DevTools（仅浏览器）
if (typeof window !== 'undefined') {
  scheduler.attachDevTools({ theme: 'auto' });
}
```