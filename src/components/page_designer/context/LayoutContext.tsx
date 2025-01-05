import type { createStore } from "solid-js/store";
import { createContext, useContext } from "solid-js";
import { v4 as uuidv4 } from "uuid";

import type { Id, Vertex } from "~/lib/graph/graph";
import type { FormStoreObject } from "../../form/FormContext";
import type { IDToRuleMap } from "../functions/generateFormMetaAttributes";

export function getInitialDesignerLayoutStore() {
  return {
    id: uuidv4(),
    activeItem: null as Id | null | number,
    draggedVertexIds: [] as Id[],
    formId: null as Id | null,
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
    selectedTab: "settings",
    shouldContainAtLeastOneForm: false,
    usedAttrsInNameKeys: [] as Array<Id | number>,
    usedAttrsInRules: {} as IDToRuleMap,
    usedAttrsInUniqueConstraints: [] as Array<Id | number>,
    view: "Desktop",
  };
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;

export const DesignerLayoutStoreContext = createContext<Id>();

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}
