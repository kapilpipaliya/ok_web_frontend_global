import type { createStore } from "solid-js/store";
import { createContext, useContext } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { Id, Vertex } from "~/lib/graph/graph";
import type { FormStoreObject } from "../../form/context/FormContext";
import type { IDToRuleMap } from "../functions/generateFormMetaAttributes";

export interface OpenFormInfo {
  formId: Id, label: string, dataId: Id, mainPannel: Id
}

export function getInitialDesignerLayoutStore() {
  return {
    id: uuidv7(),
    mainPannel: [0],
    leftWidth: 300,
    rightWidth1: 400,
    rightWidth2: 300,
    bottomHeight: 300,
    openedFormIds: [] as Id[],
    draggedVertexIds: [] as Id[],
    activeItem: null as Id | null | number,
    position: null as "after" | "before" | "center" | "left" | "right" | null,
    formId: null as Id | null,
    isLeftOpen: true,
    isRightOpen: true,
    isSmallScreen: false,
    selectedSection: "build",
    selectedTab: "settings",

  };
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;

export const DesignerLayoutStoreContext = createContext<Id>();
export const DesignerFormIdContext = createContext<Id>();

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}

export function useDesignerFormIdContext() {
  return useContext(DesignerFormIdContext);
}