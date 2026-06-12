/**
 * prompt 模块类型定义
 *
 * 本文件仅包含类型和接口定义，不包含任何实现逻辑。
 */

/** 输入框模式 */
export type PromptMode = 'input' | 'command';

/**
 * 输入框配置选项
 */
export interface PromptOptions {
  /** 标题 */
  title?: string;

  /** 占位提示 */
  placeholder?: string;

  /** 默认值 */
  value?: string;

  /**
   * 校验函数
   * @param value 当前输入值
   * @returns 错误信息，undefined 表示校验通过
   */
  validate?: (value: string) => string | undefined;

  /** 模式，默认 'input' */
  mode?: PromptMode;
}

/**
 * 输入框请求条目
 */
export interface PromptRequest {
  /** 请求唯一标识 */
  id: string;

  /** 配置选项 */
  options: PromptOptions;

  /** 结果回调 */
  resolve: (value: string | undefined) => void;
}
