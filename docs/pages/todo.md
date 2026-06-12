# 项目问题待办清单

> 系统审查发现的问题汇总，按优先级排列，逐项跟进修复。

- 创建日期：2025-06-11
- 最后更新：2025-06-11（新增 P1-7 命令参数自动弹出 prompt）
- 作者：AI 辅助审查
- 状态：持续更新

---

## 🔴 P0 — 严重问题（立即修复）

### P0-1 Preload 脚本暴露过于宽泛的 IPC 能力

**位置**：`electron/preload.ts`

**问题**：当前把 `ipcRenderer.on/off/send/invoke` 全部暴露给渲染进程，渲染进程可以监听任意通道、发送任意消息，绕过了 Preload 的"受控 API"原则。

**应改为**：白名单化 API 暴露，如 `window.electronAPI.fileSystem.stat(...)`。

**关联文档**：`docs/architecture.md` 第八节 Electron 安全规范。

---

### P0-2 主进程缺少显式安全配置

**位置**：`electron/main.ts:29-34`

**问题**：`webPreferences` 中缺少 `contextIsolation: true`、`nodeIntegration: false`、`webSecurity: true` 的显式声明。

**应改为**：显式配置所有安全选项，不依赖默认值。

**关联文档**：`docs/architecture.md` 第八节。

---

### P0-3 FileTree 子目录无法展开

**位置**：`src/workbench/sidebar/FileTree.tsx:164-175`

**问题**：子目录的 `FileTreeItem` 传入 `onToggle={() => {}}`，点击子文件夹没有任何响应。

**应改为**：递归传递正确的 `onToggle` 回调，支持子目录展开/收起。

---

### P0-4 EditorManager `isDirty` 判断逻辑错误

**位置**：`src/services/editorManager/EditorManager.ts:102-112`

**问题**：`isDirty = content !== tab.content`，但 `tab.content` 在编辑后已被更新，导致撤销回原始内容时 `isDirty` 错误变为 `false`。

**应改为**：保存 `originalContent`（文件原始内容），`isDirty = currentContent !== originalContent`。

---

## 🟡 P1 — 中等问题（本周修复）

### P1-1 相对路径与路径别名混用

**位置**：
- `src/workbench/editor-area/EditorArea.tsx`
- `src/workbench/sidebar/FileTree.tsx`
- `src/workbench/text-editor/index.ts`

**问题**：使用 `../../services`、`../../core` 等相对路径，应统一改为 `@/services`、`@/core`。

**关联文档**：`docs/architecture.md` 第六节命名约定。

---

### P1-2 EditorArea 直接调用 Core 层 Provider 创建实例

**位置**：`src/workbench/editor-area/EditorArea.tsx:130-161`

**问题**：直接调用 `editorViewRegistry.getProvider()` 和 `provider.createEditor()`，超出了"Workbench 调用 Core 注册 API"的允许范围，进入了实例创建和渲染决策领域。

**应改为**：由 `editorManager` 封装 Provider 调用，EditorArea 只接收"该渲染什么组件"的数据。

**关联文档**：`docs/architecture.md` 第三节依赖方向。

---

### P1-3 模块 README.md 全部缺失

**位置**：所有模块目录（`src/core/commands/`、`src/services/fileSystem/`、`src/workbench/layout/` 等）

**问题**：每个模块缺少 `README.md`（快速开始、API 索引、注意事项）。

**关联文档**：`docs/architecture.md` 第七节模块组织原则。

---

### P1-4 全局文档缺少元信息头

**位置**：`docs/dependencies.md`、`docs/architecture.md`

**问题**：缺少创建日期、最后更新、作者、状态等元信息。

**关联文档**：`docs/ai-collaboration.md` 3.2 节文档编写标准。

---

### P1-5 `index.css` 的 body 样式不适合桌面编辑器

**位置**：`src/index.css:24-30`

**问题**：`place-items: center` 是 Vite 模板默认样式，会把编辑器内容居中，造成布局异常。

**应改为**：移除 `place-items: center`，改为适合桌面应用的布局样式。

---

### P1-6 App.tsx 硬编码个人路径

**位置**：`src/App.tsx:11`

