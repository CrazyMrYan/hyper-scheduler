# 快速开始 (Updated)

## 安装

```bash
npm install hyper-scheduler
```

## 基础使用

### 使用 Cron 表达式

```javascript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler();

scheduler.createTask({
  id: 'cron-task',
  schedule: '*/5 * * * * *', // 每 5 秒
  handler: () => console.log('Cron 任务触发')
});

scheduler.start();
```

### 使用时间间隔 (新特性)

```javascript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler();

scheduler.createTask({
  id: 'interval-task',
  schedule: '10s', // 每 10 秒
  handler: () => console.log('间隔任务触发')
});

scheduler.start();
```

## 运行示例项目

本项目包含多个开箱即用的示例，位于 `examples/` 目录。

1. **Node.js 示例**:
   ```bash
   npm run example:node
   ```

2. **浏览器示例**:
   ```bash
   npm run example:browser
   # 然后访问控制台显示的本地地址
   ```

3. **Vue 示例**:
   ```bash
   cd examples/vue-demo
   npm install
   npm run dev
   ```
