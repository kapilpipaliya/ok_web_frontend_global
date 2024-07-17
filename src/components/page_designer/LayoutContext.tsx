import type { createStore } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import type { IFormContext } from "~/lib/contexts";
import type { Id, Vertex } from "~/lib/graph/graph";

import type { IDToRuleMap } from "./functions/getChildrenAttrs";

export function getInitialDesignerLayoutStore() {
  return {
    activeItem: null as Id | null | number,
    dragOverTargetId: -1 as Id | number,
    draggedVertices: [] as Array<Vertex>,
    formData: {} as IFormContext,
    hiddenNodes: [] as Array<Id | number>,
    hoverId: -1 as Id | number,
    inputBackground: "white",
    isLeftOpen: true,
    isRightOpen: true,
    isSmallScreen: false,
    labelColor: "black", // Default label color
    multiHighlight: [] as Array<Id | number>,
    // this propes may required on preview too
    position: null as "after" | "before" | "center" | "left" | "right" | null,
    prevTxnIds: [] as Array<Id | number>,
    selectedComponent: -1 as Id | number,
    selectedId: -1 as Id | number,
    selectedSection: "build",
    showPropertiesDrawer: false,
    usedAttrs: {} as IDToRuleMap,
    view: "Tablet",
  };
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;
type PageLayoutStore = ReturnType<typeof createStore<PageLayoutObject>>;
export const DesignerLayoutStoreContext = createContext<PageLayoutStore>();

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}
