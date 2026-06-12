import type { URI } from 'vscode-uri';

/**
 * 编辑器标签页
 */
export interface EditorTab {
  /** 实例唯一标识 */
  instanceId: string;

  /** 关联的文件 URI */
  uri: URI;

  /** 编辑器视图类型 id */
  typeId: string;

  /** 标签页标题（文件名） */
  title: string;

  /** 当前编辑中的内容 */
  content: string;

  /** 是否有未保存的修改 */
  isDirty: boolean;
}

/**
 * 编辑器管理器状态
 */
export interface EditorManagerState {
  /** 所有打开的标签页 */
  tabs: EditorTab[];

  /** 当前激活的标签页 id */
  activeTabId: string | null;
}

/**
 * 状态变化回调
 */
export type EditorManagerStateChangeCallback = (state: EditorManagerState) => void;
