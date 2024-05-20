import { createContext } from "solid-js";
import { createStore, reconcile, SetStoreFunction } from "solid-js/store";

export type Id = number;

export const IdAttr = "name";

export interface Vertex {
  id: Id;
  L: string[];
  P: {
    [key: string]: any;
  };
  IN: { [key: string]: Id[] };
  OUT: { [key: string]: Id[] };
}

export interface Edge {
  id: Id;
  P: { [key: string]: any };
  T: string;
  S: Id;
  E: Id;
}

export type VertexMap = { [key: string]: Vertex };
export type EdgeMap = { [key: string]: Edge };
// implement changes feed like: https://pouchdb.com/guides/changes.html
// '_local/' prefix will not be synced, will not hae revision history, but need to provide the current _rev when you update local docs, just like with regular docs.
// this is the In-Memory Graph Store, entire application will be based on this to work offline.
// Saving a store to local storage serializes it -> accesses every property -> subscribes to the whole store
// https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage
export interface GraphInterface {
  vertexes: VertexMap;
  edges: EdgeMap;
  vertexLabelIdMap: { [key: string]: Id[] };
  member?: { [key: string]: any } | null;
  txnId: number;
}

export const GraphContext = createContext<
  ReturnType<typeof createStore<GraphInterface>>
>([] as any);
