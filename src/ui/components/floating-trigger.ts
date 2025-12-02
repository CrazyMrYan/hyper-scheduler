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
    this.applyPosition(); // 首次渲染后应用位置和状态
  }

  attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
    if (name === 'position') {
      this._position = newVal || 'bottom-right';
      this.applyPosition(); // 位置变化时重新应用
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
        this.style.setProperty('--hs-trigger-left', `${x}px`);
        this.style.setProperty('--hs-trigger-top', `${y}px`);
        this.style.setProperty('--hs-trigger-position-set', 'true'); // 标记已设置位置
      }
      const savedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED);
      if (savedCollapsed === 'true') {
        this._isCollapsed = true;
      }
    } catch (e) {
      console.warn('[FloatingTrigger] Failed to load state:', e);
    }
  }

  private saveState() {
    const button = this._shadow.querySelector('button')!;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    // 只保存相对窗口左上角的位置
    localStorage.setItem(STORAGE_KEY_POS, JSON.stringify({ x: rect.left, y: rect.top }));
    localStorage.setItem(STORAGE_KEY_COLLAPSED, String(this._isCollapsed));
  }

  private applyPosition() {
    const button = this._shadow.querySelector('button');
    if (button && !this.style.getPropertyValue('--hs-trigger-position-set')) {
      // 只有在没有保存位置时才应用默认位置属性
      const pos = this._position;
      button.style.top = pos.includes('top') ? '20px' : 'auto';
      button.style.bottom = pos.includes('bottom') ? '20px' : 'auto';
      button.style.left = pos.includes('left') ? '20px' : 'auto';
      button.style.right = pos.includes('right') ? '20px' : 'auto';
    }
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
      // 如果发生过拖拽，阻止默认行为和冒泡
      if (this._wasDragging) {
        e.preventDefault();
        e.stopPropagation();
        this._wasDragging = false; // 重置标志位
        return;
      }
      this.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }));
    });

    // 显式收起按钮点击事件
    const collapseBtn = this._shadow.querySelector('.collapse-btn');
    collapseBtn?.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止触发 toggle
      e.preventDefault(); // 防止触发按钮点击
      this._isCollapsed = !this._isCollapsed;
      this.updateCollapsedState();
      this.saveState();
    });
    
    // 双击展开（仅在已收起状态下有效，方便恢复）
    btn.addEventListener('dblclick', (e) => {
      if (this._isCollapsed) {
        e.stopPropagation();
        this._isCollapsed = false;
        this.updateCollapsedState();
        this.saveState();
      }
    });

    btn.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return; // 只响应鼠标左键
      // 如果点击的是收起按钮，不启动拖拽
      if ((e.target as HTMLElement).closest('.collapse-btn')) return;

      this._isDragging = true;
      this._wasDragging = false; // 每次 mousedown 都重置
      this._offsetX = e.clientX - btn.getBoundingClientRect().left;
      this._offsetY = e.clientY - btn.getBoundingClientRect().top;
      
      const startX = e.clientX;
      const startY = e.clientY;
      let hasMoved = false;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!this._isDragging) return;
        
        // 判断是否真的发生了位移（防止微小抖动被误判为拖拽）
        if (!hasMoved && (Math.abs(moveEvent.clientX - startX) > 2 || Math.abs(moveEvent.clientY - startY) > 2)) {
          hasMoved = true;
          this._wasDragging = true;
          btn.style.cursor = 'grabbing';
          btn.style.transition = 'none'; // 拖拽时禁用过渡动画
        }

        if (hasMoved) {
            let newX = moveEvent.clientX - this._offsetX;
            let newY = moveEvent.clientY - this._offsetY;
            
            // 边界限制
            const maxX = window.innerWidth - btn.offsetWidth;
            const maxY = window.innerHeight - btn.offsetHeight;
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            btn.style.left = `${newX}px`;
            btn.style.top = `${newY}px`;
            btn.style.right = 'auto';
            btn.style.bottom = 'auto';
            
            this.style.setProperty('--hs-trigger-position-set', 'true');
            this.style.setProperty('--hs-trigger-left', `${newX}px`);
            this.style.setProperty('--hs-trigger-top', `${newY}px`);
        }
      };

      const onMouseUp = () => {
        if (!this._isDragging) return;
        this._isDragging = false;
        btn.style.cursor = 'pointer';
        btn.style.transition = ''; // 恢复过渡动画
        
        if (hasMoved) {
            this.saveState();
            // 拦截紧接着的 click 事件
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
    // 计算位置样式 - 必须明确设置所有四个方向，避免默认值干扰
    // 拖拽后使用 --hs-trigger-left/top 变量
    const posStyles = `
      top: var(--hs-trigger-top, ${this._position.includes('top') ? '20px' : 'auto'});
      bottom: var(--hs-trigger-bottom, ${this._position.includes('bottom') ? '20px' : 'auto'});
      left: var(--hs-trigger-left, ${this._position.includes('left') ? '20px' : 'auto'});
      right: var(--hs-trigger-right, ${this._position.includes('right') ? '20px' : 'auto'});
      transform: ${this._isCollapsed ? 'translateX(calc(100% - 12px))' : 'translateX(0)'};
    `;
    
    // 自定义颜色
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
          border-radius: 12px; /* 更现代的圆角 */
          background: var(--hs-primary);
          color: white;
          ${bgStyle}
          ${colorStyle}
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15); /* 更柔和的阴影 */
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--hs-font-family);
          z-index: var(--hs-z-index);
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background 0.2s, box-shadow 0.2s;
          overflow: visible; /* 允许子元素（收起按钮）溢出或显示 */
        }
        button:hover {
          ${this._bgColor ? `background: ${this._bgColor}; filter: brightness(1.1);` : 'background: var(--hs-primary-hover);'}
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        button:active {
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
          opacity: 1; /* 默认可见 */
          transition: opacity 0.2s, background 0.2s;
          color: white;
          font-weight: bold;
        }
        .collapse-btn::before {
          content: '—'; /* 最小化图标 */
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
          width: 36px;
          height: 36px;
          border-radius: 18px 0 0 18px;
          transform: translateX(calc(100% - 12px));
          opacity: 0.8;
        }
        button.collapsed:hover {
          transform: translateX(calc(100% - 24px)); /* hover 时稍微伸出一点 */
          opacity: 1;
        }
        button.collapsed .icon {
          display: none;
        }
        button.collapsed .collapse-btn {
          right: auto;
          left: 0;
          border-radius: 18px 0 0 0;
        }
        button.collapsed .collapse-btn::before {
          content: '›'; /* 展开图标 */
        }
      </style>
      <button title="Toggle Hyper Scheduler DevTools">
        <div class="collapse-btn" title="Minimize"></div>
        <span class="icon">${ICONS.chart}</span>
      </button>
    `;
    this.applyPosition(); 
    this.updateCollapsedState();
    this.updateStyles();
  }
}

customElements.define('hs-floating-trigger', FloatingTrigger);
