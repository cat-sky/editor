# 文件系统服务（Services/fileSystem）

> 提供跨平台的文件系统操作能力，渲染进程通过 IPC 委托主进程 Node.js 执行。
> 所有路径使用 vscode-uri 的 URI 类型，确保跨平台安全。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- 文件/目录的 CRUD 操作（读、写、创建、删除、重命名、复制）
- 文件元数据查询（stat、exists）
- 目录内容读取
- 二进制与文本文件的统一读取接口

### 不负责什么

- **文件内容解析**（如 Markdown 解析、代码高亮）→ 各编辑器模块
- **文件监听/热重载** → 后续迭代，当前预留接口
- **工作区/项目管理**（当前打开哪个文件夹）→ Services 层 `workspace` 模块
- **编码自动检测**（如 GBK 识别）→ 默认 UTF-8，后续通过配置扩展

---

## 二、核心设计

### URI 作为唯一标识

引入 `vscode-uri`（~8KB，无子依赖）：
- 跨平台路径安全（Windows `C:\foo` vs macOS `/foo`）
- 特殊字符自动编码（`#`, `?`, 空格）
- 支持多 scheme（`file://`, `untitled://` 等，为后续扩展预留）
- IPC 传输时序列化为 `uri.toString()`，接收方用 `URI.parse()` 还原

### 渲染进程 → IPC → 主进程

```
渲染进程 IFileSystem 实现
    ↓ ipcRenderer.invoke(channel, ...args)
Preload 脚本（安全桥梁）
    ↓
主进程 ipcMain.handle(channel, handler)
    ↓
Node.js fs/promises
```

### 二进制与文本分离

| 方法 | 返回类型 | 适用场景 |
|------|----------|----------|
| `readFile()` | `Uint8Array` | 所有文件（图片、视频、文本） |
| `readFileString()` | `string` | 文本文件（默认 UTF-8） |

文本编辑器调用 `readFileString()`，图片/视频编辑器调用 `readFile()`。

---

## 三、依赖关系

### 依赖的模块

- **共享 IPC 类型**（`src/shared/types/ipcTypes.ts`）
- **共享 IPC 通道**（`src/shared/constants/ipcChannels.ts`）

### 被依赖的模块

- **Services `workspace`**：工作区文件操作
- **Services `editorManager`**：编辑器打开/保存文件
- **Workbench `sidebar`**：文件树读取目录
- **Core `editor-views`**：编辑器类型选择时可能需要检查文件类型

---

## 四、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 文件不存在 | 抛出错误，调用方 catch（如文件树显示为空） |
| 权限不足 | 抛出错误，Workbench 层显示提示 |
| 路径非法 | URI 解析阶段报错 |
| 编码错误（非 UTF-8） | `readFileString()` 抛出错误，调用方可回退到 `readFile()` 自行解码 |

---

## 五、设计决策记录

### 决策 1：引入 vscode-uri

- **原因**：跨平台路径处理、特殊字符编码、多 scheme 支持。8KB 无子依赖，收益远大于成本。

### 决策 2：主进程侧不定义额外接口

- **原因**：主进程直接调用 Node.js `fs/promises`，不需要抽象层。handler 函数即实现。

### 决策 3：IPC 传输 Base64 编码二进制

- **原因**：Electron IPC 不支持直接传输 `Uint8Array`（会转为普通对象）。序列化为 Base64 字符串，接收方再解码为 `Uint8Array`。

### 决策 4：默认 UTF-8，编码扩展预留

- **原因**：快速推进文本编辑器。GBK 等编码后续通过 `encoding` 配置 + `iconv-lite` 扩展，不阻塞当前阶段。

---

## 六、待办事项

- [ ] 实现 `FileSystemService` 类（渲染进程侧，通过 IPC 调用主进程）
- [ ] 实现主进程 IPC handler（调用 Node.js fs/promises）
- [ ] 更新 Preload 脚本，暴露 IPC 调用能力
- [ ] 安装 `vscode-uri` 依赖
- [ ] 文件监听（chokidar）→ 后续迭代
- [ ] 编码自动检测 → 后续迭代

---

*本模块遵循 [architecture.md](../architecture.md) 中 Services 层职责边界和依赖方向规则。*
