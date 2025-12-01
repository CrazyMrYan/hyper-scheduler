import { TimerStrategy } from '../timer-strategy';

/**
 * 浏览器环境下的主线程计时策略实现。
 * 使用原生的 setTimeout/clearTimeout，运行在主线程上。
 * 注意：在后台标签页中可能受到浏览器节流限制。
 */
export class MainThreadTimer implements TimerStrategy {
  schedule(callback: () => void, delay: number): number {
    return window.setTimeout(callback, delay) as unknown as number;
  }

  cancel(handle: number): void {
    window.clearTimeout(handle);
  }
}
