# 项目架构及目录结构

> 本文档定义项目的整体架构、三层职责边界、目录组织方式及文件命名约定。
> 所有模块开发必须遵循此结构，新增目录需同步更新本文档。
>
> **项目搭建方式**：`npm create electron-vite@latest`

---

## 一、整体架构

本项目为 **Electron + React + TypeScript + Vite** 桌面应用，采用 `electron-vite` 脚手架搭建，三层架构如下：

```
┌─────────────────────────────────────────────┐
│                 Electron 主进程                │
│  (Node.js 环境：文件系统、系统API、窗口管理)    │
├─────────────────────────────────────────────┤
│              Preload 脚本层                   │
│  (安全桥梁：暴露受控 API 给渲染进程)            │
├─────────────────────────────────────────────┤
│              渲染进程 (React)                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Core   │  │ Services│  │Workbench│        │
│  │ (框架层) │  │ (能力层) │  │(表现层) │        │
│  └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────┘
```

### electron-vite 标准目录

```
editor/
├── electron/                    # 主进程代码（electron-vite 标准）
│   ├── main.ts                  # 主进程入口
│   ├── preload.ts               # Preload 脚本（安全桥梁）
│   └── electron-env.d.ts        # Electron 环境类型声明
├── src/                         # 渲染进程代码（React 应用）
│   ├── main.tsx                 # React 入口
│   ├── App.tsx                  # 根组件
│   ├── index.css                # 全局样式
│   ├── assets/                  # 静态资源
│   └── ...                      # Core / Services / Workbench
├── public/                      # 公共静态资源
├── index.html                   # 渲染进程 HTML 模板
├── vite.config.ts               # Vite + electron-vite 配置
├── package.json
└── ...
```

### 架构原则

- **主进程负责**：窗口管理、文件系统操作、系统级 API 调用
- **渲染进程负责**：UI 渲染、用户交互、业务逻辑
- **Preload 负责**：安全地暴露主进程能力给渲染进程（IPC 桥梁）
- **严格隔离**：渲染进程不直接访问 Node.js API，必须通过 IPC 通信

---

## 二、三层职责边界

| 层级 | 一句话定义 | 职责 |
|------|-----------|------|
| **Core** | **框架层** | 提供"注册和调度"能力，各模块自带插槽，但不实现具体业务 |
| **Services** | **能力层** | 提供"有状态的业务服务"，被 Core 和 Workbench 调用 |
| **Workbench** | **表现层** | 实现"用户看到的具体功能"，通过 Core 的插槽注册自己 |

### 各层具体职责

**Core（框架层）**
- 应用生命周期管理（启动、关闭、初始化顺序）
- 通用注册表基础设施（供各核心模块定义自己的插槽）
- 命令系统（注册、执行、快捷键绑定）——自带命令插槽
- 配置系统（配置项定义、读写、热更新）
- 编辑器类型系统（注册编辑器类型、选择逻辑）——自带编辑器插槽
- 视图系统（注册侧边栏视图、面板视图）——自带视图插槽
- 事件总线（模块间解耦通信）
- 主题系统（变量管理、明暗切换）

**Services（能力层）**
- 文件系统服务（读写、监听、路径操作）
- 编辑器管理服务（实例管理、打开/关闭/切换）
- 工作区服务（当前文件夹、最近文件）
- 全局状态管理（跨模块共享状态）
- 本地存储服务（用户偏好、布局持久化）
- IPC 通信封装

**Workbench（表现层）**
- 整体布局（侧边栏 + 编辑器区 + 面板 + 状态栏）
- 侧边栏视图（文件浏览器、搜索等）
- 编辑器区域（文本编辑器、图片预览、设置页等）
- 底部面板（终端、输出等）
- 状态栏、命令面板、标题栏

---

## 三、依赖方向（铁律）

```
Workbench ──→ Services ──→ Core
    ↑           ↑
    └───────────┘
    （Workbench 也可直接调用 Core 的注册 API）
```

**禁止反向依赖**：Core 和 Services 不知道 Workbench 里有什么模块。

**示例**：
- ✅ Workbench 的编辑器可以调用 Services 的文件读取
- ✅ Workbench 的侧边栏可以通过 Core 注册视图
- ✅ Services 的编辑器管理可以触发 Core 的事件总线
- ❌ Core 不能引用 Workbench 的任何组件
- ❌ Services 不能引用 Workbench 的任何组件

---

## 四、新模块放哪层？判断规则

按这个顺序判断：

