import type { createStore } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import type { TransactionValue } from "~/lib/graph/transaction/TransactionType";

export type Id = string;

export const IdAttr = "key";

export interface Vertex {
  id: Id;
  IN: { [key: string]: Id[] };
  L: string[];
  OUT: { [key: string]: Id[] };
  P: {
    [key: string]: any;
  };
}

export interface Edge {
  E: Id;
  id: Id;
  P: { [key: string]: any };
  S: Id;
  T: string;
}

export type VertexMap = { [key: string]: Vertex };
export type EdgeMap = { [key: string]: Edge };

// implement changes feed like: https://pouchdb.com/guides/changes.html
// '_local/' prefix will not be synced, will not hae revision history, but need to provide the current _rev when you update local docs, just like with regular docs.

// this is the In-Memory Graph Store, entire application will be based on this to work offline.

// Saving a store to local storage serializes it -> accesses every property -> subscribes to the whole store
// https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage

type AnyObject = { [key: string]: any };

export interface TransactionDetail {
  activeUndoIndex: number;
  namedUndoStepIndexes: { [key: string]: number };
  preventUndoBeforeIndex: number;
  revertSteps: TransactionValue[];
  steps: TransactionValue[];
  submittedIndex: number;
  undoStepIndexes: number[];
}

export interface GraphInterface {
  activeClickOutside: string[];
  APP_BASE_URL: string;
  componentIdMap: { [key: string]: string };
  edges: EdgeMap;
  events: { [key: string]: any };
  globalTheme: Vertex;
  isDevelopment: boolean;
  isLoadingPage?: boolean;
  isSideBarOpen?: boolean;
  isSubSideBarOpen?: boolean;
  member?: Vertex;
  navBarHeight: number;
  navigationData?: AnyObject[];
  newTxnId: number;
  newVertexId: Id;
  saveUserSetting: (properties: { [key: string]: any }) => void;
  transactions: Map<number, TransactionDetail>;
  userRoles: Id[];
  userSetting: Vertex;
  userSettingId: Id;
  vertexes: VertexMap;
  vertexLabelIdMap: { [key: string]: Id[] };

  // isAuthenticated: false,
  // theme: "light" as "light" | "dark",
  // notifications: [] as Array<{ id: number; message: string; type: "info" | "warning" | "error" }>,
  // language: "en" as string,
}

export const GraphContext =
  createContext<ReturnType<typeof createStore<GraphInterface>>>();

export function useGraph() {
  const graphStore = useContext(GraphContext)!;
  if (!graphStore) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return graphStore;
}
