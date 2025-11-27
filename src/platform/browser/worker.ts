/* eslint-disable no-restricted-globals */
/**
 * Web Worker 脚本。
 * 用于在后台线程中运行计时器，避免主线程阻塞或页面后台节流影响计时精度。
 */

interface TimerMessage {
  id: number;
  delay: number;
  type: 'schedule' | 'cancel';
}

const timers = new Map<number, number>();

self.onmessage = (e: MessageEvent<TimerMessage>) => {
  const { id, delay, type } = e.data;

  if (type === 'schedule') {
    const timerId = self.setTimeout(() => {
      self.postMessage({ id, type: 'tick' });
      timers.delete(id);
    }, delay);
    timers.set(id, timerId);
  } else if (type === 'cancel') {
    const timerId = timers.get(id);
    if (timerId !== undefined) {
      self.clearTimeout(timerId);
      timers.delete(id);
    }
  }
};