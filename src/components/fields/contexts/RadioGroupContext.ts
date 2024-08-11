import type { createStore } from "solid-js/store";

import { createContext, useContext } from "solid-js";

export interface RadioGroupStoreObject {
  isSelected: (value: string) => boolean;
  radioGroupRootId: string;
  setValue: (value: string) => void;
  value: string;
};
type RadioGroupStore = ReturnType<typeof createStore<RadioGroupStoreObject>>;

export const RadioGroupContext = createContext<RadioGroupStore>();

export function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}
