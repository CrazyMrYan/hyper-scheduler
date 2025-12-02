# 阶段 0：研究

**功能**: 007-解决所有问题

## 1. Webpack 构建兼容性 (Issue #9)

### 背景
错误信息 `Module parse failed: Unexpected token (181:64) ??` 表明构建输出中包含空值合并运算符 (`??`)，而旧版 Webpack（通常用于旧项目）在没有特定 Babel 配置的情况下不支持此运算符。

### 决策
在 `dist/index.js` (UMD/CommonJS) 的构建输出中，将目标设置为 ES2019 或更早版本，或者在 Vite 中明确配置 Babel/Esbuild 转译 `??`。

### 理由
- **兼容性**: 确保与消费者可能使用的旧版构建链具有广泛兼容性。
- **零配置**: 用户不应该为了导入此库而配置其加载器。

### 考虑的替代方案
- **用户文档**: 告知用户更新其 Webpack 配置。（已驳回：用户体验不佳）。
- **Polyfill**: 语法不需要 Polyfill，只需转译。

## 2. 命名空间架构 (Issue #8)

### 背景
需要支持将任务隔离到命名空间中（例如 'system', 'user'），以实现更好的管理和 DevTools 可视化。

### 决策
为 `TaskDefinition` 添加一个可选的 `namespace` 字段。使用组合键或二级索引映射 `Map<Namespace, Set<TaskId>>` 将任务存储在 `TaskRegistry` 中。

### 理由
- **性能**: 允许在批量操作 (`start('namespace')`) 中对命名空间中的任务进行 O(1) 查找。
- **向后兼容性**: 默认命名空间可以是 `default` 或 `global`，使现有调用在不更改的情况下也能工作。

### 考虑的替代方案
- **前缀 ID**: 例如 `system:task1`。（已驳回：黑客式实现，依赖字符串解析，容易发生冲突）。

## 3. 立即触发任务 (Issue #10)

### 背景
用户希望任务在创建/启动后立即运行一次，除了按计划调度外。

### 决策
在 `TaskOptions` 中添加 `runImmediately: boolean`。在 `Scheduler.start()` 或 `createTask()`（如果已启动）中，检查此标志并异步触发一次处理程序。

### 理由
- **可预测性**: 明确的配置优于隐式副作用。
- **实现**: 可以重用现有的 `triggerTask` 逻辑。

## 4. UI/UX 改进 (Issue #11, #12, #13)

### 决策
- **拖放**: 在 DevTools 悬浮触发器上使用标准 HTML5 拖放 API 或简单的鼠标事件监听器。
- **遮罩**: 当 DevTools 打开时，创建一个具有高 z-index 的简单覆盖 `div`。
- **等宽字体**: 将 `font-variant-numeric: tabular-nums` 或等宽字体堆栈应用于帧率计数器，以防止视觉抖动。

### 理由
- **轻量级**: 不需要外部 UI 库，保持核心无依赖性。