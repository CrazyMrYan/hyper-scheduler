# API 契约

**功能**: 007-解决所有问题

## 1. 调度器 API

### `createTask(definition: TaskDefinition): void`
- **更新**: 在 `options` 中接受 `namespace` 和 `runImmediately`。

### `start(scope?: string): void`
- **更新**: 接受可选的 `scope` 参数。
- **行为**:
  - 如果提供了 `scope`，则仅启动该命名空间内的任务。
  - 如果省略了 `scope`，则启动所有任务（向后兼容）。

### `stop(scope?: string): void`
- **更新**: 接受可选的 `scope` 参数。
- **行为**:
  - 如果提供了 `scope`，则仅停止该命名空间内的任务。
  - 如果省略了 `scope`，则停止所有任务。

### `getTasks(namespace?: string): Task[]`
- **新增/更新**: 返回任务。如果提供了 `namespace`，则按其进行筛选。

## 2. DevTools 接口 (内部)

### `setScheduler(scheduler: SchedulerAdapter)`
- **更新**: 传递给 DevTools 的适配器接口将包含：
  - `getTasksByNamespace()`: 支持新的分层视图。
  - `zoomStep`: 传递配置。