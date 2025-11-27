# 研究报告: 修复示例与 UI 对齐

**功能分支**: `004-fix-examples-ui-alignment`
**日期**: 2025-11-27

## 决策摘要

### 1. API 一致性修复
- **问题**: 浏览器示例使用已废弃/不存在的 `scheduler.addTask` 方法，导致运行崩溃。
- **发现**: 当前核心库 (`src/core/Scheduler.ts`) 暴露的方法名为 `createTask`。
- **决策**: 将所有示例中的 `addTask` 调用替换为 `createTask`。虽然设计文档可能提及 `create`，但为了保持与核心代码的一致性并最小化变更风险，优先使用现有 API 名称。

### 2. Vue 示例构建错误 (`cron-parser`)
- **问题**: Vue 示例在 Vite 开发模式下报错 `Uncaught SyntaxError: ... does not provide an export named 'default'`。
- **原因**: `cron-parser` 是 CommonJS 模块，而在 `src/utils/schedule.ts` 中使用了 `import parser from 'cron-parser'`。在纯 ESM 环境（如 Vite 处理后的 Vue 项目）中，默认导出可能无法正确识别。
- **决策**: 修改 `src/utils/schedule.ts` 中的导入方式。
  - **方案**: 使用 `import * as parser from 'cron-parser'` 或 `import { parseExpression } from 'cron-parser'`（需验证 `cron-parser` 导出结构）。
  - **备选**: 如果上述无效，考虑在 `vite.config.ts` 中强制转换或使用 `require`（在兼容层）。
  - **最终选择**: 优先尝试 `import * as cronParser from 'cron-parser'` 并调用 `cronParser.parseExpression`，这是处理 CJS/ESM 互操作的稳健模式。

### 3. DevTools 重构架构
- **问题**: 当前 `DebugPanel.ts` 功能极其简陋，不符合设计文档要求。
- **需求**: 实现 Dashboard, Task List (含 Tags), Actions, Timeline。
- **决策**: 采用 **Shadow DOM** 技术重构 `DebugPanel.ts`。
  - **理由**: 确保 DevTools 样式不污染宿主页面（CSS Isolation），且不依赖外部框架（React/Vue），保持库的轻量级。
  - **实现细节**: 
    - 使用 `template` 字符串构建 HTML。
    - 手动绑定事件。
    - 增加 `tags` 字段支持到 `Task` 类型中。

## 替代方案评估

### 关于 DevTools 技术栈
- **选项 A**: 使用 Preact/React 构建 DevTools。
  - *优点*: 开发效率高，状态管理容易。
  - *缺点*: 增加打包体积，引入构建复杂性。
- **选项 B**: 原生 Web Components (Custom Elements)。
  - *优点*: 标准支持，生命周期管理好。
  - *缺点*: 可能需要 polyfill（虽然现代浏览器都支持），对于简单的调试面板可能稍显繁琐。
- **选项 C**: **原生 DOM + Shadow DOM (当前选择)**。
  - *优点*: 无依赖，体积最小，样式隔离完美。
  - *缺点*: DOM 操作繁琐。
  - *结论*: 考虑到 `hyper-scheduler` 定位为轻量级库，选项 C 最符合项目哲学。

## 风险与缓解
- **风险**: 修改 `src/utils/schedule.ts` 的导入可能破坏 Node.js 环境的构建。
- **缓解**: 在修改后必须运行 `npm run example:node` 和 `npm run test` 验证兼容性。
