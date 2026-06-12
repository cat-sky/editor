/**
 * Services 能力层统一入口
 *
 * 初始化并导出所有 Services 模块实例
 */

import { fileSystem } from './fileSystem';
import { EditorManager } from './editorManager';
import { editorViewRegistry } from '../core';

// 初始化编辑器管理器
const editorManager = new EditorManager(fileSystem, editorViewRegistry);

// 导出
export { fileSystem } from './fileSystem';
export { editorManager };
export { useEditorStore } from './editorManager';
export { prompt } from './prompt';
export { registerFileCommands } from './fileCommands';
export { registerEditorCommands } from './editorCommands';
