# 编辑器视图系统（Core/editor-views）

> 编辑器视图类型注册与路由系统。注册的是"编辑器视图类型"（工厂/Provider），不是具体的 UI 实例。
> 负责：有哪些编辑器类型、这个文件该用哪种类型打开。

## 快速开始

```typescript
import { editorViewRegistry } from '@/core';

// 1. 注册一个编辑器视图类型（通常在 Workbench 初始化或扩展加载时）
const unregister = editorViewRegistry.register(
  {
    id: 'image-preview',
    name: '图片预览',
    filenamePatterns: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.webp', '*.svg'],
    priority: 100,        // 高优先级，覆盖默认文本编辑器
    readonly: true,       // 只读
  },
  {
    // Provider 工厂
    createEditor(options) {
      return {
        instanceId: options.instanceId,
        typeId: 'image-preview',
        filePath: options.filePath,
        content: /* React 组件、Canvas、或其他渲染内容 */,
      };
    },
  }
);

// 2. 根据文件路径解析适用的编辑器类型
const resolution = editorViewRegistry.resolve('/path/to/photo.png');
console.log(resolution.candidates); // [{ id: 'image-preview', ... }, { id: 'text', ... }]
console.log(resolution.default);    // { id: 'image-preview', ... }

// 3. 获取 Provider 创建实例
const provider = editorViewRegistry.getProvider('image-preview');
const instance = provider!.createEditor({
  filePath: '/path/to/photo.png',
  instanceId: 'img-001',
});

// 4. 注销类型
unregister();
```

## 用户自定义默认编辑器

```typescript
// 设置：所有 .md 文件默认用自定义 Markdown 编辑器打开
editorViewRegistry.setUserDefault('.md', 'custom-markdown');

// 查询
const defaultForMd = editorViewRegistry.getUserDefault('.md');
// → 'custom-markdown'
```

## API 索引

| 接口/类型 | 说明 |
|-----------|------|
| `IEditorViewRegistry` | 编辑器视图类型注册、注销、查询、文件路由接口 |
| `IEditorViewProvider` | 编辑器视图实例工厂（createEditor）接口 |
| `EditorViewRegistry` | 注册表实现类（可直接实例化） |
| `EditorViewType` | 编辑器视图类型元数据（id、name、filenamePatterns、priority） |
| `EditorViewInstance` | 编辑器视图实例抽象描述（instanceId、typeId、content） |
| `EditorViewCreateOptions` | 创建实例的选项（filePath、instanceId、initialData） |
| `EditorViewResolution` | 文件路由结果（candidates + default） |
| `createEditorViewRegistry()` | 工厂函数，创建注册表实例 |

## 注意事项

- 本模块注册的是**编辑器视图类型（工厂）**，不是具体的 UI 实例
- 内置文本编辑器（`text`）也通过此插槽注册，无特权
- 重复注册同一 id 时，**后注册者覆盖前者**
- 文件路由返回**候选列表**，调用方可让用户手动选择非默认类型
- 文件匹配支持 glob 风格（`*.png`、`*`），同时匹配完整路径和文件名
- 路由无匹配时自动回退到 `text` 类型（若已注册）
- Provider 返回的 `content` 类型保持抽象，具体渲染技术由 Workbench 层和 Provider 协商
- 实例生命周期管理（打开、关闭、切换）由 Services 层 `editorManager` 负责
- 具体 UI 渲染由 Workbench 层 `editor-area` 负责
