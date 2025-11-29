# 任务列表: 增强与修复 DevTools 功能

**功能**: `006-enhance-devtools-features`
**状态**: 已完成
**Spec**: [Link](../specs/006-enhance-devtools-features/spec.md)

## 实施策略
- **Phase 1 (High Priority)**: Fix critical bugs (Theme, Timeline, Sync) first to restore usability.
- **Phase 2 (Enhancement)**: Implement new features (Resizing, I18n, Time Format) to improve DX.
- **Testing**: Manual verification with `examples/browser` after each major component change.

## Phase 1: Core Fixes (Theme, Timeline, Sync)
**目标**: 修复样式穿透、Timeline 渲染和状态同步问题。
**依赖**: 无

- [x] T001 [P] [US1] Refactor `theme.css.ts` to ensure CSS variables are correctly defined on `:host` and inherited in `src/ui/styles/theme.css.ts`
- [x] T002 [P] [US1] Verify and fix theme propagation in all components (DevTools, TaskList, TaskDetail, Timeline) in `src/ui/components/`
- [x] T003 [US2] Fix `Timeline.ts` Canvas rendering logic: handle initial size (0x0), add ResizeObserver, and ensure `data` setter triggers redraw in `src/ui/components/Timeline.ts`
- [x] T004 [US2] Fix `drawTimeAxis` and `drawTaskRow` coordinate calculations in `src/ui/components/Timeline.ts`
- [x] T005 [US3] Debug and fix `DevToolsStore` state updates for `pause/resume` actions. Ensure Scheduler events are correctly mapped to store updates in `src/ui/store/DevToolsStore.ts`
- [x] T006 [US3] Verify `TaskControlAPI` methods in `src/core/Scheduler.ts` correctly change task status and emit events (check if `notify` is called).

## Phase 2: UI Enhancements (Format, Resize, I18n)
**目标**: 提升信息密度和操作灵活性。
**依赖**: Phase 1

- [x] T007 [US4] Update `TaskList.ts` and `TaskDetail.ts` to format timestamps with milliseconds (e.g. `HH:mm:ss.SSS`) in `src/ui/components/`
- [x] T008 [US6] Create `src/ui/i18n/` directory and implement `en.ts`, `zh.ts` and `index.ts` (simple `t` function)
- [x] T009 [US6] Integrate I18n into `DevToolsStore` (add `language` state) and update all UI text strings to use `t()` in `src/ui/components/`
- [x] T010 [US5] Implement `Resizer` logic in `DevTools.ts`. Add mouse event listeners for dragging and update `panelSize` state/style
- [x] T011 [US5] Add `panelSize` to `DevToolsStore` and persist to `localStorage` (optional but good for DX) in `src/ui/store/DevToolsStore.ts`
- [x] T012 [US5] Update CSS in `DevTools.ts` to apply dynamic width/height based on `panelSize` and `dockPosition`

## Phase 3: Verification & Polish
**目标**: 确保所有功能正常工作，无回归。
**依赖**: Phase 2

- [x] T013 Verify Dark Mode works 100% (no white flashes)
- [x] T014 Verify Timeline renders correctly on load and resize
- [x] T015 Verify Dragging works for both Right and Bottom dock positions
- [x] T016 Verify Language switching works (if UI toggle added, or via config)

## Dependencies

1.  **Phase 1** -> **Phase 2**
2.  **I18n infrastructure (T008)** -> **UI text updates (T009)**

## Parallel Execution Opportunities

- **Theme Fixes (T001, T002)** and **Timeline Fixes (T003, T004)** are independent.
- **I18n (T008)** can be implemented in parallel with other tasks.