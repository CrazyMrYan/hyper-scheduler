import { useState, useEffect, useRef } from 'react';
import { Scheduler, DevTools } from 'hyper-scheduler';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const schedulerRef = useRef(null);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs(prev => [...prev.slice(-9), `[${time}] ${msg}`]);
  };

  useEffect(() => {
    // 准备插件
    const plugins = [];
    if (import.meta.env.DEV) {
      plugins.push(new DevTools({ theme: 'auto', language: 'zh' }));
    }

    // 创建调度器
    schedulerRef.current = new Scheduler({ 
      debug: true,
      plugins: plugins
    });

    // Cron 任务 - 每 3 秒
    schedulerRef.current.createTask({
      id: 'react-cron',
      schedule: '*/3 * * * * *',
      handler: () => addLog('✅ Cron 任务执行 (每3秒)')
    });

    // 间隔任务 - 每 5 秒
    schedulerRef.current.createTask({
      id: 'react-interval',
      schedule: '5s',
      handler: () => addLog('✅ 间隔任务执行 (每5秒)')
    });

    addLog('✨ React 应用已加载');

    return () => {
      if (schedulerRef.current) {
        schedulerRef.current.stop();
      }
    };
  }, []);

  const handleToggle = () => {
    if (!schedulerRef.current) return;

    if (isRunning) {
      schedulerRef.current.stop();
      addLog('⏹️ 调度器已停止');
    } else {
      schedulerRef.current.start();
      addLog('🚀 调度器已启动');
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="app">
      <div className="card">
        <h1>🕒 Hyper Scheduler</h1>
        <p className="subtitle">React 示例</p>
        <div className="info">
          <strong>💡 提示：</strong> 点击右下角的悬浮球打开 DevTools 面板
        </div>
        <button className="btn-primary" onClick={handleToggle}>
          {isRunning ? '⏹️ 停止调度器' : '▶️ 启动调度器'}
        </button>
      </div>

      <div className="card">
        <h2>📋 执行日志</h2>
        <div className="log-box">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
