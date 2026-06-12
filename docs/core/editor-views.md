# 编辑器视图系统（Core/editor-views）

> Core 层的编辑器视图类型注册与路由系统。
> 注册的是"编辑器视图类型"（工厂/Provider），不是具体的 UI 实例。
> 负责：有哪些编辑器类型、这个文件该用哪种类型打开。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **编辑器视图类型注册表**：注册、注销、查询编辑器视图类型
- **文件路由逻辑**：输入文件路径 → 返回最佳编辑器视图类型（支持优先级、用户覆盖）
- **Provider 接口定义**：创建编辑器视图实例的工厂方法签名
- **元数据管理**：id、名称、文件匹配模式、优先级、是否只读等

### 不负责什么

- **具体编辑器的 UI 渲染** → Workbench 层（`editor-area` 负责标签页/分屏容器，具体编辑器组件由注册方提供）
- **编辑器实例的生命周期管理**（打开、关闭、切换、状态保存） → Services 层 `editorManager`
- **文件内容的读写** → Services 层 `fileSystem`
- **内置文本编辑器的具体实现** → 通过本模块的插槽注册，但实现由 Workbench 层提供

---

## 二、核心概念

### 编辑器视图类型（EditorViewType）

一种"编辑器工厂"的元数据描述，例如：

| id | 名称 | 匹配模式 | 示例 |
|----|------|----------|------|
| `text` | 文本编辑器 | `*`（默认回退） | CodeMirror 文本编辑 |
| `image-preview` | 图片预览 | `*.png, *.jpg, *.gif` | 图片查看器 |
| `video-player` | 视频播放器 | `*.mp4, *.webm` | 视频播放 |
| `block-editor` | 块编辑器 | `*.block` | Notion 风格块编辑 |

### Provider（工厂）

每个编辑器视图类型对应一个 Provider，负责创建该类型的编辑器实例。Workbench 层在打开文件时调用 Provider 获取渲染组件。

### 文件路由（File → EditorViewType）

```
文件路径
    ↓
按 filenamePattern / extension 匹配所有关联的 EditorViewType
    ↓
按优先级排序（user configured > builtin default）
    ↓
返回候选列表，第一个为默认
```

---

## 三、使用场景与示例

### 场景 1：Workbench 层注册内置文本编辑器

```typescript
import { editorViewRegistry } from '@/core';

// 注册内置文本编辑器（通过插槽注册，和自定义编辑器平级）
editorViewRegistry.register({
  id: 'text',
  name: '文本编辑器',
  priority: 0,                    // 最低优先级，作为默认回退
  filenamePatterns: ['*'],         // 匹配所有文件
  provider: TextEditorProvider,   // 工厂类
});
```

### 场景 2：扩展/插件注册图片预览编辑器

```typescript
editorViewRegistry.register({
  id: 'image-preview',
  name: '图片预览',
  priority: 100,                  // 高优先级，覆盖默认文本编辑器
  filenamePatterns: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp', '*.svg'],
  provider: ImagePreviewProvider,
});
```

### 场景 3：打开文件时选择编辑器类型

```typescript
import { editorViewRegistry } from '@/core';

// Services / Workbench 层在打开文件时调用
const candidates = editorViewRegistry.resolve('/path/to/photo.png');
// 返回按优先级排序的候选列表
// [{ id: 'image-preview', ... }, { id: 'text', ... }]

// 使用第一个（默认）
const selected = candidates[0];
const provider = editorViewRegistry.getProvider(selected.id);
// provider.createEditor(...) → 返回编辑器实例组件
```

### 场景 4：用户手动选择"用文本编辑器打开"

```typescript
// 获取所有能打开 .png 的编辑器类型
const allForPng = editorViewRegistry.resolve('/path/to/photo.png');
// 用户在菜单中选择第二个（文本编辑器）
const userChoice = allForPng[1];
```

---

## 四、依赖关系

### 依赖的模块

- 无（Core 层最底层基础设施）

### 被依赖的模块

- **Services 层 `editorManager`**：管理编辑器实例时，通过本模块获取 Provider 创建实例
- **Workbench 层 `editor-area`**：渲染编辑器区域时，通过本模块获取对应编辑器组件
- **Workbench 层命令/菜单**："重新打开方式"功能需要查询本模块的候选列表

---

## 五、状态与数据流

```
┌─────────────────┐     register / unregister     ┌─────────────────┐
│  Workbench /    │ ─────────────────────────────→│  EditorView     │
│  扩展 / 插件     │                               │  Registry       │
│  (Provider 注册方)│                               │  (id → type)    │
└─────────────────┘                               └─────────────────┘
         │                                               │
         │ resolve(filePath)                             │ getProvider(id)
         │                                               │
         ↓                                               ↓
┌─────────────────┐                               ┌─────────────────┐
│  EditorManager  │                               │  EditorInstance │
│  (Services)     │                               │  (Workbench)    │
│  选择最佳类型    │                               │  渲染具体 UI   │
└─────────────────┘                               └─────────────────┘
```

---

## 六、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 重复注册同一 id | **覆盖策略**：后注册者覆盖前者（便于扩展覆盖内置） |
| 文件路径无匹配类型 | 返回内置 `text` 类型作为默认回退；若 `text` 也未注册，返回空数组 |
| 获取未注册的 Provider | 返回 `undefined`，调用方自行处理 |
| 文件路径为空/非法 | 返回空数组，调用方决定行为 |

---

## 七、设计决策记录

### 决策 1：内置编辑器也通过插槽注册

- **原因**：保持架构一致性。内置文本编辑器不是特权模块，和自定义编辑器平级，都通过 `editorViewRegistry.register()` 注册。这样系统不硬编码任何编辑器类型。
- **初始化**：App.tsx 初始化时，Workbench 层先注册内置编辑器，再加载扩展。

### 决策 2：id 为唯一键，覆盖策略

- **原因**：扩展需要能覆盖内置行为（如用自定义 Markdown 编辑器覆盖默认文本编辑器）。后注册者覆盖前者，符合 VS Code 扩展机制。

### 决策 3：Provider 只定义工厂接口，不约束渲染技术

- **原因**：编辑器可能是 React 组件、WebGL Canvas、iframe 等。Provider 返回的实例类型保持抽象（如 `ReactNode` 或更通用的 `EditorInstance`），不强制具体渲染方案。

### 决策 4：文件路由在 Core 层，实例管理在 Services 层

- **原因**："用什么编辑器打开"是全局规则（Core），"当前打开了哪些实例"是有状态业务（Services）。分离后，Workbench 只负责渲染，不管理打开逻辑。

### 决策 5：filenamePatterns 支持 glob 风格

- **原因**：简单直观，覆盖绝大多数场景。复杂匹配（如根据文件内容魔数判断）可由 Provider 的 `canHandle` 方法扩展。

---

## 八、待办事项

- [ ] 实现 `IEditorViewRegistry` 和 `IEditorViewProvider` 的具体类
- [ ] 实现 `core/index.ts` 统一初始化并导出实例
- [ ] 支持用户自定义默认编辑器（用户配置覆盖内置优先级）
- [ ] 扩展 Provider 接口：支持 `canHandle(uri, contentHint)` 动态判断
- [ ] 与 `editorManager`（Services）对接：实例创建时调用 Provider
- [ ] 与 `editor-area`（Workbench）对接：渲染 Provider 返回的编辑器组件

---

*本模块遵循 [architecture.md](../architecture.md) 中 Core 层职责边界和依赖方向规则。*