| 问题 | 是 → 放这里 | 例子 |
|------|-----------|------|
| 它是定义"通用注册表/插件基础设施"的吗？ | **Core** | 通用 Registry 类、生命周期管理 |
| 它是定义"某类扩展点+管理逻辑"的吗？ | **Core** | 命令系统（含命令插槽）、编辑器类型系统（含编辑器插槽）、视图系统（含视图插槽） |
| 它是提供"跨模块共享的有状态能力"的吗？ | **Services** | 文件系统、编辑器实例管理、全局状态 |
| 它是"用户直接看到的界面功能"吗？ | **Workbench** | 文件浏览器、文本编辑器、状态栏 |

### 边界模糊时的处理

**同一功能可能分层**：
- "文件浏览器"界面 → **Workbench**
- "读取文件内容" → **Services**（跨模块共享）
- "命令注册" → **Core/commands**（命令系统自带插槽）
- "编辑器类型注册" → **Core/editor-types**（编辑器系统自带插槽）

**判断口诀**：
- 如果删掉它，其他模块还能正常启动吗？
  - 不能 → 可能是 Core
  - 能，但功能受限 → 可能是 Services
  - 能，只是少了一个界面 → 是 Workbench

---

## 五、目录结构

### 顶层目录（electron-vite 标准）

```
editor/                          # 项目根目录
├── docs/                        # 项目文档（按类型分目录）
│   ├── core/                    # Core 层模块文档
│   ├── services/                # Services 层模块文档
│   ├── workbench/               # Workbench 层模块文档
│   ├── guides/                  # 开发指南
│   ├── dependencies.md          # 项目依赖说明
│   ├── architecture.md          # 本文档
│   └── ai-collaboration.md      # AI 协作规范
├── electron/                    # 主进程代码（electron-vite 标准）
│   ├── main.ts                  # 主进程入口
│   ├── preload.ts               # Preload 脚本
│   └── electron-env.d.ts        # 类型声明
├── src/                         # 渲染进程代码（React 应用）
│   ├── main.tsx                 # React 入口
│   ├── App.tsx                  # 根组件
│   ├── index.css                # 全局样式
│   ├── assets/                  # 静态资源
│   ├── core/                    # ===== Core 框架层 =====
│   ├── services/                # ===== Services 能力层 =====
│   ├── workbench/               # ===== Workbench 表现层 =====
│   ├── components/              # 通用 UI 组件（跨层使用）
│   └── shared/                  # 渲染进程内共享（类型、常量）
├── public/                      # 公共静态资源
├── index.html                   # 渲染进程 HTML 模板
├── package.json
├── tsconfig.json
├── vite.config.ts               # Vite + electron-vite 配置
└── ...
```

### 渲染进程目录（src/）

```
src/
├── main.tsx                     # React 应用入口
├── App.tsx                      # 根组件（初始化 Core + Services）
├── index.css                    # 全局样式
├── core/                        # ===== Core 框架层 =====
│   ├── app/                     # 应用生命周期
│   ├── registry/                # 通用注册表基础设施（底层）
│   │   ├── Registry.ts          # 通用注册表类
│   │   └── types.ts             # 注册表类型定义
│   ├── commands/                # 命令系统（自带命令插槽）
│   │   ├── registry.ts          # 命令注册表
│   │   ├── executor.ts          # 命令执行器
│   │   └── types.ts             # 命令类型定义
│   ├── configuration/           # 配置系统
│   ├── editor-types/            # 编辑器类型系统（自带编辑器插槽）
│   │   ├── registry.ts          # 编辑器类型注册表
│   │   └── types.ts             # 编辑器类型定义
│   ├── views/                   # 视图系统（自带视图插槽）
│   │   ├── registry.ts          # 视图注册表
│   │   └── types.ts             # 视图类型定义
│   ├── events/                  # 事件总线
│   ├── theme/                   # 主题系统
│   └── index.ts                 # Core 初始化与导出
├── services/                    # ===== Services 能力层 =====
│   ├── fileSystem/              # 文件系统服务
│   ├── editorManager/           # 编辑器管理服务
│   ├── workspace/               # 工作区服务
│   ├── state/                   # 全局状态管理
│   ├── storage/                 # 本地存储
│   ├── ipc/                     # IPC 封装
│   └── index.ts                 # 服务初始化
├── workbench/                   # ===== Workbench 表现层 =====
│   ├── layout/                  # 整体布局容器
│   ├── sidebar/                 # 侧边栏（含注册的视图）
│   ├── editor-area/             # 编辑器区域（含注册的编辑器类型）
│   ├── panel/                   # 底部面板
│   ├── statusbar/               # 状态栏
│   ├── command-palette/         # 命令面板
│   └── titlebar/                # 标题栏
├── components/                  # 通用 UI 组件
│   ├── ui/                      # 原子组件（Button、Input 等）
│   └── composite/               # 复合组件（Tree、Tabs 等）
└── shared/                      # 渲染进程内共享（类型、常量）
```

