# 命令系统（Core/commands）

> 定义命令注册、执行、查询的基础设施，为所有模块提供统一的命令插槽。
> 命令系统不实现任何具体业务逻辑，只提供注册和执行框架。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- 命令注册表：命令的注册、注销、查询
- 命令执行器：统一执行入口、执行前后钩子、错误包装
- 命令面板数据供给：筛选应在命令面板中显示的命令列表
- 类型定义：命令相关的所有 TypeScript 接口和类型

### 不负责什么

- **具体命令的实现逻辑**（如"保存文件"、"打开设置"）→ 由 Services 或 Workbench 层注册时提供 handler
- **命令面板的 UI 渲染** → Workbench 层
- **物理按键捕获与快捷键解析** → 计划由后续 Keybinding 模块负责（当前预留接口）
- **when 子句的上下文评估** → 计划由后续 Context Key 系统负责（当前预留字段）
- **参数运行时校验** → 由命令注册方在 handler 中自行处理

---

## 二、使用场景与示例

### 场景 1：Services 层注册业务命令

```typescript
import { commandRegistry } from '@/core';

// 在文件系统服务初始化时注册
commandRegistry.register(
  {
    id: 'file.save',
    title: '保存文件',
    category: '文件',
    defaultKeybinding: 'Ctrl+S',
  },
  async (filePath: string) => {
    // 具体实现由文件系统服务提供
    await writeFile(filePath, content);
    return true;
  }
);
```

### 场景 2：Workbench 层命令面板获取命令列表

```typescript
import { commandRegistry, commandExecutor } from '@/core';

// 命令面板组件
const paletteCommands = commandRegistry.getPaletteCommands();
// 用户选择后执行
await commandExecutor.execute('file.save', '/path/to/file.ts');
```

### 场景 3：执行前后添加钩子（如日志、埋点）

```typescript
import { commandExecutor } from '@/core';

commandExecutor.onBeforeExecute((commandId, args) => {
  console.log(`[Command] 开始执行: ${commandId}`, args);
});

commandExecutor.onAfterExecute((commandId, result) => {
  console.log(`[Command] 执行完成: ${commandId}`, result.success);
});
```

---

## 三、依赖关系

### 依赖的模块

- 无（Core 层最底层基础设施）

### 被依赖的模块

- **Services 层**：注册业务命令（如 fileSystem、editorManager、workspace）
- **Workbench 层**：命令面板调用 `getPaletteCommands()` 和 `execute()`
- **后续 Keybinding 模块**：计划依赖注册表查询命令和默认快捷键

---

## 四、状态与数据流

```
┌─────────────────┐     register / unregister     ┌─────────────────┐
│  Services /     │ ─────────────────────────────→│  Command        │
│  Workbench      │                               │  Registry       │
│  (命令注册方)    │                               │  (id → handler) │
└─────────────────┘                               └─────────────────┘
         │                                               │
         │ execute(commandId, args)                      │ getPaletteCommands()
         │                                               │
         ↓                                               ↓
┌─────────────────┐                               ┌─────────────────┐
│  Command        │                               │  Command        │
│  Executor       │                               │  Palette        │
│  (执行 + 钩子)   │                               │  (Workbench UI) │
└─────────────────┘                               └─────────────────┘
```

---

## 五、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 执行未注册的命令 | `canExecute()` 返回 false；`execute()` 返回 `{ success: false, error: Error('Command not found') }` |
| 命令 handler 抛出异常 | `execute()` catch 并包装为 `{ success: false, error }`，不吞异常 |
| 重复注册同一 id | **覆盖策略**：后注册者覆盖前者，返回新的注销函数 |
| 重复 title | **允许**：title 仅用于显示，不唯一 |

---

## 六、设计决策记录

### 决策 1：命令 id 为唯一键，title 不唯一

- **原因**：VS Code 采用相同策略。title 是显示文本，不同模块可能贡献同名命令（如多个扩展都提供"格式化"）。
- **冲突处理**：后注册者覆盖前者，便于热更新和扩展覆盖默认行为。

### 决策 2：参数校验由命令注册方负责

- **原因**：VS Code 不强制运行时参数校验，依赖 TypeScript 编译时类型安全。运行时校验由 handler 自行实现，保持系统轻量。

### 决策 3：错误处理采用 Result 包装模式

- **原因**：命令执行可能是异步的，调用方需要明确知道成功/失败。返回 `{ success, data?, error? }` 比抛异常更友好，尤其适用于命令面板等 UI 场景。

### 决策 4：快捷键与 when 子句预留但不实现

- **原因**：当前阶段聚焦命令注册/执行核心。快捷键捕获、chord 解析、when 子句评估需要独立模块，复杂度较高。接口中预留字段和可选方法，后续迭代实现。

### 决策 5：Core 层采用轻量单例初始化

- **原因**：Core 是全局基础设施，被多层依赖。App.tsx 统一初始化后导出实例，Services 和 Workbench 直接 import 使用，避免过长的依赖注入链条。

---

## 七、待办事项

- [x] 实现 `ICommandRegistry` 和 `ICommandExecutor` 的具体类
- [x] 实现 `core/index.ts` 统一初始化并导出实例
- [ ] 设计并实现 Keybinding 模块（物理按键捕获、chord 解析、快捷键优先级）
- [ ] 设计并实现 Context Key 系统（when 子句评估、上下文状态管理）
- [ ] 支持命令面板按条件过滤（如 `when: editorHasSelection`）

---

*本模块遵循 [architecture.md](../architecture.md) 中 Core 层职责边界和依赖方向规则。*
