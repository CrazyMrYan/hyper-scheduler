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

    btn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }));
    });

    btn.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this._isCollapsed = !this._isCollapsed;
      this.updateCollapsedState();
      this.saveState();
    });

    btn.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return; // 只响应鼠标左键
      this._isDragging = true;
      this._offsetX = e.clientX - btn.getBoundingClientRect().left;
      this._offsetY = e.clientY - btn.getBoundingClientRect().top;
      btn.style.cursor = 'grabbing';
      btn.style.transition = 'none'; // 拖拽时禁用过渡动画

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!this._isDragging) return;
        const newX = moveEvent.clientX - this._offsetX;
        const newY = moveEvent.clientY - this._offsetY;
        
        btn.style.left = `${newX}px`;
        btn.style.top = `${newY}px`;
        btn.style.right = 'auto'; // 拖拽时禁用 right/bottom
        btn.style.bottom = 'auto';
        
        this.style.setProperty('--hs-trigger-position-set', 'true');
        this.style.setProperty('--hs-trigger-left', `${newX}px`);
        this.style.setProperty('--hs-trigger-top', `${newY}px`);
      };

      const onMouseUp = () => {
        if (!this._isDragging) return;
        this._isDragging = false;
        btn.style.cursor = 'pointer';
        btn.style.transition = ''; // 恢复过渡动画
        this.saveState();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
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
      transform: ${this._isCollapsed ? 'translateX(calc(100% - 24px))' : 'translateX(0)'}; /* 收起效果 */
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
          border-radius: 50%;
          background: var(--hs-primary);
          color: white;
          ${bgStyle}
          ${colorStyle}
          border: none;
          box-shadow: var(--hs-shadow);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--hs-font-family);
          z-index: var(--hs-z-index);
          transition: transform 0.2s, background 0.2s, box-shadow 0.2s; /* 添加 transform 过渡 */
        }
        button:hover {
          ${this._bgColor ? `background: ${this._bgColor}; filter: brightness(1.1);` : 'background: var(--hs-primary-hover);'}
          transform: scale(1.1) ${this._isCollapsed ? 'translateX(calc(100% - 24px))' : ''}; /* 拖拽时禁用过渡动画 */
        }
        button:active {
          transform: scale(0.95) ${this._isCollapsed ? 'translateX(calc(100% - 24px))' : ''};
        }

        /* 收起状态样式 */
        button.collapsed {
          width: 24px; /* 收起后宽度变窄 */
          border-radius: 24px 0 0 24px; /* 右侧变成直角 */
          transform: translateX(calc(100% - 24px)); /* 隐藏大部分 */
        }
        button.collapsed .icon {
          display: none; /* 隐藏图标 */
        }
        button.collapsed::before {
          content: '>'; /* 显示一个箭头 */
          font-size: 16px;
          font-weight: bold;
          color: inherit;
        }
      </style>
      <button title="Toggle Hyper Scheduler DevTools">
        <span class="icon">${ICONS.chart}</span>
      </button>
    `;
    this.applyPosition(); // 渲染后再次应用位置
    this.updateCollapsedState(); // 应用收起状态
    this.updateStyles(); // 应用颜色样式
  }
}

customElements.define('hs-floating-trigger', FloatingTrigger);
