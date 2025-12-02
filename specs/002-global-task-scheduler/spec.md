# 功能规范: 全局任务调度 JS 库

**功能分支**: `002-global-task-scheduler`
**创建日期**: 2025-11-25
**状态**: 草稿
**输入**: 用户描述: "我现在想做一个js工具库，支持通过npm安装。 主要功能是作为前端全局的定时任务，需要与主流的包API类似，就算进行别人希望迁移，也可以比较方便的迁移 需要解决现阶段的这类似的工具库，没有解决的痛点。 需要支持开启类似vconsole类似的调试面板，能够查看和操作，可配置显隐，不限制任何 UI 框架，支持 Vue、angular、React等所有框架或者html直接引入，并且 Nodejs 也能使用，一样的不能限制任何框架 window 上也需要支持挂载（可配置） 要支持 TreeShaking 需要考虑到所有的性能问题和缺陷 可以参考我这个文档@README.md 。 需求还要写明，几个例子（Vue、React、HTML、Nodejs） 还需要使用 vitepress 写一个文档"

## Clarifications

### Session 2025-11-26
- Q: How should the library handle browser background tab throttling? → A: Use Web Workers to run the timer loop in a separate thread, preventing aggressive throttling by the browser.
- Q: Should tasks persist across page reloads (browser) or process restarts (Node.js)? → A: No, tasks are ephemeral and will not be persisted by the library.
- Q: How should the "vconsole-like" debug panel function in a Node.js environment? → A: Debug information will be provided as structured CLI output in Node.js.
- Q: What is the default retry strategy for failed tasks? → A: Exponential backoff with a maximum number of retries.
- Q: How should the system handle creating a task with an ID that already exists? → A: Throw an error, requiring unique IDs for new tasks.

## 用户场景与测试 *(必填)*

### 用户故事 1 - 开发者可以在其项目中使用该库 (优先级: P1)

作为一名前端开发者，我希望能够轻松地将这个任务调度库安装到我的项目中（无论是 Vue, React, Angular, 纯 HTML, 还是 Node.js），以便我可以使用它来管理定时任务。

**为何此优先级**: 这是最基本的功能，是所有其他功能的前提。

**独立测试**: 可以通过在不同类型的项目中成功安装和初始化该库来独立测试此功能。

**验收场景**:

1. **鉴于** 一个新的 npm 项目, **当** 我运行 `npm install hyper-scheduler`, **则** 该库被成功安装到我的 `node_modules` 文件夹中。
2. **鉴于** 我已经安装了该库, **当** 我在我的代码中 `import Scheduler from 'hyper-scheduler'`, **则** 我可以成功地引入调度器模块而不会出现错误。
3. **鉴于** 我在 Node.js 环境中, **当** 我 `require('hyper-scheduler')`, **则** 我可以成功地引入调度器模块而不会出现错误。

---

### 用户故事 2 - 开发者可以创建和管理定时任务 (优先级: P1)

作为一名开发者，我希望能够使用一个简单直观的 API 来创建、启动、停止和删除定时任务，以便我可以灵活地控制我的应用程序中的后台活动。

**为何此优先级**: 这是库的核心功能。

**独立测试**: 可以通过编写单元测试来独立测试任务的创建、启动、停止和删除功能。

**验收场景**:

1. **鉴于** 我已经初始化了调度器, **当** 我调用 `scheduler.createTask({ id: 'task1', schedule: '*/5 * * * *', task: () => console.log('Task 1 executed') })`, **则** 一个新的定时任务被创建。
2. **鉴于** 我创建了一个任务, **当** 我调用 `scheduler.startTask('task1')`, **则** 该任务会按照其计划（每5分钟）开始执行。
3. **鉴于** 一个正在运行的任务, **当** 我调用 `scheduler.stopTask('task1')`, **则** 该任务会停止执行。
4. **鉴于** 我有一个任务, **当** 我调用 `scheduler.deleteTask('task1')`, **则** 该任务将从调度器中被永久删除。

---

### 用户故事 3 - 开发者可以查看和调试任务 (优先级: P2)

作为一名开发者，我希望能够打开一个调试面板来查看所有当前的任务、它们的状态以及它们的执行历史，以便我可以轻松地调试和监控我的定时任务。

**为何此优先级**: 调试功能可以大大提高开发效率，并帮助快速定位问题。

