# 布局模块（Workbench/layout）

## 快速开始

```typescript
import { layout } from '@/workbench';

// 1. 设置三栏内容（通常在 App.tsx 或 Workbench 初始化时）
layout.setSlotContent('left', <SidebarFileTree />);
layout.setSlotContent('center', <EditorArea />);
layout.setSlotContent('right', <OutlinePanel />);

// 2. 切换侧边栏显隐
layout.setSlotVisible('left', false);  // 隐藏左侧
layout.setSlotVisible('left', true);   // 显示左侧

// 3. 调整侧边栏宽度
layout.setSlotWidth('left', 280);
layout.setSlotWidth('right', 240);

// 4. 订阅布局状态变化
const unsubscribe = layout.onStateChange((state) => {
  const leftSlot = state.slots.find(s => s.id === 'left');
  console.log('左侧可见:', leftSlot?.visible);
  console.log('左侧宽度:', leftSlot?.width);
});

// 清理订阅
unsubscribe();
```

## API 索引

| 接口/类型 | 说明 |
|-----------|------|
| `ILayout` | 布局模块接口（插槽内容、显隐、宽度、状态订阅） |
| `LayoutSlotId` | 插槽标识：`'left'` / `'center'` / `'right'` |
| `LayoutSlot` | 单个插槽状态（id、visible、width、minWidth、maxWidth） |
| `LayoutState` | 整体布局状态（slots 数组） |
| `LayoutStateChangeCallback` | 状态变化回调类型 |

## 实现文件

| 文件 | 职责 |
|------|------|
| `ILayout.ts` | 接口定义（第二阶段锁定） |
| `types.ts` | 类型定义 |
| `LayoutImpl.ts` | `ILayout` 具体实现类 |
| `Layout.tsx` | React 桥接组件（渲染 + 拖拽交互） |
| `Layout.module.css` | 布局样式、拖拽手柄、显隐动画 |
| `index.ts` | 对外导出（含 `createLayout` 工厂函数） |

## 注意事项

- 本模块**只负责容器骨架**，不实现插槽内部具体内容
- 中间插槽（`center`）**始终可见**，不可隐藏
- 中间插槽宽度**自适应剩余空间**，不可直接设置
- 左/右插槽内容、显隐、宽度由其他模块（`sidebar`、`editor-area`）控制
- 布局状态变化通过订阅模式通知，适合状态栏、标题栏等模块监听
- 宽度自动钳制在 `minWidth(180)` ~ `maxWidth(600)` 之间

## 未来演进路线

当前为**手动注入模式**（App.tsx 手动组装三栏内容）。未来模块增多后，可引入 Core `views` 注册系统，各模块自注册侧边栏视图，`sidebar` 模块从注册表读取并渲染，再注入 `layout`。`layout` 本身接口不变，始终只负责三栏容器。详见 [模块设计文档](../../../docs/workbench/layout.md#九未来演进路线)。
