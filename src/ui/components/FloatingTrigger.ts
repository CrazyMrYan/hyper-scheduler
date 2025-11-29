import { themeStyles } from '../styles/theme.css';
import { ICONS } from './icons';

export class FloatingTrigger extends HTMLElement {
  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  addEventListeners() {
    const btn = this._shadow.querySelector('button');
    btn?.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('toggle', { bubbles: true, composed: true }));
    });
  }

  render() {
    this._shadow.innerHTML = `
      <style>
        ${themeStyles}
        button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--hs-primary);
          color: white;
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
          background: var(--hs-primary-hover);
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
