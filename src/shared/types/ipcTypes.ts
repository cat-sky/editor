/**
 * IPC 通信共享类型
 *
 * 主进程与渲染进程之间传输的数据结构。
 * URI 在 IPC 中序列化为 string（uri.toString()），接收方再解析。
 */

// ===== 文件系统 IPC 类型 =====

/** 文件系统请求基类 */
export interface FsRequest {
  /** URI 字符串（序列化后） */
  uri: string;
}

/** 文件系统双 URI 请求（rename/copy） */
export interface FsDualUriRequest {
  source: string;
  target: string;
}

/** 文件系统元数据响应 */
export interface FsStatResponse {
  uri: string;
  type: number;      // FileType 枚举值
  size: number;
  ctime: number;
  mtime: number;
}

/** 目录条目响应 */
export interface FsDirectoryEntry {
  name: string;
  type: number;      // FileType 枚举值
}

/** 读取文件响应（二进制转 Base64 字符串传输） */
export type FsReadFileResponse = string;  // Base64 encoded Uint8Array

/** 读取文本文件响应 */
export type FsReadFileStringResponse = string;

/** 写入文件请求 */
export interface FsWriteFileRequest {
  uri: string;
  /** Base64 编码的二进制数据，或纯文本字符串 */
  content: string;
  /** true 表示 content 是 Base64 二进制，false 表示纯文本 */
  isBinary: boolean;
}

/** 删除请求选项 */
export interface FsDeleteOptions {
  recursive?: boolean;
}

/** 重命名/复制选项 */
export interface FsMoveOptions {
  overwrite?: boolean;
}
