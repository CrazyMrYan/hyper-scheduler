import { validateCron, getNextRun as getCronNextRun } from './cron-lite';

export type ScheduleType = 'cron' | 'interval';

export interface ParsedSchedule {
  type: ScheduleType;
  value: any | number;
}

/**
 * 解析调度规则字符串，将其转换为 Cron 表达式对象或毫秒级间隔。
 * 支持的间隔格式: "10s", "5m", "2h", "1d"。
 * @param schedule 调度规则字符串
 * @returns 解析后的调度对象
 * @throws Error 如果字符串格式无效
 */
export function parseSchedule(schedule: string): ParsedSchedule {
  // 1. 尝试作为间隔字符串解析
  const intervalRegex = /^(\d+)(s|m|h|d)$/;
  const match = schedule.match(intervalRegex);

  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    let multiplier = 1000;

    switch (unit) {
      case 's':
        multiplier = 1000;
        break;
      case 'm':
        multiplier = 60 * 1000;
        break;
      case 'h':
        multiplier = 60 * 60 * 1000;
        break;
      case 'd':
        multiplier = 24 * 60 * 60 * 1000;
        break;
    }

    return {
      type: 'interval',
      value: value * multiplier,
    };
  }

  // 2. 尝试作为 Cron 表达式解析
  try {
    validateCron(schedule);
    // 对于 Cron，我们返回原始字符串，以便后续根据上下文（如时区）重新解析
    return {
      type: 'cron',
      value: schedule, 
    };
  } catch (err) {
    // 解析失败
    throw new Error(`无效的调度格式: "${schedule}". 必须是有效的 Cron 表达式或间隔字符串 (例如 "10s")。`);
  }
}

/**
 * 计算下一次运行时间。
 * @param schedule 调度规则字符串或已解析的对象
 * @param options 可选配置 (cron 的时区，interval 的上次运行时间)
 * @returns 下一次运行的 Date 对象
 */
export function getNextRun(
  schedule: string | ParsedSchedule,
  options?: { timezone?: string; lastRun?: number }
): Date {
  let parsed: ParsedSchedule;

  if (typeof schedule === 'string') {
    parsed = parseSchedule(schedule);
  } else {
    parsed = schedule;
  }

  if (parsed.type === 'interval') {
    const intervalMs = parsed.value as number;
    const lastRun = options?.lastRun || Date.now();
    return new Date(lastRun + intervalMs);
  } else {
    // Cron
    const cronExpression = parsed.value as string;
    try {
      return getCronNextRun(cronExpression, options?.timezone);
    } catch (err) {
       throw new Error(`无法计算下一次 Cron 运行时间: ${cronExpression}`);
    }
  }
}