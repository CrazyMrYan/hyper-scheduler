// 注意: 在实际项目中，你应该使用 import { Scheduler } from 'hyper-scheduler';
// 此处为了演示本地构建版本，直接引用 dist 目录下的 ESM 构建产物

import { Scheduler } from '../../dist/index.js';

// 创建调度器
const scheduler = new Scheduler({ debug: true });

// 辅助函数：格式化时间
const time = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });

console.log('✨ 系统就绪，等待启动指令...');

// 主线程心跳 (明确指定 driver: 'main')
scheduler.createTask({
  id: 'main-heartbeat',
  schedule: '3s',
  options: { driver: 'main' }, // 明确指定为主线程驱动
  handler: () => {
    console.log(`[${time()}] ❤️ [Main] 主线程心跳检测正常`);
  }
});

// Worker 线程心跳 (默认即为 Worker 驱动)
scheduler.createTask({
  id: 'worker-heartbeat',
  schedule: '5s',
  handler: () => {
    console.log(`[${time()}] 💙 [Worker] 后台线程任务执行中`);
  }
});

// 启动调度器
scheduler.start();

console.log(`[${time()}] 🚀 调度器已启动，按 Ctrl+C 退出`);
