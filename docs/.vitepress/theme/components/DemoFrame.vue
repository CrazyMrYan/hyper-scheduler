<script setup>
import { defineProps, computed, ref, onMounted } from 'vue';

const props = defineProps({
  path: {
    type: String,
    required: true
  },
  devPort: {
    type: Number,
    default: null
  },
  devPath: {
    type: String,
    default: '/'
  },
  title: {
    type: String,
    default: 'Demo'
  }
});

const src = computed(() => {
  const isDev = import.meta.env.DEV;
  
  // 如果在本地开发环境，且指定了端口，则使用 localhost
  if (isDev && props.devPort) {
    return `http://localhost:${props.devPort}${props.devPath}`;
  }
  
  // 否则（生产环境构建或未指定端口），使用相对路径
  // 假设 base 路径已正确配置，直接指向 /examples/...
  // 注意：VitePress 构建后的路径结构是平级的
  // docs/.vitepress/dist/examples/vue-demo
  // 访问路径通常是 base + examples/vue-demo/
  
  // 这里需要处理 base 路径。如果在 GitHub Pages 上部署到 /repo/，base 就是 /repo/
  // 使用 withBase 辅助函数是最佳实践，但这里我们在 iframe src 中直接拼接
  
  // 简单起见，假设部署结构保持 /examples/xxx
  return props.path;
});
</script>

<template>
  <div class="demo-frame-container">
    <div class="demo-header">
      <span class="dot red"></span>
      <span class="dot yellow"></span>
      <span class="dot green"></span>
      <span class="title">{{ title }}</span>
      <a :href="src" target="_blank" class="open-btn" title="在新窗口打开">↗</a>
    </div>
    <iframe :src="src" class="demo-frame"></iframe>
  </div>
</template>

<style scoped>
.demo-frame-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background: var(--vp-c-bg);
}

.demo-header {
  background: var(--vp-c-bg-soft);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-divider);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.red { background-color: #ff5f56; }
.yellow { background-color: #ffbd2e; }
.green { background-color: #27c93f; }

.title {
  margin-left: 8px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-family: monospace;
  flex: 1;
}

.open-btn {
  text-decoration: none;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.open-btn:hover {
  color: var(--vp-c-brand);
}

.demo-frame {
  width: 100%;
  height: 500px;
  border: none;
  display: block;
}
</style>
