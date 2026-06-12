/**
 * 命令注册表实现
 *
 * 实现 ICommandRegistry 接口，提供命令的注册、注销、查询能力。
 * 不实现任何具体业务逻辑，只提供基础设施。
 */

import type {
  CommandId,
  CommandHandler,
  CommandMetadata,
  RegisteredCommand,
  KeybindingEntry,
} from './types';
import type { ICommandRegistry } from './ICommandRegistry';

/**
 * 命令注册表实现类
 */
export class CommandRegistry implements ICommandRegistry {
  /** 内部存储：命令 ID → 已注册命令条目 */
  private readonly commands = new Map<CommandId, RegisteredCommand>();

  /** 内部存储：命令 ID → 快捷键绑定列表 */
  private readonly keybindings = new Map<CommandId, KeybindingEntry[]>();

  /**
   * 注册一个命令
   *
   * 若 commandId 已存在，后注册者覆盖前者。
   *
   * @param metadata 命令元数据（含唯一 id）
   * @param handler 命令处理函数
   * @returns 注销函数（调用后取消注册该命令）
   */
  register<TArgs = unknown, TReturn = unknown>(
    metadata: CommandMetadata,
    handler: CommandHandler<TArgs, TReturn>
  ): () => void {
    const { id } = metadata;

    // 覆盖策略：直接存入 Map，后注册者覆盖前者
    this.commands.set(id, {
      metadata,
      handler: handler as CommandHandler,
    });

    // 返回注销函数
    return () => {
      this.unregister(id);
    };
  }

  /**
   * 注销一个命令
   * @param commandId 命令 ID
   */
  unregister(commandId: CommandId): void {
    this.commands.delete(commandId);
    this.keybindings.delete(commandId);
  }

  /**
   * 获取已注册的命令
   * @param commandId 命令 ID
   * @returns 命令条目，未找到时返回 undefined
   */
  getCommand(commandId: CommandId): RegisteredCommand | undefined {
    return this.commands.get(commandId);
  }

  /**
   * 获取所有已注册的命令
   */
  getAllCommands(): RegisteredCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * 获取在命令面板中应显示的命令
   * 筛选条件：visibleInPalette !== false
   */
  getPaletteCommands(): RegisteredCommand[] {
    return this.getAllCommands().filter(
      (cmd) => cmd.metadata.visibleInPalette !== false
    );
  }

  /**
   * 检查命令是否已注册
   */
  hasCommand(commandId: CommandId): boolean {
    return this.commands.has(commandId);
  }

  /**
   * 注册命令的默认快捷键
   * 实际按键捕获和 when 子句评估由后续 Keybinding 模块负责
   */
  registerKeybinding(entry: KeybindingEntry): () => void {
    const { commandId } = entry;
    const list = this.keybindings.get(commandId) ?? [];
    list.push(entry);
    this.keybindings.set(commandId, list);

    return () => {
      const updated = (this.keybindings.get(commandId) ?? []).filter(
        (e) => e !== entry
      );
      if (updated.length === 0) {
        this.keybindings.delete(commandId);
      } else {
        this.keybindings.set(commandId, updated);
      }
    };
  }

  /**
   * 获取命令的默认快捷键列表
   */
  getKeybindings(commandId: CommandId): KeybindingEntry[] {
    return this.keybindings.get(commandId) ?? [];
  }
}
