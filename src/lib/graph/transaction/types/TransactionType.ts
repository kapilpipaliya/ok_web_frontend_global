import type { Edge, Id, Vertex } from "../../graph";

export type InsertFn = {
  [key in InsertFnKey]?: string;
};

export type InsertFnKey =
  | "deleteEdge"
  | "deleteVertex"
  | "insert"
  | "insertEdge"
  | "merge"
  | "replace"
  | "replaceEdge";

export type TransactionValue = InsertFn & {
  data: Edge | Vertex;
  id: Id;
  originalData: Edge | Vertex;
};
