// 注意: 在实际项目中，你应该使用 import { Scheduler } from 'hyper-scheduler';
// 此处为了演示本地构建版本，直接引用 dist 目录下的 CommonJS 构建产物

const { Scheduler } = require('../../dist/index.cjs');

// 创建调度器
const scheduler = new Scheduler({ debug: true });

// Cron 任务 - 每 3 秒
scheduler.createTask({
  id: 'cron-task',
  schedule: '*/3 * * * * *',
  handler: () => {
    console.log('✅ Cron 任务执行:', new Date().toLocaleTimeString());
  }
});

// 间隔任务 - 每 5 秒
scheduler.createTask({
  id: 'interval-task',
  schedule: '5s',
  handler: () => {
    console.log('✅ 间隔任务执行:', new Date().toLocaleTimeString());
  }
});

// 启动调度器
scheduler.start();

console.log('🚀 调度器已启动，按 Ctrl+C 退出');
