import { DevToolsStore } from '../store/DevToolsStore';
import { SchedulerIntrospectionAPI, TaskControlAPI } from '../../types';
import { themeStyles } from '../styles/theme.css';
import './FloatingTrigger';
import './TaskHeader';
import './TaskList';
import './TaskDetail';
import './Timeline';
import './Resizer';
import { TaskHeader } from './TaskHeader';
import { TaskList } from './TaskList';
import { TaskDetail } from './TaskDetail';
import { Timeline } from './Timeline';

export class DevTools extends HTMLElement {
  private _shadow: ShadowRoot;
  private store: DevToolsStore;
  private scheduler?: SchedulerIntrospectionAPI & TaskControlAPI;
  private rAFId?: number;
  private lastTime = 0;

  private $panel!: HTMLElement;
  private $header!: TaskHeader;
  private $taskList!: TaskList;
  private $taskDetail!: TaskDetail;
  private $timeline!: Timeline;
  private $trigger!: HTMLElement;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this.store = new DevToolsStore();
  }

  connectedCallback() {
    this.render();
    this.cacheDom();
    
    // Apply initial dock position from attribute
    const dockAttr = this.getAttribute('dock');
    if (dockAttr === 'bottom') {
      this.store.setDockPosition('bottom');
    }
    
    this.bindStore();
    this.addEventListeners();
    this.startLoop();
  }

  disconnectedCallback() {
    if (this.rAFId) cancelAnimationFrame(this.rAFId);
  }

  setScheduler(api: SchedulerIntrospectionAPI & TaskControlAPI) {
    this.scheduler = api;
    this.store.setScheduler(api);
    
    // Initial load - fetch immediately
    const tasks = this.scheduler.getTasks();
    tasks.forEach(t => this.store.updateTask(t));

    // Subscribe to ALL events and refresh task list
    const refreshTasks = () => {
      const allTasks = this.scheduler?.getTasks() || [];
      allTasks.forEach(t => this.store.updateTask(t));
    };

    this.scheduler.on('task_registered', refreshTasks);
    this.scheduler.on('task_updated', (payload: any) => {
      console.log('[DevTools] task_updated event:', payload);
      refreshTasks();
    });
    this.scheduler.on('task_started', refreshTasks);
    this.scheduler.on('task_removed', refreshTasks);
    this.scheduler.on('task_stopped', (payload: any) => {
      console.log('[DevTools] task_stopped event:', payload);
      refreshTasks();
    });

    this.scheduler.on('task_completed', (payload: any) => {
      refreshTasks();
      
      // Add to history
      if (payload && payload.taskId) {
        this.store.addHistory(payload.taskId, {
          timestamp: payload.task?.lastRun || Date.now(),
          duration: payload.duration || 0,
          success: true,
          error: null
        });
      }
    });

    this.scheduler.on('task_failed', (payload: any) => {
      refreshTasks();
      
      // Add to history
      if (payload && payload.taskId) {
        this.store.addHistory(payload.taskId, {
          timestamp: payload.task?.lastRun || Date.now(),
          duration: payload.duration || 0,
          success: false,
          error: payload.error || 'Unknown error'
        });
      }
    });

    // Add polling for real-time updates (fallback for missed events)
    // Poll every 500ms when DevTools is open
    setInterval(() => {
      if (this.store.getState().isOpen) {
        refreshTasks();
      }
    }, 500);
  }

  private cacheDom() {
    this.$panel = this._shadow.querySelector('.panel')!;
    this.$header = this._shadow.querySelector('hs-task-header') as TaskHeader;
    this.$taskList = this._shadow.querySelector('hs-task-list') as TaskList;
    this.$taskDetail = this._shadow.querySelector('hs-task-detail') as TaskDetail;
    this.$timeline = this._shadow.querySelector('hs-timeline') as Timeline;
    this.$trigger = this._shadow.querySelector('hs-floating-trigger')!;
  }

  private bindStore() {
    // Restore size
    try {
      const saved = localStorage.getItem('hs-panel-size');
      if (saved) {
        this.store.setPanelSize(JSON.parse(saved));
      }
    } catch (e) { /* ignore */ }

    // Bind Store -> UI
    this.store.subscribe('isOpen', (isOpen) => {
      const pos = this.store.getState().dockPosition;
      const size = this.store.getState().panelSize;
      
      if (isOpen) {
        this.$panel.classList.add('open');
        this.$trigger.style.display = 'none';
        // Ensure panel is visible
        if (pos === 'right') {
          this.$panel.style.right = '0';
        } else {
          this.$panel.style.bottom = '0';
        }
      } else {
        this.$panel.classList.remove('open');
        this.$trigger.style.display = 'block';
        // Ensure panel is hidden
        if (pos === 'right') {
          this.$panel.style.right = `-${size.width}px`;
        } else {
          this.$panel.style.bottom = `-${size.height}px`;
        }
      }
    });

    this.store.subscribe('theme', (theme) => {
      const actualTheme = theme === 'auto' ? 'light' : theme;
      this.setAttribute('theme', actualTheme);
      
      // Propagate theme to all child components
      this.$header.setAttribute('theme', actualTheme);
      this.$taskList.setAttribute('theme', actualTheme);
      this.$taskDetail.setAttribute('theme', actualTheme);
      this.$timeline.setAttribute('theme', actualTheme);
      
      this.$header.theme = theme;
    });

    this.store.subscribe('tasks', (tasks) => {
      this.$taskList.tasks = tasks;
      this.$timeline.data = { tasks, history: this.store.getState().history };
      
      // Update stats
      let active = 0;
      tasks.forEach(t => {
        if (t.status === 'running') active++;
      });
      this.$header.stats = { active, total: tasks.size };
      
      // Update detail view if selected
      const selectedId = this.store.getState().selectedTaskId;
      if (selectedId && tasks.has(selectedId)) {
        this.$taskDetail.task = tasks.get(selectedId) || null;
      }
    });

    this.store.subscribe('history', (map) => {
      this.$timeline.data = { tasks: this.store.getState().tasks, history: map };
      const id = this.store.getState().selectedTaskId;
      if (id) {
        this.$taskDetail.history = map.get(id) || [];
      }
    });

    this.store.subscribe('selectedTaskId', (id) => {
      // Only affects tasks tab
      if (this.store.getState().activeTab !== 'tasks') return;
      
      if (id) {
        this.$taskList.style.display = 'none';
        this.$taskDetail.style.display = 'block';
        const task = this.store.getState().tasks.get(id);
        const history = this.store.getState().history.get(id);
        this.$taskDetail.task = task || null;
        this.$taskDetail.history = history || [];
      } else {
        this.$taskList.style.display = 'block';
        this.$taskDetail.style.display = 'none';
      }
    });

    this.store.subscribe('activeTab', (tab) => {
      this.$header.activeTab = tab;
      // Switch view logic later (Phase 5)
      if (tab === 'tasks') {
        this.$taskList.style.display = 'block';
        this.$timeline.style.display = 'none';
        // If selected, list is hidden? 
        if (this.store.getState().selectedTaskId) {
            this.$taskList.style.display = 'none';
            this.$taskDetail.style.display = 'block';
        } else {
            this.$taskList.style.display = 'block';
            this.$taskDetail.style.display = 'none';
        }
      } else {
        this.$taskList.style.display = 'none';
        this.$taskDetail.style.display = 'none';
        this.$timeline.style.display = 'block';
      }
    });

    this.store.subscribe('dockPosition', (pos) => {
      this.$header.dockPosition = pos; 
      const size = this.store.getState().panelSize;
      if (pos === 'right') {
        this.$panel.classList.add('dock-right');
        this.$panel.classList.remove('dock-bottom');
        this.$panel.style.width = `${size.width}px`;
        this.$panel.style.height = '100vh';
      } else {
        this.$panel.classList.add('dock-bottom');
        this.$panel.classList.remove('dock-right');
        this.$panel.style.width = '100%';
        this.$panel.style.height = `${size.height}px`;
      }
    });

    this.store.subscribe('panelSize', (size) => {
      const pos = this.store.getState().dockPosition;
      if (pos === 'right' && size.width) {
        this.$panel.style.width = `${size.width}px`;
        // Reset right position to ensure close animation works
        this.$panel.style.right = this.store.getState().isOpen ? '0' : `-${size.width}px`;
      } else if (pos === 'bottom' && size.height) {
        this.$panel.style.height = `${size.height}px`;
        // Reset bottom position to ensure close animation works
        this.$panel.style.bottom = this.store.getState().isOpen ? '0' : `-${size.height}px`;
      }
    });

    this.store.subscribe('language', (lang) => {
      this.$header.language = lang;
      // Force re-render list to update localized status
      this.$taskList.tasks = this.store.getState().tasks;
    });

    this.store.subscribe('filterText', (text) => {
      const tasks = this.store.getState().tasks;
      this.$taskList.filter(text, tasks);
    });
  }

  private addEventListeners() {
    this.$trigger.addEventListener('toggle', () => {
      this.store.toggle();
    });

    this.$header.addEventListener('close', (e) => {
      e.stopPropagation();
      this.store.toggle();
    });

    this.$header.addEventListener('dock-toggle', () => {
      const current = this.store.getState().dockPosition;
      this.store.setDockPosition(current === 'right' ? 'bottom' : 'right');
    });

    this.$header.addEventListener('theme-toggle', (e: Event) => {
      const theme = (e as CustomEvent).detail;
      this.store.setTheme(theme);
    });

    this.$header.addEventListener('lang-toggle', (e: Event) => {
      const lang = (e as CustomEvent).detail;
      this.store.setLanguage(lang);
    });

    this.$header.addEventListener('tab-change', (e: Event) => {
      const tab = (e as CustomEvent).detail;
      this.store.setTab(tab);
    });

    this.$header.addEventListener('search', (e: Event) => {
      const text = (e as CustomEvent).detail;
      this.store.setFilterText(text);
    });

    // Listen to resize events from hs-resizer
    this.addEventListener('resize', (e: Event) => {
      const size = (e as CustomEvent).detail;
      this.store.setPanelSize(size);
    });

    this.$taskList.addEventListener('task-select', (e: Event) => {
      const id = (e as CustomEvent).detail;
      this.store.selectTask(id);
    });

    this.$taskDetail.addEventListener('back', () => {
      this.store.selectTask(null);
    });

    this.$taskList.addEventListener('task-action', (e: Event) => {
      const { action, id } = (e as CustomEvent).detail;
      switch (action) {
        case 'trigger': this.store.triggerTask(id); break;
        case 'pause': this.store.pauseTask(id); break;
        case 'resume': this.store.resumeTask(id); break;
        case 'remove': 
          if (confirm(`Are you sure you want to remove task "${id}"?`)) {
            this.store.removeTask(id); 
          }
          break;
      }
    });
  }

  private startLoop() {
    const loop = (time: number) => {
      const delta = time - this.lastTime;
      this.lastTime = time;
      const fps = 1000 / delta;
      if (this.$header) {
        this.$header.fps = fps;
      }
      this.rAFId = requestAnimationFrame(loop);
    };
    this.rAFId = requestAnimationFrame(loop);
  }

  render() {
    this._shadow.innerHTML = `
      <style>
        ${themeStyles}
        :host {
          font-family: var(--hs-font-family);
          font-size: var(--hs-font-size);
          color: var(--hs-text);
          line-height: var(--hs-line-height);
        }
        .panel {
          position: fixed;
          background: var(--hs-bg);
          box-shadow: var(--hs-shadow);
          z-index: var(--hs-z-index);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--hs-border);
        }
        /* Default Right Dock */
        .panel.dock-right {
          top: 0;
          right: -500px;
          width: 500px;
          height: 100vh;
          border-left: 1px solid var(--hs-border);
          border-top: none;
        }
        
        /* Bottom Dock */
        .panel.dock-bottom {
          bottom: -500px;
          left: 0;
          width: 100%;
          height: 500px;
          border-top: 1px solid var(--hs-border);
          border-left: none;
        }

        .content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        @media (max-width: 480px) {
          .panel.dock-right {
            width: 100%;
            right: -100%;
          }
        }
      </style>
      
      <hs-floating-trigger></hs-floating-trigger>
      
      <div class="panel dock-right">
        <hs-resizer></hs-resizer>
        <hs-task-header></hs-task-header>
        <div class="content">
          <hs-task-list></hs-task-list>
          <hs-task-detail style="display:none"></hs-task-detail>
          <hs-timeline style="display:none"></hs-timeline>
        </div>
      </div>
    `;
  }
}

customElements.define('hs-devtools', DevTools);
