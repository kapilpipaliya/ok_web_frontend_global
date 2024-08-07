import { createContext, useContext } from "solid-js";

import assert from "../../utils/assert";

interface ListboxContextData {
  anchor?: HTMLElement | null;
  buttonHovering: boolean;
  buttonID: string;
  horizontal?: boolean;
  labelID: string;
  multiple?: boolean;
  optionsHovering: boolean;
  optionsID: string;
  ownerID: string;
}

export const ListboxContext = createContext<ListboxContextData>();

export function useListboxContext(componentName: string): ListboxContextData {
  const context = useContext(ListboxContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <Listbox>`),
  );
  return context;
}
