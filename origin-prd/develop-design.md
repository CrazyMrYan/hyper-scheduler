# hyper-scheduler 技术文档

## 1. 项目简介

**hyper-scheduler** 是一个工业级、全场景通用的 JavaScript 定时任务调度中心。
它旨在解决原生 `setInterval` / `setTimeout` 在复杂业务场景下的痛点，提供**可视化调试**、**后台防节流**、**任务依赖管理**等高级功能。

**核心特性：**
*   **后台保活**：支持 Web Worker 驱动，彻底解决浏览器标签页切后台后定时器降频/停止的问题。
*   **可视化调试**：提供独立的 DevTools 面板，支持任务监控、手动触发、性能分析。
*   **精准计时**：内置时间漂移自校准机制（Self-Correction），不仅依赖系统 Tick，更修正执行误差。
*   **Tree Shaking**：采用核心与调试器物理隔离的架构，生产环境零冗余。
*   **全栈适配**：兼容浏览器（Main/Worker）、Node.js 环境，无缝集成 React/Vue/Angular。


## 2. 安装与目录结构

### 安装

```bash
npm install hyper-scheduler
```

### 引入策略 (Subpath Exports)

项目采用多入口导出设计，确保核心逻辑与 UI 逻辑彻底解耦：

*   **核心库 (生产环境)**: `hyper-scheduler` (或 `hyper-scheduler/core`)
*   **调试器 (开发环境)**: `hyper-scheduler/devtools`

---

## 3. 快速上手

```javascript
import { HyperScheduler } from 'hyper-scheduler';

// 1. 初始化调度器
const scheduler = new HyperScheduler();

// 2. 创建任务 (所有配置均在对象中)
const taskId = scheduler.create({
    id: 'heartbeat-001',   // 选填
    interval: 1000,        // 1秒执行一次
    handler: async (ctx) => {
        console.log(`第 ${ctx.count} 次跳动`);
        // 业务逻辑...
    }
});

// 3. 停止任务
// scheduler.stop(taskId);
```

---

## 4. 核心 API (Core)

### Class: `HyperScheduler`

#### 构造函数

```typescript
const scheduler = new HyperScheduler(options?: SchedulerOptions);
```

| 参数 | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `driver` | `'main' \| 'worker'` | `'main'` | **驱动模式**。<br>`'main'`: 主线程运行 (常规)。<br>`'worker'`: **后台保活模式**。在 Web Worker 中计时，防止浏览器后台节流。Node 环境自动忽略。 |
| `maxDrift` | `number` | `50` | 允许的最大时间漂移(ms)，超过会自动修正下一次 tick 的延迟。 |
| `global` | `boolean` | `false` | 是否自动挂载实例到 `window.hyperScheduler` 方便控制台调试。 |
| `plugins` | `Plugin[]` | `[]` | 插件列表（用于注入 DevTools）。 |

#### 实例方法

##### `create(config: TaskConfig): string`

创建并启动一个任务，返回任务 ID。

**config 配置对象详解：**

| 属性 | 类型 | 必填 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| **`handler`** | `(ctx) => void` | **是** | - | **任务回调**。支持 async/await。 |
| **`interval`** | `number \| string` | **是** | - | 执行间隔。<br>`number`: 毫秒数。<br>`string`: Cron 表达式 (如 `'*/5 * * * * *'`)。 |
| `id` | `string` | 否 | UUID | 任务唯一标识。 |
| `limit` | `number` | 否 | `0` | 最大执行次数限制，`0` 表示无限。 |
| `killOnLimit`| `boolean` | 否 | `true` | 达到 limit 后是否自动从内存中彻底删除任务。 |
| `immediate` | `boolean` | 否 | `false` | 是否在创建后立即执行一次（不等待第一个 interval）。 |
| `retry` | `number` | 否 | `0` | **错误重试**。若 `handler` 抛错，立即重试 N 次。默认不开启。 |
| `tags` | `string[]` | 否 | `[]` | 标签，用于批量管理（如 `['page-home', 'polling']`）。 |

##### 任务控制方法

所有控制方法均支持传入 **ID** (单个) 或 **Tag** (批量)。

*   **`stop(target: string | string[])`**: 暂停任务（保留状态，可恢复）。
*   **`start(target: string | string[])`**: 恢复暂停的任务。
*   **`remove(target: string | string[])`**: 彻底删除任务（释放内存）。

##### 数据获取

*   **`getTasks()`**: 返回 `Map<string, TaskInstance>`，获取当前所有任务快照。

---

### Interface: `TaskContext`

`handler` 回调函数的唯一参数 `ctx`：

