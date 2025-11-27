# Scheduler API

## 类: `Scheduler`

调度器的主类。

### 构造函数

```typescript
new Scheduler(options?: SchedulerOptions)
```

**参数**:
- `options` (可选):
  - `debug?: boolean`: 是否开启调试模式，开启后会输出详细日志。默认 `false`。
  - `timezone?: string`: (计划中) 指定时区，目前默认使用本地系统时区。

---

### 方法

#### `addTask(task: TaskDefinition): void`

注册一个新的定时任务。

**参数**:
- `task`: 任务定义对象
  - `id: string`: 任务唯一标识。如果重复会覆盖旧任务。
  - `schedule: string`: Cron 表达式 (e.g., `* * * * *`) 或 间隔字符串 (e.g., `30s`)。
  - `handler: () => void | Promise<void>`: 任务执行的回调函数。

**示例**:
```typescript
scheduler.addTask({
  id: 'sync-data',
  schedule: '15m',
  handler: async () => {
    await syncData();
  }
});
```

#### `removeTask(taskId: string): void`

根据 ID 移除一个已注册的任务。

**参数**:
- `taskId`: 要移除的任务 ID。

#### `start(): void`

启动调度器。启动后，调度器开始计时并根据规则触发任务。

#### `stop(): void`

停止调度器。停止后，所有任务暂停触发，直到再次调用 `start()`。

#### `getTask(taskId: string): Task | undefined`

获取指定 ID 的任务信息（包括下次执行时间等运行时状态）。

#### `clear(): void`

移除所有任务并停止调度器。

---

## 类型定义

### `TaskDefinition`

```typescript
interface TaskDefinition {
  id: string;
  schedule: string;
  handler: () => void | Promise<void>;
}
```