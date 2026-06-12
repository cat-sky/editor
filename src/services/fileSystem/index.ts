/**
 * 文件系统服务对外导出
 *
 * 导出单例实例，供渲染进程各模块直接使用。
 */

// 类型导出
export { FileType } from './types'
export type { FileStat, DirectoryEntry } from './types'

// 接口导出
export type { IFileSystem } from './IFileSystem'

// 实例导出
export { fileSystem } from './FileSystemService'
