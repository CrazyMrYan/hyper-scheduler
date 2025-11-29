import { SchedulerConfig, Task, TaskDefinition, ExecutionRecord } from '../types';
import { TaskRegistry } from './TaskRegistry';
import { TimerStrategy } from '../platform/TimerStrategy';
import { validateId } from '../utils/id';
import { parseSchedule, getNextRun as getNextScheduleRun } from '../utils/schedule'; // 替换为新的 schedule 工具
import { RetryStrategy } from './RetryStrategy';

/**
 * 核心调度器类。
 * 负责管理任务生命周期、时间循环和任务执行。
 */
export class Scheduler {
  private registry: TaskRegistry;
  private config: SchedulerConfig;
  private timerStrategy: TimerStrategy;
  private running: boolean;
  private timers: Map<string, any>; // Task ID -> Timer Handle
  private listeners: ((tasks: Task[]) => void)[];
  private eventListeners: Map<string, Set<(payload: any) => void>>;

  /**
   * 创建一个新的调度器实例。
   * @param timerStrategy 计时策略（NodeTimer 或 BrowserTimer）
   * @param config 调度器配置
   */
  constructor(timerStrategy: TimerStrategy, config: SchedulerConfig = {}) {
    this.registry = new TaskRegistry();
    this.timerStrategy = timerStrategy;
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
      status: 'stopped',
      history: [],
      executionCount: 0,
    };

    this.registry.addTask(task);
    this.log(`Task created: ${task.id}`);
    this.emit('task_registered', { taskId: task.id, task });
    this.notify();

    // 如果调度器已经在运行，自动启动新任务
    if (this.running) {
      task.status = 'idle';
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
      this.emit('task_removed', { taskId: id });
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

    if (task.status === 'running') {
      return; // Already running
    }

    // Cancel existing timer if any
    const existingHandle = this.timers.get(id);
    if (existingHandle) {
      this.timerStrategy.cancel(existingHandle);
      this.timers.delete(id);
    }

    task.status = 'idle'; // Reset status if it was stopped or error
    this.log(`Starting task: ${id}`);
    this.emit('task_started', { taskId: id, task });
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

      const handle = this.timerStrategy.schedule(() => {
        this.executeTaskIndividual(task);
      }, delay);

      this.timers.set(task.id, handle);
    } catch (err) {
      this.log(`Error scheduling task ${task.id}: ${err}`);
      task.status = 'error';
      this.notify();
    }
  }
  
  /**
   * 执行单个任务（用于独立启动的任务）
   */
  private async executeTaskIndividual(task: Task, attempt: number = 0): Promise<void> {
    this.timers.delete(task.id);

    // Check if task was stopped
    if (task.status === 'stopped') return;

    task.status = 'running';
    task.lastRun = Date.now();
    task.executionCount = (task.executionCount || 0) + 1;
    const startTime = Date.now();

    this.log(`Executing task: ${task.id} (Attempt ${attempt})`);
    this.emit('task_started', { taskId: task.id, task });
    this.notify();

    try {
      await task.handler();
      
      const duration = Date.now() - startTime;
      this.recordHistory(task, {
        timestamp: startTime,
        duration,
        success: true,
      });
      
      task.status = 'idle';
      this.log(`Task execution success: ${task.id}`);
      this.emit('task_completed', { taskId: task.id, task, duration });
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
      this.emit('task_failed', { taskId: task.id, task, error: err.message, duration });
      
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
        const handle = this.timerStrategy.schedule(() => {
            this.executeTaskIndividual(task, attempt + 1);
        }, retryDelay);
        this.timers.set(task.id, handle);
        task.status = 'error';
        this.notify();
      } else {
        task.status = 'error';
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
    const handle = this.timers.get(id);
    if (handle) {
      this.timerStrategy.cancel(handle);
      this.timers.delete(id);
    }

    const task = this.registry.getTask(id);
    if (task) {
      task.status = 'stopped';
      this.log(`Task stopped: ${id}`);
      this.emit('task_stopped', { taskId: id, task });
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
   * 获取所有任务。
   */
  getAllTasks(): Task[] {
    return this.registry.getAllTasks();
  }

  /**
   * 手动触发任务执行（忽略调度器状态，立即执行一次）。
   * 执行完成后恢复到之前的状态。
   * @param id 任务 ID
   */
  async triggerTask(id: string): Promise<void> {
    const task = this.getTask(id);
    if (!task) return;
    if (task.status === 'running') return;
    
    const previousStatus = task.status;
    
    task.status = 'running';
    task.lastRun = Date.now();
    task.executionCount = (task.executionCount || 0) + 1;
    const startTime = Date.now();

    this.log(`Triggering task: ${task.id}`);
    this.emit('task_started', { taskId: task.id, task });
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
      this.emit('task_completed', { taskId: task.id, task, duration });
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
      this.emit('task_failed', { taskId: task.id, task, error: err.message, duration });
      
      // 恢复到之前的状态
      task.status = previousStatus;
      this.notify();
    }
  }

  /**
   * 启动调度器。
   * 开始处理所有任务（除了手动停止的任务）。
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.log('Scheduler started');
    this.registry.getAllTasks().forEach((task) => {
      // 启动所有 stopped 状态的任务（新创建的任务默认是 stopped）
      if (task.status === 'stopped') {
        task.status = 'idle';
        this.emit('task_updated', { taskId: task.id, task });
      }
      // 调度所有非 running 状态的任务
      if (task.status !== 'running') {
        this.scheduleTask(task);
      }
    });
    this.notify();
  }

  /**
   * 停止调度器。
   * 取消所有正在等待的定时器。
   */
  stop(): void {
    this.running = false;
    this.log('Scheduler stopped');
    this.timers.forEach((handle) => this.timerStrategy.cancel(handle));
    this.timers.clear();
  }

  private scheduleTask(task: Task): void {
    if (!this.running && task.status !== 'running') return;

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

      const handle = this.timerStrategy.schedule(() => {
        this.executeTask(task);
      }, delay);

      this.timers.set(task.id, handle);
    } catch (err) {
      this.log(`Error scheduling task ${task.id}: ${err}`);
      task.status = 'error';
    }
  }

  private async executeTask(task: Task, attempt: number = 0, force: boolean = false): Promise<void> {
    this.timers.delete(task.id);

    if (!force && (!this.running || task.status === 'stopped')) return;

    task.status = 'running';
    task.lastRun = Date.now();
    task.executionCount = (task.executionCount || 0) + 1;
    const startTime = Date.now();

    this.log(`Executing task: ${task.id} (Attempt ${attempt})`);
    this.emit('task_started', { taskId: task.id, task });
    this.notify();

    try {
      await task.handler();
      
      const duration = Date.now() - startTime;
      this.recordHistory(task, {
        timestamp: startTime,
        duration,
        success: true,
      });
      
      task.status = 'idle';
      this.log(`Task execution success: ${task.id}`);
      this.emit('task_completed', { taskId: task.id, task, duration });
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
      this.emit('task_failed', { taskId: task.id, task, error: err.message, duration });
      
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
        const handle = this.timerStrategy.schedule(() => {
            this.executeTask(task, attempt + 1);
        }, retryDelay);
        this.timers.set(task.id, handle);
        task.status = 'error';
        this.notify();
      } else {
        task.status = 'error';
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
