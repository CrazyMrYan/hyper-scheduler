# 示例演示：双线程心跳监控

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

## 完整代码示例

以下代码展示了如何在不同环境中实现上述场景，代码已包含完整的现代化 UI 逻辑。

::: tip 提示
点击下方选项卡切换查看不同环境的实现代码。
:::

::: code-group

```html [Browser (CDN)]
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <!-- ...样式代码省略，请参考 React/Vue 示例中的 CSS ... -->
  <style>
    /* 核心布局与样式 */
    :root { --bg-color: #f8fafc; /* ... */ }
    .dashboard { display: grid; grid-template-columns: 300px 1fr; /* ... */ }
    /* 按钮状态控制 */
    #btn-stop { display: none; }
    body.running #btn-start { display: none; }
    body.running #btn-stop { display: block; }
  </style>
</head>
<body>
  <div class="dashboard">
    <!-- ... HTML 结构 ... -->
    <div class="actions">
      <button class="btn-start" id="btn-start">▶ 启动调度器</button>
      <button class="btn-stop" id="btn-stop">⏹ 停止调度器</button>
    </div>
    <!-- ... -->
  </div>

  <script src="https://unpkg.com/hyper-scheduler/dist/index.umd.js"></script>
  <script>
    const { Scheduler, DevTools } = window.HyperScheduler;

    // 1. 初始化调度器
    const scheduler = new Scheduler({
      debug: true,
      plugins: [new DevTools({ theme: 'auto', language: 'zh' })]
    });

    // 2. 注册主线程任务
    scheduler.createTask({
      id: 'main-heartbeat',
      schedule: '3s',
      options: { driver: 'main' },
      handler: () => log('❤️ [Main] 主线程心跳检测正常', 'error')
    });

    // 3. 注册 Worker 任务
    scheduler.createTask({
      id: 'worker-heartbeat',
      schedule: '5s',
      handler: () => log('💙 [Worker] 后台线程任务执行中', 'info')
    });

    // 4. 按钮逻辑
    document.getElementById('btn-start').onclick = () => {
      scheduler.start();
      document.body.classList.add('running');
      log('🚀 调度器系统已启动', 'success');
    };

    document.getElementById('btn-stop').onclick = () => {
      scheduler.stop();
      document.body.classList.remove('running');
      log('⏹️ 调度器系统已停止', 'info');
    };
  </script>
</body>
</html>
```

```javascript [Node.js]
import { Scheduler } from 'hyper-scheduler';

// 1. Node 环境初始化
const scheduler = new Scheduler({ debug: true });

// 辅助函数：格式化时间
const time = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });

console.log('✨ 系统就绪，等待启动指令...');

// 2. 主线程心跳
scheduler.createTask({
  id: 'main-heartbeat',
  schedule: '3s',
  options: { driver: 'main' },
  handler: () => {
    console.log(`[${time()}] ❤️ [Main] 主线程心跳检测正常`);
  }
});

// 3. Worker 线程心跳
scheduler.createTask({
  id: 'worker-heartbeat',
  schedule: '5s',
  handler: () => {
    console.log(`[${time()}] 💙 [Worker] 后台线程任务执行中`);
  }
});

// 4. 启动
scheduler.start();
console.log(`[${time()}] 🚀 调度器已启动，按 Ctrl+C 退出`);
```

```jsx [React]
import { useState, useEffect, useRef } from 'react';
import { Scheduler, DevTools } from 'hyper-scheduler';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const schedulerRef = useRef(null);
  // ... 滚动条 ref 等 ...

  useEffect(() => {
    // 1. 初始化
    schedulerRef.current = new Scheduler({ 
      debug: true,
      plugins: [new DevTools({ theme: 'auto', language: 'zh' })]
    });

    // 2. 注册任务
    schedulerRef.current.createTask({
      id: 'main-heartbeat',
      schedule: '3s',
      options: { driver: 'main' }, 
      handler: () => addLog('❤️ [Main] 主线程心跳检测正常', 'error')
    });

    schedulerRef.current.createTask({
      id: 'worker-heartbeat',
      schedule: '5s',
      handler: () => addLog('💙 [Worker] 后台线程任务执行中', 'info')
    });

    return () => {
      if (schedulerRef.current) schedulerRef.current.stop();
    };
  }, []);

  // 3. 切换逻辑
  const handleToggle = () => {
    if (isRunning) {
      schedulerRef.current.stop();
      addLog('⏹️ 调度器系统已停止', 'info');
    } else {
      schedulerRef.current.start();
      addLog('🚀 调度器系统已启动', 'success');
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="dashboard">
      {/* ... UI 结构 ... */}
      <button 
        className={isRunning ? 'btn-stop' : 'btn-start'} 
        onClick={handleToggle}
      >
        {isRunning ? '⏹ 停止调度器' : '▶ 启动调度器'}
      </button>
      {/* ... */}
    </div>
  );
}
```

```vue [Vue 3]
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Scheduler, DevTools } from 'hyper-scheduler'

const scheduler = ref(null)
const isRunning = ref(false)
// ... 日志逻辑 ...

onMounted(() => {
  // 1. 初始化
  scheduler.value = new Scheduler({ 
    debug: true,
    plugins: [new DevTools({ theme: 'auto', language: 'zh' })]
  })
  
  // 2. 注册任务
  scheduler.value.createTask({
    id: 'main-heartbeat',
    schedule: '3s',
    options: { driver: 'main' },
    handler: () => addLog('❤️ [Main] 主线程心跳检测正常', 'error')
  })

  scheduler.value.createTask({
    id: 'worker-heartbeat',
    schedule: '5s',
    handler: () => addLog('💙 [Worker] 后台线程任务执行中', 'info')
  })
})

// 3. 切换逻辑
const handleToggle = () => {
  if (isRunning.value) {
    scheduler.value.stop()
    addLog('⏹️ 调度器系统已停止', 'info')
  } else {
    scheduler.value.start()
    addLog('🚀 调度器系统已启动', 'success')
  }
  isRunning.value = !isRunning.value
}
</script>

<template>
  <div class="dashboard">
    <!-- ... UI 结构 ... -->
    <button 
      :class="isRunning ? 'btn-stop' : 'btn-start'" 
      @click="handleToggle"
    >
      {{ isRunning ? '⏹ 停止调度器' : '▶ 启动调度器' }}
    </button>
    <!-- ... -->
  </div>
</template>
```

:::
