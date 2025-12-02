# 实施计划: 全局任务调度 JS 库

**分支**: `002-global-task-scheduler` | **日期**: 2025-11-26 | **规范**: [specs/002-global-task-scheduler/spec.md](./spec.md)
**输入**: 来自 `/specs/002-global-task-scheduler/spec.md` 的功能规范

**注意**: 此模板由 `/speckit.plan` 命令填充。有关执行工作流，请参阅 `.specify/templates/commands/plan.md`。

## 摘要

构建一个轻量级、无依赖（核心逻辑）的 JavaScript 任务调度库，支持 Cron 表达式。核心特性包括：
1.  **跨平台兼容**: 支持 Node.js 和所有现代浏览器（通过 UMD/ESM/CJS）。
2.  **精准计时**: 在浏览器环境中使用 **Web Workers** 避免后台标签页节流问题。
3.  **调试工具**: 提供框架无关的调试面板（浏览器）和 CLI 输出（Node.js）。
4.  **健壮性**: 内置指数退避重试机制和唯一 ID 强制校验。
5.  **轻量级**: 目标体积 < 10KB (gzip)，支持 Tree-shaking。

## 技术背景

**语言/版本**: TypeScript 5.x (目标 ES2020)
**主要依赖项**: 
- `cron-parser`: 用于解析 Cron 表达式和计算下次运行时间。
- 开发依赖: `vite` (构建), `vitest` (测试), `eslint` (代码质量)。
**存储**: 内存 (In-Memory Map)。任务是临时的，不持久化到磁盘/LocalStorage。
**测试**: Vitest (单元测试 + 模拟时间测试)。覆盖率 > 90%。
**目标平台**: 
- Browser: Chrome, Firefox, Safari, Edge (使用 Web Worker)。
- Node.js: LTS 版本 (使用 `setTimeout`/`setImmediate`)。
**项目类型**: NPM Library (Package)
**性能目标**: 
- 库体积 < 10KB (minified + gzipped)。
- 空闲时主线程 CPU 占用 < 1%。
**约束**: 不依赖任何 UI 框架 (Vue/React 等)。
**规模/范围**: 适用于单页应用或 Node.js 服务中的后台任务管理。

## 宪法检查

*门槛: 必须在阶段 0 研究之前通过。在阶段 1 设计之后重新检查。*

- **代码质量**: ✅ 使用 ESLint + Prettier 强制执行 Airbnb 风格指南。TypeScript 严格模式。
- **测试标准**: ✅ 采用 TDD。Vitest 配置了覆盖率检查，低于 90% 将构建失败。
- **用户体验一致性**: ✅ 调试面板设计将保持简约，不干扰宿主应用 UI。API 设计模仿主流库 (`node-cron`) 以降低认知负荷。
- **性能要求**: ✅ 浏览器端强制使用 Web Workers 解决节流问题，确保计时准确性。构建流程包含包体积分析。

## 项目结构

### 文档 (此功能)

```text
specs/002-global-task-scheduler/
├── plan.md              # 此文件 (/speckit.plan 命令输出)
├── research.md          # 阶段 0 输出 (/speckit.plan 命令)
├── data-model.md        # 阶段 1 输出 (/speckit.plan 命令)
├── quickstart.md        # 阶段 1 输出 (/speckit.plan 命令)
├── contracts/           # 阶段 1 输出 (/speckit.plan 命令)
│   └── interface.md     # TypeScript API 定义
└── tasks.md             # 阶段 2 输出 (/speckit.tasks 命令)
```

### 源代码 (仓库根目录)

```text
src/
├── core/                # 核心逻辑 (平台无关)
│   ├── Scheduler.ts     # 调度器主类
│   ├── TaskRegistry.ts  # 任务管理 (Map)
│   └── RetryStrategy.ts # 重试逻辑
├── platform/            # 平台特定适配层
│   ├── TimerStrategy.ts # 计时器接口
│   ├── browser/         # 浏览器实现
│   │   ├── worker.ts    # Web Worker 源码
│   │   └── BrowserTimer.ts
│   └── node/            # Node.js 实现
│       ├── NodeTimer.ts
│       └── DebugCLI.ts
├── ui/                  # 调试面板 (无框架依赖)
│   ├── DebugPanel.ts    # Web Component / DOM 操作
│   └── styles.ts        # CSS 样式
├── utils/               # 工具函数
│   ├── id.ts
│   └── cron.ts
├── types.ts             # 类型定义
└── index.ts             # 库入口

tests/
├── unit/                # 单元测试
└── integration/         # 集成测试 (模拟时间)
```

**结构决策**: 采用核心逻辑与平台适配层分离的架构，确保代码复用率最大化，同时通过 `platform/` 目录隔离特定环境的差异。

## 复杂性跟踪

| 违规 | 为何需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| Web Workers | 浏览器后台节流导致定时任务严重延迟 | 主线程 `setInterval` 在页面不可见时会被降频到 1Hz 或更低，无法满足精确调度需求。 |
| 独立 UI 实现 | 要求“不限制任何 UI 框架” | 引入 Vue/React 会显著增加包体积并导致依赖冲突，原生 DOM 实现虽然繁琐但兼容性最好。 |
