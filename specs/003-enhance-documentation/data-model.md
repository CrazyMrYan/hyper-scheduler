# 数据模型与接口更新

## 实体更新: Task

### 字段: `schedule`
- **类型**: `string`
- **描述**: 定义任务执行的时间规则。
- **变更**: 
  - **旧行为**: 仅支持 Cron 表达式 (例如 `*/5 * * * * *`)。
  - **新行为**: 支持 Cron 表达式 **或** 间隔时间字符串。
  - **格式**:
    - Cron: 标准 5 或 6 段 Cron 表达式。
    - Interval: 数字 + 单位 (例如 `10s`, `5m`, `2h`)。支持单位: `s` (秒), `m` (分), `h` (时), `d` (天)。
- **验证规则**: 
  1. 首先尝试解析为 Cron 表达式。
  2. 如果失败，尝试解析为间隔字符串（正则匹配 `^(\d+)(s|m|h|d)$`）。
  3. 如果都失败，抛出无效格式错误。

## 接口更新: Scheduler

### 方法: `createTask(task: TaskDefinition)`
- **输入**: `TaskDefinition` 对象。
- **逻辑变更**: 在内部调用 `validateSchedule` 时，需兼容两种格式。如果是间隔字符串，计算 `nextRun` 时应基于 `Date.now() + intervalMs`。

### 内部方法: `validateSchedule(schedule: string)`
- **功能**: 验证 `schedule` 字符串的合法性。
- **返回**: 
  - `type`: `'cron' | 'interval'`
  - `value`: 解析后的 Cron 对象或毫秒数。

## 目录结构更新 (文档)

```text
docs/
├── .vitepress/
│   ├── config.ts          # 主配置 (包含多版本导航)
│   ├── theme/             # 自定义主题
│   └── sidebar.ts         # 侧边栏配置 (按版本区分)
├── public/
├── index.md               # 首页 (最新版)
├── guide/                 # 指南 (最新版)
│   ├── getting-started.md
│   └── core-concepts.md
├── api/                   # API 参考 (最新版)
│   └── scheduler.md
└── v1.0.0/                # [示例] 历史版本存档
    ├── index.md
    └── ...
```
