# 快速开始指引

## 1. 安装

```bash
npm install hyper-scheduler
# 或
yarn add hyper-scheduler
# 或
pnpm add hyper-scheduler
```

## 2. 基本使用 (Node.js / 浏览器)

```javascript
import { Scheduler } from 'hyper-scheduler';

// 1. 初始化调度器
const scheduler = new Scheduler({ debug: true });

// 2. 创建任务
try {
  scheduler.createTask({
    id: 'my-first-task',
    schedule: '*/5 * * * * *', // 每 5 秒执行一次
    handler: async () => {
      console.log('任务执行中:', new Date().toISOString());
      // 模拟异步操作
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });
  console.log('任务创建成功');
} catch (err) {
  console.error('创建任务失败:', err.message);
}

// 3. 启动调度器 (如果尚未自动启动)
scheduler.start();

// 4. 稍后停止任务
// setTimeout(() => {
//   scheduler.stopTask('my-first-task');
//   console.log('任务已停止');
// }, 20000);
```

## 3. 在 Vue 中使用

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler({ debug: true });

onMounted(() => {
  scheduler.createTask({
    id: 'vue-polling',
    schedule: '0 * * * * *', // 每分钟
    handler: () => {
      console.log('Vue 组件轮询数据...');
    }
  });
  scheduler.start();
});

onUnmounted(() => {
  scheduler.stop(); // 清理资源
});
</script>
```

## 4. 浏览器直接引入 (HTML)

```html
<script src="https://unpkg.com/hyper-scheduler/dist/index.umd.js"></script>
<script>
  const { Scheduler } = window.HyperScheduler;
  const scheduler = new Scheduler({ debug: true });
  
  scheduler.createTask({
    id: 'html-task',
    schedule: '*/10 * * * * *',
    handler: () => console.log('来自 HTML 的任务')
  });
  
  scheduler.start();
</script>
```
