import { themeStyles } from '../styles/theme.css';
import { TaskSnapshot, ExecutionRecord } from '../../types';
import { t } from '../i18n';

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
    if (!this.$canvas) {
      console.error('[Timeline] Canvas not found');
      return;
    }
    
    this.ctx = this.$canvas.getContext('2d')!;
    if (!this.ctx) {
      console.error('[Timeline] Canvas context not available');
      return;
    }
    
    this.setupZoom();
    this.startLoop();
    
    // Add ResizeObserver to canvas container
    const container = this._shadow.querySelector('.canvas-container');
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        // Trigger a redraw on next frame
        requestAnimationFrame(() => this.draw());
      });
      resizeObserver.observe(container);
    }
  }

  set data(val: { tasks: Map<string, TaskSnapshot>, history: Map<string, ExecutionRecord[]> }) {
    this._tasks = val.tasks;
    this._history = val.history;
  }

  set defaultZoom(val: number) {
    if (val >= 0.5 && val <= 5) {
      this.zoom = val;
      this.timeRange = 60 * 1000 / this.zoom;
      // 更新 slider 和 label
      const zoomSlider = this._shadow.querySelector('.zoom-slider') as HTMLInputElement;
      if (zoomSlider) zoomSlider.value = val.toString();
      this.updateZoomLabel();
    }
  }

  // Method to update texts when language changes
  updateTexts() {
    this.updateZoomLabel();
  }

  private updateZoomLabel() {
    const zoomLabel = this._shadow.querySelector('.zoom-label');
    if (zoomLabel) {
      zoomLabel.textContent = `${t('timeline.zoom')}: ${this.zoom}x (${Math.round(this.timeRange / 1000)}s)`;
    }
  }

  private setupZoom() {
    const zoomSlider = this._shadow.querySelector('.zoom-slider') as HTMLInputElement;
    const zoomOut = this._shadow.querySelector('.zoom-out');
    const zoomIn = this._shadow.querySelector('.zoom-in');
    
    const updateZoom = (newZoom: number) => {
      this.zoom = newZoom;
      this.timeRange = 60 * 1000 / this.zoom;
      this.updateZoomLabel();
    };
    
    zoomSlider?.addEventListener('input', (e) => {
      const newZoom = parseFloat((e.target as HTMLInputElement).value);
      updateZoom(newZoom);
    });
    
    zoomOut?.addEventListener('click', () => {
      const newZoom = Math.max(0.5, this.zoom - 0.5);
      if (zoomSlider) zoomSlider.value = newZoom.toString();
      updateZoom(newZoom);
    });
    
    zoomIn?.addEventListener('click', () => {
      const newZoom = Math.min(5, this.zoom + 0.5);
      if (zoomSlider) zoomSlider.value = newZoom.toString();
      updateZoom(newZoom);
    });
    
    // Initial label update
    this.updateZoomLabel();
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
    
    // Get container size
    const container = this._shadow.querySelector('.canvas-container') as HTMLElement;
    if (!container) return;
    
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    
    if (width === 0) return;
    
    // Calculate required height based on number of tasks
    const rowHeight = 40;
    const taskIds = Array.from(this._tasks.keys());
    const headerHeight = 60;
    const footerHeight = 40;
    const minHeight = container.clientHeight || 300;
    const contentHeight = taskIds.length * rowHeight + headerHeight + footerHeight;
    const height = Math.max(minHeight, contentHeight);
    
    // Set canvas size - this resets the transform
    this.$canvas.width = width * dpr;
    this.$canvas.height = height * dpr;
    this.$canvas.style.width = `${width}px`;
    this.$canvas.style.height = `${height}px`;
    
    // Reset and apply scale (must be after setting canvas size)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    const now = Date.now();
    const startTime = now - this.timeRange;
    const labelWidth = 150;
    
    // Get computed colors from host element
    const hostStyles = getComputedStyle(this);
    const bgColor = hostStyles.getPropertyValue('--hs-bg').trim() || '#1e1e1e';
    const textColor = hostStyles.getPropertyValue('--hs-text').trim() || '#fff';
    const textSecondary = hostStyles.getPropertyValue('--hs-text-secondary').trim() || '#888';
    const borderColor = hostStyles.getPropertyValue('--hs-border').trim() || '#333';
    const successColor = hostStyles.getPropertyValue('--hs-success').trim() || '#22c55e';
    const dangerColor = hostStyles.getPropertyValue('--hs-danger').trim() || '#ef4444';
    
    // Clear
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw time axis
    this.drawTimeAxis(width, labelWidth, startTime, textSecondary, borderColor);
    
    // Draw task rows
    taskIds.forEach((taskId, index) => {
      const y = index * rowHeight + 60;
      this.drawTaskRow(taskId, y, width, labelWidth, startTime, now, textColor, textSecondary, borderColor, successColor, dangerColor);
    });
    
    // Draw legend
    this.drawLegend(width, height, textSecondary, successColor);
  }

  private drawTimeAxis(width: number, labelWidth: number, startTime: number, textSecondary: string, borderColor: string) {
    const ctx = this.ctx;
    const timelineWidth = width - labelWidth - 20;
    const segments = 4;
    
    ctx.fillStyle = textSecondary;
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
      ctx.strokeStyle = borderColor;
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, this.$canvas.clientHeight - 40);
      ctx.stroke();
    }
    
    // Draw time range label
    ctx.textAlign = 'left';
    ctx.fillText(t('timeline.timeRange', { n: Math.round(this.timeRange / 1000) }), 10, 15);
  }

  private drawTaskRow(taskId: string, y: number, width: number, labelWidth: number, startTime: number, endTime: number, textColor: string, _textSecondary: string, borderColor: string, successColor: string, dangerColor: string) {
    const ctx = this.ctx;
    const timelineWidth = width - labelWidth - 20;
    
    // Draw task label
    ctx.fillStyle = textColor;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(taskId, 10, y + 15);
    
    // Draw driver indicator - get from task snapshot
    const task = this._tasks.get(taskId);
    const driver = (task as any)?.driver === 'main' ? 'M' : 'W';
    const driverColor = driver === 'W' ? '#22c55e' : '#f59e0b';
    ctx.fillStyle = driverColor;
    ctx.font = '9px monospace';
    ctx.fillText(`[${driver}]`, 10, y + 28);
    
    // Draw separator line
    ctx.strokeStyle = borderColor;
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
        ctx.fillStyle = log.success ? successColor : dangerColor;
        ctx.beginPath();
        ctx.arc(x, y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw as bar for long tasks
        const barWidth = Math.max(2, (duration / this.timeRange) * timelineWidth);
        ctx.fillStyle = log.success ? successColor : dangerColor;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x, y + 5, barWidth, 20);
        ctx.globalAlpha = 1;
      }
    });
  }

  private drawLegend(_width: number, height: number, textSecondary: string, successColor: string) {
    const ctx = this.ctx;
    const legendY = height - 25;
    
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = textSecondary;
    
    let x = 10;
    
    // Dot legend
    ctx.fillText(`${t('timeline.legend')}:`, x, legendY);
    x += 50;
    
    ctx.fillStyle = successColor;
    ctx.beginPath();
    ctx.arc(x, legendY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = textSecondary;
    ctx.fillText(t('timeline.instant'), x + 10, legendY);
    x += 60;
    
    // Bar legend
    ctx.fillStyle = successColor;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(x, legendY - 8, 15, 10);
    ctx.globalAlpha = 1;
    ctx.fillStyle = textSecondary;
    ctx.fillText(t('timeline.duration'), x + 20, legendY);
    x += 80;
    
    // Driver legend
    ctx.fillText(`[W] ${t('timeline.workerDriver')}`, x, legendY);
    x += 110;
    ctx.fillText(`[M] ${t('timeline.mainDriver')}`, x, legendY);
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
          overflow: hidden;
        }
        .controls {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding: 12px 16px;
          gap: 8px;
          border-bottom: 1px solid var(--hs-border);
          flex-shrink: 0;
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
        .canvas-container {
          flex: 1;
          overflow: auto;
          position: relative;
        }
        canvas {
          display: block;
        }
      </style>
      <div class="controls">
        <span class="zoom-label">Zoom:</span>
        <button class="zoom-btn zoom-out">-</button>
        <input type="range" class="zoom-slider" min="0.5" max="5" step="0.5" value="1">
        <button class="zoom-btn zoom-in">+</button>
      </div>
      <div class="canvas-container">
        <canvas></canvas>
      </div>
    `;
  }
}

customElements.define('hs-timeline', Timeline);
