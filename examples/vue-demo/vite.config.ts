import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001
  },
  optimizeDeps: {
    // Don't exclude hyper-scheduler to allow proper module resolution
    // exclude: ['hyper-scheduler']
  }
})
