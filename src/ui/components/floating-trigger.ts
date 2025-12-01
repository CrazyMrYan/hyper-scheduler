import { themeStyles } from '../styles/theme.css';
import { ICONS } from './icons';

export class FloatingTrigger extends HTMLElement {
  private _shadow: ShadowRoot;
  
  // 配置属性
  private _position: string = 'bottom-right';
  private _bgColor: string = '';
  private _textColor: string = '';

  static get observedAttributes() {
    return ['position', 'bg-color', 'text-color'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
    console.log('[FloatingTrigger] attributeChangedCallback:', name, newVal);
    if (name === 'position') {
      this._position = newVal || 'bottom-right';
    } else if (name === 'bg-color') {
      this._bgColor = newVal || '';
    } else if (name === 'text-color') {
      this._textColor = newVal || '';
    }
    // 如果已经渲染，重新渲染以应用新样式
    if (this._shadow.querySelector('button')) {
      console.log('[FloatingTrigger] re-rendering with:', this._position, this._bgColor, this._textColor);
      this.render();
      this.addEventListeners();
    }
  }

  addEventListeners() {
    const btn = this._shadow.querySelector('button');
    btn?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }));
    });
  }

  render() {
    // 计算位置样式 - 必须明确设置所有四个方向，避免默认值干扰
    const pos = this._position;
    const posStyles = `
      top: ${pos.includes('top') ? '20px' : 'auto'};
      bottom: ${pos.includes('bottom') ? '20px' : 'auto'};
      left: ${pos.includes('left') ? '20px' : 'auto'};
      right: ${pos.includes('right') ? '20px' : 'auto'};
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
          transition: transform 0.2s;
        }
        button:hover {
          ${this._bgColor ? `background: ${this._bgColor}; filter: brightness(1.1);` : 'background: var(--hs-primary-hover);'}
          transform: scale(1.1);
        }
        button:active {
          transform: scale(0.95);
        }
      </style>
      <button title="Toggle Hyper Scheduler DevTools">
        ${ICONS.chart}
      </button>
    `;
  }
}

customElements.define('hs-floating-trigger', FloatingTrigger);
