import { themeStyles } from '../styles/theme.css';

export class Resizer extends HTMLElement {
  private _shadow: ShadowRoot;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private panel: HTMLElement | null = null;
  private mode: 'right' | 'bottom' = 'right';

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
    this.panel = this.closest('.panel') as HTMLElement;
    if (this.panel && this.panel.classList.contains('dock-bottom')) {
      this.mode = 'bottom';
    }
  }

  private addEventListeners() {
    const handle = this._shadow.querySelector('.handle') as HTMLElement;
    
    const onMouseMove = (e: MouseEvent) => {
      if (!this.panel) return;
      
      if (this.mode === 'right') {
        const dx = this.startX - e.clientX;
        const newWidth = Math.max(300, Math.min(window.innerWidth - 50, this.startWidth + dx));
        this.panel.style.width = `${newWidth}px`;
        // Emit resize event for persistence
        this.dispatchEvent(new CustomEvent('resize', { detail: { width: newWidth }, bubbles: true, composed: true }));
      } else {
        // const dy = this.startX - e.clientY; 
        const newHeight = Math.max(200, Math.min(window.innerHeight - 50, this.startHeight + (this.startY - e.clientY)));
        this.panel.style.height = `${newHeight}px`;
        this.dispatchEvent(new CustomEvent('resize', { detail: { height: newHeight }, bubbles: true, composed: true }));
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    handle.addEventListener('mousedown', (e) => {
      this.startX = e.clientX;
      this.startY = e.clientY;
      
      if (this.panel) {
        if (this.panel.classList.contains('dock-bottom')) {
          this.mode = 'bottom';
          this.startHeight = this.panel.offsetHeight;
        } else {
          this.mode = 'right';
          this.startWidth = this.panel.offsetWidth;
        }
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = this.mode === 'right' ? 'col-resize' : 'row-resize';
    });
  }

  render() {
    this._shadow.innerHTML = `
      <style>
        ${themeStyles}
        :host {
          display: block;
          z-index: 100;
        }
        .handle {
          background: transparent;
          transition: background 0.2s;
        }
        .handle:hover {
          background: var(--hs-primary);
        }
        
        /* Right Dock Mode (Vertical Handle on Left) */
        :host-context(.dock-right) .handle {
          width: 4px;
          height: 100%;
          cursor: col-resize;
          position: absolute;
          left: 0;
          top: 0;
        }

        /* Bottom Dock Mode (Horizontal Handle on Top) */
        :host-context(.dock-bottom) .handle {
          width: 100%;
          height: 4px;
          cursor: row-resize;
          position: absolute;
          top: 0;
          left: 0;
        }
      </style>
      <div class="handle"></div>
    `;
  }
}

customElements.define('hs-resizer', Resizer);
