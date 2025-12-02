import { themeStyles } from '../styles/theme.css';
import { ICONS } from './icons';

const STORAGE_KEY_POS = 'hs-trigger-position';
const STORAGE_KEY_COLLAPSED = 'hs-trigger-collapsed';

export class FloatingTrigger extends HTMLElement {
  private _shadow: ShadowRoot;
  
  // 配置属性
  private _position: string = 'bottom-right';
  private _bgColor: string = '';
  private _textColor: string = '';

  private _isDragging = false;
  private _wasDragging = false; // 标记是否发生过拖拽
  private _offsetX = 0;
  private _offsetY = 0;
  private _isCollapsed = false; // 新增：收起状态
  
  // 内部状态：保存展开时的位置
  private _savedX = 0;
  private _savedY = 0;

  static get observedAttributes() {
    return ['position', 'bg-color', 'text-color'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.loadState(); // 加载保存的状态
    this.render();
    this.addEventListeners();
    
    // 延迟一帧应用位置，确保 DOM 渲染完成且 CSS transition 生效前初始化位置
    requestAnimationFrame(() => {
       this.applyPosition();
    });
    
    // 监听 resize 事件，重新计算位置以防止出界
    window.addEventListener('resize', this.onResize.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  private onResize() {
    this.applyPosition(); // 重新应用位置（包含边界检查）
  }

  attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
    if (name === 'position') {
      this._position = newVal || 'bottom-right';
      // 仅当未手动移动过时才重置位置
      if (!this.style.getPropertyValue('--hs-trigger-position-set')) {
          this.resetPositionToDefault();
      }
    } else if (name === 'bg-color') {
      this._bgColor = newVal || '';
      this.updateStyles();
    } else if (name === 'text-color') {
      this._textColor = newVal || '';
      this.updateStyles();
    }
  }
  
  private loadState() {
    try {
      const savedPos = localStorage.getItem(STORAGE_KEY_POS);
      if (savedPos) {
        const { x, y } = JSON.parse(savedPos);
        this._savedX = parseFloat(x);
        this._savedY = parseFloat(y);
        this.style.setProperty('--hs-trigger-position-set', 'true');
      } else {
          this.resetPositionToDefault();
      }

      const savedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED);
      if (savedCollapsed === 'true') {
        this._isCollapsed = true;
      }
    } catch (e) {
      console.warn('[FloatingTrigger] Failed to load state:', e);
      this.resetPositionToDefault();
    }
  }

  private resetPositionToDefault() {
      // 简单的默认位置计算，实际渲染时会再次调整
      const width = 48; 
      const height = 48;
      const padding = 20;
      
      if (this._position.includes('left')) this._savedX = padding;
      else this._savedX = window.innerWidth - width - padding;
      
      if (this._position.includes('top')) this._savedY = padding;
      else this._savedY = window.innerHeight - height - padding;
  }

  private saveState() {
    // 保存状态到 localStorage
    // 注意：_savedX 和 _savedY 应该是“展开状态下的理想位置”
    localStorage.setItem(STORAGE_KEY_POS, JSON.stringify({ x: this._savedX, y: this._savedY }));
    localStorage.setItem(STORAGE_KEY_COLLAPSED, String(this._isCollapsed));
  }

  private applyPosition() {
    const button = this._shadow.querySelector('button');
    if (!button) return;

    const width = this._isCollapsed ? 24 : 48;
    const height = 48;
    
    const maxX = window.innerWidth - width;
    const maxY = window.innerHeight - height;

    let targetX, targetY;

    if (this._isCollapsed) {
        // 收起状态：吸附右侧边缘
        targetX = maxX; // window.innerWidth - 24
        // Y轴限制
        targetY = Math.max(0, Math.min(this._savedY, maxY));
    } else {
        // 展开状态：使用保存的位置，但进行边界限制
        targetX = Math.max(0, Math.min(this._savedX, maxX));
        targetY = Math.max(0, Math.min(this._savedY, maxY));
        
        // 如果位置被修正了（比如窗口变小），更新保存的值
        if (targetX !== this._savedX || targetY !== this._savedY) {
            this._savedX = targetX;
            this._savedY = targetY;
        }
    }

    // 应用位置
    button.style.left = `${targetX}px`;
    button.style.top = `${targetY}px`;
    
    // 同时也更新 CSS 变量
    this.style.setProperty('--hs-trigger-left', `${targetX}px`);
    this.style.setProperty('--hs-trigger-top', `${targetY}px`);

    this.updateCollapsedState();
  }
  
  private updateStyles() {
    const button = this._shadow.querySelector('button');
    if (button) {
      button.style.background = this._bgColor || 'var(--hs-primary)';
      button.style.color = this._textColor || 'white';
      if (this._bgColor) {
        button.style.setProperty('--hs-trigger-bg-hover', `${this._bgColor}; filter: brightness(1.1);`);
      } else {
        button.style.removeProperty('--hs-trigger-bg-hover');
      }
    }
  }

  private updateCollapsedState() {
    const button = this._shadow.querySelector('button');
    if (button) {
      if (this._isCollapsed) {
        button.classList.add('collapsed');
      } else {
        button.classList.remove('collapsed');
      }
    }
  }

  addEventListeners() {
    const btn = this._shadow.querySelector('button');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      if (this._wasDragging) {
        e.preventDefault();
        e.stopPropagation();
        this._wasDragging = false;
        return;
      }
      this.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }));
    });

    const collapseBtn = this._shadow.querySelector('.collapse-btn');
    collapseBtn?.addEventListener('click', (e) => {
      e.stopPropagation(); 
      e.preventDefault(); 
      this._isCollapsed = !this._isCollapsed;
      this.applyPosition(); // 触发动画
      this.saveState();
    });
    
    btn.addEventListener('dblclick', (e) => {
      if (this._isCollapsed) {
        e.stopPropagation();
        this._isCollapsed = false;
        this.applyPosition();
        this.saveState();
      }
    });

    btn.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('.collapse-btn')) return;

      this._isDragging = true;
      this._wasDragging = false;
      
      // 记录鼠标相对于按钮左上角的偏移
      const rect = btn.getBoundingClientRect();
      this._offsetX = e.clientX - rect.left;
      this._offsetY = e.clientY - rect.top;
      
      const startX = e.clientX;
      const startY = e.clientY;
      let hasMoved = false;
      
      // 拖拽开始时，暂时禁用 transition 以避免延迟
      btn.style.transition = 'none';

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!this._isDragging) return;
        
        if (!hasMoved && (Math.abs(moveEvent.clientX - startX) > 2 || Math.abs(moveEvent.clientY - startY) > 2)) {
          hasMoved = true;
          this._wasDragging = true;
          btn.style.cursor = 'grabbing';
        }

        if (hasMoved) {
            let newX = moveEvent.clientX - this._offsetX;
            let newY = moveEvent.clientY - this._offsetY;
            
            const width = this._isCollapsed ? 24 : 48;
            const height = 48;
            const maxX = window.innerWidth - width;
            const maxY = window.innerHeight - height;

            // 边界限制
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            if (this._isCollapsed) {
                // 收起状态下，X 轴固定在右侧，只允许 Y 轴移动
                newX = window.innerWidth - 24;
                // 只更新 Y
                this._savedY = newY; 
            } else {
                // 展开状态，更新 X 和 Y
                this._savedX = newX;
                this._savedY = newY;
            }

            btn.style.left = `${newX}px`;
            btn.style.top = `${newY}px`;
        }
      };

      const onMouseUp = () => {
        if (!this._isDragging) return;
        this._isDragging = false;
        btn.style.cursor = 'pointer';
        
        // 恢复 transition
        btn.style.transition = ''; 
        
        if (hasMoved) {
            this.saveState();
            const preventClick = (e: Event) => {
                e.stopPropagation();
                e.preventDefault();
            };
            window.addEventListener('click', preventClick, { capture: true, once: true });
        }
        
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  render() {
    // 初始位置使用默认值，稍后 connectedCallback 中会覆盖
    const posStyles = `
      left: 0;
      top: 0;
      transform: translateZ(0); /* 开启硬件加速 */
    `;
    
    const bgStyle = this._bgColor ? `background: ${this._bgColor};` : '';
    const colorStyle = this._textColor ? `color: ${this._textColor};` : '';
    
    this._shadow.innerHTML = `
      <style>
        ${themeStyles}
        button {
          position: fixed;
          ${posStyles}
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--hs-primary);
          color: white;
          ${bgStyle}
          ${colorStyle}
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--hs-font-family);
          z-index: var(--hs-z-index);
          /* 添加平滑过渡动画 */
          transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
                      left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
                      top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
                      border-radius 0.3s,
                      background 0.2s, 
                      box-shadow 0.2s;
          overflow: visible;
        }
        .icon {
          transition: transform 0.2s;
          display: flex;
        }
        button:hover {
          ${this._bgColor ? `background: ${this._bgColor}; filter: brightness(1.1);` : 'background: var(--hs-primary-hover);'}
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        button:hover .icon {
          transform: scale(1.1);
        }
        button:active .icon {
          transform: scale(0.95);
        }

        /* 显式收起按钮 */
        .collapse-btn {
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 20px;
          background: rgba(0,0,0,0.1);
          border-top-right-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1; 
          transition: opacity 0.2s, background 0.2s;
          color: white;
          font-weight: bold;
          z-index: 2;
        }
        .collapse-btn::before {
          content: '—'; 
          font-size: 12px;
          color: currentColor;
        }
        button:hover .collapse-btn {
          opacity: 1;
        }
        .collapse-btn:hover {
          background: rgba(0,0,0,0.3);
        }

        /* 收起状态样式 */
        button.collapsed {
          width: 24px;
          height: 48px;
          border-radius: 12px 0 0 12px;
          /* 不再强制 left/right，由 JS 控制 left 实现动画 */
        }
        button.collapsed:hover {
          width: 28px; 
        }
        
        button.collapsed .icon {
          display: none;
        }
        button.collapsed .collapse-btn {
          position: static;
          width: 100%;
          height: 100%;
          border-radius: 0;
          background: transparent;
        }
        button.collapsed .collapse-btn::before {
          content: '‹'; 
          font-size: 20px;
          line-height: 48px;
        }
      </style>
      <button title="Toggle Hyper Scheduler DevTools">
        <div class="collapse-btn" title="Minimize"></div>
        <span class="icon">${ICONS.chart}</span>
      </button>
    `;
  }
}

customElements.define('hs-floating-trigger', FloatingTrigger);