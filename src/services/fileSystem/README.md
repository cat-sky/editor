# 文件系统服务（Services/fileSystem）

## 快速开始

```typescript
import { fileSystem } from '@/services';
import { URI } from 'vscode-uri';

// 1. 读取文本文件
const uri = URI.file('/path/to/file.ts');
const content = await fileSystem.readFileString(uri);

// 2. 写入文件
await fileSystem.writeFile(uri, 'console.log("hello")');

// 3. 读取目录
const entries = await fileSystem.readDirectory(URI.file('/path/to/dir'));
for (const entry of entries) {
  console.log(entry.name, entry.type === FileType.File ? 'file' : 'dir');
}

// 4. 检查存在性
const exists = await fileSystem.exists(uri);
```

## API 索引

| 接口/类型 | 说明 |
|-----------|------|
| `IFileSystem` | 文件系统服务接口（stat, readFile, writeFile, readDirectory 等） |
| `FileType` | 文件类型枚举（Unknown, File, Directory, SymbolicLink） |
| `FileStat` | 文件元数据（uri, type, size, ctime, mtime） |
| `DirectoryEntry` | 目录条目（name, type） |

## 注意事项

- 所有路径使用 `vscode-uri` 的 `URI` 类型，跨平台安全
- `readFile` 返回 `Uint8Array`（二进制），`readFileString` 返回 UTF-8 字符串
- 所有操作通过 IPC 委托给主进程 Node.js `fs/promises` 执行
- 编码处理：默认 UTF-8，其他编码后续通过配置扩展
