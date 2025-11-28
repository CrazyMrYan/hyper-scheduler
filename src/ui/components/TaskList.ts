import { themeStyles } from '../styles/theme.css';
import { TaskSnapshot } from '../../types';

export class TaskList extends HTMLElement {
  private _shadow: ShadowRoot;
  private _tasks: TaskSnapshot[] = [];

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  set tasks(map: Map<string, TaskSnapshot>) {
    this._tasks = Array.from(map.values());
    this.renderRows();
  }

  private formatTimeAgo(timestamp: number | null): string {
    if (!timestamp) return '-';
    const diff = Date.now() - timestamp;
    if (diff < 1000) return `${diff}ms ago`;
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return new Date(timestamp).toLocaleTimeString();
  }

  private getStatusIcon(status: string) {
    switch (status) {
      case 'running': return `<span style="color:var(--hs-success)">🟢</span> Run`;
      case 'paused': return `<span style="color:var(--hs-warning)">🟡</span> Paus`;
      case 'stopped': return `<span style="color:var(--hs-danger)">🔴</span> Stop`;
      case 'idle': return `<span style="color:var(--hs-text-secondary)">⚪</span> idle`;
      case 'error': return `<span style="color:var(--hs-danger)">🔴</span> Error`;
      default: return status;
    }
  }

  private formatInterval(interval: string | number): string {
    if (typeof interval === 'number') {
      return `${interval}ms`;
    }
    // Check if it's a cron expression (contains spaces and asterisks)
    if (interval.includes('*') || interval.includes(' ')) {
      // Truncate long cron expressions
      return interval.length > 15 ? interval.substring(0, 12) + '...' : interval;
    }
    return interval;
  }

  private renderRows() {
    const tbody = this._shadow.querySelector('tbody');
    if (!tbody) return;

    // Simple full re-render for MVP
    tbody.innerHTML = this._tasks.map((task, index) => `
      <tr data-id="${task.id}">
        <td class="col-num">${index + 1}</td>
        <td class="col-id">
          <div class="task-id">${task.id}</div>
          <div class="tags">
            ${task.tags && task.tags.length > 0 
              ? task.tags.map(t => `<span class="tag">${t}</span>`).join('') 
              : '<span class="no-tags">(No Tags)</span>'}
          </div>
        </td>
        <td>${this.getStatusIcon(task.status)}</td>
        <td>${this.formatInterval(task.interval)}</td>
        <td>${task.executionCount || 0}</td>
        <td>${this.formatTimeAgo(task.lastRun)}</td>
        <td class="col-actions">
          <div class="action-group">
            <button class="btn-icon btn-trigger" data-action="trigger" title="▶️ Trigger">▶️</button>
            ${task.status === 'paused' || task.status === 'stopped'
              ? `<button class="btn-icon btn-resume" data-action="resume" title="▶️ Resume">▶️</button>`
              : `<button class="btn-icon btn-pause" data-action="pause" title="⏸️ Pause">⏸️</button>`
            }
            <button class="btn-icon btn-remove danger" data-action="remove" title="🗑️ Remove">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  render() {
    this._shadow.innerHTML = `
      <style>
        ${themeStyles}
        :host {
          display: block;
          overflow-y: auto;
          height: 100%;
          background: var(--hs-bg);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--hs-font-size);
          color: var(--hs-text);
        }
        th {
          text-align: left;
          padding: 8px 12px;
          border-bottom: 2px solid var(--hs-border);
          color: var(--hs-text-secondary);
          font-weight: 600;
          background: var(--hs-bg);
          position: sticky;
          top: 0;
          z-index: 1;
          font-size: 11px;
          text-transform: uppercase;
        }
        td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--hs-border);
          vertical-align: middle;
        }
        tr:hover {
          background: var(--hs-bg-secondary);
          cursor: pointer;
        }
        .tip {
          padding: 12px;
          text-align: center;
          font-size: 11px;
          color: var(--hs-text-secondary);
          border-top: 1px solid var(--hs-border);
          background: var(--hs-bg);
        }
        .task-id {
          font-weight: 600;
        }
        .tags {
          display: flex;
          gap: 4px;
          margin-top: 4px;
        }
        .tag {
          background: var(--hs-bg-secondary);
          border: 1px solid var(--hs-border);
          border-radius: 10px;
          padding: 2px 8px;
          font-size: 10px;
          color: var(--hs-text-secondary);
        }
        .no-tags {
          font-size: 10px;
          color: var(--hs-text-secondary);
          font-style: italic;
        }
        .col-num {
          width: 40px;
          color: var(--hs-text-secondary);
          font-size: 11px;
        }
        .col-actions {
          width: 140px;
        }
        .action-group {
          display: flex;
          gap: 4px;
        }
        .btn-icon {
          background: var(--hs-bg-secondary);
          border: 1px solid var(--hs-border);
          color: var(--hs-text);
          border-radius: 4px;
          min-width: 28px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0 6px;
          font-size: 11px;
          white-space: nowrap;
        }
        .btn-icon:hover {
          background: var(--hs-primary);
          color: white;
          border-color: var(--hs-primary);
        }
        .btn-trigger:hover {
          background: var(--hs-success);
          border-color: var(--hs-success);
        }
        .btn-pause:hover {
          background: var(--hs-warning);
          border-color: var(--hs-warning);
        }
        .btn-resume:hover {
          background: var(--hs-success);
          border-color: var(--hs-success);
        }
        .btn-remove:hover {
          color: white;
          background: var(--hs-danger);
          border-color: var(--hs-danger);
        }
      </style>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ID / Tags</th>
            <th>Status</th>
            <th>Interval</th>
            <th>Count</th>
            <th>Last Run</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Rows -->
        </tbody>
      </table>
      <div class="tip">
        ✨ Tip: Click a row for details & history.
      </div>
    `;
    
    this._shadow.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button');
      
      // Handle Action Buttons
      if (btn) {
        const action = btn.dataset.action;
        const tr = btn.closest('tr');
        if (!action || !tr) return;
        const id = (tr as HTMLElement).dataset.id;
        
        this.dispatchEvent(new CustomEvent('task-action', {
          detail: { action, id },
          bubbles: true,
          composed: true
        }));
        return;
      }

      // Handle Row Click (Selection)
      const tr = target.closest('tr');
      if (tr && !target.closest('.col-actions')) {
        const id = (tr as HTMLElement).dataset.id;
        this.dispatchEvent(new CustomEvent('task-select', {
          detail: id,
          bubbles: true,
          composed: true
        }));
      }
    });
  }
}

customElements.define('hs-task-list', TaskList);
