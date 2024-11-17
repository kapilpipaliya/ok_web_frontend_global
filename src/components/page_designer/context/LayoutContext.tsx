import type { createStore } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import type { Id, Vertex } from "~/lib/graph/graph";

import type { FormStoreObject } from "../../form/FormContext";
import type { IDToRuleMap } from "../functions/generateFormMetaAttributes";

export function getInitialDesignerLayoutStore() {
  return {
    activeItem: null as Id | null | number,
    draggedVertices: [] as Vertex[],
    formStore: [] as unknown as ReturnType<typeof createStore<FormStoreObject>>,
    hiddenNodes: [] as Array<Id | number>,
    hoverId: -1 as Id | number,
    isLeftOpen: true,
    isRightOpen: true,
    isSmallScreen: false,
    multiHighlight: [] as Array<Id | number>,
    // this propes may required on preview too
    position: null as "after" | "before" | "center" | "left" | "right" | null,
    prevTxnIds: [] as Array<Id | number>,
    selectedComponent: -1 as Id | number,
    selectedId: -1 as Id | number,
    selectedSection: "build",
    shouldContainAtLeastOneForm: false,
    showPropertiesDrawer: false,
    usedAttrsInNameKeys: [] as Array<Id | number>,
    usedAttrsInRules: {} as IDToRuleMap,
    usedAttrsInUniqueConstraints: [] as Array<Id | number>,
    view: "Tablet",
    selectedTab: "settings",
  };
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;
type PageLayoutStore = ReturnType<typeof createStore<PageLayoutObject>>;
export const DesignerLayoutStoreContext = createContext<PageLayoutStore>();

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}
