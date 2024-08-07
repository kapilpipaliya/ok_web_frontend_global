import type { Accessor, JSX } from "solid-js";

import {
  createComponent,
  createContext,
  createMemo,
  createSignal,
  untrack,
  useContext,
} from "solid-js";

import assert from "../utils/assert";

export interface CheckStateControlledOptions {
  checked: boolean | undefined;
  disabled?: boolean;
  onChange?: (state?: boolean) => void;
}

export interface CheckStateUncontrolledOptions {
  defaultChecked: boolean | undefined;
  disabled?: boolean;
  onChange?: (state?: boolean) => void;
}

export type CheckStateOptions =
  | CheckStateControlledOptions
  | CheckStateUncontrolledOptions;

export interface CheckStateProperties {
  check(): void;
  checked(): boolean | undefined;
  disabled(): boolean;
  reset(): void;
  setState(newState?: boolean): void;
  toggle(): void;
  uncheck(): void;
}

export function createCheckState(
  options: CheckStateOptions,
): CheckStateProperties {
  // Reference to the signal read
  let signal: Accessor<boolean | undefined>;
  // Reference to the signal write
  let setSignal: (value: boolean | undefined) => void;

  // Type branding
  // Check if state is uncontrolled
  if ("defaultChecked" in options) {
    // Uncontrolled toggle means the toggle
    // manages its own state.
    const [isOpen, setIsOpen] = createSignal<boolean | undefined>(
      options.defaultChecked,
    );
    signal = isOpen;
    setSignal = (value): void => {
      setIsOpen(value);
      if (options.onChange) {
        options.onChange(value);
      }
    };
  } else {
    // Controlled means relying on 3P state
    signal = createMemo(() => options.checked);
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
    checked(): boolean | undefined {
      return signal();
    },
    disabled: isDisabled,
    reset(): void {
      if (!untrack(isDisabled)) {
        setSignal(undefined);
      }
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

export interface CheckStateRenderProps {
  children?: ((state: CheckStateProperties) => JSX.Element) | JSX.Element;
}

export interface CheckStateProviderProps extends CheckStateRenderProps {
  state: CheckStateProperties;
}

const CheckStateContext = createContext<CheckStateProperties>();

export function CheckStateProvider(
  props: CheckStateProviderProps,
): JSX.Element {
  return createComponent(CheckStateContext.Provider, {
    get children() {
      const current = props.children;
      if (typeof current === "function") {
        return current(props.state);
      }
      return current;
    },
    value: props.state,
  });
}

export function useCheckState(): CheckStateProperties {
  const ctx = useContext(CheckStateContext);
  assert(ctx, new Error("Missing <CheckStateProvider>"));
  return ctx;
}

export function CheckStateChild(props: CheckStateRenderProps): JSX.Element {
  const state = useCheckState();
  return createMemo(() => {
    const current = props.children;
    if (typeof current === "function" && current.length === 1) {
      return createMemo(() => current(state));
    }
    return current;
  }) as unknown as JSX.Element;
}
