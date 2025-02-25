import type { createStore } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import type { TransactionValue } from "~/lib/graph/transaction/TransactionType";

export type Id = string;

export const IdAttr = "key";

export interface Edge {
  E: Id;
  id: Id;
  P: { [key: string]: any };
  S: Id;
  T: string;
}

export type EdgeMap = { [key: string]: Edge };

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

// implement changes feed like: https://pouchdb.com/guides/changes.html
// '_local/' prefix will not be synced, will not hae revision history, but need to provide the current _rev when you update local docs, just like with regular docs.

// this is the In-Memory Graph Store, entire application will be based on this to work offline.

// Saving a store to local storage serializes it -> accesses every property -> subscribes to the whole store
// https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage

export interface TransactionDetail {
  activeUndoIndex: number;
  namedUndoStepIndexes: { [key: string]: number };
  preventUndoBeforeIndex: number;
  revertSteps: TransactionValue[];
  steps: TransactionValue[];
  submittedIndex: number;
  undoStepIndexes: number[];
}

export interface Vertex<P extends object = { [key: string]: any }> {
  id: Id;
  IN: { [key: string]: Id[] };
  L: string[];
  OUT: { [key: string]: Id[] };
  P: P;
}

export type VertexMap = { [key: string]: Vertex };

type AnyObject = { [key: string]: any };

export const GraphContext =
  createContext<ReturnType<typeof createStore<GraphInterface>>>();

export function useGraph() {
  const graphStore = useContext(GraphContext)!;
  if (!graphStore) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return graphStore;
}
