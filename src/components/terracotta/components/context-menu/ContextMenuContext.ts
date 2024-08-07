import { createContext, useContext } from "solid-js";

import assert from "../../utils/assert";

interface ContextMenuContextData {
  anchor?: HTMLElement | null;
  boundaryID: string;
  ownerID: string;
  panelID: string;
}

export const ContextMenuContext = createContext<ContextMenuContextData>();

export function useContextMenuContext(
  componentName: string,
): ContextMenuContextData {
  const context = useContext(ContextMenuContext);
  assert(
    context,
    new Error(`<${componentName}> must be used inside a <ContextMenu>`),
  );
  return context;
}
