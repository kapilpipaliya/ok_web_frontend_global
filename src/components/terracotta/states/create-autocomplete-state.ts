import type { Accessor, JSX } from "solid-js";

import {
  createComponent,
  createContext,
  createMemo,
  createSignal,
  untrack,
  useContext,
} from "solid-js";

import type { Ref } from "../utils/types";

import assert from "../utils/assert";
import createInputReader from "../utils/create-input-reader";
import isEqual from "../utils/is-equal";

export interface AutocompleteStateProperties<T> {
  blur(): void;
  disabled(): boolean;
  focus(value: T): void;
  hasActive(): boolean;
  hasQuery(): boolean;
  hasSelected(): boolean;
  isActive(value: T): boolean;
  isSelected(value: T): boolean;
  matches(value: T): boolean;
  query(): string;
  select(value: T): void;
  setQuery(value: string): void;
}

export interface SingleAutocompleteStateControlledOptions<T> {
  by?: (a: T, b: T) => boolean;
  disabled?: boolean;
  matchBy: (value: T, query: string) => boolean;
  multiple?: false;
  onChange?: (value?: T) => void;
  toggleable?: boolean;
  value: T;
}

export interface SingleAutocompleteStateUncontrolledOptions<T> {
  by?: (a: T, b: T) => boolean;
  defaultValue: T;
  disabled?: boolean;
  matchBy: (value: T, query: string) => boolean;
  multiple?: false;
  onChange?: (value?: T) => void;
  toggleable?: boolean;
}

export type SingleAutocompleteStateOptions<T> =
  | SingleAutocompleteStateControlledOptions<T>
  | SingleAutocompleteStateUncontrolledOptions<T>;

export function createSingleAutocompleteState<T>(
  options: SingleAutocompleteStateOptions<T>,
): AutocompleteStateProperties<T> {
  const [active, setActive] = createSignal<Ref<T>>();

  let selectedValue: Accessor<T | undefined>;
  let setSelectedValue: (value: T | undefined) => void;

  const equals = options.by || isEqual;

  if ("defaultValue" in options) {
    const [selected, setSelected] = createSignal<T | undefined>(
      options.defaultValue,
    );
    selectedValue = selected;
    setSelectedValue = (value): void => {
      setSelected(() => value);
      if (options.onChange) {
        options.onChange(value);
      }
    };
  } else {
    selectedValue = createMemo(() => options.value);
    setSelectedValue = (value): void => {
      if (options.onChange) {
        options.onChange(value);
      }
    };
  }

  const isDisabled = createMemo(() => !!options.disabled);

  const [input, setInput] = createInputReader();

  return {
    blur(): void {
      if (!untrack(isDisabled)) {
        setActive(undefined);
      }
    },
    disabled: isDisabled,
    focus(value): void {
      if (!untrack(isDisabled)) {
        setActive({
          value,
        });
      }
    },
    hasActive(): boolean {
      return !!active();
    },
    hasQuery: createMemo(() => !!input()),
    hasSelected(): boolean {
      return selectedValue() != null;
    },
    isActive(value): boolean {
      const ref = active();
      return ref ? equals(value, ref.value) : false;
    },
    isSelected(value): boolean {
      return isEqual(value, selectedValue());
    },
    matches(value): boolean {
      return options.matchBy(value, input());
    },
    query(): string {
      return input();
    },
    select(value): void {
      if (!untrack(isDisabled)) {
        if (options.toggleable && equals(untrack(selectedValue) as T, value)) {
          setSelectedValue(undefined);
        } else {
          setSelectedValue(value);
        }
      }
    },
    setQuery(value): void {
      if (!untrack(isDisabled)) {
        setInput(value);
      }
    },
  };
}

export interface MultipleAutocompleteStateControlledOptions<T> {
  by?: (a: T, b: T) => boolean;
  disabled?: boolean;
  matchBy: (value: T, query: string) => boolean;
  multiple: true;
  onChange?: (value: T[]) => void;
  toggleable?: boolean;
  value: T[];
}

