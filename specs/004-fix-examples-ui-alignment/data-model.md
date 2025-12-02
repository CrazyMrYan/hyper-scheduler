# 数据模型: 任务与调度

## 核心实体

### Task (任务)

任务是调度器管理的基本单元。

| 字段名 | 类型 | 必填 | 描述 | 变更 |
|---|---|---|---|---|
| `id` | `string` | 是 | 任务唯一标识符 | 无 |
| `schedule` | `string` | 是 | Cron 表达式或间隔字符串 (如 "5s") | 无 |
| `handler` | `() => void` | 是 | 任务执行逻辑 | 无 |
| `status` | `TaskStatus` | 自动 | 当前状态 (`idle` \| `running` \| `stopped` \| `error`) | 无 |
| `lastRun` | `number` | 自动 | 上次运行时间戳 (ms) | 无 |
| `nextRun` | `number` | 自动 | 下次计划运行时间戳 (ms) | 无 |
| `history` | `ExecutionRecord[]` | 自动 | 执行历史记录 (最近 N 条) | 无 |
| `options` | `TaskOptions` | 否 | 高级配置 (重试, 时区) | 无 |
| `tags` | `string[]` | **否** | **任务标签，用于分类和批量管理** | **新增** |

### TaskDefinition (任务定义)

用户创建任务时提供的配置对象。

```typescript
interface TaskDefinition {
  id: string;
  schedule: string;
  handler: () => void | Promise<void>;
  options?: TaskOptions;
  tags?: string[]; // 新增字段
}
```

### TaskStatus (枚举)

- `idle`: 空闲，等待调度
- `running`: 正在执行
- `stopped`: 已停止，不会被调度
- `error`: 最近一次执行出错 (等待重试或下一次调度)

### ExecutionRecord (执行记录)

```typescript
interface ExecutionRecord {
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}
```
