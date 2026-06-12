/**
 * 编辑器视图系统类型定义
 *
 * 本文件仅包含类型和接口定义，不包含任何实现逻辑。
 * 所有类型均为编辑器视图系统（Core/editor-views）模块的契约基础。
 */

/** 编辑器视图类型唯一标识符 */
export type EditorViewTypeId = string;

/**
 * 编辑器视图实例标识符
 * 一个类型可以创建多个实例（如分屏打开同一个文件两次）
 */
export type EditorViewInstanceId = string;

/**
 * 文件路径或 URI 标识
 */
export type FilePath = string;

/**
 * 文件匹配模式（glob 风格）
 * 例如：'*.png', '*.md', '*'
 */
export type FilenamePattern = string;

/**
 * 编辑器视图类型元数据
 * 描述一种编辑器视图类型的静态信息
 */
export interface EditorViewType {
  /** 唯一标识符（全局唯一） */
  id: EditorViewTypeId;

  /** 显示名称（用于菜单、命令面板、状态栏） */
  name: string;

  /** 文件匹配模式列表 */
  filenamePatterns: FilenamePattern[];

  /**
   * 优先级（数值越大优先级越高）
   * 文件路由时按优先级降序排列，第一个为默认
   * @default 0
   */
  priority?: number;

  /**
   * 是否只读（如图片预览、PDF 查看器）
   * @default false
   */
  readonly?: boolean;

  /** 图标标识（可选） */
  icon?: string;

  /** 描述（可选） */
  description?: string;
}

/**
 * 编辑器视图实例
 * Provider 创建的具体编辑器实例的抽象描述
 *
 * 注：实际渲染内容由 Provider 决定（React 组件、Canvas、iframe 等），
 * 本类型保持抽象，不约束具体渲染技术。
 */
export interface EditorViewInstance {
  /** 实例唯一标识 */
  instanceId: EditorViewInstanceId;

  /** 关联的编辑器视图类型 id */
  typeId: EditorViewTypeId;

  /** 关联的文件路径 */
  filePath: FilePath;

  /**
   * 渲染内容（抽象类型）
   * 具体类型由 Workbench 层和 Provider 协商，
   * 例如 React.ReactNode、HTMLElement、或自定义渲染描述对象。
   */
  content: unknown;

  /**
   * 实例级元数据
   */
  metadata?: Record<string, unknown>;
}

/**
 * 文件路由结果
 * 包含候选编辑器视图类型列表及默认选择
 */
export interface EditorViewResolution {
  /** 按优先级排序的候选类型列表 */
  candidates: EditorViewType[];

  /** 默认选中的类型（candidates[0]） */
  default: EditorViewType | undefined;

  /** 原始文件路径 */
  filePath: FilePath;
}

/**
 * 编辑器视图创建选项
 */
export interface EditorViewCreateOptions {
  /** 关联的文件路径 */
  filePath: FilePath;

  /** 实例唯一标识（由调用方生成） */
  instanceId: EditorViewInstanceId;

  /**
   * 初始数据/内容（可选）
   * 例如：文件内容、二进制数据、URL 等
   */
  initialData?: unknown;

  /**
   * 附加选项（由具体 Provider 定义）
   */
  options?: Record<string, unknown>;
}
