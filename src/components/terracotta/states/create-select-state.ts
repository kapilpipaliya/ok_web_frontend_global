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
import isEqual from "../utils/is-equal";

export interface MultipleSelectStateControlledOptions<T> {
  by?: (a: T, b: T) => boolean;
  disabled?: boolean;
  multiple: true;
  onChange?: (value: T[]) => void;
  toggleable?: boolean;
  value: T[];
}

export type MultipleSelectStateOptions<T> =
  | MultipleSelectStateControlledOptions<T>
  | MultipleSelectStateUncontrolledOptions<T>;

export interface MultipleSelectStateUncontrolledOptions<T> {
  by?: (a: T, b: T) => boolean;
  defaultValue: T[];
  disabled?: boolean;
  multiple: true;
  onChange?: (value: T[]) => void;
  toggleable?: boolean;
}

export interface SelectStateProperties<T> {
  blur(): void;
  disabled(): boolean;
  focus(value: T): void;
  hasActive(): boolean;
  hasSelected(): boolean;
  isActive(value: T): boolean;
  isSelected(value: T): boolean;
  select(value: T): void;
}

export interface SelectStateProviderProps<T> extends SelectStateRenderProps<T> {
  state: SelectStateProperties<T>;
}

export interface SelectStateRenderProps<T> {
  children?: ((state: SelectStateProperties<T>) => JSX.Element) | JSX.Element;
}

export interface SingleSelectStateControlledOptions<T> {
  by?: (a: T, b: T) => boolean;
  disabled?: boolean;
  multiple?: false;
  onChange?: (value?: T) => void;
  toggleable?: boolean;
  value: T;
}

export type SingleSelectStateOptions<T> =
  | SingleSelectStateControlledOptions<T>
  | SingleSelectStateUncontrolledOptions<T>;

export interface SingleSelectStateUncontrolledOptions<T> {
  by?: (a: T, b: T) => boolean;
  defaultValue: T;
  disabled?: boolean;
  multiple?: false;
  onChange?: (value?: T) => void;
  toggleable?: boolean;
}

export function createMultipleSelectState<T>(
  options: MultipleSelectStateOptions<T>,
): SelectStateProperties<T> {
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
  };
}

export function createSingleSelectState<T>(
  options: SingleSelectStateOptions<T>,
): SelectStateProperties<T> {
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
    select(value): void {
      if (!untrack(isDisabled)) {
        if (options.toggleable && equals(untrack(selectedValue) as T, value)) {
          setSelectedValue(undefined);
        } else {
          setSelectedValue(value);
        }
      }
    },
  };
}

const SelectStateContext = createContext<SelectStateProperties<unknown>>();

export function SelectStateChild<T>(
  props: SelectStateRenderProps<T>,
): JSX.Element {
  const state = useSelectState<T>();
  return createMemo(() => {
    const current = props.children;
    if (typeof current === "function" && current.length === 1) {
      return createMemo(() => current(state));
    }
    return current;
  }) as unknown as JSX.Element;
}

export function SelectStateProvider<T>(
  props: SelectStateProviderProps<T>,
): JSX.Element {
  return createComponent(SelectStateContext.Provider, {
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

export function useSelectState<T>(): SelectStateProperties<T> {
  const ctx = useContext(SelectStateContext);
  assert(ctx, new Error("Missing <SelectStateProvider>"));
  return ctx;
}
