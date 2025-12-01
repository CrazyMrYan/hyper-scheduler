<p align="center">
  <img src="docs/public/logo.svg" width="120" height="120" alt="Hyper Scheduler Logo">
</p>

<h1 align="center">Hyper Scheduler</h1>

<p align="center">
  <img src="https://img.shields.io/npm/v/hyper-scheduler" alt="NPM Version">
  <img src="https://img.shields.io/npm/l/hyper-scheduler" alt="License">
</p>

A lightweight, dependency-free (core) JavaScript task scheduler supporting Cron expressions and Web Workers.

## Features
- 🚀 **Cross-platform**: Works in Node.js and Browser.
- ⏰ **Precise Timing**: Uses Web Workers in browser to avoid background throttling.
- 🛠 **Debuggable**: Built-in debug panel and CLI output.
- 📦 **Tiny**: < 20KB gzipped.

## Quick Start

```bash
npm install hyper-scheduler
```

```javascript
import { Scheduler } from 'hyper-scheduler';

const scheduler = new Scheduler({ debug: true });
scheduler.createTask({
  id: 'hello',
  schedule: '*/5 * * * * *',
  handler: () => console.log('Hello World')
});
scheduler.start();
```

See [Documentation](docs/guide/getting-started.md) for more details.
