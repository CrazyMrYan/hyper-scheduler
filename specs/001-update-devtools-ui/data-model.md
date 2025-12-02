# 数据模型: DevTools UI

**功能分支**: `001-update-devtools-ui`

## 核心实体

### TaskSnapshot
代表任务在某一时刻的完整状态快照，用于列表展示和详情查看。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | `string` | 任务唯一标识符 |
| `status` | `'running' \| 'paused' \| 'stopped' \| 'error'` | 当前调度状态 |
| `lastRun` | `number \| null` | 最后一次执行的时间戳 (Date.now()) |
| `nextRun` | `number \| null` | 预计下一次执行的时间戳 |
| `executionCount` | `number` | 自启动以来的执行总次数 |
| `interval` | `number \| string` | 调度间隔 (ms 或 cron 字符串) |
| `tags` | `string[]` | 任务标签列表 |
| `error` | `string \| null` | 最后一次报错信息 (如有) |

### ExecutionLog
单次任务执行的详细记录，用于历史分析和时间轴绘制。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | `string` | 执行记录的唯一 ID (UUID/Nanoid) |
| `taskId` | `string` | 关联的任务 ID |
| `startTime` | `number` | 执行开始时间戳 |
| `duration` | `number` | 执行耗时 (ms) |
| `drift` | `number` | 时间漂移 (实际开始时间 - 计划开始时间) |
| `result` | `'success' \| 'failure'` | 执行结果 |
| `message` | `string \| null` | 结果消息或错误堆栈 |

### DevToolsState (Store)
DevTools 内部状态管理对象。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `isOpen` | `boolean` | 面板是否展开 |
| `activeTab` | `'tasks' \| 'timeline'` | 当前激活的标签页 |
| `theme` | `'light' \| 'dark' \| 'auto'` | 当前主题 |
| `filterText` | `string` | 任务列表搜索过滤词 |
| `selectedTaskId` | `string \| null` | 当前选中的任务 ID (详情视图) |
| `tasks` | `Map<string, TaskSnapshot>` | 所有任务的最新快照 |
| `history` | `Map<string, ExecutionLog[]>` | 任务执行历史 (Key: TaskID)，每任务限制 N 条 |
| `fps` | `number` | 当前主线程 FPS |

## 数据流向

1.  **Scheduler -> DevTools**:
    *   Scheduler 触发事件 (`task_start`, `task_complete`, `task_error`, `task_registered`)。
    *   DevTools 监听这些事件，更新 `tasks` Map 和 `history` Map。
    *   使用 `requestAnimationFrame` 更新 `fps`。

2.  **DevTools -> Scheduler**:
    *   用户点击操作 (Trigger, Pause, Remove)。
    *   DevTools 调用 Scheduler 提供的控制接口 (API Contracts)。

## 验证规则

*   **History Limit**: `history.get(taskId).length` 必须 <= 配置的最大限制 (默认 50)。新日志加入时，超出部分需移除 (FIFO)。
*   **Immutability**: 为了渲染性能，更新 Store 时应尽量保持对象引用不可变性 (Immutable patterns) 或明确触发 update 事件，避免深层比较。
