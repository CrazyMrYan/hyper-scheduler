<script setup>
import { defineProps, computed, ref, onMounted } from 'vue';
import { useData } from 'vitepress';

const { site } = useData();

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
  
  // 否则（生产环境构建或未指定端口），使用相对路径，并加上 base
  const base = site.value.base || '/';
  // 移除 path 开头的 /，避免双重斜杠或绝对路径问题
  const cleanPath = props.path.startsWith('/') ? props.path.slice(1) : props.path;
  // 确保 base 以 / 结尾
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  
  return `${cleanBase}${cleanPath}`;
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
