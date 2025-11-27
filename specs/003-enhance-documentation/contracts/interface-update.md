# API 接口更新契约

## 类型定义更新

```typescript
// src/types.ts

// No changes to interface structure, but documentation/comments need update
export interface TaskDefinition {
  id: string;
  /**
   * 任务调度规则。
   * 支持:
   * 1. Cron 表达式 (例如: "*/5 * * * * *")
   * 2. 间隔字符串 (例如: "10s", "5m", "1h")
   */
  schedule: string;
  handler: () => void | Promise<void>;
  options?: TaskOptions;
}
```

## 内部工具契约

```typescript
// src/utils/schedule.ts (New File)

export type ScheduleType = 'cron' | 'interval';

export interface ParsedSchedule {
  type: ScheduleType;
  // If cron, returns the parsed expression object (or closure)
  // If interval, returns the duration in milliseconds
  value: any | number; 
}

/**
 * 解析调度字符串
 * @param schedule 调度字符串
 * @returns 解析结果或抛出错误
 */
export function parseSchedule(schedule: string): ParsedSchedule;

/**
 * 获取下一次运行时间
 * @param schedule 解析后的调度对象 或 原始字符串
 * @param lastRun 上次运行时间 (用于间隔计算)
 * @returns Date 对象
 */
export function getNextRun(schedule: string | ParsedSchedule, lastRun?: number): Date;
```
