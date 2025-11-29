# 任务列表: 修复 DevTools UI 问题

**功能**: `005-fix-devtools-ui`
**状态**: 已完成
**Spec**: [Link](../specs/005-fix-devtools-ui/spec.md)

## 实施策略
- **优先级顺序**: 按照用户故事优先级 (P1 -> P3) 进行修复。Timeline 和数据同步是最高优先级，因为它们影响核心可用性。
- **并行执行**: 样式/图标修复可以与逻辑修复并行进行。
- **测试验证**: 每个阶段完成后，需通过 `examples/browser` 进行手动验证。

## Phase 1: Setup & Prerequisites
**目标**: 确保开发环境就绪，理解现有代码结构。
**依赖**: 无

- [x] T001 Read and understand existing DevTools implementation in `src/ui/`
- [x] T002 Verify current broken state using `npm run dev:browser`

## Phase 2: Core Fixes (User Story 1 & 2) - Timeline & Sync
**目标**: 修复 Timeline 渲染和数据同步问题。
**依赖**: Phase 1
**Story**: [US1] 正确显示时间轴与时间线, [US2] 实时同步调度器状态

- [x] T003 [US1] Fix Timeline data binding and rendering loop in `src/ui/components/Timeline.ts`
- [x] T004 [US1] Ensure `requestAnimationFrame` loop correctly updates the time indicator in `src/ui/components/Timeline.ts`
- [x] T005 [US2] Add event listeners for `task_stopped`, `task_started`, `task_completed`, `task_failed` in `src/ui/components/DevTools.ts`
- [x] T006 [US2] Update `DevToolsStore` to handle granular task updates efficiently in `src/ui/store/DevToolsStore.ts`
- [x] T007 [US2] Ensure `Scheduler` emits necessary events (verify core logic if needed) in `src/core/Scheduler.ts`

## Phase 3: UI Polish (User Story 3 & 4) - Icons & Theme
**目标**: 修复图标显示错位、按钮逻辑和主题样式。
**依赖**: Phase 1
**Story**: [US3] 优化任务列表操作与图标显示, [US4] 修复主题切换与字体样式

- [x] T008 [P] [US3] Fix CSS for action buttons to ensure alignment and correct sizing in `src/ui/components/TaskList.ts`
- [x] T009 [P] [US3] Implement logic to toggle Pause/Resume button based on task status in `src/ui/components/TaskList.ts`
- [x] T010 [P] [US4] Define missing CSS variables for font-family (monospace) and colors in `src/ui/styles/theme.css.ts`
- [x] T011 [P] [US4] Ensure theme class/attribute is correctly propagated to all Shadow Roots in `src/ui/components/DevTools.ts`

## Phase 4: New Feature (User Story 5) - Docking
**目标**: 实现面板停靠位置切换。
**依赖**: Phase 2, Phase 3
**Story**: [US5] 支持面板停靠位置切换

- [x] T012 [US5] Add `dockPosition` state to `DevToolsState` in `src/ui/store/DevToolsStore.ts`
- [x] T013 [US5] Add docking toggle button icon to `src/ui/components/icons.ts`
- [x] T014 [US5] Add toggle button to header and handle click event in `src/ui/components/TaskHeader.ts`
- [x] T015 [US5] Implement CSS classes for `dock-right` and `dock-bottom` in `src/ui/components/DevTools.ts`
- [x] T016 [US5] Bind `dockPosition` state to CSS class application in `src/ui/components/DevTools.ts`

## Phase 5: Final Polish & Verification
**目标**: 全面测试并优化。
**依赖**: Phase 4

- [x] T017 Verify Timeline performance with multiple tasks
- [x] T018 Verify Docking transition smoothness
- [x] T019 Run build and check bundle size

## Dependencies

1.  **Core Fixes** (T003-T007) -> **Docking** (T012-T016)
2.  **UI Polish** (T008-T011) -> **Docking** (T012-T016)

## Parallel Execution Opportunities

- **Phase 2 (Logic)** and **Phase 3 (Styles)** are largely independent and can be executed in parallel.
- **Icons (T013)** can be added anytime before **T014**.
