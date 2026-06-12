/**
 * Workbench 表现层统一入口
 *
 * 初始化并导出所有 Workbench 模块实例
 */

import { createLayout } from './layout';

// 初始化布局模块
export const layout = createLayout();

// 导出组件
export { Layout } from './layout';
export { EditorArea } from './editor-area/EditorArea';
export { FileTree } from './sidebar/FileTree';
export { registerTextEditor, TextEditor } from './text-editor';
export { PromptBox } from './prompt-box';
export { registerWorkbenchCommands } from './workbenchCommands';
