# 用户输入服务（Services/prompt）

> 提供全局模态输入框的底层状态管理和命令式调用接口。
> 基于 Zustand 管理请求队列，UI 渲染由 Workbench 层 `prompt-box` 负责。

- 创建日期：2025-06-11
- 最后更新：2025-06-11（重构：常驻触发按钮 + 命令面板模式）
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **请求队列管理**：多个并发调用时排队处理
- **双模式状态管理**：`input` 模式（输入框）和 `command` 模式（命令面板）
- **常驻/展开状态**：`visible` 控制面板是否展开，默认显示触发按钮
- **命令式接口**：`show()` 返回 Promise 等待输入，`showCommands()` 返回 Promise 等待命令选择
- **结果解析**：用户确认时 resolve 值，取消时 resolve `undefined`

### 不负责什么

- **输入框 UI 渲染** → Workbench 层 `prompt-box`
- **键盘事件捕获** → Workbench 层 `prompt-box`
- **样式和动画** → Workbench 层 `prompt-box`
- **校验函数的具体实现** → 由调用方传入

---

## 二、核心设计

### Zustand Store 架构

采用 `zustand/vanilla`（非 React 绑定版）创建 store，Services 层直接操作，Workbench 层通过 `useStore` 订阅。

```
┌─────────────────────────────────────────────┐
│              Zustand Store                   │
│  ┌───────────────────────────────────────┐  │
│  │  state                                │  │
│  │  {                                    │  │
│  │    visible: boolean,                  │  │
│  │    mode: 'input' | 'command',         │  │
│  │    queue: PromptRequest[],            │  │
│  │    current: PromptRequest | null,       │  │
│  │    inputValue: string,                │  │
│  │    error: string | undefined,          │  │
│  │    selectedIndex: number,             │  │
│  │  }                                    │  │
│  └───────────────────────────────────────┘  │
│         ↑                    ↑               │
│    getState()           setState()            │
│         │                    │               │
│  ┌──────┴────────────────────┴──────┐         │
│  │  Actions                          │         │
│  │  show() / showCommands()         │         │
│  │  → resolve() / reject()        │         │
│  │  setInputValue()                  │         │
│  └──────────────────────────────────┘         │
└─────────────────────────────────────────────┘
         ↑                           ↑
    Services 调用              Workbench 订阅
```

### 双模式设计

| 模式 | 用途 | 触发方式 |
|------|------|----------|
| `input` | 向用户询问文本输入 | `prompt.show({ title: '...' })` |
| `command` | 列出所有命令供用户选择执行 | `prompt.showCommands()` 或点击触发按钮 |

两种模式共享同一个 UI 容器，通过 `mode` 字段切换内部渲染。

同一时间只能有一个输入框显示。若 `show()` 被调用时已有输入框显示，新请求进入队列，等待当前请求完成后自动弹出。

```typescript
// 场景：用户同时触发两个输入框
const a = prompt.show({ title: '输入文件名' });  // 立即显示
const b = prompt.show({ title: '输入文件夹' });  // 进入队列

// 用户完成第一个后，第二个自动显示
```

---

## 三、使用场景与示例

### 场景 1：简单输入

```typescript
import { prompt } from '@/services';

const fileName = await prompt.show({
  title: '请输入文件名',
  placeholder: '例如: index.ts',
});

if (fileName) {
  console.log('用户输入:', fileName);
}
```

### 场景 2：带默认值和校验

```typescript
const folderName = await prompt.show({
  title: '新建文件夹',
  value: 'untitled',
  validate: (v) => {
    if (!v.trim()) return '名称不能为空';
    if (v.includes('/')) return '不能包含 /';
    if (v.includes('\\')) return '不能包含 \\';
    return undefined; // 校验通过
  },
});
```

### 场景 3：显示命令面板

```typescript
import { prompt } from '@/services';

const commandId = await prompt.showCommands();
// 用户选择命令后返回 commandId，取消返回 undefined

if (commandId) {
  await commandExecutor.execute(commandId);
}
```

### 场景 4：调用方取消（超时或条件取消）

```typescript
const controller = new AbortController();

// 5 秒后自动取消
const timeout = setTimeout(() => controller.abort(), 5000);

const result = await prompt.show({
  title: '紧急确认',
}, { signal: controller.signal });

clearTimeout(timeout);
```

