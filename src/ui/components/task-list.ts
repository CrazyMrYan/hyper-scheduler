import { themeStyles } from '../styles/theme.css';
import { TaskSnapshot } from '../../types';
import { TaskStatus } from '../../constants';
import { ICONS } from './icons';
import { t } from '../i18n';

export class TaskList extends HTMLElement {
  private _shadow: ShadowRoot;
  private _tasks: TaskSnapshot[] = [];
  private _lastExecutionTimes: Map<string, number> = new Map();

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  set tasks(map: Map<string, TaskSnapshot>) {
    const newTasks = Array.from(map.values());
    
    // Track execution count changes to show flash animation
    newTasks.forEach(task => {
      const oldTask = this._tasks.find(t => t.id === task.id);
      if (oldTask && task.executionCount > oldTask.executionCount) {
        this._lastExecutionTimes.set(task.id, Date.now());
      }
    });
    
    this._tasks = newTasks;
    this.renderRows();
  }

  filter(text: string, map: Map<string, TaskSnapshot>) {
    const all = Array.from(map.values());
    if (!text) {
      this._tasks = all;
    } else {
      const lower = text.toLowerCase();
      this._tasks = all.filter(t => 
        t.id.toLowerCase().includes(lower) || 
        t.tags.some(tag => tag.toLowerCase().includes(lower))
      );
    }
    this.renderRows();
  }

  // Method to update table headers when language changes
  updateHeaders() {
    const thead = this._shadow.querySelector('thead');
    if (thead) {
      thead.innerHTML = `
        <tr>
          <th style="width:40px">#</th>
          <th style="min-width:150px">${t('list.idTags')}</th>
          <th style="width:100px">${t('list.status')}</th>
          <th style="width:70px">${t('list.driver')}</th>
          <th style="width:100px">${t('list.schedule')}</th>
          <th style="width:60px">${t('list.count')}</th>
          <th style="width:100px">${t('list.lastRun')}</th>
          <th style="width:100px">${t('list.actions')}</th>
        </tr>
      `;
    }
    
    // Update tip
    const tip = this._shadow.querySelector('.tip');
    if (tip) {
      tip.textContent = t('list.tip');
    }
    
    // Re-render rows to update status text
    this.renderRows();
  }

  private getStatusIcon(status: string, taskId: string) {
    const lastExec = this._lastExecutionTimes.get(taskId);
    const isRecentlyExecuted = lastExec && (Date.now() - lastExec < 1000);
    
    // idle = 正在调度中（等待下次执行）
    // running = 正在执行 handler
    // stopped = 已停止，不会再调度（需要手动启动）
    // error = 执行出错
    switch (status) {
      case TaskStatus.RUNNING: 
        return `<span style="color:var(--hs-primary)">🔵</span> <strong>${t('status.running')}</strong>`;
      case TaskStatus.STOPPED: 
        return `<span style="color:var(--hs-text-secondary)">⚪</span> ${t('status.stopped')}`;
      case TaskStatus.IDLE: 
        if (isRecentlyExecuted) {
          return `<span class="status-flash" style="color:var(--hs-success)">🟢</span> ${t('status.idle')}`;
        }
        return `<span style="color:var(--hs-success)">🟢</span> ${t('status.idle')}`;
      case TaskStatus.ERROR: 
        return `<span style="color:var(--hs-warning)">🟠</span> ${t('status.error')}`;
      default: 
        return status;
    }
  }

  private formatSchedule(schedule: string | number): string {
    if (typeof schedule === 'number') {
      return `${schedule}ms`;
    }
    if (schedule && (schedule.includes('*') || schedule.includes(' '))) {
      return schedule.length > 15 ? schedule.substring(0, 12) + '...' : schedule;
    }
    return schedule || '-';
  }

  private formatTime(timestamp: number | null): string {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
  }

  private getDriverBadge(driver: 'worker' | 'main' | undefined): string {
    const d = driver || 'worker';
    if (d === 'worker') {
      return `<span class="driver-badge worker" title="${t('list.driverWorker')}">W</span>`;
    }
    return `<span class="driver-badge main" title="${t('list.driverMain')}">M</span>`;
  }