### 主进程目录（electron/）

```
electron/
├── main.ts                      # 主进程入口（electron-vite 标准）
├── preload.ts                   # Preload 脚本（安全桥梁）
└── electron-env.d.ts            # Electron 环境类型声明
```

**注意**：主进程代码目前集中在 `electron/` 目录。随着功能增加，可在 `src/main/` 创建主进程的模块化代码，由 `electron/main.ts` 引入。

### 共享目录（src/shared/）

```
src/shared/
├── constants/                   # 共享常量
│   └── ipcChannels.ts           # IPC 通道名称
├── types/                       # 共享类型
│   └── ipcTypes.ts              # IPC 通信类型
└── utils/                       # 共享纯函数工具
```

---

## 六、命名约定

### 文件命名

| 类型 | 命名方式 | 示例 |
|------|----------|------|
| React 组件 | PascalCase | `FileTree.tsx`, `EditorArea.tsx` |
| 普通模块/工具 | camelCase | `useFileSystem.ts`, `debounce.ts` |
| 常量配置 | camelCase（对象）/ UPPER_SNAKE（常量） | `ipcChannels.ts`, `MAX_FILE_SIZE` |
| 类型定义 | PascalCase | `FileNode.ts`, `EditorState.ts` |
| 样式文件 | camelCase + `.module.css` | `editorArea.module.css` |
| 测试文件 | 原文件名 + `.test.ts` | `fileTree.test.ts` |

### 目录命名

- 全小写，连字符分隔：`editor-area/`, `command-palette/`
- 复数表示集合：`components/`, `services/`, `handlers/`
- 单数表示单一职责：`app/`, `layout/`

### 代码命名

```typescript
// 变量/函数：camelCase
const fileCount = 0;
function getFileName() { ... }

// 组件/类/接口/类型：PascalCase
interface FileNode { ... }
class FileSystemManager { ... }
const FileTree: React.FC = () => { ... }

// 常量：UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// IPC 通道：命名空间前缀，防止冲突
const IPC_CHANNELS = {
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  WINDOW_MINIMIZE: 'window:minimize',
} as const;
```

---

## 七、模块组织原则

### Feature-based 模块结构

每个功能模块内部自包含：

```
src/workbench/sidebar/
├── index.ts                     # 对外导出（公共 API）
├── Sidebar.tsx                  # 主组件
├── components/                  # 模块私有组件
├── hooks/                       # 模块私有 Hooks
├── stores/                      # 模块状态（如需要）
├── utils/                       # 模块私有工具
├── types.ts                     # 模块类型
└── README.md                    # 模块说明文档
```

### 依赖方向规则

```
┌─────────────────────────────────────┐
│           components/ui             │  ← 原子组件，无业务依赖
├─────────────────────────────────────┤
│       components/composite          │  ← 可依赖 ui，不可依赖 workbench
├─────────────────────────────────────┤
│            workbench/*              │  ← 可依赖 components，不可互相依赖
├─────────────────────────────────────┤
│              services               │  ← 全局能力，可被 workbench 依赖
├─────────────────────────────────────┤
│                core                 │  ← 最底层，可被任何层依赖
├─────────────────────────────────────┤
│         shared / utils              │  ← 最底层，可被任何层依赖
└─────────────────────────────────────┘
```

**禁止循环依赖**：如 A 依赖 B，B 不可直接或间接依赖 A。

---

## 八、Electron 安全规范

1. **Context Isolation**：启用 `contextIsolation: true`（默认）
2. **Preload 脚本**：所有主进程能力通过 Preload 暴露，不直接暴露 `ipcRenderer`
3. **Node Integration**：渲染进程禁用 `nodeIntegration`
4. **Web Security**：保持 `webSecurity: true`
5. **CSP**：配置内容安全策略，限制外部资源加载

---

## 九、新增目录流程

1. 确认现有结构无法满足需求
2. 根据"新模块判断规则"确定所属层级（Core / Services / Workbench）
3. 在本文档中说明新增目录的职责边界
4. 更新目录树示例
5. 通知协作方（人类/AI）

---

## 十、文档存放规则

| 文档类型 | 存放位置 | 示例 |
|----------|----------|------|
| 全局文档（依赖、架构、协作规范） | `docs/` 根目录 | `docs/dependencies.md` |
| Core 层模块设计文档 | `docs/core/` | `docs/core/commands.md` |
| Services 层模块设计文档 | `docs/services/` | `docs/services/fileSystem.md` |
| Workbench 层模块设计文档 | `docs/workbench/` | `docs/workbench/sidebar.md` |
| 开发指南、教程 | `docs/guides/` | `docs/guides/getting-started.md` |

---

*最后更新：修正为 electron-vite 标准结构，加入文档分类规则*
