# 布局模块（Workbench/layout）

> Workbench 表现层的整体布局容器，提供左中右三栏视图插槽。
> 只负责容器骨架和插槽管理，不实现插槽内部具体内容。

- 创建日期：2025-06-11
- 最后更新：2025-06-11
- 作者：AI 辅助
- 状态：已发布

---

## 一、模块职责边界

### 负责什么

- **三栏布局容器**：左、中、右三个区域的容器管理
- **插槽内容管理**：设置/获取每个插槽的渲染内容
- **插槽显隐控制**：显示/隐藏左/右插槽（中间始终可见）
- **侧边栏宽度调整**：左/右插槽的宽度设置
- **布局状态订阅**：提供当前布局状态的查询和变更通知

### 不负责什么

- **插槽内部具体内容** → 由其他 Workbench 模块填充：
  - 左侧内容（文件树、搜索等）→ `sidebar` 模块
  - 右侧内容（大纲、属性面板等）→ `sidebar` 模块
  - 中间内容（编辑器标签页、分屏）→ `editor-area` 模块
- **编辑器实例管理**（打开、关闭、切换）→ Services 层 `editorManager`
- **编辑器类型选择**（用什么编辑器打开文件）→ Core 层 `editor-views`
- **视图注册**（有哪些侧边栏视图可用）→ Core 层 `views`

---

## 二、核心概念

### 三栏插槽

| 插槽 | 标识 | 职责 | 可隐藏 | 可调整宽度 |
|------|------|------|--------|-----------|
| 左侧边栏 | `left` | 放置文件树、搜索等视图 | ✅ | ✅ |
| 中间编辑器区域 | `center` | 放置编辑器标签页和分屏 | ❌（始终可见） | ❌（自适应剩余空间） |
| 右侧边栏 | `right` | 放置大纲、属性面板等 | ✅ | ✅ |

### 插槽内容

每个插槽接受 `React.ReactNode` 作为内容。具体内容组件由其他模块提供：
- `layout` 只负责把内容放到正确的区域
- 不约束内容内部结构

---

## 三、使用场景与示例

### 场景 1：初始化时设置三栏内容

```typescript
import { layout } from '@/workbench';

// App.tsx 或 Workbench 初始化时
layout.setSlotContent('left', <SidebarFileTree />);
layout.setSlotContent('center', <EditorArea />);   // 由 editor-area 模块提供
layout.setSlotContent('right', <OutlinePanel />);
```

### 场景 2：切换侧边栏显示/隐藏

```typescript
// 用户点击按钮隐藏左侧边栏
layout.setSlotVisible('left', false);

// 再次点击显示
layout.setSlotVisible('left', true);
```

### 场景 3：调整侧边栏宽度

```typescript
// 用户拖拽分隔线调整宽度
layout.setSlotWidth('left', 280);
```

### 场景 4：订阅布局状态变化

```typescript
const unsubscribe = layout.onStateChange((state) => {
  console.log('左侧可见:', state.slots.find(s => s.id === 'left')?.visible);
  console.log('左侧宽度:', state.slots.find(s => s.id === 'left')?.width);
});

// 清理订阅
unsubscribe();
```

---

## 四、依赖关系

### 依赖的模块

- 无（Workbench 层最顶层容器，被其他模块依赖）

### 被依赖的模块

- **Workbench `sidebar`**：将文件树/搜索等视图内容设置到 `left`/`right` 插槽
- **Workbench `editor-area`**：将编辑器标签页内容设置到 `center` 插槽
- **Workbench `statusbar`** / **`titlebar`**：可能订阅布局状态调整自身位置

---

## 五、状态与数据流

