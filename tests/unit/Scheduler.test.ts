import { describe, it, expect, vi } from 'vitest';
import { Scheduler } from '../../src/core/Scheduler';
import { NodeTimer } from '../../src/platform/node/NodeTimer';
import { HyperSchedulerPlugin } from '../../src/types';

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