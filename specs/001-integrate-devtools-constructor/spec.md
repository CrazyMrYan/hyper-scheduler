# 功能规范: 通过构造函数集成 DevTools

**功能分支**: `001-integrate-devtools-constructor`
**创建日期**: 2025年11月29日
**状态**: 草稿
**输入**: 用户描述: "我希望的devtools，在new HyperScheduler的时候传入DevTools对象才行，不传入则不算引入。你设计下方案"

## 澄清项

### Session 2025-11-29
- Q: How should DevTools be passed to the constructor to ensure tree-shaking? → A: Plugin System (Option C)
- Q: What should be done with the existing `attachDevTools` method? → A: Remove Immediately (Option A)
- Q: What kind of plugin interface should be defined? → A: `init(scheduler: Scheduler, options: any)`
- Q: How should errors be handled if a plugin fails to initialize? → A: Log a warning and continue (Option B)
- Q: What should be the default behavior for DevTools if no `theme` is explicitly provided in the plugin options? → A: `auto` (默认 auto，但可以接收 theme 参数)

## 用户场景与测试 *(必填)*

### 用户故事 1 - 通过构造函数集成 DevTools (优先级: P1)

用户希望在创建 `HyperScheduler` 实例时，通过构造函数参数直接传入 DevTools 配置，从而实现 DevTools 的初始化和集成。这样可以确保 DevTools 的引入是显式且可控的。

**为何此优先级**: 这是用户需求的核心，直接影响 DevTools 的集成方式和 API 设计。

**独立测试**: 可以通过在实例化 `Scheduler` 时传入或不传入 DevTools 配置，然后验证 DevTools 是否正确初始化或未初始化来独立测试此功能。

**验收场景**:

1.  **鉴于** 没有 DevTools UI 被渲染, **当** 用户通过 `new Scheduler({ plugins: [new DevTools({ theme: 'auto' })] })` 实例化 `Scheduler`, **则** DevTools UI 会在浏览器中被渲染。
2.  **鉴于** 没有 DevTools UI 被渲染, **当** 用户通过 `new Scheduler({})` 实例化 `Scheduler` (不传入 `plugins` 选项), **则** DevTools UI 不会在浏览器中被渲染。
3.  **鉴于** `scheduler` 实例已通过构造函数传入 `devtools` 选项进行初始化, **当** DevTools 已成功挂载, **则** 用户可以通过 DevTools UI 监控和管理任务。
4.  **鉴于** `scheduler` 实例已通过构造函数传入一个插件，但该插件的初始化失败, **当** `Scheduler` 继续初始化, **则** 控制台会记录一个警告信息，表明插件初始化失败。

## 需求 *(必填)*

### 功能需求

-   **FR-001**: 系统必须允许用户在 `Scheduler` 构造函数中通过 `options` 参数传入一个可选的 `plugins` 数组。
-   **FR-002**: 如果 `plugins` 数组包含 DevTools 实例，系统必须通过调用 `plugin.init(scheduler, plugin_options)` 方法初始化并挂载 DevTools UI。
-   **FR-003**: 如果 `plugins` 数组未传入或为空，系统不得初始化或挂载 DevTools UI。
-   **FR-004**: `Scheduler` 实例不应再提供独立的 `attachDevTools` 方法，该方法应被立即移除。
-   **FR-005**: DevTools UI 的初始化和挂载必须仅在浏览器环境中进行，在非浏览器环境中传入 `DevTools` 插件应被忽略或记录警告。
-   **FR-006**: DevTools 插件应支持配置选项（例如 `theme`），如果未明确提供 `theme` 参数，则默认应为 `auto`。
-   **FR-007**: 如果任何插件的 `init` 方法抛出错误，`Scheduler` 必须捕获该错误，将其记录为警告，并继续 `Scheduler` 的初始化流程，不阻止其他插件或核心功能的加载。

### 非功能性需求 (根据项目章程)

-   **NFR-001 (代码质量)**: 代码必须遵循 [链接到编码标准] 中定义的标准。
-   **NFR-002 (测试标准)**: 功能必须包含全面的单元和集成测试，代码覆盖率至少为 [例如, 80%]。
-   **NFR-003 (用户体验)**: DevTools UI 必须保持其当前的用户界面和交互体验。
-   **NFR-004 (兼容性)**: 对现有使用 `Scheduler` 但未引入 `attachDevTools` 的代码不能产生副作用。

### 关键实体 *(如果功能涉及数据则包含)*

-   **Scheduler Options**: 传入 `Scheduler` 构造函数的配置对象，包含新的 `plugins` 属性。
-   **Plugin Interface**: 定义插件的标准接口，该接口必须包含 `init(scheduler: Scheduler, options: any)` 方法。

## 成功标准 *(必填)*

### 可衡量结果

-   **SC-001**: 移除 `attachDevTools` 方法后，`HyperScheduler` 库的 API 接口保持清晰和一致。
-   **SC-002**: 通过构造函数传入 `plugins` 数组，DevTools UI 能够成功渲染并提供完整的调试功能。
-   **SC-003**: 未传入 `plugins` 数组时，不发生与 DevTools 相关的初始化或渲染，且不会引入不必要的运行时开销。
-   **SC-004**: 在所有受支持的浏览器环境中，DevTools UI 都能正确响应 `devtools` 配置对象的 `theme` 属性。
-   **SC-005**: 插件初始化失败时，`Scheduler` 核心功能不受影响，且用户能够通过警告信息获知插件问题。