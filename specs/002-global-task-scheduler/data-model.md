# 数据模型: 全局任务调度器

## 实体定义

### 1. Task (任务)
代表一个独立的定时任务单元。

| 字段名 | 类型 | 描述 | 必填 | 备注 |
|---|---|---|---|---|
| `id` | `string` | 任务的唯一标识符 | 是 | 全局唯一，重复创建会抛错 |
| `schedule` | `string` | Cron 表达式 | 是 | 例如 `*/5 * * * *` |
| `handler` | `function` | 任务执行的具体逻辑 | 是 | 可以是同步或异步函数 |
| `options` | `TaskOptions` | 额外配置项 | 否 | 包含重试策略、时区等 |
| `status` | `TaskStatus` | 当前状态 | - | 运行时维护 (Idle, Running, Stopped, Failed) |
| `history` | `ExecutionRecord[]` | 执行历史记录 | - | 用于调试面板展示 |
| `nextRun` | `Date` | 下一次预计执行时间 | - | 根据 Cron 计算 |

### 2. ExecutionRecord (执行记录)
记录单次任务执行的结果。

| 字段名 | 类型 | 描述 |
|---|---|---|
| `timestamp` | `number` | 执行开始的时间戳 |
| `duration` | `number` | 执行耗时 (ms) |
| `status` | `Success` \| `Failure` | 执行结果 |
| `error` | `Error` (可选) | 如果失败，记录错误信息 |

### 3. SchedulerConfig (调度器配置)
初始化调度器时的全局配置。

| 字段名 | 类型 | 描述 | 默认值 |
|---|---|---|---|
| `debug` | `boolean` | 是否开启调试模式 | `false` |
| `timezone` | `string` | 全局时区设置 | 本地时区 |
| `maxHistory` | `number` | 每个任务保留的历史记录条数 | 50 |

## 状态枚举

### TaskStatus
- `IDLE`: 等待下次执行
- `RUNNING`: 正在执行中
- `STOPPED`: 已手动停止，不再调度
- `ERROR`: 最近一次执行出错（等待重试或下次调度）

## 关系
- 一个 `Scheduler` 包含多个 `Task` (Map<TaskId, Task>)。
- 一个 `Task` 包含多个 `ExecutionRecord`。

## 验证规则
- `id`: 必须是非空字符串，且在当前 Scheduler 实例中唯一。
- `schedule`: 必须是有效的标准 Cron 表达式 (5段或6段)。
- `handler`: 必须是函数类型。
