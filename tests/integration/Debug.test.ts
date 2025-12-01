import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Scheduler } from '../../src/index';
    // The old DebugPanel logic (if any) is gone or replaced by DevTools plugin.
    // We should update this test to test the new DevTools plugin.
    import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
    import { Scheduler } from '../../src/index';
    import { DevTools } from '../../src/plugins/dev-tools';
    
    describe('Debug Integration', () => {
      beforeEach(() => {    document.body.innerHTML = ''; // Clear DOM
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

    // Intentionally blank - using git checkout to restore
    // We should update this test to test the new DevTools plugin.

    const scheduler = new Scheduler({ 
      debug: true,
      plugins: [new DevTools()] 
    });
    
    // Wait for dynamic import or initialization
    await new Promise(resolve => setTimeout(resolve, 100));

    scheduler.createTask({
      id: 'debug-dom-test',
      schedule: '* * * * *',
      handler: async () => {}
    });

    // New DevTools mounts <hs-devtools>
    const panel = document.querySelector('hs-devtools');
    expect(panel).not.toBeNull();
    
    scheduler.stop();
  });
});