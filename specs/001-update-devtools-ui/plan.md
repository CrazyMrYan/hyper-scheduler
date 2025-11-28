# 实施计划: 更新 DevTools UI

**分支**: `001-update-devtools-ui` | **日期**: 2025-11-27 | **规范**: [Link](../specs/001-update-devtools-ui/spec.md)
**输入**: 来自 `/specs/001-update-devtools-ui/spec.md` 的功能规范

**注意**: 此模板由 `/speckit.plan` 命令填充。有关执行工作流，请参阅 `.specify/templates/commands/plan.md`。

## 摘要

本功能旨在为 Hyper Scheduler 提供一个基于 Web Components 的调试面板 (DevTools)，以替换或增强现有的调试能力。该面板将提供任务概览、手动触发控制、执行历史记录以及时间轴可视化功能。技术方案采用纯 Vanilla TypeScript + Shadow DOM 实现，以确保零依赖、样式隔离和极轻量的体积。

## 技术背景

**语言/版本**: TypeScript 5.x
**主要依赖项**: 无 (Vanilla JS/TS), Web Components API
**存储**: 内存 (DevToolsState)
**测试**: Vitest (单元测试), 浏览器手动测试 (集成)
**目标平台**: 浏览器 (Chrome, Firefox, Safari, Edge)
**项目类型**: 前端库组件
**性能目标**: FPS 占用 < 5%, 渲染延迟 < 100ms (1000 任务)
**约束**: 必须使用 Shadow DOM 隔离样式；打包体积尽可能小。
**规模/范围**: 单一浮动面板，包含 3-4 个视图 (列表, 详情, 时间轴)。

## 宪法检查

*门槛: 必须在阶段 0 研究之前通过。在阶段 1 设计之后重新检查。*

- **代码质量**: 是。计划使用 TypeScript 强类型，模块化设计 (Components, Store, Service)。
- **测试标准**: 是。将为 Store 逻辑和核心 UI 组件编写单元测试。
- **用户体验一致性**: 是。UI 设计参考了 Chrome DevTools 风格，保持专业和紧凑。
- **性能要求**: 是。采用了 SVG 时间轴和 requestAnimationFrame 节流，避免主线程阻塞。

## 项目结构

### 文档 (此功能)

```text
specs/001-update-devtools-ui/
├── plan.md              # 此文件
├── research.md          # 技术决策与理由
├── data-model.md        # 核心实体定义 (TaskSnapshot, ExecutionLog)
├── quickstart.md        # 开发启动指南
├── contracts/           # 接口定义 (interface.md)
└── tasks.md             # 任务列表
```

### 源代码 (仓库根目录)

```text
src/
├── ui/
│   ├── components/          # UI 组件
│   │   ├── DevTools.ts      # 入口组件 (Container)
│   │   ├── FloatingTrigger.ts
│   │   ├── TaskList.ts
│   │   ├── TaskDetail.ts
│   │   ├── Timeline.ts
│   │   └── icons.ts         # SVG 图标集
│   ├── store/
│   │   └── DevToolsStore.ts # 状态管理
│   ├── styles/
│   │   ├── theme.css.ts     # CSS 变量 (Light/Dark)
│   │   └── main.css.ts      # 组件样式
│   └── index.ts             # 导出 attachDevTools
```

**结构决策**: 采用基于组件的目录结构，所有 DevTools 相关代码集中在 `src/ui` 下，保持核心调度逻辑 (`src/core`) 的纯净。

## 复杂性跟踪

| 违规 | 为何需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| 自定义 Store | 需要跨组件共享状态 (Task List <-> Detail) | 引入 Redux/MobX 太重；Props drilling 在 3 层深度下难以维护且性能较差。 |
| SVG 时间轴 | 需可视化并发任务 | Canvas 交互处理复杂且对简单场景过度优化；DOM Divs 性能较差。 |
