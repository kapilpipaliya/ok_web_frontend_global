import type { Edge, Id, Vertex } from "../../graph";

export type InsertFn = {
  [key in
    | "deleteEdge"
    | "deleteVertex"
    | "insert"
    | "insertEdge"
    | "merge"
    | "replace"
    | "replaceEdge"
    // we dont have mergeEdge function
    | "replaceEdgeEnd"
    | "replaceEdgeStart"]?: string;
};

export type TransactionValue = InsertFn & {
  data: Edge | Vertex;
  id: Id;
  originalData: Edge | Vertex;
};
