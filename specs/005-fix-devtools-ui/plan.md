# 实施计划: 修复 DevTools UI 问题

**分支**: `005-fix-devtools-ui` | **日期**: 2025-11-27 | **规范**: [Link](../specs/005-fix-devtools-ui/spec.md)
**输入**: 来自 `/specs/005-fix-devtools-ui/spec.md` 的功能规范

**注意**: 此模板由 `/speckit.plan` 命令填充。有关执行工作流，请参阅 `.specify/templates/commands/plan.md`。

## 摘要

本计划旨在修复 DevTools 中存在的多个 UI/UX 问题，包括 Timeline 不显示、数据不同步、图标错位、主题失效等，并新增面板停靠位置切换功能。修复工作将集中在 `src/ui` 目录下的组件和 Store 逻辑。

## 技术背景

**语言/版本**: TypeScript 5.x
**主要依赖项**: 无 (Vanilla JS/TS + Web Components)
**存储**: 内存 (DevToolsStore)
**测试**: Vitest (单元测试), 浏览器手动测试 (集成)
**目标平台**: 浏览器
**性能目标**: Timeline 渲染流畅，Docking 切换无卡顿。

## 宪法检查

*门槛: 必须在阶段 0 研究之前通过。在阶段 1 设计之后重新检查。*

- **代码质量**: 是。修复将遵循现有代码风格，增强类型定义。
- **测试标准**: 是。将为新的 Store 方法添加单元测试。
- **用户体验一致性**: 是。修复目标就是提升一致性（图标、字体、主题）。
- **性能要求**: 是。

## 项目结构

### 文档 (此功能)

```text
specs/005-fix-devtools-ui/
├── plan.md              # 此文件
├── research.md          # 问题分析与决策
├── data-model.md        # Store 更新定义
├── quickstart.md        # 验证步骤
├── contracts/           # 接口更新
└── tasks.md             # 任务列表
```

### 源代码 (仓库根目录)

```text
src/
├── ui/
│   ├── components/
│   │   ├── Timeline.ts      # [Fix] 渲染逻辑
│   │   ├── TaskList.ts      # [Fix] 图标样式, 数据绑定
│   │   ├── TaskHeader.ts    # [Feat] Docking toggle
│   │   ├── DevTools.ts      # [Fix] 事件监听, Docking layout
│   │   └── icons.ts         # [Feat] 新增 Docking icon
│   ├── store/
│   │   └── DevToolsStore.ts # [Feat] Docking state
│   └── styles/
│       └── theme.css.ts     # [Fix] CSS 变量, 字体
```

## 复杂性跟踪

| 违规 | 为何需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| Timeline 重写 | 现有实现无法显示 | 必须修复核心功能。 |
| CSS 变量重构 | 主题切换失效 | 必须确保 Shadow DOM 穿透/继承正确。 |
