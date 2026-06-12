import { commandRegistry } from '@/core';

/**
 * 注册所有工作台命令
 *
 * 返回注销函数，组件卸载时调用以取消注册所有命令。
 */
export function registerWorkbenchCommands(): () => void {
  const unregisters: (() => void)[] = [];

  // ===== workbench.openFolder =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'workbench.openFolder',
        title: '打开文件夹',
        category: '工作台',
        visibleInPalette: true,
      },
      async (uriString: string) => {
        // TODO: 未来由 workspace 模块处理
        console.log('[workbench.openFolder]', uriString);
        return true;
      }
    )
  );

  // ===== workbench.refreshExplorer =====
  unregisters.push(
    commandRegistry.register(
      {
        id: 'workbench.refreshExplorer',
        title: '刷新文件树',
        category: '工作台',
        visibleInPalette: true,
      },
      async () => {
        // TODO: 未来由 sidebar 模块响应此命令刷新文件树
        console.log('[workbench.refreshExplorer]');
        return true;
      }
    )
  );

  return () => {
    unregisters.forEach((u) => u());
  };
}
