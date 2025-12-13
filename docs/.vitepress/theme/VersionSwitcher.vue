<template>
  <div class="version-switcher">
    <div v-if="loading" class="loading">
      <p>⏳ 加载版本列表中...</p>
    </div>
    <div v-else-if="versions.length > 0" class="versions-list">
      <h2>📚 文档版本</h2>
      <p>选择你想查看的文档版本：</p>
      <div class="version-cards">
        <a
          v-for="version in versions"
          :key="version"
          :href="getVersionLink(version)"
          class="version-card"
          :class="{ current: isCurrentVersion(version) }"
        >
          <div class="version-name">{{ version }}</div>
          <div v-if="isCurrentVersion(version)" class="badge">最新</div>
        </a>
      </div>
    </div>
    <div v-else class="no-versions">
      <h2>📚 文档版本</h2>
      <p>暂无历史版本，当前版本将在下次部署后显示。</p>
      <p>
        <a href="https://github.com/CrazyMrYan/hyper-scheduler/releases" target="_blank">
          查看 GitHub Releases →
        </a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const versions = ref<string[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // 尝试多个可能的路径
    const paths = [
      '/hyper-scheduler/versions.json',
      '/versions.json',
      './versions.json'
    ];
    
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const text = await response.text();
          // 检查是否是有效的 JSON
          if (text.trim().startsWith('[')) {
            versions.value = JSON.parse(text);
            console.log('Loaded versions from:', path, versions.value);
            loading.value = false;
            return;
          }
        }
      } catch (e) {
        // 继续尝试下一个路径
      }
    }
    
    // 如果都失败了，使用当前版本作为默认值
    console.warn('Could not load versions.json, using current version only');
    // 从 package.json 读取当前版本
    const pkg = await import('../../../package.json');
    versions.value = [`v${pkg.version}`];
  } catch (e) {
    console.error('Failed to load versions:', e);
  } finally {
    loading.value = false;
  }
});

function getVersionLink(version: string) {
  const currentVersion = versions.value[0];
  if (version === currentVersion) {
    return '/hyper-scheduler/';
  }
  return `/hyper-scheduler/versions/${version}/`;
}

function isCurrentVersion(version: string) {
  return version === versions.value[0];
}
</script>

<style scoped>
.version-switcher {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.versions-list h2 {
  margin-bottom: 1rem;
}

.version-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.version-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  border: 2px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
}

.version-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.version-card.current {
  border-color: var(--vp-c-brand);
  background: var(--vp-c-brand-soft);
}

.version-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.badge {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--vp-c-brand);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.loading,
.no-versions {
  text-align: center;
  padding: 3rem 2rem;
}

.loading p {
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
}

.no-versions h2 {
  margin-bottom: 1rem;
}

.no-versions p {
  color: var(--vp-c-text-2);
  margin: 0.5rem 0;
}

.no-versions a {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
}

.no-versions a:hover {
  text-decoration: underline;
}
</style>
