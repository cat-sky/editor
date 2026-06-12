# 命令系统（Core/commands）

## 快速开始

```typescript
import { commandRegistry, commandExecutor } from '@/core';

// 1. 注册命令（通常在 Services 或 Workbench 初始化时完成）
const unregister = commandRegistry.register(
  {
    id: 'file.save',
    title: '保存文件',
    category: '文件',
    defaultKeybinding: 'Ctrl+S',
  },
  async (filePath: string) => {
    // 具体实现由注册方提供
    await saveFile(filePath);
    return true;
  }
);

// 2. 执行命令
const result = await commandExecutor.execute('file.save', '/path/to/file.ts');
if (result.success) {
  console.log('保存成功', result.data);
} else {
  console.error('保存失败', result.error);
}

// 3. 获取命令面板命令列表
const paletteCommands = commandRegistry.getPaletteCommands();

// 4. 注销命令
unregister();
```

## API 索引

| 接口/类型 | 说明 |
|-----------|------|
| `ICommandRegistry` | 命令注册、注销、查询 |
| `ICommandExecutor` | 命令执行、执行前后钩子 |
| `CommandMetadata` | 命令元数据（id、title、category 等） |
| `CommandHandler` | 命令处理器函数签名 |
| `CommandExecutionResult` | 执行结果包装（success / data / error） |
| `KeybindingEntry` | 【计划中】快捷键绑定条目 |

## 注意事项

- 命令系统**不实现任何具体业务逻辑**，只提供注册和执行基础设施
- 具体命令的 handler 由 Services 或 Workbench 层提供
- 命令面板 UI 由 Workbench 层实现，命令系统只提供数据（`getPaletteCommands()`）
- 快捷键物理按键捕获、chord 解析、when 子句评估由**后续 Keybinding / Context Key 模块**负责，当前已预留接口
- 参数运行时校验由命令注册方在 handler 中自行处理
- 重复注册同一 id 时，**后注册者覆盖前者**
- title 允许重复，仅用于 UI 显示
