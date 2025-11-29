import { themeStyles } from '../styles/theme.css';
import { ICONS } from './icons';
import { t } from '../i18n';

export class TaskHeader extends HTMLElement {
  private _shadow: ShadowRoot;
  private _fps: number = 0;
  private _stats: { active: number; total: number } = { active: 0, total: 0 };
  private _theme: 'light' | 'dark' | 'auto' = 'auto';
  private _activeTab: 'tasks' | 'timeline' = 'tasks';
  private _language: 'en' | 'zh' = 'en';

  private $fps!: HTMLElement;
  private $stats!: HTMLElement;
  private $themeIcon!: HTMLElement;
  private $dockIcon!: HTMLElement;
  private $tabs!: NodeListOf<HTMLElement>;
  private $searchInput!: HTMLInputElement;
  private $title!: HTMLElement;
  private $langBtn!: HTMLElement;

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
      this.$fps.innerHTML = `⚡ ${t('stats.fps')}: <span style="color:${color}">${this._fps}</span> (${t('stats.mainThread')})`;
    }
  }

  set stats(val: { active: number; total: number }) {
    this._stats = val;
    if (this.$stats) {
      this.$stats.innerHTML = `📊 ${t('stats.status')}: <span style="color:var(--hs-success)">🟢 ${t('stats.active')}: ${val.active}</span> <span style="margin-left:12px;color:var(--hs-text-secondary)">⚪ ${t('stats.total')}: ${val.total}</span>`;
    }
  }

  set theme(val: 'light' | 'dark' | 'auto') {
    this._theme = val;
    this.setAttribute('theme', val);
    this.updateThemeIcon();
  }

  set language(val: 'en' | 'zh') {
    this._language = val;
    this.updateTexts();
  }

  set dockPosition(val: 'right' | 'bottom') {
    if (this.$dockIcon) {
      // 显示目标位置的图标（点击后切换到的位置）
      // right -> 显示 dock (底部图标)，表示可以切换到底部
      // bottom -> 显示 dockRight (右侧图标)，表示可以切换到右侧
      this.$dockIcon.innerHTML = val === 'right' ? ICONS.dock : ICONS.dockRight;
      this.$dockIcon.parentElement?.setAttribute('title', t('header.toggleDock'));
    }
  }

  set activeTab(val: 'tasks' | 'timeline') {
    this._activeTab = val;
    this.updateTabs();
  }

  private cacheDom() {
    this.$fps = this._shadow.querySelector('.fps')!;
    this.$stats = this._shadow.querySelector('.stats')!;
    this.$themeIcon = this._shadow.querySelector('.theme-btn span')!;
    this.$dockIcon = this._shadow.querySelector('.dock-btn')!;
    this.$tabs = this._shadow.querySelectorAll('.tab');
    this.$searchInput = this._shadow.querySelector('.search-input')!;
    this.$title = this._shadow.querySelector('.title')!;
    this.$langBtn = this._shadow.querySelector('.lang-btn')!;
  }

  private addEventListeners() {
    this._shadow.querySelector('.dock-btn')?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('dock-toggle'));
    });

    this._shadow.querySelector('.theme-btn')?.addEventListener('click', () => {
      const newTheme = this._theme === 'dark' ? 'light' : 'dark'; 
      this.dispatchEvent(new CustomEvent('theme-toggle', { detail: newTheme }));
    });

    this._shadow.querySelector('.lang-btn')?.addEventListener('click', () => {
      const newLang = this._language === 'en' ? 'zh' : 'en';
      this.dispatchEvent(new CustomEvent('lang-toggle', { detail: newLang }));
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

    this.$searchInput?.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.dispatchEvent(new CustomEvent('search', { detail: val }));
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

  private updateTexts() {
    if (this.$title) this.$title.innerHTML = `🕒 ${t('header.title')}`;
    if (this.$searchInput) this.$searchInput.placeholder = t('header.searchPlaceholder');
    // 显示目标语言（点击后切换到的语言）
    if (this.$langBtn) this.$langBtn.textContent = this._language === 'en' ? '中' : 'EN';
    
    this.$tabs.forEach(tab => {
      const key = tab.dataset.tab;
      if (key === 'tasks') tab.innerHTML = `📌 ${t('tabs.tasks')}`;
      if (key === 'timeline') tab.innerHTML = `📈 ${t('tabs.timeline')}`;
    });

    // Force update stats and fps to refresh labels
    this.stats = this._stats;
    this.fps = this._fps;
  }

  private updateView() {
    this.updateThemeIcon();
    this.updateTabs();
    this.updateTexts();
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
          height: var(--hs-header-height);
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
          margin: 0px 32px 0 16px;
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
          align-items: center;
          gap: 4px;
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
          justify-content: center;
          font-size: 12px;
          width: 28px;
          height: 28px;
        }
        button:hover {
          background: var(--hs-bg-secondary);
          color: var(--hs-text);
        }
        button svg {
          width: 16px;
          height: 16px;
        }
        .lang-btn {
          font-weight: 600;
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
        <div class="title"></div>
        <div class="search-box">
          <input type="text" class="search-input">
        </div>
        <div class="controls">
          <button class="lang-btn" title="Switch Language">EN</button>
          <button class="dock-btn" title="Toggle Dock">${ICONS.dock}</button>
          <button class="theme-btn" title="Toggle Theme"><span>${ICONS.sun}</span></button>
          <button class="close-btn" title="Close">${ICONS.close}</button>
        </div>
      </div>
      
      <div class="stats-bar">
        <div class="stats"></div>
        <div class="fps"></div>
      </div>
      
      <div class="tabs-bar">
        <div class="tab active" data-tab="tasks"></div>
        <div class="tab" data-tab="timeline"></div>
      </div>
    `;
  }
}

customElements.define('hs-task-header', TaskHeader);
