# 工作台命令（Workbench/workbenchCommands）

> 将工作台级操作封装为 Core 层命令，供命令面板、快捷键统一调用。
> 涉及工作区、文件树刷新等全局操作。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **工作台命令注册**：向 Core `commandRegistry` 注册工作台级命令
- **命令 handler 实现**：调用 Services 层 `workspace`（未来）或 Workbench 层模块
- **命令元数据定义**：id、title、category 等，供命令面板显示

### 不负责什么

- **文件系统操作** → Services 层 `fileCommands`
- **编辑器标签页管理** → Services 层 `editorCommands`
- **命令系统基础设施** → Core 层 `commands`

---

## 二、命令清单

| 命令 ID | 标题 | 参数 | 功能 |
|---------|------|------|------|
| `workbench.openFolder` | 打开文件夹 | `uri: URI` | 设置工作区根目录 |
| `workbench.refreshExplorer` | 刷新文件树 | 无 | 刷新侧边栏文件树 |

---

## 三、使用场景与示例

### 场景 1：菜单栏调用

```typescript
import { commandExecutor } from '@/core';
import { URI } from 'vscode-uri';

// 文件 → 打开文件夹
const folderUri = URI.file('C:/Users/neko-/Documents/pages');
await commandExecutor.execute('workbench.openFolder', folderUri);
```

### 场景 2：命令面板调用

用户按 `Ctrl+Shift+P` → 输入"打开文件夹" → 选择 `workbench.openFolder` → 执行。

---

## 四、依赖关系

### 依赖的模块

- **Core `commands`**：注册命令到 `commandRegistry`
- **Services `workspace`**（未来）：管理工作区根目录

### 被依赖的模块

- **Workbench `sidebar`**：文件树响应刷新命令
- **Workbench `prompt-box`**：命令面板显示并执行命令

---

## 五、待办事项

- [x] 实现 `WorkbenchCommands` 模块
- [x] 实现 `workbench.openFolder`、`workbench.refreshExplorer`
- [ ] 与 `workspace` 模块对接（未来）

---

*本模块遵循 [architecture.md](../architecture.md) 中 Workbench 层职责边界和依赖方向规则。*
