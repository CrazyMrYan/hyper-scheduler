# 实施计划: 通过构造函数集成 DevTools

**分支**: `001-integrate-devtools-constructor` | **日期**: 2025年11月29日 | **规范**: [specs/001-integrate-devtools-constructor/spec.md](../../specs/001-integrate-devtools-constructor/spec.md)
**输入**: 来自 `/specs/001-integrate-devtools-constructor/spec.md` 的功能规范

**注意**: 此模板由 `/speckit.plan` 命令填充。有关执行工作流，请参阅 `.specify/templates/commands/plan.md`。

## 摘要

本计划旨在重构 `HyperScheduler` 的初始化方式，通过在构造函数中引入插件系统（`plugins` 数组）来集成 DevTools，从而取代并移除现有的 `attachDevTools` 方法。此举旨在支持 Tree-shaking，确保未使用的代码不会被打包，同时保持 API 的清晰和一致性。

## 技术背景

**语言/版本**: TypeScript 5.0+
**主要依赖项**: 无新增运行时依赖 (开发依赖: Vite, Vitest)
**存储**: 内存 (In-memory)
**测试**: Vitest (单元测试 & 集成测试)
**目标平台**: 浏览器 (DevTools UI), Node.js (核心调度器兼容)
**项目类型**: TypeScript 库
**性能目标**: 零运行时开销 (当未传入插件时), 支持 Tree-shaking
**约束**: 必须移除 `attachDevTools` 方法 (破坏性变更); 插件初始化失败不应阻塞调度器启动。
**规模/范围**: 核心库重构, 影响初始化逻辑

## 宪法检查

*门槛: 必须在阶段 0 研究之前通过。在阶段 1 设计之后重新检查。*

- **代码质量**: [x] 代码将遵循现有的 TypeScript 规范和 ESLint 配置。
- **测试标准**: [x] 将编写新的单元测试来验证插件系统的加载、初始化和错误处理机制。
- **用户体验一致性**: [x] DevTools 的 UI 保持不变，仅改变引入方式。
- **性能要求**: [x] 通过显式传入插件支持 Tree-shaking，满足性能优化目标。

## 项目结构

### 文档 (此功能)

```text
specs/001-integrate-devtools-constructor/
├── plan.md              # 此文件
├── research.md          # 阶段 0 输出
├── data-model.md        # 阶段 1 输出
├── quickstart.md        # 阶段 1 输出
├── contracts/           # 阶段 1 输出 (不适用, 内部 API 变更)
└── tasks.md             # 阶段 2 输出
```

### 源代码 (仓库根目录)

```text
src/
├── index.ts              # 入口文件更新
├── types.ts              # 类型定义更新 (Plugin 接口)
├── core/
│   └── Scheduler.ts      # 核心逻辑更新 (构造函数, 插件加载)
└── ui/
    └── components/
        └── DevTools.ts   # 适配插件接口
```

**结构决策**: 保持现有的单体源码结构，在 `src/types.ts` 中扩展定义，修改 `src/core/Scheduler.ts` 实现插件逻辑。

## 复杂性跟踪

> **仅当宪法检查存在必须合理化的违规时才填写**

| 违规 | 为何需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
