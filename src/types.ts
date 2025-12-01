import { TaskStatus as TaskStatusEnum } from './constants';

export type TaskStatus = typeof TaskStatusEnum[keyof typeof TaskStatusEnum];

export interface ExecutionRecord {
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}

export interface TaskOptions {
  retry?: {
    maxAttempts: number;
    initialDelay: number;
    factor?: number;
  };
  timezone?: string;
  /** 任务执行失败时的错误处理回调 */
  onError?: (error: Error, taskId: string) => void;
  /**
   * 定时器驱动方式（仅浏览器环境有效）
   * - 'worker': 使用 Web Worker（默认，更精确，不受后台节流影响）
   * - 'main': 使用主线程 setTimeout（更简单，但可能受后台节流影响）
   * 如果不指定，则使用调度器全局配置
   */
  driver?: 'worker' | 'main';
}

export interface TaskDefinition {
  id: string;
  /**
   * 任务调度规则。
   * 支持:
   * 1. Cron 表达式 (例如: "*\/5 * * * * *")
   * 2. 间隔字符串 (例如: "10s", "5m", "1h")
   */
  schedule: string;
  handler: () => void | Promise<void>;
  options?: TaskOptions;
  tags?: string[];
}

export interface Task extends TaskDefinition {
  status: TaskStatus;
  lastRun?: number;
  nextRun?: number;
  history: ExecutionRecord[];
  tags?: string[];
  executionCount?: number;
}

export interface SchedulerConfig {
  debug?: boolean;
  maxHistory?: number;
  timezone?: string; // e.g., 'Asia/Shanghai'
  plugins?: HyperSchedulerPlugin[];
  /**
   * 定时器驱动方式（仅浏览器环境有效）
   * - 'worker': 使用 Web Worker（默认，更精确，不受后台节流影响）
   * - 'main': 使用主线程 setTimeout（更简单，但可能受后台节流影响）
   */
  driver?: 'worker' | 'main';
}

export interface HyperSchedulerPlugin {
  name: string;
  init(scheduler: any, options?: any): void;
}


export interface TaskSnapshot {
  id: string;
  status: string;
  lastRun: number | null;
  nextRun: number | null;
  executionCount: number;
  schedule: string;
  tags: string[];
  error: string | null;
  driver: 'worker' | 'main';
}

export interface DevToolsOptions {
  /** 主题模式 */
  theme?: 'light' | 'dark' | 'auto';
  /** 面板停靠位置 */
  dockPosition?: 'right' | 'bottom';
  /** 界面语言 */
  language?: 'en' | 'zh';
  /** 时间线默认缩放级别 (0.5-5) */
  defaultZoom?: number;
  /** 悬浮按钮配置 */
  trigger?: {
    /** 背景色 */
    backgroundColor?: string;
    /** 文字/图标颜色 */
    textColor?: string;
    /** 位置 */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  };
}

export interface TaskControlAPI {
  trigger(taskId: string): Promise<void>;
  pause(taskId: string): void;
  resume(taskId: string): void;
  remove(taskId: string): void;
}

export interface SchedulerIntrospectionAPI {
  getTasks(): TaskSnapshot[];
  on(event: string, handler: (data: any) => void): () => void;
  isRunning(): boolean;
}
