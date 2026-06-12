/**
 * 布局插槽标识
 * 左、中、右三栏
 */
export type LayoutSlotId = 'left' | 'center' | 'right';

/**
 * 单个插槽状态
 */
export interface LayoutSlot {
  /** 插槽标识 */
  id: LayoutSlotId;

  /** 是否可见 */
  visible: boolean;

  /**
   * 插槽宽度（像素）
   * - left / right：具体像素值
   * - center：undefined（自适应剩余空间）
   */
  width?: number;

  /** 最小宽度（像素，仅 left / right 有效） */
  minWidth?: number;

  /** 最大宽度（像素，仅 left / right 有效） */
  maxWidth?: number;
}

/**
 * 布局整体状态
 */
export interface LayoutState {
  /** 所有插槽状态 */
  slots: LayoutSlot[];
}

/**
 * 布局状态变化回调
 */
export type LayoutStateChangeCallback = (state: LayoutState) => void;
