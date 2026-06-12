/**
 * 编辑器视图系统对外导出
 *
 * 导出类型、接口、实现类和工厂函数。
 * 单例实例由 core/index.ts 统一初始化并导出。
 */

// 类型导出
export type {
  EditorViewTypeId,
  EditorViewInstanceId,
  FilePath,
  FilenamePattern,
  EditorViewType,
  EditorViewInstance,
  EditorViewCreateOptions,
  EditorViewResolution,
} from './types';

// 接口导出
export type { IEditorViewRegistry } from './IEditorViewRegistry';
export type { IEditorViewProvider } from './IEditorViewProvider';

// 实现类导出
export { EditorViewRegistry } from './registry';

// 工厂函数实现
import type { IEditorViewRegistry } from './IEditorViewRegistry';
import { EditorViewRegistry } from './registry';

/**
 * 创建编辑器视图注册表实例
 */
export function createEditorViewRegistry(): IEditorViewRegistry {
  return new EditorViewRegistry();
}
