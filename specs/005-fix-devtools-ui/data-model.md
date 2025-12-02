# 数据模型: DevTools UI (Update)

**功能分支**: `005-fix-devtools-ui`

## 更新实体

### DevToolsState (Store)
新增 `dockPosition` 字段。

| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| `isOpen` | `boolean` | 面板是否展开 |
| `activeTab` | `'tasks' \| 'timeline'` | 当前激活的标签页 |
| `theme` | `'light' \| 'dark' \| 'auto'` | 当前主题 |
| `dockPosition` | `'right' \| 'bottom'` | **[NEW]** 面板停靠位置 |
| `filterText` | `string` | 任务列表搜索过滤词 |
| `selectedTaskId` | `string \| null` | 当前选中的任务 ID (详情视图) |
| `tasks` | `Map<string, TaskSnapshot>` | 所有任务的最新快照 |
| `history` | `Map<string, ExecutionLog[]>` | 任务执行历史 (Key: TaskID) |
| `fps` | `number` | 当前主线程 FPS |

## 样式变量 (CSS Variables)
需要确保以下变量在 `theme.css.ts` 中定义并生效：

*   `--hs-font-mono`: 等宽字体栈
*   `--hs-dock-width`: 右侧停靠时的宽度 (默认 400px)
*   `--hs-dock-height`: 底部停靠时的高度 (默认 300px)

## 验证规则

*   **Docking**: 切换 `dockPosition` 时，`isOpen` 状态应保持不变。
