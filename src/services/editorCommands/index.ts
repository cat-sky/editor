import { commandRegistry } from '@/core';
import { editorManager } from '@/services';
import { editorStore } from '@/services/editorManager';

/**
 * 注册所有编辑器操作命令
 *
 * 返回注销函数，组件卸载时调用以取消注册所有命令。
 */
export function registerEditorCommands(): () => void {
  const unregisters: (() => void)[] = [];

  // ===== editor.close =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'editor.close',
        title: '关闭编辑器',
        category: '编辑器',
        visibleInPalette: true,
      },
      async (instanceId?: string) => {
        const id = instanceId ?? editorStore.getState().activeTabId;
        if (!id) {
          return { success: false, error: new Error('没有可关闭的编辑器') };
        }
        editorManager.close(id);
        return { success: true, data: true };
      }
    )
  );

  // ===== editor.closeAll =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'editor.closeAll',
        title: '关闭所有编辑器',
        category: '编辑器',
        visibleInPalette: true,
      },
      async () => {
        const state = editorStore.getState();
        if (state.tabs.length === 0) {
          return { success: false, error: new Error('没有打开的标签页') };
        }
        // 复制 tabs 数组避免遍历时修改
        const tabs = [...state.tabs];
        tabs.forEach((tab) => {
          editorManager.close(tab.instanceId);
        });
        return { success: true, data: true };
      }
    )
  );

  // ===== editor.closeOthers =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'editor.closeOthers',
        title: '关闭其他编辑器',
        category: '编辑器',
        visibleInPalette: true,
      },
      async (instanceId?: string) => {
        const keepId = instanceId ?? editorStore.getState().activeTabId;
        if (!keepId) {
          return { success: false, error: new Error('没有激活的编辑器') };
        }

        const state = editorStore.getState();
        const tabsToClose = state.tabs.filter((t) => t.instanceId !== keepId);
        if (tabsToClose.length === 0) {
          return { success: true, data: true };
        }
        tabsToClose.forEach((tab) => {
          editorManager.close(tab.instanceId);
        });
        return { success: true, data: true };
      }
    )
  );

  // ===== editor.closeRight =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'editor.closeRight',
        title: '关闭右侧编辑器',
        category: '编辑器',
        visibleInPalette: true,
      },
      async (instanceId?: string) => {
        const closeId = instanceId ?? editorStore.getState().activeTabId;
        if (!closeId) {
          return { success: false, error: new Error('没有激活的编辑器') };
        }

        const state = editorStore.getState();
        const index = state.tabs.findIndex((t) => t.instanceId === closeId);
        if (index === -1) {
          return { success: false, error: new Error('找不到指定的标签页') };
        }

        const tabsToClose = state.tabs.slice(index + 1);
        if (tabsToClose.length === 0) {
          return { success: true, data: true };
        }
        tabsToClose.forEach((tab) => {
          editorManager.close(tab.instanceId);
        });
        return { success: true, data: true };
      }
    )
  );

  // ===== editor.activateNext =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'editor.activateNext',
        title: '下一个编辑器',
        category: '编辑器',
        visibleInPalette: true,
      },
      async () => {
        const state = editorStore.getState();
        const { tabs, activeTabId } = state;
        if (tabs.length === 0) {
          return { success: false, error: new Error('没有打开的标签页') };
        }
        if (!activeTabId) {
          return { success: false, error: new Error('没有激活的编辑器') };
        }

        const currentIndex = tabs.findIndex((t) => t.instanceId === activeTabId);
        const nextIndex = (currentIndex + 1) % tabs.length;
        editorManager.activate(tabs[nextIndex].instanceId);
        return { success: true, data: true };
      }
    )
  );

  // ===== editor.activatePrevious =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'editor.activatePrevious',
        title: '上一个编辑器',
        category: '编辑器',
        visibleInPalette: true,
      },
      async () => {
        const state = editorStore.getState();
        const { tabs, activeTabId } = state;
        if (tabs.length === 0) {
          return { success: false, error: new Error('没有打开的标签页') };
        }
        if (!activeTabId) {
          return { success: false, error: new Error('没有激活的编辑器') };
        }

        const currentIndex = tabs.findIndex((t) => t.instanceId === activeTabId);
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        editorManager.activate(tabs[prevIndex].instanceId);
        return { success: true, data: true };
      }
    )
  );

  return () => {
    unregisters.forEach((u) => u());
  };
}
