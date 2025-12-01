import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DevToolsStore } from '../../../src/ui/store/dev-tools-store';

describe('DevToolsStore', () => {
  let store: DevToolsStore;

  beforeEach(() => {
    store = new DevToolsStore();
  });

  it('should initialize with default state', () => {
    const state = store.getState();
    expect(state.isOpen).toBe(false);
    expect(state.activeTab).toBe('tasks');
    expect(state.theme).toBe('auto');
    expect(state.tasks.size).toBe(0);
  });

  it('should toggle visibility', () => {
    store.toggle();
    expect(store.getState().isOpen).toBe(true);
    store.toggle();
    expect(store.getState().isOpen).toBe(false);
  });

  it('should set theme', () => {
    store.setTheme('dark');
    expect(store.getState().theme).toBe('dark');
  });

  it('should update tasks', () => {
    const mockTask = {
      id: 't1',
      status: 'running',
      lastRun: null,
      nextRun: null,
      executionCount: 0,
      schedule: '1s',
      tags: [],
      error: null
    };
    store.updateTask(mockTask);
    expect(store.getState().tasks.get('t1')).toEqual(mockTask);
  });

  it('should notify subscribers on state change', () => {
    const listener = vi.fn();
    store.subscribe('isOpen', listener);

    store.toggle();
    expect(listener).toHaveBeenCalledWith(true);
  });

  it('should not notify removed subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe('isOpen', listener);
    
    unsubscribe();
    store.toggle();
    expect(listener).not.toHaveBeenCalled();
  });

  it('should switch tabs', () => {
    store.setTab('timeline');
    expect(store.getState().activeTab).toBe('timeline');
  });
});