  private renderRows() {
    const tbody = this._shadow.querySelector('tbody');
    if (!tbody) return;

    // Simple full re-render for MVP
    tbody.innerHTML = this._tasks.map((task, index) => {
      const lastExec = this._lastExecutionTimes.get(task.id);
      const isRecentlyExecuted = lastExec && (Date.now() - lastExec < 1000);
      const rowClass = isRecentlyExecuted ? 'recently-executed' : '';
      
      return `
      <tr data-id="${task.id}" class="${rowClass}">
        <td class="col-num">${index + 1}</td>
        <td class="col-id">
          <div class="task-id">${task.id}</div>
          <div class="tags">
            ${task.tags && task.tags.length > 0 
              ? task.tags.map(t => `<span class="tag">${t}</span>`).join('') 
              : `<span class="no-tags">${t('list.noTags')}</span>`}
          </div>
        </td>
        <td>${this.getStatusIcon(task.status, task.id)}</td>
        <td>${this.getDriverBadge((task as any).driver)}</td>
        <td>${this.formatSchedule(task.schedule)}</td>
        <td>${task.executionCount || 0}</td>
        <td>${this.formatTime(task.lastRun)}</td>
        <td class="col-actions">
          <div class="action-group">
            <button class="btn-icon" data-action="trigger" title="${t('actions.trigger')}" ${task.status === TaskStatus.RUNNING ? 'disabled' : ''}>${ICONS.trigger}</button>
            ${task.status === TaskStatus.STOPPED || task.status === TaskStatus.ERROR
              ? `<button class="btn-icon success" data-action="start" title="${t('actions.start')}">${ICONS.resume}</button>`
              : `<button class="btn-icon warning" data-action="stop" title="${t('actions.stop')}" ${task.status === TaskStatus.RUNNING ? 'disabled' : ''}>${ICONS.pause}</button>`
            }
            <button class="btn-icon danger" data-action="remove" title="${t('actions.remove')}">${ICONS.remove}</button>
          </div>
        </td>
      </tr>
    `;
    }).join('');
  }

  render() {
    this._shadow.innerHTML = `
      <style>
        ${themeStyles}
        :host {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--hs-bg);
        }
        .table-container {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: auto;
          position: relative;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: var(--hs-font-size);
          color: var(--hs-text);
        }
        thead {
          position: sticky;
          top: 0;
          z-index: 2;
          background: var(--hs-bg);
        }
        th {
          text-align: left;
          padding: 8px 12px;
          border-bottom: 2px solid var(--hs-border);
          color: var(--hs-text-secondary);
          font-weight: 600;
          background: var(--hs-bg);
          font-size: 11px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        th:last-child {
          position: sticky;
          right: 0;
          background: var(--hs-bg);
          box-shadow: -2px 0 4px rgba(0,0,0,0.1);
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
        tr.recently-executed {
          animation: flash-row 1s ease-out;
        }
        @keyframes flash-row {
          0% { background: rgba(34, 197, 94, 0.2); }
          100% { background: transparent; }
        }
        .status-flash {
          animation: flash-icon 1s ease-out;
        }
        @keyframes flash-icon {
          0%, 50% { opacity: 1; }
          25%, 75% { opacity: 0.3; }
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
        .driver-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          font-family: monospace;
        }
        .driver-badge.worker {
          background: rgba(34, 197, 94, 0.15);
          color: var(--hs-success);
          border: 1px solid var(--hs-success);
        }
        .driver-badge.main {
          background: rgba(245, 158, 11, 0.15);
          color: var(--hs-warning);
          border: 1px solid var(--hs-warning);
        }
        .col-num {
          width: 40px;
          color: var(--hs-text-secondary);
          font-size: 11px;
        }
        .col-actions {
          width: 100px;
          position: sticky;
          right: 0;
          background: var(--hs-bg);
          box-shadow: -2px 0 4px rgba(0,0,0,0.1);
        }
        .action-group {
          display: flex;
          gap: 4px;
        }
        .btn-icon {
          background: transparent;
          border: 1px solid var(--hs-border);
          color: var(--hs-text-secondary);
          border-radius: 4px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
        }
        .btn-icon svg {
          width: 14px;
          height: 14px;
          display: block;
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
        .btn-icon:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .btn-icon:disabled:hover {
          background: transparent;
          color: var(--hs-text-secondary);
          border-color: var(--hs-border);
        }
      </style>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width:40px">#</th>
              <th style="min-width:150px">${t('list.idTags')}</th>
              <th style="width:100px">${t('list.status')}</th>
              <th style="width:70px">${t('list.driver')}</th>
              <th style="width:100px">${t('list.schedule')}</th>
              <th style="width:60px">${t('list.count')}</th>
              <th style="width:100px">${t('list.lastRun')}</th>
              <th style="width:100px">${t('list.actions')}</th>
            </tr>
          </thead>
          <tbody>
            <!-- Rows -->
          </tbody>
        </table>
      </div>
      <div class="tip">
        ${t('list.tip')}
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