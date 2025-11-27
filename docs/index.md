---
layout: home

hero:
  name: Hyper Scheduler
  text: 轻量级、高性能的全局任务调度 JS 库
  tagline: 支持 Cron 表达式与人性化时间间隔，浏览器与 Node.js 通用
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 核心概念
      link: /guide/core-concepts

features:
  - title: 灵活调度
    details: 同时支持标准的 Cron 表达式（如 `*/5 * * * *`）和人性化的时间间隔字符串（如 `10s`, `1h`）。
  - title: 跨平台
    details: 支持浏览器和 Node.js 环境，一份代码，多端运行。浏览器端自动使用 Web Worker 防止阻塞。
  - title: 精准计时
    details: 浏览器端通过 Web Worker 确保后台任务精准执行，即使在页面标签页后台运行时也能避免节流限制。
  - title: 开发友好
    details: API 设计简洁直观。内置调试工具，支持日志追踪和可视化调试（WIP）。
  - title: 轻量级
    details: 核心库体积小巧，模块化设计，支持 Tree-shaking。
  - title: TypeScript
    details: 完全使用 TypeScript 编写，提供完整的类型定义，开发体验极佳。

footer: MIT Licensed | Copyright © 2025-present Hyper Scheduler Contributors