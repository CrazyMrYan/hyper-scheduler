// 注意: 在实际项目中，你应该使用 import { Scheduler } from 'hyper-scheduler';
// 此处为了演示本地构建版本，直接引用 dist 目录下的 CommonJS 构建产物

const { Scheduler } = require('../../dist/index.cjs');

// 初始化调度器，开启调试模式
const scheduler = new Scheduler({ debug: true });

// 示例 1: Cron 任务 - 每 2 秒执行一次
scheduler.addTask({
  id: 'cron-task',
  schedule: '*/2 * * * * *', // Cron 表达式
  handler: () => {
    console.log('Cron 任务执行:', new Date().toLocaleTimeString());
  }
});

// 示例 2: 间隔任务 - 每 5 秒执行一次 (新特性)
scheduler.addTask({
  id: 'interval-task',
  schedule: '5s', // 间隔字符串
  handler: () => {
    console.log('间隔任务执行:', new Date().toLocaleTimeString());
  }
});

// 启动调度器
scheduler.start();

console.log('调度器已启动。按 Ctrl+C 退出。');
console.log('计划在 15 秒后停止调度器...');

// 15 秒后停止
setTimeout(() => {
  scheduler.stop();
  console.log('调度器已停止。');
}, 15000);