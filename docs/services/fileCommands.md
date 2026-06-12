# 文件操作命令（Services/fileCommands）

> 将文件系统操作封装为 Core 层命令，供命令面板、文件树、快捷键统一调用。
> 所有命令 handler 调用 Services 层 `fileSystem` 完成实际工作。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **文件系统命令注册**：向 Core `commandRegistry` 注册所有文件相关命令
- **命令 handler 实现**：调用 `fileSystem` 执行文件 CRUD
- **命令元数据定义**：id、title、category、图标等，供命令面板显示

### 不负责什么

- **编辑器标签页管理**（关闭、切换）→ Services 层 `editorCommands`
- **文件系统底层操作** → Services 层 `fileSystem`
- **命令系统基础设施** → Core 层 `commands`
- **命令面板 UI 渲染** → Workbench 层 `prompt-box`
- **文件树 UI 交互** → Workbench 层 `sidebar`

---

## 二、命令清单

| 命令 ID | 标题 | 参数 | 功能 |
|---------|------|------|------|
| `file.newFile` | 新建文件 | `uri: URI` | 创建空文件 |
| `file.newFolder` | 新建文件夹 | `uri: URI` | 创建空文件夹 |
| `file.openFile` | 打开文件 | `uri: URI` | 打开文件到编辑器 |
| `file.save` | 保存 | 无 | 保存当前激活标签页 |
| `file.saveAs` | 另存为 | `uri: URI` | 将当前内容保存到新路径 |
| `file.deleteFile` | 删除 | `uri: URI` | 删除文件或文件夹 |
| `file.renameFile` | 重命名 | `uri: URI, newName: string` | 重命名文件或文件夹 |
| `file.copy` | 复制 | `source: URI, target: URI` | 复制文件或文件夹 |
| `file.move` | 移动 | `source: URI, target: URI` | 移动/剪切文件或文件夹 |

---

## 三、使用场景与示例

### 场景 1：文件树右键菜单调用

```typescript
import { commandExecutor } from '@/core';
import { URI } from 'vscode-uri';

// 右键点击文件夹，选择"新建文件"
const newFileUri = URI.file(parentUri.fsPath + '/untitled.txt');
await commandExecutor.execute('file.newFile', newFileUri);
```

### 场景 2：命令面板调用

用户按 `Ctrl+Shift+P` → 输入"新建文件" → 选择 `file.newFile` → 执行。

### 场景 3：快捷键绑定

```typescript
// 未来 Keybinding 模块
keybindingRegistry.register({
  commandId: 'file.save',
  keybinding: 'Ctrl+S',
});
```

---

## 四、依赖关系

### 依赖的模块

- **Core `commands`**：注册命令到 `commandRegistry`
- **Services `fileSystem`**：执行文件系统操作
- **Services `editorManager`**：`file.openFile` 需要打开编辑器

### 被依赖的模块

- **Workbench `sidebar`**：文件树右键菜单调用命令
- **Workbench `prompt-box`**：命令面板显示并执行命令
- **Workbench `block-editor`**：块编辑器内快捷键调用命令

---

## 五、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 文件已存在（`file.newFile`） | 返回 `{success: false, error}`，调用方可提示覆盖 |
| 文件不存在（`file.save`） | `fileSystem.writeFile` 自动创建父目录 |
| 删除已打开的文件 | 先关闭编辑器标签页，再删除文件 |
| 重命名已打开的文件 | 更新编辑器标签页的 `uri` 和 `title`，再重命名文件 |

---

## 六、设计决策记录

### 决策 1：命令 handler 放在 Services 层

- **原因**：handler 调用 `fileSystem`（Services 层），放在 Services 层避免跨层调用。当前 `file.open` / `file.save` 在 `App.tsx` 中注册，导致 App.tsx 臃肿，迁移后职责清晰。

### 决策 2：命令 ID 参考 VS Code 命名

- **原因**：VS Code 是桌面编辑器的行业标准，用户和开发者都熟悉其命令命名。如 `file.newFile`、`file.save` 等。
- **注意**：`file.open` 改为 `file.openFile`，与 VS Code 保持一致。

### 决策 3：`file.saveAs` 不自动弹出输入框

- **原因**：`file.save` 是静默保存，`file.saveAs` 才需要用户输入新路径。两者分离符合用户预期。
- **注意**：`file.saveAs` 的 handler 可调用 `prompt.show()` 询问新路径，但 handler 本身不强制依赖 UI。

---

## 七、待办事项

- [x] 实现 `FileCommands` 模块，注册所有文件操作命令
- [x] 将 `App.tsx` 中的 `file.open` / `file.save` handler 迁移到本模块
- [x] 实现 `file.newFile`、`file.newFolder`、`file.deleteFile`、`file.renameFile`、`file.copy`、`file.move`
- [ ] 与 `prompt` 模块对接：`file.saveAs` 需要用户输入时调用 `prompt.show()`
- [ ] 与 `sidebar` 模块对接：文件树右键菜单绑定命令

---

*本模块遵循 [architecture.md](../architecture.md) 中 Services 层职责边界和依赖方向规则。*
