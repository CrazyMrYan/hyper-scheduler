# 接口契约: 增强功能

**功能分支**: `006-enhance-devtools-features`

## DevToolsStore API

### 新增方法

```typescript
// src/ui/store/DevToolsStore.ts

export class DevToolsStore {
  // ... existing methods
  
  /**
   * 切换语言
   */
  setLanguage(lang: 'en' | 'zh'): void;

  /**
   * 更新面板尺寸
   */
  setPanelSize(size: { width?: number, height?: number }): void;
}
```

## Component Events

### TaskHeader

*   **Event**: `lang-change`
*   **Detail**: `'en' | 'zh'`
*   **Description**: 语言切换事件（可能集成在设置菜单中）。

### DevTools (Container)

*   **Behavior**: 监听拖拽手柄事件，调用 `setPanelSize` 更新 CSS 变量。

## I18n Helper

```typescript
// src/ui/i18n/index.ts

export function t(key: string, params?: Record<string, any>): string;
```
