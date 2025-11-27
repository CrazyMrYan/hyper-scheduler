import parser from 'cron-parser';

/**
 * 验证 Cron 表达式是否有效。
 * @param cronExpression Cron 表达式
 * @throws Error 如果表达式无效
 */
export function validateCron(cronExpression: string): void {
  try {
    parser.parseExpression(cronExpression);
  } catch (err) {
    throw new Error(`Invalid cron expression: ${cronExpression}`);
  }
}

/**
 * 根据 Cron 表达式计算下一次运行时间。
 * @param cronExpression Cron 表达式
 * @param timezone 可选的时区
 * @returns 下一次运行的 Date 对象
 */
export function getNextRun(cronExpression: string, timezone?: string): Date {
  const options = timezone ? { tz: timezone } : {};
  try {
    const interval = parser.parseExpression(cronExpression, options);
    return interval.next().toDate();
  } catch (err) {
     // This should ideally be caught by validateCron, but as a safeguard
     throw new Error(`Failed to calculate next run for cron: ${cronExpression}`);
  }
}