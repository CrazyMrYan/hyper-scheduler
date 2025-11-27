import { Task } from '../types';
import { styles } from './styles';

export class DebugPanel {
  private container: HTMLElement | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  private init(): void {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    this.container = document.createElement('div');
    this.container.id = 'hyper-scheduler-debug-panel';
    this.container.style.display = 'none'; // Hidden by default
    document.body.appendChild(this.container);
  }

  show(): void {
    if (this.container) this.container.style.display = 'block';
  }

  hide(): void {
    if (this.container) this.container.style.display = 'none';
  }

  update(tasks: Task[]): void {
    if (!this.container) return;

    let html = '<div class="hs-header"><span>Hyper Scheduler</span><button id="hs-close-btn" style="float:right">x</button></div>';
    
    tasks.forEach(task => {
      const nextRun = task.nextRun ? new Date(task.nextRun).toLocaleTimeString() : '-';
      html += `
        <div class="hs-task-row">
          <span>${task.id}</span>
          <span class="hs-status-${task.status}">${task.status}</span>
          <span>Next: ${nextRun}</span>
        </div>
      `;
    });

    this.container.innerHTML = html;

    // Re-bind close button
    const closeBtn = this.container.querySelector('#hs-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => this.hide());
    }
  }
}
