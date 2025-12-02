import { Task } from '../types';

/**
 * 任务注册表。
 * 负责存储和管理所有的任务实例。
 */
export class TaskRegistry {
  private tasks: Map<string, Task>;
  private namespaceIndex: Map<string, Set<string>>; // 命名空间 -> Set<任务ID>

  constructor() {
    this.tasks = new Map();
    this.namespaceIndex = new Map();
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

    // 更新命名空间索引
    const namespace = task.options?.namespace || 'default';
    if (!this.namespaceIndex.has(namespace)) {
      this.namespaceIndex.set(namespace, new Set());
    }
    this.namespaceIndex.get(namespace)?.add(task.id);
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
    const task = this.tasks.get(id);
    if (!task) {
      return false;
    }

    // 从命名空间索引中移除
    const namespace = task.options?.namespace || 'default';
    this.namespaceIndex.get(namespace)?.delete(id);
    if (this.namespaceIndex.get(namespace)?.size === 0) {
      this.namespaceIndex.delete(namespace);
    }
    
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
   * 根据命名空间获取所有任务。
   * @param namespace 命名空间名称
   * @returns 该命名空间下的任务数组
   */
  getTasksByNamespace(namespace: string): Task[] {
    const taskIds = this.namespaceIndex.get(namespace);
    if (!taskIds) {
      return [];
    }
    return Array.from(taskIds).map(id => this.tasks.get(id)!).filter(Boolean);
  }

  /**
   * 清空所有任务和索引。
   */
  clear(): void {
    this.tasks.clear();
    this.namespaceIndex.clear();
  }
}