import { URI } from 'vscode-uri';
import { commandRegistry } from '@/core';
import { fileSystem, editorManager } from '@/services';
import { editorStore } from '@/services/editorManager';

/**
 * 注册所有文件操作命令
 *
 * 返回注销函数，组件卸载时调用以取消注册所有命令。
 */
export function registerFileCommands(): () => void {
  const unregisters: (() => void)[] = [];

  // ===== file.openFile =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.openFile',
        title: '打开文件',
        category: '文件',
        visibleInPalette: true,
      },
      async (uriString: string) => {
        if (!uriString) {
          return { success: false, error: new Error('缺少文件路径参数') };
        }
        const uri = URI.parse(uriString);
        await editorManager.open(uri);
        return { success: true, data: true };
      }
    )
  );

  // ===== file.save =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.save',
        title: '保存',
        category: '文件',
        visibleInPalette: true,
      },
      async () => {
        await editorManager.save();
        return { success: true, data: true };
      }
    )
  );

  // ===== file.newFile =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.newFile',
        title: '新建文件',
        category: '文件',
        visibleInPalette: true,
      },
      async (uriString: string) => {
        if (!uriString) {
          return { success: false, error: new Error('缺少文件路径参数') };
        }
        const uri = URI.parse(uriString);
        await fileSystem.writeFile(uri, '');
        await editorManager.open(uri);
        return { success: true, data: true };
      }
    )
  );

  // ===== file.newFolder =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.newFolder',
        title: '新建文件夹',
        category: '文件',
        visibleInPalette: true,
      },
      async (uriString: string) => {
        if (!uriString) {
          return { success: false, error: new Error('缺少文件夹路径参数') };
        }
        const uri = URI.parse(uriString);
        await fileSystem.createDirectory(uri);
        return { success: true, data: true };
      }
    )
  );

  // ===== file.saveAs =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.saveAs',
        title: '另存为',
        category: '文件',
        visibleInPalette: true,
      },
      async (targetUriString: string) => {
        if (!targetUriString) {
          return { success: false, error: new Error('缺少目标路径参数') };
        }
        const state = editorStore.getState();
        const activeTabId = state.activeTabId;
        if (!activeTabId) {
          return { success: false, error: new Error('没有激活的编辑器') };
        }

        const tab = state.tabs.find((t) => t.instanceId === activeTabId);
        if (!tab) {
          return { success: false, error: new Error('找不到激活的标签页') };
        }

        const targetUri = URI.parse(targetUriString);
        await fileSystem.writeFile(targetUri, tab.content);
        return { success: true, data: true };
      }
    )
  );

  // ===== file.deleteFile =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.deleteFile',
        title: '删除',
        category: '文件',
        visibleInPalette: true,
      },
      async (uriString: string) => {
        if (!uriString) {
          return { success: false, error: new Error('缺少文件路径参数') };
        }
        const uri = URI.parse(uriString);
        await fileSystem.delete(uri, { recursive: true });
        return { success: true, data: true };
      }
    )
  );

  // ===== file.renameFile =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.renameFile',
        title: '重命名',
        category: '文件',
        visibleInPalette: true,
      },
      async (payload: { source: string; newName: string }) => {
        if (!payload?.source || !payload?.newName) {
          return { success: false, error: new Error('缺少源路径或新名称参数') };
        }
        const sourceUri = URI.parse(payload.source);
        const parentPath = sourceUri.fsPath.split(/[\\/]/).slice(0, -1).join('/');
        const targetUri = URI.file(parentPath + '/' + payload.newName);
        await fileSystem.rename(sourceUri, targetUri);
        return { success: true, data: true };
      }
    )
  );

  // ===== file.copy =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.copy',
        title: '复制',
        category: '文件',
        visibleInPalette: true,
      },
      async (payload: { source: string; target: string }) => {
        if (!payload?.source || !payload?.target) {
          return { success: false, error: new Error('缺少源路径或目标路径参数') };
        }
        const sourceUri = URI.parse(payload.source);
        const targetUri = URI.parse(payload.target);
        await fileSystem.copy(sourceUri, targetUri);
        return { success: true, data: true };
      }
    )
  );

  // ===== file.move =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'file.move',
        title: '移动',
        category: '文件',
        visibleInPalette: true,
      },
      async (payload: { source: string; target: string }) => {
        if (!payload?.source || !payload?.target) {
          return { success: false, error: new Error('缺少源路径或目标路径参数') };
        }
        const sourceUri = URI.parse(payload.source);
        const targetUri = URI.parse(payload.target);
        await fileSystem.rename(sourceUri, targetUri);
        return { success: true, data: true };
      }
    )
  );

  return () => {
    unregisters.forEach((u) => u());
  };
}
