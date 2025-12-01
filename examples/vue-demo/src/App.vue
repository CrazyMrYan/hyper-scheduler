<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Scheduler, DevTools } from 'hyper-scheduler'

const logs = ref<string[]>([])
const scheduler = ref<Scheduler | null>(null)
const isRunning = ref(false)

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  logs.value.push(`[${time}] ${msg}`)
  if (logs.value.length > 10) logs.value.shift()
}

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
        position: 'bottom-left',  // 右下角
        backgroundColor: '#10b981',  // 绿色背景
        textColor: '#ffffff'         // 白色文字
      }
    })]
  })
  
  // Cron 任务 - 每 3 秒（使用主线程驱动）
  scheduler.value.createTask({
    id: 'vue-cron',
    schedule: '*/3 * * * * *',
    handler: () => addLog('✅ Cron 任务执行 (每3秒)'),
    options: {
      driver: 'main'
    }
  })

  // 间隔任务 - 每 5 秒（使用 Worker 驱动，默认）
  scheduler.value.createTask({
    id: 'vue-interval',
    schedule: '5s',
    handler: () => addLog('✅ 间隔任务执行 (每5秒)'),
    options: {
      driver: 'worker'
    }
  })

  addLog('✨ Vue 应用已加载')
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
    addLog('⏹️ 调度器已停止')
  } else {
    scheduler.value.start()
    addLog('🚀 调度器已启动')
  }
  isRunning.value = !isRunning.value
}
</script>

<template>
  <div class="app">
    <div class="card">
      <h1>🕒 Hyper Scheduler</h1>
      <p class="subtitle">Vue 示例</p>
      <div class="info">
        <strong>💡 提示：</strong> 点击右下角的悬浮球打开 DevTools 面板
      </div>
      <button class="btn-primary" @click="handleToggle">
        {{ isRunning ? '⏹️ 停止调度器' : '▶️ 启动调度器' }}
      </button>
    </div>

    <div class="card">
      <h2>📋 执行日志</h2>
      <div class="log-box">
        <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}
</style>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h1 {
  margin: 0 0 8px 0;
  color: #333;
}

h2 {
  margin-top: 0;
  color: #333;
}

.subtitle {
  color: #666;
  margin-bottom: 16px;
}

.info {
  background: #e3f2fd;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
  margin-bottom: 16px;
}

.info strong {
  color: #1976d2;
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #2196f3;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary:hover {
  opacity: 0.9;
}

.log-box {
  background: #1e1e1e;
  color: #4ade80;
  padding: 16px;
  border-radius: 4px;
  height: 300px;
  overflow-y: auto;
  font-family: 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
