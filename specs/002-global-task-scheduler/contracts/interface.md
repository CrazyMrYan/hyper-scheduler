# API 接口契约 (TypeScript)

本库通过导出 TypeScript 类型和类来定义其公共 API。

## 核心类: Scheduler

```typescript
import { Task, TaskOptions, SchedulerConfig } from './types';

export class Scheduler {
  /**
   * 初始化调度器实例
   * @param config 全局配置项
   */
  constructor(config?: SchedulerConfig);

  /**
   * 创建并注册一个新任务
   * @param task 任务定义对象
   * @throws Error 如果任务 ID 已存在
   * @throws Error 如果 Cron 表达式无效
   */
  createTask(task: TaskDefinition): void;

  /**
   * 获取任务信息
   * @param id 任务 ID
   * @returns 任务对象，如果不存在返回 undefined
   */
  getTask(id: string): Task | undefined;

  /**
   * 启动指定任务 (如果任务已停止)
   * @param id 任务 ID
   */
  startTask(id: string): void;

  /**
   * 停止指定任务 (任务将不再被调度，直到重新启动)
   * @param id 任务 ID
   */
  stopTask(id: string): void;

  /**
   * 删除任务
   * @param id 任务 ID
   * @returns 是否删除成功
   */
  deleteTask(id: string): boolean;

  /**
   * 启动调度器 (开始处理所有任务)
   */
  start(): void;

  /**
   * 停止调度器 (停止所有任务的调度)
   */
  stop(): void;
}
```

## 类型定义

```typescript
export interface SchedulerConfig {
  debug?: boolean;      // 默认 false
  timezone?: string;    // 默认本地时区
}

export interface TaskDefinition {
  id: string;
  schedule: string;     // Cron 表达式
  handler: () => void | Promise<void>;
  options?: TaskOptions;
}

export interface TaskOptions {
  retry?: {
    maxAttempts: number;  // 最大重试次数
    initialDelay: number; // 初始延迟 (ms)
    factor: number;       // 指数因子
  };
  timezone?: string;      // 覆盖全局时区
}

export interface Task extends TaskDefinition {
  status: TaskStatus;
  lastRun?: number;
  nextRun?: number;
  history: ExecutionRecord[];
}

export type TaskStatus = 'idle' | 'running' | 'stopped' | 'error';

export interface ExecutionRecord {
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}
```
