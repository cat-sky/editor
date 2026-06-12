import { ipcMain } from 'electron'
import { promises as fs } from 'node:fs'
import type { Stats } from 'node:fs'
import path from 'node:path'
import { URI } from 'vscode-uri'
import { IPC_CHANNELS } from '../../../src/shared/constants/ipcChannels'
import type {
  FsRequest,
  FsDualUriRequest,
  FsWriteFileRequest,
  FsDeleteOptions,
  FsMoveOptions,
  FsStatResponse,
  FsDirectoryEntry,
  FsReadFileResponse,
  FsReadFileStringResponse,
} from '../../../src/shared/types/ipcTypes'
import { FileType } from '../../../src/services/fileSystem/types'

// ===== 辅助函数 =====

function uriToPath(uri: string): string {
  return URI.parse(uri).fsPath
}

function mapFileType(stats: Stats): FileType {
  if (stats.isSymbolicLink()) return FileType.SymbolicLink
  if (stats.isDirectory()) return FileType.Directory
  if (stats.isFile()) return FileType.File
  return FileType.Unknown
}

function statsToResponse(uri: string, stats: Stats): FsStatResponse {
  return {
    uri,
    type: mapFileType(stats),
    size: stats.size,
    ctime: stats.ctimeMs,
    mtime: stats.mtimeMs,
  }
}

// ===== Handler 实现 =====

const handleStat = async (_event: Electron.IpcMainInvokeEvent, request: FsRequest): Promise<FsStatResponse> => {
  const stats = await fs.stat(uriToPath(request.uri))
  return statsToResponse(request.uri, stats)
}

const handleExists = async (_event: Electron.IpcMainInvokeEvent, request: FsRequest): Promise<boolean> => {
  try {
    await fs.access(uriToPath(request.uri))
    return true
  } catch {
    return false
  }
}

const handleReadFile = async (_event: Electron.IpcMainInvokeEvent, request: FsRequest): Promise<FsReadFileResponse> => {
  const buffer = await fs.readFile(uriToPath(request.uri))
  return buffer.toString('base64')
}

const handleReadFileString = async (_event: Electron.IpcMainInvokeEvent, request: FsRequest): Promise<FsReadFileStringResponse> => {
  // 默认 UTF-8，后续可通过 request 扩展 encoding 参数
  const buffer = await fs.readFile(uriToPath(request.uri))
  return buffer.toString('utf-8')
}

const handleWriteFile = async (_event: Electron.IpcMainInvokeEvent, request: FsWriteFileRequest): Promise<void> => {
  const filePath = uriToPath(request.uri)
  // 确保父目录存在
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  if (request.isBinary) {
    const buffer = Buffer.from(request.content, 'base64')
    await fs.writeFile(filePath, buffer)
  } else {
    await fs.writeFile(filePath, request.content, 'utf-8')
  }
}

const handleReadDirectory = async (_event: Electron.IpcMainInvokeEvent, request: FsRequest): Promise<FsDirectoryEntry[]> => {
  const dirPath = uriToPath(request.uri)
  const names = await fs.readdir(dirPath)

  const entries: FsDirectoryEntry[] = []
  for (const name of names) {
    try {
      const childPath = path.join(dirPath, name)
      const stats = await fs.stat(childPath)
      entries.push({ name, type: mapFileType(stats) })
    } catch {
      // 忽略无法访问的条目（如权限不足的符号链接）
      entries.push({ name, type: FileType.Unknown })
    }
  }

  return entries
}

const handleCreateDirectory = async (_event: Electron.IpcMainInvokeEvent, request: FsRequest): Promise<void> => {
  await fs.mkdir(uriToPath(request.uri), { recursive: true })
}

const handleDelete = async (_event: Electron.IpcMainInvokeEvent, request: FsRequest, options?: FsDeleteOptions): Promise<void> => {
  await fs.rm(uriToPath(request.uri), { recursive: options?.recursive ?? false, force: true })
}

const handleRename = async (_event: Electron.IpcMainInvokeEvent, request: FsDualUriRequest, options?: FsMoveOptions): Promise<void> => {
  const sourcePath = uriToPath(request.source)
  const targetPath = uriToPath(request.target)

  if (options?.overwrite) {
    try {
      await fs.rename(sourcePath, targetPath)
    } catch (err: any) {
      if (err.code === 'EEXIST') {
        await fs.rm(targetPath, { force: true })
        await fs.rename(sourcePath, targetPath)
      } else {
        throw err
      }
    }
  } else {
    await fs.rename(sourcePath, targetPath)
  }
}

const handleCopy = async (_event: Electron.IpcMainInvokeEvent, request: FsDualUriRequest, options?: FsMoveOptions): Promise<void> => {
  await fs.cp(uriToPath(request.source), uriToPath(request.target), {
    recursive: true,
    force: options?.overwrite ?? false,
    errorOnExist: !options?.overwrite,
  })
}

// ===== 注册函数 =====

export function registerFileSystemHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.STAT, handleStat)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.EXISTS, handleExists)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.READ_FILE, handleReadFile)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.READ_FILE_STRING, handleReadFileString)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.WRITE_FILE, handleWriteFile)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.READ_DIRECTORY, handleReadDirectory)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.CREATE_DIRECTORY, handleCreateDirectory)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.DELETE, handleDelete)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.RENAME, handleRename)
  ipcMain.handle(IPC_CHANNELS.FILE_SYSTEM.COPY, handleCopy)
}
