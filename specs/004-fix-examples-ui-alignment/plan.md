# 实施计划: 修复示例与 UI 对齐

**分支**: `004-fix-examples-ui-alignment` | **日期**: 2025-11-27 | **规范**: [spec.md](./spec.md)
**输入**: 来自 `/specs/004-fix-examples-ui-alignment/spec.md` 的功能规范

**注意**: 此模板由 `/speckit.plan` 命令填充。有关执行工作流，请参阅 `.specify/templates/commands/plan.md`。

## 摘要

本计划旨在修复 `examples/browser` 和 `examples/vue-demo` 中的运行错误，并将 DevTools 调试面板的功能和 UI 对齐到 `origin-prd/ui-design.md` 的设计要求。主要工作包括更新示例代码以匹配最新 API，解决 Vue 项目中的 `cron-parser` 依赖问题，以及重构/增强 DevTools 组件。

## 技术背景

**语言/版本**: TypeScript 5.x, JavaScript (ESM)
**主要依赖项**: 
- `vite` (构建工具)
- `cron-parser` (核心依赖，需解决 ESM 兼容性)
- `vue` (仅 Vue 示例)
**存储**: LocalStorage (可能用于 DevTools 设置持久化)
**测试**: 
- 手动测试: 浏览器示例运行
- 集成测试: DevTools 与 Scheduler 的交互
**目标平台**: 现代浏览器 (Chrome, Safari, Firefox), Node.js (仅示例构建)
**项目类型**: Library (Monorepo 风格的源码 + 示例)
**性能目标**: DevTools 刷新率 < 1s，不阻塞主线程业务逻辑
**约束**: 
- 示例代码应简单易懂
- DevTools 需作为独立模块或插件加载
**规模/范围**: 修改 `examples/` 下的演示代码，重构 `src/ui/` 下的调试面板逻辑

## 宪法检查

*门槛: 必须在阶段 0 研究之前通过。在阶段 1 设计之后重新检查。*

- **代码质量**: ✅ 修复示例代码将直接提升项目的可用性和文档质量。
- **测试标准**: ✅ 规范中定义了明确的验收场景（用户故事），将通过手动验证和自动化构建检查来保证。
- **用户体验一致性**: ✅ 本次计划的核心目标就是将 DevTools UI 对齐到统一的设计语言 (`ui-design.md`)。
- **性能要求**: ✅ DevTools 设计要求低侵入性和高性能监控。

## 项目结构

### 文档 (此功能)

```text
specs/004-fix-examples-ui-alignment/
├── plan.md              # 此文件 (/speckit.plan 命令输出)
├── research.md          # 阶段 0 输出 (/speckit.plan 命令)
├── data-model.md        # 阶段 1 输出 (/speckit.plan 命令)
├── quickstart.md        # 阶段 1 输出 (/speckit.plan 命令)
├── contracts/           # 阶段 1 输出 (/speckit.plan 命令)
└── tasks.md             # 阶段 2 输出 (/speckit.tasks 命令 - 不由 /speckit.plan 创建)
```

### 源代码 (仓库根目录)

```text
src/
├── index.ts             # 入口文件
├── core/                # 核心调度逻辑 (Scheduler, TaskRegistry)
├── ui/                  # DevTools 相关代码
│   ├── DebugPanel.ts    # 待重构: 主面板逻辑
│   └── styles.ts        # 待重构: UI 样式
└── utils/               # 工具函数

examples/
├── browser/             # 待修复: 纯浏览器示例
├── vue-demo/            # 待修复: Vue 集成示例
└── react-demo/          # 待检查: React 集成示例
```

**结构决策**: 保持现有目录结构，重点修改 `src/ui` 和 `examples` 目录。

## 复杂性跟踪

> **仅当宪法检查存在必须合理化的违规时才填写**

| 违规 | 为何需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| 无 | | |
