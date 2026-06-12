# 项目文档中心

> 本文档汇总项目所有规范与约定，是 AI 与人类协作的契约基础。

## 文档索引

### 全局文档（第一阶段）

| 文档 | 说明 | 维护者 |
|------|------|--------|
| [项目依赖说明](./dependencies.md) | 技术依赖清单、搭建方式、管理规则 | 人类 + AI |
| [项目架构及目录结构](./architecture.md) | 三层架构、目录约定、命名规范、文档分类规则 | 人类 + AI |
| [AI 协作及编写规范](./ai-collaboration.md) | 协作规则、三阶段流程、权限分级、代码交付标准 | 人类 + AI |

### 模块文档（第二阶段起，按类型分目录）

| 目录 | 存放内容 |
|------|----------|
| [core/](./core/) | Core 框架层模块设计文档 |
| [services/](./services/) | Services 能力层模块设计文档 |
| [workbench/](./workbench/) | Workbench 表现层模块设计文档 |
| [guides/](./guides/) | 开发指南、使用教程 |
| [pages/](./pages/) | 项目页面、待办事项等 |

### 模块文档索引

**Core 层**

| 文档 | 说明 |
|------|------|
| [commands.md](./core/commands.md) | 命令系统（注册、执行、查询） |
| [editor-views.md](./core/editor-views.md) | 编辑器视图类型注册与路由 |

**Services 层**

| 文档 | 说明 |
|------|------|
| [fileSystem.md](./services/fileSystem.md) | 文件系统服务（IPC 委托主进程） |
| [fileCommands.md](./services/fileCommands.md) | 文件操作命令（新建、保存、删除等） |
| [editorCommands.md](./services/editorCommands.md) | 编辑器命令（关闭标签页、切换等） |
| [editorManager.md](./services/editorManager.md) | 编辑器管理服务（标签页生命周期） |
| [prompt.md](./services/prompt.md) | 用户输入服务（Zustand store + 命令式调用） |

**Workbench 层**

| 文档 | 说明 |
|------|------|
| [layout.md](./workbench/layout.md) | 三栏布局容器 |
| [editor-area.md](./workbench/editor-area.md) | 编辑器区域（标签页栏 + 内容区） |
| [sidebar.md](./workbench/sidebar.md) | 侧边栏（文件树等视图） |
| [text-editor.md](./workbench/text-editor.md) | 文本编辑器（CodeMirror 6） |
| [prompt-box.md](./workbench/prompt-box.md) | 全局模态输入框 UI（顶部中央） |
| [workbenchCommands.md](./workbench/workbenchCommands.md) | 工作台命令（打开文件夹、刷新等） |

## 使用原则

1. **先读后做**：任何开发工作开始前，先确认相关规范文档
2. **对号入座**：模块文档按类型放入对应子目录（core / services / workbench）
3. **变更同步**：修改规范需同步更新本文档索引
4. **版本意识**：文档本身通过 Git 版本管理，重大变更需说明理由

---

*最后更新：重构命令分类，新增 fileCommands / editorCommands / workbenchCommands*