**问题**：`URI.file('C:/Users/neko-/Documents/pages')` 是开发者个人路径，不具备可移植性。

**应改为**：通过工作区服务（workspace）或配置系统管理，或提供默认路径选择对话框。

---

### P1-7 命令参数为空时自动弹出 prompt

**位置**：`src/services/fileCommands/index.ts`、`src/services/editorCommands/index.ts`

**问题**：命令面板调用 `file.newFile`、`file.saveAs` 等命令时不传参数，当前返回错误。更好的体验是：无参数时自动弹出 `prompt.show()` 询问用户输入。

**应改为**：需要路径/名称的命令，参数为空时自动调用 `prompt.show()` 获取用户输入。

**关联文档**：`docs/services/fileCommands.md` 设计决策。

---

## 🟢 P2 — 轻微问题（后续修复）

### P2-1 FileTree URI 路径拼接不够健壮

**位置**：`src/workbench/sidebar/FileTree.tsx:47`

**问题**：`URI.file(uri.fsPath + '/' + entry.name)` 在 Windows 上可能产生混合分隔符路径。

**应改为**：使用 `URI.parse(uri.toString() + '/' + entry.name)` 或 `path.posix.join`。

---

### P2-2 `main.tsx` 直接监听 IPC（模板残留代码）

**位置**：`src/main.tsx:13-15`

**问题**：直接调用 `window.ipcRenderer.on('main-process-message', ...)`，是 electron-vite 模板残留。

**应改为**：移除或封装到 Services 层 IPC 模块。

---

### P2-3 缺少 React Error Boundary

**位置**：全局

**问题**：`docs/workbench/layout.md` 提到"内容组件内部报错由 React Error Boundary 处理"，但项目中未实现任何 Error Boundary。

**应改为**：在 `Layout` 或 `EditorArea` 层级添加 Error Boundary，防止单个组件错误导致整个应用崩溃。

---

## 已解决问题

| 编号 | 问题 | 解决日期 | 备注 |
|------|------|----------|------|
| ✅ | 第二阶段模块设计文档缺失 | 2025-06-11 | 补全 `editorManager.md`、`editor-area.md`、`sidebar.md`、`text-editor.md` |
| ✅ | editorManager Zustand 重构 | 2025-06-11 | 用 Zustand store 替代 class + listeners，EditorArea 改用 useEditorStore |
| ✅ | 命令模块重构 | 2025-06-11 | 新增 `fileCommands`（9个）、`editorCommands`（6个）、`workbenchCommands`（2个），迁移 App.tsx 命令注册 |

---

## 修复进度

| 编号 | 问题 | 优先级 | 状态 | 备注 |
|------|------|--------|------|------|
| P0-1 | Preload 安全白名单 | P0 | 🔴 待修复 | 安全相关，优先 |
| P0-2 | 主进程显式安全配置 | P0 | 🔴 待修复 | 安全相关，优先 |
| P0-3 | FileTree 子目录展开 | P0 | 🔴 待修复 | 功能缺陷 |
| P0-4 | EditorManager isDirty | P0 | 🔴 待修复 | 功能缺陷 |
| P1-1 | 路径别名统一 | P1 | 🟡 待修复 | 代码规范 |
| P1-2 | EditorArea 越层调用 | P1 | 🟡 待修复 | 架构合规 |
| P1-3 | 模块 README 缺失 | P1 | 🟡 待修复 | 文档规范 |
| P1-4 | 全局文档元信息 | P1 | 🟡 待修复 | 文档规范 |
| P1-5 | index.css 样式 | P1 | 🟡 待修复 | 布局问题 |
| P1-6 | 硬编码路径 | P1 | 🟡 待修复 | 可移植性 |
| P1-7 | 命令参数自动弹出 prompt | P1 | 🟡 待修复 | 用户体验 |
| P2-1 | URI 拼接健壮性 | P2 | 🟢 待修复 | 边缘情况 |
| P2-2 | main.tsx IPC 残留 | P2 | 🟢 待修复 | 清理工作 |
| P2-3 | Error Boundary | P2 | 🟢 待修复 | 稳定性 |

---

*本清单随开发进度持续更新。修复完成后在此标记，并同步更新关联文档。*
