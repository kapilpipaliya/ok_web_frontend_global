import type { createStore } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import type { EdgeMap, Id, VertexMap } from "~/lib/graph/graph";

export const GraphContext =
  createContext<ReturnType<typeof createStore<GraphInterface>>>();

export interface GlobalProperties {
  activeClickOutside: string[];
  initialDataFetchError: string;
  isDevelopment: boolean;
  isSideBarOpen?: boolean;
  isSubSideBarOpen?: boolean;
  newVertexId_: number;
  txnId_: number;
  url: string;
  userRoles: Id[];
  userSettingId: Id;
  tooltipRegistry?: { [key: string]: string[] }; // which tooltips belong to which group
  activeTooltips?: { [key: string]: boolean };
  // isAuthenticated: false,
  // theme: "light" as "light" | "dark",
  // notifications: [] as Array<{ id: number; message: string; type: "info" | "warning" | "error" }>,
  // language: "en" as string,
}

export interface GraphInterface {
  broadcastChannels: string[];
  edges: EdgeMap;
  vertexes: VertexMap;
  vertexLabelIdMap: { [key: string]: Id[] };
}

export function useGraph() {
  const graphStore = useContext(GraphContext)!;
  if (!graphStore) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return graphStore;
}
