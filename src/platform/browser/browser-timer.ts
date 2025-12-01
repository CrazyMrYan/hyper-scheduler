import { TimerStrategy } from '../timer-strategy';
// Import the worker as a URL or constructor depending on Vite config.
// For library mode, it is often safer to inline or assume a specific loading strategy.
// Here we use Vite's worker import query.
import Worker from './worker?worker&inline';

/**
 * 浏览器环境下的计时策略实现。
 * 使用 Web Worker 来运行计时循环，以避免后台标签页的节流限制。
 */
export class BrowserTimer implements TimerStrategy {
  private worker: Worker;
  private callbacks: Map<number, () => void>;
  private nextId: number;

  constructor() {
    // Fallback for environments without Worker (like JSDOM during tests if not mocked)
    // In a real browser, Worker should exist.
    if (typeof Worker !== 'undefined') {
        this.worker = new Worker();
    } else {
        // Minimal mock for SSR/Test env if not provided
        this.worker = {
            postMessage: () => {},
            onmessage: null,
            terminate: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false
        } as unknown as Worker;
    }

    this.callbacks = new Map();
    this.nextId = 1;

    this.worker.onmessage = (e: MessageEvent) => {
      const { id, type } = e.data;
      if (type === 'tick') {
        const callback = this.callbacks.get(id);
        if (callback) {
          callback();
          this.callbacks.delete(id);
        }
      }
    };
  }

  /**
   * 安排一个定时任务。
   * 向 Web Worker 发送消息以注册计时器。
   */
  schedule(callback: () => void, delay: number): number {
    const id = this.nextId++;
    this.callbacks.set(id, callback);
    this.worker.postMessage({ id, delay, type: 'schedule' });
    return id;
  }

  /**
   * 取消一个定时任务。
   */
  cancel(handle: number): void {
    this.worker.postMessage({ id: handle, type: 'cancel' });
    this.callbacks.delete(handle);
  }
}