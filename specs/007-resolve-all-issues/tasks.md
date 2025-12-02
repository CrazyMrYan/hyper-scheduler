# 任务列表: Resolve All Open Issues

**功能**: `007-resolve-all-issues`
**状态**: 待办

## 阶段 1: 设置与构建修复 (Issue #9)

**目标**: 解决 Webpack 构建兼容性问题，确保项目基础稳固。

- [x] T001 [P] 修改 `vite.config.ts` 构建目标为 `es2019` 或添加转译插件以支持空值合并运算符 (`??`)。     
- [x] T002 [P] 验证构建产物 `dist/index.js` (UMD) 不再包含不兼容的语法。
## 阶段 2: 核心调度器增强

**目标**: 实现命名空间支持和立即触发功能。

### 用户故事: 命名空间管理 (Issue #8)
- [x] T003 [US1] 更新 `src/types.ts` 中的 `TaskOptions` 接口，添加 `namespace` 字段。
- [x] T004 [US1] 修改 `src/core/task-registry.ts`，实现 `namespaceIndex` (Map<Namespace, Set<TaskId>>) 并更新增删逻辑。
- [x] T005 [US1] 修改 `src/core/scheduler.ts` 的 `start` 和 `stop` 方法，支持可选的 `scope` 参数。
- [x] T006 [US1] 更新 `src/core/scheduler.ts` 的 `getTasks` 方法，支持按命名空间筛选。
- [x] T007 [US1] 为命名空间功能编写单元测试 (`tests/unit/Scheduler.test.ts`)。

### 用户故事: 立即触发任务 (Issue #10)
- [x] T008 [US2] 更新 `src/types.ts` 中的 `TaskOptions` 接口，添加 `runImmediately` 字段。
- [x] T009 [US2] 修改 `src/core/scheduler.ts`，在 `start()` 或 `createTask()` 中检查 `runImmediately` 并触发一次执行。
- [x] T010 [US2] 为立即触发功能编写单元测试。

## 阶段 3: UI/UX 改进

**目标**: 提升 DevTools 的可用性和视觉体验。

### 用户故事: DevTools 增强 (Issue #8, #11, #12, #13)                                                    

- [x] T011 [P] [US3] 更新 `src/plugins/dev-tools.ts`，将命名空间信息传递给 UI 组件。                     

- [x] T012 [P] [US3] 修改 `src/ui/components/devtools.ts`，实现全屏遮罩层逻辑 (Issue #11)。              

- [x] T013 [P] [US3] 修改 `src/ui/components/floating-trigger.ts`，实现拖拽和收起功能 (Issue #13)。      

- [x] T014 [P] [US3] 修改 `src/ui/styles/theme.css.ts` (或相应样式文件)，为帧率计数器添加等宽字体样式 (Is

sue #13)。                                                                                               

- [x] T015 [US3] 更新 `DevToolsOptions` 接口，添加 `zoomStep` 配置 (Issue #12)。                         

- [x] T016 [US3] 修改 `src/ui/components/timeline.ts`，支持 `zoomStep` 配置并优化缩放逻辑。              
- [x] T017 [US3] 在 DevTools UI 中增加按命名空间筛选/查看任务的功能。
## 阶段 4: 文档修复与收尾

**目标**: 修复部署问题并更新文档。

### 用户故事: 文档修复 (Issue #14)
- [x] T018 [US4] 检查并修复 `docs/.vitepress/config.ts` 或部署脚本，确保 Playground 链接正确指向部署路径。
- [x] T019 [US4] 更新 `README.md` 和 API 文档，说明新的 `namespace`、`runImmediately` 和 DevTools 配置。

## 依赖关系

1.  **阶段 1** 必须最先完成，以确保后续开发在稳定的构建环境中进行。
2.  **阶段 2** 为 DevTools 的新功能提供数据支持，应先于阶段 3 的部分任务（如 T011, T017）。
3.  **阶段 3** 中的 UI 改进（拖拽、样式）可与阶段 2 并行开发。
4.  **阶段 4** 最后进行，确保文档反映最新功能。

## 实施策略

- **MVP**: 优先修复构建问题 (#9) 和实现命名空间核心逻辑 (#8)，这是影响最大的部分。
- **增量交付**: UI 改进可以分批提交。
