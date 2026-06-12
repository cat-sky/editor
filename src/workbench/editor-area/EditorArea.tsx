import { useCallback } from 'react';
import { URI } from 'vscode-uri';
import { useEditorStore, editorManager } from '@/services';
import { editorViewRegistry } from '@/core';
import type { EditorTab } from '@/services/editorManager';

/**
 * 编辑器区域组件
 *
 * 通过 useEditorStore 订阅 Zustand 状态，渲染标签页列表和当前激活的编辑器。
 */
export function EditorArea() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);

  const activeTab = tabs.find((t) => t.instanceId === activeTabId);

  const handleTabClick = useCallback((instanceId: string) => {
    editorManager.activate(instanceId);
  }, []);

  const handleTabClose = useCallback((e: React.MouseEvent, instanceId: string) => {
    e.stopPropagation();
    editorManager.close(instanceId);
  }, []);

  const handleContentChange = useCallback((instanceId: string, content: string) => {
    editorManager.setContent(instanceId, content);
  }, []);

  const handleSave = useCallback((instanceId: string) => {
    editorManager.save(instanceId);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 标签页栏 */}
      <div
        style={{
          display: 'flex',
          height: '36px',
          background: '#f0f0f0',
          borderBottom: '1px solid #ddd',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.instanceId}
            onClick={() => handleTabClick(tab.instanceId)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              cursor: 'pointer',
              borderRight: '1px solid #ddd',
              background: tab.instanceId === activeTabId ? '#ffffff' : '#e0e0e0',
              color: tab.isDirty ? '#d73a49' : '#333',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}
          >
            <span style={{ marginRight: '8px' }}>
              {tab.title}
              {tab.isDirty && ' ●'}
            </span>
            <span
              onClick={(e) => handleTabClose(e, tab.instanceId)}
              style={{
                cursor: 'pointer',
                opacity: 0.6,
                fontSize: '14px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      {/* 编辑器内容区 */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {activeTab ? (
          <EditorContent
            key={activeTab.instanceId}
            tab={activeTab}
            onChange={(content) => handleContentChange(activeTab.instanceId, content)}
            onSave={() => handleSave(activeTab.instanceId)}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '14px',
            }}
          >
            点击右侧文件打开编辑器
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 编辑器内容渲染组件
 *
 * 通过 editorViewRegistry 获取 Provider，渲染对应的编辑器组件。
 */
function EditorContent({
  tab,
  onChange,
  onSave,
}: {
  tab: EditorTab;
  onChange: (content: string) => void;
  onSave: () => void;
}) {
  const provider = editorViewRegistry.getProvider(tab.typeId);

  if (!provider) {
    return (
      <div style={{ padding: '20px', color: '#ff6b6b' }}>
        未找到编辑器类型: {tab.typeId}
      </div>
    );
  }

  const instance = provider.createEditor({
    filePath: tab.uri.fsPath,
    instanceId: tab.instanceId,
    initialData: tab.content,
  });

  // 文本编辑器的 content 是 TextEditor 组件
  const EditorComp = instance.content as React.FC<{
    uri: URI;
    initialContent: string;
    onChange: (content: string) => void;
    onSave: () => void;
  }>;

  return (
    <EditorComp
      uri={tab.uri}
      initialContent={tab.content}
      onChange={onChange}
      onSave={onSave}
    />
  );
}
