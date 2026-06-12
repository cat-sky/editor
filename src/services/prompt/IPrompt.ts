import type { PromptOptions } from './types';

/**
 * 用户输入服务接口
 *
 * 提供全局模态输入框的命令式调用接口。
 * 底层由 Zustand store 管理请求队列和状态。
 */
export interface IPrompt {
  /**
   * 显示输入框并等待用户输入
   *
   * 若已有输入框显示，新请求进入队列，当前请求完成后自动弹出。
   *
   * @param options 输入框配置
   * @returns 用户确认的输入值；取消时返回 undefined
   */
  show(options?: PromptOptions): Promise<string | undefined>;

  /**
   * 显示命令面板并等待用户选择
   *
   * 列出所有已注册的命令，支持搜索过滤。
   * 用户选择后返回 commandId；取消时返回 undefined。
   *
   * @returns 选中的命令 ID；取消时返回 undefined
   */
  showCommands(): Promise<string | undefined>;
}
