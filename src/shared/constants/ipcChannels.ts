/**
 * IPC 通道常量
 *
 * 主进程与渲染进程通信的通道名称。
 * 所有通道使用命名空间前缀防止冲突。
 */

export const IPC_CHANNELS = {
  /** 文件系统操作通道 */
  FILE_SYSTEM: {
    STAT: 'fs:stat',
    EXISTS: 'fs:exists',
    READ_FILE: 'fs:readFile',
    READ_FILE_STRING: 'fs:readFileString',
    WRITE_FILE: 'fs:writeFile',
    READ_DIRECTORY: 'fs:readDirectory',
    CREATE_DIRECTORY: 'fs:createDirectory',
    DELETE: 'fs:delete',
    RENAME: 'fs:rename',
    COPY: 'fs:copy',
  },
} as const;
