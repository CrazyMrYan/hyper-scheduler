# 研究报告: DevTools UI 修复

**状态**: 最终
**功能分支**: `005-fix-devtools-ui`

## 决策记录

### 1. Timeline 渲染修复
*   **问题**: 当前 Timeline 不显示。
*   **决策**: 检查 `hs-timeline` 组件的 `data` setter 和渲染循环。
*   **理由**: 
    *   `requestAnimationFrame` 循环可能在 `data` 设置前就已启动，或者 SVG 尺寸计算错误导致不可见。
    *   需确保 `getTasks()` 和 `getHistory()` 数据正确传递给 Timeline。
    *   修复 `logEnd` 变量未使用的警告，确保日志条的宽度计算正确。

### 2. 数据同步机制优化
*   **问题**: 外部操作 Scheduler，DevTools 无反应。
*   **决策**: 
    *   在 `DevTools.ts` 中增强事件监听。
    *   确保 `Scheduler` 触发所有必要的事件 (`task_started`, `task_completed`, `task_failed`, `task_stopped`, `task_updated`)。
    *   DevToolsStore 必须正确响应这些事件并触发 UI 重新渲染。
*   **理由**: 
    *   当前可能只监听了部分事件，或者 Scheduler 没有发出某些状态变更事件（如 `stopTask` 时是否触发了事件？）。
    *   DevToolsStore 的 `notify` 机制需要确保 `TaskList` 和 `Timeline` 都能接收到更新。

### 3. UI/Icons 样式修复
*   **问题**: 操作 Icon 显示怪异，错位或大小不一。
*   **决策**: 
    *   使用 Flexbox 严格控制 `.btn-icon` 内的 SVG 对齐。
    *   设置显式的 `width` 和 `height` 给 SVG 元素，防止被父容器拉伸。
    *   检查 SVG `viewBox` 和 `path` 是否正确。
*   **理由**: Web Components 的 Shadow DOM 样式隔离有时会导致外部 Reset CSS 失效，需要内部明确指定样式。

### 4. 主题切换与字体
*   **问题**: 主题颜色未生效，字体不是等宽。
*   **决策**: 
    *   确保 `theme.css.ts` 中的 CSS 变量正确注入到所有组件的 Shadow Root 中。
    *   在 `theme.css.ts` 中为代码相关元素 (`.task-id`, `pre`) 显式设置 `font-family: monospace`。
    *   检查 `DevTools` 容器上的 `theme` 属性是否正确向下传递或通过 CSS 变量继承。

### 5. 停靠位置 (Docking)
*   **问题**: 新增支持底部停靠。
*   **决策**: 
    *   在 `DevToolsStore` 添加 `dockPosition` 状态。
    *   在 `TaskHeader` 添加切换按钮。
    *   在 `DevTools.ts` 中根据 `dockPosition` 动态修改 `.panel` 的 CSS 类 (`dock-right` vs `dock-bottom`)。
*   **理由**: 这是一个纯 CSS 布局变更，通过状态驱动 class 切换是最简单的实现方式。

## 风险与缓解
*   **风险**: 频繁的 DOM 更新（数据同步）可能导致性能问题。
*   **缓解**: 
    *   Timeline 已经使用了 `requestAnimationFrame`。
    *   TaskList 可以考虑只更新变化的行（MVP 暂不优化，但需关注）。
