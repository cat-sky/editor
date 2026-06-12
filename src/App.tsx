import { useEffect } from 'react'
import { URI } from 'vscode-uri'
import { layout, Layout, PromptBox, registerWorkbenchCommands } from '@/workbench'
import { registerFileCommands, registerEditorCommands } from '@/services'
import { registerTextEditor } from '@/workbench/text-editor'
import { EditorArea } from '@/workbench/editor-area/EditorArea'
import { FileTree } from '@/workbench/sidebar/FileTree'

// ===== 根目录（用 URI 变量） =====
const ROOT_URI = URI.file('C:/Users/neko-/Documents/pages')

// ===== 左侧占位面板 =====
function LeftPanel() {
  return (
    <div style={{ height: '100%', padding: '16px', color: '#888', fontSize: '13px' }}>
      <p>左侧边栏（预留）</p>
    </div>
  )
}

function App() {
  useEffect(() => {
    // 1. 注册文本编辑器 Provider
    const unregisterTextEditor = registerTextEditor()

    // 2. 注册文件操作命令
    const unregisterFileCommands = registerFileCommands()

    // 3. 注册编辑器操作命令
    const unregisterEditorCommands = registerEditorCommands()

    // 4. 注册工作台命令
    const unregisterWorkbenchCommands = registerWorkbenchCommands()

    // 5. 设置布局三栏内容
    layout.setSlotContent('left', <FileTree rootUri={ROOT_URI} />)
    layout.setSlotContent('center', <EditorArea />)
    layout.setSlotContent('right', <LeftPanel />)

    // 清理函数
    return () => {
      unregisterTextEditor()
      unregisterFileCommands()
      unregisterEditorCommands()
      unregisterWorkbenchCommands()
    }
  }, [])

  return (
    <>
      <Layout layout={layout} />
      <PromptBox />
    </>
  )
}

export default App
