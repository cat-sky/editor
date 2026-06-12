/**
 * 编辑器视图 Provider 接口
 *
 * 本文件仅包含接口定义，不包含任何实现逻辑。
 * 每个编辑器视图类型对应一个 Provider，负责创建该类型的编辑器实例。
 *
 * 设计原则：
 * - Provider 是"工厂"，不是 UI 本身
 * - 返回的实例类型保持抽象，不强制具体渲染技术
 * - 创建是同步的，数据加载可以是异步的（由实例内部处理）
 */

import type {
  EditorViewInstance,
  EditorViewCreateOptions,
} from './types';

/**
 * 编辑器视图 Provider 接口
 * 负责创建特定类型的编辑器视图实例
 */
export interface IEditorViewProvider {
  /**
   * 创建编辑器视图实例
   *
   * 由 EditorManager（Services）或 EditorArea（Workbench）在打开文件时调用。
   * Provider 根据 options 创建并返回实例对象，具体渲染内容由实例决定。
   *
   * @param options 创建选项（含 filePath、instanceId、initialData 等）
   * @returns 编辑器视图实例
   */
  createEditor(options: EditorViewCreateOptions): EditorViewInstance;

  /**
   * 【计划中】动态判断是否能处理某个文件
   *
   * 用于复杂场景：仅通过 filenamePatterns 无法判断时
   *（例如根据文件内容魔数、MIME 类型等）。
   *
   * @param filePath 文件路径
   * @param contentHint 内容提示（如文件头字节、MIME 类型）
   * @returns 是否支持处理该文件
   */
  canHandle?(filePath: string, contentHint?: unknown): boolean;

  /**
   * 【计划中】销毁编辑器视图实例时的清理回调
   *
   * 由 EditorManager 在关闭编辑器实例时调用，用于释放资源
   *（如文件监听、WebGL 上下文、事件订阅等）。
   *
   * @param instance 要销毁的实例
   */
  disposeInstance?(instance: EditorViewInstance): void;
}
