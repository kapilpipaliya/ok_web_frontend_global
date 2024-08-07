import { createContext, useContext } from "solid-js";

import assert from "../../utils/assert";

interface PopoverContextData {
  anchor?: HTMLElement | null;
  buttonID: string;
  hovering: boolean;
  ownerID: string;
  panelID: string;
}

export const PopoverContext = createContext<PopoverContextData>();

export function usePopoverContext(componentName: string): PopoverContextData {
  const context = useContext(PopoverContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <Popover>`),
  );
  return context;
}
