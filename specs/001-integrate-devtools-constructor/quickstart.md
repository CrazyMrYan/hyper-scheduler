# 快速入门: 集成 DevTools (新版)

> **注意**: `attachDevTools` 方法已被移除。请使用构造函数参数 `plugins` 来集成 DevTools。

## 安装

```bash
npm install hyper-scheduler
```

## 基本使用 (带 DevTools)

```javascript
import { Scheduler } from 'hyper-scheduler';
import { DevTools } from 'hyper-scheduler/devtools'; // 假设 DevTools 导出位置

// 创建调度器实例并传入 DevTools 插件
const scheduler = new Scheduler({
  debug: true,
  plugins: [
    new DevTools({
      theme: 'dark', // 可选: 'auto' (默认), 'light', 'dark'
      dockPosition: 'bottom-right' // 可选
    })
  ]
});

// 添加任务
scheduler.addTask({
  id: 'example-task',
  schedule: '*/5 * * * * *',
  handler: () => console.log('Task running!')
});

scheduler.start();
```

## 仅核心功能 (无 DevTools - Tree-shaking 友好)

```javascript
import { Scheduler } from 'hyper-scheduler';

// 不传入 plugins，DevTools 代码不会被打包
const scheduler = new Scheduler({
  debug: true
});

scheduler.start();
```

## 自定义插件

```javascript
class MyLoggerPlugin {
  constructor() {
    this.name = 'MyLogger';
  }

  init(scheduler) {
    scheduler.on('task_started', ({ taskId }) => {
      console.log(`[MyLogger] Task ${taskId} started`);
    });
  }
}

const scheduler = new Scheduler({
  plugins: [new MyLoggerPlugin()]
});
```
