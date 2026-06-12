/**
 * 命令系统类型定义
 *
 * 本文件仅包含类型和接口定义，不包含任何实现逻辑。
 * 所有类型均为命令系统（Core/commands）模块的契约基础。
 */

/** 命令唯一标识符 */
export type CommandId = string;

/**
 * 命令处理器函数签名
 * 返回 Promise 以支持异步命令
 */
export type CommandHandler<TArgs = unknown, TReturn = unknown> = (
  args: TArgs
) => TReturn | Promise<TReturn>;

/**
 * 命令元数据
 * 描述命令的显示信息和行为属性
 */
export interface CommandMetadata {
  /** 命令唯一 ID（全局唯一） */
  id: CommandId;

  /** 显示名称（用于命令面板、菜单等 UI） */
  title: string;

  /** 分类（用于命令面板分组，如"文件"、"编辑"） */
  category?: string;

  /** 描述（用于命令面板搜索和提示） */
  description?: string;

  /** 图标标识 */
  icon?: string;

  /**
   * 是否在命令面板中显示
   * @default true
   */
  visibleInPalette?: boolean;

  /**
   * 【计划中】默认快捷键
   * 实际按键捕获和解析由后续 Keybinding 模块负责
   */
  defaultKeybinding?: string;

  /**
   * 【计划中】命令启用条件（when 子句）
   * 例如："editorHasSelection && !editorReadonly"
   * 需配合后续 Context Key 系统实现，当前版本不生效
   */
  enablement?: string;
}

/**
 * 已注册的命令条目
 * 包含元数据和处理器函数
 */
export interface RegisteredCommand<TArgs = unknown, TReturn = unknown> {
  metadata: CommandMetadata;
  handler: CommandHandler<TArgs, TReturn>;
}

/**
 * 命令执行结果
 * 包装模式：调用方可明确获知成功/失败状态
 */
export interface CommandExecutionResult<TReturn = unknown> {
  /** 是否执行成功 */
  success: boolean;

  /** 执行返回的数据（仅 success 为 true 时存在） */
  data?: TReturn;

  /** 执行失败的错误（仅 success 为 false 时存在） */
  error?: Error;
}

/**
 * 【计划中】快捷键绑定条目
 * 用于后续 Keybinding 模块与命令系统的集成
 */
export interface KeybindingEntry {
  /** 绑定的命令 ID */
  commandId: CommandId;

  /** 快捷键组合（如 "Ctrl+S", "Cmd+P", "Ctrl+K Ctrl+S"） */
  keybinding: string;

  /**
   * 【计划中】生效条件（when 子句）
   * 需配合后续 Context Key 系统实现
   */
  when?: string;

  /** 优先级（数值越大优先级越高，用于冲突解决） */
  priority?: number;
}
