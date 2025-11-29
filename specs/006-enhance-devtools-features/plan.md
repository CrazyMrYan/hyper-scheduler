# 实施计划: 增强 DevTools 功能

**分支**: `006-enhance-devtools-features` | **日期**: 2025-11-27 | **规范**: [Link](../specs/006-enhance-devtools-features/spec.md)
**输入**: 来自 `/specs/006-enhance-devtools-features/spec.md` 的功能规范

**注意**: 此模板由 `/speckit.plan` 命令填充。有关执行工作流，请参阅 `.specify/templates/commands/plan.md`。

## 摘要

本计划旨在解决 DevTools 的残留 Bug（主题、Timeline、状态同步）并实现增强功能（高精度时间、拖拽调整大小、国际化）。修复工作涉及核心 UI 组件的重构和 Store 的扩展。

## 技术背景

**语言/版本**: TypeScript 5.x
**主要依赖项**: 无 (Vanilla JS/TS + Web Components)
**存储**: 内存 (DevToolsStore) + LocalStorage (Size/Lang persistence)
**测试**: Vitest (单元测试)
**目标平台**: 浏览器
**性能目标**: 拖拽流畅 (60fps)，无布局抖动。

## 宪法检查

*门槛: 必须在阶段 0 研究之前通过。在阶段 1 设计之后重新检查。*

- **代码质量**: 是。将保持零依赖原则。
- **测试标准**: 是。增加对 i18n 逻辑的测试。
- **用户体验一致性**: 是。拖拽行为符合原生 OS 窗口习惯。
- **性能要求**: 是。拖拽使用直接 DOM 操作而非 React 状态更新，确保性能。

## 项目结构

### 文档 (此功能)

```text
specs/006-enhance-devtools-features/
├── plan.md              # 此文件
├── research.md          # 技术决策
├── data-model.md        # Store 扩展
├── quickstart.md        # 验证步骤
├── contracts/           # 接口更新
└── tasks.md             # 任务列表
```

### 源代码 (仓库根目录)

```text
src/
├── ui/
│   ├── components/
│   │   ├── Timeline.ts      # [Fix] ResizeObserver
│   │   ├── DevTools.ts      # [Feat] Resizing logic
│   │   ├── TaskList.ts      # [Feat] Time format
│   │   └── ...
│   ├── store/
│   │   └── DevToolsStore.ts # [Feat] Panel size, Lang
│   ├── styles/
│   │   └── theme.css.ts     # [Fix] Variables
│   └── i18n/                # [New]
│       ├── index.ts         # Helper
│       ├── en.ts            # English
│       └── zh.ts            # Chinese
```

## 复杂性跟踪

| 违规 | 为何需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| 自研 i18n | 支持多语言 | 引入 i18next 太重且 overkill。 |
| 手动拖拽逻辑 | 调整面板大小 | 引入 interact.js 等库增加体积。 |
