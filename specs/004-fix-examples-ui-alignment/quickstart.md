# 快速开始: Hyper Scheduler

## 1. 安装

```bash
npm install hyper-scheduler
```

## 2. 基础用法 (Browser/Node)

```javascript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler({ 
  debug: true // 开启调试模式 (在浏览器中会尝试加载 DevTools)
});

// 启动调度器
scheduler.start();

// 创建任务
scheduler.createTask({
  id: 'my-first-task',
  schedule: '*/5 * * * * *', // 每 5 秒
  tags: ['demo'],
  handler: () => {
    console.log('Task executed at:', new Date());
  }
});

// 停止任务
// scheduler.stopTask('my-first-task');
```

## 3. Vue 集成

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler();

onMounted(() => {
  scheduler.start();
  
  scheduler.createTask({
    id: 'vue-task',
    schedule: '10s',
    handler: () => console.log('Vue task running')
  });
});

onUnmounted(() => {
  scheduler.stop();
});
</script>
```
