# 类型定义

Hyper Scheduler 的完整 TypeScript 类型定义。

## 核心类型

### SchedulerConfig

调度器配置接口。

```typescript
interface SchedulerConfig {
  debug?: boolean;
  maxHistory?: number;
  timezone?: string;
  plugins?: HyperSchedulerPlugin[];
  driver?: 'worker' | 'main';
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `debug` | `boolean` | `false` | 启用调试日志 |
| `maxHistory` | `number` | `50` | 每个任务保留的最大执行历史记录数 |
| `timezone` | `string` | 系统时区 | 全局时区设置，如 `'Asia/Shanghai'` |
| `plugins` | `HyperSchedulerPlugin[]` | `[]` | 插件实例数组 |
| `driver` | `'worker' \| 'main'` | `'worker'` | 定时器驱动方式（仅浏览器）：`'worker'` 使用 Web Worker，`'main'` 使用主线程 |

---

### TaskDefinition

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

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | ✓ | 任务唯一标识符 |
| `schedule` | `string` | ✓ | 调度规则（Cron 表达式或时间间隔） |
| `handler` | `() => void \| Promise<void>` | ✓ | 任务执行函数 |
| `tags` | `string[]` | - | 任务标签 |
| `options` | `TaskOptions` | - | 任务选项 |

---

### TaskOptions

任务配置选项接口。

```typescript
interface TaskOptions {
  retry?: RetryConfig;
  timezone?: string;
  onError?: (error: Error, taskId: string) => void;
  driver?: 'worker' | 'main';
}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `retry` | `RetryConfig` | 重试配置 |
| `timezone` | `string` | 任务专属时区 |
| `onError` | `(error: Error, taskId: string) => void` | 错误处理回调 |
| `driver` | `'worker' \| 'main'` | 定时器驱动方式（仅浏览器），覆盖全局配置 |

#### RetryConfig

```typescript
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  factor?: number;
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxAttempts` | `number` | - | 最大重试次数 |
| `initialDelay` | `number` | - | 首次重试延迟（毫秒） |
| `factor` | `number` | `2` | 延迟递增因子 |

---

### Task

任务运行时对象，继承自 `TaskDefinition`。

```typescript
interface Task extends TaskDefinition {
  status: TaskStatus;
  lastRun?: number;
  nextRun?: number;
  executionCount?: number;
  history: ExecutionRecord[];
}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `status` | `TaskStatus` | 任务状态 |
| `lastRun` | `number` | 上次执行时间戳（毫秒） |
| `nextRun` | `number` | 下次执行时间戳（毫秒） |
| `executionCount` | `number` | 累计执行次数 |
| `history` | `ExecutionRecord[]` | 执行历史记录 |

---

### TaskStatus

任务状态枚举。

```typescript
type TaskStatus = 'idle' | 'running' | 'stopped' | 'error';
```

| 值 | 说明 |
|----|------|
| `idle` | 等待调度 |
| `running` | 正在执行 |
| `stopped` | 已停止 |
| `error` | 执行出错 |

---

### ExecutionRecord

任务执行记录接口。

```typescript
interface ExecutionRecord {
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `timestamp` | `number` | 执行时间戳（毫秒） |
| `duration` | `number` | 执行耗时（毫秒） |
| `success` | `boolean` | 是否成功 |
| `error` | `string` | 错误信息（失败时） |

---

## 插件类型

### HyperSchedulerPlugin

插件接口。

```typescript
interface HyperSchedulerPlugin {
  name: string;
  init(scheduler: Scheduler, options?: any): void;
}
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 插件名称 |
| `init` | `(scheduler: Scheduler, options?: any) => void` | 初始化方法 |

---

### DevToolsOptions

DevTools 插件配置接口。

```typescript
interface DevToolsOptions {
  theme?: 'light' | 'dark' | 'auto';
  dockPosition?: 'right' | 'bottom';
  language?: 'en' | 'zh';
  defaultZoom?: number;
  trigger?: TriggerOptions;
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | 主题模式 |
| `dockPosition` | `'right' \| 'bottom'` | `'right'` | 面板停靠位置 |
| `language` | `'en' \| 'zh'` | `'en'` | 界面语言 |
| `defaultZoom` | `number` | `1` | 时间线默认缩放级别 (0.5-5) |
| `trigger` | `TriggerOptions` | - | 悬浮按钮配置 |

#### TriggerOptions

```typescript
interface TriggerOptions {
  backgroundColor?: string;
  textColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `backgroundColor` | `string` | `'#3b82f6'` | 背景色 |
| `textColor` | `string` | `'#ffffff'` | 文字/图标颜色 |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | 位置 |

---

## 内部类型

以下类型主要用于内部实现和高级用法。

### TaskSnapshot

任务快照接口，用于序列化和传输。

```typescript
interface TaskSnapshot {
  id: string;
  status: string;
  lastRun: number | null;
  nextRun: number | null;
  executionCount: number;
  schedule: string;
  tags: string[];
  error: string | null;
}
```

---

### TaskControlAPI

任务控制 API 接口。

```typescript
interface TaskControlAPI {
  trigger(taskId: string): Promise<void>;
  pause(taskId: string): void;
  resume(taskId: string): void;
  remove(taskId: string): void;
}
```

---

### SchedulerIntrospectionAPI

调度器内省 API 接口。

```typescript
interface SchedulerIntrospectionAPI {
  getTasks(): TaskSnapshot[];
  on(event: string, handler: (data: any) => void): () => void;
}
```

---

## 类型导出

所有类型都可以从主包导出：

```typescript
import type {
  // 核心类型
  SchedulerConfig,
  TaskDefinition,
  TaskOptions,
  Task,
  TaskStatus,
  ExecutionRecord,
  
  // 插件类型
  HyperSchedulerPlugin,
  DevToolsOptions,
  
  // 内部类型
  TaskSnapshot,
  TaskControlAPI,
  SchedulerIntrospectionAPI
} from 'hyper-scheduler';
```

## 使用示例

### 类型安全的任务定义

```typescript
import type { TaskDefinition, TaskOptions } from 'hyper-scheduler';

const taskOptions: TaskOptions = {
  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    factor: 2
  },
  timezone: 'Asia/Shanghai',
  onError: (error, taskId) => {
    console.error(`Task ${taskId} failed:`, error);
  }
};

const taskDef: TaskDefinition = {
  id: 'my-task',
  schedule: '*/5 * * * * *',
  handler: async () => {
    await doSomething();
  },
  tags: ['sync', 'critical'],
  options: taskOptions
};
```

### 自定义插件

```typescript
import type { HyperSchedulerPlugin, Scheduler } from 'hyper-scheduler';

class MyPlugin implements HyperSchedulerPlugin {
  name = 'MyPlugin';
  
  init(scheduler: Scheduler, options?: any): void {
    scheduler.on('task_completed', ({ taskId, duration }) => {
      console.log(`Task ${taskId} took ${duration}ms`);
    });
  }
}

const scheduler = new Scheduler({
  plugins: [new MyPlugin()]
});
```

### 类型守卫

```typescript
import type { Task, TaskStatus } from 'hyper-scheduler';

function isRunning(task: Task): boolean {
  return task.status === 'running';
}

function hasError(task: Task): boolean {
  return task.status === 'error';
}

const task = scheduler.getTask('my-task');
if (task && isRunning(task)) {
  console.log('Task is currently running');
}
```

## 相关链接

- [Scheduler API](./scheduler.md) - 调度器 API
- [Task API](./task.md) - 任务 API
- [DevTools API](./devtools.md) - 调试工具 API
