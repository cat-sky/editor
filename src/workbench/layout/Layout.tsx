import { useState, useEffect, useRef, useCallback } from 'react';
import type { ILayout } from './ILayout';
import type { LayoutState, LayoutSlotId } from './types';
import styles from './Layout.module.css';

interface LayoutProps {
  layout: ILayout;
}

/**
 * 三栏布局 React 组件
 *
 * AI-generated: 基于 ILayout 接口的 React 桥接层
 */
export function Layout({ layout }: LayoutProps) {
  const [state, setState] = useState<LayoutState>(() => layout.getState());
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    slotId: Exclude<LayoutSlotId, 'center'>;
    startX: number;
    startWidth: number;
    direction: 1 | -1;
  } | null>(null);

  // 订阅布局状态变化
  useEffect(() => {
    return layout.onStateChange((newState) => {
      setState(newState);
    });
  }, [layout]);

  const getSlot = useCallback(
    (id: LayoutSlotId) => state.slots.find((s) => s.id === id),
    [state]
  );

  const leftSlot = getSlot('left');
  const rightSlot = getSlot('right');

  // 拖拽开始
  const handleDragStart = useCallback(
    (
      slotId: Exclude<LayoutSlotId, 'center'>,
      direction: 1 | -1
    ) => (e: React.MouseEvent) => {
      e.preventDefault();
      const slot = getSlot(slotId);
      if (!slot) return;
      dragRef.current = {
        slotId,
        startX: e.clientX,
        startWidth: slot.width ?? 240,
        direction,
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [getSlot]
  );

  // 拖拽中 / 拖拽结束
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { slotId, startX, startWidth, direction } = dragRef.current;
      const delta = (e.clientX - startX) * direction;
      layout.setSlotWidth(slotId, startWidth + delta);
    };

    const handleMouseUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [layout]);

  const renderSlot = (id: LayoutSlotId) => {
    const content = layout.getSlotContent(id);
    const slot = getSlot(id);
    const isVisible = slot?.visible ?? true;
    const width = slot?.width;

    const style: React.CSSProperties = {};
    if (id !== 'center') {
      style.width = isVisible ? width : 0;
      style.minWidth = isVisible ? width : 0;
      style.overflow = 'hidden';
    }

    return (
      <div
        key={id}
        className={`${styles.slot} ${styles[id]} ${!isVisible ? styles.hidden : ''}`}
        style={style}
      >
        {content}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={styles.container}>
      {renderSlot('left')}
      {/* 左-中 拖拽手柄 */}
      {leftSlot?.visible && (
        <div
          className={styles.sash}
          onMouseDown={handleDragStart('left', 1)}
          title="拖拽调整宽度"
        />
      )}
      {renderSlot('center')}
      {/* 中-右 拖拽手柄 */}
      {rightSlot?.visible && (
        <div
          className={styles.sash}
          onMouseDown={handleDragStart('right', -1)}
          title="拖拽调整宽度"
        />
      )}
      {renderSlot('right')}
    </div>
  );
}
