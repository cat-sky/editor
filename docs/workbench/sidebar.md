# 侧边栏（Workbench/sidebar）

> Workbench 表现层的侧边栏容器，当前包含文件树视图。
> 未来可扩展为 Activity Bar + Side Panel 模式，支持多个视图切换。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **文件树渲染**：显示目录结构，支持展开/收起子目录
- **文件点击交互**：点击文件触发 `file.open` 命令打开编辑器
- **目录展开/收起**：异步加载子目录内容
- **视觉层级**：目录在前、文件在后，按名称排序

### 不负责什么

- **文件系统底层操作** → Services 层 `fileSystem`
- **文件打开逻辑** → Services 层 `editorManager`（通过命令触发）
- **命令系统** → Core 层 `commands`
- **侧边栏容器管理**（宽度、显隐） → Workbench 层 `layout`
- **其他视图**（搜索、大纲等） → 后续扩展模块

---

## 二、使用场景与示例

### 场景 1：作为左侧插槽内容注入布局

```typescript
import { layout } from '@/workbench';
import { FileTree } from '@/workbench/sidebar/FileTree';
import { URI } from 'vscode-uri';

const rootUri = URI.file('/path/to/workspace');
layout.setSlotContent('left', <FileTree rootUri={rootUri} />);
```

### 场景 2：点击文件打开编辑器

用户点击文件树中的文件 → `FileTree` 调用 `commandExecutor.execute('file.open', uri.toString())` → 命令 handler 调用 `editorManager.open(uri)` → 编辑器打开文件。

### 场景 3：展开子目录

用户点击文件夹 → 异步加载子目录内容 → 渲染子节点 → 再次点击收起。

---

## 三、依赖关系

### 依赖的模块

- **Services `fileSystem`**：读取目录内容
- **Core `commands`**：触发 `file.open` 命令

### 被依赖的模块

- **Workbench `layout`**：将 `FileTree` 设置为 `left` 插槽内容

---

## 四、状态与数据流

```
┌─────────────────┐     readDirectory     ┌─────────────────┐
│  FileTree       │ ────────────────────→ │  FileSystem     │
│  (Workbench)    │                       │  (Services)     │
└─────────────────┘                       └─────────────────┘
       │                                          │
       │ 渲染目录结构                               │
       ↓                                          │
┌─────────────────┐                               │
│  用户点击文件    │                               │
└─────────────────┘                               │
       │                                          │
       │ execute('file.open', uri)                 │
       ↓                                          │
┌─────────────────┐                               │
│  CommandExecutor│                               │
│  (Core)         │                               │
└─────────────────┘                               │
       │                                          │
       │ handler 调用 editorManager.open()         │
       ↓                                          │
┌─────────────────┐                               │
│  EditorManager  │ ◄─────────────────────────────┘
│  (Services)     │
└─────────────────┘
```

---

## 五、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 目录读取失败 | 显示错误提示，目录条目为空 |
| 子目录权限不足 | 忽略无法访问的条目，显示 `FileType.Unknown` |
| 文件点击后命令执行失败 | 由命令执行器的错误处理机制处理 |
| 空目录 | 正常显示，无子节点 |

---

## 六、设计决策记录

### 决策 1：FileTree 直接调用 commandExecutor 而非 editorManager

- **原因**：保持架构分层。FileTree 作为 Workbench 层组件，不应直接调用 Services 层 `editorManager`。通过命令系统（Core 层）触发打开操作，符合"Workbench → Core 注册 API"的依赖方向。
- **效果**：`file.open` 命令的 handler 在 App.tsx 中注册，调用 `editorManager.open()`，实现了解耦。

### 决策 2：子目录懒加载（点击展开时才加载）

- **原因**：避免一次性加载整个工作区目录树，提升大项目性能。
- **实现**：展开时调用 `fileSystem.readDirectory()`，收起时清空子节点。

### 决策 3：目录在前、文件在后，按名称排序

- **原因**：符合大多数 IDE/文件管理器的惯例，提升可读性。
- **实现**：`entries.sort()` 先按类型分组，再按 `localeCompare` 排序。

### 决策 4：当前阶段不引入 Core 层 views 注册系统

- **原因**：当前只有一个文件树视图，引入注册系统增加复杂度。
- **演进路线**：见 `docs/workbench/layout.md` 第九节"未来演进路线"。当侧边栏视图超过 3 个时，引入 Core `views` 模块 + Activity Bar 切换。

---

## 七、待办事项

- [x] 实现 `FileTree` 组件（目录渲染、展开/收起）
- [ ] 修复子目录展开功能（当前子节点 `onToggle` 为空函数）
- [ ] 支持文件/目录右键菜单（新建、重命名、删除）
- [ ] 支持文件拖拽（拖拽到编辑器打开）
- [ ] 支持文件图标（根据扩展名显示不同图标）
- [ ] 支持面包屑路径显示
- [ ] 与 Core `views` 模块对接：Activity Bar + Side Panel 模式

---

*本模块遵循 [architecture.md](../architecture.md) 中 Workbench 层职责边界和依赖方向规则。*
