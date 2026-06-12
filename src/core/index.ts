/**
 * Core 框架层统一初始化与导出
 *
 * 本文件负责初始化 Core 层所有基础设施实例，并导出供 Services 和 Workbench 层使用。
 * 采用轻量单例模式，避免过长的依赖注入链条。
 *
 * 初始化顺序：
 * 1. 命令注册表（最底层基础设施）
 * 2. 命令执行器（依赖注册表）
 */

import {
  createCommandRegistry,
  createCommandExecutor,
} from './commands';
import { createEditorViewRegistry } from './editor-views';

// ==================== 命令系统实例 ====================

/** 全局命令注册表实例 */
export const commandRegistry = createCommandRegistry();

/** 全局命令执行器实例 */
export const commandExecutor = createCommandExecutor(commandRegistry);

// ==================== 编辑器视图系统实例 ====================

/** 全局编辑器视图注册表实例 */
export const editorViewRegistry = createEditorViewRegistry();

// ==================== 类型重导出 ====================

// 命令系统类型
export type {
  CommandId,
  CommandHandler,
  CommandMetadata,
  RegisteredCommand,
  CommandExecutionResult,
  KeybindingEntry,
  ICommandRegistry,
  ICommandExecutor,
} from './commands';

// 编辑器视图系统类型
export type {
  EditorViewTypeId,
  EditorViewInstanceId,
  FilePath,
  FilenamePattern,
  EditorViewType,
  EditorViewInstance,
  EditorViewCreateOptions,
  EditorViewResolution,
  IEditorViewRegistry,
  IEditorViewProvider,
} from './editor-views';
