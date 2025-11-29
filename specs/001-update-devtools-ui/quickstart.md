# 快速开始: 运行 DevTools

**功能分支**: `001-update-devtools-ui`

## 先决条件

*   Node.js 18+
*   npm 或 yarn

## 设置开发环境

1.  **安装依赖**:
    ```bash
    npm install
    ```

2.  **启动演示应用 (UI 开发)**:
    由于 DevTools 是 UI 组件，我们使用 `examples/browser` 或 `examples/react-demo` 进行调试。
    
    ```bash
    # 启动 Vite 开发服务器
    npm run dev:browser
    # 或者
    npm run dev:react
    ```
    这将启动一个包含 `HyperScheduler` 和 DevTools 的示例页面。

## 验证 DevTools

1.  打开浏览器访问 `http://localhost:5173` (端口可能不同)。
2.  你应该在屏幕右下角看到一个浮动的 **[HS]** (或类似图标) 按钮。
3.  **打开面板**: 点击悬浮按钮。
4.  **检查任务**: 确认面板中列出了示例代码中定义的任务。
5.  **交互测试**:
    *   点击 "Trigger" 按钮，观察 "Execution Count" 是否增加。
    *   点击 "Pause"，确认状态变为 "Paused"。
    *   点击 "Timeline" 标签，查看是否有时间条生成。
6.  **主题测试**: 点击顶部的 🔆/🌙 按钮切换主题。

## 独立组件开发 (Storybook-like experience)

虽然本项目没有 Storybook，但可以通过修改 `examples/browser/index.html` 直接测试 DevTools 组件。

在控制台手动调用：
```javascript
// 假设 scheduler 已暴露在 window
window.scheduler.attachDevTools({ theme: 'dark' });
```
