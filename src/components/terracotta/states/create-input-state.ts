import type { Accessor, JSX } from 'solid-js';

import {
  createComponent,
  createContext,
  createMemo,
  createSignal,
  useContext,
} from 'solid-js';

import assert from '../utils/assert';

export interface InputStateControlledOptions {
  disabled?: string;
  onChange?: (state?: string) => void;
  value: string | undefined;
}

export interface InputStateUncontrolledOptions {
  defaultValue: string | undefined;
  disabled?: boolean;
  onChange?: (state?: string) => void;
}

export type InputStateOptions =
  | InputStateControlledOptions
  | InputStateUncontrolledOptions;

export interface InputStateProperties {
  disabled(): boolean;
  setState(newState?: string): void;
  value(): string | undefined;
}

export function createInputState(
  options: InputStateOptions,
): InputStateProperties {
  let signal: Accessor<string | undefined>;
  let setSignal: (value: string | undefined) => void;

  if ('defaultValue' in options) {
    const [input, setInput] = createSignal<string | undefined>(
      options.defaultValue,
    );
    signal = input;
    setSignal = (value): void => {
      setInput(value);
      if (options.onChange) {
        options.onChange(value);
      }
    };
  } else {
    signal = (): string | undefined => options.value;
    setSignal = (value): void => {
      if (options.onChange) {
        options.onChange(value);
      }
    };
  }

  return {
    disabled(): boolean {
      return !!options.disabled;
    },
    setState(value): void {
      if (!options.disabled) {
        setSignal(value);
      }
    },
    value(): string | undefined {
      return signal();
    },
  };
}

export interface InputStateRenderProps {
  children?: ((state: InputStateProperties) => JSX.Element) | JSX.Element;
}

export interface InputStateProviderProps extends InputStateRenderProps {
  state: InputStateProperties;
}

const InputStateContext = createContext<InputStateProperties>();

export function InputStateProvider(
  props: InputStateProviderProps,
): JSX.Element {
  return createComponent(InputStateContext.Provider, {
    get children() {
      const current = props.children;
      if (typeof current === 'function') {
        return current(props.state);
      }
      return current;
    },
    value: props.state,
  });
}

export function useInputState(): InputStateProperties {
  const ctx = useContext(InputStateContext);
  assert(ctx, new Error('Missing <InputStateProvider>'));
  return ctx;
}

export function InputStateChild(props: InputStateRenderProps): JSX.Element {
  const state = useInputState();
  return createMemo(() => {
    const current = props.children;
    if (typeof current === 'function' && current.length === 1) {
      return createMemo(() => current(state));
    }
    return current;
  }) as unknown as JSX.Element;
}
