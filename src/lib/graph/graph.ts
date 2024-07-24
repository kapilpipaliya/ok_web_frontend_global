import type { createStore } from "solid-js/store";

import { createContext, useContext } from "solid-js";

import type {
  TransactionValue,
} from "~/lib/graph/transaction/TransactionType";

export type Id = string;

export const IdAttr = "name";

export interface Vertex {
  IN: { [key: string]: Id[] };
  L: string[];
  OUT: { [key: string]: Id[] };
  P: {
    [key: string]: any;
  };
  id: Id;
}

export interface Edge {
  E: Id;
  P: { [key: string]: any };
  S: Id;
  T: string;
  id: Id;
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
  preventUndoBeforeIndex: number;
  revertSteps: TransactionValue[];
  steps: TransactionValue[];
  submittedIndex: number;
  undoStepIndexes: number[];
}

export interface GraphInterface {
  activeClickOutside: number;
  componentIdMap: { [key: string]: string };
  edges: EdgeMap;
  isSideBarOpen?: boolean;
  isSubSideBarOpen?: boolean;
  member?: AnyObject | null;
  navBarHeight: number;
  navigationData?: AnyObject[];
  newTxnId: number;
  newVertexId: Id;
  transactions: Map<number, TransactionDetail>;
  vertexLabelIdMap: { [key: string]: Id[] };
  vertexes: VertexMap;
}


export const GraphContext = createContext<
  ReturnType<typeof createStore<GraphInterface>>
>([] as any);

export function useGraph() {
  const [graph, setGraph] = useContext(GraphContext)!;
  if (!graph || !setGraph) {
    throw new Error("useGraph must be used within a GraphProvider");
  }
  return [graph, setGraph] as const;
}
