# 实施计划: 文档增强与本地化

**分支**: `003-enhance-documentation` | **日期**: 2025-11-26 | **规范**: [specs/003-enhance-documentation/spec.md](./spec.md)
**输入**: 来自 `/specs/003-enhance-documentation/spec.md` 的功能规范

**注意**: 此模板由 `/speckit.plan` 命令填充。有关执行工作流，请参阅 `.specify/templates/commands/plan.md`。

## 摘要

本项目旨在全面升级 `hyper-scheduler` 的文档体系和用户体验。主要工作包括：
1.  **文档重构**: 使用 VitePress 搭建支持多版本管理的中文文档站点。
2.  **API 增强**: 扩展 `schedule` 字段以支持简单的间隔字符串（如 "10s"），降低使用门槛。
3.  **示例完善**: 提供 Node.js, Browser, Vue, React 四种环境的完整、可运行示例。
4.  **源码本地化**: 将源码中的关键 JSDoc 注释翻译为中文。

## 技术背景

**语言/版本**: TypeScript 5.x, Node.js 18+
**主要依赖项**: 
- 文档: `vitepress`
- 核心库: 维持零运行时依赖 (移除 `cron-parser` 的强依赖，或将其封装在内部，间隔解析自研)。*注: `cron-parser` 仍需用于 cron 解析，但间隔解析为自研逻辑。*
**存储**: 不适用
**测试**: Vitest (用于测试新的间隔解析逻辑和文档示例的正确性)
**目标平台**: 全平台 (文档站点部署为静态网页)
**项目类型**: 文档与工具库增强
**性能目标**: 
- 文档站点首屏加载 < 1s (VitePress 默认优势)。
- 间隔解析逻辑开销可忽略不计。
**约束**: 
- 必须保持库体积 < 10KB。
- 文档必须为纯静态，便于部署到 GitHub Pages。

## 宪法检查

*门槛: 必须在阶段 0 研究之前通过。在阶段 1 设计之后重新检查。*

- **代码质量**: ✅ 新增的解析逻辑将遵循严格的 TypeScript 类型检查和 ESLint 规则。
- **测试标准**: ✅ 将为新的间隔解析器编写单元测试，并为示例项目添加集成测试脚本。
- **用户体验一致性**: ✅ 文档风格统一使用 VitePress 默认主题，API 设计保持向后兼容。
- **性能要求**: ✅ 自研轻量级间隔解析，不引入重型时间库。

## 项目结构

### 文档 (此功能)

```text
specs/003-enhance-documentation/
├── plan.md              # 此文件
├── research.md          # 架构决策
├── data-model.md        # 数据与接口更新
├── quickstart.md        # 快速开始更新
├── contracts/           # 接口契约
│   └── interface-update.md
└── tasks.md             # 任务列表
```

### 源代码 (仓库根目录)

```text
docs/                    # [新增] 文档根目录
├── .vitepress/
├── public/
├── index.md
└── api/

src/
├── utils/
│   ├── schedule.ts      # [新增] 统一调度解析器
│   └── cron.ts          # [修改] 适配新的解析接口
├── core/
│   └── Scheduler.ts     # [修改] 适配新的解析逻辑

examples/                # [新增] 示例目录
├── node/
├── browser/
├── vue-demo/
└── react-demo/
```

**结构决策**: 将文档 (`docs/`) 和示例 (`examples/`) 放在根目录，符合开源项目惯例。`src/utils/schedule.ts` 将作为新的调度逻辑入口，屏蔽 Cron 和 Interval 的差异。

## 复杂性跟踪

| 违规 | 为何需要 | 拒绝更简单替代方案的原因 |
|-----------|------------|-------------------------------------|
| 自研间隔解析 | 避免引入 `ms` 等外部库以控制包体积 | `ms` 库虽然小但增加了依赖，且我们需要严格控制单位（仅 s/m/h/d），自研正则解析只需几行代码。 |
| 多版本文档 | 库处于早期开发阶段，API 可能变动 | 单一版本文档会导致使用旧版本的用户无法找到对应参考，长期维护成本低，用户体验收益高。 |
