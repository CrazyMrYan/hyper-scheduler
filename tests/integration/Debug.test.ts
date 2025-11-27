import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Scheduler } from '../../src/index';

describe('Debug Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = ''; // Clear DOM
    // Mock Worker globally for JSDOM
    if (typeof window !== 'undefined') {
        window.Worker = class MockWorker {
            postMessage() {}
            onmessage = null;
            terminate() {}
            addEventListener() {}
            removeEventListener() {}
            dispatchEvent() { return false; }
        } as any;
    }
  });
  
  afterEach(() => {
     // Cleanup if needed
  });

  it('should mount DebugPanel in Browser environment when debug is enabled', async () => {
    // Ensure we are in jsdom
    if (typeof window === 'undefined') {
      console.warn('Skipping browser test in node env');
      return;
    }

    const scheduler = new Scheduler({ debug: true });
    
    // Wait for dynamic import
    await new Promise(resolve => setTimeout(resolve, 100));

    scheduler.createTask({
      id: 'debug-dom-test',
      schedule: '* * * * *',
      handler: async () => {}
    });

    const panel = document.getElementById('hyper-scheduler-debug-panel');
    expect(panel).not.toBeNull();
    expect(panel?.innerHTML).toContain('debug-dom-test');
    
    scheduler.stop();
  });
});