import { URI } from 'vscode-uri'
import { IPC_CHANNELS } from '../../shared/constants/ipcChannels'
import type {
  FsRequest,
  FsDualUriRequest,
  FsWriteFileRequest,
  FsDeleteOptions,
  FsMoveOptions,
  FsStatResponse,
  FsDirectoryEntry,
  FsReadFileResponse,
} from '../../shared/types/ipcTypes'
import type { IFileSystem } from './IFileSystem'
import type { FileStat, DirectoryEntry } from './types'
import { FileType } from './types'

// ===== Base64 编解码工具（渲染进程无 Node.js Buffer） =====

function uint8ToBase64(uint8: Uint8Array): string {
  let binary = ''
  const len = uint8.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i])
  }
  return btoa(binary)
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64)
  const len = binary.length
  const uint8 = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    uint8[i] = binary.charCodeAt(i)
  }
  return uint8
}

// ===== IPC 调用封装 =====

async function ipcInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return window.ipcRenderer.invoke(channel, ...args)
}

// ===== 实现类 =====

class FileSystemService implements IFileSystem {
  async stat(uri: URI): Promise<FileStat> {
    const response = await ipcInvoke<FsStatResponse>(IPC_CHANNELS.FILE_SYSTEM.STAT, {
      uri: uri.toString(),
    } as FsRequest)

    return {
      uri: URI.parse(response.uri),
      type: response.type as FileType,
      size: response.size,
      ctime: response.ctime,
      mtime: response.mtime,
    }
  }

  async exists(uri: URI): Promise<boolean> {
    return ipcInvoke<boolean>(IPC_CHANNELS.FILE_SYSTEM.EXISTS, {
      uri: uri.toString(),
    } as FsRequest)
  }

  async readFile(uri: URI): Promise<Uint8Array> {
    const base64 = await ipcInvoke<FsReadFileResponse>(IPC_CHANNELS.FILE_SYSTEM.READ_FILE, {
      uri: uri.toString(),
    } as FsRequest)

    return base64ToUint8(base64)
  }

  async readFileString(uri: URI, _encoding?: string): Promise<string> {
    // encoding 参数当前未通过 IPC 传递，预留后续扩展
    return ipcInvoke<string>(IPC_CHANNELS.FILE_SYSTEM.READ_FILE_STRING, {
      uri: uri.toString(),
    } as FsRequest)
  }

  async writeFile(uri: URI, content: Uint8Array | string): Promise<void> {
    const request: FsWriteFileRequest = {
      uri: uri.toString(),
      content: typeof content === 'string' ? content : uint8ToBase64(content),
      isBinary: typeof content !== 'string',
    }

    return ipcInvoke<void>(IPC_CHANNELS.FILE_SYSTEM.WRITE_FILE, request)
  }

  async readDirectory(uri: URI): Promise<DirectoryEntry[]> {
    const entries = await ipcInvoke<FsDirectoryEntry[]>(IPC_CHANNELS.FILE_SYSTEM.READ_DIRECTORY, {
      uri: uri.toString(),
    } as FsRequest)

    return entries.map((entry) => ({
      name: entry.name,
      type: entry.type as FileType,
    }))
  }

  async createDirectory(uri: URI): Promise<void> {
    return ipcInvoke<void>(IPC_CHANNELS.FILE_SYSTEM.CREATE_DIRECTORY, {
      uri: uri.toString(),
    } as FsRequest)
  }

  async delete(uri: URI, options?: { recursive?: boolean }): Promise<void> {
    return ipcInvoke<void>(IPC_CHANNELS.FILE_SYSTEM.DELETE, {
      uri: uri.toString(),
    } as FsRequest, options as FsDeleteOptions | undefined)
  }

  async rename(source: URI, target: URI, options?: { overwrite?: boolean }): Promise<void> {
    const request: FsDualUriRequest = {
      source: source.toString(),
      target: target.toString(),
    }

    return ipcInvoke<void>(IPC_CHANNELS.FILE_SYSTEM.RENAME, request, options as FsMoveOptions | undefined)
  }

  async copy(source: URI, target: URI, options?: { overwrite?: boolean }): Promise<void> {
    const request: FsDualUriRequest = {
      source: source.toString(),
      target: target.toString(),
    }

    return ipcInvoke<void>(IPC_CHANNELS.FILE_SYSTEM.COPY, request, options as FsMoveOptions | undefined)
  }
}

// ===== 单例导出 =====

export const fileSystem: IFileSystem = new FileSystemService()
