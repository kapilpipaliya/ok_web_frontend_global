
import { createContext, useContext } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { Id, } from "~/lib/graph/graph";

export interface OpenFormInfo {
  dataId: Id, formDataId?: Id, formId: Id, label: string, mainPanel: Id, parentId?: Id, txnId: Id
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;

export function getInitialDesignerLayoutStore() {
  const mainPanel = uuidv7();
  return {
    [`mainPanel${mainPanel}Tab` as `mainPanel${string}Tab`]: null as Id | null,
    [`mainPanel${mainPanel}Width` as `mainPanel${string}Width`]: '1fr',
    activeItem: null as Id | null | number,
    bottomHeight: 300,
    draggedTab: null as Id | null,
    draggedVertexIds: [] as Id[],
    formId: null as Id | null,
    id: uuidv7(),
    isLeftOpen: true,
    isRight0Open: true,
    isRight1Open: true,
    isRight2Open: true,
    isSmallScreen: false,
    leftWidth: 190,
    mainFormId: null as Id | null,
    mainPanel: [mainPanel],
    openedFormIds: [] as Id[],
    position: null as "after" | "before" | "center" | "left" | "right" | null,
    rightWidth0: 305,
    rightWidth1: 305,
    rightWidth2: 300,
    selectedSection: "build",
    selectedTab: "settings",

  };
}

export const DesignerLayoutStoreContext = createContext<Id>();
export const DesignerFormIdContext = createContext<Id>();

export function useDesignerFormIdContext() {
  return useContext(DesignerFormIdContext);
}

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}