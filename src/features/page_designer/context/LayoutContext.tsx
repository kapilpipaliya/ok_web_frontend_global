import { createContext, useContext } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { Id } from "~/lib/graph/type/id";
import type { Vertex } from "~/lib/graph/type/vertex";

export interface OpenFormInfo {
  dataId: Id;
  formDataId?: Id;
  formId: Id;
  label: string;
  mainPanel: Id;
  parentId?: Id;
  txnId: Id;
}

export type PageLayoutObject = ReturnType<typeof getInitialDesignerLayoutStore>;

export const INITIAL_WIDTHS = {
  bottom: 300,
  components: 190,
  ai: 305,
  properties: 305,
  settings: 310,
} as const;

export function getInitialLayoutSettings() {
  return {
    isComponentsOpen: true,
    isAiOpen: false,
    isPropertiesOpen: true,
    isSettingsOpen: true,
    componentsWidth: INITIAL_WIDTHS.components,
    aiWidth: INITIAL_WIDTHS.ai,
    propertiesWidth: INITIAL_WIDTHS.properties,
    settingsWidth: INITIAL_WIDTHS.settings,
    isPropertiesCollapsed: false,
    propertiesExpandedWidth: INITIAL_WIDTHS.properties,
  };
}

export function getInitialDesignerLayoutStore() {
  const mainPanel = uuidv7();
  return {
    [`mainPanel${mainPanel}Tab` as `mainPanel${string}Tab`]: null as Id | null,
    [`mainPanel${mainPanel}Width` as `mainPanel${string}Width`]: "1fr",
    activeItem: null as Id | null | number,
    bottomHeight: INITIAL_WIDTHS.bottom,
    copiedItem: null as Vertex | null,
    draggedTab: null as Id | null,
    formId: null as Id | null,
    id: uuidv7(),
    ...getInitialLayoutSettings(),
    isSmallScreen: false,
    mainFormId: null as Id | null,
    mainPanel: [mainPanel],
    openedFormIds: [] as Id[],
    dragPosition: null as
      | "after"
      | "before"
      | "center"
      | "left"
      | "right"
      | null,
    previewHoverId: -1 as Id | number,
    highlightedCompKey: null as string | null,
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
