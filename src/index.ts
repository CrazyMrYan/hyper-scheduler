import { Scheduler as CoreScheduler } from './core/Scheduler';
import { SchedulerConfig, DevToolsOptions } from './types';
import { NodeTimer } from './platform/node/NodeTimer';
import { BrowserTimer } from './platform/browser/BrowserTimer';
import { TimerStrategy } from './platform/TimerStrategy';

// Determine environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

function getDefaultTimerStrategy(): TimerStrategy {
  if (isBrowser) {
    return new BrowserTimer();
  }
  return new NodeTimer();
}

/**
 * Hyper Scheduler 主入口类。
 * 自动根据运行环境（浏览器或 Node.js）选择合适的计时策略。
 */
export class Scheduler extends CoreScheduler {
  /**
   * 创建调度器实例。
   * @param config 配置项
   */
  constructor(config?: SchedulerConfig) {
    super(getDefaultTimerStrategy(), config);
  }

  /**
   * 启动 DevTools 并挂载到页面
   */
  async attachDevTools(options?: DevToolsOptions): Promise<void> {
    if (!isBrowser) {
      console.warn('DevTools can only be attached in browser environment');
      return;
    }
    try {
      // Dynamic import to avoid bundling UI code for Node
      await import('./ui/components/DevTools');
      
      // Check if element exists
      let el = document.querySelector('hs-devtools') as any;
      if (!el) {
        el = document.createElement('hs-devtools');
        if (options?.theme) el.setAttribute('theme', options.theme);
        if (options?.dockPosition) el.setAttribute('dock', options.dockPosition);
        document.body.appendChild(el);
      }

      // Set scheduler API adapter
      el.setScheduler({
        getTasks: () => {
          // Convert Task[] to TaskSnapshot[]
          return this.getAllTasks().map(task => ({
            id: task.id,
            status: task.status,
            lastRun: task.lastRun || null,
            nextRun: task.nextRun || null,
            executionCount: task.executionCount || 0,
            schedule: task.schedule,
            tags: task.tags || [],
            error: task.status === 'error' ? 'Execution failed' : null
          }));
        },
        on: (evt: string, handler: (payload: any) => void) => {
           return this.on(evt, handler);
        },
        trigger: (id: string) => this.triggerTask(id),
        pause: (id: string) => this.stopTask(id),
        resume: (id: string) => this.startTask(id),
        remove: (id: string) => this.deleteTask(id)
      });

    } catch (e) {
      console.error('Failed to load DevTools', e);
    }
  }
}

export * from './types';
export { CoreScheduler };