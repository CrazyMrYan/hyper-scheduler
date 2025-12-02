# 接口契约: Scheduler Public API

此文档描述了 `HyperScheduler` 的公共 API 变更和规范。

## Scheduler 类

### 方法更新

#### `createTask(definition: TaskDefinition): void`
- **功能**: 创建并注册一个新任务。
- **变更**: `definition` 参数现在支持 `tags` 字段。

#### `startTask(id: string): void`
- **功能**: 手动启动/恢复一个任务。

#### `stopTask(id: string): void`
- **功能**: 停止/暂停一个任务。

#### `deleteTask(id: string): boolean`
- **功能**: 从注册表中彻底移除任务。

#### `getTask(id: string): Task | undefined`
- **功能**: 获取任务详情。

### DevTools 交互接口 (Internal)

虽然不是公共 API，但 DevTools 需要以下内部能力：

#### `subscribe(listener: (tasks: Task[]) => void): () => void`
- **功能**: 订阅任务列表的全量更新。DevTools 通过此方法实时获取数据。

## 示例调用

```typescript
const scheduler = new Scheduler();

scheduler.createTask({
  id: 'cleanup-job',
  schedule: '0 0 * * *',
  tags: ['maintenance', 'core'], // 新增特性
  handler: async () => {
    console.log('Cleaning up...');
  }
});
```
