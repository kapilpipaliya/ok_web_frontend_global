import {createContext, useContext} from "solid-js";
import type { createStore } from "solid-js/store";
import type { IFormContext } from "~/lib/contexts";
import type { Id, Vertex } from "~/lib/graph/graph";

export function getInitialDesignerLayoutStore() {
  return ({
    view: "Tablet",
    selectedSection: "build",
    isSmallScreen: false,
    isLeftOpen: true,
    isRightOpen: true,
    formData: {} as IFormContext,
    prevTxnIds: [] as Array<Id | number>,
    hoverId: -1 as Id | number,
    selectedId: -1 as Id | number,
    selectedComponent: -1 as Id | number,
    dragOverTargetId: -1 as Id | number,
    showPropertiesDrawer: false, // properties drawer
    hiddenNodes: [] as Array<Id | number>,
    draggedVertices: [] as Array<Vertex>,
    activeItem: null as Id | number | null,
    position: null as "before" | "after" | "center" | "left" | "right" | null,
    // this propes may required on preview too
    labelPosition: "top", // Default position
    labelColor: "black", // Default label color
    inputBackground: "white",
    activeStepId: 0 as Id | number,
  });
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;
type PageLayoutStore = ReturnType<typeof createStore<PageLayoutObject>>
export const DesignerLayoutStoreContext = createContext<PageLayoutStore>();

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}