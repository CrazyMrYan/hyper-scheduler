import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === 'production' ? '/hyper-scheduler/examples/vue-demo/' : '/',
  server: {
    port: 3001
  },
  optimizeDeps: {
    // Don't exclude hyper-scheduler to allow proper module resolution
    // exclude: ['hyper-scheduler']
  }
}))
