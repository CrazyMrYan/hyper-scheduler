<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Scheduler } from 'hyper-scheduler'

const logs = ref<string[]>([])
const scheduler = ref<Scheduler | null>(null)
const isRunning = ref(false)

const addLog = (msg: string) => {
  logs.value.push(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (logs.value.length > 20) logs.value.shift()
}

onMounted(() => {
  scheduler.value = new Scheduler({ debug: true })
  
  // Cron Task
  scheduler.value.createTask({
    id: 'vue-cron',
    schedule: '*/3 * * * * *',
    handler: () => addLog('Vue Cron Task (3s)')
  })

  // Interval Task
  scheduler.value.createTask({
    id: 'vue-interval',
    schedule: '5s',
    handler: () => addLog('Vue Interval Task (5s)')
  })
})

onUnmounted(() => {
  if (scheduler.value) {
    scheduler.value.stop()
  }
})

const toggle = () => {
  if (!scheduler.value) return
  
  if (isRunning.value) {
    scheduler.value.stop()
    addLog('Scheduler Stopped')
  } else {
    scheduler.value.start()
    addLog('Scheduler Started')
  }
  isRunning.value = !isRunning.value
}
</script>

<template>
  <div class="container">
    <h1>Vue Demo</h1>
    <div class="card">
      <button @click="toggle">
        {{ isRunning ? 'Stop Scheduler' : 'Start Scheduler' }}
      </button>
      <div class="logs">
        <div v-for="(log, index) in logs" :key="index">{{ log }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
}
.card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}
button {
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
.logs {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  height: 200px;
  overflow-y: auto;
  font-family: monospace;
}
</style>