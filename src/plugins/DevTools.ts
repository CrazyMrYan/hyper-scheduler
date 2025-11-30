import { Scheduler } from '../core/Scheduler';
import { DevToolsOptions, HyperSchedulerPlugin } from '../types';

export class DevTools implements HyperSchedulerPlugin {
  name = 'DevTools';
  private options: DevToolsOptions;

  constructor(options: DevToolsOptions = {}) {
    this.options = options;
  }

  init(scheduler: Scheduler): void {
    if (typeof window === 'undefined' || typeof window.document === 'undefined') {
      return;
    }

    this.mount(scheduler);
  }

  private async mount(scheduler: Scheduler): Promise<void> {
    try {
      // Import the UI component definition (side effect: defines <hs-devtools>)
      await import('../ui/components/devtools');
      
      // Wait for custom element to be defined
      await customElements.whenDefined('hs-devtools');
      
      this.setupElement(scheduler);
    } catch (e) {
      console.error('[DevTools] Failed to mount:', e);
    }
  }

  private setupElement(scheduler: Scheduler): void {
    try {
      // Check DOM - always create new element to ensure clean state
      let el = document.querySelector('hs-devtools') as any;
      if (el) {
        // Remove existing element to ensure fresh initialization
        el.remove();
      }
      
      // Create new element
      el = document.createElement('hs-devtools');
      
      // IMPORTANT: Apply options BEFORE adding to DOM
      // so that connectedCallback can read the attributes
      const options = this.options;
      console.log('[DevTools Plugin] options:', JSON.stringify(options));
      if (options.theme) el.setAttribute('theme', options.theme);
      if (options.dockPosition) el.setAttribute('dock', options.dockPosition);
      if (options.language) el.setAttribute('language', options.language);
      if (options.defaultZoom) el.setAttribute('default-zoom', options.defaultZoom.toString());
      if (options.trigger) {
        if (options.trigger.backgroundColor) el.setAttribute('trigger-bg', options.trigger.backgroundColor);
        if (options.trigger.textColor) el.setAttribute('trigger-color', options.trigger.textColor);
        if (options.trigger.position) el.setAttribute('trigger-position', options.trigger.position);
      }
      console.log('[DevTools Plugin] attributes set:', el.getAttribute('dock'), el.getAttribute('trigger-position'));
      
      // Add to DOM - connectedCallback will be called with attributes already set
      document.body.appendChild(el);

      // Set scheduler API adapter
      // We need to wait for the element to upgrade if it hasn't already?
      // import() promise resolution should mean the script is executed and custom element defined.
      
      if (typeof el.setScheduler === 'function') {
        el.setScheduler({
            getTasks: () => {
            return scheduler.getAllTasks().map(task => ({
                id: task.id,
                status: task.status,
                lastRun: task.lastRun || null,
                nextRun: task.nextRun || null,
                executionCount: task.executionCount || 0,
                schedule: task.schedule,
                tags: task.tags || [],
                error: task.status === 'error' ? 'Execution failed' : null
            }));
            },
            on: (evt: string, handler: (payload: any) => void) => {
                return scheduler.on(evt, handler);
            },
            trigger: (id: string) => scheduler.triggerTask(id),
            pause: (id: string) => scheduler.stopTask(id),
            resume: (id: string) => scheduler.startTask(id),
            remove: (id: string) => scheduler.deleteTask(id)
        });
      } else {
          console.warn('[DevTools] hs-devtools element does not have setScheduler method.');
      }

    } catch (e) {
      console.error('[DevTools] Failed to setup element:', e);
    }
  }
}
