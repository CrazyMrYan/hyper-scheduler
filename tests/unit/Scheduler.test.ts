import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CoreScheduler } from '../../src/index';
import { TimerStrategy } from '../../src/platform/TimerStrategy';

// Mock TimerStrategy
class MockTimer implements TimerStrategy {
  schedule = vi.fn();
  cancel = vi.fn();
}

describe('Scheduler', () => {
  let scheduler: CoreScheduler;
  let mockTimer: MockTimer;

  beforeEach(() => {
    mockTimer = new MockTimer();
    scheduler = new CoreScheduler(mockTimer);
  });

  afterEach(() => {
    scheduler.stop();
  });

  it('should create a task successfully with interval string', () => {
    scheduler.createTask({
      id: 'interval-task',
      schedule: '10s', // Use an interval string
      handler: vi.fn(),
    });
    expect(scheduler.getTask('interval-task')).toBeDefined();
    expect(scheduler.getTask('interval-task')?.schedule).toBe('10s');
  });

  it('should throw error when creating duplicate task ID', () => {
    scheduler.createTask({
      id: 'test-task',
      schedule: '* * * * *',
      handler: vi.fn(),
    });
    expect(() => {
      scheduler.createTask({
        id: 'test-task',
        schedule: '* * * * *',
        handler: vi.fn(),
      });
    }).toThrow();
  });

  it('should delete a task', () => {
    scheduler.createTask({
      id: 'test-task',
      schedule: '* * * * *',
      handler: vi.fn(),
    });
    expect(scheduler.deleteTask('test-task')).toBe(true);
    expect(scheduler.getTask('test-task')).toBeUndefined();
  });

  it('should schedule task when started', () => {
    scheduler.createTask({
      id: 'test-task',
      schedule: '* * * * *',
      handler: vi.fn(),
    });
    
    scheduler.start();
    expect(mockTimer.schedule).toHaveBeenCalled();
  });

  it('should stop scheduling when stopped', () => {
    scheduler.createTask({
      id: 'test-task',
      schedule: '* * * * *',
      handler: vi.fn(),
    });
    scheduler.start();
    // Wait for schedule to happen? No, it happens synchronously in start() -> scheduleTask()
    // Scheduler logic:
    // start() -> scheduleTask(task) -> timerStrategy.schedule() -> timers.set(id, handle)
    
    scheduler.stop();
    // stop() -> timers.forEach(cancel)
    
    expect(mockTimer.cancel).toHaveBeenCalled();
  });
});