```
┌─────────────────────────────────────────────────────────────┐
│                      Workbench Layout                       │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────┐  │
│  │   left      │  │       center        │  │   right     │  │
│  │  (插槽)      │  │    (编辑器区域)      │  │  (插槽)      │  │
│  │             │  │                     │  │             │  │
│  │  Sidebar    │  │    EditorArea       │  │  Outline    │  │
│  │  (外部提供)  │  │    (外部提供)       │  │  (外部提供)  │  │
│  └─────────────┘  └─────────────────────┘  └─────────────┘  │
│         ↑                  ↑                      ↑          │
│         │                  │                      │          │
│   setSlotContent      setSlotContent         setSlotContent  │
│         │                  │                      │          │
│   ┌─────┴──────────────────┴──────────────────────┴─────┐    │
│   │              ILayout 接口                           │    │
│   │  (setSlotContent / setSlotVisible / setSlotWidth)   │    │
│   └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 六、异常处理策略

| 场景 | 处理方式 |
|------|----------|
| 设置不存在的插槽 id | 忽略或抛出错误（实现时决定） |
| 设置 `center` 插槽宽度 | 忽略（中间区域自适应） |
| 隐藏 `center` 插槽 | 拒绝（中间区域始终可见） |
| 内容组件内部报错 | 由 React Error Boundary 处理，layout 不捕获 |

---

## 七、设计决策记录

### 决策 1：中间插槽与左右插槽统一接口

- **原因**：用户明确要求"3个插槽"。虽然中间区域专门用于编辑器，但统一为 `setSlotContent(slotId, content)` 接口更简洁。`center` 的特殊语义由调用方（`editor-area` 模块）保证，不由 `layout` 强制。

### 决策 2：插槽内容类型为 `React.ReactNode`

- **原因**：Workbench 层明确是 React UI 层，使用 `ReactNode` 是最自然的表达。不引入更抽象的渲染器概念，保持简单。

### 决策 3：宽度调整仅支持左/右插槽

- **原因**：中间区域占据剩余空间，宽度由容器总宽减去左/右宽度自动计算。若允许设置中间宽度，会导致三栏宽度冲突。

### 决策 5：当前阶段不引入 Core 层视图注册系统

- **原因**：当前需求是"先搭骨架，再填充内容"，容器模式（手动注入）最符合当前阶段。引入 Core `views` 注册系统会增加设计复杂度，且中间插槽（`center`）由 `editor-area` 模块驱动，不是简单的"视图注册"能覆盖的。
- **演进路线**：见"九、未来演进路线"。

---

## 八、待办事项

- [ ] 实现 `ILayout` 具体类（React 组件 + 状态管理）
- [ ] 实现拖拽调整侧边栏宽度的交互
- [ ] 实现插槽显隐的动画过渡
- [ ] 与 `editor-area` 模块对接：中间插槽内容
- [ ] 与 `sidebar` 模块对接：左/右插槽内容
- [ ] 持久化布局状态（侧边栏宽度、显隐）→ 依赖 Services 层 `storage`

---

## 九、未来演进路线

当前 `layout` 采用**手动注入模式**（模式 A），未来随模块增多，可演进为**注册表驱动模式**（模式 B），`layout` 本身不需要大改。

### 模式 A：手动注入（当前）

```typescript
// App.tsx 手动组装
layout.setSlotContent('left', <SidebarFileTree />);
layout.setSlotContent('center', <EditorArea />);
layout.setSlotContent('right', <OutlinePanel />);
```

**适用阶段**：模块少、内容固定、快速搭建骨架。

### 模式 B：注册表驱动（未来）

引入 Core 层 `views` 模块后，各模块自注册，无需改中央代码：

```typescript
// Core 层 views 系统（新增模块）
views.register({
  id: 'file-tree',
  location: 'left',
  component: FileTree,
  title: '文件树',
  icon: 'folder',
});

views.register({
  id: 'search',
  location: 'left',
  component: SearchPanel,
  title: '搜索',
  icon: 'search',
});

views.register({
  id: 'outline',
  location: 'right',
  component: Outline,
  title: '大纲',
  icon: 'list',
});
```

```typescript
// Workbench sidebar 模块（改造后）
// 从 Core views 读取注册表，渲染为 Activity Bar + Side Panel
const leftViews = views.getByLocation('left');
layout.setSlotContent('left', <Sidebar views={leftViews} />);
```

**适用阶段**：模块多、需要动态增删侧边栏视图、支持扩展/插件。

### 演进路径

| 阶段 | 触发条件 | 动作 | `layout` 变化 |
|------|---------|------|--------------|
| **阶段 1**（当前） | 模块少，快速搭建 | 手动注入三栏内容 | 无 |
| **阶段 2** | 侧边栏视图超过 3 个，需要切换 | 引入 Core `views` 模块，定义注册机制 | 无 |
| **阶段 3** | 需要 Activity Bar 式切换 | 改造 `sidebar` 模块，从 `views` 注册表读取并渲染 | 无，`sidebar` 把组装好的内容注入 `layout` |
| **阶段 4** | 支持第三方扩展 | 扩展通过 `views.register()` 自注册侧边栏视图 | 无 |

**关键结论**：`layout` 始终只负责**三栏容器**，不感知注册机制。注册表驱动模式由 Core `views` + Workbench `sidebar` 协作完成，`layout` 本身接口不变。

---

*本模块遵循 [architecture.md](../architecture.md) 中 Workbench 层职责边界和依赖方向规则。*