export interface MultipleAutocompleteStateUncontrolledOptions<T> {
  by?: (a: T, b: T) => boolean;
  defaultValue: T[];
  disabled?: boolean;
  matchBy: (value: T, query: string) => boolean;
  multiple: true;
  onChange?: (value: T[]) => void;
  toggleable?: boolean;
}

export type MultipleAutocompleteStateOptions<T> =
  | MultipleAutocompleteStateControlledOptions<T>
  | MultipleAutocompleteStateUncontrolledOptions<T>;

export function createMultipleAutocompleteState<T>(
  options: MultipleAutocompleteStateOptions<T>,
): AutocompleteStateProperties<T> {
  const [active, setActive] = createSignal<Ref<T>>();

  let selectedValues: Accessor<T[]>;
  let setSelectedValues: (value: T[]) => void;

  const equals = options.by || isEqual;

  if ("defaultValue" in options) {
    const [selected, setSelected] = createSignal<T[]>(options.defaultValue);
    selectedValues = selected;
    setSelectedValues = (value): void => {
      setSelected(() => value);
      if (options.onChange) {
        options.onChange(value);
      }
    };
  } else {
    selectedValues = createMemo(() => options.value);
    setSelectedValues = (value): void => {
      if (options.onChange) {
        options.onChange(value);
      }
    };
  }

  const isDisabled = createMemo(() => !!options.disabled);

  const [input, setInput] = createInputReader();

  return {
    blur(): void {
      if (!untrack(isDisabled)) {
        setActive(undefined);
      }
    },
    disabled: isDisabled,
    focus(value): void {
      if (!untrack(isDisabled)) {
        setActive({
          value,
        });
      }
    },
    hasActive: createMemo(() => !!active()),
    hasQuery: createMemo(() => !!input()),
    hasSelected: createMemo(() => selectedValues().length > 0),
    isActive(value): boolean {
      const ref = active();
      if (ref) {
        return equals(value, ref.value);
      }
      return false;
    },
    isSelected(value): boolean {
      const values = selectedValues();
      // Looks up for the value
      for (let i = 0, len = values.length; i < len; i += 1) {
        if (equals(value, values[i])) {
          return true;
        }
      }
      return false;
    },
    matches(value): boolean {
      return options.matchBy(value, input());
    },
    query(): string {
      return input();
    },
    select(value): void {
      if (!untrack(isDisabled)) {
        const newValues: T[] = [];
        const currentValues = untrack(selectedValues);
        let hasValue = false;
        for (let i = 0, len = currentValues.length; i < len; i += 1) {
          const item = currentValues[i];
          // Compare ahead
          const isSame = equals(item, value);
          // If it's the same then we mark the the target value
          // as already existing in the array
          if (isSame) {
            hasValue = true;
          }
          // If it's the same and the list is toggleable
          // don't push the item
          if (!(options.toggleable && isSame)) {
            newValues.push(item);
          }
        }
        // The value doesn't exist, push the new value
        if (!hasValue) {
          newValues.push(value);
        }
        setSelectedValues(newValues);
      }
    },
    setQuery(value): void {
      setInput(value);
    },
  };
}

export interface AutocompleteStateRenderProps<T> {
  children?:
    | ((state: AutocompleteStateProperties<T>) => JSX.Element)
    | JSX.Element;
}

export interface AutocompleteStateProviderProps<T>
  extends AutocompleteStateRenderProps<T> {
  state: AutocompleteStateProperties<T>;
}

const AutocompleteStateContext =
  createContext<AutocompleteStateProperties<unknown>>();

export function AutocompleteStateProvider<T>(
  props: AutocompleteStateProviderProps<T>,
): JSX.Element {
  return createComponent(AutocompleteStateContext.Provider, {
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

export function useAutocompleteState<T>(): AutocompleteStateProperties<T> {
  const ctx = useContext(AutocompleteStateContext);
  assert(ctx, new Error("Missing <AutocompleteStateProvider>"));
  return ctx;
}

export function AutocompleteStateChild<T>(
  props: AutocompleteStateRenderProps<T>,
): JSX.Element {
  const state = useAutocompleteState<T>();
  return createMemo(() => {
    const current = props.children;
    if (typeof current === "function" && current.length === 1) {
      return createMemo(() => current(state));
    }
    return current;
  }) as unknown as JSX.Element;
}
