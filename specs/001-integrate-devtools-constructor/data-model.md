# 数据模型: 插件系统

## 核心实体

### SchedulerConfig (更新)

扩展现有的配置对象，增加 `plugins` 字段。

| 字段 | 类型 | 必填 | 描述 |
|-------|------|----------|-------------|
| ... | ... | ... | (现有字段保持不变) |
| plugins | `HyperSchedulerPlugin[]` | 否 | 要在初始化时加载的插件实例数组。 |

### HyperSchedulerPlugin (新增接口)

定义插件必须实现的接口。

| 方法/属性 | 类型 | 描述 |
|------------|------|-------------|
| name | `string` | 插件的唯一标识名称。 |
| init | `(scheduler: Scheduler, options?: any) => void` | 初始化方法，接收调度器实例。 |

## DevTools Plugin (新增类)

实现了 `HyperSchedulerPlugin` 接口的 DevTools 类。

| 属性 | 类型 | 描述 |
|-------|------|-------------|
| options | `DevToolsOptions` | DevTools 的配置选项 (如 theme)。 |

### DevToolsOptions (复用现有)

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| theme | `'auto' \| 'light' \| 'dark'` | UI 主题。默认为 'auto'。 |
| ... | ... | 其他现有配置项。 |
