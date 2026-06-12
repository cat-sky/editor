/**
 * 编辑器管理器对外导出
 */

export type { EditorTab, EditorManagerState, EditorManagerStateChangeCallback } from './types';
export { EditorManager, editorStore } from './EditorManager';

// Zustand React hook
import { useStore } from 'zustand';
import { editorStore } from './EditorManager';

/** Workbench 层订阅编辑器状态的 hook */
export function useEditorStore<T>(selector: (state: import('./types').EditorManagerState) => T): T {
  return useStore(editorStore, selector);
}
