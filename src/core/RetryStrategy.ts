import { TaskOptions } from '../types';

/**
 * 重试策略工具类。
 * 提供指数退避等重试延迟计算逻辑。
 */
export class RetryStrategy {
  /**
   * 计算下一次重试的延迟时间。
   * 采用指数退避算法 (Exponential Backoff)。
   * @param attempt 当前重试次数 (从 0 开始，0 表示第一次重试)
   * @param options 任务的重试配置
   * @returns 延迟毫秒数，如果超过最大尝试次数则返回 -1
   */
  static getDelay(attempt: number, options?: TaskOptions['retry']): number {
    if (!options) {
      return -1;
    }

    const { maxAttempts, initialDelay, factor } = options;

    if (attempt >= maxAttempts) {
      return -1;
    }

    return initialDelay * Math.pow(factor, attempt);
  }
}