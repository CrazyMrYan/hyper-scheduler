import { SchedulerConfig, Task, TaskDefinition, ExecutionRecord } from '../types';
import { TaskStatus, SchedulerEvents } from '../constants';
import { TaskRegistry } from './task-registry';
import { TimerStrategy } from '../platform/timer-strategy';
import { validateId } from '../utils/id';
import { parseSchedule, getNextRun as getNextScheduleRun } from '../utils/schedule'; // 替换为新的 schedule 工具
import { RetryStrategy } from './retry-strategy';

export type TimerStrategyFactory = (driver: 'worker' | 'main') => TimerStrategy;

/**
 * 核心调度器类。
 * 负责管理任务生命周期、时间循环和任务执行。
 */
export class Scheduler {
  private registry: TaskRegistry;
  private config: SchedulerConfig;
  private defaultTimerStrategy: TimerStrategy;
  private timerStrategyFactory?: TimerStrategyFactory;
  private taskTimerStrategies: Map<string, TimerStrategy>; // Task ID -> TimerStrategy
  private running: boolean;
  private timers: Map<string, any>; // Task ID -> Timer Handle
  private listeners: ((tasks: Task[]) => void)[];
  private eventListeners: Map<string, Set<(payload: any) => void>>;

  /**
   * 创建一个新的调度器实例。
   * @param timerStrategy 默认计时策略（NodeTimer 或 BrowserTimer）
   * @param config 调度器配置
   * @param timerStrategyFactory 可选的定时器策略工厂，用于创建任务级别的定时器
   */
  constructor(
    timerStrategy: TimerStrategy, 
    config: SchedulerConfig = {},
    timerStrategyFactory?: TimerStrategyFactory
  ) {
    this.registry = new TaskRegistry();
    this.defaultTimerStrategy = timerStrategy;
    this.timerStrategyFactory = timerStrategyFactory;
    this.taskTimerStrategies = new Map();
    this.config = {
      debug: false,
      maxHistory: 50,
      ...config,
    };
    this.running = false;
    this.timers = new Map();
    this.listeners = [];
    this.eventListeners = new Map();

    // Initialize plugins
    if (this.config.plugins && Array.isArray(this.config.plugins)) {
      this.config.plugins.forEach(plugin => {
        try {
          this.log(`Initializing plugin: ${plugin.name}`);
          plugin.init(this);
        } catch (err) {
          console.warn(`[HyperScheduler] Failed to initialize plugin ${plugin.name}:`, err);
        }
      });
    }
  }

