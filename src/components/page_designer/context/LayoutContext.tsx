import type { createStore } from "solid-js/store";
import { createContext, useContext } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { Id, Vertex } from "~/lib/graph/graph";
import type { FormStoreObject } from "../../form/context/FormContext";
import type { IDToRuleMap } from "../functions/generateFormMetaAttributes";

export function getInitialDesignerLayoutStore() {
  return {
    id: uuidv7(),
    openedFormIds: [] as {formId: Id, label: string, dataId: Id}[],
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

export function useDesignerLayoutStore() {
  return useContext(DesignerLayoutStoreContext)!;
}
