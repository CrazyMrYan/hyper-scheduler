# 任务列表: 文档增强与本地化

**功能**: 003-enhance-documentation
**状态**: 计划中

## 阶段 1: API 增强与核心逻辑重构
**目标**: 支持间隔字符串解析，更新调度核心逻辑，确保向后兼容。
**测试**: 单元测试覆盖新的解析逻辑。

- [X] T001 [P] [US1] 创建 `src/utils/schedule.ts`，实现 `parseSchedule` 函数 (正则解析 Interval)
- [X] T002 [P] [US1] 更新 `src/utils/schedule.ts`，实现 `getNextRun` 函数 (统一 Cron 和 Interval 计算)
- [X] T003 [US1] 更新 `src/types.ts` 中的 `TaskDefinition` 注释，反映新的 `schedule` 支持格式
- [X] T004 [US1] 重构 `src/core/Scheduler.ts`，使用新的 `schedule.ts` 工具替换原有的 `cron.ts` 直接调用
- [X] T005 [US1] 编写 `tests/unit/schedule.test.ts`，测试 `parseSchedule` 和 `getNextRun` 的各种输入 (Cron vs Interval)
- [X] T006 [US1] 更新 `tests/unit/Scheduler.test.ts`，添加使用间隔字符串创建任务的测试用例

## 阶段 2: 文档站点搭建 (VitePress)
**目标**: 搭建多版本支持的中文文档站点。
**测试**: 手动验证站点构建和页面导航。

- [X] T007 [US1] 在项目根目录安装 `vitepress` 并初始化 `docs/` 目录
- [X] T008 [US1] 配置 `docs/.vitepress/config.ts`，设置中文语言、标题和多版本导航结构 (nav/sidebar)
- [X] T009 [P] [US1] 创建 `docs/index.md` (首页)，包含特性介绍和快速开始链接
- [X] T010 [P] [US1] 创建 `docs/guide/getting-started.md`，编写中文“快速开始”指南 (参考 quickstart.md)
- [X] T011 [P] [US1] 创建 `docs/guide/core-concepts.md`，解释 Cron、Interval、Retry 等核心概念
- [X] T012 [P] [US1] 创建 `docs/api/scheduler.md`，详细记录 `Scheduler` 和 `Task` 的 API (中文)
- [X] T013 [US1] 配置 `package.json` 添加 `docs:dev` 和 `docs:build` 脚本

## 阶段 3: 示例项目完善
**目标**: 提供可直接运行的示例，覆盖所有目标环境。
**测试**: 运行各示例项目的启动命令。

- [X] T014 [P] [US2] 更新 `examples/node/simple.js`，添加中文注释和 Interval 用法演示
- [X] T015 [P] [US2] 更新 `examples/browser/index.html`，优化 UI 说明，添加 Interval 演示
- [X] T016 [P] [US2] 完善 `examples/vue-demo/`，确保其为一个完整的 Vite+Vue 项目 (添加 package.json, vite.config.ts)
- [X] T017 [P] [US2] 完善 `examples/react-demo/`，确保其为一个完整的 Vite+React 项目 (添加 package.json, vite.config.ts)
- [X] T018 [US2] 在根目录 `package.json` 添加快捷脚本 `example:node`, `example:browser`, `example:vue`, `example:react`

## 阶段 4: 源码注释本地化
**目标**: 将核心源码的 JSDoc 翻译为中文。

- [X] T019 [P] [US3] 翻译 `src/core/Scheduler.ts` 中的 JSDoc 注释
- [X] T020 [P] [US3] 翻译 `src/core/TaskRegistry.ts` 和 `src/core/RetryStrategy.ts` 中的 JSDoc 注释
- [X] T021 [P] [US3] 翻译 `src/platform/` 下各文件的 JSDoc 注释
- [X] T022 [P] [US3] 翻译 `src/utils/` 下各文件的 JSDoc 注释
- [X] T023 [P] [US3] 翻译 `src/index.ts` 和 `src/types.ts` 中的导出注释

## 阶段 5: 验证与发布准备
**目标**: 确保所有更改无误，文档与代码一致。

- [ ] T024 运行全量测试 `npm run test`，确保核心逻辑重构未破坏现有功能
- [ ] T025 运行所有示例脚本，验证示例项目的可运行性
- [ ] T026 运行 `npm run docs:build`，检查文档站点构建产物
- [ ] T027 检查 `README.md`，更新为中文介绍并指向新的文档站点

## 依赖关系
- 阶段 1 (API 增强) 必须在 阶段 2 (文档编写) 和 阶段 3 (示例完善) 之前完成，因为文档和示例依赖新的 API。
- 阶段 4 (注释本地化) 可以与其他阶段并行进行。

## 实现策略
1. **优先核心**: 先完成 `schedule` 的解析逻辑更新，这是本次功能增强的基础。
2. **文档跟进**: 核心逻辑稳定后，立即编写对应的 API 文档。
3. **示例验证**: 最后通过示例项目验证 API 和文档的正确性。
