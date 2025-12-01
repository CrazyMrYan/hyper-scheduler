import { Task } from '../types';

/**
 * 任务注册表。
 * 负责存储和管理所有的任务实例。
 */
export class TaskRegistry {
  private tasks: Map<string, Task>;

  constructor() {
    this.tasks = new Map();
  }

  /**
   * 注册一个新任务。
   * @param task 任务对象
   * @throws Error 如果 ID 已存在
   */
  addTask(task: Task): void {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task with ID "${task.id}" already exists.`);
    }
    this.tasks.set(task.id, task);
  }

  /**
   * 根据 ID 获取任务。
   * @param id 任务 ID
   * @returns 任务对象或 undefined
   */
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * 删除任务。
   * @param id 任务 ID
   * @returns 是否删除成功
   */
  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * 获取所有已注册的任务。
   * @returns 任务数组
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * 清空所有任务。
   */
  clear(): void {
    this.tasks.clear();
  }
}