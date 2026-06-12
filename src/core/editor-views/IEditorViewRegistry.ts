/**
 * 编辑器视图注册表接口
 *
 * 本文件仅包含接口定义，不包含任何实现逻辑。
 * 负责编辑器视图类型的注册、注销、查询，以及文件路由。
 *
 * 设计原则：
 * - id 为唯一键，重复注册时后注册者覆盖前者
 * - 内置编辑器也通过此插槽注册，无特权
 * - 文件路由返回候选列表，不强制唯一选择
 */

import type {
  EditorViewTypeId,
  EditorViewType,
  FilePath,
  EditorViewResolution,
} from './types';
import type { IEditorViewProvider } from './IEditorViewProvider';

/**
 * 编辑器视图注册表接口
 * 提供编辑器视图类型的注册、注销、查询和文件路由能力
 */
export interface IEditorViewRegistry {
  /**
   * 注册一个编辑器视图类型
   *
   * 若 id 已存在，后注册者覆盖前者（便于扩展覆盖内置）。
   *
   * @param type 编辑器视图类型元数据
   * @param provider 创建该类型实例的 Provider 工厂
   * @returns 注销函数（调用后取消注册该类型）
   */
  register(
    type: EditorViewType,
    provider: IEditorViewProvider
  ): () => void;

  /**
   * 注销一个编辑器视图类型
   * @param id 编辑器视图类型 id
   */
  unregister(id: EditorViewTypeId): void;

  /**
   * 获取已注册的编辑器视图类型
   * @param id 类型 id
   * @returns 类型元数据，未找到时返回 undefined
   */
  getType(id: EditorViewTypeId): EditorViewType | undefined;

  /**
   * 获取已注册类型的 Provider
   * @param id 类型 id
   * @returns Provider，未找到时返回 undefined
   */
  getProvider(id: EditorViewTypeId): IEditorViewProvider | undefined;

  /**
   * 获取所有已注册的编辑器视图类型
   */
  getAllTypes(): EditorViewType[];

  /**
   * 检查类型是否已注册
   */
  hasType(id: EditorViewTypeId): boolean;

  /**
   * 根据文件路径解析适用的编辑器视图类型
   *
   * 路由逻辑：
   * 1. 按 filenamePatterns 匹配所有关联类型
   * 2. 按 priority 降序排列
   * 3. 若无匹配，返回内置 `text` 类型（若已注册）
   * 4. 若 `text` 也未注册，返回空列表
   *
   * @param filePath 文件路径
   * @returns 路由结果（候选列表 + 默认选择）
   */
  resolve(filePath: FilePath): EditorViewResolution;

  /**
   * 【计划中】设置用户自定义默认编辑器
   * 用户通过"重新打开方式"或设置覆盖内置优先级
   */
  setUserDefault?(fileExtension: string, typeId: EditorViewTypeId): void;

  /**
   * 【计划中】获取用户自定义默认编辑器
   */
  getUserDefault?(fileExtension: string): EditorViewTypeId | undefined;
}
