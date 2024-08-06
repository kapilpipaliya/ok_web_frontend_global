import type { Accessor, JSX } from 'solid-js';

import {
  createComponent,
  createContext,
  createMemo,
  createSignal,
  untrack,
  useContext,
} from 'solid-js';

import assert from '../utils/assert';

export interface ToggleStateControlledOptions {
  disabled?: boolean;
  onChange?: (state: boolean) => void;
  pressed: boolean;
}

export interface ToggleStateUncontrolledOptions {
  defaultPressed: boolean;
  disabled?: boolean;
  onChange?: (state: boolean) => void;
}

export type ToggleStateOptions =
  | ToggleStateControlledOptions
  | ToggleStateUncontrolledOptions;

export interface ToggleStateProperties {
  check(): void;
  disabled(): boolean;
  pressed(): boolean;
  setState(newState: boolean): void;
  toggle(): void;
  uncheck(): void;
}

export function createToggleState(
  options: ToggleStateOptions,
): ToggleStateProperties {
  // Reference to the signal read
  let signal: Accessor<boolean>;
  // Reference to the signal write
  let setSignal: (value: boolean) => void;

  // Type branding
  // Toggle if state is uncontrolled
  if ('defaultPressed' in options) {
    // Uncontrolled toggle means the toggle
    // manages its own state.
    const [isOpen, setIsOpen] = createSignal<boolean>(options.defaultPressed);
    signal = isOpen;
    setSignal = (value): void => {
      setIsOpen(value);
      if (options.onChange) {
        options.onChange(value);
      }
    };
  } else {
    // Controlled means relying on 3P state
    signal = createMemo(() => options.pressed);
    setSignal = (value): void => {
      if (options.onChange) {
        options.onChange(value);
      }
    };
  }

  const isDisabled = createMemo(() => !!options.disabled);

  return {
    check(): void {
      if (!untrack(isDisabled)) {
        setSignal(true);
      }
    },
    disabled: isDisabled,
    pressed(): boolean {
      return signal();
    },
    setState(value): void {
      if (!untrack(isDisabled)) {
        setSignal(value);
      }
    },
    toggle(): void {
      if (!untrack(isDisabled)) {
        setSignal(!untrack(signal));
      }
    },
    uncheck(): void {
      if (!untrack(isDisabled)) {
        setSignal(false);
      }
    },
  };
}

export interface ToggleStateRenderProps {
  children?: ((state: ToggleStateProperties) => JSX.Element) | JSX.Element;
}

export interface ToggleStateProviderProps extends ToggleStateRenderProps {
  state: ToggleStateProperties;
}

const ToggleStateContext = createContext<ToggleStateProperties>();

export function ToggleStateProvider(
  props: ToggleStateProviderProps,
): JSX.Element {
  return createComponent(ToggleStateContext.Provider, {
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

export function useToggleState(): ToggleStateProperties {
  const ctx = useContext(ToggleStateContext);
  assert(ctx, new Error('Missing <ToggleStateProvider>'));
  return ctx;
}

export function ToggleStateChild(props: ToggleStateRenderProps): JSX.Element {
  const state = useToggleState();
  return createMemo(() => {
    const current = props.children;
    if (typeof current === 'function' && current.length === 1) {
      return createMemo(() => current(state));
    }
    return current;
  }) as unknown as JSX.Element;
}
