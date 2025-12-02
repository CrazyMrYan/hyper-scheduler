# 任务列表: 全局任务调度 JS 库

**功能**: 002-global-task-scheduler
**状态**: 计划中

## 阶段 1: 环境搭建 (初始化)
- [X] T001 在项目根目录初始化 npm 项目 (`npm init -y`) 和 git 仓库
- [X] T002 安装核心依赖 (`cron-parser`) 和开发依赖 (`typescript`, `vite`, `vitest`, `eslint`, `@types/node`)
- [X] T003 创建并配置 `tsconfig.json` (启用严格模式, 目标 ES2020)
- [X] T004 创建 `vite.config.ts` 配置为库模式 (输出 ESM/CJS/UMD)
- [X] T005 创建 `vitest.config.ts` 用于单元和集成测试配置
- [X] T006 设置项目文件夹结构 (`src/core`, `src/platform`, `src/ui`, `src/utils`, `tests`)

## 阶段 2: 基础架构 (核心前置条件)
- [X] T007 在 `src/types.ts` 中定义核心接口 (`Task`, `SchedulerConfig`, `TaskStatus`, `ExecutionRecord`)
- [X] T008 [P] 实现 `src/utils/id.ts` 用于校验唯一 ID (字符串非空检查)
- [X] T009 [P] 实现 `src/utils/cron.ts` 封装 `cron-parser` 以计算下次运行时间
- [X] T010 创建 `src/platform/TimerStrategy.ts` 接口，定义 `setTimeout`/`setInterval` 的统一抽象

## 阶段 3: 用户故事 1 & 2 - 核心调度与开发者使用
**目标**: 开发者可以安装库，创建具有唯一 ID 的任务，并通过可靠的计时器 (Web Workers/Node) 运行它们。
**测试**: CRUD 的单元测试，计时器准确性的集成测试。

- [X] T011 [P] [US1] 实现 `src/platform/node/NodeTimer.ts` 使用原生 `setTimeout` 实现 `TimerStrategy`
- [X] T012 [P] [US1] 创建 `src/platform/browser/worker.ts` 用于后台计时循环 (Web Worker 源码)
- [X] T013 [US1] 实现 `src/platform/browser/BrowserTimer.ts` 负责实例化 Worker 并与之通信
- [X] T014 [US2] 实现 `src/core/TaskRegistry.ts` 用于存储任务 (`Map<string, Task>`) 并处理 ID 冲突
- [X] T015 [US2] 实现 `src/core/RetryStrategy.ts` (指数退避算法: `initialDelay * factor ^ attempts`)
- [X] T016 [US2] 实现 `src/core/Scheduler.ts` 类框架及 `createTask`, `deleteTask` 方法
- [X] T017 [US2] 实现 `src/core/Scheduler.ts` 的 `start`, `stop`, `startTask`, `stopTask` 逻辑
- [X] T018 [US2] 集成 `RetryStrategy` 到任务执行流程 (在 `try-catch` 块中处理失败)
- [X] T019 [US1] 创建 `src/index.ts` 导出 `Scheduler` 类和类型定义，并根据环境自动选择 `TimerStrategy`
- [X] T020 [P] [US2] 编写 `tests/unit/Scheduler.test.ts` 测试 CRUD 和状态管理
- [X] T021 [P] [US2] 编写 `tests/unit/RetryStrategy.test.ts` 测试退避计算
- [X] T022 [P] [US1] 验证构建产物: 运行 `npm run build` 并检查 `dist/` 目录输出 (ESM, CJS, UMD)

## 阶段 4: 用户故事 3 - 调试与可观察性
**目标**: 开发者可以通过 UI 面板 (浏览器) 或 CLI 输出 (Node) 可视化任务。
**测试**: UI 的目视检查，控制台输出检查。

- [X] T023 [P] [US3] 实现 `src/ui/styles.ts` (将 CSS 作为字符串常量导出，避免外部 CSS 依赖)
- [X] T024 [P] [US3] 实现 `src/ui/DebugPanel.ts` (使用原生 Web Components 或 DOM API 创建浮动面板)
- [X] T025 [P] [US3] 实现 `src/platform/node/DebugCLI.ts` (使用 `console.table` 或结构化日志输出任务状态)
- [X] T026 [US3] 更新 `src/core/Scheduler.ts` 添加 `debug` 模式开关和事件通知机制 (内部 EventBus)
- [X] T027 [US3] 在 `src/platform/browser/BrowserTimer.ts` 或 `index.ts` 中集成调试面板的自动挂载逻辑
- [X] T028 [US3] 编写 `tests/integration/Debug.test.ts` 验证调试模式开启时是否有输出/DOM元素

## 阶段 5: 文档与示例 (FR-007, FR-008)
**目标**: 提供所有目标环境的全面文档和可运行示例。

- [X] T029 [P] [US1] 创建 `examples/node/simple.js` 演示 Node.js 下的基本用法
- [X] T030 [P] [US1] 创建 `examples/browser/index.html` 演示 UMD 引入和 Web Worker 效果
- [X] T031 [P] [US1] 创建 `examples/vue-demo/` (最小化 Vue 项目) 演示组件内集成
- [X] T032 [P] [US1] 创建 `examples/react-demo/` (最小化 React 项目) 演示 Hooks 集成
- [X] T033 [US1] 初始化 `docs/` 目录 (VitePress) 并配置基本主题
- [X] T034 [US1] 编写 `docs/guide/getting-started.md` (安装与快速上手)
- [X] T035 [US1] 编写 `docs/api/scheduler.md` (API 详细参考)
- [X] T036 [US1] 更新根目录 `README.md` 包含安装徽章、简介和指向文档网站的链接

## 阶段 6: 优化与完善
- [X] T037 [P] 检查 Tree-Shaking: 确保未开启 `debug` 时 UI 代码不被打包进最终应用
- [X] T038 [P] 检查包体积: 使用 `visualizer` 插件确认 gzip 后大小 < 10KB
- [X] T039 运行全量测试 `npm run test` 并生成覆盖率报告 (确保 > 90%)
- [X] T040 执行 `npm run lint` 并修复所有代码风格问题

## 依赖关系
- 阶段 2 (基础架构) 必须在 阶段 3 (核心功能) 之前完成。
- 阶段 3 (核心功能) 完成后，US1 (安装/运行) 和 US2 (管理任务) 即达成 MVP。
- 阶段 4 (调试) 依赖于 阶段 3 的调度器核心逻辑。
- 阶段 5 (文档) 应在 API 稳定后 (阶段 3 & 4) 进行，但示例代码可并行编写。

## 实现策略
1. **MVP (最小可行性产品)**: 完成阶段 1, 2, 3。此时库可用于 Node 和 浏览器，具备核心调度能力和 Web Worker 计时。
2. **增强版**: 完成阶段 4。增加调试面板，解决"看不见任务状态"的痛点。
3. **发布版**: 完成阶段 5, 6。完善文档，优化体积，确保质量，准备发布 npm。
