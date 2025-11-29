import { themeStyles } from '../styles/theme.css';
import { TaskSnapshot, ExecutionRecord } from '../../types';
import { t } from '../i18n';

export class TaskDetail extends HTMLElement {
  private _shadow: ShadowRoot;
  private _task: TaskSnapshot | null = null;
  private _history: ExecutionRecord[] = [];

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this._shadow.addEventListener('click', (e) => {
      if ((e.target as Element).closest('.back-btn')) {
        this.dispatchEvent(new CustomEvent('back'));
      }
    });
  }

  set task(task: TaskSnapshot | null) {
    this._task = task;
    this.renderContent();
  }

  set history(h: ExecutionRecord[]) {
    this._history = h || [];
    this.renderContent();
  }

  // Method to update texts when language changes
  updateTexts() {
    this.renderContent();
  }

  private renderContent() {
    const container = this._shadow.querySelector('.content');
    if (!container) return;

    if (!this._task) {
      container.innerHTML = `<div class="empty">${t('detail.noTask')}</div>`;
      return;
    }

    const task = this._task;
    const config = {
      id: task.id,
      schedule: task.schedule,
      tags: task.tags,
    };

    // Calculate average duration
    const avgDuration = this._history.length > 0
      ? Math.round(this._history.reduce((sum, r) => sum + r.duration, 0) / this._history.length)
      : 0;

    container.innerHTML = `
      <div class="header">
        <button class="back-btn">⬅️ ${t('detail.back')}</button>
        <h2>${task.id}</h2>
      </div>
      
      <div class="section">
        <div class="config-label">${t('detail.config')}:</div>
        <pre>${JSON.stringify(config, null, 2)}</pre>
      </div>

      <div class="section">
        <h3>📜 ${t('detail.history')} (${t('detail.lastRuns', { n: this._history.length })}) ${avgDuration > 0 ? `- ${t('detail.avgDuration')}: ${avgDuration}ms` : ''}</h3>
        <table class="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${t('detail.startTime')}</th>
              <th>${t('detail.duration')}</th>
              <th>${t('detail.drift')}</th>
              <th>${t('detail.status')}</th>
            </tr>
          </thead>
          <tbody>
            ${this._history.length === 0 ? `<tr><td colspan="5" class="no-data">${t('detail.noHistory')}</td></tr>` : ''}
            ${this._history.slice().reverse().map((run, idx) => {
              const drift = 0; // TODO: calculate drift from expected vs actual time
              const driftStr = drift > 0 ? `+${drift}ms` : drift < 0 ? `${drift}ms` : '0ms';
              const statusIcon = run.success 
                ? `✅ ${t('detail.success')}` 
                : run.error 
                  ? `❌ ${t('detail.error')}: ${run.error}` 
                  : `⚠️ ${t('detail.failed')}`;
              const durationClass = run.duration > 100 ? 'slow' : '';
              
              return `
                <tr class="${run.success ? 'success' : 'error'}">
                  <td class="col-num">${this._history.length - idx}</td>
                  <td>${new Date(run.timestamp).toLocaleTimeString('en-US', { hour12: false })}</td>
                  <td class="${durationClass}">${run.duration}ms</td>
                  <td>${driftStr}</td>
                  <td class="status-cell">${statusIcon}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  render() {
    this._shadow.innerHTML = `
      <style>
        ${themeStyles}
        :host {
          display: block;
          height: 100%;
          background: var(--hs-bg);
          overflow-y: auto;
        }
        .content {
          padding: 16px;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--hs-border);
        }
        .back-btn {
          background: var(--hs-bg-secondary);
          border: 1px solid var(--hs-border);
          color: var(--hs-text);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
        }
        .back-btn:hover {
          background: var(--hs-primary);
          color: white;
          border-color: var(--hs-primary);
        }
        h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        h3 {
          font-size: 13px;
          color: var(--hs-text);
          margin-bottom: 12px;
          font-weight: 600;
        }
        .section {
          margin-bottom: 32px;
        }
        .config-label {
          font-size: 12px;
          color: var(--hs-text-secondary);
          margin-bottom: 8px;
        }
        pre {
          background: var(--hs-bg-secondary);
          padding: 12px;
          border-radius: 6px;
          border: 1px solid var(--hs-border);
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 11px;
          overflow-x: auto;
          line-height: 1.5;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }
        .history-table th {
          text-align: left;
          padding: 8px;
          border-bottom: 2px solid var(--hs-border);
          color: var(--hs-text-secondary);
          font-weight: 600;
          background: var(--hs-bg-secondary);
        }
        .history-table td {
          padding: 8px;
          border-bottom: 1px solid var(--hs-border);
        }
        .history-table tr.success {
          background: rgba(34, 197, 94, 0.05);
        }
        .history-table tr.error {
          background: rgba(239, 68, 68, 0.05);
        }
        .history-table tr:hover {
          background: var(--hs-bg-secondary);
        }
        .col-num {
          width: 40px;
          color: var(--hs-text-secondary);
        }
        .slow {
          color: var(--hs-warning);
          font-weight: 600;
        }
        .status-cell {
          font-size: 11px;
        }
        .no-data {
          color: var(--hs-text-secondary);
          font-style: italic;
          text-align: center;
          padding: 24px;
        }
      </style>
      <div class="content"></div>
    `;
  }
}

customElements.define('hs-task-detail', TaskDetail);
