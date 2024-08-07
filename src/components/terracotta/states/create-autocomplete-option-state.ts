import type { JSX } from "solid-js";

import {
  createComponent,
  createContext,
  createMemo,
  untrack,
  useContext,
} from "solid-js";

import assert from "../utils/assert";
import { useAutocompleteState } from "./create-autocomplete-state";

export interface AutocompleteOptionStateOptions<T> {
  disabled?: boolean;
  value: T;
}

export interface AutocompleteOptionStateProperties {
  blur(): void;
  disabled(): boolean;
  focus(): void;
  isActive(): boolean;
  isSelected(): boolean;
  matches(): boolean;
  select(): void;
}

export function createAutocompleteOptionState<T>(
  options: AutocompleteOptionStateOptions<T>,
): AutocompleteOptionStateProperties {
  const state = useAutocompleteState<T>();
  const isDisabled = createMemo(() => options.disabled || state.disabled());
  return {
    blur(): void {
      if (!untrack(isDisabled) && this.isActive()) {
        state.blur();
      }
    },
    disabled: isDisabled,
    focus(): void {
      if (!untrack(isDisabled)) {
        state.focus(options.value);
      }
    },
    isActive: createMemo(() => state.isActive(options.value)),
    isSelected: createMemo(() => state.isSelected(options.value)),
    matches: createMemo(() => state.matches(options.value)),
    select(): void {
      if (!untrack(isDisabled)) {
        state.select(options.value);
      }
    },
  };
}

export interface AutocompleteOptionStateRenderProps {
  children?:
    | ((state: AutocompleteOptionStateProperties) => JSX.Element)
    | JSX.Element;
}

export interface AutocompleteOptionStateProviderProps
  extends AutocompleteOptionStateRenderProps {
  state: AutocompleteOptionStateProperties;
}

const AutocompleteOptionStateContext =
  createContext<AutocompleteOptionStateProperties>();

export function AutocompleteOptionStateProvider(
  props: AutocompleteOptionStateProviderProps,
): JSX.Element {
  return createComponent(AutocompleteOptionStateContext.Provider, {
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

export function useAutocompleteOptionState(): AutocompleteOptionStateProperties {
  const ctx = useContext(AutocompleteOptionStateContext);
  assert(ctx, new Error("Missing <AutocompleteOptionStateProvider>"));
  return ctx;
}

export function AutocompleteOptionStateChild(
  props: AutocompleteOptionStateRenderProps,
): JSX.Element {
  const state = useAutocompleteOptionState();
  return createMemo(() => {
    const current = props.children;
    if (typeof current === "function" && current.length === 1) {
      return createMemo(() => current(state));
    }
    return current;
  }) as unknown as JSX.Element;
}
