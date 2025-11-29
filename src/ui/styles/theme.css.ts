export const themeStyles = `
  :host {
    --hs-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --hs-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    --hs-font-size: 12px;
    --hs-line-height: 1.5;
    --hs-panel-width: 400px;
    --hs-panel-height: 300px;
    
    /* Light Theme (Default) */
    --hs-bg: #ffffff;
    --hs-bg-secondary: #f3f4f6;
    --hs-text: #1f2937;
    --hs-text-secondary: #6b7280;
    --hs-border: #e5e7eb;
    --hs-primary: #3b82f6;
    --hs-primary-hover: #2563eb;
    --hs-danger: #ef4444;
    --hs-danger-hover: #dc2626;
    --hs-success: #10b981;
    --hs-warning: #f59e0b;
    
    --hs-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --hs-radius: 6px;
    --hs-header-height: 40px;
    --hs-z-index: 9999;

    /* Default display styles for the host itself */
    background: var(--hs-bg);
    color: var(--hs-text);
    font-family: var(--hs-font-family);
    font-size: var(--hs-font-size);
    line-height: var(--hs-line-height);
  }

  :host([theme="dark"]) {
    --hs-bg: #111827;
    --hs-bg-secondary: #1f2937;
    --hs-text: #f9fafb;
    --hs-text-secondary: #9ca3af;
    --hs-border: #374151;
    --hs-primary: #60a5fa;
    --hs-primary-hover: #3b82f6;
    --hs-danger: #f87171;
    --hs-danger-hover: #ef4444;
    --hs-success: #34d399;
    --hs-warning: #fbbf24;
    
    --hs-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  }

  :host {
    background: var(--hs-bg);
    color: var(--hs-text);
  }
`;
