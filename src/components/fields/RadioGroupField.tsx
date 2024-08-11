import {  createUniqueId, type JSX } from "solid-js";
import { createStore } from "solid-js/store";

import { RadioGroupContext } from "./contexts/RadioGroupContext";

export function RadioGroupField(
  props: Readonly<{ children: JSX.Element, setValue: (value: string) => void, value: string }>
): JSX.Element {
  const radioGroupStore = createStore({
    isSelected: (value: string) => value === props.value,
    radioGroupRootId: createUniqueId(),
    get setValue() { return props.setValue },
    get value() { return props.value }
  });
  return <RadioGroupContext.Provider value={radioGroupStore}>
    {props.children}
  </RadioGroupContext.Provider>
}
