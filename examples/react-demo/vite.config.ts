import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/hyper-scheduler/examples/react-demo/' : '/',
  server: {
    port: 3002
  },
  optimizeDeps: {
    exclude: ['hyper-scheduler']
  }
}))
