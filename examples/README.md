# Hyper Scheduler 示例

本目录包含 Hyper Scheduler 在不同环境下的完整示例代码。

## 目录结构

```
examples/
├── browser/          # 浏览器原生 JS 示例
├── vue-demo/         # Vue 3 示例
├── react-demo/       # React 示例
└── node/             # Node.js 示例
```

## 运行示例

### 浏览器示例 (Browser)

```bash
# 在项目根目录运行
yarn dev

# 然后访问
# http://localhost:3003/examples/browser/
```

或者直接在浏览器中打开 `examples/browser/index.html` 文件。

### Vue 3 示例

```bash
cd examples/vue-demo
yarn install
yarn dev
```

访问 http://localhost:3001

### React 示例

```bash
cd examples/react-demo
yarn install
yarn dev
```

访问 http://localhost:3002

### Node.js 示例

```bash
cd examples/node
node simple.js
```

## 示例说明

所有示例都展示了相同的核心功能：**双线程任务调度**

- **主线程任务**: 每 3 秒执行一次，使用 `driver: 'main'`
- **Worker 任务**: 每 5 秒执行一次，使用默认的 Worker 驱动

这展示了 Hyper Scheduler 如何在不同的执行环境中运行任务，避免阻塞主线程。

## 在线文档

完整的文档和在线演示请访问：https://crazymryan.github.io/hyper-scheduler/examples/