**独立测试**: 可以在一个示例页面中初始化库并打开调试面板，以测试其功能。

**验收场景**:

1. **鉴于** 我已经初始化了调度器，并设置了 `debug: true`, **当** 我在浏览器中打开我的应用, **则** 一个类似 vconsole 的调试面板会出现在页面上。
2. **鉴于** 调试面板是可见的, **当** 我点击一个任务, **则** 我可以看到该任务的详细信息，包括它的下一次执行时间、状态和历史执行记录。
3. **鉴于** 我在调试面板中查看一个任务, **当** 我点击“启动”或“停止”按钮, **则** 我可以直接从调试面板控制该任务的执行。

### 边缘情况

- 当一个任务在执行过程中抛出未捕获的异常时会怎样？
- 当网络连接丢失时，需要网络请求的任务会怎样？
- 当浏览器标签页被切换到后台时，任务的执行会受到什么影响？

## 需求 *(必填)*

### 功能需求

- **FR-001**: 该库必须可以通过 npm 进行安装。
- **FR-002**: 该库必须提供一个 API，用于创建、读取、更新和删除 (CRUD) 定时任务。创建任务时，如果任务 ID 已存在，则必须抛出错误。
- **FR-003**: 该库必须支持在所有主流 JavaScript 框架（Vue, React, Angular）和纯 HTML 中使用。
- **FR-004**: 该库必须能够同时在浏览器和 Node.js 环境中运行。
- **FR-005**: 该库必须提供一个可选的、类似 vconsole 的调试面板，用于查看和管理任务。在 Node.js 环境中，调试信息将作为结构化命令行输出提供。
- **FR-006**: 该库必须支持 Tree shaking，以优化最终构建包的大小。
- **FR-007**: 必须为 Vue, React, HTML 和 Node.js 提供清晰的示例代码。
- **FR-008**: 必须使用 VitePress 创建一个全面的文档网站。
- **FR-009**: 系统必须支持动态任务管理，允许在调度器启动后添加、删除和修改任务。
- **FR-010**: 系统必须提供强大的错误处理和恢复机制，包括自动重试（默认采用指数退避策略）和失败任务的通知。
- **FR-011**: 系统必须内置对时区的支持，允许为每个任务指定时区。

### 非功能性需求 (根据项目章程)

- **NFR-001 (代码质量)**: 代码必须遵循一个标准的 JavaScript 风格指南（例如, Airbnb JavaScript Style Guide）。
- **NFR-002 (测试标准)**: 功能必须包含全面的单元和集成测试，代码覆盖率至少为 90%。
- **NFR-003 (性能)**: 库的性能必须经过优化，以确保对主线程的最小影响。在浏览器环境中，必须使用 Web Workers 来处理计时循环，以避免后台标签页的节流限制。
- **NFR-004 (兼容性)**: 必须在最新版本的 Chrome, Firefox, Safari 和 Edge 浏览器以及最新的 LTS 版本的 Node.js 中进行测试。

### 关键实体 *(如果功能涉及数据则包含)*

- **任务**: 代表一个要执行的计划操作。属性包括：ID, 计划 (cron 表达式), 要执行的函数, 状态 (例如，运行中, 已停止), 和执行历史。
- **调度器**: 管理任务集合的核心实体。负责任务的添加、删除、启动和停止。

### 假设

- **AS-001**: "主流包 API"指的是 `node-cron` 和 `cron` 这类在 npm 上流行的库的 API 风格。我们的 API 设计将借鉴它们的优点，以确保易用性和熟悉度。
- **AS--002**: “类似 vconsole 的调试面板”指的是一个浮动在页面上、可拖动、可最小化，并能显示日志和任务信息的界面。
- **AS-003**: 任务的调度将使用标准的 cron 表达式。
- **AS-004**: 任务是临时的，不会在浏览器页面重新加载或 Node.js 进程重启后自动持久化。

## 成功标准 *(必填)*

### 可衡量结果

- **SC-001**: 开发者可以在 5 分钟内将该库集成到一个新项目中并运行第一个定时任务。
- **SC-002**: 在一个典型的 Web 应用程序中，该库在空闲状态下对性能的影响应该小于 1%。
- **SC-003**: 95% 的用户在使用文档后，能够成功地使用该库的核心功能而无需寻求额外帮助。
- **SC-004**: 库的大小（经过 tree-shaking 和 gzip 压缩后）不应超过 10KB。