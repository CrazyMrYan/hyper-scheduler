# 接口契约: DevTools Updates

**功能分支**: `005-fix-devtools-ui`

## DevToolsStore API

### 新增方法

```typescript
// src/ui/store/DevToolsStore.ts

export class DevToolsStore {
  // ... existing methods
  
  /**
   * 切换面板停靠位置
   * @param position 'right' | 'bottom'
   */
  setDockPosition(position: 'right' | 'bottom'): void;
}
```

## Component Events

### TaskHeader

*   **Event**: `dock-change`
*   **Detail**: `'right' | 'bottom'`
*   **Description**: 当用户点击停靠切换按钮时触发。

### DevTools (Container)

*   **Behavior**: 监听 `dock-change`，更新 Store，并应用对应的 CSS 类。

## Scheduler Events (Review)

确保 Scheduler 触发以下事件（无需修改接口，只需确认实现）：

*   `task_stopped`: 当调用 `scheduler.stopTask()` 时触发。
*   `task_started`: 当任务开始执行时触发。
*   `task_completed`: 当任务执行成功时触发。
*   `task_failed`: 当任务执行失败时触发。
*   `task_updated`: 当任务配置更新或状态变更（非执行）时触发。
