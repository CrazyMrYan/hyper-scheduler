# 示例演示

本示例展示了 `Hyper Scheduler` 的核心能力：**双线程任务调度**。你可以同时在主线程（Main Thread）和 Web Worker 线程中运行任务，互不干扰。

## 在线演示

以下示例展示了完全相同的“双线程心跳监控”逻辑在不同框架中的运行效果。你可以直接在这里交互，或点击右上角图标在新窗口打开。

### Browser (原生 JS)

<DemoFrame path="/examples/browser/" :devPort="3003" devPath="/examples/browser/index.html" title="examples/browser/index.html" />

### Vue 3 Demo

<DemoFrame path="/examples/vue-demo/" :devPort="3001" title="examples/vue-demo" />

### React Demo

<DemoFrame path="/examples/react-demo/" :devPort="3002" title="examples/react-demo" />

## 安装与引入

### 1. 安装

使用你喜欢的包管理器安装 `hyper-scheduler`：

```bash
# yarn (推荐)
yarn add hyper-scheduler

# npm
npm install hyper-scheduler

# pnpm
pnpm add hyper-scheduler
```

### 2. 引入

**ES Modules (React, Vue, Node.js ESM)**

```javascript
import { Scheduler, DevTools } from 'hyper-scheduler';
```

**CommonJS (Node.js CJS)**

```javascript
const { Scheduler } = require('hyper-scheduler');
// 注意：DevTools 在纯 Node.js 环境下不可用
```

**浏览器 (CDN)**

```html
<script src="https://unpkg.com/hyper-scheduler/dist/index.umd.js"></script>
<script>
  const { Scheduler, DevTools } = window.HyperScheduler;
</script>
```

## 场景描述

我们模拟了一个简单的系统监控场景，包含两个独立的任务：

1.  **🔴 主线程任务 (Main Thread)**:
    *   **频率**: 每 3 秒
    *   **用途**: 模拟必须访问 DOM 或 UI 的轻量级任务。
    *   **配置**: `options: { driver: 'main' }`
2.  **🔵 Worker 任务 (Worker Thread)**:
    *   **频率**: 每 5 秒
    *   **用途**: 模拟繁重的数据处理、计算或网络请求，完全**不阻塞 UI**。
    *   **配置**: 默认行为 (或 `options: { driver: 'worker' }`)

---

## 源代码

上述在线演示的完整源代码位于项目的 `examples/` 目录中：

| 环境 | 源代码 | 本地运行 |
|------|--------|----------|
| **浏览器原生 JS** | [`examples/browser/index.html`](https://github.com/CrazyMrYan/hyper-scheduler/blob/main/examples/browser/index.html) | 直接打开文件或 `yarn dev` |
| **Vue 3** | [`examples/vue-demo/src/App.vue`](https://github.com/CrazyMrYan/hyper-scheduler/blob/main/examples/vue-demo/src/App.vue) | `cd examples/vue-demo && yarn dev` |
| **React** | [`examples/react-demo/src/App.jsx`](https://github.com/CrazyMrYan/hyper-scheduler/blob/main/examples/react-demo/src/App.jsx) | `cd examples/react-demo && yarn dev` |
| **Node.js** | [`examples/node/simple.js`](https://github.com/CrazyMrYan/hyper-scheduler/blob/main/examples/node/simple.js) | `node examples/node/simple.js` |

### 核心代码片段

所有示例都遵循相同的核心逻辑：

```javascript
import { Scheduler, DevTools } from 'hyper-scheduler';

// 1. 创建调度器
const scheduler = new Scheduler({
  debug: true,
  plugins: [new DevTools({ theme: 'auto', language: 'zh' })]
});

// 2. 注册主线程任务
scheduler.createTask({
  id: 'main-heartbeat',
  schedule: '3s',
  options: { 
    driver: 'main',
    namespace: 'ui',
    runImmediately: true
  },
  handler: () => console.log('❤️ [Main] 主线程心跳检测正常')
});

// 3. 注册 Worker 任务
scheduler.createTask({
  id: 'worker-heartbeat',
  schedule: '5s',
  options: {
    namespace: 'background'
  },
  handler: () => console.log('💙 [Worker] 后台线程任务执行中')
});

// 4. 启动调度器
scheduler.start();
```

::: tip 提示
点击上方表格中的源代码链接可以查看完整的实现，包括 UI 和样式代码。
:::
