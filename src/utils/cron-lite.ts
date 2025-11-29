/**
 * 轻量级 Cron 解析器
 * 支持标准 5 位和 6 位 cron 表达式
 * 格式: [秒] 分 时 日 月 周
 */

interface CronFields {
  second: number[];
  minute: number[];
  hour: number[];
  dayOfMonth: number[];
  month: number[];
  dayOfWeek: number[];
}

/**
 * 解析单个 cron 字段
 */
function parseField(field: string, min: number, max: number): number[] {
  const values: Set<number> = new Set();

  // 处理 * (所有值)
  if (field === '*') {
    for (let i = min; i <= max; i++) {
      values.add(i);
    }
    return Array.from(values).sort((a, b) => a - b);
  }

  // 处理逗号分隔的多个值: 1,3,5
  const parts = field.split(',');
  for (const part of parts) {
    // 处理步长: */5 或 1-10/2
    if (part.includes('/')) {
      const [range, step] = part.split('/');
      const stepNum = parseInt(step, 10);
      
      if (range === '*') {
        for (let i = min; i <= max; i += stepNum) {
          values.add(i);
        }
      } else if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (start < min || end > max) {
          throw new Error(`Value out of range: ${start}-${end} (expected ${min}-${max})`);
        }
        for (let i = start; i <= end; i += stepNum) {
          values.add(i);
        }
      } else {
        const start = parseInt(range, 10);
        if (start < min || start > max) {
          throw new Error(`Value out of range: ${start} (expected ${min}-${max})`);
        }
        for (let i = start; i <= max; i += stepNum) {
          values.add(i);
        }
      }
    }
    // 处理范围: 1-5
    else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (start < min || end > max) {
        throw new Error(`Value out of range: ${start}-${end} (expected ${min}-${max})`);
      }
      for (let i = start; i <= end; i++) {
        values.add(i);
      }
    }
    // 处理单个值: 5
    else {
      const val = parseInt(part, 10);
      if (val < min || val > max) {
        throw new Error(`Value out of range: ${val} (expected ${min}-${max})`);
      }
      values.add(val);
    }
  }

  return Array.from(values).sort((a, b) => a - b);
}

/**
 * 解析 cron 表达式
 */
function parseCronExpression(expression: string): CronFields {
  const parts = expression.trim().split(/\s+/);
  
  // 支持 5 位 (分 时 日 月 周) 和 6 位 (秒 分 时 日 月 周)
  let second: number[], minute: number[], hour: number[], dayOfMonth: number[], month: number[], dayOfWeek: number[];
  
  if (parts.length === 5) {
    // 5 位格式: 分 时 日 月 周
    second = [0]; // 默认在 0 秒执行
    [minute, hour, dayOfMonth, month, dayOfWeek] = [
      parseField(parts[0], 0, 59),
      parseField(parts[1], 0, 23),
      parseField(parts[2], 1, 31),
      parseField(parts[3], 1, 12),
      parseField(parts[4], 0, 6),
    ];
  } else if (parts.length === 6) {
    // 6 位格式: 秒 分 时 日 月 周
    [second, minute, hour, dayOfMonth, month, dayOfWeek] = [
      parseField(parts[0], 0, 59),
      parseField(parts[1], 0, 59),
      parseField(parts[2], 0, 23),
      parseField(parts[3], 1, 31),
      parseField(parts[4], 1, 12),
      parseField(parts[5], 0, 6),
    ];
  } else {
    throw new Error(`Invalid cron expression: expected 5 or 6 fields, got ${parts.length}`);
  }

  return { second, minute, hour, dayOfMonth, month, dayOfWeek };
}

/**
 * 验证 cron 表达式
 */
export function validateCron(expression: string): void {
  try {
    parseCronExpression(expression);
  } catch (err) {
    throw new Error(`Invalid cron expression: ${expression}`);
  }
}

/**
 * 检查日期是否匹配 cron 字段
 */
function matchesCron(date: Date, fields: CronFields): boolean {
  const second = date.getSeconds();
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // JS 月份从 0 开始
  const dayOfWeek = date.getDay(); // 0 = 周日

  return (
    fields.second.includes(second) &&
    fields.minute.includes(minute) &&
    fields.hour.includes(hour) &&
    fields.month.includes(month) &&
    (fields.dayOfMonth.includes(dayOfMonth) || fields.dayOfWeek.includes(dayOfWeek))
  );
}

/**
 * 计算下一次运行时间
 */
export function getNextRun(expression: string, _timezone?: string): Date {
  const fields = parseCronExpression(expression);
  const now = new Date();
  
  // 从下一秒开始查找
  let candidate = new Date(now.getTime() + 1000);
  candidate.setMilliseconds(0);
  
  // 最多向前查找 4 年（避免无限循环）
  const maxIterations = 4 * 365 * 24 * 60 * 60; // 4 年的秒数
  let iterations = 0;
  
  while (iterations < maxIterations) {
    if (matchesCron(candidate, fields)) {
      return candidate;
    }
    
    // 优化：跳到下一个可能的时间点
    const second = candidate.getSeconds();
    const minute = candidate.getMinutes();
    const hour = candidate.getHours();
    
    // 如果秒不匹配，跳到下一个匹配的秒
    if (!fields.second.includes(second)) {
      const nextSecond = fields.second.find(s => s > second) ?? fields.second[0];
      if (nextSecond > second) {
        candidate.setSeconds(nextSecond);
      } else {
        candidate.setMinutes(minute + 1, nextSecond);
      }
      candidate.setMilliseconds(0);
      iterations++;
      continue;
    }
    
    // 如果分钟不匹配，跳到下一个匹配的分钟
    if (!fields.minute.includes(minute)) {
      const nextMinute = fields.minute.find(m => m > minute) ?? fields.minute[0];
      if (nextMinute > minute) {
        candidate.setMinutes(nextMinute, fields.second[0]);
      } else {
        candidate.setHours(hour + 1, nextMinute, fields.second[0]);
      }
      candidate.setMilliseconds(0);
      iterations++;
      continue;
    }
    
    // 如果小时不匹配，跳到下一个匹配的小时
    if (!fields.hour.includes(hour)) {
      const nextHour = fields.hour.find(h => h > hour) ?? fields.hour[0];
      if (nextHour > hour) {
        candidate.setHours(nextHour, fields.minute[0], fields.second[0]);
      } else {
        candidate.setDate(candidate.getDate() + 1);
        candidate.setHours(nextHour, fields.minute[0], fields.second[0]);
      }
      candidate.setMilliseconds(0);
      iterations++;
      continue;
    }
    
    // 如果都不匹配，跳到下一秒
    candidate = new Date(candidate.getTime() + 1000);
    iterations++;
  }
  
  throw new Error(`Could not find next run time for cron expression: ${expression}`);
}
