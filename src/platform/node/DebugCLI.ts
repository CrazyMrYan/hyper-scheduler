import { Task } from '../../types';

/**
 * Node.js 环境下的调试 CLI 工具。
 * 用于在控制台输出任务状态表格。
 */
export class DebugCLI {
  static logTaskUpdate(tasks: Task[]): void {
    console.clear();
    console.log('--- Hyper Scheduler Status ---');
    console.table(tasks.map(t => ({
      ID: t.id,
      Status: t.status,
      Schedule: t.schedule,
      NextRun: t.nextRun ? new Date(t.nextRun).toISOString() : 'N/A',
      LastRun: t.lastRun ? new Date(t.lastRun).toISOString() : 'N/A'
    })));
  }
}