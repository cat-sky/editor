/**
 * 命令执行器接口
 *
 * 本文件仅包含接口定义，不包含任何实现逻辑。
 * 负责命令的统一执行、执行前后钩子、错误包装。
 *
 * 设计原则：
 * - 通过注册表查找命令并调用 handler
 * - 执行前后支持钩子（用于日志、埋点、权限检查等）
 * - 错误不吞没，包装为 CommandExecutionResult 返回
 * - 参数透传，不做运行时类型校验（由注册方 handler 自行处理）
 */

import type {
  CommandId,
  CommandExecutionResult,
} from './types';

/**
 * 命令执行器接口
 * 提供命令的统一执行入口和生命周期钩子
 */
export interface ICommandExecutor {
  /**
   * 执行指定命令
   *
   * 执行流程：
   * 1. 通过注册表查找命令
   * 2. 触发 beforeExecute 钩子
   * 3. 调用命令 handler（透传 args）
   * 4. 触发 afterExecute 钩子
   * 5. 包装结果为 CommandExecutionResult
   *
   * @param commandId 命令 ID
   * @param args 命令参数（透传给 handler，不做校验）
   * @returns 执行结果包装
   */
  execute<TArgs = unknown, TReturn = unknown>(
    commandId: CommandId,
    args?: TArgs
  ): Promise<CommandExecutionResult<TReturn>>;

  /**
   * 检查命令是否可执行
   * 条件：命令已注册且存在 handler
   * @param commandId 命令 ID
   */
  canExecute(commandId: CommandId): boolean;

  /**
   * 注册执行前钩子
   * 可用于：日志记录、权限检查、参数预处理等
   *
   * @param hook 钩子函数
   * @returns 取消注册函数
   */
  onBeforeExecute(
    hook: (commandId: CommandId, args: unknown) => void | Promise<void>
  ): () => void;

  /**
   * 注册执行后钩子
   * 可用于：日志记录、埋点上报、结果后处理等
   *
   * @param hook 钩子函数
   * @returns 取消注册函数
   */
  onAfterExecute(
    hook: (
      commandId: CommandId,
      result: CommandExecutionResult
    ) => void | Promise<void>
  ): () => void;
}
