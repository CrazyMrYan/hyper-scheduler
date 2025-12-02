# 数据模型

**功能**: 007-解决所有问题

## 1. 任务定义 (更新)

`TaskDefinition` 接口将更新，以包含命名空间和立即执行的新字段。

```typescript
interface TaskDefinition {
  id: string;
  // ... 现有字段 ...
  options?: TaskOptions;
}

interface TaskOptions {
  // ... 现有选项 ...
  
  /**
   * 任务隔离的命名空间。
   * 默认值: 'default'
   */
  namespace?: string;

  /**
   * 如果为 true，任务将在调度器启动时（或在创建时如果调度器已启动）立即运行一次。
   * 默认值: false
   */
  runImmediately?: boolean;
}
```

## 2. 任务注册表

内部存储结构需要有效地支持命名空间查询。

```typescript
class TaskRegistry {
  private tasks: Map<string, Task>;
  private namespaceIndex: Map<string, Set<string>>; // 命名空间 -> Set<任务ID>

  // ... 在添加/删除时更新 namespaceIndex 的方法 ...
}
```

## 3. DevTools 配置

`DevToolsOptions` 的更新，以支持新的 UI 自定义。

```typescript
interface DevToolsOptions {
  // ... 现有选项 ...

  /**
   * 时间线缩放的步长，单位为毫秒。
   * 默认值: 根据缩放级别动态调整
   */
  zoomStep?: number;
}
```