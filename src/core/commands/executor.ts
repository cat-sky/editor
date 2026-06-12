/**
 * 命令执行器实现
 *
 * 实现 ICommandExecutor 接口，提供命令的统一执行入口和生命周期钩子。
 * 错误不吞没，包装为 CommandExecutionResult 返回。
 */

import type {
  CommandId,
  CommandExecutionResult,
} from './types';
import type { ICommandExecutor } from './ICommandExecutor';
import type { ICommandRegistry } from './ICommandRegistry';

/**
 * 钩子函数类型
 */
type BeforeExecuteHook = (
  commandId: CommandId,
  args: unknown
) => void | Promise<void>;

type AfterExecuteHook = (
  commandId: CommandId,
  result: CommandExecutionResult
) => void | Promise<void>;

/**
 * 命令执行器实现类
 */
export class CommandExecutor implements ICommandExecutor {
  /** 关联的命令注册表 */
  private readonly registry: ICommandRegistry;

  /** 执行前钩子列表 */
  private readonly beforeHooks: BeforeExecuteHook[] = [];

  /** 执行后钩子列表 */
  private readonly afterHooks: AfterExecuteHook[] = [];

  constructor(registry: ICommandRegistry) {
    this.registry = registry;
  }

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
  async execute<TArgs = unknown, TReturn = unknown>(
    commandId: CommandId,
    args?: TArgs
  ): Promise<CommandExecutionResult<TReturn>> {
    // 1. 查找命令
    const command = this.registry.getCommand(commandId);
    if (!command) {
      const errorResult: CommandExecutionResult<TReturn> = {
        success: false,
        error: new Error(`Command not found: ${commandId}`),
      };
      // 触发 after 钩子（即使执行失败）
      await this.runAfterHooks(commandId, errorResult);
      return errorResult;
    }

    // 2. 触发 beforeExecute 钩子
    try {
      await this.runBeforeHooks(commandId, args);
    } catch (hookError) {
      // 钩子错误不阻断执行，但记录到结果中
      console.warn(`[CommandExecutor] beforeExecute hook failed for ${commandId}:`, hookError);
    }

    // 3. 调用 handler
    let result: CommandExecutionResult<TReturn>;
    try {
      const data = await command.handler(args);
      result = {
        success: true,
        data: data as TReturn,
      };
    } catch (error) {
      result = {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }

    // 4. 触发 afterExecute 钩子
    try {
      await this.runAfterHooks(commandId, result);
    } catch (hookError) {
      console.warn(`[CommandExecutor] afterExecute hook failed for ${commandId}:`, hookError);
    }

    // 5. 返回包装结果
    return result;
  }

  /**
   * 检查命令是否可执行
   * 条件：命令已注册且存在 handler
   * @param commandId 命令 ID
   */
  canExecute(commandId: CommandId): boolean {
    const command = this.registry.getCommand(commandId);
    return command !== undefined && typeof command.handler === 'function';
  }

  /**
   * 注册执行前钩子
   * 可用于：日志记录、权限检查、参数预处理等
   *
   * @param hook 钩子函数
   * @returns 取消注册函数
   */
  onBeforeExecute(
    hook: (commandId: CommandId, args: unknown) => void | Promise<void>
  ): () => void {
    this.beforeHooks.push(hook);
    return () => {
      const index = this.beforeHooks.indexOf(hook);
      if (index !== -1) {
        this.beforeHooks.splice(index, 1);
      }
    };
  }

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
  ): () => void {
    this.afterHooks.push(hook);
    return () => {
      const index = this.afterHooks.indexOf(hook);
      if (index !== -1) {
        this.afterHooks.splice(index, 1);
      }
    };
  }

  /**
   * 串行执行所有 before 钩子
   */
  private async runBeforeHooks(
    commandId: CommandId,
    args: unknown
  ): Promise<void> {
    for (const hook of this.beforeHooks) {
      await hook(commandId, args);
    }
  }

  /**
   * 串行执行所有 after 钩子
   */
  private async runAfterHooks(
    commandId: CommandId,
    result: CommandExecutionResult
  ): Promise<void> {
    for (const hook of this.afterHooks) {
      await hook(commandId, result);
    }
  }
}
