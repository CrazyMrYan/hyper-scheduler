import { DevToolsStore } from '../store/DevToolsStore';
import { SchedulerIntrospectionAPI, TaskControlAPI } from '../../types';
import { themeStyles } from '../styles/theme.css';
import './FloatingTrigger';
import './TaskHeader';
import './TaskList';
import './TaskDetail';
import './Timeline';
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
    
    // Initial load
    const tasks = this.scheduler.getTasks();
    tasks.forEach(t => this.store.updateTask(t));

    // Subscribe to events
    const events = ['task_registered', 'task_updated', 'task_started', 'task_completed', 'task_failed', 'task_removed'];
    events.forEach(evt => {
      this.scheduler?.on(evt, (_payload: any) => {
        const allTasks = this.scheduler?.getTasks() || [];
        allTasks.forEach(t => this.store.updateTask(t));
      });
    });
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
    // Bind Store -> UI
    this.store.subscribe('isOpen', (isOpen) => {
      if (isOpen) {
        this.$panel.classList.add('open');
        this.$trigger.style.display = 'none';
      } else {
        this.$panel.classList.remove('open');
        this.$trigger.style.display = 'block';
      }
    });

    this.store.subscribe('theme', (theme) => {
      if (theme === 'auto') {
        this.setAttribute('theme', 'light'); 
      } else {
        this.setAttribute('theme', theme);
      }
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
      if (tab === 'tasks') {
        this.$timeline.style.display = 'none';
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
  }

  private addEventListeners() {
    this.$trigger.addEventListener('toggle', () => {
      this.store.toggle();
    });

    this.$header.addEventListener('close', () => {
      this.store.toggle();
    });

    this.$header.addEventListener('theme-toggle', (e: Event) => {
      const theme = (e as CustomEvent).detail;
      this.store.setTheme(theme);
    });

    this.$header.addEventListener('tab-change', (e: Event) => {
      const tab = (e as CustomEvent).detail;
      this.store.setTab(tab);
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
          top: 0;
          right: -600px; /* Hidden */
          width: 600px;
          height: 100vh;
          background: var(--hs-bg);
          box-shadow: var(--hs-shadow);
          z-index: var(--hs-z-index);
          transition: right 0.3s ease;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--hs-border);
        }
        .panel.open {
          right: 0;
        }
        .content {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        @media (max-width: 480px) {
          .panel {
            width: 100%;
            right: -100%;
          }
        }
      </style>
      
      <hs-floating-trigger></hs-floating-trigger>
      
      <div class="panel">
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