import type { createStore } from "solid-js/store";

import { createContext } from "solid-js";

import type {ProcessStatus, TransactionValue} from "~/lib/graph/transaction";

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
export interface GraphInterface {
  componentIdMap: { [key: string]: string };
  edges: EdgeMap;
  isSideBarOpen?: boolean;
  isSubSideBarOpen?: boolean;
  member?: { [key: string]: any } | null;
  navigationData?: { [key: string]: any }[];
  transactions: Map<
    number,
    {
      revertSteps: TransactionValue[];
      status: ProcessStatus;
      steps: TransactionValue[];
      submittedStep: number;
      undoPoints: number[];
      undoStep: number;
    }
  >
  txnId: number;
  vertexLabelIdMap: { [key: string]: Id[] };
  vertexes: VertexMap;
}

export const GraphContext = createContext<
  ReturnType<typeof createStore<GraphInterface>>
>([] as any);
