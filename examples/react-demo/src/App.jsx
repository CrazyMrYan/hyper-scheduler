import { useState, useEffect, useRef } from 'react';
import { Scheduler, DevTools } from 'hyper-scheduler';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const schedulerRef = useRef(null);
  const logBoxRef = useRef(null);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    
    setLogs(prev => {
      const newLogs = [...prev, { time, msg, type }];
      // 保持最近 50 条
      if (newLogs.length > 50) return newLogs.slice(-50);
      return newLogs;
    });
  };

  // 自动滚动到底部
  useEffect(() => {
    if (logBoxRef.current) {
      const el = logBoxRef.current;
      // 简单的自动滚动逻辑：如果接近底部，则自动滚动
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (isNearBottom || logs.length < 5) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [logs]);

  useEffect(() => {
    // 准备插件
    const plugins = [];
    // 仅在开发模式下加载 DevTools，或者始终加载取决于需求
    plugins.push(new DevTools({ 
      theme: 'auto', 
      language: 'zh',
      trigger: {
        position: 'bottom-right',
        backgroundColor: '#3b82f6'
      }
    }));

    // 创建调度器
    schedulerRef.current = new Scheduler({ 
      debug: true,
      plugins: plugins
    });

    // 主线程心跳 (明确指定 driver: 'main')
    schedulerRef.current.createTask({
      id: 'main-heartbeat',
      schedule: '3s',
      options: { driver: 'main' }, 
      handler: () => addLog('❤️ [Main] 主线程心跳检测正常', 'error')
    });

    // Worker 线程心跳 (默认即为 Worker 驱动)
    schedulerRef.current.createTask({
      id: 'worker-heartbeat',
      schedule: '5s',
      handler: () => addLog('💙 [Worker] 后台线程任务执行中', 'info')
    });

    addLog('✨ 系统就绪，等待启动指令...', 'info');

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
      addLog('⏹️ 调度器系统已停止', 'info');
    } else {
      schedulerRef.current.start();
      addLog('🚀 调度器系统已启动', 'success');
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="dashboard">
      {/* 左侧控制区 */}
      <div className="control-panel">
        <div>
          <div className="header">
            <h1>Hyper Scheduler</h1>
            <p>双线程任务调度演示 (React)</p>
          </div>

          <div className="task-status">
            <div className="status-item">
              <span className="status-dot dot-main"></span>
              <div>
                <strong>主线程任务</strong>
                <div className="status-desc">每 3 秒 (driver: 'main')</div>
              </div>
            </div>
            <div className="status-item">
              <span className="status-dot dot-worker"></span>
              <div>
                <strong>Worker 任务</strong>
                <div className="status-desc">每 5 秒 (driver: 'worker')</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="actions">
            <button 
              className={isRunning ? 'btn-stop' : 'btn-start'} 
              onClick={handleToggle}
            >
              <span style={{ marginRight: '8px' }}>{isRunning ? '⏹' : '▶'}</span> 
              {isRunning ? '停止调度器' : '启动调度器'}
            </button>
          </div>
          <div className="info-tip">
            💡 点击右下角悬浮球打开调试面板
          </div>
        </div>
      </div>

      {/* 右侧日志区 */}
      <div className="log-panel">
        <div className="log-header">
          <h2>
            <span>📋</span> 执行日志
          </h2>
          <div style={{ fontSize: '12px', color: '#64748b' }}>实时监控中...</div>
        </div>
        <div className="log-box" ref={logBoxRef}>
          {logs.map((log, index) => (
            <div key={index} className={`log-item log-type-${log.type}`}>
              <span className="log-time">{log.time}</span>
              <span className="log-content">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;