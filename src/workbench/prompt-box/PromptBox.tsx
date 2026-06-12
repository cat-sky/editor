import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore } from 'zustand';
import { commandRegistry, commandExecutor } from '@/core';
import { promptStore, prompt } from '@/services/prompt';
import styles from './PromptBox.module.css';

/**
 * 全局 Quick Input 组件
 *
 * 常驻显示于顶部中央：
 * - 默认显示触发按钮，点击展开命令面板
 * - 其他模块调用 prompt.show() 时，展开为输入框
 * - 支持命令面板模式（搜索并执行命令）
 */
export function PromptBox() {
  const visible = useStore(promptStore, (s) => s.visible);

  if (!visible) {
    return <TriggerButton />;
  }

  return <ActivePanel />;
}

// ==================== 触发按钮（常驻） ====================

function TriggerButton() {
  const handleClick = () => {
    prompt.showCommands();
  };

  return (
    <div className={styles.triggerOverlay}>
      <div className={styles.trigger} onClick={handleClick}>
        <span className={styles.triggerIcon}>⌘</span>
        <span className={styles.triggerText}>搜索或命令...</span>
      </div>
    </div>
  );
}

// ==================== 激活面板 ====================

function ActivePanel() {
  const mode = useStore(promptStore, (s) => s.mode);
  const current = useStore(promptStore, (s) => s.current);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {current?.options.title && mode === 'input' && (
          <div className={styles.title}>{current.options.title}</div>
        )}
        <InputField />
        {mode === 'command' && <CommandList />}
        {mode === 'input' && <InputError />}
      </div>
    </div>
  );
}

// ==================== 输入框 ====================

function InputField() {
  const current = useStore(promptStore, (s) => s.current);
  const inputValue = useStore(promptStore, (s) => s.inputValue);
  const mode = useStore(promptStore, (s) => s.mode);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [current?.id]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    promptStore.getState().setInputValue(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const state = promptStore.getState();

    if (e.key === 'Enter') {
      e.preventDefault();
      if (state.mode === 'command') {
        const commands = getFilteredCommands(state.inputValue);
        const selected = commands[state.selectedIndex];
        if (selected) {
          state.resolve(selected.metadata.id);
        }
      } else {
        state.resolve();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      state.reject();
    } else if (state.mode === 'command' && e.key === 'ArrowDown') {
      e.preventDefault();
      const commands = getFilteredCommands(state.inputValue);
      promptStore.setState({
        selectedIndex: Math.min(
          state.selectedIndex + 1,
          Math.max(0, commands.length - 1)
        ),
      });
    } else if (state.mode === 'command' && e.key === 'ArrowUp') {
      e.preventDefault();
      promptStore.setState({
        selectedIndex: Math.max(state.selectedIndex - 1, 0),
      });
    }
  }, []);

  return (
    <input
      ref={inputRef}
      className={styles.input}
      type="text"
      value={inputValue}
      placeholder={
        mode === 'command'
          ? '输入命令名称...'
          : current?.options.placeholder
      }
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      autoComplete="off"
    />
  );
}

// ==================== 命令列表 ====================

function CommandList() {
  const inputValue = useStore(promptStore, (s) => s.inputValue);
  const selectedIndex = useStore(promptStore, (s) => s.selectedIndex);

  const commands = useMemo(() => getFilteredCommands(inputValue), [inputValue]);

  useEffect(() => {
    const state = promptStore.getState();
    if (state.selectedIndex >= commands.length) {
      promptStore.setState({
        selectedIndex: Math.max(0, commands.length - 1),
      });
    }
  }, [commands.length]);

  const handleSelect = async (commandId: string) => {
    promptStore.getState().resolve(commandId);
    await commandExecutor.execute(commandId);
  };

  return (
    <div className={styles.commandList}>
      {commands.map((cmd, index) => (
        <div
          key={cmd.metadata.id}
          className={`${styles.commandItem} ${
            index === selectedIndex ? styles.commandSelected : ''
          }`}
          onClick={() => handleSelect(cmd.metadata.id)}
        >
          <span className={styles.commandTitle}>{cmd.metadata.title}</span>
          {cmd.metadata.category && (
            <span className={styles.commandCategory}>
              {cmd.metadata.category}
            </span>
          )}
        </div>
      ))}
      {commands.length === 0 && (
        <div className={styles.commandEmpty}>无匹配命令</div>
      )}
    </div>
  );
}

// ==================== 输入错误提示 ====================

function InputError() {
  const error = useStore(promptStore, (s) => s.error);
  if (!error) return null;
  return <div className={styles.error}>{error}</div>;
}

// ==================== 辅助函数 ====================

function getFilteredCommands(filter: string) {
  const all = commandRegistry.getPaletteCommands();
  if (!filter) return all;
  const lower = filter.toLowerCase();
  return all.filter(
    (cmd) =>
      cmd.metadata.title.toLowerCase().includes(lower) ||
      (cmd.metadata.category?.toLowerCase().includes(lower) ?? false) ||
      cmd.metadata.id.toLowerCase().includes(lower)
  );
}
