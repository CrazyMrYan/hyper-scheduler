# 任务列表: 更新 DevTools UI

**功能**: `001-update-devtools-ui`
**状态**: 已完成
**Spec**: [Link](../specs/001-update-devtools-ui/spec.md)

## 实施策略
- **MVP 优先**: 首先构建基础架构和任务列表视图（User Story 1），因为它是其他功能的基础。
- **增量交付**: 列表 -> 控制 -> 详情 -> 时间轴。
- **测试驱动**: 核心状态管理逻辑（Store）和工具函数需先行编写测试。
- **零依赖**: 严格使用 Vanilla TS 和 Web Components，不引入框架。

## Phase 1: Setup & Infrastructure
**目标**: 建立项目结构，核心状态管理，以及基础样式系统。
**依赖**: 无

- [x] T001 [P] Create UI directory structure (components, store, styles) in `src/ui/`
- [x] T002 [P] Implement CSS variables and theme system in `src/ui/styles/theme.css.ts`
- [x] T003 Create `DevToolsStore` class with pub/sub logic in `src/ui/store/DevToolsStore.ts`
- [x] T004 [P] Implement SVG icons helper in `src/ui/components/icons.ts`
- [x] T005 [P] Create unit tests for `DevToolsStore` in `tests/unit/ui/DevToolsStore.test.ts`
- [x] T006 Define `TaskControlAPI` and `SchedulerIntrospectionAPI` interfaces in `src/types.ts`

## Phase 2: Foundational UI (User Story 1)
**目标**: 实现主面板容器，头部，以及只读的任务列表视图。
**依赖**: Phase 1
**Story**: [US1] 查看任务概览与状态

- [x] T007 [P] [US1] Implement `FloatingTrigger` component in `src/ui/components/FloatingTrigger.ts`
- [x] T008 [P] [US1] Implement `DevTools` container component (Shadow DOM root) in `src/ui/components/DevTools.ts`
- [x] T009 [P] [US1] Implement `TaskHeader` component with FPS meter in `src/ui/components/TaskHeader.ts`
- [x] T010 [US1] Implement `TaskList` component (table structure) in `src/ui/components/TaskList.ts`
- [x] T011 [US1] Integrate `DevToolsStore` with Scheduler events (introspection) in `src/ui/components/DevTools.ts`
- [x] T012 [US1] Implement data binding to render tasks in `TaskList` in `src/ui/components/TaskList.ts`

## Phase 3: Task Controls (User Story 2)
**目标**: 添加交互功能，允许用户控制任务状态。
**依赖**: Phase 2
**Story**: [US2] 手动控制任务执行

- [x] T013 [P] [US2] Add action buttons (Trigger, Pause/Resume, Remove) to `TaskList` in `src/ui/components/TaskList.ts`
- [x] T014 [US2] Implement `trigger`, `pause`, `resume`, `remove` methods in `DevToolsStore` in `src/ui/store/DevToolsStore.ts`
- [x] T015 [US2] Connect UI buttons to Store actions using event delegation in `src/ui/components/TaskList.ts`
- [x] T016 [US2] Implement visual feedback for status changes (e.g. loading state) in `src/ui/components/TaskList.ts`

## Phase 4: Task Details & History (User Story 3)
**目标**: 实现详情侧边栏/弹窗，展示配置和历史记录。
**依赖**: Phase 2
**Story**: [US3] 分析任务详细历史与性能

- [x] T017 [P] [US3] Implement `TaskDetail` component (overlay/panel) in `src/ui/components/TaskDetail.ts`
- [x] T018 [US3] Update `DevToolsStore` to track `ExecutionLog` history (max 50) in `src/ui/store/DevToolsStore.ts`
- [x] T019 [US3] Connect `TaskList` row click to open `TaskDetail` in `src/ui/components/DevTools.ts`
- [x] T020 [US3] Render task configuration and history table in `TaskDetail` in `src/ui/components/TaskDetail.ts`

## Phase 5: Timeline Visualization (User Story 4)
**目标**: 实现时间轴视图。
**依赖**: Phase 2
**Story**: [US4] 可视化任务时间轴

- [x] T021 [P] [US4] Implement `Timeline` component using SVG in `src/ui/components/Timeline.ts`
- [x] T022 [US4] Implement logic to map execution logs to time ranges in `src/ui/components/Timeline.ts`
- [x] T023 [US4] Add Tab navigation (Tasks vs Timeline) in `src/ui/components/TaskHeader.ts`
- [x] T024 [US4] Integrate `Timeline` component into main `DevTools` view in `src/ui/components/DevTools.ts`

## Phase 6: Integration & Polish
**目标**: 集成到主入口，优化样式和打包。
**依赖**: Phase 5

- [x] T025 Export `attachDevTools` function in `src/index.ts`
- [x] T026 [P] Polish CSS styles (spacing, colors, dark mode consistency) in `src/ui/styles/main.css.ts`
- [x] T027 Verify Shadow DOM isolation (ensure external styles don't bleed in) manually
- [x] T028 Run build and check bundle size impact

## Dependencies

1.  **Setup & Infrastructure** (T001-T006) -> **Foundational UI**
2.  **Foundational UI** (T007-T012) -> **Task Controls**, **Task Details**, **Timeline**
3.  **Task Controls** (T013-T016) -> Integration
4.  **Task Details** (T017-T020) -> Integration
5.  **Timeline** (T021-T024) -> Integration

## Parallel Execution Opportunities

- **Phase 1**: Icons (T004), Styles (T002), and Tests (T005) can be done in parallel with Store implementation.
- **Phase 2**: `FloatingTrigger` (T007), `TaskHeader` (T009), and `TaskList` (T010) are distinct components that can be scaffolded in parallel.
- **Phase 3/4/5**: Once Phase 2 is complete, Control, Detail, and Timeline features are largely independent and can be worked on simultaneously.