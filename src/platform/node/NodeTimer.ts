import { TimerStrategy } from '../TimerStrategy';

/**
 * Node.js 环境下的计时策略实现。
 * 简单包装了原生的 setTimeout 和 clearTimeout。
 */
export class NodeTimer implements TimerStrategy {
  schedule(callback: () => void, delay: number): NodeJS.Timeout {
    return setTimeout(callback, delay);
  }

  cancel(handle: NodeJS.Timeout): void {
    clearTimeout(handle);
  }
}