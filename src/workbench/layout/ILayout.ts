import type { ReactNode } from 'react';
import type { LayoutSlotId, LayoutState, LayoutStateChangeCallback } from './types';

/**
 * 布局模块接口
 *
 * 本文件仅包含接口定义，不包含任何实现逻辑。
 * 负责 Workbench 层三栏布局容器的插槽管理。
 *
 * 设计原则：
 * - 只管理容器骨架和插槽，不约束插槽内部内容
 * - 中间插槽（center）始终可见，不可隐藏
 * - 左/右插槽可显隐、可调整宽度
 */
export interface ILayout {
  /**
   * 设置指定插槽的内容
   *
   * @param slotId 插槽标识（left / center / right）
   * @param content React 组件/元素
   */
  setSlotContent(slotId: LayoutSlotId, content: ReactNode): void;

  /**
   * 获取指定插槽的当前内容
   *
   * @param slotId 插槽标识
   * @returns 当前内容，未设置时返回 undefined
   */
  getSlotContent(slotId: LayoutSlotId): ReactNode | undefined;

  /**
   * 设置插槽可见性
   *
   * 注意：center 插槽始终可见，调用此方法无效。
   *
   * @param slotId 插槽标识
   * @param visible 是否可见
   */
  setSlotVisible(slotId: Exclude<LayoutSlotId, 'center'>, visible: boolean): void;

  /**
   * 设置左/右插槽宽度
   *
   * 注意：center 插槽宽度由容器自适应计算，不可直接设置。
   *
   * @param slotId 插槽标识（left / right）
   * @param width 宽度（像素）
   */
  setSlotWidth(slotId: Exclude<LayoutSlotId, 'center'>, width: number): void;

  /**
   * 获取当前布局状态
   */
  getState(): LayoutState;

  /**
   * 订阅布局状态变化
   *
   * @param callback 状态变化回调
   * @returns 取消订阅函数
   */
  onStateChange(callback: LayoutStateChangeCallback): () => void;
}
