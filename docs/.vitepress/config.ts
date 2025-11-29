import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN', // 设置语言为中文
  title: 'Hyper Scheduler', // 更新标题
  description: '轻量级全局任务调度 JavaScript 库。', // 更新描述
  head: [
    ['link', { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/getting-started' }, // 更新导航文本
      { text: 'API 参考', link: '/api/scheduler' },     // 更新导航文本
      // 多版本导航占位符 - 实际实现可能需要自定义组件或更复杂的配置
      {
        text: '版本',
        items: [
          { text: 'v1.0.0 (最新)', link: '/' },
          // { text: 'v0.9.0', link: '/v0.9.0/' } // 示例历史版本
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
