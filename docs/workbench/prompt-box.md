# 输入框组件（Workbench/prompt-box）

> Workbench 表现层的全局模态输入框 UI。
> 订阅 Services 层 `prompt` 的 Zustand store 状态，渲染 VS Code 风格的顶部中央输入框。

- 创建日期：2025-06-11
- 最后更新：2025-06-11（重构：常驻触发按钮 + 命令面板模式）
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **常驻触发按钮渲染**：顶部中央常驻的 `⌘ 搜索或命令...` 按钮
- **展开面板渲染**：点击触发按钮后展开为命令面板或输入框
- **命令面板渲染**：列出所有已注册命令，支持搜索过滤和选择执行
- **键盘事件处理**：`Enter` 确认、`Esc` 取消、`↑/↓` 切换选中项
- **输入值同步**：用户输入时同步到 store，触发校验（input 模式）或过滤命令（command 模式）
- **视觉反馈**：标题、占位符、校验错误提示、选中项高亮

### 不负责什么

- **请求队列管理** → Services 层 `prompt`
- **结果解析（Promise resolve/reject）** → Services 层 `prompt` store
- **校验逻辑** → 由调用方传入，store 执行
- **命令式调用接口** → Services 层 `prompt`

---

## 二、核心设计

### 视觉规格

#### 默认状态：触发按钮

```
┌─────────────────────────────────────────┐
│                                         │
│        ┌─────────────────────┐          │
│        │ ⌘ 搜索或命令...       │          │  ← 顶部中央常驻
│        └─────────────────────┘          │
│                                         │
│  [编辑器内容区域]                        │
│                                         │
└─────────────────────────────────────────┘
```

- **位置**：`position: fixed`，距顶 `12px`，水平居中
- **宽度**：`400px`，最大宽度 `80vw`
- **背景**：`#f5f5f5`，边框 `#e0e0e0`
- **圆角**：`6px`
- **层级**：`z-index: 1000`
- **交互**：hover 时背景变白、阴影加深

#### 展开状态：命令面板 / 输入框

```
┌─────────────────────────────────────────┐
│                                         │
│     ┌─────────────────────────────┐     │
│     │ 输入命令名称...              │     │
│     └─────────────────────────────┘     │
│     ┌─────────────────────────────┐     │
│     │ > 文件: 打开文件              │     │
│     │ > 文件: 保存文件              │     │
│     └─────────────────────────────┘     │
│                                         │
│  [编辑器内容区域]                        │
│                                         │
└─────────────────────────────────────────┘
```

- **位置**：同触发按钮位置，展开后宽度变为 `560px`
- **背景**：`#ffffff`，阴影 `0 4px 20px rgba(0,0,0,0.15)`
- **无遮罩层**：不遮挡背景，用户可继续看到编辑器内容

### 与 Store 的交互

```typescript
// PromptBox 组件内部
const current = usePromptStore((s) => s.current);
const inputValue = usePromptStore((s) => s.inputValue);
const error = usePromptStore((s) => s.error);

// 输入变化
const handleChange = (e) => {
  store.getState().setInputValue(e.target.value);
};

// 确认
const handleConfirm = () => {
  store.getState().resolve(inputValue);
};

// 取消
const handleCancel = () => {
  store.getState().reject();
};
```

---

## 三、使用场景与示例

### 场景 1：App.tsx 中挂载

```typescript
import { Layout } from '@/workbench/layout';
import { PromptBox } from '@/workbench/prompt-box';

function App() {
  return (
    <>
      <Layout layout={layout} />
      <PromptBox />
    </>
  );
}
```

### 场景 2：点击触发按钮展开命令面板

用户点击顶部中央的 `⌘ 搜索或命令...` → 调用 `prompt.showCommands()` → store 状态变为 `visible=true, mode='command'` → PromptBox 重新渲染为展开面板 → 显示命令列表 → 用户输入过滤命令 → `↑/↓` 切换选中项 → `Enter` 执行命令。

### 场景 3：用户编辑时实时校验（input 模式）

用户在输入框中输入 → `onChange` 触发 → store 更新 `inputValue` → store 调用 `validate()` → 若有错误，更新 `error` 状态 → PromptBox 显示错误提示 → Enter 被禁用直到错误消除。

### 场景 4：输入框显示时自动聚焦

