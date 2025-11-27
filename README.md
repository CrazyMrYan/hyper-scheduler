# Hyper Scheduler

![NPM Version](https://img.shields.io/npm/v/hyper-scheduler)
![License](https://img.shields.io/npm/l/hyper-scheduler)

A lightweight, dependency-free (core) JavaScript task scheduler supporting Cron expressions and Web Workers.

## Features
- 🚀 **Cross-platform**: Works in Node.js and Browser.
- ⏰ **Precise Timing**: Uses Web Workers in browser to avoid background throttling.
- 🛠 **Debuggable**: Built-in debug panel and CLI output.
- 📦 **Tiny**: < 10KB gzipped.

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
