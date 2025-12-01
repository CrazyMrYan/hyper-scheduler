export const TaskStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  STOPPED: 'stopped',
  ERROR: 'error',
} as const;

export const SchedulerEvents = {
  TASK_REGISTERED: 'task_registered',
  TASK_STARTED: 'task_started',
  TASK_COMPLETED: 'task_completed',
  TASK_FAILED: 'task_failed',
  TASK_STOPPED: 'task_stopped',
  TASK_REMOVED: 'task_removed',
  TASK_UPDATED: 'task_updated',
  SCHEDULER_STARTED: 'scheduler_started',
  SCHEDULER_STOPPED: 'scheduler_stopped',
} as const;
