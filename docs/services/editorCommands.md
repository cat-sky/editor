# 编辑器命令（Services/editorCommands）

> 将编辑器标签页操作封装为 Core 层命令，供命令面板、快捷键统一调用。
> 所有命令 handler 调用 Services 层 `editorManager` 完成实际工作。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **编辑器标签页命令注册**：向 Core `commandRegistry` 注册所有编辑器操作命令
- **命令 handler 实现**：调用 `editorManager` 管理标签页生命周期
- **命令元数据定义**：id、title、category 等，供命令面板显示

### 不负责什么

- **文件系统操作**（新建、删除、重命名）→ Services 层 `fileCommands`
- **编辑器底层管理** → Services 层 `editorManager`
- **命令系统基础设施** → Core 层 `commands`
- **命令面板 UI 渲染** → Workbench 层 `prompt-box`

---

## 二、命令清单

| 命令 ID | 标题 | 参数 | 功能 |
|---------|------|------|------|
| `editor.close` | 关闭编辑器 | `instanceId?: string` | 关闭指定或当前标签页 |
| `editor.closeAll` | 关闭所有编辑器 | 无 | 关闭所有标签页 |
| `editor.closeOthers` | 关闭其他编辑器 | `instanceId?: string` | 关闭除指定外的所有标签页 |
| `editor.closeRight` | 关闭右侧编辑器 | `instanceId?: string` | 关闭指定标签页右侧的所有标签页 |
| `editor.activateNext` | 下一个编辑器 | 无 | 激活下一个标签页 |
| `editor.activatePrevious` | 上一个编辑器 | 无 | 激活上一个标签页 |

---

## 三、使用场景与示例

### 场景 1：标签页右键菜单

```typescript
import { commandExecutor } from '@/core';

// 右键点击标签页，选择"关闭其他"
await commandExecutor.execute('editor.closeOthers', tab.instanceId);
```

### 场景 2：命令面板调用

用户按 `Ctrl+Shift+P` → 输入"关闭所有" → 选择 `editor.closeAll` → 执行。

### 场景 3：快捷键绑定

```typescript
// Ctrl+W 关闭当前标签页
keybindingRegistry.register({
  commandId: 'editor.close',
  keybinding: 'Ctrl+W',
});

// Ctrl+Tab 下一个标签页
keybindingRegistry.register({
  commandId: 'editor.activateNext',
  keybinding: 'Ctrl+Tab',
});
```

---

## 四、依赖关系

### 依赖的模块

- **Core `commands`**：注册命令到 `commandRegistry`
- **Services `editorManager`**：管理编辑器标签页

### 被依赖的模块

- **Workbench `editor-area`**：标签页右键菜单调用命令
- **Workbench `prompt-box`**：命令面板显示并执行命令

---

## 五、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 关闭未保存文件 | 先尝试保存，若失败则返回错误，不强制关闭 |
| 关闭不存在的标签页 | 静默忽略 |
| 无标签页时调用 `activateNext` | 静默忽略 |

---

## 六、设计决策记录

### 决策 1：与 `fileCommands` 分离

- **原因**：`editor.close*` 操作的是 `editorManager.tabs`（内存中的标签页列表），不是文件系统。与 `file.deleteFile`（删除磁盘文件）有本质区别。分离后职责清晰，符合 VS Code 的命名惯例（`workbench.action.close*Editors`）。

### 决策 2：命令 ID 参考 VS Code 命名

- **原因**：VS Code 使用 `workbench.action.closeActiveEditor`、`workbench.action.closeAllEditors` 等。我们简化为 `editor.*`，更短且语义明确。

### 决策 3：批量命令封装为独立命令

- **原因**：`closeAll`、`closeOthers`、`closeRight` 是用户常用操作，封装后命令面板可直接调用，无需 Workbench 层写循环逻辑。

---

## 七、待办事项

- [x] 实现 `EditorCommands` 模块，注册所有编辑器操作命令
- [x] 实现 `editor.close`、`editor.closeAll`、`editor.closeOthers`、`editor.closeRight`
- [x] 实现 `editor.activateNext`、`editor.activatePrevious`
- [ ] 与 `editor-area` 模块对接：标签页右键菜单绑定命令

---

*本模块遵循 [architecture.md](../architecture.md) 中 Services 层职责边界和依赖方向规则。*
