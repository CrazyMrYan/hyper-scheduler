# 接口契约: Scheduler API 变更

## Scheduler 类 (src/index.ts)

### 移除的方法

- `attachDevTools(options?: DevToolsOptions): Promise<void>`

### 更新的构造函数

```typescript
constructor(config?: SchedulerConfig)
```
*行为变更*: 在调用 `super()` 后，会遍历 `config.plugins` 数组，并对每个插件调用 `init(this)`。任何错误都会被捕获并记录为警告。

## 类型定义 (src/types.ts)

### 新增接口

```typescript
export interface HyperSchedulerPlugin {
  name: string;
  init(scheduler: any, options?: any): void; // scheduler 类型将在实现时具体化
}
```

### 更新的接口

```typescript
export interface SchedulerConfig {
  // ... existing props
  plugins?: HyperSchedulerPlugin[];
}
```
