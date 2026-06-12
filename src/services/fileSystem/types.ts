import type { URI } from 'vscode-uri';

/**
 * 文件类型枚举
 * 与 VS Code FileType 保持一致
 */
export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64,
}

/**
 * 文件元数据
 */
export interface FileStat {
  /** 文件 URI */
  uri: URI;

  /** 文件类型 */
  type: FileType;

  /** 文件大小（字节） */
  size: number;

  /** 创建时间戳 */
  ctime: number;

  /** 修改时间戳 */
  mtime: number;
}

/**
 * 目录条目
 */
export interface DirectoryEntry {
  /** 条目名称 */
  name: string;

  /** 条目类型 */
  type: FileType;
}