  /**
   * 订阅任务列表变更事件。
   * 当任务创建、状态改变或删除时触发。
   * @param listener 回调函数
   * @returns 取消订阅的函数
   */
  subscribe(listener: (tasks: Task[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * 订阅特定事件
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  on(event: string, handler: (payload: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
    
    return () => {
      this.eventListeners.get(event)?.delete(handler);
    };
  }

  private emit(event: string, payload: any): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  /**
   * 获取任务的定时器策略
   * 优先使用任务级别配置，其次使用全局配置，最后使用默认策略
   */
  private getTimerStrategy(task: Task): TimerStrategy {
    const taskDriver = task.options?.driver;
    const globalDriver = this.config.driver;
    const driver = taskDriver || globalDriver;
    
    // 如果没有指定 driver 或没有工厂函数，使用默认策略
    if (!driver || !this.timerStrategyFactory) {
      return this.defaultTimerStrategy;
    }
    
    // 检查是否已经为该任务创建了策略
    const cacheKey = `${task.id}_${driver}`;
    if (this.taskTimerStrategies.has(cacheKey)) {
      return this.taskTimerStrategies.get(cacheKey)!;
    }
    
    // 创建新的策略并缓存
    const strategy = this.timerStrategyFactory(driver);
    this.taskTimerStrategies.set(cacheKey, strategy);
    return strategy;
  }

  private notify(): void {
    if (this.listeners.length > 0) {
      const tasks = this.registry.getAllTasks();
      this.listeners.forEach(l => l(tasks));
    }
  }

  /**
   * 创建并注册一个新任务。
   * @param definition 任务定义
   */
  createTask(definition: TaskDefinition): void {
    validateId(definition.id);
    parseSchedule(definition.schedule); // 使用新的解析函数进行验证

    const task: Task = {
      ...definition,
      tags: definition.tags || [],
      // 新创建的任务默认是 stopped 状态，需要手动启动或等调度器启动
      status: TaskStatus.STOPPED,
      history: [],
      executionCount: 0,
    };

    this.registry.addTask(task);
    this.log(`Task created: ${task.id}`);
    this.emit(SchedulerEvents.TASK_REGISTERED, { taskId: task.id, task });
    this.notify();

    // 如果调度器已经在运行，自动启动新任务
    if (this.running) {
      task.status = TaskStatus.IDLE;
      
      if (task.options?.runImmediately) {
        this.triggerTask(task.id);
      }
      
      this.scheduleTask(task);
    }
  }

  /**
   * 删除指定 ID 的任务。
   * @param id 任务 ID
   * @returns 如果删除成功返回 true，否则返回 false
   */
  deleteTask(id: string): boolean {
    this.stopTask(id);
    const deleted = this.registry.deleteTask(id);
    if (deleted) {
      this.log(`Task deleted: ${id}`);
      this.emit(SchedulerEvents.TASK_REMOVED, { taskId: id });
      this.notify();
    }
    return deleted;
  }

  /**
   * 手动启动一个任务（将其置为 idle 状态并重新加入调度）。
   * 即使调度器未启动，也可以单独启动某个任务。
   * @param id 任务 ID
   */
  startTask(id: string): void {
    const task = this.registry.getTask(id);
    if (!task) {
      throw new Error(`Task not found: ${id}`);
    }

    if (task.status === TaskStatus.RUNNING) {
      return; // Already running
    }

    // Cancel existing timer if any
    const existingHandle = this.timers.get(id);
    if (existingHandle) {
      this.getTimerStrategy(task).cancel(existingHandle);
      this.timers.delete(id);
    }

    task.status = TaskStatus.IDLE; // Reset status if it was stopped or error
    this.log(`Starting task: ${id}`);
    this.emit(SchedulerEvents.TASK_STARTED, { taskId: id, task });
    this.notify();
    
    // Schedule task even if scheduler is not running (individual task control)
    this.scheduleTaskForce(task);
  }
  
  /**
   * 强制调度任务，即使调度器未启动
   */
  private scheduleTaskForce(task: Task): void {
    try {
      const nextRun = getNextScheduleRun(task.schedule, {
        timezone: task.options?.timezone || this.config.timezone,
        lastRun: task.lastRun,
      });
      task.nextRun = nextRun.getTime();

      const now = Date.now();
      const delay = Math.max(0, nextRun.getTime() - now);

      this.log(`Scheduling task ${task.id} for ${nextRun.toISOString()} (in ${delay}ms)`);

      const timerStrategy = this.getTimerStrategy(task);
      const handle = timerStrategy.schedule(() => {
        this.executeTaskIndividual(task);
      }, delay);

      this.timers.set(task.id, handle);
    } catch (err) {
      this.log(`Error scheduling task ${task.id}: ${err}`);
      task.status = TaskStatus.ERROR;
      this.notify();
    }
  }
  
  /**
   * 执行单个任务（用于独立启动的任务）
   */
  private async executeTaskIndividual(task: Task, attempt: number = 0): Promise<void> {
    this.timers.delete(task.id);

    // Check if task was stopped
    if (task.status === TaskStatus.STOPPED) return;

    task.status = TaskStatus.RUNNING;
    task.lastRun = Date.now();
    task.executionCount = (task.executionCount || 0) + 1;
    const startTime = Date.now();

    this.log(`Executing task: ${task.id} (Attempt ${attempt})`);
    this.emit(SchedulerEvents.TASK_STARTED, { taskId: task.id, task });
    this.notify();

    try {
      await task.handler();
      
      const duration = Date.now() - startTime;
      this.recordHistory(task, {
        timestamp: startTime,
        duration,
        success: true,
      });
      
      task.status = TaskStatus.IDLE;
      this.log(`Task execution success: ${task.id}`);
      this.emit(SchedulerEvents.TASK_COMPLETED, { taskId: task.id, task, duration });
      this.notify();
      
      // Schedule next run
      this.scheduleTaskForce(task);

    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.recordHistory(task, {
        timestamp: startTime,
        duration,
        success: false,
        error: err.message,
      });

      this.log(`Task execution failed: ${task.id} - ${err.message}`);
      this.emit(SchedulerEvents.TASK_FAILED, { taskId: task.id, task, error: err.message, duration });
      
      // 调用任务的 onError 回调
      if (task.options?.onError) {
        try {
          task.options.onError(err, task.id);
        } catch (e) {
          this.log(`onError callback failed: ${e}`);
        }
      }
      
      // Retry logic
      const retryDelay = RetryStrategy.getDelay(attempt, task.options?.retry);
      if (retryDelay >= 0) {
        this.log(`Retrying task ${task.id} in ${retryDelay}ms (Attempt ${attempt + 1})`);
        const timerStrategy = this.getTimerStrategy(task);
        const handle = timerStrategy.schedule(() => {
            this.executeTaskIndividual(task, attempt + 1);
        }, retryDelay);
        this.timers.set(task.id, handle);
        task.status = TaskStatus.ERROR;
        this.notify();
      } else {
        task.status = TaskStatus.ERROR;
        this.notify();
        // Schedule next regular run
        this.scheduleTaskForce(task); 
      }
    }
  }

  /**
   * 停止一个任务（取消当前的定时器并标记为 stopped）。
   * @param id 任务 ID
   */
  stopTask(id: string): void {
    const task = this.registry.getTask(id);
    const handle = this.timers.get(id);
    if (handle && task) {
      this.getTimerStrategy(task).cancel(handle);
      this.timers.delete(id);
    } else if (handle) {
      // Fallback to default strategy if task not found
      this.defaultTimerStrategy.cancel(handle);
      this.timers.delete(id);
    }

    if (task) {
      task.status = TaskStatus.STOPPED;
      this.log(`Task stopped: ${id}`);
      this.emit(SchedulerEvents.TASK_STOPPED, { taskId: id, task });
      this.notify();
    }
  }

  /**
   * 获取任务信息。
   * @param id 任务 ID
   */
  getTask(id: string): Task | undefined {
    return this.registry.getTask(id);
  }
  
  /**
   * 获取所有任务，可按命名空间筛选。
   * @param namespace 可选的命名空间名称
   * @returns 任务数组
   */
  getAllTasks(namespace?: string): Task[] {
    if (namespace) {
      return this.registry.getTasksByNamespace(namespace);
    }
    return this.registry.getAllTasks();
  }

  /**
   * 获取调度器运行状态。
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * 获取任务的实际驱动方式。
   * 优先使用任务级配置，其次使用全局配置，默认为 'worker'。
   */
  getTaskDriver(id: string): 'worker' | 'main' {
    const task = this.registry.getTask(id);
    if (!task) return this.config.driver || 'worker';
    return task.options?.driver || this.config.driver || 'worker';
  }

  /**
   * 获取全局驱动配置。
   */
  getGlobalDriver(): 'worker' | 'main' {
    return this.config.driver || 'worker';
  }

  /**
   * 手动触发任务执行（忽略调度器状态，立即执行一次）。
   * 执行完成后恢复到之前的状态。
   * @param id 任务 ID
   */
  async triggerTask(id: string): Promise<void> {
    const task = this.getTask(id);
    if (!task) return;
    if (task.status === TaskStatus.RUNNING) return;
    
    const previousStatus = task.status;
    
    task.status = TaskStatus.RUNNING;
    task.lastRun = Date.now();
    task.executionCount = (task.executionCount || 0) + 1;
    const startTime = Date.now();

    this.log(`Triggering task: ${task.id}`);
    this.emit(SchedulerEvents.TASK_STARTED, { taskId: task.id, task });
    this.notify();

    try {
      await task.handler();
      
      const duration = Date.now() - startTime;
      this.recordHistory(task, {
        timestamp: startTime,
        duration,
        success: true,
      });
      
      // 恢复到之前的状态
      task.status = previousStatus;
      this.log(`Task trigger success: ${task.id}`);
      this.emit(SchedulerEvents.TASK_COMPLETED, { taskId: task.id, task, duration });
      this.notify();

    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.recordHistory(task, {
        timestamp: startTime,
        duration,
        success: false,
        error: err.message,
      });

      this.log(`Task trigger failed: ${task.id} - ${err.message}`);
      this.emit(SchedulerEvents.TASK_FAILED, { taskId: task.id, task, error: err.message, duration });
      
      // 恢复到之前的状态
      task.status = previousStatus;
      this.notify();
    }
  }

  /**
   * 启动调度器。
   * 开始处理所有任务（除了手动停止的任务）。
   */
  start(scope?: string): void {
    if (!scope && this.running) return; // 如果没有 scope 且调度器已经在运行，则直接返回

    this.log(scope ? `Scheduler starting for scope: ${scope}` : 'Scheduler started');
    this.emit(SchedulerEvents.SCHEDULER_STARTED, { running: true, scope });
    
    const tasksToStart = scope 
      ? this.registry.getTasksByNamespace(scope) 
      : this.registry.getAllTasks();

    tasksToStart.forEach((task) => {
      // 启动所有 stopped 状态的任务（新创建的任务默认是 stopped）
      if (task.status === TaskStatus.STOPPED) {
        task.status = TaskStatus.IDLE;
        this.emit(SchedulerEvents.TASK_UPDATED, { taskId: task.id, task });
      }
      
      // 调度所有非 running 状态的任务
      if (task.status !== TaskStatus.RUNNING) {
        // 如果设置了 runImmediately，立即触发一次
        if (task.options?.runImmediately) {
          this.triggerTask(task.id);
        }
        this.scheduleTask(task);
      }
    });

    if (!scope) { // 如果是全局启动，才设置运行状态
      this.running = true;
    }
    this.notify();
  }

  /**
   * 停止调度器。
   * 取消所有正在等待的定时器。
   */
  stop(scope?: string): void {
    if (!scope && !this.running) return; // 如果没有 scope 且调度器未运行，则直接返回

    this.log(scope ? `Scheduler stopping for scope: ${scope}` : 'Scheduler stopped');
    this.emit(SchedulerEvents.SCHEDULER_STOPPED, { running: false, scope });
    
    const tasksToStop = scope 
      ? this.registry.getTasksByNamespace(scope) 
      : this.registry.getAllTasks();

    tasksToStop.forEach((task) => {
      const handle = this.timers.get(task.id);
      if (handle) {
        this.getTimerStrategy(task).cancel(handle);
        this.timers.delete(task.id);
      }
      if (task.status !== TaskStatus.STOPPED) {
        task.status = TaskStatus.STOPPED;
        this.emit(SchedulerEvents.TASK_UPDATED, { taskId: task.id, task });
      }
    });

    if (!scope) { // 如果是全局停止，才设置运行状态
      this.running = false;
    }
    this.notify(); // 通知 DevTools 更新状态
  }

  private scheduleTask(task: Task): void {
    try {
      // 使用新的 getNextScheduleRun
      const nextRun = getNextScheduleRun(task.schedule, {
        timezone: task.options?.timezone || this.config.timezone,
        lastRun: task.lastRun, // 对于 interval 任务，需要上次运行时间
      });
      task.nextRun = nextRun.getTime();

      const now = Date.now();
      const delay = Math.max(0, nextRun.getTime() - now);

      this.log(`Scheduling task ${task.id} for ${nextRun.toISOString()} (in ${delay}ms)`);

      const timerStrategy = this.getTimerStrategy(task);
      const handle = timerStrategy.schedule(() => {
        this.executeTask(task);
      }, delay);

      this.timers.set(task.id, handle);
    } catch (err) {
      this.log(`Error scheduling task ${task.id}: ${err}`);
      task.status = TaskStatus.ERROR;
    }
  }

  private async executeTask(task: Task, attempt: number = 0, force: boolean = false): Promise<void> {
    this.timers.delete(task.id);

    if (!force && task.status === TaskStatus.STOPPED) return;

    task.status = TaskStatus.RUNNING;
    task.lastRun = Date.now();
    task.executionCount = (task.executionCount || 0) + 1;
    const startTime = Date.now();

    this.log(`Executing task: ${task.id} (Attempt ${attempt})`);
    this.emit(SchedulerEvents.TASK_STARTED, { taskId: task.id, task });
    this.notify();

    try {
      await task.handler();
      
      const duration = Date.now() - startTime;
      this.recordHistory(task, {
        timestamp: startTime,
        duration,
        success: true,
      });
      
      task.status = TaskStatus.IDLE;
      this.log(`Task execution success: ${task.id}`);
      this.emit(SchedulerEvents.TASK_COMPLETED, { taskId: task.id, task, duration });
      this.notify();
      
      // Schedule next run
      this.scheduleTask(task);

    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.recordHistory(task, {
        timestamp: startTime,
        duration,
        success: false,
        error: err.message,
      });

      this.log(`Task execution failed: ${task.id} - ${err.message}`);
      this.emit(SchedulerEvents.TASK_FAILED, { taskId: task.id, task, error: err.message, duration });
      
      // 调用任务的 onError 回调
      if (task.options?.onError) {
        try {
          task.options.onError(err, task.id);
        } catch (e) {
          this.log(`onError callback failed: ${e}`);
        }
      }
      
      // Retry logic
      const retryDelay = RetryStrategy.getDelay(attempt, task.options?.retry);
      if (retryDelay >= 0) {
        this.log(`Retrying task ${task.id} in ${retryDelay}ms (Attempt ${attempt + 1})`);
        const timerStrategy = this.getTimerStrategy(task);
        const handle = timerStrategy.schedule(() => {
            this.executeTask(task, attempt + 1);
        }, retryDelay);
        this.timers.set(task.id, handle);
        task.status = TaskStatus.ERROR;
        this.notify();
      } else {
        task.status = TaskStatus.ERROR;
        this.notify();
        // Schedule next regular run even if failed
        this.scheduleTask(task); 
      }
    }
  }

  private recordHistory(task: Task, record: ExecutionRecord): void {
    task.history.unshift(record);
    if (this.config.maxHistory && task.history.length > this.config.maxHistory) {
      task.history.pop();
    }
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[HyperScheduler] ${message}`);
    }
  }
}