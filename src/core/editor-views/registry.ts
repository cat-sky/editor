/**
 * 编辑器视图注册表实现
 *
 * 实现 IEditorViewRegistry 接口，提供编辑器视图类型的注册、注销、查询和文件路由能力。
 * 不实现任何具体编辑器 UI，只提供基础设施。
 *
 * 设计原则：
 * - id 为唯一键，重复注册时后注册者覆盖前者
 * - 内置编辑器也通过此插槽注册，无特权
 * - 文件路由返回候选列表，不强制唯一选择
 */

import type {
  EditorViewTypeId,
  EditorViewType,
  FilePath,
  EditorViewResolution,
  FilenamePattern,
} from './types';
import type { IEditorViewRegistry } from './IEditorViewRegistry';
import type { IEditorViewProvider } from './IEditorViewProvider';

/**
 * 将 glob 风格的 filenamePattern 转换为正则表达式
 *
 * 支持：
 * - `*` 匹配任意字符序列
 * - `?` 匹配单个字符
 *
 * @param pattern glob 风格模式，如 '*.png'
 * @returns 可用于匹配文件名的正则表达式
 */
function patternToRegex(pattern: FilenamePattern): RegExp {
  let regexStr = '';
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    switch (char) {
      case '*':
        regexStr += '.*';
        break;
      case '?':
        regexStr += '.';
        break;
      // 转义正则特殊字符
      case '.':
      case '+':
      case '^':
      case '$':
      case '{':
      case '}':
      case '(':
      case ')':
      case '|':
      case '[':
      case ']':
      case '\\':
        regexStr += '\\' + char;
        break;
      default:
        regexStr += char;
    }
  }
  return new RegExp(`^${regexStr}$`);
}

/**
 * 检查 filenamePattern 是否匹配给定文件路径
 *
 * 匹配策略：
 * 1. 先尝试用模式匹配完整文件路径
 * 2. 若不匹配，再尝试用模式匹配文件名（basename）
 *
 * @param filePath 文件路径
 * @param pattern glob 风格模式
 * @returns 是否匹配
 */
function matchesPattern(filePath: FilePath, pattern: FilenamePattern): boolean {
  const regex = patternToRegex(pattern);

  // 尝试匹配完整路径
  if (regex.test(filePath)) {
    return true;
  }

  // 尝试匹配文件名（basename）
  const fileName = filePath.split(/[\\/]/).pop() ?? '';
  return regex.test(fileName);
}

/**
 * 编辑器视图注册表实现类
 */
export class EditorViewRegistry implements IEditorViewRegistry {
  /** 内部存储：类型 id → 类型元数据 */
  private readonly types = new Map<EditorViewTypeId, EditorViewType>();

  /** 内部存储：类型 id → Provider 工厂 */
  private readonly providers = new Map<EditorViewTypeId, IEditorViewProvider>();

  /** 用户自定义默认编辑器：文件扩展名 → 类型 id */
  private readonly userDefaults = new Map<string, EditorViewTypeId>();

  /**
   * 注册一个编辑器视图类型
   *
   * 若 id 已存在，后注册者覆盖前者（便于扩展覆盖内置）。
   *
   * @param type 编辑器视图类型元数据
   * @param provider 创建该类型实例的 Provider 工厂
   * @returns 注销函数（调用后取消注册该类型）
   */
  register(
    type: EditorViewType,
    provider: IEditorViewProvider
  ): () => void {
    const { id } = type;

    // 覆盖策略：直接存入 Map，后注册者覆盖前者
    this.types.set(id, type);
    this.providers.set(id, provider);

    // 返回注销函数
    return () => {
      this.unregister(id);
    };
  }

  /**
   * 注销一个编辑器视图类型
   * @param id 编辑器视图类型 id
   */
  unregister(id: EditorViewTypeId): void {
    this.types.delete(id);
    this.providers.delete(id);
  }

  /**
   * 获取已注册的编辑器视图类型
   * @param id 类型 id
   * @returns 类型元数据，未找到时返回 undefined
   */
  getType(id: EditorViewTypeId): EditorViewType | undefined {
    return this.types.get(id);
  }

  /**
   * 获取已注册类型的 Provider
   * @param id 类型 id
   * @returns Provider，未找到时返回 undefined
   */
  getProvider(id: EditorViewTypeId): IEditorViewProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * 获取所有已注册的编辑器视图类型
   */
  getAllTypes(): EditorViewType[] {
    return Array.from(this.types.values());
  }

  /**
   * 检查类型是否已注册
   */
  hasType(id: EditorViewTypeId): boolean {
    return this.types.has(id);
  }

  /**
   * 根据文件路径解析适用的编辑器视图类型
   *
   * 路由逻辑：
   * 1. 按 filenamePatterns 匹配所有关联类型
   * 2. 按 priority 降序排列
   * 3. 若无匹配，返回内置 `text` 类型（若已注册）
   * 4. 若 `text` 也未注册，返回空列表
   *
   * @param filePath 文件路径
   * @returns 路由结果（候选列表 + 默认选择）
   */
  resolve(filePath: FilePath): EditorViewResolution {
    // 收集所有匹配的类型
    const matched: EditorViewType[] = [];

    for (const type of this.types.values()) {
      const patterns = type.filenamePatterns;
      const isMatch = patterns.some((pattern) =>
        matchesPattern(filePath, pattern)
      );
      if (isMatch) {
        matched.push(type);
      }
    }

    // 按优先级降序排列（数值越大优先级越高）
    matched.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    // 若无匹配，尝试回退到内置 text 类型
    if (matched.length === 0) {
      const textType = this.types.get('text');
      if (textType) {
        matched.push(textType);
      }
    }

    return {
      candidates: matched,
      default: matched[0],
      filePath,
    };
  }

  /**
   * 设置用户自定义默认编辑器
   * 用户通过"重新打开方式"或设置覆盖内置优先级
   *
   * @param fileExtension 文件扩展名（如 '.png'）
   * @param typeId 编辑器视图类型 id
   */
  setUserDefault(
    fileExtension: string,
    typeId: EditorViewTypeId
  ): void {
    // 规范化扩展名：确保以 '.' 开头
    const normalized = fileExtension.startsWith('.')
      ? fileExtension.toLowerCase()
      : `.${fileExtension.toLowerCase()}`;
    this.userDefaults.set(normalized, typeId);
  }

  /**
   * 获取用户自定义默认编辑器
   *
   * @param fileExtension 文件扩展名（如 '.png'）
   * @returns 用户设置的类型 id，未设置时返回 undefined
   */
  getUserDefault(fileExtension: string): EditorViewTypeId | undefined {
    const normalized = fileExtension.startsWith('.')
      ? fileExtension.toLowerCase()
      : `.${fileExtension.toLowerCase()}`;
    return this.userDefaults.get(normalized);
  }
}
