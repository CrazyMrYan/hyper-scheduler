import { TaskSnapshot, TaskControlAPI } from '../../types';

export interface DevToolsState {
  isOpen: boolean;
  activeTab: 'tasks' | 'timeline';
  theme: 'light' | 'dark' | 'auto';
  filterText: string;
  selectedTaskId: string | null;
  tasks: Map<string, TaskSnapshot>;
  history: Map<string, any[]>; 
  fps: number;
}

type Listener<T> = (value: T) => void;

export class DevToolsStore {
  private state: DevToolsState;
  private listeners: Map<keyof DevToolsState, Set<Listener<any>>>;
  private scheduler?: TaskControlAPI;

  constructor() {
    this.state = {
      isOpen: false,
      activeTab: 'tasks',
      theme: 'auto',
      filterText: '',
      selectedTaskId: null,
      tasks: new Map(),
      history: new Map(),
      fps: 0,
    };
    this.listeners = new Map();
  }

  setScheduler(scheduler: TaskControlAPI) {
    this.scheduler = scheduler;
  }

  getState(): Readonly<DevToolsState> {
    return this.state;
  }

  subscribe<K extends keyof DevToolsState>(
    key: K,
    callback: Listener<DevToolsState[K]>
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  private notify<K extends keyof DevToolsState>(key: K, value: DevToolsState[K]) {
    this.listeners.get(key)?.forEach((cb) => cb(value));
  }

  toggle() {
    this.state.isOpen = !this.state.isOpen;
    this.notify('isOpen', this.state.isOpen);
  }

  setTheme(theme: 'light' | 'dark' | 'auto') {
    this.state.theme = theme;
    this.notify('theme', this.state.theme);
  }

  setTab(tab: 'tasks' | 'timeline') {
    this.state.activeTab = tab;
    this.notify('activeTab', this.state.activeTab);
  }

  updateTask(task: TaskSnapshot) {
    // Create a new Map to ensure reference change for listeners
    const newTasks = new Map(this.state.tasks);
    newTasks.set(task.id, task);
    this.state.tasks = newTasks;
    this.notify('tasks', this.state.tasks);

    // If task object contains history (Task interface), update it too
    if ('history' in task && Array.isArray((task as any).history)) {
      const newHistory = new Map(this.state.history);
      newHistory.set(task.id, (task as any).history);
      this.state.history = newHistory;
      this.notify('history', this.state.history);
    }
  }

  selectTask(id: string | null) {
    this.state.selectedTaskId = id;
    this.notify('selectedTaskId', id);
  }

  addHistory(taskId: string, record: any) {
    const list = [...(this.state.history.get(taskId) || [])];
    list.push(record);
    // Limit history size (e.g. 50)
    if (list.length > 50) {
      list.splice(0, list.length - 50);
    }
    
    const newHistory = new Map(this.state.history);
    newHistory.set(taskId, list);
    this.state.history = newHistory;
    this.notify('history', newHistory);
  }

  async triggerTask(id: string) {
    if (this.scheduler) {
      await this.scheduler.trigger(id);
    }
  }

  pauseTask(id: string) {
    if (this.scheduler) {
      this.scheduler.pause(id);
    }
  }

  resumeTask(id: string) {
    if (this.scheduler) {
      this.scheduler.resume(id);
    }
  }

  removeTask(id: string) {
    if (this.scheduler) {
      this.scheduler.remove(id);
      // Optimistic update or wait for event? 
      // Wait for 'task_removed' event usually best, but we can remove from state too.
      const newTasks = new Map(this.state.tasks);
      newTasks.delete(id);
      this.state.tasks = newTasks;
      this.notify('tasks', this.state.tasks);
    }
  }
}
