/**
 * 命令注册表接口
 *
 * 本文件仅包含接口定义，不包含任何实现逻辑。
 * 负责命令的注册、注销、查询。
 *
 * 设计原则：
 * - id 为唯一键，重复注册时后注册者覆盖前者
 * - title 不唯一，仅用于 UI 显示
 * - 不实现任何具体业务逻辑
 */

import type {
  CommandId,
  CommandHandler,
  CommandMetadata,
  RegisteredCommand,
  KeybindingEntry,
} from './types';

/**
 * 命令注册表接口
 * 提供命令的注册、注销、查询能力
 */
export interface ICommandRegistry {
  /**
   * 注册一个命令
   *
   * 若 commandId 已存在，后注册者覆盖前者（便于热更新和扩展覆盖默认行为）。
   *
   * @param metadata 命令元数据（含唯一 id）
   * @param handler 命令处理函数
   * @returns 注销函数（调用后取消注册该命令）
   */
  register<TArgs = unknown, TReturn = unknown>(
    metadata: CommandMetadata,
    handler: CommandHandler<TArgs, TReturn>
  ): () => void;

  /**
   * 注销一个命令
   * @param commandId 命令 ID
   */
  unregister(commandId: CommandId): void;

  /**
   * 获取已注册的命令
   * @param commandId 命令 ID
   * @returns 命令条目，未找到时返回 undefined
   */
  getCommand(commandId: CommandId): RegisteredCommand | undefined;

  /**
   * 获取所有已注册的命令
   */
  getAllCommands(): RegisteredCommand[];

  /**
   * 获取在命令面板中应显示的命令
   * 筛选条件：visibleInPalette !== false
   */
  getPaletteCommands(): RegisteredCommand[];

  /**
   * 检查命令是否已注册
   */
  hasCommand(commandId: CommandId): boolean;

  /**
   * 【计划中】注册命令的默认快捷键
   * 实际按键捕获和 when 子句评估由后续 Keybinding 模块负责
   */
  registerKeybinding?(entry: KeybindingEntry): () => void;

  /**
   * 【计划中】获取命令的默认快捷键列表
   */
  getKeybindings?(commandId: CommandId): KeybindingEntry[];
}
