import { validateCron as validate, getNextRun as getNext } from './cron-lite';

/**
 * 验证 Cron 表达式是否有效。
 * @param cronExpression Cron 表达式
 * @throws Error 如果表达式无效
 */
export function validateCron(cronExpression: string): void {
  validate(cronExpression);
}

/**
 * 根据 Cron 表达式计算下一次运行时间。
 * @param cronExpression Cron 表达式
 * @param timezone 可选的时区（暂不支持，保留接口兼容性）
 * @returns 下一次运行的 Date 对象
 */
export function getNextRun(cronExpression: string, timezone?: string): Date {
  return getNext(cronExpression, timezone);
}