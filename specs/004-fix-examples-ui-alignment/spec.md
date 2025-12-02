# 功能规范: 修复示例与 UI 对齐

**功能分支**: `004-fix-examples-ui-alignment`
**创建日期**: 2025年11月27日
**状态**: 草稿
**输入**: 用户描述: "现在这些示例没一个能用的，全部都在报错 require is not defined ,scheduler.addTask is not a function ，还有这部分内容检查下ui和原始需求，是否符合当然api不用太在意，只要保证能符合预期即可 '/Users/yanjiahui/Desktop/sourceCode/hyper-scheduler/origin-prd'，然后dev tools 好像没用"

## 上下文

本功能旨在修复当前示例代码无法运行的问题，并确保示例项目（特别是 DevTools）与原始产品设计文档保持一致。
参考文档与资源：
- UI 设计稿: `origin-prd/ui.png` (作为视觉参考)
- UI 设计文档: `origin-prd/ui-design.md` (定义 DevTools 功能与交互)
- 开发设计文档: `origin-prd/develop-design.md` (定义 API 和系统行为)

## 用户场景与测试 *(必填)*

### 用户故事 1 - 修复浏览器示例运行错误 (优先级: P1)

用户希望能够在浏览器中直接运行 `examples/browser` 下的示例，以了解调度器的基本用法，而不会遇到 "require is not defined" 或 API 调用错误。

**为何此优先级**: 示例代码是用户接入系统的第一步，当前完全无法运行（Crash），严重阻碍用户使用，属于阻断性问题。

**独立测试**: 打开浏览器示例的 `index.html`，控制台不应报错，且页面应有预期输出。

**验收场景**:

1. **鉴于** 用户打开 `examples/browser/index.html`
2. **当** 页面加载完成后
3. **则** 浏览器控制台(Console)中不应出现 `ReferenceError: require is not defined` 错误
4. **则** 浏览器控制台中不应出现 `TypeError: scheduler.addTask is not a function` 错误
5. **则** 调度器应能正常启动并开始处理任务

---

### 用户故事 2 - 修复 Vue 示例构建错误 (优先级: P1)

用户希望运行 `examples/vue-demo` 时，不会因为 `cron-parser` 库的导入问题导致构建或运行时崩溃。

**为何此优先级**: 同样属于阻断性问题，影响 Vue 用户体验。

**独立测试**: 运行 Vue 示例项目的开发服务器，页面应正常加载无报错。

**验收场景**:

1. **鉴于** 用户在 `examples/vue-demo` 下运行开发服务器
2. **当** 打开示例页面
3. **则** 控制台不应出现 `Uncaught SyntaxError: The requested module ... does not provide an export named 'default'` 相关错误
4. **则** 页面应能正常显示调度器状态

---

### 用户故事 3 - DevTools 功能与设计对齐 (优先级: P2)

开发者在使用调度器时，希望通过可视化的 DevTools 面板监控任务状态。该面板应符合 `origin-prd/ui-design.md` 中描述的功能和布局原则。

**为何此优先级**: 当前 DevTools "好像没用"，且可能与设计文档脱节。对齐设计能提供更专业、一致的调试体验。

**独立测试**: 在示例页面中集成 DevTools，检查其 UI 元素和交互是否符合设计文档描述。

**验收场景**:

1. **鉴于** 示例页面已加载且 DevTools 已激活
2. **则** DevTools 应包含 **Dashboard** (顶部状态栏，显示活跃任务数/FPS)、**列表视图** (紧凑表格) 和 **Manual Trigger** 按钮
3. **当** 用户点击列表中的 "Trigger" (或类似图标)
4. **则** 对应任务应立即执行一次
5. **当** 用户查看任务列表
6. **则** 应能看到 ID, Tags, Interval, Status 等核心列，且样式布局尽量贴近 `ui-design.md` 的描述（如紧凑表格、Tag样式）

---

### 用户故事 4 - UI 与基本交互体验对齐 (优先级: P3)

用户希望示例的 UI 界面（包括 React/Vue Demo）能够清晰展示调度器的核心功能（如添加任务、暂停、查看日志），且交互符合直觉。

**为何此优先级**: 虽然 API 是核心，但示例 UI 是用户感知的直接窗口。

**独立测试**: 运行 React 或 Vue 示例，操作界面按钮，功能应符合预期。

**验收场景**:

1. **鉴于** 运行 React 或 Vue 示例项目
2. **当** 用户点击“添加任务”或类似按钮
3. **则** 界面列表应新增一个任务项
4. **当** 任务状态发生变化
5. **则** UI 应通过颜色或文字标签正确反映该状态（如：绿色代表成功，红色代表失败）

### 边缘情况

- 当浏览器不支持某些 ES 新特性时，示例是否提供基本的兼容性或明确提示？
- 当调度器没有任何任务时，DevTools 面板应显示为空状态而不是报错。
- Vue 项目中 `cron-parser` 如果无法修复 ESM 兼容性，是否提供降级方案或替代库？

### 假设与依赖

- **假设**: `src` 目录下的核心调度器代码逻辑是正确的，问题仅在于示例代码的调用方式和配置。
- **依赖**: 现代浏览器环境（支持 ES Modules）。
- **依赖**: `origin-prd` 目录下的设计文档准确反映了目标形态。

## 需求 *(必填)*

### 功能需求

- **FR-001**: `examples/browser` 中的代码必须能够在标准浏览器环境中直接运行，无需额外的构建步骤或不兼容的模块加载器配置。
- **FR-002**: `examples/vue-demo` 必须解决 `cron-parser` 的导入/构建错误（SyntaxError），确保示例可运行。
- **FR-003**: 所有示例代码必须与核心库当前的公共接口（Public API）保持一致（如使用 `scheduler.create` 而非 `addTask`，参考 `develop-design.md`）。
- **FR-004**: 可视化调试工具（DevTools）必须能够成功初始化，并与调度器实例建立连接以接收数据。
- **FR-005**: DevTools UI 必须实现 `ui-design.md` 中描述的核心视图：
    - **Dashboard**: 显示 Status (Active/Total) 和 FPS。
    - **Task List**: 表格展示 ID, Tags, Status, Interval, Last Run。
    - **Actions**: 提供 Trigger (立即执行), Pause/Resume, Remove 操作。
- **FR-006**: 调试工具必须能够实时展示关键任务信息（如唯一标识符、执行状态、时间戳）。
- **FR-007**: 示例项目的用户界面必须提供清晰的交互元素，用于演示任务的创建、状态监控和调度器控制。

### 非功能性需求

- **NFR-001 (易用性)**: 示例代码应尽量简洁，注释清晰，方便用户通过“复制粘贴”快速集成。
- **NFR-002 (兼容性)**: 浏览器示例应在主流现代浏览器（Chrome, Firefox, Safari）的最近版本中正常运行。
- **NFR-003 (设计一致性)**: DevTools 的视觉风格应参考 `ui.png` (如有) 和 `ui-design.md` 的描述（如深色模式、紧凑布局）。

## 成功标准 *(必填)*

### 可衡量结果

- **SC-001**: 打开 `examples/browser/index.html` 后，控制台错误数（Error）为 0。
- **SC-002**: `examples/vue-demo` 成功启动，且控制台无 `cron-parser` 相关 SyntaxError。
- **SC-003**: DevTools 面板包含设计文档要求的 3 个核心区域（Header, List, Actions），且功能可用。
- **SC-004**: 在所有示例（Browser, React, Vue）中，成功添加并执行的任务数量 > 0。
- **SC-005**: DevTools 面板在任务执行期间，状态刷新延迟不超过 1 秒（肉眼可见的实时性）。