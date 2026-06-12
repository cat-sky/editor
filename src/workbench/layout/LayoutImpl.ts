import type { ReactNode } from 'react';
import type { ILayout } from './ILayout';
import type { LayoutSlotId, LayoutSlot, LayoutState, LayoutStateChangeCallback } from './types';

const DEFAULT_MIN_WIDTH = 180;
const DEFAULT_MAX_WIDTH = 600;

/**
 * Layout 模块具体实现
 *
 * AI-generated: 基于第二阶段锁定的 ILayout 接口实现
 */
export class LayoutImpl implements ILayout {
  private slots: Map<LayoutSlotId, LayoutSlot>;
  private contents: Map<LayoutSlotId, ReactNode>;
  private listeners: Set<LayoutStateChangeCallback>;

  constructor() {
    this.slots = new Map([
      ['left', { id: 'left', visible: true, width: 240, minWidth: DEFAULT_MIN_WIDTH, maxWidth: DEFAULT_MAX_WIDTH }],
      ['center', { id: 'center', visible: true }],
      ['right', { id: 'right', visible: true, width: 240, minWidth: DEFAULT_MIN_WIDTH, maxWidth: DEFAULT_MAX_WIDTH }],
    ]);
    this.contents = new Map();
    this.listeners = new Set();
  }

  setSlotContent(slotId: LayoutSlotId, content: ReactNode): void {
    if (!this.isValidSlotId(slotId)) return;
    this.contents.set(slotId, content);
    this.notify();
  }

  getSlotContent(slotId: LayoutSlotId): ReactNode | undefined {
    return this.contents.get(slotId);
  }

  setSlotVisible(slotId: Exclude<LayoutSlotId, 'center'>, visible: boolean): void {
    if (!this.isValidSlotId(slotId)) return;
    const slot = this.slots.get(slotId);
    if (slot && slot.visible !== visible) {
      slot.visible = visible;
      this.notify();
    }
  }

  setSlotWidth(slotId: Exclude<LayoutSlotId, 'center'>, width: number): void {
    if (!this.isValidSlotId(slotId)) return;
    const slot = this.slots.get(slotId);
    if (!slot) return;

    const clamped = Math.max(
      slot.minWidth ?? DEFAULT_MIN_WIDTH,
      Math.min(slot.maxWidth ?? DEFAULT_MAX_WIDTH, width)
    );
    if (slot.width !== clamped) {
      slot.width = clamped;
      this.notify();
    }
  }

  getState(): LayoutState {
    return {
      slots: Array.from(this.slots.values()),
    };
  }

  onStateChange(callback: LayoutStateChangeCallback): () => void {
    this.listeners.add(callback);
    // 立即推送当前状态
    callback(this.getState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  private isValidSlotId(slotId: LayoutSlotId): boolean {
    return slotId === 'left' || slotId === 'center' || slotId === 'right';
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }
}
