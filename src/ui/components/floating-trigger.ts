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
    
    localStorage.setItem(STORAGE_KEY_COLLAPSED, String(this._isCollapsed));

    // 只有在非收起状态下才保存位置，避免保存吸附后的边缘位置
    if (!this._isCollapsed) {
      const rect = button.getBoundingClientRect();
      localStorage.setItem(STORAGE_KEY_POS, JSON.stringify({ x: rect.left, y: rect.top }));
    } else {
        // 收起状态下，如果有拖拽（只改变了Y），我们需要更新保存的Y值，但保持X值不变
        // 这是一个优化，目前可以先简单处理：不更新坐标，或者读取之前的坐标只更新Y
        // 为了简单且稳健，收起时暂不更新位置，或者只更新 Y？
        // 如果用户在收起时拖动了高度，展开时应该保留这个高度。
        // 所以我们需要读取旧的 pos
        try {
            const savedPos = localStorage.getItem(STORAGE_KEY_POS);
            if (savedPos) {
                const { x } = JSON.parse(savedPos);
                const rect = button.getBoundingClientRect();
                // 更新 Y，保持 X
                localStorage.setItem(STORAGE_KEY_POS, JSON.stringify({ x: x, y: rect.top }));
            }
        } catch (e) {
            // ignore
        }
    }
  }

  private applyPosition() {
    const button = this._shadow.querySelector('button');
    if (!button) return;

    // 获取视口尺寸
    const maxX = window.innerWidth - button.offsetWidth;
    const maxY = window.innerHeight - button.offsetHeight;

    // 优先处理收起状态的吸附逻辑
    if (this._isCollapsed) {
        // 收起时：强制吸附到右侧边缘
        // 使用 right: 0 和 left: auto
        // top 使用当前保存的或计算的 top
        
        let currentY = parseFloat(this.style.getPropertyValue('--hs-trigger-top') || '20');
        currentY = Math.max(0, Math.min(currentY, maxY));

        button.style.right = '0px';
        button.style.left = 'auto';
        button.style.top = `${currentY}px`;
        button.style.bottom = 'auto';
        
        // 更新 CSS 变量以保持一致性（虽然 left/right 已覆盖）
        this.style.setProperty('--hs-trigger-top', `${currentY}px`);
    } else {
        // 展开状态：使用保存的精确位置
        if (!this.style.getPropertyValue('--hs-trigger-position-set')) {
            // 默认位置
            const pos = this._position;
            button.style.top = pos.includes('top') ? '20px' : 'auto';
            button.style.bottom = pos.includes('bottom') ? '20px' : 'auto';
            button.style.left = pos.includes('left') ? '20px' : 'auto';
            button.style.right = pos.includes('right') ? '20px' : 'auto';
        } else {
            // 自定义位置
            let currentX = parseFloat(this.style.getPropertyValue('--hs-trigger-left') || '0');
            let currentY = parseFloat(this.style.getPropertyValue('--hs-trigger-top') || '0');

            // 限制范围
            currentX = Math.max(0, Math.min(currentX, maxX));
            currentY = Math.max(0, Math.min(currentY, maxY));

            this.style.setProperty('--hs-trigger-left', `${currentX}px`);
            this.style.setProperty('--hs-trigger-top', `${currentY}px`);
            
            button.style.left = `${currentX}px`;
            button.style.top = `${currentY}px`;
            button.style.right = 'auto';
            button.style.bottom = 'auto';
        }
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
      this.applyPosition(); // 应用位置变化（吸附/还原）
      this.saveState();
    });
    
    // 双击展开（仅在已收起状态下有效，方便恢复）
    btn.addEventListener('dblclick', (e) => {
      if (this._isCollapsed) {
        e.stopPropagation();
        this._isCollapsed = false;
        this.applyPosition(); // 应用位置变化（还原）
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
            
            if (this._isCollapsed) {
                // 收起状态下，只允许垂直拖动，强制吸附右侧
                btn.style.left = 'auto';
                btn.style.right = '0px';
            } else {
                btn.style.left = `${newX}px`;
                btn.style.right = 'auto';
                this.style.setProperty('--hs-trigger-left', `${newX}px`);
            }
            
            btn.style.top = `${newY}px`;
            btn.style.bottom = 'auto';
            
            this.style.setProperty('--hs-trigger-position-set', 'true');
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
      transform: translateX(0);
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
          width: 24px;
          height: 48px;
          border-radius: 12px 0 0 12px;
          transform: none; /* 完全展示，不再隐藏 */
          opacity: 1;
          right: 0 !important; /* 强制右对齐 */
          left: auto !important;
        }
        button.collapsed:hover {
          width: 28px; /* hover 时稍微变宽 */
          opacity: 1;
        }
        button.collapsed .icon {
          display: none;
        }
        button.collapsed .collapse-btn {
          position: static; /* 充满父容器 */
          width: 100%;
          height: 100%;
          border-radius: 0;
          background: transparent;
        }
        button.collapsed .collapse-btn::before {
          content: '‹'; /* 展开图标 (左箭头) */
          font-size: 20px;
          line-height: 48px;
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