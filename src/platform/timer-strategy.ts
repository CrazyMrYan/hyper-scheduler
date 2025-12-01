/**
 * 计时策略接口。
 * 定义了跨平台计时器（Node.js 和 浏览器）的统一接口。
 */
export interface TimerStrategy {
  /**
   * 安排一个回调函数在指定延迟后执行。
   * @param callback 回调函数
   * @param delay 延迟毫秒数
   * @returns 用于取消定时器的句柄 (Handle)
   */
  schedule(callback: () => void, delay: number): any;

  /**
   * 取消一个已安排的定时器。
   * @param handle schedule 方法返回的句柄
   */
  cancel(handle: any): void;
}