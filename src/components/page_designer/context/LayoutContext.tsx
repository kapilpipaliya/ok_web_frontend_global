import type { createStore } from "solid-js/store";
import { createContext, useContext } from "solid-js";
import { v4 as uuidv4 } from "uuid";

import type { Id, Vertex } from "~/lib/graph/graph";
import type { FormStoreObject } from "../../form/context/FormContext";
import type { IDToRuleMap } from "../functions/generateFormMetaAttributes";

export function getInitialDesignerLayoutStore() {
  return {
    id: uuidv4(),
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
