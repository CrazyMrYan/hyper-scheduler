import { resolve } from 'path';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html'
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HyperScheduler',
      fileName: 'index',
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['cron-parser'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          'cron-parser': 'CronParser',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
