import { useState, useEffect, useCallback } from 'react';
import { URI } from 'vscode-uri';
import { fileSystem } from '../../services';
import { commandExecutor } from '../../core';
import type { DirectoryEntry } from '../../services/fileSystem';
import { FileType } from '../../services/fileSystem';

interface FileTreeProps {
  /** 根目录 URI */
  rootUri: URI;
}

interface TreeNode {
  entry: DirectoryEntry;
  uri: URI;
  children?: TreeNode[];
  expanded: boolean;
}

/**
 * 文件树组件
 *
 * 显示目录结构，点击文件触发 file.open 命令打开编辑器。
 */
export function FileTree({ rootUri }: FileTreeProps) {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载根目录
  useEffect(() => {
    loadDirectory(rootUri).then((children) => {
      setNodes(children);
      setLoading(false);
    });
  }, [rootUri]);

  const loadDirectory = useCallback(async (uri: URI): Promise<TreeNode[]> => {
    const entries = await fileSystem.readDirectory(uri);
    // 目录在前，文件在后，按名称排序
    entries.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === FileType.Directory ? -1 : 1;
    });

    return entries.map((entry) => ({
      entry,
      uri: URI.file(uri.fsPath + '/' + entry.name),
      expanded: false,
    }));
  }, []);

  const toggleExpand = useCallback(
    async (index: number) => {
      const node = nodes[index];
      if (node.entry.type !== FileType.Directory) return;

      const newNodes = [...nodes];
      if (node.expanded) {
        // 收起：清空子节点
        newNodes[index] = { ...node, expanded: false, children: undefined };
      } else {
        // 展开：加载子目录
        const children = await loadDirectory(node.uri);
        newNodes[index] = { ...node, expanded: true, children };
      }
      setNodes(newNodes);
    },
    [nodes, loadDirectory]
  );

  const handleFileClick = useCallback((uri: URI) => {
    commandExecutor.execute('file.openFile', uri.toString());
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '16px', color: '#888', fontSize: '13px' }}>
        加载中...
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '8px 0',
        fontSize: '13px',
        color: '#333',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          padding: '4px 16px',
          fontSize: '11px',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {rootUri.fsPath}
      </div>
      {nodes.map((node, index) => (
        <FileTreeItem
          key={node.uri.toString()}
          node={node}
          depth={0}
          onToggle={() => toggleExpand(index)}
          onFileClick={handleFileClick}
        />
      ))}
    </div>
  );
}

/**
 * 文件树条目组件（递归渲染子目录）
 */
function FileTreeItem({
  node,
  depth,
  onToggle,
  onFileClick,
}: {
  node: TreeNode;
  depth: number;
  onToggle: () => void;
  onFileClick: (uri: URI) => void;
}) {
  const isDir = node.entry.type === FileType.Directory;
  const paddingLeft = 16 + depth * 16;

  return (
    <div>
      <div
        onClick={() => {
          if (isDir) {
            onToggle();
          } else {
            onFileClick(node.uri);
          }
        }}
        style={{
          padding: `4px ${16}px 4px ${paddingLeft}px`,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#e8e8e8')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ marginRight: '6px', fontSize: '12px', opacity: 0.7 }}>
          {isDir ? (node.expanded ? '📂' : '📁') : '📄'}
        </span>
        <span>{node.entry.name}</span>
      </div>

      {/* 子目录 */}
      {isDir && node.expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.uri.toString()}
              node={child}
              depth={depth + 1}
              onToggle={() => {}}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
