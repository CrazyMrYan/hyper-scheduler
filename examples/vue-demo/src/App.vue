<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Scheduler, DevTools } from 'hyper-scheduler'

interface LogItem {
  time: string
  msg: string
  type: string
}

const logs = ref<LogItem[]>([])
const scheduler = ref<Scheduler | null>(null)
const isRunning = ref(false)
const logBoxRef = ref<HTMLElement | null>(null)

const addLog = (msg: string, type: string = 'info') => {
  const time = new Date().toLocaleTimeString('zh-CN', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
  
  logs.value.push({ time, msg, type })
  if (logs.value.length > 50) logs.value.shift()
}

// 自动滚动
watch(() => logs.value.length, () => {
  nextTick(() => {
    if (logBoxRef.value) {
      const el = logBoxRef.value
      // 简单的自动滚动逻辑：如果接近底部，则自动滚动
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
      if (isNearBottom || logs.value.length < 5) {
        el.scrollTop = el.scrollHeight
      }
    }
  })
})

onMounted(() => {
  // 创建调度器 - DevTools 仅在开发环境加载
  scheduler.value = new Scheduler({ 
    debug: true,
    plugins: [new DevTools({ 
      theme: 'auto', 
      language: 'zh', 
      dockPosition: 'bottom',
      defaultZoom: 2,
      trigger: {
        position: 'bottom-left',
        backgroundColor: '#10b981',
        textColor: '#ffffff'
      }
    })]
  })
  
  // 主线程心跳 (明确指定 driver: 'main')
  scheduler.value.createTask({
    id: 'main-heartbeat',
    schedule: '3s',
    options: { driver: 'main' },
    handler: () => addLog('❤️ [Main] 主线程心跳检测正常', 'error')
  })

  // Worker 线程心跳 (默认即为 Worker 驱动)
  scheduler.value.createTask({
    id: 'worker-heartbeat',
    schedule: '5s',
    handler: () => addLog('💙 [Worker] 后台线程任务执行中', 'info')
  })

  addLog('✨ 系统就绪，等待启动指令...', 'info')
})

onUnmounted(() => {
  if (scheduler.value) {
    scheduler.value.stop()
  }
})

const handleToggle = () => {
  if (!scheduler.value) return
  
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
    <!-- 左侧控制区 -->
    <div class="control-panel">
      <div>
        <div class="header">
          <h1>Hyper Scheduler</h1>
          <p>双线程任务调度演示 (Vue)</p>
        </div>

        <div class="task-status">
          <div class="status-item">
            <span class="status-dot dot-main"></span>
            <div>
              <strong>主线程任务</strong>
              <div class="status-desc">每 3 秒 (driver: 'main')</div>
            </div>
          </div>
          <div class="status-item">
            <span class="status-dot dot-worker"></span>
            <div>
              <strong>Worker 任务</strong>
              <div class="status-desc">每 5 秒 (driver: 'worker')</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="actions">
          <button 
            :class="isRunning ? 'btn-stop' : 'btn-start'" 
            @click="handleToggle"
          >
            <span style="margin-right: 8px">{{ isRunning ? '⏹' : '▶' }}</span> 
            {{ isRunning ? '停止调度器' : '启动调度器' }}
          </button>
        </div>
        <div class="info-tip">
          💡 点击右下角悬浮球打开调试面板
        </div>
      </div>
    </div>

    <!-- 右侧日志区 -->
    <div class="log-panel">
      <div class="log-header">
        <h2>
          <span>📋</span> 执行日志
        </h2>
        <div style="font-size: 12px; color: #64748b">实时监控中...</div>
      </div>
      <div class="log-box" ref="logBoxRef">
        <div v-for="(log, index) in logs" :key="index" :class="`log-item log-type-${log.type}`">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-content">{{ log.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --accent-color: #3b82f6;
  --accent-hover: #2563eb;
  --danger-color: #ef4444;
  --danger-hover: #dc2626;
  --success-color: #10b981;
  --border-radius: 12px;
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --font-mono: 'SFMono-Regular', Consolas, 'Lxgw WenKai', 'Liberation Mono', Menlo, monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg-color);
  color: var(--text-primary);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
</style>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  width: 1000px;
  height: 600px;
  background: var(--bg-color);
}

/* 左侧控制面板 */
.control-panel {
  background: var(--card-bg);
  border-radius: var(--border-radius);
  padding: 24px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header h1 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 24px;
}

.task-status {
  margin-bottom: auto;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 10px;
}

.status-desc {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.dot-main { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
.dot-worker { background: #3b82f6; box-shadow: 0 0 8px rgba(59, 130, 246, 0.4); }

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-start {
  background: var(--accent-color);
  color: white;
}
.btn-start:hover { background: var(--accent-hover); transform: translateY(-1px); }
.btn-start:active { transform: translateY(0); }

.btn-stop {
  background: #fff;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}
.btn-stop:hover { background: #fef2f2; }

.info-tip {
  margin-top: 20px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
  border: 1px dashed #cbd5e1;
}

/* 右侧日志面板 */
.log-panel {
  background: #1e293b; /* 深色背景用于日志 */
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-header {
  padding: 16px 24px;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0f172a;
}

.log-header h2 {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-box {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.8;
}

/* 滚动条美化 */
.log-box::-webkit-scrollbar { width: 6px; }
.log-box::-webkit-scrollbar-track { background: #1e293b; }
.log-box::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }

/* 日志条目样式 */
.log-item {
  display: flex;
  margin-bottom: 6px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.log-time {
  color: #64748b;
  margin-right: 12px;
  min-width: 85px;
}

.log-content { color: #e2e8f0; }
.log-type-success .log-content { color: #4ade80; }
.log-type-info .log-content { color: #60a5fa; }
.log-type-error .log-content { color: #f87171; }

@media (max-width: 768px) {
  .dashboard { grid-template-columns: 1fr; height: auto; }
  .log-panel { height: 400px; }
}
</style>