---

## 四、依赖关系

### 依赖的模块

- **zustand**（外部依赖）：全局状态管理

### 被依赖的模块

- **Workbench `prompt-box`**：订阅 store 状态，渲染触发按钮或展开面板
- **任何需要用户输入的模块**：通过 `prompt.show()` 发起请求
- **命令系统**：`showCommands()` 读取 `commandRegistry` 获取命令列表

---

## 五、状态与数据流

```
调用方代码
    │
    │ await prompt.show({ title: '...' })
    │ 或 prompt.showCommands()
    ↓
┌─────────────────┐
│  PromptStore    │  ← Zustand vanilla store
│  (Services)     │
│                 │
│  1. 创建请求    │
│  2. 加入队列    │
│  3. 若队首，    │
│     设为 current│
│  4. visible=true│
│  5. 返回 Promise│
└─────────────────┘
         │
         │ state.visible / mode 变化
         ↓
┌─────────────────┐
│  PromptBox      │  ← React 组件 (Workbench)
│  (Workbench)    │
│                 │
│  visible=false  │
│  → 渲染触发按钮 │
│                 │
│  visible=true   │
│  mode='input'   │
│  → 渲染输入框   │
│                 │
│  mode='command' │
│  → 渲染命令列表 │
└─────────────────┘
         │
         │ 用户按 Enter / Esc
         ↓
┌─────────────────┐
│  PromptStore    │
│                 │
│  resolve(value) │  或  reject()
│  处理队列下一个  │
│  无队列则       │
│  visible=false  │
└─────────────────┘
         │
         │ Promise resolve
         ↓
┌─────────────────┐
│  调用方收到结果  │
└─────────────────┘
```

---

## 六、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 校验失败 | 不阻断输入，显示错误提示，禁用确认 |
| 队首请求被 resolve/reject | 自动检查队列，若有下一个请求立即设为 current |
| 调用方组件卸载 | Promise 仍挂起，用户完成输入后正常 resolve |
| 空输入 + 无校验 | 允许空字符串作为有效输入 |

---

## 七、设计决策记录

### 决策 1：使用 Zustand 而非自建状态管理

- **原因**：项目已有 6+ 模块各自维护状态，未来需要统一。Zustand 极轻量（~1KB），支持 vanilla（非 React）和 React 两种用法，TypeScript 友好。
- **用法**：Services 层用 `createStore()`（vanilla），Workbench 层用 `useStore`（React hook）。

### 决策 2：Services 层暴露 `show()` 和 `showCommands()`

- **原因**：调用方需要两种能力——询问文本输入（`show`）和选择命令（`showCommands`）。两者底层共享同一个 store 和队列。
- **实现**：`IPrompt` 接口包含两个方法。store 的 `resolve`/`reject` 由 Workbench 层通过 store 实例直接调用。

### 决策 3：队列机制而非覆盖机制

- **原因**：覆盖会导致前一个 Promise 永远挂起（内存泄漏）。队列保证每个请求都有结果。
- **实现**：FIFO 队列，当前请求完成后自动弹出下一个。

### 决策 4：校验由调用方传入，store 只负责执行

- **原因**：校验逻辑是业务相关的（文件名校验、路径校验等），不属于 prompt 模块。
- **实现**：`validate` 作为 `PromptOptions` 的可选字段，store 在输入变化时调用。

### 决策 5：取消返回 `undefined` 而非抛异常

- **原因**：输入框的"取消"是正常用户行为，不是错误。返回 `undefined` 让调用方用 `if (result)` 判断最自然。
- **注意**：未来若需要区分"取消"和"关闭"，可扩展为返回 `{ value?: string, cancelled: boolean }`。

---

## 八、待办事项

- [x] 实现 `PromptStore`（Zustand vanilla store）
- [x] 实现 `IPrompt` 接口和 `show()` / `showCommands()` 方法
- [x] 与 `prompt-box`（Workbench）对接：状态订阅和渲染
- [ ] 支持 `AbortSignal` 取消（可选增强）
- [ ] 支持历史记录（上/下箭头浏览最近输入）
- [ ] 支持命令面板快捷键绑定（如 `Ctrl+Shift+P`）

---

*本模块遵循 [architecture.md](../architecture.md) 中 Services 层职责边界和依赖方向规则。*
