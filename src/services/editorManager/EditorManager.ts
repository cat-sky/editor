import { URI } from 'vscode-uri';
import { createStore } from 'zustand/vanilla';
import type { IFileSystem } from '../fileSystem/IFileSystem';
import type { IEditorViewRegistry } from '../../core/editor-views/IEditorViewRegistry';
import type { EditorTab, EditorManagerState } from './types';

let instanceIdCounter = 0;

function generateInstanceId(): string {
  return `editor-${++instanceIdCounter}`;
}

/** 全局编辑器状态 store */
export const editorStore = createStore<EditorManagerState>(() => ({
  tabs: [],
  activeTabId: null,
}));

/**
 * 编辑器管理器
 *
 * 管理打开的文件标签页：打开、关闭、激活、保存。
 * 状态存储在 Zustand store 中，Workbench 层通过 useEditorStore 订阅。
 */
export class EditorManager {
  constructor(
    private readonly fileSystem: IFileSystem,
    private readonly editorViewRegistry: IEditorViewRegistry
  ) {}

  /**
   * 打开文件
   *
   * 流程：
   * 1. 通过 editorViewRegistry 解析适用的编辑器类型
   * 2. 通过 fileSystem 读取文件内容
   * 3. 创建新标签页并激活
   */
  async open(uri: URI): Promise<EditorTab> {
    const state = editorStore.getState();

    // 检查是否已打开
    const existing = state.tabs.find((t) => t.uri.toString() === uri.toString());
    if (existing) {
      this.activate(existing.instanceId);
      return existing;
    }

    // 解析编辑器类型
    const resolution = this.editorViewRegistry.resolve(uri.fsPath);
    const typeId = resolution.default?.id ?? 'text';

    // 读取文件内容（先只支持文本）
    const content = await this.fileSystem.readFileString(uri);

    // 创建标签页
    const tab: EditorTab = {
      instanceId: generateInstanceId(),
      uri,
      typeId,
      title: uri.path.split('/').pop() || uri.path,
      content,
      isDirty: false,
    };

    editorStore.setState({
      tabs: [...state.tabs, tab],
      activeTabId: tab.instanceId,
    });

    return tab;
  }

  /**
   * 关闭标签页
   */
  close(instanceId: string): void {
    const state = editorStore.getState();
    const index = state.tabs.findIndex((t) => t.instanceId === instanceId);
    if (index === -1) return;

    const newTabs = state.tabs.filter((t) => t.instanceId !== instanceId);

    // 如果关闭的是当前激活的标签，切换到相邻标签
    let newActiveTabId = state.activeTabId;
    if (state.activeTabId === instanceId) {
      newActiveTabId = newTabs[index]?.instanceId ?? newTabs[index - 1]?.instanceId ?? null;
    }

    editorStore.setState({
      tabs: newTabs,
      activeTabId: newActiveTabId,
    });
  }

  /**
   * 激活标签页
   */
  activate(instanceId: string): void {
    const state = editorStore.getState();
    if (state.tabs.some((t) => t.instanceId === instanceId)) {
      editorStore.setState({ activeTabId: instanceId });
    }
  }

  /**
   * 更新标签页内容（编辑器输入时调用）
   */
  setContent(instanceId: string, content: string): void {
    const state = editorStore.getState();
    const tab = state.tabs.find((t) => t.instanceId === instanceId);
    if (!tab) return;

    const isDirty = content !== tab.content;
    if (tab.content === content && tab.isDirty === isDirty) return;

    const newTabs = state.tabs.map((t) =>
      t.instanceId === instanceId
        ? { ...t, content, isDirty }
        : t
    );

    editorStore.setState({ tabs: newTabs });
  }

  /**
   * 保存标签页
   */
  async save(instanceId?: string): Promise<void> {
    const state = editorStore.getState();
    const id = instanceId ?? state.activeTabId;
    if (!id) return;

    const tab = state.tabs.find((t) => t.instanceId === id);
    if (!tab) return;

    await this.fileSystem.writeFile(tab.uri, tab.content);

    const newTabs = state.tabs.map((t) =>
      t.instanceId === id
        ? { ...t, isDirty: false }
        : t
    );

    editorStore.setState({ tabs: newTabs });
  }
}
