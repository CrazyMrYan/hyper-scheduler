# 研究报告: DevTools UI 更新

**状态**: 最终
**功能分支**: `001-update-devtools-ui`

## 决策记录

### 1. UI 框架与依赖
*   **决策**: 使用 **Vanilla TypeScript + Web Components (Custom Elements) + Shadow DOM**。不引入 React、Vue 或 Lit 等框架。
*   **理由**:
    *   **轻量级 (NFR-002)**: DevTools 作为一个辅助工具，不应显著增加宿主应用的打包体积。Vanilla WC 开销为零。
    *   **样式隔离 (FR-009)**: Shadow DOM 提供了原生的样式隔离，防止宿主应用的全局 CSS (如 Bootstrap, Tailwind reset) 破坏 DevTools 的布局。
    *   **简单性**: 需求明确指出“要越简单越好”。对于一个包含列表、详情和时间轴的单一面板，原生 API 足够且易于维护。
*   **考虑的替代方案**:
    *   *Lit*: 只有 5KB，但为了极致的“零依赖”和学习目的，且考虑到功能范围有限，原生 API 更加直接。如果 UI 变得极其复杂，可以重新考虑。
    *   *Preact*: 需要处理合成事件和 Shadow DOM 的兼容性，增加了不必要的复杂性。

### 2. 状态管理
*   **决策**: 自定义 **SimpleStore** 类，基于发布/订阅模式。
*   **理由**:
    *   UI 需要响应数据变化（任务状态更新、触发、添加/删除）。
    *   Redux/MobX 太重。
    *   Proxy 模式虽然强大，但对于简单的键值更新和列表变更，一个简单的 `subscribe(key, callback)` 足以满足需求，且代码量极少（<100 行）。
*   **替代方案**:
    *   *Observable (RxJS)*: 太重。
    *   *CustomEvent*: DOM 事件可以用于组件间通信，但对于跨组件共享状态（如全局任务列表），中心化的 Store 更易于管理。

### 3. 时间轴可视化 (Timeline)
*   **决策**: 使用 **SVG**。
*   **理由**:
    *   **交互性**: SVG 元素是 DOM 节点，支持 CSS 样式和原生事件（hover, click），易于实现 tooltip 和交互。
    *   **性能**: 对于 SC-002 提到的 1000 个任务记录，如果每一帧都重绘（Canvas），可能会占用主线程。SVG 只有在数据变更时更新 DOM，且可以通过 CSS transform 进行高效的缩放/平移。
    *   **清晰度**: 矢量图形在任何分辨率下都清晰。
*   **替代方案**:
    *   *Canvas*: 适合成千上万个对象的实时渲染，但事件处理麻烦，且难以通过 CSS 控制样式。
    *   *HTML Divs*: 大量 DOM 节点可能导致布局抖动，且绘制精确的时间条不如 SVG 方便。

### 4. FPS 监控
*   **决策**: 使用 `requestAnimationFrame` 计算帧与帧之间的时间差 (Delta Time)。
*   **实现**:
    *   记录上一帧时间戳 `lastTime`。
    *   在 `rAF` 回调中计算 `delta = now - lastTime`。
    *   `fps = 1000 / delta`。
    *   使用简单的滑动平均窗口（如最近 20 帧）来平滑数值，避免跳动。
    *   **注意**: DevTools 自身的渲染也依赖主线程，因此这个 FPS 反映的是包括 DevTools 在内的主线程负载，符合“监控主线程”的需求。

### 5. 样式架构
*   **决策**: 使用 CSS Variables (Custom Properties) 定义主题。
*   **理由**:
    *   FR-004 要求主题切换。CSS 变量是实现运行时主题切换的标准方式。
    *   在 Shadow Host 上定义变量，内部使用 `var(--color-bg)`，切换 class 即可一键换肤。

## 风险与缓解
*   **风险**: Shadow DOM 中的事件处理可能比较棘手（`event.target` 重定向）。
*   **缓解**: 使用 `event.composedPath()` 来查找真实的触发元素（如按钮），这是 Spec 澄清中确定的方案。
