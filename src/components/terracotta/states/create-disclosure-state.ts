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

export interface DisclosureStateControlledOptions {
  disabled?: boolean;
  isOpen: boolean;
  onChange?: (state: boolean) => void;
  onClose?: () => void;
  onOpen?: () => void;
}
export type DisclosureStateOptions =
  | DisclosureStateControlledOptions
  | DisclosureStateUncontrolledOptions;

export interface DisclosureStateProperties {
  close(): void;
  disabled(): boolean;
  isOpen(): boolean;
  open(): void;
  setState(newState: boolean): void;
  toggle(): void;
}

export interface DisclosureStateProviderProps
  extends DisclosureStateRenderProps {
  state: DisclosureStateProperties;
}

export interface DisclosureStateRenderProps {
  children?: ((state: DisclosureStateProperties) => JSX.Element) | JSX.Element;
}

export interface DisclosureStateUncontrolledOptions {
  defaultOpen: boolean;
  disabled?: boolean;
  onChange?: (state: boolean) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

export function createDisclosureState(
  options: DisclosureStateOptions,
): DisclosureStateProperties {
  let signal: Accessor<boolean>;
  let setSignal: (value: boolean) => void;

  if ("defaultOpen" in options) {
    const [isOpen, setIsOpen] = createSignal(options.defaultOpen);
    signal = isOpen;
    setSignal = (value): void => {
      setIsOpen(value);
      if (value && options.onOpen) {
        options.onOpen();
      }
      if (options.onChange) {
        options.onChange(value);
      }
      if (!value && options.onClose) {
        options.onClose();
      }
    };
  } else {
    signal = createMemo(() => options.isOpen);
    setSignal = (value): void => {
      if (value && options.onOpen) {
        options.onOpen();
      }
      if (options.onChange) {
        options.onChange(value);
      }
      if (!value && options.onClose) {
        options.onClose();
      }
    };
  }

  const isDisabled = createMemo(() => !!options.disabled);

  return {
    close(): void {
      if (!untrack(isDisabled)) {
        setSignal(false);
      }
    },
    disabled: isDisabled,
    isOpen(): boolean {
      return signal();
    },
    open(): void {
      if (!untrack(isDisabled)) {
        setSignal(true);
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
  };
}

const DisclosureStateContext = createContext<DisclosureStateProperties>();

export function DisclosureStateChild(
  props: DisclosureStateRenderProps,
): JSX.Element {
  const state = useDisclosureState();
  return createMemo(() => {
    const current = props.children;
    if (typeof current === "function" && current.length === 1) {
      return createMemo(() => current(state));
    }
    return current;
  }) as unknown as JSX.Element;
}

export function DisclosureStateProvider(
  props: DisclosureStateProviderProps,
): JSX.Element {
  return createComponent(DisclosureStateContext.Provider, {
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

export function useDisclosureState(): DisclosureStateProperties {
  const ctx = useContext(DisclosureStateContext);
  assert(ctx, new Error("Missing <DisclosureStateProvider>"));
  return ctx;
}
