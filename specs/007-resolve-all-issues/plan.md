# 实施计划: 解决所有开放问题

**分支**: `007-resolve-all-issues` | **日期**: 2025-12-01 | **规范**: [specs/007-resolve-all-issues/spec.md](./spec.md)
**输入**: 来自 `/specs/007-resolve-all-issues/spec.md` 的功能规范

**注意**: 此模板由 `/speckit.plan` 命令填充。有关执行工作流，请参阅 `.specify/templates/commands/plan.md`。

## 摘要

本计划旨在解决 `hyper-scheduler` 项目中的所有开放问题（Issue #8 至 #14）。这将通过一系列针对性的修复和增强来实现，包括构建系统修复、UI/UX 改进、核心调度器功能的扩展（如命名空间、立即触发）以及文档部署的修正。

## 技术背景

**语言/版本**: TypeScript 5.0+, Node.js >= 18, 浏览器环境 (ES Modules/UMD)
**主要依赖项**: `vite` (构建), `vitest` (测试), `vitepress` (文档)
**存储**: 内存 (In-memory) 任务注册表
**测试**: `vitest` (单元测试与集成测试)
**目标平台**: Node.js, 现代浏览器
**项目类型**: 库 (Library)
**性能目标**: API 调用延迟 < 10ms，UI 帧率稳定 (60fps)
**约束**: 保持零运行时依赖 (核心库)，向后兼容性
**规模/范围**: 核心库 + DevTools 插件

## 宪法检查

*门槛: 必须在阶段 0 研究之前通过。在阶段 1 设计之后重新检查。*

- **代码质量**: 
  - [x] 代码清晰、可维护且有文档记录。
  - [x] 严格遵循现有 ESLint/Prettier 规则。
- **测试标准**: 
  - [x] 所有 Bug 修复都必须包含复现测试。
  - [x] 新功能（命名空间、立即触发）必须包含单元测试。
- **用户体验一致性**: 
  - [x] DevTools 的 UI 改进（拖拽、遮罩）将保持现有的设计语言。
- **性能要求**: 
  - [x] 命名空间过滤将通过高效的索引或过滤逻辑实现，避免全量扫描导致的性能下降。

## 项目结构

### 文档 (此功能)

```text
specs/007-resolve-all-issues/
├── plan.md              # 此文件
├── research.md          # 阶段 0 输出
├── data-model.md        # 阶段 1 输出
├── quickstart.md        # 阶段 1 输出
├── contracts/           # 阶段 1 输出
└── tasks.md             # 阶段 2 输出
```

### 源代码 (仓库根目录)

```text
src/
├── core/
│   ├── scheduler.ts       # 修改: 增加命名空间支持、立即触发逻辑
│   ├── task-registry.ts   # 修改: 增加命名空间索引
│   └── ...
├── plugins/
│   └── dev-tools.ts       # 修改: 适配新的命名空间 API
├── ui/
│   ├── components/
│   │   ├── devtools.ts    # 修改: 增加遮罩层、拖拽逻辑
│   │   ├── timeline.ts    # 修改: 支持缩放步长配置
│   │   └── ...
│   └── ...
└── index.ts

tests/
├── unit/
│   ├── Scheduler.test.ts  # 新增: 命名空间、立即触发测试
│   └── ...
└── integration/           # 新增: Bug 修复验证测试
```

**结构决策**: 保持现有的单体库结构，核心逻辑在 `src/core`，UI 插件在 `src/ui` 和 `src/plugins`。

## 复杂性跟踪

> **仅当宪法检查存在必须合理化的违规时才填写**

| 违规 | 为何需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| (无) | | |