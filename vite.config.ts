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
  publicDir: false, // 禁用 public 目录的复制
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'HyperScheduler',
      fileName: (format) => {
        if (format === 'umd') return 'index.umd.js';
        if (format === 'cjs') return 'index.cjs';
        return 'index.js';
      },
      formats: ['es', 'cjs', 'umd'],
    },
    target: 'es2019',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 移除特定函数调用
        passes: 2, // 多次压缩以获得更好的结果
      },
      mangle: {
        toplevel: true, // 混淆顶级作用域的变量名
        properties: {
          regex: /^_/, // 混淆以 _ 开头的私有属性
        },
      },
      format: {
        comments: false, // 移除所有注释
      },
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        // 优化输出
        compact: true,
        generatedCode: {
          constBindings: true,
        },
      },
      treeshake: {
        moduleSideEffects: false, // 更激进的 tree-shaking
        propertyReadSideEffects: false,
        preset: 'smallest', // 使用最小化预设
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
