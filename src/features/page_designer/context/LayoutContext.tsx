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

export type MainPanelRows = [Id[], Id[]];

export const MAIN_PANEL_ROW_COUNT = 2;

export function getAllMainPanels(rows: MainPanelRows): Id[] {
  return [...rows[0], ...rows[1]];
}

export function getMainPanelRow(
  rows: MainPanelRows,
  panelId: Id,
): 0 | 1 | undefined {
  if (rows[0].includes(panelId)) {
    return 0;
  }
  if (rows[1].includes(panelId)) {
    return 1;
  }
}

export function cloneMainPanelRows(rows: MainPanelRows): MainPanelRows {
  return [[...rows[0]], [...rows[1]]];
}

const MIN_MAIN_PANEL_ROW_HEIGHT = 120;

export { MIN_MAIN_PANEL_ROW_HEIGHT };

/** Where the latest layout-tree highlight came from — controls auto-scroll in the layers panel. */
export type LayoutTreeScrollSource = "preview" | "layoutTree";

export const INITIAL_WIDTHS = {
  bottom: 300,
  components: 250,
  pages: 250,
  functions: 250,
  ai: 305,
  layoutTree: 280,
  properties: 305,
  settings: 220,
} as const;

export function getInitialLayoutSettings() {
  return {
    isComponentsOpen: true,
    isPagesOpen: true,
    isFunctionsOpen: false,
    isAiOpen: false,
    isLayoutTreeOpen: true,
    isPropertiesOpen: true,
    isSettingsOpen: true,
    componentsWidth: INITIAL_WIDTHS.components,
    pagesWidth: INITIAL_WIDTHS.pages,
    functionsWidth: INITIAL_WIDTHS.functions,
    aiWidth: INITIAL_WIDTHS.ai,
    settingsWidth: INITIAL_WIDTHS.settings,
  };
}

export function getInitialDesignerLayoutStore() {
  const row0Panel = uuidv7();
  const row1Panel = uuidv7();
  return {
    [`mainPanel${row0Panel}Tab` as `mainPanel${string}Tab`]: null as Id | null,
    [`mainPanel${row0Panel}Width` as `mainPanel${string}Width`]: "1fr",
    [`mainPanel${row1Panel}Tab` as `mainPanel${string}Tab`]: null as Id | null,
    [`mainPanel${row1Panel}Width` as `mainPanel${string}Width`]: "1fr",
    activeItem: null as Id | null | number,
    bottomHeight: INITIAL_WIDTHS.bottom,
    copiedItem: null as Vertex | null,
    draggedTab: null as Id | null,
    focusedFormId: null as Id | null,
    id: uuidv7(),
    ...getInitialLayoutSettings(),
    isSmallScreen: false,
    mainFormId: null as Id | null,
    mainPanelRows: [[row0Panel], [row1Panel]] as MainPanelRows,
    mainPanelRow0Height: null as number | null,
    mainPanelRow0Width: null as number | null,
    mainPanelRow1Width: null as number | null,
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
    selectedComponentCategoryId: null as Id | null,
    layoutTreeScrollSource: null as LayoutTreeScrollSource | null,
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
