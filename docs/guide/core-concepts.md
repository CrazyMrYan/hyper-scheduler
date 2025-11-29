# 核心概念

## 调度器 (Scheduler)

调度器是系统的核心控制器，负责：

- 任务注册与管理
- 时间循环维护
- 任务触发与执行
- 状态跟踪

### 生命周期

```typescript
const scheduler = new Scheduler();

// 注册任务
scheduler.createTask({ ... });

// 启动调度
scheduler.start();

// 停止调度
scheduler.stop();
```

### 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `debug` | `boolean` | `false` | 启用调试日志 |
| `timezone` | `string` | 系统时区 | 全局时区 |
| `maxHistory` | `number` | `50` | 历史记录上限 |

---

## 任务 (Task)

任务是调度的基本单元，包含三个核心要素：

### ID

任务的唯一标识符，用于查询、触发、停止等操作。

### Schedule

调度规则，支持两种格式：

**Cron 表达式**

```
秒 分 时 日 月 周
```

| 字段 | 取值范围 | 特殊字符 |
|------|----------|----------|
| 秒 | 0-59 | `*` `,` `-` `/` |
| 分 | 0-59 | `*` `,` `-` `/` |
| 时 | 0-23 | `*` `,` `-` `/` |
| 日 | 1-31 | `*` `,` `-` `/` |
| 月 | 1-12 | `*` `,` `-` `/` |
| 周 | 0-7 | `*` `,` `-` `/` |

特殊字符说明：
- `*` - 任意值
- `,` - 列举值，如 `1,3,5`
- `-` - 范围，如 `1-5`
- `/` - 步长，如 `*/5`

**时间间隔**

| 单位 | 示例 |
|------|------|
| `s` | `30s` - 每 30 秒 |
| `m` | `5m` - 每 5 分钟 |
| `h` | `2h` - 每 2 小时 |
| `d` | `1d` - 每天 |

### Handler

任务执行函数，支持同步和异步：

```typescript
// 同步
handler: () => {
  console.log('executed');
}

// 异步
handler: async () => {
  await fetchData();
}
```

---

## 任务状态

| 状态 | 说明 |
|------|------|
| `stopped` | 已停止，不参与调度 |
| `idle` | 等待调度，将在下次触发时间执行 |
| `running` | 正在执行 |
| `error` | 执行出错 |

状态流转：

```
stopped -> idle -> running -> idle
                      |
                      v
                    error -> idle (重试) 或 error (放弃)
```

---

## 任务选项

### 重试配置

任务执行失败时可自动重试：

```typescript
scheduler.createTask({
  id: 'api-call',
  schedule: '1m',
  handler: async () => {
    await callAPI();
  },
  options: {
    retry: {
      maxAttempts: 3,     // 最大重试次数
      initialDelay: 1000, // 首次重试延迟 (ms)
      factor: 2           // 延迟递增因子
    }
  }
});
```

重试延迟计算：`initialDelay * (factor ^ attempt)`

示例（initialDelay=1000, factor=2）：
- 第 1 次重试：1000ms
- 第 2 次重试：2000ms
- 第 3 次重试：4000ms

### 错误处理

通过 `onError` 回调处理任务执行错误：

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
      // 发送告警
      alertService.send({
        title: 'Task Failed',
        message: error.message,
        taskId
      });
    }
  }
});
```

### 时区配置

为任务指定专属时区：

```typescript
scheduler.createTask({
  id: 'tokyo-report',
  schedule: '0 0 9 * * *', // 每天 9:00
  handler: () => generateReport(),
  options: {
    timezone: 'Asia/Tokyo'
  }
});
```

---

## 计时策略

调度器根据运行环境自动选择计时策略：

### Node.js

使用 `setTimeout` + `process.hrtime` 实现高精度计时。

### 浏览器

优先使用 Web Worker 运行计时循环，避免后台标签页节流问题。

浏览器在标签页切换到后台时会限制 `setTimeout` 最小间隔为 1 秒，Web Worker 不受此限制。

---

## 任务标签

标签用于任务分类和过滤：

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

在 DevTools 中可按标签搜索过滤任务。

---

## 执行历史

每个任务记录最近的执行历史：

```typescript
interface ExecutionRecord {
  timestamp: number;  // 执行时间戳
  duration: number;   // 执行耗时 (ms)
  success: boolean;   // 是否成功
  error?: string;     // 错误信息
}
```

通过 `maxHistory` 配置控制保留数量，默认 50 条。

---

## 事件系统

调度器支持事件订阅：

```typescript
// 订阅
const unsubscribe = scheduler.on('task_completed', (payload) => {
  console.log(`${payload.taskId} completed`);
});

// 取消订阅
unsubscribe();
```

| 事件 | 触发时机 |
|------|----------|
| `task_registered` | 任务注册 |
| `task_started` | 开始执行 |
| `task_completed` | 执行成功 |
| `task_failed` | 执行失败 |
| `task_stopped` | 任务停止 |
| `task_removed` | 任务删除 |

---

## DevTools

浏览器环境下的可视化调试工具。

### 配置项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | 主题模式 |
| `dockPosition` | `'right' \| 'bottom'` | `'right'` | 面板停靠位置 |
| `language` | `'en' \| 'zh'` | `'en'` | 界面语言 |
| `defaultZoom` | `number` | `1` | 时间线缩放级别 (0.5-5) |
| `trigger.backgroundColor` | `string` | `'#3b82f6'` | 悬浮按钮背景色 |
| `trigger.textColor` | `string` | `'#ffffff'` | 悬浮按钮文字颜色 |
| `trigger.position` | `string` | `'bottom-right'` | 悬浮按钮位置 |

### 示例

```typescript
await scheduler.attachDevTools({
  theme: 'dark',
  language: 'zh',
  dockPosition: 'bottom',
  defaultZoom: 2,
  trigger: {
    backgroundColor: '#10b981',
    textColor: '#ffffff',
    position: 'bottom-left'
  }
});
```
