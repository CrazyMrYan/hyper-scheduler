import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Scheduler } from '../../src/core/scheduler';
import { NodeTimer } from '../../src/platform/node/node-timer';
import { HyperSchedulerPlugin } from '../../src/types';
import { TaskStatus } from '../../src/constants';

describe('Scheduler Constructor Plugin Loading', () => {
  it('should initialize plugins passed in config', () => {
    const initSpy = vi.fn();
    const plugin: HyperSchedulerPlugin = {
      name: 'TestPlugin',
      init: initSpy
    };

    const scheduler = new Scheduler(new NodeTimer(), {
      plugins: [plugin]
    });

    expect(initSpy).toHaveBeenCalledTimes(1);
    expect(initSpy).toHaveBeenCalledWith(scheduler);
  });

  it('should not crash if a plugin throws error during init', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorPlugin: HyperSchedulerPlugin = {
      name: 'ErrorPlugin',
      init: () => {
        throw new Error('Plugin Init Failed');
      }
    };

    const scheduler = new Scheduler(new NodeTimer(), {
      plugins: [errorPlugin]
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('Scheduler Namespace Management', () => {
  let scheduler: Scheduler;
  let nodeTimerInstance: NodeTimer;
  let nodeTimerScheduleSpy: ReturnType<typeof vi.spyOn>;
  let handlerASpy: ReturnType<typeof vi.fn>;
  let handlerBSpy: ReturnType<typeof vi.fn>;
  let handlerCSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'));

    nodeTimerInstance = new NodeTimer();
    nodeTimerScheduleSpy = vi.spyOn(nodeTimerInstance, 'schedule');

    scheduler = new Scheduler(nodeTimerInstance, { debug: false });
    handlerASpy = vi.fn();
    handlerBSpy = vi.fn();
    handlerCSpy = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should create tasks with and without a namespace', () => {
    scheduler.createTask({ id: 'task-global', schedule: '1s', handler: handlerASpy });
    scheduler.createTask({ id: 'task-ns1', schedule: '1s', handler: handlerBSpy, options: { namespace: 'ns1' } });
    
    expect(scheduler.getTask('task-global')).toBeDefined();
    expect(scheduler.getTask('task-ns1')).toBeDefined();

    expect(scheduler.getAllTasks().length).toBe(2);
    expect(scheduler.getAllTasks('default').length).toBe(1);
    expect(scheduler.getAllTasks('ns1').length).toBe(1);
    expect(scheduler.getAllTasks('ns2').length).toBe(0);
  });

  it('should start and stop tasks within a specific namespace', async () => {
    scheduler.createTask({ id: 'task1-ns1', schedule: '1s', handler: handlerASpy, options: { namespace: 'ns1' } });
    scheduler.createTask({ id: 'task2-ns1', schedule: '1s', handler: handlerBSpy, options: { namespace: 'ns1' } });
    scheduler.createTask({ id: 'task3-ns2', schedule: '1s', handler: handlerCSpy, options: { namespace: 'ns2' } });

    scheduler.start('ns1');

    expect(nodeTimerScheduleSpy).toHaveBeenCalledTimes(2);
    
    await vi.advanceTimersByTimeAsync(1100);

    expect(handlerASpy).toHaveBeenCalledTimes(1);
    expect(handlerBSpy).toHaveBeenCalledTimes(1);
    expect(handlerCSpy).not.toHaveBeenCalled();

    scheduler.stop('ns1');
    await vi.advanceTimersByTimeAsync(1100);

    expect(handlerASpy).toHaveBeenCalledTimes(1);
    expect(handlerBSpy).toHaveBeenCalledTimes(1);
    expect(scheduler.getTask('task1-ns1')?.status).toBe(TaskStatus.STOPPED);
    expect(scheduler.getTask('task3-ns2')?.status).toBe(TaskStatus.STOPPED);
  });
  
  it('should stop global scope if `scope` is not passed', async () => {
    scheduler.createTask({ id: 'task1-ns1', schedule: '1s', handler: handlerASpy, options: { namespace: 'ns1' } });
    scheduler.createTask({ id: 'task2-ns2', schedule: '1s', handler: handlerBSpy, options: { namespace: 'ns2' } });
    
    scheduler.start();
    expect(nodeTimerScheduleSpy).toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1100);
    
    expect(handlerASpy).toHaveBeenCalledTimes(1);
    expect(handlerBSpy).toHaveBeenCalledTimes(1);
    
    scheduler.stop();
    await vi.advanceTimersByTimeAsync(1100);
    
    expect(scheduler.getTask('task1-ns1')?.status).toBe(TaskStatus.STOPPED);
    expect(scheduler.getTask('task2-ns2')?.status).toBe(TaskStatus.STOPPED);
  });

  it('should retrieve tasks filtered by namespace', () => {
    scheduler.createTask({ id: 'task1-ns1', schedule: '1s', handler: handlerASpy, options: { namespace: 'ns1' } });
    scheduler.createTask({ id: 'task2-ns1', schedule: '1s', handler: handlerBSpy, options: { namespace: 'ns1' } });
    scheduler.createTask({ id: 'task3-ns2', schedule: '1s', handler: handlerCSpy, options: { namespace: 'ns2' } });
    scheduler.createTask({ id: 'task4-default', schedule: '1s', handler: vi.fn() });

    const ns1Tasks = scheduler.getAllTasks('ns1');
    expect(ns1Tasks.length).toBe(2);
    expect(ns1Tasks.map(t => t.id)).toEqual(expect.arrayContaining(['task1-ns1', 'task2-ns1']));

    const ns2Tasks = scheduler.getAllTasks('ns2');
    expect(ns2Tasks.length).toBe(1);
    expect(ns2Tasks[0].id).toBe('task3-ns2');

    const defaultTasks = scheduler.getAllTasks('default');
    expect(defaultTasks.length).toBe(1);
    expect(defaultTasks[0].id).toBe('task4-default');

    const allTasks = scheduler.getAllTasks();
    expect(allTasks.length).toBe(4);
  });
});

describe('Scheduler Immediate Execution', () => {
  let scheduler: Scheduler;
  let handlerSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    scheduler = new Scheduler(new NodeTimer(), { debug: false });
    handlerSpy = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should run task immediately when scheduler starts', async () => {
    scheduler.createTask({ 
      id: 'task-immediate', 
      schedule: '1h', // Long interval
      handler: handlerSpy, 
      options: { runImmediately: true } 
    });

    expect(handlerSpy).not.toHaveBeenCalled();

    scheduler.start();

    // TriggerTask is async, wait for it
    await vi.waitUntil(() => handlerSpy.mock.calls.length > 0);
    
    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });

  it('should run task immediately when created if scheduler is running', async () => {
    scheduler.start();

    scheduler.createTask({ 
      id: 'task-immediate-runtime', 
      schedule: '1h', 
      handler: handlerSpy, 
      options: { runImmediately: true } 
    });

    await vi.waitUntil(() => handlerSpy.mock.calls.length > 0);
    
    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });
});