# 编辑器区域（Workbench/editor-area）

> Workbench 表现层的编辑器容器组件。
> 负责渲染标签页栏和当前激活的编辑器内容，通过 editorManager 获取状态。

- 创建日期：2025-06-11
- 最后更新：2025-06-11（重构：EditorArea 改用 useEditorStore 订阅 Zustand 状态）
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **标签页栏渲染**：显示所有打开的标签页，支持点击切换、关闭按钮
- **当前编辑器渲染**：通过 `editorViewRegistry` 获取 Provider，渲染对应编辑器组件
- **脏状态视觉反馈**：未保存的标签页标题显示标记（如 `●`）
- **内容变化透传**：编辑器内容变化时调用 `editorManager.setContent()`
- **保存快捷键透传**：编辑器触发保存时调用 `editorManager.save()`

### 不负责什么

- **标签页生命周期管理**（打开、关闭、保存逻辑） → Services 层 `editorManager`
- **编辑器类型选择** → Core 层 `editor-views` + Services 层 `editorManager`
- **具体编辑器实现**（CodeMirror、图片预览器等） → 各编辑器 Provider
- **布局容器管理** → Workbench 层 `layout`

---

## 二、使用场景与示例

### 场景 1：作为中间插槽内容注入布局

```typescript
import { layout } from '@/workbench';
import { EditorArea } from '@/workbench/editor-area/EditorArea';

// App.tsx 初始化时
layout.setSlotContent('center', <EditorArea />);
```

### 场景 2：标签页点击切换

用户点击标签页栏中的某个标签 → 调用 `editorManager.activate(instanceId)` → 状态变化触发重新渲染 → 显示对应编辑器内容。

### 场景 3：编辑器内容变化

用户在 CodeMirror 中输入 → `TextEditor` 触发 `onChange` → `EditorArea` 调用 `editorManager.setContent()` → `isDirty` 自动更新 → 标签页标题显示 `●`。

---

## 三、依赖关系

### 依赖的模块

- **Services `editorManager`**：调用激活/关闭/保存/设置内容
- **Services `editorStore`**：通过 `useEditorStore` 订阅状态
- **Core `editor-views`**：获取 Provider 创建编辑器实例

### 被依赖的模块

- **Workbench `layout`**：将 `EditorArea` 设置为 `center` 插槽内容

---

## 四、状态与数据流

```
┌─────────────────┐     useEditorStore()   ┌─────────────────┐
│  EditorStore    │ ←──────────────────────│  EditorArea     │
│  (Zustand)      │                        │  (Workbench)    │
│  {tabs,        │                        │                 │
│   activeTabId} │                        │  直接订阅状态   │
└─────────────────┘                        │  无需 useEffect │
         ↑                                 └─────────────────┘
         │                                          │
         │ editorManager.open() / close()           │ getProvider(typeId)
         │ activate() / setContent() / save()         ↓
         │                                   ┌─────────────────┐
         │                                   │  EditorView     │
         │                                   │  Registry       │
         │                                   │  (Core)         │
         │                                   └─────────────────┘
         │                                          │
         │                                          │ createEditor(...)
         │                                          ↓
         │                                   ┌─────────────────┐
         │                                   │  Provider       │
         │                                   │  (如 TextEditor) │
         │                                   └─────────────────┘
         │                                          │
         │                                          │ React 组件渲染
         │                                          ↓
         │                                   ┌─────────────────┐
         │                                   │  用户看到的     │
         │                                   │  编辑器内容     │
         │                                   └─────────────────┘
         │
    ┌────┴─────────────────┐
    │  StatusBar           │  (未来)
    │  useEditorStore()    │
    └──────────────────────┘
```

---

## 五、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 未找到编辑器类型 Provider | 显示错误提示："未找到编辑器类型: {typeId}" |
| 标签页列表为空 | 显示占位提示："点击右侧文件打开编辑器" |
| 编辑器组件内部报错 | 由 React Error Boundary 处理（后续实现） |

---

## 六、设计决策记录

### 决策 1：EditorArea 直接调用 editorViewRegistry 获取 Provider

- **原因**：Provider 返回的是 React 组件，EditorArea 需要直接渲染它。让 editorManager 中转会增加不必要的抽象层。
- **权衡**：轻微违反"Workbench 不直接操作 Core 注册表"的原则，但 Provider 创建是轻量工厂调用，不涉及业务状态。

### 决策 2：标签页栏和编辑器内容在同一组件内

- **原因**：两者强耦合（标签页切换决定显示哪个编辑器），分离为两个组件会增加 props drilling。
- **演进**：未来分屏支持时，可能需要拆分为 `EditorGroup`（含标签页栏 + 编辑器区）。

### 决策 3：编辑器实例通过 `key={instanceId}` 强制重新挂载

- **原因**：切换标签页时，不同文件的编辑器需要完全重置状态（如 CodeMirror 的 doc、selection）。
- **实现**：`<EditorContent key={activeTab.instanceId} ... />`，React 会在 instanceId 变化时卸载并重新挂载。

---

## 七、待办事项

- [x] 实现 `EditorArea` 组件（标签页栏 + 编辑器内容区）
- [ ] 实现 React Error Boundary 包裹编辑器内容
- [ ] 支持分屏/多编辑器组
- [ ] 支持标签页拖拽排序
- [ ] 支持标签页右键菜单（关闭、关闭其他、关闭右侧）
- [ ] 支持编辑器面包屑/路径显示

---

*本模块遵循 [architecture.md](../architecture.md) 中 Workbench 层职责边界和依赖方向规则。*
