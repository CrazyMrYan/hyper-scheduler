import { themeStyles } from '../styles/theme.css';
import { ICONS } from './icons';

export class TaskHeader extends HTMLElement {
  private _shadow: ShadowRoot;
  private _fps: number = 0;
  private _stats: { active: number; total: number } = { active: 0, total: 0 };
  private _theme: 'light' | 'dark' | 'auto' = 'auto';
  private _activeTab: 'tasks' | 'timeline' = 'tasks';

  private $fps!: HTMLElement;
  private $stats!: HTMLElement;
  private $themeIcon!: HTMLElement;
  private $tabs!: NodeListOf<HTMLElement>;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.cacheDom();
    this.addEventListeners();
    this.updateView();
  }

  set fps(val: number) {
    this._fps = Math.round(val);
    if (this.$fps) {
      const color = this._fps < 30 ? 'var(--hs-danger)' : (this._fps < 50 ? 'var(--hs-warning)' : 'var(--hs-success)');
      this.$fps.innerHTML = `⚡ FPS: <span style="color:${color}">${this._fps}</span> (Main Thread)`;
    }
  }

  set stats(val: { active: number; total: number }) {
    this._stats = val;
    if (this.$stats) {
      this.$stats.innerHTML = `📊 Status: <span style="color:var(--hs-success)">🟢 Active: ${val.active}</span> <span style="margin-left:12px;color:var(--hs-text-secondary)">⚪ Total: ${val.total}</span>`;
    }
  }

  set theme(val: 'light' | 'dark' | 'auto') {
    this._theme = val;
    this.updateThemeIcon();
  }

  set activeTab(val: 'tasks' | 'timeline') {
    this._activeTab = val;
    this.updateTabs();
  }

  private cacheDom() {
    this.$fps = this._shadow.querySelector('.fps')!;
    this.$stats = this._shadow.querySelector('.stats')!;
    this.$themeIcon = this._shadow.querySelector('.theme-btn span')!;
    this.$tabs = this._shadow.querySelectorAll('.tab');
  }

  private addEventListeners() {
    this._shadow.querySelector('.theme-btn')?.addEventListener('click', () => {
      const newTheme = this._theme === 'dark' ? 'light' : 'dark'; // Simple toggle for now
      this.dispatchEvent(new CustomEvent('theme-toggle', { detail: newTheme }));
    });

    this._shadow.querySelector('.close-btn')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('close'));
    });
    
    this.$tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = (e.currentTarget as HTMLElement).dataset.tab;
        this.dispatchEvent(new CustomEvent('tab-change', { detail: target }));
      });
    });
  }

  private updateThemeIcon() {
    if (this.$themeIcon) {
      this.$themeIcon.innerHTML = this._theme === 'dark' ? ICONS.moon : ICONS.sun;
    }
  }
  
  private updateTabs() {
    this.$tabs.forEach(tab => {
      if (tab.dataset.tab === this._activeTab) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  private updateView() {
    this.fps = this._fps;
    this.stats = this._stats;
    this.updateThemeIcon();
    this.updateTabs();
  }

  render() {
    this._shadow.innerHTML = `
      <style>
        ${themeStyles}
        :host {
          display: block;
          background: var(--hs-bg);
          border-bottom: 1px solid var(--hs-border);
          padding: 0 16px;
          height: var(--hs-header-height); /* Should be taller for header + stats + tabs? Spec says 3 rows */
          height: auto; 
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 40px;
          border-bottom: 1px solid var(--hs-border);
        }
        .title {
          font-weight: 600;
          font-size: 13px;
          color: var(--hs-text);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .search-box {
          flex: 1;
          max-width: 300px;
          margin: 0 16px;
        }
        .search-input {
          width: 100%;
          background: var(--hs-bg-secondary);
          border: 1px solid var(--hs-border);
          color: var(--hs-text);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
        }
        .search-input::placeholder {
          color: var(--hs-text-secondary);
        }
        .controls {
          display: flex;
          gap: 8px;
        }
        button {
          background: transparent;
          border: none;
          color: var(--hs-text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }
        button:hover {
          background: var(--hs-bg-secondary);
          color: var(--hs-text);
        }
        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 30px;
          font-size: 11px;
          color: var(--hs-text-secondary);
          border-bottom: 1px solid var(--hs-border);
        }
        .tabs-bar {
          display: flex;
          height: 36px;
          gap: 0;
        }
        .tab {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--hs-text-secondary);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          padding: 0 16px;
          transition: all 0.2s;
        }
        .tab:hover {
          color: var(--hs-text);
          background: var(--hs-bg-secondary);
        }
        .tab.active {
          color: var(--hs-text);
          font-weight: 600;
          border-bottom-color: var(--hs-primary);
          background: var(--hs-bg-secondary);
        }
      </style>
      
      <div class="top-bar">
        <div class="title">
          🕒 Hyper Scheduler DevTools
        </div>
        <div class="search-box">
          <input type="text" class="search-input" placeholder="Search IDs/Tags... 🔍">
        </div>
        <div class="controls">
          <button class="theme-btn" title="Toggle Theme"><span>${ICONS.sun}</span></button>
          <button class="close-btn" title="✕ Close">✕</button>
        </div>
      </div>
      
      <div class="stats-bar">
        <div class="stats">Loading...</div>
        <div class="fps">0 FPS</div>
      </div>
      
      <div class="tabs-bar">
        <div class="tab active" data-tab="tasks">📌 Tasks List</div>
        <div class="tab" data-tab="timeline">📈 Timeline</div>
      </div>
    `;
  }
}

customElements.define('hs-task-header', TaskHeader);
