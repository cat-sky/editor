import { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import type { URI } from 'vscode-uri';

interface TextEditorProps {
  /** 文件 URI */
  uri: URI;

  /** 初始内容 */
  initialContent: string;

  /** 内容变化回调 */
  onChange?: (content: string) => void;

  /** 保存回调（Ctrl+S） */
  onSave?: () => void;
}

/**
 * CodeMirror 6 文本编辑器组件
 *
 * AI-generated: 基于 CodeMirror 6 的文本编辑器实现
 */
export function TextEditor({ initialContent, onChange, onSave }: TextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // 初始化编辑器
  useEffect(() => {
    if (!ref.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: initialContent,
        extensions: [
          basicSetup,
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onChange) {
              onChange(update.state.doc.toString());
            }
          }),
          // Ctrl+S 保存
          EditorView.domEventHandlers({
            keydown: (event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                onSave?.();
                return true;
              }
              return false;
            },
          }),
        ],
      }),
      parent: ref.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // 只初始化一次

  // 外部内容变化时更新（如切换文件）
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== initialContent) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: initialContent,
        },
      });
    }
  }, [initialContent]);

  return (
    <div
      ref={ref}
      style={{
        height: '100%',
        overflow: 'auto',
        fontSize: '14px',
        backgroundColor: '#ffffff',
        color: '#333333',
      }}
    />
  );
}
