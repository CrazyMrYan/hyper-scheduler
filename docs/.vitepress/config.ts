import { defineConfig } from 'vitepress';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// 读取版本信息
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'));
const currentVersion = `v${pkg.version}`;

// 尝试读取已发布的版本列表
let versions: string[] = [currentVersion];
const versionsPath = resolve(__dirname, '../public/versions.json');
if (existsSync(versionsPath)) {
  try {
    const versionsList = JSON.parse(readFileSync(versionsPath, 'utf-8'));
    // 确保当前版本在列表中
    if (!versionsList.includes(currentVersion)) {
      versions = [currentVersion, ...versionsList];
    } else {
      versions = versionsList;
    }
  } catch (e) {
    console.warn('Failed to read versions.json:', e);
  }
}

export default defineConfig({
  base: '/hyper-scheduler/', // 设置 GitHub Pages 的基础路径
  lang: 'zh-CN', // 设置语言为中文
  title: 'Hyper Scheduler', // 更新标题
  description: '轻量级全局任务调度 JavaScript 库。', // 更新描述
  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CrazyMrYan/hyper-scheduler' }
    ],
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API 参考', link: '/api/scheduler' },
      { text: '示例', link: '/examples/' },
      {
        text: currentVersion,
        items: [
          ...versions.slice(0, 5).map(v => ({
            text: v === currentVersion ? `${v} (最新)` : v,
            link: v === currentVersion ? '/' : `/versions/${v}/`
          })),
          { text: '查看所有版本', link: '/versions' },
          { text: 'GitHub Releases', link: 'https://github.com/CrazyMrYan/hyper-scheduler/releases' }
        ]
      }
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '核心概念', link: '/guide/core-concepts' },
          { text: '最佳实践', link: '/guide/best-practices' }
        ]
      },
      {
        text: '示例',
        items: [
          { text: '在线演示', link: '/examples/' },
          { text: '浏览器 (Browser)', link: 'https://github.com/CrazyMrYan/hyper-scheduler/blob/main/examples/browser/index.html' },
          { text: 'Vue 3', link: 'https://github.com/CrazyMrYan/hyper-scheduler/blob/main/examples/vue-demo/src/App.vue' },
          { text: 'React', link: 'https://github.com/CrazyMrYan/hyper-scheduler/blob/main/examples/react-demo/src/App.jsx' },
          { text: 'Node.js', link: 'https://github.com/CrazyMrYan/hyper-scheduler/blob/main/examples/node/simple.js' }
        ]
      },
      {
        text: 'API 参考',
        items: [
          { text: '总览', link: '/api/' },
          { text: 'Scheduler', link: '/api/scheduler' },
          { text: 'Task', link: '/api/task' },
          { text: 'DevTools', link: '/api/devtools' },
          { text: '类型定义', link: '/api/types' }
        ]
      }
    ]
  }
});
