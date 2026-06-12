import { createStore } from 'zustand/vanilla';
import type { PromptOptions, PromptRequest, PromptMode } from './types';
import type { IPrompt } from './IPrompt';

// ==================== Zustand Store ====================

interface PromptStoreState {
  /** 是否展开显示完整面板 */
  visible: boolean;

  /** 当前模式 */
  mode: PromptMode;

  /** 请求队列 */
  queue: PromptRequest[];

  /** 当前处理的请求 */
  current: PromptRequest | null;

  /** 当前输入值 */
  inputValue: string;

  /** 校验错误信息 */
  error: string | undefined;

  /** 命令模式下选中的索引 */
  selectedIndex: number;
}

interface PromptStoreActions {
  /** 设置输入值（同时触发校验） */
  setInputValue(value: string): void;

  /** 确认当前请求 */
  resolve(value?: string): void;

  /** 取消当前请求 */
  reject(): void;
}

/** 全局 prompt store 实例 */
export const promptStore = createStore<PromptStoreState & PromptStoreActions>(
  (set, get) => ({
    visible: false,
    mode: 'input',
    queue: [],
    current: null,
    inputValue: '',
    error: undefined,
    selectedIndex: 0,

    setInputValue(value: string) {
      const { current, mode } = get();
      let error: string | undefined;
      if (mode === 'input' && current?.options.validate) {
        error = current.options.validate(value);
      }
      set({ inputValue: value, error });
    },

    resolve(value?: string) {
      const { current, queue, inputValue, error, mode } = get();
      if (!current) return;
      if (mode === 'input' && error) return;

      const resolvedValue = value !== undefined ? value : inputValue;
      current.resolve(resolvedValue);

      const next = queue[0] ?? null;
      const remaining = next ? queue.slice(1) : queue;

      if (next) {
        const nextInput = next.options.value ?? '';
        let nextError: string | undefined;
        if (next.options.mode === 'input' && next.options.validate && nextInput) {
          nextError = next.options.validate(nextInput);
        }
        set({
          queue: remaining,
          current: next,
          inputValue: nextInput,
          error: nextError,
          visible: true,
          mode: next.options.mode ?? 'input',
          selectedIndex: 0,
        });
      } else {
        set({
          queue: remaining,
          current: null,
          inputValue: '',
          error: undefined,
          visible: false,
          mode: 'input',
          selectedIndex: 0,
        });
      }
    },

    reject() {
      const { current, queue } = get();
      if (!current) return;

      current.resolve(undefined);

      const next = queue[0] ?? null;
      const remaining = next ? queue.slice(1) : queue;

      if (next) {
        const nextInput = next.options.value ?? '';
        let nextError: string | undefined;
        if (next.options.mode === 'input' && next.options.validate && nextInput) {
          nextError = next.options.validate(nextInput);
        }
        set({
          queue: remaining,
          current: next,
          inputValue: nextInput,
          error: nextError,
          visible: true,
          mode: next.options.mode ?? 'input',
          selectedIndex: 0,
        });
      } else {
        set({
          queue: remaining,
          current: null,
          inputValue: '',
          error: undefined,
          visible: false,
          mode: 'input',
          selectedIndex: 0,
        });
      }
    },
  })
);

// ==================== IPrompt 实现 ====================

let idCounter = 0;

function createRequest(
  options: PromptOptions,
  resolve: (value: string | undefined) => void
): PromptRequest {
  return {
    id: `prompt-${++idCounter}`,
    options,
    resolve,
  };
}

function pushRequest(request: PromptRequest) {
  const state = promptStore.getState();

  if (!state.current) {
    const inputValue = request.options.value ?? '';
    let error: string | undefined;
    if (request.options.mode === 'input' && request.options.validate && inputValue) {
      error = request.options.validate(inputValue);
    }

    promptStore.setState({
      current: request,
      queue: state.queue,
      inputValue,
      error,
      visible: true,
      mode: request.options.mode ?? 'input',
      selectedIndex: 0,
    });
  } else {
    promptStore.setState({
      queue: [...state.queue, request],
    });
  }
}

function showPrompt(options: PromptOptions = {}): Promise<string | undefined> {
  return new Promise((resolve) => {
    pushRequest(createRequest({ ...options, mode: 'input' }, resolve));
  });
}

function showCommands(): Promise<string | undefined> {
  return new Promise((resolve) => {
    pushRequest(createRequest({ mode: 'command' }, resolve));
  });
}

/** 全局 prompt 服务实例 */
export const prompt: IPrompt = {
  show: showPrompt,
  showCommands,
};
