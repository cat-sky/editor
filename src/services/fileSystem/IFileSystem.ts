import type { URI } from 'vscode-uri';
import type { FileStat, DirectoryEntry } from './types';

/**
 * 文件系统服务接口
 *
 * 渲染进程侧接口。所有操作通过 IPC 委托给主进程 Node.js 执行。
 * 实现类内部通过 IPC 调用主进程 handler。
 */
export interface IFileSystem {
  // --- 元数据 ---

  /** 获取文件/目录元数据 */
  stat(uri: URI): Promise<FileStat>;

  /** 检查文件/目录是否存在 */
  exists(uri: URI): Promise<boolean>;

  // --- 读写 ---

  /**
   * 读取文件为二进制数据
   * 适用于所有文件类型（文本、图片、视频等）
   */
  readFile(uri: URI): Promise<Uint8Array>;

  /**
   * 读取文件为文本字符串
   * 默认 UTF-8 编码，可通过 encoding 参数指定其他编码
   * 底层调用 readFile 后解码
   */
  readFileString(uri: URI, encoding?: string): Promise<string>;

  /**
   * 写入文件
   * content 为 string 时按 UTF-8 编码写入
   */
  writeFile(uri: URI, content: Uint8Array | string): Promise<void>;

  // --- 目录 ---

  /** 读取目录内容 */
  readDirectory(uri: URI): Promise<DirectoryEntry[]>;

  /** 创建目录（递归创建父目录） */
  createDirectory(uri: URI): Promise<void>;

  // --- 增删改 ---

  /**
   * 删除文件或目录
   * @param options.recursive 删除目录时是否递归删除子内容
   */
  delete(uri: URI, options?: { recursive?: boolean }): Promise<void>;

  /**
   * 重命名/移动文件或目录
   * @param options.overwrite 目标存在时是否覆盖
   */
  rename(source: URI, target: URI, options?: { overwrite?: boolean }): Promise<void>;

  /**
   * 复制文件或目录
   * @param options.overwrite 目标存在时是否覆盖
   */
  copy(source: URI, target: URI, options?: { overwrite?: boolean }): Promise<void>;
}
