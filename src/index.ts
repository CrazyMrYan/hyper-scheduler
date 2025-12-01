import { Scheduler as CoreScheduler, TimerStrategyFactory } from './core/Scheduler';
import { SchedulerConfig } from './types';
import { NodeTimer } from './platform/node/NodeTimer';
import { BrowserTimer } from './platform/browser/BrowserTimer';
import { MainThreadTimer } from './platform/browser/MainThreadTimer';
import { TimerStrategy } from './platform/TimerStrategy';
import { DevTools } from './plugins/DevTools';

// Determine environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// 缓存定时器策略实例
let workerTimerInstance: BrowserTimer | null = null;
let mainTimerInstance: MainThreadTimer | null = null;

/**
 * 获取默认的定时器策略
 */
function getDefaultTimerStrategy(config?: SchedulerConfig): TimerStrategy {
  if (isBrowser) {
    const driver = config?.driver || 'worker';
    if (driver === 'main') {
      if (!mainTimerInstance) mainTimerInstance = new MainThreadTimer();
      return mainTimerInstance;
    }
    if (!workerTimerInstance) workerTimerInstance = new BrowserTimer();
    return workerTimerInstance;
  }
  return new NodeTimer();
}

/**
 * 创建定时器策略工厂（仅浏览器环境有效）
 */
function createTimerStrategyFactory(): TimerStrategyFactory | undefined {
  if (!isBrowser) return undefined;
  
  return (driver: 'worker' | 'main'): TimerStrategy => {
    if (driver === 'main') {
      if (!mainTimerInstance) mainTimerInstance = new MainThreadTimer();
      return mainTimerInstance;
    }
    if (!workerTimerInstance) workerTimerInstance = new BrowserTimer();
    return workerTimerInstance;
  };
}

/**
 * Hyper Scheduler 主入口类。
 * 自动根据运行环境（浏览器或 Node.js）选择合适的计时策略。
 * 
 * 支持两级 driver 配置：
 * 1. 全局配置：new Scheduler({ driver: 'worker' | 'main' })
 * 2. 任务级配置：createTask({ options: { driver: 'worker' | 'main' } })
 * 
 * 任务级配置优先于全局配置。
 */
export class Scheduler extends CoreScheduler {
  /**
   * 创建调度器实例。
   * @param config 配置项
   */
  constructor(config?: SchedulerConfig) {
    super(
      getDefaultTimerStrategy(config), 
      config,
      createTimerStrategyFactory()
    );
  }
}

export * from './types';
export { CoreScheduler, DevTools };