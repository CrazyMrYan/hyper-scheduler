import { describe, it, expect, vi } from 'vitest';
import { HyperSchedulerPlugin } from '../../src/types';

describe('HyperSchedulerPlugin', () => {
  it('should define the correct interface', () => {
    const plugin: HyperSchedulerPlugin = {
      name: 'TestPlugin',
      init: (scheduler) => {
        // Init logic
      }
    };
    
    expect(plugin.name).toBe('TestPlugin');
    expect(typeof plugin.init).toBe('function');
  });
});