```typescript
interface TaskContext {
    /** 当前任务 ID */
    id: string;
    
    /** 当前是第几次成功执行 (从 1 开始) */
    count: number;
    
    /** 调度器实例引用 (允许在回调中操作其他任务) */
    scheduler: HyperScheduler;
    
    /** 上次运行的时间戳 */
    lastRun: number;

    /** 快捷操作：停止当前任务 */
    stop: () => void;
    
    /** 快捷操作：删除当前任务 */
    remove: () => void;
}
```

---

## 5. 调试面板 (DevTools)

DevTools 是一个独立的 Web Component 插件，不依赖任何 UI 框架，且支持 Tree Shaking。

### 集成方式

推荐使用以下模式，确保生产环境构建时自动剔除 DevTools 代码：

```javascript
import { HyperScheduler } from 'hyper-scheduler';
import { DevTools } from 'hyper-scheduler/devtools';

const scheduler = new HyperScheduler({
    plugins: [
        // 仅在开发环境实例化插件
        process.env.NODE_ENV === 'development' && new DevTools({
            theme: 'dark',
            hotkey: 'ctrl+h'
        })
    ]
});
```

### DevTools 配置项

```typescript
new DevTools(options: DevToolsOptions)
```

| 分类 | 属性 | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- | :--- |
| **外观** | `theme` | `'auto'\|'dark'\|'light'` | `'auto'` | 主题模式。 |
| | `position` | `'bottom-right' ...` | `'bottom-right'` | 悬浮球初始位置。 |
| | `zIndex` | `number` | `9999` | 面板层级。 |
| **行为** | `hotkey` | `string \| false` | `'ctrl+h'` | 全局快捷键开关面板。 |
| | `defaultOpen` | `boolean` | `false` | 初始化时是否默认展开面板。 |
| | `closeOnEsc` | `boolean` | `true` | 是否允许按 ESC 关闭。 |
| **挂载** | `container` | `HTMLElement` | `document.body` | DOM 挂载点。 |
| **性能** | `maxHistory` | `number` | `50` | 单个任务保留的历史执行记录条数。 |
| | `refreshRate` | `number` | `500` | UI 刷新节流时间(ms)。 |

### 面板功能说明
1.  **Dashboard**: 显示总任务数、活跃任务数、实时 FPS。
2.  **列表视图**: 展示 ID, Tag, Interval, Count, Status。
3.  **Manual Trigger**: 每一行提供 **"运行"** 按钮，可忽略时间间隔强制触发一次（常用于接口调试）。
4.  **Timeline**: 可视化时间轴，查看任务触发的密集程度。

---

## 6. 框架集成最佳实践

### React (Hooks 封装)

```javascript
import { useEffect, useRef } from 'react';
import { scheduler } from './global-scheduler'; // 建议使用单例

export function useTask(config) {
    const taskId = useRef(null);

    useEffect(() => {
        // 组件挂载：创建任务
        taskId.current = scheduler.create(config);

        // 组件卸载：清理任务
        return () => {
            if (taskId.current) {
                scheduler.remove(taskId.current);
            }
        };
    }, []); // 依赖数组根据业务需求定义
}
```

### Vue 3 (Composable 封装)

```javascript
import { onUnmounted } from 'vue';
import { scheduler } from './global-scheduler';

export function useTask(config) {
    const taskId = scheduler.create(config);

    onUnmounted(() => {
        scheduler.remove(taskId);
    });
    
    return {
        stop: () => scheduler.stop(taskId),
        start: () => scheduler.start(taskId)
    };
}
```

### Node.js 环境
在 Node.js 中使用时，只需引入核心包。
*   `driver: 'worker'` 配置会被自动降级为原生 Timer。
*   如果误引入了 `DevTools`，插件会自动静默失败，不会导致程序崩溃。

---

## 7. 常见问题 (FAQ)

**Q1: 为什么开启了 `driver: 'worker'` 依然感觉有延迟？**
A: Web Worker 保证了**计时**的准确性，但 JS 主线程如果被长任务（Long Task）阻塞，回调函数依然需要排队等待执行。建议结合 DevTools 查看主线程 FPS。

**Q2: 可以在 `handler` 中操作 DOM 吗？**
A: 可以。虽然 Worker 模式下计时在后台线程，但 `handler` 回调始终通过 `postMessage` 抛回**主线程**执行，因此可以安全地操作 DOM 或访问 `window` 对象。

**Q3: 如何迁移现有的 `setInterval` 代码？**
A:
*   旧: `setInterval(fn, 1000)`
*   新: `scheduler.create({ interval: 1000, handler: fn })`
*   收益: 获得可视化监控，且页面切后台不会变慢。