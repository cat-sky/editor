# 编辑器管理服务（Services/editorManager）

> 管理编辑器标签页的生命周期：打开、关闭、激活、保存。
> 通过 editorViewRegistry 选择编辑器类型，通过 fileSystem 读写文件。

- 创建日期：2025-06-11
- 最后更新：2025-06-11（重构：Zustand store 替代 class + listeners）
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **标签页生命周期管理**：打开文件、关闭标签页、激活标签页
- **编辑器类型选择**：打开文件时通过 `editorViewRegistry.resolve()` 选择最佳编辑器类型
- **文件内容读写**：打开时读取文件内容，保存时写入文件内容
- **脏状态跟踪**：对比当前内容与原始内容，标记 `isDirty`
- **全局状态管理**：基于 Zustand store 管理标签页状态，供 Workbench 层各组件订阅

### 不负责什么

- **具体编辑器的 UI 渲染** → Workbench 层 `editor-area`
- **编辑器类型注册** → Core 层 `editor-views`
- **文件系统底层操作** → Services 层 `fileSystem`
- **工作区/文件夹管理** → Services 层 `workspace`（后续）
- **标签页栏的 UI 样式** → Workbench 层 `editor-area`

---

## 二、使用场景与示例

### 场景 1：打开文件

```typescript
import { editorManager } from '@/services';
import { URI } from 'vscode-uri';

const uri = URI.file('/path/to/file.ts');
const tab = await editorManager.open(uri);
// tab: { instanceId, uri, typeId, title, content, isDirty }
```

### 场景 2：关闭标签页

```typescript
editorManager.close(tab.instanceId);
```

### 场景 3：激活标签页

```typescript
editorManager.activate(tab.instanceId);
```

### 场景 4：保存当前激活标签页

```typescript
await editorManager.save(); // 保存当前激活的标签页
await editorManager.save(tab.instanceId); // 保存指定标签页
```

### 场景 5：更新内容（编辑器输入时）

```typescript
editorManager.setContent(tab.instanceId, newContent);
// 内部自动计算 isDirty（与原始内容对比）
```

### 场景 6：订阅状态变化（Zustand）

```typescript
import { useEditorStore } from '@/services';

// EditorArea 组件内
const tabs = useEditorStore((s) => s.tabs);
const activeTabId = useEditorStore((s) => s.activeTabId);

// 任意组件都可以直接订阅，无需 useEffect + useState
```

### 场景 7：命令式调用（保持 class 风格）

```typescript
import { editorManager } from '@/services';

// 打开、关闭、激活、保存仍通过命令式 API
await editorManager.open(uri);
editorManager.close(instanceId);
editorManager.activate(instanceId);
await editorManager.save();
```

---

## 三、依赖关系

### 依赖的模块

- **Services `fileSystem`**：读取文件内容、写入文件
- **Core `editor-views`**：选择适用的编辑器类型

### 被依赖的模块

- **Workbench `editor-area`**：通过 `useEditorStore` 订阅状态，渲染标签页和编辑器内容
- **Workbench `statusbar`**（未来）：订阅 `activeTabId` 显示当前文件
- **Workbench `panel`**（未来）：订阅 `tabs` 显示打开的文件列表
- **Core `commands`**：`file.open`、`file.save` 命令的 handler 调用 `editorManager`

---

## 四、状态与数据流

```
┌─────────────────┐     open(uri)      ┌─────────────────┐
│  Workbench      │ ─────────────────→ │  EditorManager  │
│  (用户点击文件)  │                    │  (Services)     │
└─────────────────┘                    └─────────────────┘
                                              │
                                              │ readFileString(uri)
                                              ↓
                                       ┌─────────────────┐
                                       │  FileSystem     │
                                       │  (Services)     │
                                       └─────────────────┘
                                              │
                                              │ resolve(uri.fsPath)
                                              ↓
                                       ┌─────────────────┐
                                       │  EditorView     │
                                       │  Registry       │
                                       │  (Core)         │
                                       └─────────────────┘
                                              │
                                              │ 创建 EditorTab
                                              ↓
                                       ┌─────────────────┐
                                       │  EditorStore    │
                                       │  (Zustand)      │
                                       │  {tabs,        │
                                       │   activeTabId} │
                                       └─────────────────┘
                                              │
                                              │ useEditorStore()
                                              ↓
                                       ┌─────────────────┐
                                       │  EditorArea     │
                                       │  (Workbench)    │
                                       └─────────────────┘
                                              ↑
                                              │ useEditorStore()
                                              ↓
                                       ┌─────────────────┐
                                       │  StatusBar      │
                                       │  (Workbench)    │
                                       │  (未来)         │
                                       └─────────────────┘
```

---

## 五、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 打开已存在的文件 | 激活已有标签页，不重复打开 |
| 文件不存在 | `fileSystem.readFileString()` 抛出错误，向上传递 |
| 保存时文件被删除 | `fileSystem.writeFile()` 自动创建父目录，若仍失败则抛出错误 |
| 关闭不存在的标签页 | 静默忽略 |
| 激活不存在的标签页 | 静默忽略 |
| 设置内容给不存在的标签页 | 静默忽略 |

---

## 六、设计决策记录

### 决策 1：标签页去重（同一文件只打开一次）

- **原因**：避免用户 confusion，同一文件多个标签页容易丢失修改上下文。
- **实现**：通过 `uri.toString()` 作为唯一键判断。

### 决策 2：脏状态通过原始内容对比计算

- **原因**：简单可靠，不需要额外的 dirty flag 管理。
- **注意**：保存后更新 `originalContent`，撤销回原始内容时 `isDirty` 正确变为 `false`。

### 决策 3：状态管理采用 Zustand store 替代 class + listeners

- **原因**：
  1. 消除手动订阅/取消订阅的样板代码（`useState` + `useEffect` + `onStateChange`）
  2. 多个 Workbench 组件可直接订阅，无需各自维护 listeners
  3. 与 `prompt` 模块统一状态管理方案，降低心智负担
  4. 细粒度订阅：组件只订阅需要的字段（如 `statusbar` 只订阅 `activeTabId`），避免不必要的重渲染
- **实现**：Services 层用 `zustand/vanilla` 创建 store，Workbench 层用 `useStore` 订阅。
- **保留**：命令式 API（`open()`、`close()`、`activate()`、`save()`、`setContent()`）仍通过 `editorManager` 实例调用，因为涉及异步操作和外部依赖（`fileSystem`、`editorViewRegistry`）。

### 决策 4：instanceId 由 EditorManager 生成

- **原因**：保证全局唯一，避免不同 Provider 生成冲突 ID。
- **实现**：内部计数器 `editor-${++counter}`。

---

## 七、待办事项

- [x] 实现 `EditorManager` 类（打开、关闭、激活、保存）
- [x] 实现 `onStateChange` 状态订阅
- [x] 重构为 Zustand store（`editorStore`）
- [ ] 支持分屏/多编辑器组（当前仅单组标签页）
- [ ] 支持标签页拖拽排序
- [ ] 支持"关闭其他"、"关闭右侧"等批量操作
- [ ] 支持未保存修改的退出确认
- [ ] 与 `workspace` 模块对接：恢复上次打开的文件

---

*本模块遵循 [architecture.md](../architecture.md) 中 Services 层职责边界和依赖方向规则。*
