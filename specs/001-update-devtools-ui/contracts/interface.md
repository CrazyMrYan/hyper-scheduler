# 接口契约: DevTools <-> Scheduler

**功能分支**: `001-update-devtools-ui`

## 概述
由于 DevTools 与 Scheduler 运行在同一进程（或主线程与 Worker 通信），这里的“契约”主要定义 TypeScript 接口和事件定义。

## TypeScript 接口

```typescript
// core/types.ts 或 ui/types.ts

export interface DevToolsOptions {
  /** 自动附加到 DOM (默认为 true) */
  autoAttach?: boolean;
  /** 主题: 'light' | 'dark' | 'auto' */
  theme?: 'light' | 'dark' | 'auto';
  /** 数据刷新节流间隔 (ms), 默认 500 */
  refreshRate?: number;
  /** 每个任务保留的历史记录数量, 默认 50 */
  maxHistory?: number;
}

export interface TaskControlAPI {
  /** 手动触发一次任务 */
  trigger(taskId: string): Promise<void>;
  /** 暂停任务 */
  pause(taskId: string): void;
  /** 恢复任务 */
  resume(taskId: string): void;
  /** 删除任务 */
  remove(taskId: string): void;
}

// 用于 DevTools 接收数据的只读接口
export interface SchedulerIntrospectionAPI {
  /** 获取所有任务的当前快照 */
  getTasks(): TaskSnapshot[];
  /** 订阅调度器事件 */
  on(event: SchedulerEventType, handler: (data: any) => void): () => void; // 返回 unsubscribe
}

// 事件类型定义
export type SchedulerEventType = 
  | 'task_registered' 
  | 'task_updated' 
  | 'task_started' 
  | 'task_completed' 
  | 'task_failed' 
  | 'task_removed';

// 事件载荷
export interface TaskEventPayload {
  taskId: string;
  timestamp: number;
  // ... 根据事件类型包含 executionId, duration, error 等
}
```

## 挂载方法

```typescript
// index.ts

export class Scheduler {
  // ... existing code ...

  /**
   * 启动 DevTools 并挂载到页面
   */
  attachDevTools(options?: DevToolsOptions): void;
}
```

## 交互流程

1.  **初始化**: 用户调用 `scheduler.attachDevTools()`。
2.  **挂载**: `HyperSchedulerDevTools` Web Component 被创建并 append 到 `document.body`。
3.  **绑定**: DevTools 组件内部获取 `scheduler` 实例的引用（通过构造函数传参或全局 WeakMap）。
4.  **通信**:
    *   DevTools 监听 Scheduler 的事件流更新 UI。
    *   DevTools 调用 `scheduler.trigger/pause/resume` 等方法控制任务。

## 错误处理

*   如果 `attachDevTools` 在非浏览器环境（如 Node.js）调用，应打印警告并安全退出，不抛出异常。
*   如果 Scheduler 实例已销毁，DevTools 应显示“Disconnected”状态。
