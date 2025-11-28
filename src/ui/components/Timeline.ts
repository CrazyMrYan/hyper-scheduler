import { themeStyles } from '../styles/theme.css';
import { TaskSnapshot, ExecutionRecord } from '../../types';

export class Timeline extends HTMLElement {
  private _shadow: ShadowRoot;
  private _tasks: Map<string, TaskSnapshot> = new Map();
  private _history: Map<string, ExecutionRecord[]> = new Map();
  
  private $canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private timeRange = 60 * 1000; // 1 minute window
  private zoom = 1;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.$canvas = this._shadow.querySelector('canvas')!;
    this.ctx = this.$canvas.getContext('2d')!;
    this.setupZoom();
    this.startLoop();
  }

  set data(val: { tasks: Map<string, TaskSnapshot>, history: Map<string, ExecutionRecord[]> }) {
    this._tasks = val.tasks;
    this._history = val.history;
  }

  private setupZoom() {
    const zoomSlider = this._shadow.querySelector('.zoom-slider') as HTMLInputElement;
    const zoomOut = this._shadow.querySelector('.zoom-out');
    const zoomIn = this._shadow.querySelector('.zoom-in');
    
    zoomSlider?.addEventListener('input', (e) => {
      this.zoom = parseFloat((e.target as HTMLInputElement).value);
      this.timeRange = 60 * 1000 / this.zoom;
    });
    
    zoomOut?.addEventListener('click', () => {
      this.zoom = Math.max(0.5, this.zoom - 0.5);
      zoomSlider.value = this.zoom.toString();
      this.timeRange = 60 * 1000 / this.zoom;
    });
    
    zoomIn?.addEventListener('click', () => {
      this.zoom = Math.min(5, this.zoom + 0.5);
      zoomSlider.value = this.zoom.toString();
      this.timeRange = 60 * 1000 / this.zoom;
    });
  }

  private startLoop() {
    const loop = () => {
      if (this.isConnected) {
        this.draw();
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  }

  private draw() {
    if (!this.ctx || !this.$canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const width = this.$canvas.clientWidth;
    const height = this.$canvas.clientHeight;
    
    this.$canvas.width = width * dpr;
    this.$canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    
    const now = Date.now();
    const startTime = now - this.timeRange;
    const rowHeight = 40;
    const labelWidth = 150;
    const taskIds = Array.from(this._tasks.keys());
    
    // Clear
    this.ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-bg') || '#1e1e1e';
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw time axis
    this.drawTimeAxis(width, labelWidth, startTime, now);
    
    // Draw task rows
    taskIds.forEach((taskId, index) => {
      const y = index * rowHeight + 60;
      this.drawTaskRow(taskId, y, width, labelWidth, startTime, now);
    });
    
    // Draw legend
    this.drawLegend(width, height);
  }

  private drawTimeAxis(width: number, labelWidth: number, startTime: number, _endTime: number) {
    const ctx = this.ctx;
    const timelineWidth = width - labelWidth - 20;
    const segments = 4;
    
    ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-text-secondary') || '#888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    
    for (let i = 0; i <= segments; i++) {
      const x = labelWidth + (timelineWidth / segments) * i;
      const time = startTime + (this.timeRange / segments) * i;
      const timeStr = new Date(time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
      
      ctx.fillText(timeStr, x, 30);
      
      // Draw vertical grid line
      ctx.strokeStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-border') || '#333';
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, this.$canvas.clientHeight - 40);
      ctx.stroke();
    }
    
    // Draw time range label
    ctx.textAlign = 'left';
    ctx.fillText(`Time Range: Last ${Math.round(this.timeRange / 1000)}s`, 10, 15);
  }

  private drawTaskRow(taskId: string, y: number, width: number, labelWidth: number, startTime: number, endTime: number) {
    const ctx = this.ctx;
    const timelineWidth = width - labelWidth - 20;
    
    // Draw task label
    ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-text') || '#fff';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(taskId, 10, y + 15);
    
    // Draw driver indicator
    const driver = 'W'; // TODO: get from task config
    ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-text-secondary') || '#888';
    ctx.font = '9px monospace';
    ctx.fillText(`[${driver}]`, 10, y + 28);
    
    // Draw separator line
    ctx.strokeStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-border') || '#333';
    ctx.beginPath();
    ctx.moveTo(0, y + 35);
    ctx.lineTo(width, y + 35);
    ctx.stroke();
    
    // Draw execution history
    const logs = this._history.get(taskId) || [];
    logs.forEach(log => {
      if (log.timestamp < startTime || log.timestamp > endTime) return;
      
      const x = labelWidth + ((log.timestamp - startTime) / this.timeRange) * timelineWidth;
      const duration = log.duration;
      
      if (duration < 10) {
        // Draw as dot for instant tasks
        ctx.fillStyle = log.success 
          ? (getComputedStyle(this.$canvas).getPropertyValue('--hs-success') || '#22c55e')
          : (getComputedStyle(this.$canvas).getPropertyValue('--hs-danger') || '#ef4444');
        ctx.beginPath();
        ctx.arc(x, y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw as bar for long tasks
        const barWidth = Math.max(2, (duration / this.timeRange) * timelineWidth);
        ctx.fillStyle = log.success 
          ? (getComputedStyle(this.$canvas).getPropertyValue('--hs-success') || '#22c55e')
          : (getComputedStyle(this.$canvas).getPropertyValue('--hs-danger') || '#ef4444');
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x, y + 5, barWidth, 20);
        ctx.globalAlpha = 1;
      }
    });
  }

  private drawLegend(_width: number, height: number) {
    const ctx = this.ctx;
    const legendY = height - 25;
    
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-text-secondary') || '#888';
    
    let x = 10;
    
    // Dot legend
    ctx.fillText('Legend:', x, legendY);
    x += 50;
    
    ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-success') || '#22c55e';
    ctx.beginPath();
    ctx.arc(x, legendY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-text-secondary') || '#888';
    ctx.fillText('Instant', x + 10, legendY);
    x += 60;
    
    // Bar legend
    ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-success') || '#22c55e';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x, legendY - 8, 15, 10);
    ctx.globalAlpha = 1;
    ctx.fillStyle = getComputedStyle(this.$canvas).getPropertyValue('--hs-text-secondary') || '#888';
    ctx.fillText('Duration', x + 20, legendY);
    x += 80;
    
    // Driver legend
    ctx.fillText('[W] Worker Driver', x, legendY);
    x += 110;
    ctx.fillText('[M] Main Driver', x, legendY);
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
        .controls {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 12px 16px;
          gap: 8px;
          border-bottom: 1px solid var(--hs-border);
        }
        .zoom-label {
          font-size: 11px;
          color: var(--hs-text-secondary);
        }
        .zoom-btn {
          background: var(--hs-bg-secondary);
          border: 1px solid var(--hs-border);
          color: var(--hs-text);
          width: 24px;
          height: 24px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .zoom-btn:hover {
          background: var(--hs-primary);
          color: white;
        }
        .zoom-slider {
          width: 100px;
        }
        canvas {
          flex: 1;
          width: 100%;
        }
      </style>
      <div class="controls">
        <span class="zoom-label">Zoom:</span>
        <button class="zoom-btn zoom-out">-</button>
        <input type="range" class="zoom-slider" min="0.5" max="5" step="0.5" value="1">
        <button class="zoom-btn zoom-in">+</button>
      </div>
      <canvas></canvas>
    `;
  }
}

customElements.define('hs-timeline', Timeline);
