export type TaskStatus = 'idle' | 'running' | 'stopped' | 'error';

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
    factor: number;
  };
  timezone?: string;
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
}

export interface SchedulerConfig {
  debug?: boolean;
  timezone?: string;
  maxHistory?: number;
}

export interface TaskSnapshot {
  id: string;
  status: string;
  lastRun: number | null;
  nextRun: number | null;
  executionCount: number;
  interval: string | number;
  tags: string[];
  error: string | null;
}

export interface DevToolsOptions {
  autoAttach?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  refreshRate?: number;
  maxHistory?: number;
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
}