`visible` 从 `false` 变为 `true` → PromptBox 渲染展开面板 → `useEffect` 中 `inputRef.current?.focus()` → 用户可直接输入。

---

## 四、依赖关系

### 依赖的模块

- **Services `prompt`**：订阅 Zustand store 状态，调用 store actions

### 被依赖的模块

- **App.tsx**：在根组件中挂载 `<PromptBox />`

---

## 五、状态与数据流

```
┌─────────────────┐
│  PromptStore    │  ← Zustand (Services)
│  (Services)     │
│  { visible,    │
│    mode,       │
│    current,    │
│    inputValue, │
│    error,      │
│    selectedIndex,│
│    resolve,    │
│    reject }    │
└─────────────────┘
         │
         │ usePromptStore() 订阅
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
│  + 错误提示     │
│                 │
│  visible=true   │
│  mode='command' │
│  → 渲染命令列表 │
│  + 搜索过滤     │
│  + 选中高亮     │
│                 │
│  Enter/Esc      │
│  → resolve/reject│
└─────────────────┘
         │
         │ resolve / reject
         ↓
┌─────────────────┐
│  PromptStore    │
│  处理队列下一个  │
│  无队列则       │
│  visible=false  │
└─────────────────┘
```

---

## 六、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 触发按钮点击 | 调用 `prompt.showCommands()`，展开为命令面板 |
| 展开面板时 store 无 current | 按 `mode` 渲染：command 模式显示所有命令，input 模式显示空输入框 |
| 校验错误时按 Enter（input 模式） | 阻止确认，保持面板打开 |
| 命令列表为空（command 模式） | 显示"无匹配命令"提示 |
| 面板失去焦点 | 不自动关闭（必须显式 Enter/Esc） |
| 快速连续按键 | 由 React 事件系统自然节流 |

---

## 七、设计决策记录

### 决策 1：常驻触发按钮 + 展开面板

- **原因**：VS Code 的 Command Palette 不是"弹窗"而是"常驻入口"。用户随时可以看到并点击触发按钮，不需要记忆快捷键。其他模块调用 `prompt.show()` 时，触发按钮自动展开为输入框。
- **状态**：`visible` 字段控制两种形态。`visible=false` 时渲染触发按钮，`visible=true` 时渲染展开面板。

### 决策 2：命令面板与输入框共享同一组件

- **原因**：两者都是"顶部中央的输入+选择界面"，视觉和交互高度相似。分离为两个组件会增加维护成本。
- **实现**：通过 `mode` 字段切换内部渲染。`mode='command'` 时显示命令列表，`mode='input'` 时显示标题+输入框+错误提示。

### 决策 3：Enter 确认、Esc 取消

- **原因**：符合 VS Code 和大多数 IDE 的惯例，用户无需学习。
- **校验失败时**：Enter 被阻止，用户必须先修正输入或按 Esc 取消。

### 决策 4：纯 CSS 实现，不引入组件库

- **原因**：当前阶段快速推进，输入框结构简单（一个 div + input + 错误提示）。Radix UI 等组件库在需要复杂交互（下拉选择、多步骤向导）时引入。
- **演进**：未来扩展为 `prompt.pick()`（选择列表）时，再引入 `@radix-ui/react-select` 或 `@radix-ui/react-dialog`。

### 决策 5：store 的 resolve/reject 由 PromptBox 直接调用

- **原因**：PromptBox 是 store 的"视图层"，直接调用 action 是最自然的模式。不需要通过 Services 层中转。
- **边界**：PromptBox 只调用 `resolve`/`reject`/`setInputValue`，不操作队列逻辑（队列由 store 内部管理）。

---

## 八、待办事项

- [x] 实现 `PromptBox` React 组件（触发按钮 + 展开面板）
- [x] 实现 CSS 样式（触发按钮、展开面板、命令列表）
- [x] 实现键盘事件（Enter、Esc、↑/↓）
- [x] 实现自动聚焦
- [x] 实现显示/隐藏过渡动画
- [x] 与 `prompt` store 对接：订阅和 action 调用
- [x] 在 `App.tsx` 中挂载 `<PromptBox />`
- [ ] 支持命令面板快捷键绑定（如 `Ctrl+Shift+P`）
- [ ] 支持命令图标显示
- [ ] 支持最近使用命令排序

---

*本模块遵循 [architecture.md](../architecture.md) 中 Workbench 层职责边界和依赖方向规则。*
