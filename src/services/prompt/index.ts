/**
 * prompt 模块对外导出
 */

// 类型导出
export type { PromptOptions, PromptRequest, PromptMode } from './types';

// 接口导出
export type { IPrompt } from './IPrompt';

// Store 和实例导出
export { promptStore, prompt } from './PromptStore';
