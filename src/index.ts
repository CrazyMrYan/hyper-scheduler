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

    if (config?.debug) {
      this.initDebug();
    }
  }

  private async initDebug() {
    if (isBrowser) {
      // Dynamic import to avoid bundling UI code for Node
      try {
        const { DebugPanel } = await import('./ui/DebugPanel');
        const panel = new DebugPanel();
        panel.show();
        this.subscribe((tasks) => panel.update(tasks));
      } catch (e) {
        console.error('Failed to load DebugPanel', e);
      }
    } else {
      try {
        const { DebugCLI } = await import('./platform/node/DebugCLI');
        this.subscribe((tasks) => DebugCLI.logTaskUpdate(tasks));
      } catch (e) {
         console.error('Failed to load DebugCLI', e);
      }
    }
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
        document.body.appendChild(el);
      }

      // Set scheduler API adapter
      el.setScheduler({
        getTasks: () => this.getAllTasks(),
        on: (_evt: string, handler: (payload: any) => void) => {
           return this.subscribe(() => handler({}));
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