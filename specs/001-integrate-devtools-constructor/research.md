# 阶段 0 研究: 插件系统设计

## 决策: 插件接口定义

**决策**: 定义 `HyperSchedulerPlugin` 接口，包含 `init` 方法。
**原理**: 
- 标准化插件与调度器的交互方式。
- `init` 方法接收 `scheduler` 实例和可选的 `options`，允许插件在初始化时访问调度器 API 并进行自我配置。
- 返回值设为 `void`，保持构造函数同步执行，不阻塞主线程。

**接口定义**:
```typescript
export interface HyperSchedulerPlugin {
  name: string;
  init(scheduler: Scheduler, options?: any): void;
}
```

## 决策: DevTools 初始化逻辑

**决策**: 在 `src/index.ts` 的 `Scheduler` 构造函数中遍历 `plugins` 并调用 `init`。
**原理**:
- `Scheduler` 类（扩展自 `CoreScheduler`）是用户交互的主要入口。
- 在构造函数中初始化插件可以确保在调度器使用前插件已就绪。
- `CoreScheduler` 保持纯净，专注于调度逻辑，不处理插件系统（除非未来需要深层钩子）。DevTools 仅依赖公共 API。

## 决策: 错误处理

**决策**: 使用 `try-catch` 包裹插件初始化循环，捕获错误并记录警告 (console.warn)，不抛出异常。
**原理**:
- 满足规范要求：插件失败不应导致调度器崩溃。
- 允许核心业务逻辑在辅助工具（如 DevTools）失败时继续运行。

## 决策: 移除 attachDevTools

**决策**: 直接从 `src/index.ts` 中删除 `attachDevTools` 方法。
**原理**:
- 这是一个破坏性变更 (Breaking Change)，符合规范要求的 "Remove Immediately"。
- 强迫用户迁移到新的构造函数注入模式，彻底解决 Tree-shaking 问题。

## 替代方案考虑

- **Promise based init**: 考虑到 `attachDevTools` 曾使用动态导入，理论上 `init` 可以是异步的。但构造函数必须是同步的。如果插件需要异步加载资源（如 DevTools UI 代码），它应该在 `init` 内部处理 Promise，或者由用户在外部加载好插件类后再传入实例。鉴于 Tree-shaking 的目标，用户会 import `DevTools` 类然后 `new DevTools()` 传入，这意味着代码已经被加载（如果是静态 import）。如果是动态 import，用户需自行处理 async logic 后再实例化 Scheduler，或者 Plugin 内部 handle async render。我们将采用 "Fire and Forget" 策略：`init` 立即返回，内部异步渲染 UI。
