# Scheduler

核心调度器类，负责任务的注册、调度和生命周期管理。

## 概念说明：Scheduler vs Task

在 Hyper Scheduler 中，理解这两个核心概念的区别至关重要：

- **Scheduler (调度器)**：
    - **角色**：管理者、指挥官。
    - **职责**：维护任务列表、管理时间轴、触发执行、处理全局配置（如时区、插件）。
    - **数量**：通常一个应用只需一个全局 Scheduler 实例。

- **Task (任务)**：
    - **角色**：执行单元、工兵。
    - **职责**：包含具体的业务逻辑（`handler`）、调度规则（`schedule`）和运行配置（如 `driver`、重试策略）。
    - **数量**：一个 Scheduler 可以管理成百上千个 Task。

简而言之，**Scheduler** 决定了“**什么时候**”以及“**如何**”运行，而 **Task** 定义了“**做什么**”。

## 构造函数

```typescript
new Scheduler(config?: SchedulerConfig)
```

### 参数

- **config** `SchedulerConfig` - 可选配置对象

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `debug` | `boolean` | `false` | 启用调试日志输出 |
| `timezone` | `string` | 系统时区 | 全局时区设置，如 `'Asia/Shanghai'` |
| `maxHistory` | `number` | `50` | 每个任务保留的最大执行历史记录数 |
| `plugins` | `HyperSchedulerPlugin[]` | `[]` | 要在初始化时加载的插件实例数组 |

### 示例

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

## 实例方法

### createTask()

注册新任务到调度器。

```typescript
createTask(definition: TaskDefinition): void
```

#### 参数

- **definition** `TaskDefinition` - 任务定义对象

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | ✓ | 任务唯一标识符 |
| `schedule` | `string` | ✓ | 调度规则（Cron 表达式或时间间隔） |
| `handler` | `() => void \| Promise<void>` | ✓ | 任务执行函数 |
| `tags` | `string[]` | - | 任务标签，用于分类过滤 |
| `options` | `TaskOptions` | - | 任务选项 |

详细的 `TaskOptions` 配置请参考 [Task API](./task.md)。

#### 示例

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
      factor: 2
    },
    onError: (error, taskId) => {
      console.error(`Task ${taskId} failed:`, error.message);
    }
  }
});
```

### start()

启动调度器，开始执行所有已注册的任务。

```typescript
start(scope?: string): void
```

#### 参数

- **scope** `string` - 可选。指定要启动的任务的命名空间。如果省略，则启动所有任务。

#### 示例

```typescript
// 启动所有任务
scheduler.start();

// 仅启动 'system' 命名空间下的任务
scheduler.start('system');
```

### stop()

停止调度器，暂停所有任务的调度。已经在执行的任务会继续完成。

```typescript
stop(scope?: string): void
```

#### 参数

- **scope** `string` - 可选。指定要停止的任务的命名空间。如果省略，则停止所有任务。

#### 示例

```typescript
// 停止所有任务
scheduler.stop();

// 仅停止 'system' 命名空间下的任务
scheduler.stop('system');
```

### startTask()

启动指定任务（从 stopped 状态恢复）。

```typescript
startTask(taskId: string): void
```

#### 参数

- **taskId** `string` - 任务 ID

#### 示例

```typescript
scheduler.startTask('daily-backup');
```

### stopTask()

停止指定任务，任务状态变为 `stopped`，不再参与调度。

```typescript
stopTask(taskId: string): void
```

#### 参数

- **taskId** `string` - 任务 ID

#### 示例

```typescript
scheduler.stopTask('daily-backup');
```

### triggerTask()

手动触发任务立即执行一次，不影响正常调度。执行完成后恢复到之前的状态。

```typescript
triggerTask(taskId: string): Promise<void>
```

#### 参数

- **taskId** `string` - 任务 ID

#### 返回值

- `Promise<void>` - 任务执行完成后 resolve

#### 示例

```typescript
await scheduler.triggerTask('daily-backup');
console.log('Manual trigger completed');
```

### deleteTask()

删除指定任务，任务将从调度器中移除。

```typescript
deleteTask(taskId: string): boolean
```

#### 参数

- **taskId** `string` - 任务 ID

#### 返回值

- `boolean` - 删除成功返回 `true`，任务不存在返回 `false`

#### 示例

```typescript
const deleted = scheduler.deleteTask('old-task');
if (deleted) {
  console.log('Task removed successfully');
}
```

### getTask()

获取指定任务的详细信息。

```typescript
getTask(taskId: string): Task | undefined
```

#### 参数

- **taskId** `string` - 任务 ID

#### 返回值

- `Task | undefined` - 任务对象，不存在则返回 `undefined`

#### 示例

```typescript
const task = scheduler.getTask('daily-backup');
if (task) {
  console.log('Task status:', task.status);
  console.log('Next run:', new Date(task.nextRun));
}
```

### getAllTasks()

获取所有已注册任务的列表。

```typescript
getAllTasks(namespace?: string): Task[]
```

#### 参数

- **namespace** `string` - 可选。指定要获取的任务的命名空间。如果省略，则返回所有任务。

#### 返回值

- `Task[]` - 任务对象数组

#### 示例

```typescript
// 获取所有任务
const allTasks = scheduler.getAllTasks();

// 获取 'system' 命名空间下的任务
const systemTasks = scheduler.getAllTasks('system');
console.log(`System tasks: ${systemTasks.length}`);
```

### on()

订阅调度器事件。

```typescript
on(event: string, handler: (payload: any) => void): () => void
```

#### 参数

- **event** `string` - 事件名称
- **handler** `(payload: any) => void` - 事件处理函数

#### 返回值

- `() => void` - 取消订阅函数

#### 支持的事件

| 事件名 | 触发时机 | payload 结构 |
|--------|----------|--------------|
| `task_registered` | 任务注册时 | `{ taskId: string, task: Task }` |
| `task_started` | 任务开始执行时 | `{ taskId: string, task: Task }` |
| `task_completed` | 任务执行成功时 | `{ taskId: string, task: Task, duration: number }` |
| `task_failed` | 任务执行失败时 | `{ taskId: string, task: Task, error: Error, duration: number }` |
| `task_stopped` | 任务停止时 | `{ taskId: string, task: Task }` |
| `task_removed` | 任务删除时 | `{ taskId: string }` |

#### 示例

```typescript
// 订阅任务完成事件
const unsubscribe = scheduler.on('task_completed', ({ taskId, duration }) => {
  console.log(`Task ${taskId} completed in ${duration}ms`);
});

// 订阅任务失败事件
scheduler.on('task_failed', ({ taskId, error }) => {
  console.error(`Task ${taskId} failed:`, error.message);
  // 发送告警通知
  sendAlert(taskId, error);
});

// 取消订阅
unsubscribe();
```

## 相关链接

- [Task API](./task.md) - 任务配置详解
- [DevTools API](./devtools.md) - 调试工具配置
- [类型定义](./types.md) - 完整类型定义
