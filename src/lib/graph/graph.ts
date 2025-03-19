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

// implement changes feed like: https://pouchdb.com/guides/changes.html
// '_local/' prefix will not be synced, will not hae revision history, but need to provide the current _rev when you update local docs, just like with regular docs.

// this is the In-Memory Graph Store, entire application will be based on this to work offline.

// Saving a store to local storage serializes it -> accesses every property -> subscribes to the whole store
// https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage

export interface Vertex<P extends object = { [key: string]: any }> {
  id: Id;
  IN: { [key: string]: Id[] };
  L: string[];
  OUT: { [key: string]: Id[] };
  P: P;
}

export type VertexMap = { [Id: string]: Vertex };
