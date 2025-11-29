# 数据模型: 增强 DevTools

**功能分支**: `006-enhance-devtools-features`

## 更新实体

### DevToolsState (Store)
新增 `language` 和 `panelSize` 字段。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `language` | `'en' \| 'zh'` | **[NEW]** 当前界面语言 |
| `panelSize` | `{ width: number, height: number }` | **[NEW]** 面板尺寸（持久化） |
| ... | ... | (现有字段: isOpen, theme, dockPosition 等) |

### I18nSchema
定义翻译字典的结构。

```typescript
interface Translation {
  header: {
    title: string;
    searchPlaceholder: string;
  };
  tabs: {
    tasks: string;
    timeline: string;
  };
  status: {
    active: string;
    total: string;
    idle: string;
    running: string;
    paused: string;
    stopped: string;
  };
  actions: {
    trigger: string;
    pause: string;
    resume: string;
    remove: string;
  };
  // ... details, timeline etc.
}
```

## 样式变量 (CSS Variables)
新增用于拖拽的变量：
*   `--hs-panel-width`: 动态控制宽度
*   `--hs-panel-height`: 动态控制高度

## 验证规则
*   **Resizing**: 宽度限制 `min: 300px`, `max: 90vw`；高度限制 `min: 200px`, `max: 90vh`。
