# 研究报告: 增强与修复 DevTools 功能

**状态**: 最终
**功能分支**: `006-enhance-devtools-features`

## 决策记录

### 1. 样式修复 (Shadow DOM 穿透)
*   **决策**: 使用 CSS Variables (Custom Properties) 定义全局主题，并在 Shadow DOM 内部显式继承。
*   **理由**: Shadow DOM 默认隔离样式，外部 CSS 无法影响内部。CSS 变量是唯一能穿透 Shadow DOM 的标准机制。需要确保 `theme.css.ts` 定义的变量能够覆盖到所有深层嵌套的组件。

### 2. Timeline 重构
*   **决策**: 彻底检查 Canvas 渲染逻辑。
*   **理由**: 
    *   Canvas 在 `requestAnimationFrame` 中可能因为尺寸计算为 0 而不绘制（如组件初始隐藏时）。
    *   需增加 `ResizeObserver` 监听容器大小变化，动态调整 Canvas 分辨率。
    *   需确保 `history` 数据正确传递并触发重绘。

### 3. 拖拽调整大小 (Resizing)
*   **决策**: 实现一个通用的 `Resizer` 组件或逻辑，监听 `mousedown`, `mousemove`, `mouseup` 事件。
*   **实现细节**:
    *   右侧停靠时：监听左边缘，修改 `width`，方向取反（鼠标左移 -> 宽度增加）。
    *   底部停靠时：监听上边缘，修改 `height`，方向取反（鼠标上移 -> 高度增加）。
    *   存储：使用 `localStorage` 持久化面板尺寸。

### 4. 轻量级国际化 (i18n)
*   **决策**: 采用简单的对象映射方案。
*   **实现**:
    *   创建 `src/ui/i18n/index.ts`，导出 `en` 和 `zh` 对象。
    *   创建一个 Store 或 Context 来管理 `currentLanguage`。
    *   组件内部通过 `t('key')` 函数获取文本。
    *   不引入任何第三方库，保持零依赖。

## 风险与缓解
*   **风险**: 拖拽事件在 iframe 或 Shadow DOM 边界可能失效。
*   **缓解**: 在 `document` 上监听 `mousemove` 和 `mouseup`，而不是在 Resizer 元素上，防止鼠标移出过快导致事件丢失。
