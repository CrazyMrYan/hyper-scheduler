import { describe, it, expect, vi } from 'vitest';
import { parseSchedule, getNextRun } from '../../src/utils/schedule';
import * as cronParser from 'cron-parser';

// @ts-ignore
const parser = cronParser.default || cronParser;

vi.mock('cron-parser', () => ({
  default: {
    parseExpression: vi.fn((cron: string) => {
      if (cron === 'invalid-cron' || cron === 'invalid') {
        throw new Error('Invalid cron format');
      }
      // Mock a basic cron-parser behavior
      return {
        next: vi.fn(() => ({
          toDate: vi.fn(() => new Date(Date.now() + 60 * 1000)), // Next minute
        })),
      };
    }),
  },
  parseExpression: vi.fn((cron: string) => {
    if (cron === 'invalid-cron' || cron === 'invalid') {
      throw new Error('Invalid cron format');
    }
    // Mock a basic cron-parser behavior
    return {
      next: vi.fn(() => ({
        toDate: vi.fn(() => new Date(Date.now() + 60 * 1000)), // Next minute
      })),
    };
  }),
}));

describe('schedule.ts', () => {
  describe('parseSchedule', () => {
    it('should parse valid interval strings (s)', () => {
      const result = parseSchedule('10s');
      expect(result.type).toBe('interval');
      expect(result.value).toBe(10 * 1000);
    });

    it('should parse valid interval strings (m)', () => {
      const result = parseSchedule('5m');
      expect(result.type).toBe('interval');
      expect(result.value).toBe(5 * 60 * 1000);
    });

    it('should parse valid interval strings (h)', () => {
      const result = parseSchedule('2h');
      expect(result.type).toBe('interval');
      expect(result.value).toBe(2 * 60 * 60 * 1000);
    });

    it('should parse valid interval strings (d)', () => {
      const result = parseSchedule('1d');
      expect(result.type).toBe('interval');
      expect(result.value).toBe(1 * 24 * 60 * 60 * 1000);
    });

    it('should parse valid cron expressions', () => {
      const result = parseSchedule('* * * * *');
      expect(result.type).toBe('cron');
      expect(result.value).toBe('* * * * *');
      expect(parser.parseExpression).toHaveBeenCalledWith('* * * * *');
    });

    it('should throw error for invalid format', () => {
      expect(() => parseSchedule('invalid')).toThrow(/无效的调度格式/);
    });

    it('should throw error for invalid cron after interval check', () => {
      expect(() => parseSchedule('invalid-cron')).toThrow(/无效的调度格式/);
    });
  });

  describe('getNextRun', () => {
    it('should return next run for interval schedule', () => {
      const now = Date.now();
      vi.setSystemTime(now); // Mock current time
      const schedule = parseSchedule('5s');
      const nextRun = getNextRun(schedule, { lastRun: now });
      expect(nextRun.getTime()).toBe(now + 5 * 1000);
      vi.useRealTimers();
    });

    it('should return next run for cron schedule', () => {
      const now = Date.now();
      vi.setSystemTime(now);
      const schedule = parseSchedule('* * * * *');
      const nextRun = getNextRun(schedule, { timezone: 'UTC' });
      expect(parser.parseExpression).toHaveBeenCalledWith('* * * * *', { tz: 'UTC' });
      expect(nextRun.getTime()).toBe(now + 60 * 1000); // Mocked value
      vi.useRealTimers();
    });

    it('should throw error for invalid cron in getNextRun', () => {
      expect(() => getNextRun('invalid-cron')).toThrow(/无效的调度格式/);
    });
  });
});
