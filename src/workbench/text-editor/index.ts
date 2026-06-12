/**
 * 文本编辑器模块
 *
 * 注册 CodeMirror 6 文本编辑器为 editor-views 的 Provider
 */

import { TextEditor } from './TextEditor';
import { editorViewRegistry } from '../../core';
import type { IEditorViewProvider } from '../../core/editor-views/IEditorViewProvider';
import type { EditorViewInstance, EditorViewCreateOptions } from '../../core/editor-views/types';

/**
 * 文本编辑器 Provider 工厂
 */
const textEditorProvider: IEditorViewProvider = {
  createEditor(options: EditorViewCreateOptions): EditorViewInstance {
    return {
      instanceId: options.instanceId,
      typeId: 'text',
      filePath: options.filePath,
      // content 为 React 组件，由 EditorArea 渲染时传入 props
      content: TextEditor,
    };
  },
};

/**
 * 注册文本编辑器到 editor-views 系统
 */
export function registerTextEditor(): () => void {
  return editorViewRegistry.register(
    {
      id: 'text',
      name: '文本编辑器',
      filenamePatterns: ['*'],
      priority: 0,
    },
    textEditorProvider
  );
}

export { TextEditor } from './TextEditor';
