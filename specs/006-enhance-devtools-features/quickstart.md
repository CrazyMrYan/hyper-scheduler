# 快速开始: 验证增强功能

**功能分支**: `006-enhance-devtools-features`

## 验证步骤

1.  **启动示例**:
    ```bash
    npm run dev:browser
    ```

2.  **验证时间线修复**:
    *   打开 DevTools，切换到 Timeline。
    *   确认即便初始加载时面板关闭，打开后也能看到内容（ResizeObserver 生效）。
    *   确认缩放滑块可用。

3.  **验证状态同步**:
    *   点击列表中的“暂停”按钮，确认 UI 状态更新为 Paused。
    *   点击“恢复”，确认状态更新为 Running。
    *   在控制台调用 `scheduler.stopTask(id)`，确认 UI 更新。

4.  **验证拖拽调整**:
    *   在右侧停靠模式下，鼠标移动到面板左边缘，光标应变为 `col-resize`。
    *   拖拽，确认面板变宽/变窄。
    *   切换到底部停靠，鼠标移动到上边缘，光标应变为 `row-resize`。
    *   拖拽，确认面板变高/变矮。

5.  **验证国际化**:
    *   （假设在设置或代码中切换语言为中文 `scheduler.attachDevTools({ lang: 'zh' })`）
    *   刷新页面，确认 "Tasks" 变为 "任务列表"，"Status" 变为 "状态"。

6.  **验证时间格式**:
    *   点击任务详情，确认 "Last Run" 时间精确到秒（如 `12:30:45.123`）。
