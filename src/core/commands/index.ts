/**
 * 命令系统对外导出
 *
 * 导出类型、接口和工厂函数实现。
 * 单例实例由 core/index.ts 统一初始化并导出。
 */

// 类型导出
export type {
  CommandId,
  CommandHandler,
  CommandMetadata,
  RegisteredCommand,
  CommandExecutionResult,
  KeybindingEntry,
} from './types';

// 接口导出
export type { ICommandRegistry } from './ICommandRegistry';
export type { ICommandExecutor } from './ICommandExecutor';

// 实现类导出
export { CommandRegistry } from './registry';
export { CommandExecutor } from './executor';

// 工厂函数实现
import type { ICommandRegistry } from './ICommandRegistry';
import type { ICommandExecutor } from './ICommandExecutor';
import { CommandRegistry } from './registry';
import { CommandExecutor } from './executor';

/**
 * 创建命令注册表实例
 */
export function createCommandRegistry(): ICommandRegistry {
  return new CommandRegistry();
}

/**
 * 创建命令执行器实例
 * @param registry 关联的命令注册表
 */
export function createCommandExecutor(
  registry: ICommandRegistry
): ICommandExecutor {
  return new CommandExecutor(registry);
}
