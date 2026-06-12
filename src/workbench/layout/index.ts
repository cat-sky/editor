/**
 * 布局模块对外导出
 */

import type { ILayout } from './ILayout';
import { LayoutImpl } from './LayoutImpl';

// 类型导出
export type {
  LayoutSlotId,
  LayoutSlot,
  LayoutState,
  LayoutStateChangeCallback,
} from './types';

// 接口导出
export type { ILayout } from './ILayout';

// 实现导出
export { LayoutImpl } from './LayoutImpl';
export { Layout } from './Layout';

// 工厂函数
export function createLayout(): ILayout {
  return new LayoutImpl();
}
