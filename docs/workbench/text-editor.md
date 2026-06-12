# 文本编辑器（Workbench/text-editor）

> 基于 CodeMirror 6 的文本编辑器实现。
> 通过 Core 层 `editor-views` 插槽注册为 Provider，供系统统一调度。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **CodeMirror 6 编辑器封装**：初始化、销毁、内容同步
- **内容变化通知**：用户输入时触发 `onChange` 回调
- **保存快捷键**：捕获 `Ctrl+S` / `Cmd+S` 触发 `onSave` 回调
- **编辑器视图注册**：通过 `editorViewRegistry.register()` 注册为系统内置文本编辑器

### 不负责什么

- **文件读写** → Services 层 `fileSystem`（由 `editorManager` 调用）
- **标签页管理** → Services 层 `editorManager`
- **编辑器类型选择** → Core 层 `editor-views`
- **编辑器容器布局** → Workbench 层 `editor-area`

---

## 二、使用场景与示例

### 场景 1：注册为系统内置文本编辑器

```typescript
import { registerTextEditor } from '@/workbench/text-editor';

// App.tsx 初始化时
const unregister = registerTextEditor();
// 返回注销函数，组件卸载时调用
```

### 场景 2：EditorArea 渲染文本编辑器

```typescript
// EditorArea 内部通过 Provider 创建实例
const instance = provider.createEditor({
  filePath: '/path/to/file.ts',
  instanceId: 'editor-1',
  initialData: '文件内容...',
});

// instance.content 是 TextEditor React 组件
const EditorComp = instance.content;
return <EditorComp uri={uri} initialContent={content} onChange={...} onSave={...} />;
```

### 场景 3：用户编辑文件

用户在 CodeMirror 中输入 → `updateListener` 检测到 `docChanged` → 调用 `onChange(newContent)` → `EditorArea` 调用 `editorManager.setContent()` → `isDirty` 更新。

### 场景 4：用户保存文件

用户按 `Ctrl+S` → `domEventHandlers.keydown` 捕获 → 调用 `onSave()` → `EditorArea` 调用 `editorManager.save()` → 文件写入磁盘 → `isDirty` 变为 `false`。

---

## 三、依赖关系

### 依赖的模块

- **Core `editor-views`**：注册为 Provider

### 被依赖的模块

- **Workbench `editor-area`**：通过 Provider 获取 `TextEditor` 组件并渲染

---

## 四、状态与数据流

```
┌─────────────────┐     register()      ┌─────────────────┐
│  registerText   │ ─────────────────→ │  EditorView     │
│  Editor()       │                    │  Registry       │
│  (初始化时)      │                    │  (Core)         │
└─────────────────┘                    └─────────────────┘
                                                │
                                                │ getProvider('text')
                                                ↓
                                         ┌─────────────────┐
                                         │  Provider       │
                                         │  createEditor() │
                                         │  → 返回 TextEditor│
                                         └─────────────────┘
                                                │
                                                │ React 渲染
                                                ↓
                                         ┌─────────────────┐
                                         │  TextEditor     │
                                         │  (CodeMirror 6) │
                                         └─────────────────┘
                                                │
                       onChange / onSave ←──────┘
```

---

## 五、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| CodeMirror 初始化失败 | 由 React Error Boundary 捕获（后续实现） |
| 外部内容变化时编辑器未初始化 | `useEffect` 中检查 `viewRef.current`，未初始化时静默返回 |
| 保存快捷键冲突 | `event.preventDefault()` 阻止浏览器默认保存行为 |

---

## 六、设计决策记录

### 决策 1：Provider 返回 React 组件作为 `content`

- **原因**：Workbench 层明确是 React UI 层，返回 React 组件是最自然的表达。
- **注意**：`EditorViewInstance.content` 类型为 `unknown`，由调用方（EditorArea）按约定转换为 `React.FC`。

### 决策 2：CodeMirror 实例只初始化一次

- **原因**：CodeMirror 6 的 `EditorView` 创建成本较高，且内部状态（光标位置、滚动位置）需要保持。
- **实现**：`useEffect(() => { ... }, [])` 空依赖数组，只在挂载时初始化。
- **内容同步**：通过第二个 `useEffect` 监听 `initialContent` 变化，用 `view.dispatch({ changes: ... })` 更新文档。

### 决策 3：使用 `basicSetup` 作为基础扩展

- **原因**：`basicSetup` 包含行号、括号匹配、缩进、撤销/重做等常用功能，快速搭建可用编辑器。
- **演进**：后续可替换为自定义扩展集合，按需加载语言支持（`@codemirror/lang-javascript` 等）。

### 决策 4：快捷键通过 CodeMirror 的 `domEventHandlers` 捕获

- **原因**：CodeMirror 6 的 `domEventHandlers` 可以拦截编辑器 DOM 事件，比全局快捷键监听更精确（只在编辑器聚焦时生效）。
- **注意**：未来应迁移到 Core 层 Keybinding 模块，统一管理系统级快捷键。

---

## 七、待办事项

- [x] 实现 `TextEditor` 组件（CodeMirror 6 封装）
- [x] 实现 `registerTextEditor()` 注册函数
- [ ] 支持语法高亮（根据文件扩展名加载对应 language 扩展）
- [ ] 支持主题切换（跟随系统明暗主题）
- [ ] 支持字体大小调整
- [ ] 支持 minimap（代码缩略图）
- [ ] 支持多光标/多选区
- [ ] 与 Core Keybinding 模块对接：统一快捷键管理

---

*本模块遵循 [architecture.md](../architecture.md) 中 Workbench 层职责边界和依赖方向规则。*
