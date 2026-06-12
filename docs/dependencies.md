# 项目依赖说明

> 本文档记录项目所有技术依赖及其用途，作为技术选型的基准参考。
> 新增或移除依赖需经确认并同步更新本文档。

---

## 一、项目搭建方式

本项目使用 **electron-vite** 脚手架创建：

```bash
npm create electron-vite@latest
```

## 二、核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^18.2.0 | UI 框架 |
| TypeScript | ^5.2.2 | 类型系统 |
| Vite | ^5.1.6 | 构建工具 |
| Electron | ^30.0.1 | 桌面应用框架 |
| electron-vite | vite-plugin-electron | Electron + Vite 集成 |

## 三、electron-vite 项目结构特点

| 目录/文件 | 说明 |
|-----------|------|
| `electron/` | 主进程代码（`main.ts` 入口 + `preload.ts` 安全桥梁） |
| `src/` | 渲染进程代码（React 应用） |
| `index.html` | 渲染进程 HTML 模板 |
| `vite.config.ts` | Vite 配置（含 electron-vite 插件配置） |

---

## 四、生产依赖（dependencies）

| 包名 | 版本 | 用途说明 |
|------|------|----------|
| react | ^18.2.0 | React 核心库 |
| react-dom | ^18.2.0 | React DOM 渲染器 |
| vscode-uri | ^3.1.0 | URI 处理（跨平台路径、编码） |
| **codemirror** | **^6.0.2** | **CodeMirror 6 编辑器核心（含 basicSetup）** |
| **@codemirror/state** | **^6.6.0** | **编辑器状态管理** |
| **@codemirror/view** | **^6.43.1** | **编辑器视图渲染** |
| **@codemirror/commands** | **^6.10.3** | **基本编辑命令（撤销、重做、光标移动等）** |
| **@codemirror/language** | **^6.12.3** | **语言支持基础设施（语法高亮、Lezer 解析器）** |
| **@codemirror/lang-javascript** | **^6.2.5** | **JavaScript / TypeScript / JSX 语言支持** |
| **@codemirror/lang-json** | **^6.0.2** | **JSON 语言支持** |
| **@codemirror/lang-markdown** | **^6.5.0** | **Markdown 语言支持** |
| **@codemirror/lang-html** | **^6.4.11** | **HTML 语言支持** |
| **@codemirror/lang-css** | **^6.3.1** | **CSS 语言支持** |
| **@codemirror/search** | **^6.7.0** | **查找替换功能** |
| **@codemirror/lint** | **^6.9.7** | **错误提示与诊断** |
| **@codemirror/autocomplete** | **^6.20.3** | **自动补全** |
| **zustand** | **^4.5.2** | **全局状态管理（Services 层 store + Workbench 层 React 订阅）** |

---

## 五、开发依赖（devDependencies）

| 包名 | 版本 | 用途说明 |
|------|------|----------|
| @types/react | ^18.2.64 | React 类型定义 |
| @types/react-dom | ^18.2.21 | ReactDOM 类型定义 |
| @typescript-eslint/eslint-plugin | ^7.1.1 | TypeScript ESLint 规则插件 |
| @typescript-eslint/parser | ^7.1.1 | TypeScript ESLint 解析器 |
| @vitejs/plugin-react | ^4.2.1 | Vite React 插件（Fast Refresh） |
| electron | ^30.0.1 | Electron 主进程与渲染进程 API |
| electron-builder | ^24.13.3 | Electron 应用打包工具 |
| eslint | ^8.57.0 | 代码静态检查 |
| eslint-plugin-react-hooks | ^4.6.0 | React Hooks 规则检查 |
| eslint-plugin-react-refresh | ^0.4.5 | React Fast Refresh 规则检查 |
| typescript | ^5.2.2 | TypeScript 编译器 |
| vite | ^5.1.6 | 前端构建工具 |
| vite-plugin-electron | ^0.28.6 | Vite Electron 集成插件 |
| vite-plugin-electron-renderer | ^0.14.5 | Vite Electron 渲染进程 Polyfill |

---

## 六、待引入依赖（预留）

以下依赖尚未引入，根据后续模块设计按需添加：

| 包名 | 用途 | 引入时机 |
|------|------|----------|
| ~~vscode-uri~~ | ~~URI 处理~~ | ~~已引入，见生产依赖~~ |
| ~~@codemirror/state / view / commands 等~~ | ~~CodeMirror 6 编辑器核心~~ | ~~已引入，见生产依赖~~ |
| ~~zustand~~ | ~~全局状态管理~~ | ~~已引入，见生产依赖~~ |
| @radix-ui/react-dropdown-menu 等 | UI primitives（无头组件） | Workbench 模块设计时 |
| react-resizable-panels | 分屏布局 | 编辑器区域设计时 |
| fuse.js | 模糊搜索 | 命令面板设计时 |
| chokidar | 文件监听（主进程） | 文件系统服务设计时 |
| electron-store | 配置持久化（主进程） | 配置系统实现时 |

---

## 七、依赖管理规则

1. **新增依赖**：需说明用途、评估体积影响，经确认后执行 `npm install`
2. **移除依赖**：确认无引用后方可移除
3. **版本升级**：评估 Breaking Change 影响，优先小版本升级
4. **锁定文件**：`package-lock.json` 必须提交，确保构建一致性

---

*最后更新：引入 zustand 作为全局状态管理库*
